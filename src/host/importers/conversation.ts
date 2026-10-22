import { readFile, readdir, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { zstdDecompressSync } from 'node:zlib'
import { hasExtension } from '../files.js'
import { expandUserPath } from '../paths.js'
import { extractFromTurn, type Candidate } from '../ingest/extract.js'
import type { ImportItem, ScanOptions, SkippedFile, SourceDescriptor } from './types.js'
import { clip, hasPii } from './types.js'

/**
 * 会话 → 记忆。
 *
 * 这是本插件真正的差异化能力：其他记忆插件关注"下次对话时记得"，
 * 我们把**过去所有对话**一次性变成可检索、可编辑的记忆。
 * 抽取逻辑与实时写入完全共用（ingest/extract），所以导入进来的条目
 * 与自动记下来的条目质量一致、格式一致、决策规则一致。
 */
export interface ConversationTurn {
  index: number
  userMessages: string[]
  assistantMessages: string[]
  origin: string
}

const MAX_BYTES = 16 * 1024 * 1024

/**
 * dsh 的会话日志是**多帧** zstd（一帧 header + 每批追加一帧）。
 * Node 的 zstdDecompressSync 只解第一帧（实测：concat 两帧只返回第一帧内容），
 * 所以必须按 magic 切分逐帧解。
 *
 * 一个帧内部理论上可能出现伪 magic，因此失败时把切片伸到下一个 magic 重试。
 */
export function decompressZstdFrames(buffer: Buffer): string {
  const MAGIC = [0x28, 0xb5, 0x2f, 0xfd] as const
  const starts: number[] = []
  for (let i = 0; i + 4 <= buffer.length; i++) {
    if (buffer[i] === MAGIC[0] && buffer[i + 1] === MAGIC[1] && buffer[i + 2] === MAGIC[2] && buffer[i + 3] === MAGIC[3]) starts.push(i)
  }
  if (starts.length === 0) return buffer.toString('utf8')
  const parts: string[] = []
  let index = 0
  while (index < starts.length) {
    let done = false
    for (let span = 1; span <= 3 && index + span <= starts.length; span++) {
      const start = starts[index] as number
      const end = index + span < starts.length ? (starts[index + span] as number) : buffer.length
      try {
        parts.push(zstdDecompressSync(buffer.subarray(start, end)).toString('utf8'))
        index += span
        done = true
        break
      } catch {
        // 试试延伸到下一个 magic
      }
    }
    if (!done) index++
  }
  return parts.join('')
}

async function readMaybeZstd(abs: string): Promise<string | null> {
  try {
    const info = await stat(abs)
    if (info.size > MAX_BYTES) return null
    const buffer = await readFile(abs)
    if (buffer.length >= 4 && buffer[0] === 0x28 && buffer[1] === 0xb5) return decompressZstdFrames(buffer)
    return buffer.toString('utf8')
  } catch {
    return null
  }
}

async function isDir(target: string): Promise<boolean> {
  try {
    return (await stat(target)).isDirectory()
  } catch {
    return false
  }
}

function textOfContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  const parts: string[] = []
  for (const block of content) {
    if (typeof block === 'string') parts.push(block)
    else if (block && typeof block === 'object' && (block as { type?: string }).type === 'text') {
      const text = (block as { text?: unknown }).text
      if (typeof text === 'string') parts.push(text)
    }
  }
  return parts.join('\n').trim()
}

/** dsh session.v*.jsonl(.zstd)：按 turn 分组 */
export function parseDshSession(text: string, origin: string): ConversationTurn[] {
  const turns: ConversationTurn[] = []
  let current: ConversationTurn | null = null
  const flush = () => {
    if (current && (current.userMessages.length > 0 || current.assistantMessages.length > 0)) turns.push(current)
    current = null
  }
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    let event: { type?: string; data?: Record<string, unknown> }
    try {
      event = JSON.parse(line) as typeof event
    } catch {
      continue
    }
    const type = event.type ?? ''
    if (type === 'turn/start') {
      flush()
      current = { index: turns.length, userMessages: [], assistantMessages: [], origin }
      continue
    }
    if (type === 'turn/end') {
      flush()
      continue
    }
    if (type === 'user/message' || type === 'assistant/message') {
      if (!current) current = { index: turns.length, userMessages: [], assistantMessages: [], origin }
      const message = (event.data as { message?: unknown })?.message ?? event.data
      const textContent = typeof message === 'object' && message !== null ? textOfContent((message as { content?: unknown }).content) : ''
      if (!textContent) continue
      if (type === 'user/message') current.userMessages.push(textContent)
      else current.assistantMessages.push(textContent)
    }
  }
  flush()
  return turns
}

/** Claude Code 会话 jsonl：`{type:'user'|'assistant', message:{role, content}}`，按 user 消息切轮 */
export function parseClaudeSession(text: string, origin: string): ConversationTurn[] {
  const turns: ConversationTurn[] = []
  let current: ConversationTurn | null = null
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    let record: Record<string, unknown>
    try {
      record = JSON.parse(line) as Record<string, unknown>
    } catch {
      continue
    }
    const type = String(record.type ?? '')
    const message = record.message as { role?: string; content?: unknown } | undefined
    const role = message?.role ?? (type === 'user' || type === 'assistant' ? type : undefined)
    if (!role || (role !== 'user' && role !== 'assistant')) continue
    const content = textOfContent(message?.content ?? record.content)
    if (!content) continue
    if (role === 'user') {
      if (current && current.userMessages.length > 0) turns.push(current)
      current = { index: turns.length, userMessages: [], assistantMessages: [], origin }
      current.userMessages.push(content)
    } else {
      if (!current) current = { index: turns.length, userMessages: [], assistantMessages: [], origin }
      current.assistantMessages.push(content)
    }
  }
  if (current && current.userMessages.length > 0) turns.push(current)
  return turns
}

/**
 * Codex rollout jsonl：`{type, payload}` 记录流。
 *
 * - `event_msg/task_started` / `task_complete` 划轮边界
 * - `response_item/message` 的 `payload.role` 为 user/assistant（developer 是系统指令，跳过）
 * - 文本块是 `input_text` / `output_text`
 */
export function parseCodexSession(text: string, origin: string): ConversationTurn[] {
  const turns: ConversationTurn[] = []
  let current: ConversationTurn | null = null
  const flush = () => {
    if (current && (current.userMessages.length > 0 || current.assistantMessages.length > 0)) turns.push(current)
    current = null
  }
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    let record: { type?: string; payload?: Record<string, unknown> }
    try {
      record = JSON.parse(line) as typeof record
    } catch {
      continue
    }
    const type = record.type ?? ''
    const payload = record.payload
    if (type === 'event_msg') {
      const kind = String(payload?.type ?? '')
      if (kind === 'task_started') flush()
      else if (kind === 'task_complete') flush()
      continue
    }
    if (type !== 'response_item' || !payload || payload.type !== 'message') continue
    const role = String(payload.role ?? '')
    if (role !== 'user' && role !== 'assistant') continue
    const blocks = Array.isArray(payload.content) ? payload.content : []
    const parts: string[] = []
    for (const block of blocks) {
      if (!block || typeof block !== 'object') continue
      const text2 = (block as { text?: unknown }).text
      if (typeof text2 === 'string' && text2.trim()) parts.push(text2)
    }
    const content = parts.join('\n').trim()
    if (!content) continue
    if (!current) current = { index: turns.length, userMessages: [], assistantMessages: [], origin }
    if (role === 'user') current.userMessages.push(content)
    else current.assistantMessages.push(content)
  }
  flush()
  return turns
}

/** 通用 jsonl：`{role, content}` 或 `{type, message}` */
export function parseGenericJsonl(text: string, origin: string): ConversationTurn[] {
  const turns: ConversationTurn[] = []
  let current: ConversationTurn | null = null
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    let record: Record<string, unknown>
    try {
      record = JSON.parse(line) as Record<string, unknown>
    } catch {
      continue
    }
    const message = record.message as { role?: string; content?: unknown } | undefined
    const role = String(record.role ?? message?.role ?? record.type ?? '')
    const content = textOfContent(record.content ?? message?.content ?? record.text)
    if (!content) continue
    if (role === 'user' || role === 'human') {
      if (current && current.userMessages.length > 0) turns.push(current)
      current = { index: turns.length, userMessages: [content], assistantMessages: [], origin }
    } else if (role === 'assistant' || role === 'ai') {
      if (!current) current = { index: turns.length, userMessages: [], assistantMessages: [], origin }
      current.assistantMessages.push(content)
    }
  }
  if (current && current.userMessages.length > 0) turns.push(current)
  return turns
}

/** 导出的 Markdown 对话：按 `## User` / `## Assistant` 切 */
export function parseMarkdownConversation(text: string, origin: string): ConversationTurn[] {
  const turns: ConversationTurn[] = []
  const blocks = text.split(/^#{1,3}\s*(?:user|human|用户|assistant|ai|助手)\s*$/im)
  const roles = [...text.matchAll(/^#{1,3}\s*(user|human|用户|assistant|ai|助手)\s*$/gim)].map((m) => (m[1] ?? '').toLowerCase())
  let current: ConversationTurn | null = null
  for (let index = 1; index < blocks.length; index++) {
    const role = roles[index - 1] ?? ''
    const body = (blocks[index] ?? '').trim()
    if (!body) continue
    if (/^(user|human|用户)$/.test(role)) {
      if (current !== null && current.userMessages.length > 0) turns.push(current)
      current = { index: turns.length, userMessages: [body], assistantMessages: [], origin }
    } else {
      if (current === null) current = { index: turns.length, userMessages: [], assistantMessages: [], origin }
      current.assistantMessages.push(body)
    }
  }
  if (current !== null && current.userMessages.length > 0) turns.push(current)
  return turns
}

function candidatesToItems(candidates: Candidate[], origin: string, source: ImportItem['source'], offset: number): ImportItem[] {
  return candidates.map((candidate, index) => ({
    key: `${source}:${path.basename(origin)}:${offset + index}`,
    source,
    origin,
    kind: candidate.kind,
    title: clip(candidate.title, 40),
    summary: clip(candidate.summary, 120),
    body: candidate.body,
    entities: candidate.entities ?? [],
    tags: [...(candidate.tags ?? []), 'imported', 'from-conversation'],
    confidence: 'low',
    activation: candidate.activation ?? 'on_demand',
    pii: hasPii(candidate.body),
  }))
}

async function collectSessionFiles(root: string, pattern: (name: string) => boolean, recursive = true): Promise<string[]> {
  const out: string[] = []
  const walk = async (dir: string, depth: number): Promise<void> => {
    if (depth > 3) return
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const abs = path.join(dir, entry.name)
      if (entry.isDirectory() && recursive) await walk(abs, depth + 1)
      else if (entry.isFile() && pattern(entry.name)) out.push(abs)
    }
  }
  await walk(root, 0)
  return out
}

/**
 * 注入式上下文与命令回显。
 *
 * 各 agent 把技能说明、AGENTS.md 指令、环境上下文、shell 命令回显也记成 user 消息。
 * 不滤掉的话，它们会被当成「用户原话」挖成记忆——纯噪声。所有会话来源共用。
 */
const INJECTED_USER_NOISE: RegExp[] = [
  /^\s*#\s*AGENTS\.md instructions\b/i,
  /^\s*<INSTRUCTIONS>/,
  /^\s*<(environment_context|user_instructions|system-reminder|command-name|command-message|command-args|local-command|recommended_plugins)/i,
  /^\s*Base directory for this skill\b/i,
  /^\s*The following is the \w+ agent history\b/i,
  /^\s*This session is being continued from a\b/i,
  /^\s*(?:!\s*)?(?:\/bin\/(?:ba)?sh|\/usr\/bin\/env)\b/,
]

function isInjectedNoise(text: string): boolean {
  const head = text.slice(0, 400)
  return INJECTED_USER_NOISE.some((rx) => rx.test(head))
}

export function mineTurns(turns: ConversationTurn[], options: ScanOptions): ImportItem[] {
  const maxTurns = options.maxTurns ?? 200
  const items: ImportItem[] = []
  for (const turn of turns.slice(0, maxTurns)) {
    if (items.length >= options.limit) break
    const users = turn.userMessages.filter((message) => !isInjectedNoise(message))
    if (users.length === 0) continue
    const candidates = extractFromTurn({ userMessages: users })
    items.push(...candidatesToItems(candidates, turn.origin, 'dsh-sessions', items.length))
  }
  return items.slice(0, options.limit)
}

// ---------------------------------------------------------------------------
// 来源描述符
// ---------------------------------------------------------------------------

const dshSessions: SourceDescriptor = {
  id: 'dsh-sessions',
  label: 'dsh 历史会话（session.v4.jsonl.zstd）',
  kind: 'conversation',
  async detect() {
    const root = path.join(homedir(), '.dsh', 'sessions')
    const files = await collectSessionFiles(root, (name) => name.toLowerCase().startsWith('session') && (hasExtension(name, '.zstd') || hasExtension(name, '.jsonl')))
    return files.length > 0 ? [root] : []
  },
  async scan(_cwd, options) {
    const root = path.join(homedir(), '.dsh', 'sessions')
    const files = await collectSessionFiles(root, (name) => name.toLowerCase().startsWith('session') && (hasExtension(name, '.zstd') || hasExtension(name, '.jsonl')))
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    for (const abs of files) {
      if (items.length >= options.limit) break
      const text = await readMaybeZstd(abs)
      if (!text) {
        skipped.push({ origin: abs, reason: 'unreadable' })
        continue
      }
      const turns = parseDshSession(text, abs)
      const mined = mineTurns(turns, { ...options, limit: options.limit - items.length, maxTurns: options.maxTurns })
      for (const entry of mined) items.push({ ...entry, key: `dsh-sessions:${path.basename(path.dirname(abs))}:${items.length}` })
    }
    return { items, skipped }
  },
}

const claudeSessions: SourceDescriptor = {
  id: 'claude-code-sessions',
  label: 'Claude Code 历史会话（jsonl）',
  kind: 'conversation',
  async detect() {
    const root = path.join(homedir(), '.claude', 'projects')
    const files = await collectSessionFiles(root, (name) => hasExtension(name, '.jsonl'))
    return files.length > 0 ? [root] : []
  },
  async scan(_cwd, options) {
    const root = path.join(homedir(), '.claude', 'projects')
    const files = await collectSessionFiles(root, (name) => hasExtension(name, '.jsonl'))
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    for (const abs of files) {
      if (items.length >= options.limit) break
      const text = await readMaybeZstd(abs)
      if (!text) {
        skipped.push({ origin: abs, reason: 'unreadable' })
        continue
      }
      const turns = parseClaudeSession(text, abs)
      for (const entry of mineTurns(turns, { ...options, limit: options.limit - items.length, maxTurns: options.maxTurns })) {
        items.push({ ...entry, source: 'claude-code-sessions', key: `claude-code-sessions:${path.basename(abs)}:${items.length}` })
      }
    }
    return { items, skipped }
  },
}

const codexSessions: SourceDescriptor = {
  id: 'codex-sessions',
  label: 'Codex 历史会话（rollout jsonl）',
  kind: 'conversation',
  async detect() {
    const roots = [path.join(homedir(), '.codex', 'sessions'), path.join(homedir(), '.codex', 'archived_sessions')]
    const found: string[] = []
    for (const root of roots) {
      if ((await collectCodexFiles([root])).length > 0) found.push(root)
    }
    return found
  },
  async scan(_cwd, options) {
    const roots = [path.join(homedir(), '.codex', 'sessions'), path.join(homedir(), '.codex', 'archived_sessions')]
    const files = await collectCodexFiles(roots)
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    for (const abs of files) {
      if (items.length >= options.limit) break
      const text = await readMaybeZstd(abs)
      if (!text) {
        skipped.push({ origin: abs, reason: 'unreadable' })
        continue
      }
      const turns = parseCodexSession(text, abs)
      for (const entry of mineTurns(turns, { ...options, limit: options.limit - items.length, maxTurns: options.maxTurns })) {
        items.push({ ...entry, source: 'codex-sessions', key: `codex-sessions:${path.basename(abs)}:${items.length}` })
      }
    }
    return { items, skipped }
  },
}

/** Codex 的会话日志：活跃 sessions/ 与归档 archived_sessions/，含 .jsonl.zst 压缩归档 */
async function collectCodexFiles(roots: string[]): Promise<string[]> {
  const out: string[] = []
  for (const root of roots) {
    out.push(
      ...(await collectSessionFiles(
        root,
        (name) =>
          name.toLowerCase().startsWith('rollout-') &&
          (hasExtension(name, '.jsonl') || hasExtension(name, '.jsonl.zst') || hasExtension(name, '.zst')),
      )),
    )
  }
  return out
}

const qoderSessions: SourceDescriptor = {
  id: 'qoder-sessions',
  label: 'Qoder 历史会话（jsonl）',
  kind: 'conversation',
  async detect() {
    const files = await collectQoderSessionFiles()
    return files.length > 0 ? [path.join(homedir(), '.qoder', 'projects')] : []
  },
  async scan(_cwd, options) {
    const files = await collectQoderSessionFiles()
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    for (const abs of files) {
      if (items.length >= options.limit) break
      const text = await readMaybeZstd(abs)
      if (!text) {
        skipped.push({ origin: abs, reason: 'unreadable' })
        continue
      }
      const turns = parseClaudeSession(text, abs)
      for (const entry of mineTurns(turns, { ...options, limit: options.limit - items.length, maxTurns: options.maxTurns })) {
        items.push({ ...entry, source: 'qoder-sessions', key: `qoder-sessions:${path.basename(abs)}:${items.length}` })
      }
    }
    return { items, skipped }
  },
}

/** Qoder 会话：`~/.qoder/projects/<slug>/<uuid>.jsonl`；subagents/ 子目录是派生记录，跳过 */
async function collectQoderSessionFiles(): Promise<string[]> {
  const root = path.join(homedir(), '.qoder', 'projects')
  if (!(await isDir(root))) return []
  const out: string[] = []
  try {
    for (const entry of await readdir(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const projectDir = path.join(root, entry.name)
      let files
      try {
        files = await readdir(projectDir, { withFileTypes: true })
      } catch {
        continue
      }
      for (const file of files.sort((a, b) => (a.name < b.name ? -1 : 1))) {
        if (!file.isFile() || !hasExtension(file.name, '.jsonl')) continue
        out.push(path.join(projectDir, file.name))
      }
    }
  } catch {
    return []
  }
  return out
}

const genericConversation = (id: 'generic-jsonl' | 'generic-markdown', label: string): SourceDescriptor => ({
  id,
  label,
  kind: 'conversation',
  async detect() {
    return []
  },
  async scan(_cwd, options) {
    if (!options.path) return { items: [], skipped: [{ origin: '(none)', reason: '需要指定 path' }] }
    const abs = path.resolve(expandUserPath(options.path))
    const text = await readMaybeZstd(abs)
    if (!text) return { items: [], skipped: [{ origin: abs, reason: 'unreadable' }] }
    const isJsonl = hasExtension(abs, '.jsonl') || hasExtension(abs, '.json')
    const turns = id === 'generic-jsonl' || isJsonl ? parseGenericJsonl(text, abs) : parseMarkdownConversation(text, abs)
    const items = mineTurns(turns, options).map((entry, index) => ({ ...entry, source: id, key: `${id}:${path.basename(abs)}:${index}` }))
    return { items, skipped: [] }
  },
})

export const CONVERSATION_SOURCES: SourceDescriptor[] = [
  dshSessions,
  claudeSessions,
  codexSessions,
  qoderSessions,
  genericConversation('generic-jsonl', '通用 jsonl 对话'),
  genericConversation('generic-markdown', '导出的 Markdown 对话'),
]
