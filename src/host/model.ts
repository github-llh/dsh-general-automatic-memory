import { createHash, randomBytes } from 'node:crypto'

// ---------------------------------------------------------------------------
// 枚举（规范见 docs/03-memory-format.md §2）
// ---------------------------------------------------------------------------

export const KINDS = [
  'persona',
  'preference',
  'feedback',
  'relations',
  'project',
  'reference',
  'procedure',
  'episode',
] as const
export type Kind = (typeof KINDS)[number]

export const ACTIVATIONS = ['always', 'glob', 'on_demand', 'manual'] as const
export type Activation = (typeof ACTIVATIONS)[number]

export const SOURCES = [
  'user-stated',
  'model-inferred',
  'tool-output',
  'web-content',
  'imported',
  'team',
  'manual',
] as const
export type Source = (typeof SOURCES)[number]

export const CONFIDENCES = ['high', 'medium', 'low'] as const
export type Confidence = (typeof CONFIDENCES)[number]

export const SCOPES = ['global', 'project'] as const
export type Scope = (typeof SCOPES)[number]

export const SHAREABLE = ['team', 'none'] as const
export type Shareable = (typeof SHAREABLE)[number]

export const WRITE_MODES = ['auto', 'suggest', 'manual'] as const
export type WriteMode = (typeof WRITE_MODES)[number]

export const RETRIEVAL_BACKENDS = ['l0', 'l1', 'auto'] as const
export const SYNC_TRANSPORTS = ['none', 'git', 'zip', 'remote'] as const
export const CONFLICT_POLICIES = ['ask', 'prefer-local', 'prefer-remote'] as const
export const TOOL_SURFACES = ['minimal', 'standard'] as const

export const STATUS = ['active', 'invalidated', 'expired', 'archived'] as const
export type Status = (typeof STATUS)[number]

// ---------------------------------------------------------------------------
// 配置形状（与 src/config.ts 的 schemastery schema 一一对应）
// ---------------------------------------------------------------------------

export interface MemoryConfig {
  memoryRoot: string
  budget: {
    alwaysChars: number
    catalogChars: number
    recallChars: number
    globChars: number
    maxShareOfRequest: number
    whiteboardChars: number
  }
  inject: { enabled: boolean; fullEvery: number; slimEvery: number; showTurnTail: boolean }
  ingest: {
    writeMode: WriteMode
    autoKinds: string[]
    suggestTimeoutSec: number
    llmExtract: boolean
    dailyLlmCalls: number
    burstThreshold: number
    requireEvidence: boolean
  }
  retrieval: { backend: 'l0' | 'l1' | 'auto'; vectorEnabled: boolean; gateThreshold: number; recallLimit: number }
  curator: {
    enabled: boolean
    scheduleTime: string
    consolidateEverySessions: number
    promoteMinHits: number
    episodeTtlDays: number
    archiveAfterDays: number
  }
  portability: {
    projections: Record<string, boolean>
    importOnFirstRun: boolean
    syncTransport: 'none' | 'git' | 'zip' | 'remote'
    syncConflictPolicy: 'ask' | 'prefer-local' | 'prefer-remote'
  }
  privacy: { sensitiveTopics: boolean; piiScan: boolean; sharePii: boolean; auditKeepDays: number }
  toolSurface: 'minimal' | 'standard'
  advanced: { snapshotKeep: number; indexRebuildOnStart: boolean; shadowRetrieval: boolean }
}

// ---------------------------------------------------------------------------
// 条目
// ---------------------------------------------------------------------------

export interface Provenance {
  source: Source
  createdAt: string
  createdBy: string
  sessionId?: string
  eventSeq?: number
  origin?: string
  importedFrom?: string
}

export interface Temporal {
  observedAt: string
  validFrom: string
  invalidatedAt: string | null
  supersededBy: string | null
  expiresAt: string | null
}

export interface Stats {
  revisions: number
  hits: number
  lastUsedAt: string | null
  heat: number
}

export interface Links {
  relates: string[]
  derivedFrom: string[]
  conflictsWith: string[]
}

export interface Privacy {
  pii: boolean
  sensitive: boolean
  shareable: Shareable
}

export interface Frontmatter {
  id: string
  kind: Kind
  title: string
  summary: string
  scope: Scope
  project?: string
  tags: string[]
  entities: string[]
  activation: Activation
  globs: string[]
  confidence: Confidence
  provenance: Provenance
  temporal: Temporal
  stats: Stats
  links: Links
  privacy: Privacy
  checksum: string
}

export interface Entry {
  meta: Frontmatter
  body: string
  /** 相对 MEMORY_ROOT 的 POSIX 路径 */
  rel: string
}

/** kind → 相对目录（episode 走 jsonl，不在这里） */
export const KIND_DIR: Record<Exclude<Kind, 'episode'>, string> = {
  persona: 'persona',
  preference: 'preference',
  feedback: 'feedback',
  relations: 'relations',
  project: 'projects/{slug}/facts',
  reference: 'reference',
  procedure: 'procedures',
}

/** INDEX.md 的分组顺序；同时是常驻层裁剪时的优先级（越前越不该被裁） */
export const KIND_ORDER: readonly Kind[] = [
  'feedback',
  'persona',
  'preference',
  'relations',
  'project',
  'reference',
  'procedure',
  'episode',
]

/** 召回排序里的来源可信度权重（docs/04 §7）。不可信来源不是被丢弃，而是被降权。 */
export const SOURCE_TRUST: Record<Source, number> = {
  'user-stated': 1,
  manual: 1,
  'model-inferred': 0.8,
  imported: 0.7,
  team: 0.6,
  'tool-output': 0.4,
  'web-content': 0.2,
}

export const CONFIDENCE_WEIGHT: Record<Confidence, number> = { high: 1, medium: 0.7, low: 0.4 }

/** 只有这些来源可以直接进长期层；其余只能进 episode（防记忆投毒，docs/09 §3） */
export const LONG_TERM_SOURCES: ReadonlySet<Source> = new Set<Source>([
  'user-stated',
  'manual',
  'imported',
  'model-inferred',
  'team',
])

// ---------------------------------------------------------------------------
// id / checksum
// ---------------------------------------------------------------------------

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
let lastTime = 0
let lastRandom: number[] = []

/** 单调递增 ULID：同一毫秒内递增随机段，保证 id 可按时间排序且不重复。 */
export function ulid(now: number = Date.now()): string {
  let time = now
  let random: number[]
  if (time === lastTime && lastRandom.length > 0) {
    random = [...lastRandom]
    for (let i = random.length - 1; i >= 0; i--) {
      const next = (random[i] as number) + 1
      if (next < 32) {
        random[i] = next
        break
      }
      random[i] = 0
      if (i === 0) time = ++lastTime // 随机段溢出，推进时间戳
    }
  } else {
    const bytes = randomBytes(16)
    random = Array.from({ length: 16 }, (_, i) => (bytes[i] as number) % 32)
  }
  lastTime = time
  lastRandom = random

  let out = ''
  let t = time
  for (let i = 0; i < 10; i++) {
    out = CROCKFORD[t % 32] + out
    t = Math.floor(t / 32)
  }
  for (const r of random) out += CROCKFORD[r]
  return `m_${out}`
}

/** 只覆盖正文：frontmatter 里的 stats 每次召回都会变，一起算哈希会造成写放大。 */
export function checksumOf(body: string): string {
  return `sha256:${createHash('sha256').update(body, 'utf8').digest('hex')}`
}

/**
 * 正文规范化。**必须只有一个实现**：写入与解析两侧若不一致，checksum 会在每次
 * 往返时漂移，doctor 就会把每个文件都误判成"用户手工改过"。
 */
export function normalizeBody(body: string): string {
  const text = body.replace(/\r\n/g, '\n').replace(/^\n+/, '').replace(/\s+$/, '')
  return text.length === 0 ? '' : `${text}\n`
}

export function isEntryId(value: unknown): value is string {
  return typeof value === 'string' && /^m_[0-9A-HJKMNP-TV-Z]{26}$/.test(value)
}

// ---------------------------------------------------------------------------
// 热度（docs/04 §8）
// ---------------------------------------------------------------------------

export function computeHeat(input: { hits: number; lastUsedAt: string | null; boosted?: boolean; now?: number }): number {
  const now = input.now ?? Date.now()
  const hitsPart = 0.5 * Math.min(1, Math.log(1 + Math.max(0, input.hits)) / Math.log(1 + 10))
  const days = input.lastUsedAt ? Math.max(0, (now - Date.parse(input.lastUsedAt)) / 86_400_000) : 365
  const recencyPart = 0.3 * Math.exp(-days / 60)
  const boostPart = input.boosted ? 0.2 : 0
  return Number(Math.min(1, hitsPart + recencyPart + boostPart).toFixed(4))
}

// ---------------------------------------------------------------------------
// token 估算
// ---------------------------------------------------------------------------

const CJK = /[\u3000-\u9fff\u3040-\u30ff\uac00-\ud7af]/

/**
 * 无 ctx.tokenMeter 时的兜底估算：CJK 字符按 0.7 token/字，其余按 4 字符/token。
 * 面板与预算裁剪优先用 ctx.tokenMeter.measure() 的实测值，这只是降级路径。
 */
export function estimateTokens(text: string): number {
  let cjk = 0
  let other = 0
  for (const ch of text) {
    if (CJK.test(ch)) cjk++
    else other++
  }
  return Math.ceil(cjk * 0.7 + other / 4)
}

/** ISO 日期（yyyy-mm-dd）。刻意不用 toLocaleString / 相对时间：注入文本必须逐字节稳定。 */
export function isoDate(d: Date | number = new Date()): string {
  return new Date(d).toISOString().slice(0, 10)
}

export function isoNow(d: Date | number = new Date()): string {
  return new Date(d).toISOString().replace(/\.000Z$/, 'Z')
}
