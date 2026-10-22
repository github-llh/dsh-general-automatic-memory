import { createHash } from 'node:crypto'
import { homedir } from 'node:os'
import path from 'node:path'

/**
 * 记忆根：**dsh 专属**，默认落在 `$DSH_HOME/memory`（即 `~/.dsh/memory`）。
 *
 * 这个插件不是"给所有 agent 共用的记忆服务"——它是一个 dsh 插件，数据、面板、
 * 管理全部归 dsh。与其他工具的唯一关系是**导入**：把它们的记忆文件与会话读进来。
 * 所以默认位置跟随 dsh 自己的家目录，而不是 `~/.agents` 那个共享根。
 *
 * 需要让别的工具直接读这份记忆时，把 `memoryRoot` 指到 `~/.agents/memory` 即可——
 * 这是显式选择，不是默认行为。
 */
export function resolveDshHome(): string {
  const fromEnv = process.env.DSH_HOME
  if (fromEnv && fromEnv.trim().length > 0) return expandUserPath(fromEnv.trim())
  return path.join(homedir(), '.dsh')
}

export function resolveMemoryRoot(configured: string | undefined): string {
  const explicit = configured?.trim() || process.env.DSH_MEMORY_ROOT?.trim()
  if (explicit) return path.resolve(expandUserPath(explicit))
  return path.join(resolveDshHome(), 'memory')
}

/** 展开 `~` / `~/` / `~\`。Windows 用户习惯输反斜杠，不能当成普通字符。 */
export function expandUserPath(p: string): string {
  if (p === '~' || p === '~/' || p === '~\\') return homedir()
  if (p.startsWith('~/') || p.startsWith('~\\')) return path.join(homedir(), p.slice(2))
  return p
}

/**
 * 桌面应用的数据目录（Electron app.getPath('userData')）：
 * macOS `~/Library/Application Support/<name>`，Windows `%APPDATA%/<name>`，
 * Linux `~/.config/<name>`。CherryStudio 等桌面端的记忆与会话都在这儿。
 */
export function appDataDir(name: string): string {
  if (process.platform === 'win32') {
    const base = process.env.APPDATA ?? path.join(homedir(), 'AppData', 'Roaming')
    return path.join(base, name)
  }
  if (process.platform === 'darwin') return path.join(homedir(), 'Library', 'Application Support', name)
  return path.join(homedir(), '.config', name)
}

/** 真相源与派生物（docs/03 §3）。`.cache` 永不参与同步，随时可删。 */
export const DIRS = {
  persona: 'persona',
  preference: 'preference',
  feedback: 'feedback',
  relations: 'relations',
  reference: 'reference',
  procedures: 'procedures',
  project: 'project',
  projects: 'projects',
  archive: 'archive',
  audit: 'audit',
  snapshots: 'snapshots',
  sync: 'sync',
  cache: '.cache',
} as const

export const DERIVED_FILES = ['INDEX.md', 'persona/PROFILE.md', 'relations/GENEALOGY.md', 'relations/graph.jsonl'] as const

/** 扫描条目时要走的目录（相对 root）；`{slug}` 由调用方展开 */
export const ENTRY_DIRS = [
  DIRS.persona,
  DIRS.preference,
  DIRS.feedback,
  DIRS.relations,
  DIRS.reference,
  DIRS.procedures,
  DIRS.project,
] as const

export const MANIFEST_NAME = 'MANIFEST.yaml'
export const SCHEMA_VERSION = 1

/**
 * 项目 slug = 哈希前缀 + 人类可读尾巴。
 *
 * 刻意**不复用** dsh 的会话目录编码（`--<cwd 里 / 换成 ->--`），也不复用前作记忆插件的
 * 编码（`---Users-…--`，前导 3 个 dash）。那两套互不兼容，混用会导致导入错位。
 * 哈希前缀保证唯一与稳定，尾巴保证 `ls` 可读。
 */
export function projectSlug(absolutePath: string): string {
  const normalized = path.resolve(absolutePath)
  // Windows 默认大小写不敏感：同一目录的不同大小写必须得到同一 slug。
  const hashInput = process.platform === 'win32' ? normalized.toLowerCase() : normalized
  const hash = createHash('sha256').update(hashInput).digest('base64url').slice(0, 12)
  const tail = path
    .basename(normalized)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)
  return tail ? `${hash}-${tail}` : hash
}

export function toPosix(p: string): string {
  return p.split(path.sep).join('/')
}
