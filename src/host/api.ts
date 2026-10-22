import { createHash, randomUUID } from 'node:crypto'
import { hostname } from 'node:os'
import path from 'node:path'
import { audit as writeAudit, type AuditAct } from './audit.js'
import { derivedFiles, writeDerived, renderIndex, INDEX_LIMITS } from './catalog.js'
import { readTextFile, resolveInRoot, writeFileAtomic } from './files.js'
import { computeHeat, isoNow, type Entry, type Frontmatter } from './model.js'
import { SnapshotCache, Throttle, renderCatalogLayer, renderSnapshot, type InjectMode, type SnapshotResult } from './recall.js'
import { buildCorpus, rank, type Corpus, type Ranked } from './search.js'
import { MemoryStore, type NewEntryInput, type ScanIssue } from './store.js'
import { EpisodeStore } from './episode.js'
import { FtsIndex } from './fts.js'
import type { MemoryConfig } from './model.js'
import { DIRS } from './paths.js'

export interface SearchHit extends Ranked {
  /** 门控判定：低于阈值的命中会被标记但不返回给模型 */
  gated: boolean
}

export interface Stats {
  root: string
  ready: boolean
  entryCount: number
  issues: ScanIssue[]
  byKind: Record<string, number>
  byScope: Record<string, number>
  bySource: Record<string, number>
  bytes: number
  index: { lines: number; bytes: number; maxLines: number; maxBytes: number; overBudget: boolean }
  recall: RecallStats
  alerts: Alert[]
}

export interface Alert {
  level: 'error' | 'warn' | 'info'
  code: string
  message: string
}

export interface RecallStats {
  inject: { events: number; hits: number; verbatim: number; zeroHit: number; chars: number; tokens: number; gated: number }
  tool: { events: number; hits: number; zeroHit: number }
  lastShare: number
  maxShare: number
}

const EMPTY_RECALL: RecallStats = {
  inject: { events: 0, hits: 0, verbatim: 0, zeroHit: 0, chars: 0, tokens: 0, gated: 0 },
  tool: { events: 0, hits: 0, zeroHit: 0 },
  lastShare: 0,
  maxShare: 0,
}

export class MemoryService {
  readonly store: MemoryStore
  readonly episodes: EpisodeStore
  private fts: FtsIndex | null = null
  private entries: Entry[] = []
  private issues: ScanIssue[] = []
  private corpus: Corpus = { docs: new Map(), df: new Map(), size: 0 }
  private loaded = false
  private recall: RecallStats = structuredClone(EMPTY_RECALL)
  readonly snapshots = new SnapshotCache()
  readonly throttles = new Map<string, Throttle>()
  private indexText = ''

  constructor(
    readonly root: string,
    private readonly config: MemoryConfig,
    readonly deviceId: string,
  ) {
    this.store = new MemoryStore(root)
    this.episodes = new EpisodeStore(root)
  }

  static async create(config: MemoryConfig, root: string): Promise<MemoryService> {
    const deviceId = await ensureDeviceId(root)
    const service = new MemoryService(root, config, deviceId)
    await service.store.init(deviceId)
    await service.refresh()
    return service
  }

  get ready(): boolean {
    return this.loaded
  }

  get indexBackend(): 'l0' | 'l1' {
    return this.fts ? 'l1' : 'l0'
  }

  /** 插件卸载时释放 sqlite 句柄 */
  dispose(): void {
    this.fts?.close()
    this.fts = null
  }

  /** 重新扫描条目并重建派生索引。写入后调用；启动时调用一次。 */
  async refresh(): Promise<void> {
    const { entries, issues } = await this.store.scan()
    this.entries = entries
    this.issues = issues
    this.corpus = buildCorpus(entries)
    this.indexText = renderIndex(entries)
    this.loaded = true
    // L1 索引是缓存：每次 refresh 增量同步，失败也不影响主流程
    if (this.config.retrieval.backend !== 'l0') {
      this.fts ??= FtsIndex.open(this.root)
      try {
        this.fts?.sync(entries)
      } catch {
        this.fts = null
      }
    }
    // 派生文件被外部改动（用户手改 / 其他工具写入）时也要跟上，所以每次都 rebuild
    await this.rebuildDerived()
    for (const listener of this.listeners) listener()
  }

  /** 常驻层注入需要在条目变化后重算，用订阅而不是给 refresh 打补丁 */
  onChange(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      const at = this.listeners.indexOf(listener)
      if (at >= 0) this.listeners.splice(at, 1)
    }
  }

  private listeners: Array<() => void> = []

  async rebuildDerived(): Promise<{ written: string[]; unchanged: string[] }> {
    const files = derivedFiles(this.entries, { alwaysChars: this.config.budget.alwaysChars })
    const result = await writeDerived(
      this.root,
      files,
      (abs, data) => writeFileAtomic(abs, data),
      (abs) => readTextFile(abs),
    )
    this.snapshots.clear()
    return result
  }

  list(): Entry[] {
    return this.entries
  }

  issuesList(): ScanIssue[] {
    return this.issues
  }

  async get(id: string): Promise<Entry | null> {
    return this.entries.find((e) => e.meta.id === id) ?? (await this.store.get(id))
  }

  async read(id: string, opts: { archive?: boolean } = {}): Promise<Entry | null> {
    const active = await this.get(id)
    if (active) return active
    if (opts.archive !== false) {
      const archived = await this.store.scanArchive()
      return archived.find((e) => e.meta.id === id) ?? null
    }
    return null
  }

  search(query: string, opts: { limit?: number; kind?: string; project?: string; scope?: 'active' | 'archive' | 'all' } = {}): SearchHit[] {
    const limit = opts.limit ?? this.config.retrieval.recallLimit
    const pool =
      opts.scope === 'archive' || opts.scope === 'all'
        ? this.entries.filter((e) => opts.kind === undefined || e.meta.kind === opts.kind)
        : this.entries.filter(
            (e) =>
              e.meta.temporal.invalidatedAt === null &&
              (opts.kind === undefined || e.meta.kind === opts.kind) &&
              (opts.project === undefined || e.meta.project === opts.project || e.meta.scope === 'global'),
          )
    // L1 粗筛：先用 FTS5 把候选压到几百条，再走完整排序。不可用时静默降级到 L0。
    let candidates = pool
    if (query.trim() && this.fts) {
      const ids = new Set(this.fts.candidates(query, 400))
      if (ids.size > 0) candidates = pool.filter((entry) => ids.has(entry.meta.id))
    }
    const ranked = rank(candidates, query, this.corpus)
    const threshold = this.config.retrieval.gateThreshold
    return ranked.slice(0, Math.max(limit, ranked.length)).map((r) => ({ ...r, gated: query.trim() !== '' && r.score < threshold }))
  }

  /** 目录层的紧凑视图，供 memory_recall 无 query 时使用 */
  catalog(project?: string): { text: string; shown: number; omitted: number } {
    return renderCatalogLayer(this.entries, this.config.budget.recallChars, project)
  }

  async create(input: NewEntryInput): Promise<Entry> {
    const meta = this.store.buildMeta(input)
    const rel = await this.store.put(meta, input.body)
    await this.writeAudit('write', { id: meta.id, kind: meta.kind, decision: 'ADD', src: meta.provenance.source, bytes: Buffer.byteLength(input.body, 'utf8'), rev: 1 })
    await this.refresh()
    return { meta: { ...meta, checksum: (await this.get(meta.id))?.meta.checksum ?? meta.checksum }, body: input.body, rel }
  }

  /**
   * 批量新增：**只刷新一次**。
   *
   * `create()` 每次都会全量 scan + 重建派生索引，N 条就是 O(N²)。Windows 上 40 条
   * 就能把测试跑到 5s 超时。批量导入/灌测试数据必须走这条路。
   */
  async createMany(inputs: NewEntryInput[]): Promise<Entry[]> {
    if (inputs.length === 0) return []
    const written: Array<{ meta: Frontmatter; body: string; rel: string }> = []
    for (const input of inputs) {
      const meta = this.store.buildMeta(input)
      const rel = await this.store.put(meta, input.body)
      await this.writeAudit('write', { id: meta.id, kind: meta.kind, decision: 'ADD', src: meta.provenance.source, bytes: Buffer.byteLength(input.body, 'utf8'), rev: 1 })
      written.push({ meta, body: input.body, rel })
    }
    await this.refresh()
    return written.map(({ meta, body, rel }) => ({
      meta: { ...meta, checksum: this.entries.find((entry) => entry.meta.id === meta.id)?.meta.checksum ?? meta.checksum },
      body,
      rel,
    }))
  }

  async update(id: string, body: string, expectedRev?: number): Promise<{ ok: true; entry: Entry } | { ok: false; reason: 'not-found' | 'stale'; currentRev?: number }> {
    const existing = await this.get(id)
    if (!existing) return { ok: false, reason: 'not-found' }
    if (expectedRev !== undefined && existing.meta.stats.revisions !== expectedRev) {
      return { ok: false, reason: 'stale', currentRev: existing.meta.stats.revisions }
    }
    const meta: Frontmatter = {
      ...existing.meta,
      stats: { ...existing.meta.stats, revisions: existing.meta.stats.revisions + 1 },
    }
    const rel = await this.store.put(meta, body)
    await this.writeAudit('update', { id, rev: meta.stats.revisions, bytes: Buffer.byteLength(body, 'utf8') })
    await this.refresh()
    return { ok: true, entry: { meta, body, rel } }
  }

  /**
   * 就地合并：同一事实的更完整版本。保留 id 与溯源（跨设备的锚点不能变），
   * 只把 title/summary/body 换成新的，revisions +1。
   */
  async mergeInto(id: string, input: { title?: string; summary?: string; body: string; reason?: string }): Promise<Entry | null> {
    const existing = await this.get(id)
    if (!existing) return null
    const meta: Frontmatter = {
      ...existing.meta,
      ...(input.title ? { title: input.title } : {}),
      ...(input.summary ? { summary: input.summary } : {}),
      stats: { ...existing.meta.stats, revisions: existing.meta.stats.revisions + 1 },
    }
    const rel = await this.store.put(meta, input.body)
    await this.writeAudit('update', { id, rev: meta.stats.revisions, reason: input.reason ?? 'merge', bytes: Buffer.byteLength(input.body, 'utf8') })
    await this.refresh()
    return { meta, body: input.body, rel }
  }

  async invalidate(id: string, opts: { reason?: string; supersededBy?: string | null } = {}): Promise<Entry | null> {
    const entry = await this.store.invalidate(id, opts)
    if (entry) {
      await this.writeAudit('invalidate', { id, reason: opts.reason ?? '', supersededBy: opts.supersededBy ?? null })
      await this.refresh()
    }
    return entry
  }

  async hardDelete(id: string, confirm: string): Promise<{ deleted: string[] } | { error: string }> {
    if (confirm !== id.slice(-4)) return { error: `confirm must be the last 4 characters of the id (${id.slice(-4)})` }
    const deleted = await this.store.hardDelete(id)
    // 硬删必须清干净派生物，否则 id 会残留在 INDEX/PROFILE/graph 里（GDPR）
    await this.refresh()
    await this.writeAudit('delete', { id, hard: true, purged: deleted })
    return { deleted }
  }

  /** 召回计数延迟刷盘：立刻写回条目会让下一次渲染的指纹变化，击穿前缀缓存（原则 P4） */
  noteRecall(ids: string[]): void {
    this.recall.tool.events++
    this.recall.tool.hits += ids.length
    if (ids.length === 0) this.recall.tool.zeroHit++
    this.pendingHits.push(...ids)
  }

  /**
   * 被相关度门控裁掉的候选数。**必须可观测**——「该记的没被想起来」是记忆系统最痛的
   * 失败模式，静默裁掉等于把 bug 藏起来。
   */
  noteGated(count: number): void {
    this.recall.inject.gated += count
  }

  private pendingHits: string[] = []

  async flushHits(): Promise<void> {
    if (this.pendingHits.length === 0) return
    const ids = this.pendingHits
    this.pendingHits = []
    const now = isoNow()
    for (const id of new Set(ids)) {
      await this.store.patchMeta(id, (meta) => ({
        ...meta,
        stats: {
          ...meta.stats,
          hits: meta.stats.hits + 1,
          lastUsedAt: now,
          heat: computeHeat({ hits: meta.stats.hits + 1, lastUsedAt: now }),
        },
      }))
    }
    await this.refresh()
  }

  snapshotFor(sessionKey: string, opts: { mode: InjectMode; project?: string; globMatches?: Entry[] }): SnapshotResult {
    const candidate = renderSnapshot({
      entries: this.entries,
      mode: opts.mode,
      project: opts.project,
      globMatches: opts.globMatches,
      ready: this.loaded,
      budget: {
        alwaysChars: this.config.budget.alwaysChars,
        catalogChars: this.config.budget.catalogChars,
        globChars: this.config.budget.globChars,
      },
    })
    const verbatim = this.snapshots.wasVerbatim(sessionKey, candidate.fingerprint)
    const result = this.snapshots.get(sessionKey, candidate)

    this.recall.inject.events++
    this.recall.inject.chars += result.chars.total
    this.recall.inject.tokens += result.tokens
    this.recall.inject.hits += result.shown
    if (verbatim) this.recall.inject.verbatim++
    if (result.shown === 0 && this.entries.length > 0) this.recall.inject.zeroHit++
    return result
  }

  setRequestShare(share: number): void {
    this.recall.lastShare = Number(share.toFixed(4))
    this.recall.maxShare = this.config.budget.maxShareOfRequest
  }

  throttleFor(sessionKey: string): Throttle {
    let throttle = this.throttles.get(sessionKey)
    if (!throttle) {
      throttle = new Throttle(this.config.inject.fullEvery, this.config.inject.slimEvery)
      this.throttles.set(sessionKey, throttle)
    }
    return throttle
  }

  async stats(): Promise<Stats> {
    const byKind: Record<string, number> = {}
    const byScope: Record<string, number> = {}
    const bySource: Record<string, number> = {}
    let bytes = 0
    for (const entry of this.entries) {
      byKind[entry.meta.kind] = (byKind[entry.meta.kind] ?? 0) + 1
      byScope[entry.meta.scope] = (byScope[entry.meta.scope] ?? 0) + 1
      bySource[entry.meta.provenance.source] = (bySource[entry.meta.provenance.source] ?? 0) + 1
      bytes += Buffer.byteLength(entry.body, 'utf8')
    }
    const lines = this.indexText.split('\n').length
    const indexBytes = Buffer.byteLength(this.indexText, 'utf8')
    return {
      root: this.root,
      ready: this.loaded,
      entryCount: this.entries.length,
      issues: this.issues,
      byKind,
      byScope,
      bySource,
      bytes,
      index: {
        lines,
        bytes: indexBytes,
        maxLines: INDEX_LIMITS.maxLines,
        maxBytes: INDEX_LIMITS.maxBytes,
        overBudget: lines > INDEX_LIMITS.maxLines || indexBytes > INDEX_LIMITS.maxBytes,
      },
      recall: structuredClone(this.recall),
      alerts: this.buildAlerts(),
    }
  }

  private buildAlerts(): Alert[] {
    const alerts: Alert[] = []
    for (const issue of this.issues.slice(0, 5)) {
      alerts.push({ level: 'error', code: 'entry-invalid', message: `${issue.rel}: ${issue.message}` })
    }
    const lines = this.indexText.split('\n').length
    if (lines > INDEX_LIMITS.maxLines || Buffer.byteLength(this.indexText, 'utf8') > INDEX_LIMITS.maxBytes) {
      alerts.push({ level: 'warn', code: 'index-over-budget', message: `INDEX.md ${lines} lines exceeds ${INDEX_LIMITS.maxLines}; run consolidation` })
    }
    if (this.recall.lastShare > this.config.budget.maxShareOfRequest) {
      alerts.push({
        level: 'warn',
        code: 'budget-overrun',
        message: `injection share ${(this.recall.lastShare * 100).toFixed(1)}% exceeds ${(this.config.budget.maxShareOfRequest * 100).toFixed(1)}%`,
      })
    }
    const conflicts = this.entries.filter((e) => e.meta.links.conflictsWith.length > 0 && e.meta.temporal.invalidatedAt === null)
    if (conflicts.length > 0) {
      alerts.push({ level: 'warn', code: 'conflicts', message: `${conflicts.length} entries carry unresolved conflicts` })
    }
    if (this.recall.inject.events > 20) {
      const verbatimRate = this.recall.inject.verbatim / this.recall.inject.events
      if (verbatimRate < 0.5) {
        alerts.push({
          level: 'error',
          code: 'prefix-cache-risk',
          message: `verbatim rate ${(verbatimRate * 100).toFixed(0)}% is low; injection text is not byte-stable`,
        })
      }
    }
    return alerts
  }

  async writeAudit(act: AuditAct, fields: Record<string, unknown>): Promise<void> {
    await writeAudit(this.root, { actor: 'plugin', act, ...fields })
  }
}

async function ensureDeviceId(root: string): Promise<string> {
  const rel = path.posix.join(DIRS.cache, 'device.json')
  const abs = resolveInRoot(root, rel)
  const existing = await readTextFile(abs)
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as { id?: string }
      if (parsed.id) return parsed.id
    } catch {
      // 损坏则重新生成
    }
  }
  const id = `dev-${createHash('sha256').update(`${hostname()}:${randomUUID()}`).digest('hex').slice(0, 12)}`
  await writeFileAtomic(abs, `${JSON.stringify({ id, hostname: hostname(), createdAt: isoNow() }, null, 2)}\n`)
  return id
}
