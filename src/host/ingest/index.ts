import type { MemoryService } from '../api.js'
import type { Activation, MemoryConfig } from '../model.js'
import { projectSlug } from '../paths.js'
import type { HostContext } from '../types.js'
import { conclusionOf, extractFromTurn, type Candidate } from './extract.js'
import { gateCandidate } from './gate.js'
import { decide, type Decision } from './decide.js'
import { extractWithLlm } from './llm-extract.js'
import { PendingStore } from './pending.js'
import { IngestQueue } from './queue.js'

/** 同项目的长记忆抽取冷却（episode 不受限） */
const COOLDOWN_MINUTES = 30
const NO_PROJECT = '_global'

export interface TurnInput {
  sid: string
  turn: number
  cwd?: string
  /** 本会话最近一次 model/selection；LLM 兜底抽取用它，避免落到无凭据的默认模型 */
  model?: { provider: string; model: string }
  userMessages: string[]
  assistantMessages: unknown[]
  now?: Date
}

export interface IngestResult {
  episodeId: string | null
  added: number
  updated: number
  invalidated: number
  pending: number
  noop: number
  rejected: number
  skipped?: string
}

export interface ApplyOutcome {
  outcome: 'added' | 'updated' | 'invalidated' | 'noop' | 'pending' | 'rejected'
  decision?: Decision
  entryId?: string
  reason?: string
}

/**
 * 自动写入管线。
 *
 * 读写权限分离是刻意的：**对话热路径只允许追加 episode 与提交候选**，
 * 合并/重写/归档只发生在 curator（M5）。这样即使会话被注入，
 * 攻击者也只能塞进 episode 层，改不动长期记忆的结构。
 */
export class Ingestor {
  readonly queue: IngestQueue
  readonly pending: PendingStore

  /** 会话导入与 compaction 摘要需要直接写 episode */
  get episodes() {
    return this.api.episodes
  }

  constructor(
    private readonly api: MemoryService,
    private readonly config: MemoryConfig,
    private readonly ctx?: HostContext,
  ) {
    this.queue = new IngestQueue(api.root, config)
    this.pending = new PendingStore(config.ingest.suggestTimeoutSec)
  }

  async ingestTurn(input: TurnInput): Promise<IngestResult> {
    const now = input.now ?? new Date()
    const project = input.cwd ? projectSlug(input.cwd) : undefined
    const slug = project ?? NO_PROJECT
    const firstUser = input.userMessages[0] ?? ''
    const lastAssistant = input.assistantMessages[input.assistantMessages.length - 1]
    const outcome = lastAssistant ? conclusionOf(lastAssistant) : ''

    const result: IngestResult = { episodeId: null, added: 0, updated: 0, invalidated: 0, pending: 0, noop: 0, rejected: 0 }

    // 1) 每轮都留一条 episode（便宜，且是 compaction 抢救的落点）
    try {
      const episode = await this.api.episodes.append(slug, {
        sid: input.sid,
        turn: input.turn,
        topic: firstUser || '(untitled)',
        user: firstUser,
        outcome,
        src: 'user',
        ts: now.toISOString(),
      })
      result.episodeId = episode.id
    } catch (cause) {
      this.ctx?.logger?.warn?.(`[general-memory] episode append failed: ${(cause as Error).message}`)
    }

    // 2) 冷却窗口内不再跑长记忆抽取
    const gate = await this.queue.canRun(slug, COOLDOWN_MINUTES, now.getTime())
    if (!gate.ok) return { ...result, skipped: gate.reason }

    // 3) 抽取：规则优先，一个都没抽到才考虑 LLM
    let candidates = extractFromTurn({ userMessages: input.userMessages, now })
    if (candidates.length === 0 && this.config.ingest.llmExtract && this.ctx) {
      candidates = await extractWithLlm(
        this.ctx,
        input.userMessages.join('\n\n'),
        () => this.queue.consumeLlm(now.getTime()),
        input.model,
      )
    }
    if (candidates.length === 0) {
      await this.queue.noteRun(slug, now.getTime())
      return { ...result, skipped: 'no-candidate' }
    }

    // 4) 逐个候选：门控 → 决策 → 写入或待确认
    for (const candidate of candidates) {
      const applied = await this.applyCandidate(candidate, project, { mode: 'live', now })
      if (applied.outcome === 'added') result.added++
      else if (applied.outcome === 'updated') result.updated++
      else if (applied.outcome === 'invalidated') result.invalidated++
      else if (applied.outcome === 'pending') result.pending++
      else if (applied.outcome === 'noop') result.noop++
      else result.rejected++
    }

    await this.queue.noteRun(slug, now.getTime())
    return result
  }

  /**
   * 单个候选落盘。**实时写入与导入共用这一条路径** —— 两套逻辑迟早会分叉出两种记忆质量。
   * 导入时 `approved: true` 跳过 suggest/manual 确认（用户在 dry-run 里已经逐条勾选过）。
   */
  async applyCandidate(
    candidate: Candidate,
    project: string | undefined,
    opts: { mode: 'live' | 'import'; approved?: boolean; now?: Date } = { mode: 'live' },
  ): Promise<ApplyOutcome> {
    const now = opts.now ?? new Date()
    // 导入是用户明确授权的批量操作，不受"每小时写入突增"熔断影响（那是防投毒的）
    const writesLastHour = opts.mode === 'import' ? 0 : await this.queue.writesLastHour(now.getTime())
    const verdict = gateCandidate(candidate, this.config, { writesLastHour })

    if (!verdict.allow) {
      await this.api.writeAudit('deny', { kind: candidate.kind, title: candidate.title, reason: verdict.reason })
      return { outcome: 'rejected', reason: verdict.reason }
    }
    if (!verdict.longTermAllowed) {
      await this.api.writeAudit('deny', { kind: candidate.kind, title: candidate.title, reason: 'untrusted-source-episode-only' })
      return { outcome: 'rejected', reason: 'untrusted-source-episode-only' }
    }

    const scoped = withScope(candidate, project)
    const similar = this.api.search(`${scoped.title} ${scoped.summary}`, { kind: scoped.kind, limit: 5, scope: 'all' })
    const decision = decide(scoped, similar)

    if (decision.kind === 'NOOP') {
      await this.api.writeAudit('write', { kind: scoped.kind, decision: 'NOOP', reason: decision.reason, target: decision.targetId ?? null })
      return { outcome: 'noop', decision, reason: decision.reason }
    }

    const requiresApproval =
      !opts.approved &&
      (this.config.ingest.writeMode === 'manual' ||
        (this.config.ingest.writeMode === 'suggest' && !this.config.ingest.autoKinds.includes(scoped.kind)))

    if (requiresApproval) {
      if (this.config.ingest.writeMode === 'manual') {
        await this.api.writeAudit('deny', { kind: scoped.kind, title: scoped.title, reason: 'manual-mode' })
        return { outcome: 'rejected', decision, reason: 'manual-mode' }
      }
      const item = this.pending.add({ ...scoped, pii: verdict.pii, shareable: verdict.shareable } as Candidate, decision, project, now.getTime())
      await this.api.writeAudit('write', { kind: scoped.kind, decision: 'PENDING', pendingId: item.id, reason: decision.reason })
      return { outcome: 'pending', decision, reason: item.id }
    }

    const outcome = await this.execute(decision, scoped, project, verdict.pii)
    return { outcome, decision, ...(decision.targetId ? { entryId: decision.targetId } : {}) }
  }

  /** 用户批准/拒绝一条待确认写入 */
  async resolvePending(id: string, action: 'accept' | 'reject', edited?: Partial<Candidate>): Promise<{ ok: boolean; reason?: string }> {
    const item = this.pending.take(id)
    if (!item) return { ok: false, reason: 'expired-or-unknown' }
    if (action === 'reject') {
      await this.api.writeAudit('write', { kind: item.candidate.kind, decision: 'NOOP', reason: 'user-rejected', pendingId: id })
      return { ok: true }
    }
    const candidate: Candidate = { ...item.candidate, ...(edited ?? {}) }
    await this.execute(item.decision, withScope(candidate, item.project), item.project, false)
    await this.api.writeAudit('write', { kind: candidate.kind, decision: 'APPROVED', pendingId: id, rev: 1 })
    return { ok: true }
  }

  /** 超时未操作的提议一律静默 NOOP —— 绝不因为用户没点就偷偷写 */
  async sweepPending(now = Date.now()): Promise<number> {
    const expired = this.pending.sweep(now)
    for (const item of expired) {
      await this.api.writeAudit('write', { kind: item.candidate.kind, decision: 'NOOP', reason: 'suggest-timeout', pendingId: item.id })
    }
    return expired.length
  }

  private async execute(
    decision: Decision,
    candidate: Candidate,
    project: string | undefined,
    pii: boolean,
  ): Promise<'added' | 'updated' | 'invalidated' | 'noop'> {
    const scope = candidate.scope ?? 'global'
    const base = {
      kind: candidate.kind,
      title: candidate.title,
      summary: candidate.summary,
      body: candidate.body,
      scope,
      ...(scope === 'project' && project ? { project } : {}),
      tags: candidate.tags ?? [],
      entities: candidate.entities ?? [],
      activation: (candidate.activation ?? 'on_demand') as Activation,
      source: candidate.source,
      ...(candidate.importedFrom ? { importedFrom: candidate.importedFrom } : {}),
      createdBy: candidate.importedFrom ? 'import' : 'ingest',
    }

    if (decision.kind === 'ADD') {
      const entry = await this.api.create(base)
      if (pii) await this.markPii(entry.meta.id)
      await this.api.writeAudit('write', { id: entry.meta.id, kind: candidate.kind, decision: 'ADD', reason: decision.reason, src: candidate.source })
      await this.queue.noteWrite()
      return 'added'
    }

    if (decision.kind === 'UPDATE' && decision.targetId) {
      const entry = await this.api.mergeInto(decision.targetId, { title: candidate.title, summary: candidate.summary, body: candidate.body, reason: decision.reason })
      if (!entry) return 'noop'
      if (pii) await this.markPii(entry.meta.id)
      await this.queue.noteWrite()
      return 'updated'
    }

    if (decision.kind === 'INVALIDATE' && decision.targetId) {
      // 先写新条目拿到 id，再把旧条目标失效并指向它（bi-temporal：不删除）
      const entry = await this.api.create(base)
      if (pii) await this.markPii(entry.meta.id)
      await this.api.invalidate(decision.targetId, { reason: decision.reason, supersededBy: entry.meta.id })
      await this.queue.noteWrite()
      await this.queue.noteWrite()
      return 'invalidated'
    }

    return 'noop'
  }

  private async markPii(id: string): Promise<void> {
    await this.api.store.patchMeta(id, (meta) => ({
      ...meta,
      privacy: { ...meta.privacy, pii: true, shareable: 'none' },
    }))
  }
}

/** 作用域：项目事实/参考落在项目下；画像、偏好、纪律保持全局复用 */
function withScope(candidate: Candidate, project: string | undefined): Candidate {
  const projectish = candidate.kind === 'project' || candidate.kind === 'reference' || candidate.kind === 'procedure'
  return { ...candidate, scope: projectish && project ? 'project' : 'global' }
}
