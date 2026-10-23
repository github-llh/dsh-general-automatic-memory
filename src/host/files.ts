import { open, mkdir, readFile, readdir, rename, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { toPosix } from './paths.js'

export class PathEscapeError extends Error {
  constructor(rel: string) {
    super(`path escapes the memory root: ${rel}`)
    this.name = 'PathEscapeError'
  }
}

/**
 * 把相对路径解析到 root 内，拒绝任何逃逸。
 *
 * dsh 的 Host 插件代码在进程内运行、**不受 workspace sandbox 约束**
 * （`dsh-plugin-manager/README.md`: "installed Host code executes in-process outside the
 * workspace sandbox"），所以边界必须我们自己守。面板路由与工具入参都先过这里。
 */
export function resolveInRoot(root: string, rel: string): string {
  const rootAbs = path.resolve(root)
  // 绝对路径也接受，但必须落在 root 内（面板传来的可能是完整路径）
  const abs = path.isAbsolute(rel) ? path.resolve(rel) : path.resolve(rootAbs, toPosix(rel).replace(/^\/+/, ''))
  const rootWithSep = rootAbs.endsWith(path.sep) ? rootAbs : rootAbs + path.sep
  // Windows/macOS 默认大小写不敏感：`C:\Root` 与 `c:\root\...` 是同一路径。
  const same = process.platform === 'win32' || process.platform === 'darwin'
  const inside = same
    ? abs.toLowerCase() === rootAbs.toLowerCase() || abs.toLowerCase().startsWith(rootWithSep.toLowerCase())
    : abs === rootAbs || abs.startsWith(rootWithSep)
  if (!inside) throw new PathEscapeError(rel)
  return abs
}

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true, mode: 0o700 })
}

/** 大小写不敏感的扩展名判断：Windows/macOS 上 `.MD` 与 `.md` 是同一类文件。 */
export function hasExtension(name: string, ext: string): boolean {
  return name.toLowerCase().endsWith(ext.toLowerCase())
}

/**
 * 原子写：临时文件 → rename（→ 可选 fsync）。
 *
 * `durable` 只对**真相源**开：条目正文与审计流水值得为每次写入付 fsync 的代价。
 * 派生文件（INDEX.md / PROFILE.md / graph.jsonl）是可再生产物，删了下次 refresh
 * 就重建，用 `durable: false`：rename 依然保证读者永远看到完整旧版或完整新版，
 * 但不必把磁盘同步成本摊到每一次记忆写入上——Windows 上一次 fsync 就是几十毫秒，
 * 而每次 create 会重写两个派生文件，这就是 CI 超时的主要来源。
 */
export async function writeFileAtomic(abs: string, data: string, opts: { durable?: boolean } = {}): Promise<void> {
  await ensureDir(path.dirname(abs))
  const tmp = `${abs}.tmp.${process.pid}.${Date.now().toString(36)}`
  let handle
  try {
    handle = await open(tmp, 'w', 0o600)
    await handle.writeFile(data, 'utf8')
    if (opts.durable !== false) await handle.sync()
  } finally {
    await handle?.close()
  }
  try {
    await rename(tmp, abs)
  } catch (cause) {
    await rm(tmp, { force: true })
    throw cause
  }
  if (opts.durable === false) return
  let dir
  try {
    dir = await open(path.dirname(abs), 'r')
    await dir.sync()
  } catch {
    // 某些文件系统不允许打开目录做 fsync；rename 本身已原子，忽略即可
  } finally {
    await dir?.close()
  }
}

export async function readTextFile(abs: string): Promise<string | null> {
  try {
    return await readFile(abs, 'utf8')
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw cause
  }
}

export async function appendLine(abs: string, line: string): Promise<void> {
  await ensureDir(path.dirname(abs))
  let handle
  try {
    handle = await open(abs, 'a', 0o600)
    await handle.writeFile(line.endsWith('\n') ? line : `${line}\n`, 'utf8')
    await handle.sync()
  } finally {
    await handle?.close()
  }
}

/** 递归收集 .md 文件的相对路径，返回结果按字典序排序（确定性，原则 P4）。 */
export async function walkMarkdown(root: string, dirs: readonly string[]): Promise<string[]> {
  const out: string[] = []
  for (const dir of dirs) {
    const abs = path.join(root, dir)
    if (!(await isDirectory(abs))) continue
    await walk(abs, root, out)
  }
  return out.sort()
}

async function walk(abs: string, root: string, out: string[]): Promise<void> {
  let entries
  try {
    entries = await readdir(abs, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const child = path.join(abs, entry.name)
    if (entry.isDirectory()) {
      await walk(child, root, out)
    } else if (entry.isFile() && hasExtension(entry.name, '.md') && !hasExtension(entry.name, '.tmp')) {
      out.push(toPosix(path.relative(root, child)))
    }
  }
}

async function isDirectory(abs: string): Promise<boolean> {
  try {
    return (await stat(abs)).isDirectory()
  } catch {
    return false
  }
}

/** 列出 root 下的直接子目录名（用于发现 projects/<slug>）。 */
export async function listSubdirs(abs: string): Promise<string[]> {
  try {
    const entries = await readdir(abs, { withFileTypes: true })
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  } catch {
    return []
  }
}
