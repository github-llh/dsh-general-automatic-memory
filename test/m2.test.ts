import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { zstdCompressSync } from 'node:zlib'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../src/config.js'
import { MemoryService } from '../src/host/api.js'
import { Ingestor } from '../src/host/ingest/index.js'
import { decide } from '../src/host/ingest/decide.js'
import { extractFromTurn, normalizeDates } from '../src/host/ingest/extract.js'
import { extractWithLlm } from '../src/host/ingest/llm-extract.js'
import { gateCandidate } from '../src/host/ingest/gate.js'
import { ImportService } from '../src/host/importers/index.js'
import { decompressZstdFrames, parseDshSession, parseGenericJsonl } from '../src/host/importers/conversation.js'
import { MemoryStore } from '../src/host/store.js'
import type { SearchHit } from '../src/host/api.js'
import type { Candidate } from '../src/host/ingest/extract.js'

let root: string
const services: MemoryService[] = []

async function createService(config: typeof DEFAULT_CONFIG): Promise<MemoryService> {
  const service = await MemoryService.create(config, root)
  services.push(service)
  return service
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'gam-m2-'))
})

afterEach(async () => {
  // Windows：先关 SQLite 句柄再删目录，否则 .cache/fts.sqlite 会 EBUSY
  for (const service of services.splice(0)) service.dispose()
  await rm(root, { recursive: true, force: true })
})

const NOW = new Date('2026-10-21T10:00:00Z')
const SUGGEST_CONFIG = { ...DEFAULT_CONFIG, ingest: { ...DEFAULT_CONFIG.ingest, writeMode: 'suggest' as const } }

function candidate(over: Partial<Candidate> = {}): Candidate {
  return {
    kind: 'feedback',
    title: '改完代码后不要加总结',
    summary: '用户能自己读 diff',
    body: '不要在回复末尾总结刚做的修改。',
    source: 'user-stated',
    confidence: 'high',
    evidence: '不要加总结',
    reason: 'test',
    ...over,
  }
}

describe('规则抽取', () => {
  it('turns an explicit correction into a feedback candidate with a Why section', () => {
    const candidates = extractFromTurn({ userMessages: ['以后不要在回复末尾加总结了，因为我自己会看 diff'], now: NOW })
    expect(candidates).toHaveLength(1)
    const first = candidates[0]!
    expect(first.kind).toBe('feedback')
    expect(first.activation).toBe('always')
    expect(first.source).toBe('user-stated')
    expect(first.confidence).toBe('high')
    expect(first.body).toContain('**How to apply:**')
    expect(first.evidence.length).toBeGreaterThan(0)
  })

  it('extracts a relation triple with both entities', () => {
    const candidates = extractFromTurn({ userMessages: ['张三负责 data-platform-server 这个服务'], now: NOW })
    const relation = candidates.find((c) => c.kind === 'relations')
    expect(relation).toBeDefined()
    expect(relation!.entities).toEqual(['张三', 'data-platform-server'])
  })

  it('normalizes relative dates to absolute ones', () => {
    expect(normalizeDates('明天上线，下周一看结果', NOW)).toBe('2026-10-22上线，2026-10-26看结果')
  })

  it('extracts nothing from small talk', () => {
    expect(extractFromTurn({ userMessages: ['这个函数叫什么名字'], now: NOW })).toEqual([])
  })
})

describe('LLM 兜底抽取（真实 ctx.llm.stream 契约）', () => {
  const output = [{
    kind: 'project',
    title: '内部代号',
    summary: '长期代号 ZQ-4721',
    body: '内部代号是 ZQ-4721。',
    evidence: '内部项目 codename 是 ZQ-4721',
    confidence: 'high',
  }]
  const transcript = '用户说明：内部项目 codename 是 ZQ-4721，这个代号以后长期有效。' + '补充上下文。'.repeat(20)

  function fakeCtx(options: {
    selection?: { provider?: string; model?: string }
    chunks?: Array<{ type?: string; text?: string; kind?: string }>
  } = {}) {
    const calls: Array<Record<string, unknown>> = []
    const ctx = {
      get(name: string) {
        if (name === 'llm') {
          return {
            stream: async function* (request: Record<string, unknown>) {
              calls.push(request)
              for (const chunk of options.chunks ?? [
                { type: 'text-delta', text: JSON.stringify(output) },
                { type: 'finish', kind: 'stop' },
              ]) {
                yield chunk
              }
            },
          }
        }
        if (name === 'agentDefaultModel') return { currentSelection: () => options.selection }
        return undefined
      },
      logger: { warn: () => {} },
    }
    return { ctx: ctx as never, calls }
  }

  it('uses the session model and assembles text-delta chunks', async () => {
    const { ctx, calls } = fakeCtx({ selection: { provider: 'default-p', model: 'default-m' } })
    const result = await extractWithLlm(ctx, transcript, async () => true, { provider: 'session-p', model: 'session-m' })
    expect(calls).toHaveLength(1)
    expect(calls[0]!.provider).toBe('session-p')
    expect(calls[0]!.model).toBe('session-m')
    const messages = calls[0]!.messages as Array<{ role: string; content: Array<{ text: string }> }>
    expect(messages).toHaveLength(1)
    expect(messages[0]!.role).toBe('user')
    expect(messages[0]!.content[0]!.text).toContain('ZQ-4721')
    expect(result).toHaveLength(1)
    expect(result[0]!.source).toBe('model-inferred')
  })

  it('falls back to agentDefaultModel and returns [] on a failed stream', async () => {
    const fallback = fakeCtx({
      selection: { provider: 'default-p', model: 'default-m' },
      chunks: [
        { type: 'text-delta', text: JSON.stringify(output) },
        { type: 'finish', kind: 'error' },
      ],
    })
    expect(await extractWithLlm(fallback.ctx, transcript, async () => true)).toEqual([])
    expect(fallback.calls[0]!.provider).toBe('default-p')
    expect(fallback.calls[0]!.model).toBe('default-m')
  })

  it('does nothing when no target model is available', async () => {
    const { ctx, calls } = fakeCtx()
    expect(await extractWithLlm(ctx, transcript, async () => true)).toEqual([])
    expect(calls).toHaveLength(0)
  })
})

describe('写入门控', () => {
  it('hard-rejects secrets', () => {
    const verdict = gateCandidate({ ...candidate(), body: 'token: sk-abcdefghijklmnopqrstuvwx' }, DEFAULT_CONFIG, { writesLastHour: 0 })
    expect(verdict.allow).toBe(false)
    expect(verdict.reason).toBe('secret-detected')
  })

  it('refuses sensitive topics by default', () => {
    const verdict = gateCandidate({ ...candidate(), body: '用户有抑郁症病史，请避开压力话题' }, DEFAULT_CONFIG, { writesLastHour: 0 })
    expect(verdict.allow).toBe(false)
    expect(verdict.reason).toBe('sensitive-topic')
  })

  it('marks PII and forbids sharing it', () => {
    const verdict = gateCandidate({ ...candidate(), body: '联系邮箱 someone@example.com' }, DEFAULT_CONFIG, { writesLastHour: 0 })
    expect(verdict.allow).toBe(true)
    expect(verdict.pii).toBe(true)
    expect(verdict.shareable).toBe('none')
  })

  it('trips the burst circuit breaker', () => {
    const verdict = gateCandidate(candidate(), DEFAULT_CONFIG, { writesLastHour: DEFAULT_CONFIG.ingest.burstThreshold })
    expect(verdict.allow).toBe(false)
    expect(verdict.reason).toBe('burst-circuit-breaker')
  })

  it('requires evidence', () => {
    const verdict = gateCandidate({ ...candidate(), evidence: '' }, DEFAULT_CONFIG, { writesLastHour: 0 })
    expect(verdict.allow).toBe(false)
    expect(verdict.reason).toBe('missing-evidence')
  })
})

describe('写入决策', () => {
  const store = new MemoryStore('/tmp/unused')
  type MetaInput = Parameters<MemoryStore['buildMeta']>[0]
  const entry = (over: Partial<MetaInput>) => {
    const body = over.body ?? 'b'
    return { meta: store.buildMeta({ ...over, body } as MetaInput), body, rel: 'x.md' }
  }

  function hit(over: Partial<MetaInput>, relevance: number): SearchHit {
    return {
      entry: entry(over),
      score: relevance,
      parts: { relevance, heat: 0, confidence: 1, sourceTrust: 1, recency: 1 },
      why: 'test',
      gated: false,
    }
  }

  it('adds when nothing similar exists', () => {
    expect(decide(candidate(), []).kind).toBe('ADD')
  })

  it('no-ops on an equivalent existing entry', () => {
    const existing = hit({ kind: 'feedback', title: '改完代码后不要加总结', summary: '用户能自己读 diff', source: 'user-stated', body: candidate().body }, 0.95)
    const decision = decide(candidate(), [existing])
    expect(decision.kind).toBe('NOOP')
  })

  it('updates when the same fact has a fuller body', () => {
    const existing = hit({ kind: 'feedback', title: '改完代码后不要加总结', summary: '用户能自己读 diff', source: 'user-stated' }, 0.95)
    const decision = decide(candidate({ body: '更完整的表述：改完代码后不要总结，也不要罗列改动文件。' }), [existing])
    expect(decision.kind).toBe('UPDATE')
    expect(decision.targetId).toBe(existing.entry.meta.id)
  })

  it('invalidates the old entry when the new one contradicts it', () => {
    const existing = hit({ kind: 'project', title: '用 npm 安装依赖', summary: '包管理用 npm', source: 'user-stated' }, 0.7)
    const decision = decide(candidate({ kind: 'project', title: '改用 pnpm', summary: '包管理换成 pnpm', body: '现在改用 pnpm，不再使用 npm。' }), [existing])
    expect(decision.kind).toBe('INVALIDATE')
    expect(decision.supersede).toBe(true)
  })

  it('never lets a model-inferred candidate overwrite a user-stated entry', () => {
    const existing = hit({ kind: 'feedback', title: '改完代码后不要加总结', summary: '用户能自己读 diff', source: 'user-stated' }, 0.95)
    const decision = decide(candidate({ source: 'model-inferred' }), [existing])
    expect(decision.kind).toBe('NOOP')
    expect(decision.reason).toContain('用户条目胜出')
  })
})

describe('会话解析', () => {
  it('decompresses every zstd frame, not just the first', () => {
    const a = zstdCompressSync(Buffer.from('{"type":"turn/start"}\n'))
    const b = zstdCompressSync(Buffer.from('{"type":"turn/end"}\n'))
    expect(decompressZstdFrames(Buffer.concat([a, b]))).toBe('{"type":"turn/start"}\n{"type":"turn/end"}\n')
  })

  it('groups dsh events into turns', () => {
    const jsonl = [
      { type: 'turn/start', data: { turn: 1 } },
      { type: 'user/message', data: { message: { role: 'user', content: [{ type: 'text', text: '以后不要在回复末尾加总结' }] } } },
      { type: 'assistant/message', data: { message: { role: 'assistant', content: [{ type: 'text', text: '好的。' }] } } },
      { type: 'turn/end', data: { turn: 1 } },
      { type: 'turn/start', data: { turn: 2 } },
      { type: 'user/message', data: { message: { role: 'user', content: [{ type: 'text', text: '张三负责 data-platform-server' }] } } },
      { type: 'turn/end', data: { turn: 2 } },
    ]
      .map((event) => JSON.stringify(event))
      .join('\n')
    const turns = parseDshSession(jsonl, '/tmp/session.v4.jsonl')
    expect(turns).toHaveLength(2)
    expect(turns[0]!.userMessages[0]).toContain('加总结')
    expect(turns[0]!.assistantMessages).toHaveLength(1)
    expect(turns[1]!.userMessages[0]).toContain('张三')
  })

  it('parses generic jsonl conversations', () => {
    const jsonl = [
      { role: 'user', content: '以后别加总结' },
      { role: 'assistant', content: '好的' },
      { role: 'user', content: '张三负责 data-platform-server' },
    ]
      .map((record) => JSON.stringify(record))
      .join('\n')
    const turns = parseGenericJsonl(jsonl, '/tmp/chat.jsonl')
    expect(turns).toHaveLength(2)
    expect(turns[0]!.userMessages).toEqual(['以后别加总结'])
  })
})

describe('导入服务（记忆文件）', () => {
  async function makeSourceDir(): Promise<string> {
    const dir = await mkdtemp(path.join(tmpdir(), 'gam-src-'))
    await mkdir(path.join(dir, 'nested'), { recursive: true })
    await writeFile(
      path.join(dir, 'rules.md'),
      `# 团队约定\n\n## 提交规范\n\n提交信息用中文，正文说明为什么改。\n\n## 部署\n\n部署走 GitHub Actions，不要手工 scp。\n`,
      'utf8',
    )
    await writeFile(path.join(dir, 'nested', 'a.md'), '## 鉴权\n\nsession token 存 cookie，合规要求。\n', 'utf8')
    return dir
  }

  it('scans a generic directory and reports a dry-run estimate without writing', async () => {
    const api = await createService(DEFAULT_CONFIG)
    const ingestor = new Ingestor(api, DEFAULT_CONFIG)
    const importer = new ImportService(api, ingestor, DEFAULT_CONFIG)
    const src = await makeSourceDir()
    try {
      const report = await importer.scan('generic-dir', { path: src, limit: 50 })
      expect(report.items.length).toBeGreaterThanOrEqual(3)
      expect(report.estimate.added).toBeGreaterThan(0)
      expect(api.list()).toHaveLength(0) // 扫描绝不写盘
    } finally {
      await rm(src, { recursive: true, force: true })
    }
  })

  it('applies a selected subset, creates a snapshot, and dedupes on rescan', async () => {
    const api = await createService(DEFAULT_CONFIG)
    const ingestor = new Ingestor(api, DEFAULT_CONFIG)
    const importer = new ImportService(api, ingestor, DEFAULT_CONFIG)
    const src = await makeSourceDir()
    try {
      const report = await importer.scan('generic-dir', { path: src, limit: 50 })
      const keys = report.items.slice(0, 2).map((item) => item.key)
      const applied = await importer.apply(report.scanId, keys)
      expect(applied.added + applied.updated + applied.noop).toBe(2)
      expect(applied.snapshot).toContain('import')
      expect(api.list().length).toBeGreaterThanOrEqual(1)

      // 再扫一次：已导入的条目应被识别为 duplicate/merged，而不是再新增一遍
      const again = await importer.scan('generic-dir', { path: src, limit: 50 })
      const dup = again.items.filter((item) => item.duplicateOf !== undefined)
      expect(dup.length).toBeGreaterThan(0)
    } finally {
      await rm(src, { recursive: true, force: true })
    }
  })
})

describe('自动写入（默认 auto 模式）', () => {
  it('writes persona/feedback immediately and can be undone afterwards', async () => {
    const api = await createService(DEFAULT_CONFIG)
    const ingestor = new Ingestor(api, DEFAULT_CONFIG)
    const result = await ingestor.ingestTurn({
      sid: 's-auto',
      turn: 1,
      cwd: '/repo/demo',
      userMessages: ['以后不要在回复末尾加总结了'],
      assistantMessages: [],
      now: NOW,
    })
    expect(result.pending).toBe(0)
    expect(api.list().some((entry) => entry.meta.kind === 'feedback')).toBe(true)

    const entry = api.list().find((item) => item.meta.kind === 'feedback')
    expect(entry).toBeTruthy()
    await api.invalidate(entry!.meta.id, { reason: 'undo from test' })
    expect(api.list().some((item) => item.meta.id === entry!.meta.id)).toBe(false)
  })
})

describe('自动写入（suggest 模式）', () => {
  it('queues a feedback candidate instead of writing it, then writes on approval', async () => {
    const api = await createService(SUGGEST_CONFIG)
    const ingestor = new Ingestor(api, SUGGEST_CONFIG)
    const result = await ingestor.ingestTurn({
      sid: 's1',
      turn: 1,
      cwd: '/repo/demo',
      userMessages: ['以后不要在回复末尾加总结了'],
      assistantMessages: [{ role: 'assistant', content: [{ type: 'text', text: '好的，记下了。' }] }],
      now: NOW,
    })
    expect(result.episodeId).toBeTruthy()
    expect(result.pending).toBe(1)
    expect(api.list()).toHaveLength(0)

    const pending = ingestor.pending.list(NOW.getTime())
    expect(pending).toHaveLength(1)
    const resolved = await ingestor.resolvePending(pending[0]!.id, 'accept')
    expect(resolved.ok).toBe(true)
    expect(api.list()).toHaveLength(1)
    expect(api.list()[0]!.meta.kind).toBe('feedback')
    expect(api.list()[0]!.meta.activation).toBe('always')
  })

  it('auto-writes project candidates without asking (they are in autoKinds)', async () => {
    const api = await createService(SUGGEST_CONFIG)
    const ingestor = new Ingestor(api, SUGGEST_CONFIG)
    const result = await ingestor.ingestTurn({
      sid: 's2',
      turn: 1,
      cwd: '/repo/demo',
      userMessages: ['我们决定用 cookie 存 session token，而不是 localStorage'],
      assistantMessages: [],
      now: NOW,
    })
    expect(result.added).toBe(1)
    expect(api.list()).toHaveLength(1)
    expect(api.list()[0]!.meta.scope).toBe('project')
  })

  it('expires unactioned proposals into a silent NOOP', async () => {
    const api = await createService(SUGGEST_CONFIG)
    const ingestor = new Ingestor(api, SUGGEST_CONFIG)
    await ingestor.ingestTurn({
      sid: 's3',
      turn: 1,
      userMessages: ['以后不要在回复末尾加总结了'],
      assistantMessages: [],
      now: NOW,
    })
    expect(ingestor.pending.size).toBe(1)
    const swept = await ingestor.sweepPending(NOW.getTime() + 60_000)
    expect(swept).toBe(1)
    expect(api.list()).toHaveLength(0)
  })

  it('stores the turn as an episode even when no candidate is extracted', async () => {
    const api = await createService(DEFAULT_CONFIG)
    const ingestor = new Ingestor(api, DEFAULT_CONFIG)
    const result = await ingestor.ingestTurn({
      sid: 's4',
      turn: 1,
      cwd: '/repo/demo',
      userMessages: ['这个函数叫什么名字'],
      assistantMessages: [],
      now: NOW,
    })
    expect(result.episodeId).toBeTruthy()
    const episodes = await api.episodes.listDay(path.basename('/repo/demo'), '2026-10-21')
    expect(episodes.length).toBe(0) // slug 是哈希前缀，不是 basename
    const recent = await api.episodes.recent(
      (await import('../src/host/paths.js')).projectSlug('/repo/demo'),
      1,
      NOW,
    )
    expect(recent).toHaveLength(1)
  })
})
