import { createHash } from 'node:crypto'
import { KIND_ORDER, estimateTokens, type Entry } from './model.js'

export type InjectMode = 'cold' | 'full' | 'slim' | 'human'

export interface Budget {
  alwaysChars: number
  catalogChars: number
  globChars: number
}

export interface SnapshotInput {
  entries: Entry[]
  mode: InjectMode
  project?: string
  /** glob 命中的条目（已按 activation=glob 过滤并排序） */
  globMatches?: Entry[]
  budget: Budget
  ready: boolean
}

export interface SnapshotResult {
  text: string
  fingerprint: string
  mode: InjectMode
  chars: { always: number; catalog: number; glob: number; total: number }
  tokens: number
  shown: number
  omitted: number
}

const CATALOG_HEADING = '[记忆目录] 用 memory_recall 检索、memory_read 读全文。目录不完整，"+N more" 表示还有。'
const NOT_READY = '[记忆] 索引构建中，本轮不提供目录。需要历史上下文时用 memory_recall 检索。'

function isActive(entry: Entry): boolean {
  return entry.meta.temporal.invalidatedAt === null
}

function byRank(a: Entry, b: Entry): number {
  const heat = b.meta.stats.heat - a.meta.stats.heat
  if (heat !== 0) return heat
  return a.meta.id < b.meta.id ? -1 : a.meta.id > b.meta.id ? 1 : 0
}

/**
 * 常驻层：activation=always 的 persona/feedback/preference。
 * 走 ctx.systemPrompt.context()（cache-safe），**不走 section()**——后者改动会触发
 * system prompt 面替换，直接击穿 DeepSeek 前缀缓存。
 */
export function renderAlwaysLayer(entries: Entry[], maxChars: number): string {
  const groups: Array<[string, Entry[]]> = [
    ['协作纪律', pick(entries, 'feedback')],
    ['关于用户', pick(entries, 'persona')],
    ['偏好', pick(entries, 'preference')],
  ]
  const lines: string[] = ['## 记忆（长期）']
  let used = lines[0]!.length + 1
  let truncated = 0
  for (const [title, list] of groups) {
    if (list.length === 0) continue
    const heading = `### ${title}`
    if (used + heading.length + 1 > maxChars) break
    lines.push(heading)
    used += heading.length + 1
    for (const entry of list) {
      const line = `- ${entry.meta.title} — ${entry.meta.summary}`
      if (used + line.length + 1 > maxChars) {
        truncated++
        continue
      }
      lines.push(line)
      used += line.length + 1
    }
  }
  if (truncated > 0) lines.push(`（另有 ${truncated} 条常驻记忆超出预算，见 memory_status）`)
  if (lines.length === 1) return ''
  return `${lines.join('\n')}\n`
}

function pick(entries: Entry[], kind: string): Entry[] {
  return entries
    .filter((e) => isActive(e) && e.meta.kind === kind && e.meta.activation === 'always')
    .sort(byRank)
}

/**
 * 目录层（L0 catalog）：只有 title + summary + id，**不含正文**。
 *
 * 它的作用不是「把记忆塞进上下文」，而是让模型知道自己知道什么，从而主动去调
 * memory_recall / memory_read。这是 Claude Code auto memory 的做法，也是 Anthropic
 * memory tool「不提供 ranked retrieval、路径即检索键」这个设计能成立的前提。
 *
 * 带上 id 是刻意的：模型可以直接 memory_read，省掉一次 recall 往返。
 */
export function renderCatalogLayer(entries: Entry[], maxChars: number, project?: string): { text: string; shown: number; omitted: number } {
  const pool = entries
    .filter((e) => isActive(e) && e.meta.activation !== 'manual')
    .filter((e) => e.meta.scope === 'global' || (project !== undefined && e.meta.project === project))
    .sort((a, b) => {
      const ka = KIND_ORDER.indexOf(a.meta.kind)
      const kb = KIND_ORDER.indexOf(b.meta.kind)
      if (ka !== kb) return ka - kb
      return byRank(a, b)
    })

  const counts = new Map<string, number>()
  for (const entry of pool) counts.set(entry.meta.kind, (counts.get(entry.meta.kind) ?? 0) + 1)
  const heading = `${CATALOG_HEADING}\n${[...counts.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([k, n]) => `${k}:${n}`)
    .join(' ')}`

  const rows: string[] = []
  let used = heading.length + 1
  for (const entry of pool) {
    const row = `- ${entry.meta.title} — ${entry.meta.summary} [${entry.meta.kind}·${entry.meta.confidence}] ${entry.meta.id}`
    if (used + row.length + 1 > maxChars) break
    rows.push(row)
    used += row.length + 1
  }
  const shown = rows.length
  const omitted = pool.length - shown
  if (omitted > 0) rows.push(`+${omitted} more via memory_recall`)
  if (shown === 0) return { text: '', shown: 0, omitted: pool.length }
  return { text: `${heading}\n${rows.join('\n')}\n`, shown, omitted }
}

function renderGlobLayer(entries: Entry[], maxChars: number): string {
  if (entries.length === 0) return ''
  const lines: string[] = ['[与当前文件相关的记忆]']
  let used = lines[0]!.length + 1
  for (const entry of entries.sort(byRank)) {
    const line = `- ${entry.meta.title} — ${entry.meta.summary} ${entry.meta.id}`
    if (used + line.length + 1 > maxChars) break
    lines.push(line)
    used += line.length + 1
  }
  return lines.length > 1 ? `${lines.join('\n')}\n` : ''
}

/**
 * 渲染一次完整快照。**必须是纯函数**：不含时间戳、随机数、会话 id、相对时间，
 * 排序全部确定性。任何非确定性都会让前缀缓存失效（前作曾因此发过 urgent 升级公告）。
 */
export function renderSnapshot(input: SnapshotInput): SnapshotResult {
  if (!input.ready) {
    return finish(NOT_READY, input.mode, { always: 0, catalog: 0, glob: 0 }, 0, 0)
  }

  const always = renderAlwaysLayer(input.entries, input.budget.alwaysChars)

  // slim 态只给常驻层：agent 连续跑很多步时没必要每步都重复整个目录
  const catalog =
    input.mode === 'slim'
      ? { text: '', shown: 0, omitted: 0 }
      : renderCatalogLayer(input.entries, input.budget.catalogChars, input.project)

  // glob 命中是当前文件直接相关的，slim 也不能丢；目录层才做节流
  const glob = renderGlobLayer(input.globMatches ?? [], input.budget.globChars)

  const parts = [always, catalog.text, glob].filter((p) => p.length > 0)
  const text = parts.length > 0 ? parts.join('\n') : ''
  return finish(text, input.mode, { always: always.length, catalog: catalog.text.length, glob: glob.length }, catalog.shown, catalog.omitted)
}

function finish(
  text: string,
  mode: InjectMode,
  chars: { always: number; catalog: number; glob: number },
  shown: number,
  omitted: number,
): SnapshotResult {
  return {
    text,
    fingerprint: fingerprintOf(text, mode),
    mode,
    chars: { ...chars, total: text.length },
    tokens: estimateTokens(text),
    shown,
    omitted,
  }
}

export function fingerprintOf(text: string, mode: InjectMode): string {
  return `${mode}:${createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16)}`
}

/**
 * 逐字节幂等缓存（原则 P4）。
 *
 * 给定相同指纹，返回**上一次定稿的同一字符串实例**——不是重新渲染出的等值字符串。
 * 这保证注入到请求前缀的字节完全一致，DeepSeek 前缀缓存才能命中。
 */
export class SnapshotCache {
  private last = new Map<string, { fingerprint: string; result: SnapshotResult }>()

  get(sessionKey: string, candidate: SnapshotResult): SnapshotResult {
    const prev = this.last.get(sessionKey)
    if (prev && prev.fingerprint === candidate.fingerprint) return prev.result
    this.last.set(sessionKey, { fingerprint: candidate.fingerprint, result: candidate })
    return candidate
  }

  /** 命中缓存（= 原样复读）返回 true，用于 verbatimRate 遥测 */
  wasVerbatim(sessionKey: string, fingerprint: string): boolean {
    return this.last.get(sessionKey)?.fingerprint === fingerprint
  }

  drop(sessionKey: string): void {
    this.last.delete(sessionKey)
  }

  clear(): void {
    this.last.clear()
  }
}

/**
 * 分层节流（docs/04 §6）。计数器**不进指纹**——否则每个请求都不同，永远无法复读。
 * 只有派生出的 mode 进指纹，而 mode 只在跨过阈值时才翻转。
 */
export class Throttle {
  private sinceFull = Number.MAX_SAFE_INTEGER
  private sinceAny = Number.MAX_SAFE_INTEGER

  constructor(
    private readonly fullEvery: number,
    private readonly slimEvery: number,
  ) {}

  next(opts: { ready: boolean; humanPresent: boolean }): InjectMode {
    if (!opts.ready) return 'cold'
    this.sinceFull++
    this.sinceAny++
    if (opts.humanPresent) {
      this.sinceFull = 0
      this.sinceAny = 0
      return 'human'
    }
    if (this.sinceFull >= this.fullEvery) {
      this.sinceFull = 0
      this.sinceAny = 0
      return 'full'
    }
    if (this.sinceAny < this.slimEvery) return 'slim'
    this.sinceAny = 0
    return 'full'
  }

  /** 会话切换或 compaction 后强制下一次给完整版 */
  reset(): void {
    this.sinceFull = Number.MAX_SAFE_INTEGER
    this.sinceAny = Number.MAX_SAFE_INTEGER
  }
}
