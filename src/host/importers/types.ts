import type { Activation, Confidence, Kind } from '../model.js'

/**
 * 导入器的统一中间格式。
 *
 * 所有来源（Claude Code auto memory、CLAUDE.md、Cursor rules、会话日志…）都先归一成
 * `ImportItem`，再走与实时写入**完全相同**的「门控 → 决策 → 落盘」管线。
 * 这是刻意的：两条路径两套逻辑，迟早会分叉出两种记忆质量。
 */
export type ImportSourceId =
  | 'claude-code-memory'
  | 'claude-md'
  | 'agents-md'
  | 'cursor-rules'
  | 'windsurf-rules'
  | 'cline-memory-bank'
  | 'copilot-instructions'
  | 'gemini-md'
  | 'dsh-auto-memory'
  | 'generic-dir'
  | 'dsh-sessions'
  | 'claude-code-sessions'
  | 'generic-jsonl'
  | 'generic-markdown'

export interface ImportItem {
  /** 稳定 key：来源 + 路径 + 序号。apply 时用它定位，不信任客户端回传的内容 */
  key: string
  source: ImportSourceId
  origin: string
  kind: Kind
  title: string
  summary: string
  body: string
  entities: string[]
  tags: string[]
  confidence: Confidence
  activation: Activation
  pii: boolean
  /** 已存在等价条目时给出 id，apply 时会走 UPDATE/NOOP 而不是重复新增 */
  duplicateOf?: string
}

export interface SkippedFile {
  origin: string
  reason: string
}

export interface ScanReport {
  scanId: string
  source: ImportSourceId
  label: string
  detected: boolean
  scannedPaths: string[]
  items: ImportItem[]
  skipped: SkippedFile[]
  /** 预估影响：新增/合并/已存在 */
  estimate: { added: number; merged: number; duplicate: number; pii: number }
}

export interface ScanOptions {
  /** 单次扫描的条目上限，防止误扫一个巨大的目录把内存打满 */
  limit: number
  /** 用户指定的路径（generic-dir / generic-jsonl / generic-markdown 用） */
  path?: string
  /** 会话类来源：最多挖多少轮 */
  maxTurns?: number
}

export interface SourceDescriptor {
  id: ImportSourceId
  label: string
  /** 记忆文件类（一次性导入）还是会话类（需要抽取） */
  kind: 'memory' | 'conversation'
  /** 探测这台机器上是否存在该来源 */
  detect(cwd: string): Promise<string[]>
  scan(cwd: string, options: ScanOptions): Promise<{ items: ImportItem[]; skipped: SkippedFile[] }>
}

// ---------------------------------------------------------------------------
// 共用小工具
// ---------------------------------------------------------------------------

export function clip(text: string, max: number): string {
  const single = text.replace(/\s+/g, ' ').trim()
  return single.length > max ? `${single.slice(0, max - 1)}…` : single
}

/** 按二级标题切分 Markdown；没有标题时整篇当一节 */
export function splitSections(markdown: string): Array<{ title: string; body: string }> {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const sections: Array<{ title: string; body: string[] }> = []
  let current: { title: string; body: string[] } | null = null
  for (const line of lines) {
    const heading = /^##\s+(.+?)\s*$/.exec(line)
    if (heading) {
      if (current) sections.push(current)
      current = { title: (heading[1] ?? '').trim(), body: [] }
      continue
    }
    if (current) current.body.push(line)
  }
  if (current) sections.push(current)
  if (sections.length === 0) {
    const body = markdown.trim()
    return body ? [{ title: '', body }] : []
  }
  return sections
    .map((section) => ({ title: section.title, body: section.body.join('\n').trim() }))
    .filter((section) => section.body.length > 0)
}

const FEEDBACK_HINT = /(不要|必须|禁止|别再|别把|always|never|don'?t |must |should not)/i
const PERSONA_HINT = /(我是|我负责|我主要|我的角色|i'?m a |i am a |my role)/i
const REFERENCE_HINT = /https?:\/\/|看板|仪表盘|dashboard|oncall|wiki/i

/**
 * 从一段自由文本猜类型。猜测必须保守：拿不准就归 project + on_demand，
 * 因为"错标成 always 的纪律"会永久污染每一轮 prompt。
 */
export function classify(text: string): { kind: Kind; activation: Activation; tags: string[] } {
  const tags: string[] = []
  if (FEEDBACK_HINT.test(text)) {
    tags.push('rule')
    return { kind: 'feedback', activation: 'always', tags }
  }
  if (PERSONA_HINT.test(text)) {
    tags.push('identity')
    return { kind: 'persona', activation: 'on_demand', tags }
  }
  if (REFERENCE_HINT.test(text)) {
    tags.push('link')
    return { kind: 'reference', activation: 'on_demand', tags }
  }
  return { kind: 'project', activation: 'on_demand', tags }
}

/** 极简 frontmatter 读取（只取字符串/布尔/字符串数组，够用且不引依赖到调用方） */
export function readFrontmatter(text: string): { data: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) return { data: {}, body: text }
  const data: Record<string, unknown> = {}
  for (const line of (match[1] ?? '').split('\n')) {
    const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim())
    if (!kv) continue
    const key = kv[1] as string
    const raw = (kv[2] ?? '').trim()
    if (raw === 'true' || raw === 'false') data[key] = raw === 'true'
    else if (raw.startsWith('[') && raw.endsWith(']')) {
      data[key] = raw
        .slice(1, -1)
        .split(',')
        .map((part) => part.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else data[key] = raw.replace(/^["']|["']$/g, '')
  }
  return { data, body: text.slice(match[0].length) }
}

/** Claude Code auto memory 的 type 与我们 8 类的一对一映射 */
export function mapClaudeType(type: unknown): Kind {
  switch (String(type ?? '')) {
    case 'user':
      return 'persona'
    case 'feedback':
      return 'feedback'
    case 'reference':
      return 'reference'
    case 'project':
      return 'project'
    default:
      return 'project'
  }
}

export function hasPii(text: string): boolean {
  return (
    /\b1[3-9]\d{9}\b/.test(text) ||
    /\b\d{17}[\dXx]\b/.test(text) ||
    /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/.test(text) ||
    /\b(?:\d[ -]?){13,19}\b/.test(text)
  )
}
