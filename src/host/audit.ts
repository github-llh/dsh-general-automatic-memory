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
