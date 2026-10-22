import path from 'node:path'
import { appendLine, resolveInRoot } from './files.js'
import { isoNow } from './model.js'
import { DIRS } from './paths.js'

/**
 * 每一次读写都留痕。审计本身**不含记忆正文**（只含 id 与字节数），
 * 否则审计就成了第二份隐私副本。
 */
export const AUDIT_ACTS = [
  'read',
  'write',
  'update',
  'invalidate',
  'delete',
  'restore',
  'import',
  'export',
  'consolidate',
  'archive',
  'sync-push',
  'sync-pull',
  'sync-conflict',
  'repair',
  'gate-drop',
  'deny',
] as const
export type AuditAct = (typeof AUDIT_ACTS)[number]

export interface AuditRecord {
  actor: string
  act: AuditAct
  [key: string]: unknown
}

export async function audit(root: string, record: AuditRecord, now: string = isoNow()): Promise<void> {
  const file = path.posix.join(DIRS.audit, `${now.slice(0, 10)}.jsonl`)
  const line = JSON.stringify({ ts: now, ...record })
  await appendLine(resolveInRoot(root, file), line)
}

/**
 * 面板按用户本地日期查审计，审计文件按 UTC 日期命名。
 * 这里把「本地日 + 时区偏移」换算成 UTC 区间，并指出要读哪几个 UTC 日文件。
 * `tzOffset` 是“东几区”的分钟数（东八区 = 480）。
 */
export function utcDayFilesForLocalDate(date: string, tzOffset: number): { start: number; end: number; files: string[] } {
  const [year, month, day] = date.split('-').map((part) => Number(part)) as [number, number, number]
  const start = Date.UTC(year, month - 1, day) - tzOffset * 60_000
  const end = start + 86_400_000
  const files = [...new Set([new Date(start).toISOString().slice(0, 10), new Date(end - 1).toISOString().slice(0, 10)])]
  return { start, end, files }
}
