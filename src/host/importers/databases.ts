import { DatabaseSync } from 'node:sqlite'
import { stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { appDataDir } from '../paths.js'
import type { ImportItem, ScanOptions, SkippedFile, SourceDescriptor } from './types.js'
import { classify, clip, makeImportItem } from './types.js'
import { mineTurns, type ConversationTurn } from './conversation.js'

/**
 * 用 SQLite 存记忆/会话的桌面端与 CLI。
 *
 * Node 24 内置 `node:sqlite`（dsh 宿主就是 Node 24），不引原生依赖。
 * 一律**只读打开**：别的应用可能正持有 WAL，写连接会直接冲突。
 * 任何失败（库不存在、被锁、schema 变了）都静默返回空——导入器永远不该
 * 因为第三方工具的私库打不开而崩。
 */

interface Row {
  [key: string]: unknown
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/** 只读查询；失败返回 null（调用方按“没有数据”处理） */
function readRows(abs: string, sql: string): Row[] | null {
  let db: DatabaseSync | null = null
  try {
    db = new DatabaseSync(abs, { readOnly: true })
    return db.prepare(sql).all() as Row[]
  } catch {
    return null
  } finally {
    try {
      db?.close()
    } catch {
      // 关失败也无所谓：只读连接不留锁
    }
  }
}

async function exists(abs: string): Promise<boolean> {
  try {
    await stat(abs)
    return true
  } catch {
    return false
  }
}

function textOfBlocks(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  const parts: string[] = []
  for (const block of content) {
    if (typeof block === 'string') parts.push(block)
    else if (block && typeof block === 'object') {
      const text = (block as { text?: unknown }).text
      if (typeof text === 'string') parts.push(text)
    }
  }
  return parts.join('\n').trim()
}

/**
 * 解包消息正文：有的工具存纯文本，有的套一层 JSON（{message:{content}}）。
 * 解不出来就原样返回——调用方按空处理，不会把 JSON 噪声当记忆。
 */
function unwrapText(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return trimmed
  try {
    const parsed = JSON.parse(trimmed) as { message?: { content?: unknown }; content?: unknown; text?: unknown }
    const inner = parsed.message?.content ?? parsed.content ?? parsed.text
    if (inner === undefined) return ''
    return textOfBlocks(inner)
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// OpenCode（SST 的开源 CLI）：~/.local/share/opencode/opencode.db
// session_v2 一行一会话；session_message 的 data 是 JSON（user 有 text，
// assistant 有 content[] 块，其余类型如 idle 忽略）。
// ---------------------------------------------------------------------------

export function parseOpenCodeRows(sessions: Row[], messages: Row[], originPrefix: string): ConversationTurn[] {
  const bySession = new Map<string, ConversationTurn>()
  for (const session of sessions) {
    const id = str(session.id)
    if (!id) continue
    bySession.set(id, { index: 0, userMessages: [], assistantMessages: [], origin: `${originPrefix}#${id}` })
  }
  for (const message of messages) {
    const turn = bySession.get(str(message.session_id))
    if (!turn) continue
    let data: { text?: unknown; content?: unknown } = {}
    try {
      data = JSON.parse(str(message.data)) as typeof data
    } catch {
      continue
    }
    const type = str(message.type)
    if (type === 'user') {
      const text = str(data.text)
      if (text) turn.userMessages.push(text)
    } else if (type === 'assistant') {
      const text = textOfBlocks(data.content)
      if (text) turn.assistantMessages.push(text)
    }
  }
  return [...bySession.values()].filter((turn) => turn.userMessages.length > 0)
}

const opencodeDb = (): string => path.join(homedir(), '.local', 'share', 'opencode', 'opencode.db')

const opencodeSessions: SourceDescriptor = {
  id: 'opencode-sessions',
  label: 'OpenCode 历史会话（sqlite）',
  kind: 'conversation',
  async detect() {
    return (await exists(opencodeDb())) ? [opencodeDb()] : []
  },
  async scan(_cwd, options) {
    const abs = opencodeDb()
    const sessions = readRows(abs, 'select id, title, directory from session_v2')
    const messages = sessions ? readRows(abs, 'select session_id, type, data from session_message order by time_created') : null
    if (!sessions || !messages) return { items: [], skipped: [{ origin: abs, reason: 'unreadable' }] }
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    for (const turn of parseOpenCodeRows(sessions, messages, abs)) {
      if (items.length >= options.limit) break
      const mined = mineTurns([turn], { ...options, limit: options.limit - items.length, maxTurns: options.maxTurns })
      for (const entry of mined) {
        items.push({ ...entry, source: 'opencode-sessions', key: `opencode-sessions:${path.basename(turn.origin)}:${items.length}` })
      }
    }
    return { items, skipped }
  },
}

// ---------------------------------------------------------------------------
// CherryStudio（桌面端 AI 客户端）：<appData>/CherryStudio/Data/Memory/memories.db
// 只有记忆表在 sqlite 里；会话正文存在 IndexedDB，sqlite 中只是块 id，拿不到。
// ---------------------------------------------------------------------------

const cherryMemoriesDb = (): string => path.join(appDataDir('CherryStudio'), 'Data', 'Memory', 'memories.db')

const cherryMemory: SourceDescriptor = {
  id: 'cherry-memory',
  label: 'CherryStudio 记忆（memories.db）',
  kind: 'memory',
  async detect() {
    return (await exists(cherryMemoriesDb())) ? [cherryMemoriesDb()] : []
  },
  async scan(_cwd, options) {
    const abs = cherryMemoriesDb()
    const rows = readRows(abs, 'select id, memory, metadata from memories')
    if (!rows) return { items: [], skipped: [{ origin: abs, reason: 'unreadable' }] }
    return { items: cherryMemoryItems(rows, abs, options.limit), skipped: [] }
  },
}

/** CherryStudio 记忆表 → 条目（纯函数，便于测试） */
export function cherryMemoryItems(rows: Row[], abs: string, limit: number): ImportItem[] {
  const items: ImportItem[] = []
  rows.forEach((row, index) => {
    if (items.length >= limit) return
    const body = unwrapText(str(row.memory))
    if (!body.trim()) return
    const guess = classify(body)
    items.push(
      makeImportItem({
        source: 'cherry-memory',
        origin: `${abs}#${str(row.id)}`,
        index,
        title: clip(body, 40),
        summary: clip(body, 120),
        body,
        kind: guess.kind,
        activation: guess.activation,
        tags: ['imported', 'cherrystudio', ...guess.tags],
      }),
    )
  })
  return items
}

// ---------------------------------------------------------------------------
// OneVium（桌面端 AI 客户端）：~/.onevium/onevium.db
// chat_sessions + messages（user/assistant）+ memories（自带记忆表）
// ---------------------------------------------------------------------------

const oneviumDb = (): string => path.join(homedir(), '.onevium', 'onevium.db')

const onevium: SourceDescriptor = {
  id: 'onevium',
  label: 'OneVium 会话与记忆（onevium.db）',
  kind: 'conversation',
  async detect() {
    return (await exists(oneviumDb())) ? [oneviumDb()] : []
  },
  async scan(_cwd, options) {
    const abs = oneviumDb()
    const sessions = readRows(abs, 'select id, title, working_directory from chat_sessions')
    const messages = sessions ? readRows(abs, 'select session_id, role, content from messages order by created_at') : null
    const memories = readRows(abs, 'select id, content, memory_type, category, tags from memories')
    if (!sessions && !memories) return { items: [], skipped: [{ origin: abs, reason: 'unreadable' }] }
    return { items: oneviumItems(sessions ?? [], messages ?? [], memories ?? [], abs, options), skipped: [] }
  },
}

/** OneVium 的会话（挖掘）+ 自带记忆表（直接导入）→ 条目（纯函数，便于测试） */
export function oneviumItems(sessions: Row[], messages: Row[], memories: Row[], abs: string, options: ScanOptions): ImportItem[] {
  const items: ImportItem[] = []
  const bySession = new Map<string, ConversationTurn>()
  for (const session of sessions) {
    const id = str(session.id)
    if (id) bySession.set(id, { index: 0, userMessages: [], assistantMessages: [], origin: `${abs}#${id}` })
  }
  for (const message of messages) {
    const turn = bySession.get(str(message.session_id))
    if (!turn) continue
    const content = unwrapText(str(message.content))
    if (!content) continue
    if (str(message.role) === 'user') turn.userMessages.push(content)
    else turn.assistantMessages.push(content)
  }
  for (const turn of [...bySession.values()].filter((t) => t.userMessages.length > 0)) {
    if (items.length >= options.limit) break
    const mined = mineTurns([turn], { ...options, limit: options.limit - items.length, maxTurns: options.maxTurns })
    for (const entry of mined) {
      items.push({ ...entry, source: 'onevium', key: `onevium:${path.basename(turn.origin)}:${items.length}` })
    }
  }
  for (const row of memories) {
    if (items.length >= options.limit) break
    const body = unwrapText(str(row.content))
    if (!body.trim()) continue
    const guess = classify(body)
    items.push(
      makeImportItem({
        source: 'onevium',
        origin: `${abs}#memory:${str(row.id)}`,
        index: items.length,
        title: clip(body, 40),
        summary: clip(body, 120),
        body,
        kind: guess.kind,
        activation: guess.activation,
        tags: ['imported', 'onevium', str(row.category)].filter(Boolean),
      }),
    )
  }
  return items
}

export const DATABASE_SOURCES: SourceDescriptor[] = [opencodeSessions, cherryMemory, onevium]
