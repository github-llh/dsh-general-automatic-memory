import { cp, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { isoNow, ulid } from './model.js'
import { resolveInRoot } from './files.js'
import { DIRS } from './paths.js'

/**
 * 快照：导入、批量操作、固化之前的安全网。
 *
 * 只拷**真相源与派生聚合**，不拷 `.cache/`（可重建）、`snapshots/`（自身）、`sync/`（同步状态）。
 * 恢复本身也要先做一次快照 —— 回滚必须可撤销。
 */
export interface SnapshotInfo {
  label: string
  createdAt: string
  files: number
  bytes: number
}

const EXCLUDE = new Set([DIRS.cache, 'snapshots', DIRS.sync])

export async function createSnapshot(root: string, label: string): Promise<SnapshotInfo> {
  const id = `${isoNow().replace(/[:.]/g, '-')}__${label}-${ulid().slice(-4).toLowerCase()}`
  const target = resolveInRoot(root, path.posix.join('snapshots', id))
  await mkdir(target, { recursive: true })

  let files = 0
  let bytes = 0
  const manifest: string[] = []
  const walk = async (absDir: string, relDir: string): Promise<void> => {
    let entries
    try {
      entries = await readdir(absDir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (EXCLUDE.has(entry.name)) continue
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name
      const abs = path.join(absDir, entry.name)
      if (entry.isDirectory()) {
        if (rel.split('/')[0] === 'snapshots') continue
        await walk(abs, rel)
        continue
      }
      const info = await stat(abs)
      const content = await readFile(abs)
      files++
      bytes += info.size
      manifest.push(JSON.stringify({ path: rel, size: info.size, sha256: createHash('sha256').update(content).digest('hex') }))
      const dest = path.join(target, rel)
      await mkdir(path.dirname(dest), { recursive: true })
      await cp(abs, dest)
    }
  }
  await walk(root, '')
  await writeFile(
    path.join(target, 'snapshot.json'),
    `${JSON.stringify({ label, createdAt: isoNow(), files, bytes, root }, null, 2)}\n`,
    'utf8',
  )
  await writeFile(path.join(target, 'manifest.jsonl'), `${manifest.join('\n')}\n`, 'utf8')
  return { label: id, createdAt: isoNow(), files, bytes }
}

export async function listSnapshots(root: string): Promise<SnapshotInfo[]> {
  const dir = path.join(root, 'snapshots')
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const out: SnapshotInfo[] = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    try {
      const meta = JSON.parse(await readFile(path.join(dir, entry.name, 'snapshot.json'), 'utf8')) as SnapshotInfo & { files?: number; bytes?: number }
      out.push({ label: entry.name, createdAt: meta.createdAt ?? '', files: meta.files ?? 0, bytes: meta.bytes ?? 0 })
    } catch {
      // 不完整的快照目录直接跳过
    }
  }
  return out.sort((a, b) => (a.label < b.label ? 1 : -1))
}

export interface SnapshotDiff {
  added: string[]
  removed: string[]
  changed: string[]
}

interface ManifestEntry {
  path: string
  size: number
  sha256?: string
}

async function readManifest(root: string, label: string): Promise<Map<string, ManifestEntry>> {
  const text = await readFile(path.join(root, 'snapshots', label, 'manifest.jsonl'), 'utf8').catch(() => '')
  const map = new Map<string, ManifestEntry>()
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    try {
      const entry = JSON.parse(line) as ManifestEntry
      if (entry.path) map.set(entry.path, entry)
    } catch {
      // 坏的 manifest 行跳过
    }
  }
  return map
}

/** 比对两个快照：只给出路径级结论，正文 diff 交给面板按需读取 */
export async function diffSnapshots(root: string, a: string, b: string): Promise<SnapshotDiff> {
  const left = await readManifest(root, a)
  const right = await readManifest(root, b)
  const added: string[] = []
  const removed: string[] = []
  const changed: string[] = []
  for (const [rel, entry] of right) {
    const before = left.get(rel)
    if (!before) added.push(rel)
    else if (before.sha256 && entry.sha256 ? before.sha256 !== entry.sha256 : before.size !== entry.size) changed.push(rel)
  }
  for (const rel of left.keys()) if (!right.has(rel)) removed.push(rel)
  return { added: added.sort(), removed: removed.sort(), changed: changed.sort() }
}

/**
 * 回滚。默认全量；传 paths 只回滚指定文件。
 * **回滚前先给当前状态做一次快照** —— 回滚本身必须可撤销。
 */
export async function restoreSnapshot(
  root: string,
  label: string,
  paths?: string[],
): Promise<{ restored: number; preSnapshot: string }> {
  const pre = await createSnapshot(root, 'pre-restore')
  const manifest = await readManifest(root, label)
  const selected = paths && paths.length > 0 ? paths.filter((rel) => manifest.has(rel)) : [...manifest.keys()]
  let restored = 0
  for (const rel of selected) {
    if (rel.split('/')[0] === 'snapshots') continue
    const from = path.join(root, 'snapshots', label, rel)
    const to = resolveInRoot(root, rel)
    try {
      await mkdir(path.dirname(to), { recursive: true })
      await cp(from, to)
      restored++
    } catch {
      // 快照里缺这个文件就跳过；不回滚半截数据
    }
  }
  return { restored, preSnapshot: pre.label }
}
