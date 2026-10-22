import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { resolveInRoot } from './files.js'
import { isoNow, type Entry } from './model.js'
import { DIRS } from './paths.js'

const BEGIN = '<!-- BEGIN dsh-general-automatic-memory (managed, do not edit) -->'
const END = '<!-- END dsh-general-automatic-memory -->'

/**
 * 单向投影。
 *
 * 定位上这是**可选的低优先级互操作出口**（默认关闭），不是核心卖点：
 * 本插件的价值在"导入进来"，不是"共享出去"。
 *
 * 三条硬规则：
 * 1. 只写受管区块，区块外字节原样保留（用户手写内容绝不动）
 * 2. 幂等：内容没变就一个字节都不写（否则 mtime 抖动会让 watcher/同步误判）
 * 3. 不带时间戳（会破坏幂等与 diff 可读性）
 */
export interface ProjectionResult {
  target: string
  path: string
  bytes: number
  changed: boolean
}

export interface ProjectionTarget {
  id: string
  label: string
  /** 绝对路径；`{cwd}` 会被替换 */
  path: string
  render(entries: Entry[]): string
}

export function projectionTargets(cwd: string): ProjectionTarget[] {
  const home = homedir()
  return [
    {
      id: 'agentsMdPointer',
      label: '~/.agents/AGENTS.md（只放指针）',
      path: path.join(home, '.agents', 'AGENTS.md'),
      render: () => `记忆索引见 ~/.dsh/memory/INDEX.md。需要时用 memory_recall 检索、memory_read 读全文。`,
    },
    {
      id: 'claudeMd',
      label: '~/.claude/CLAUDE.md',
      path: path.join(home, '.claude', 'CLAUDE.md'),
      render: (entries) => renderProfileBlock(entries),
    },
    {
      id: 'geminiMd',
      label: '~/.gemini/GEMINI.md',
      path: path.join(home, '.gemini', 'GEMINI.md'),
      render: (entries) => renderProfileBlock(entries).slice(0, 1000),
    },
    {
      id: 'projectAgentsMd',
      label: '仓库根 AGENTS.md',
      path: path.join(cwd, 'AGENTS.md'),
      render: (entries) => renderProjectBlock(entries),
    },
    {
      id: 'cursorRules',
      label: '.cursor/rules/gam-memory.mdc',
      path: path.join(cwd, '.cursor', 'rules', 'gam-memory.mdc'),
      render: (entries) => `---\ndescription: Long-term memory (managed by dsh-general-automatic-memory)\nalwaysApply: false\n---\n\n${renderProjectBlock(entries)}`,
    },
    {
      id: 'windsurfRules',
      label: '.windsurf/rules/gam-memory.md',
      path: path.join(cwd, '.windsurf', 'rules', 'gam-memory.md'),
      render: (entries) => `---\ntrigger: model_decision\ndescription: Long-term memory (managed by dsh-general-automatic-memory)\n---\n\n${renderProjectBlock(entries)}`,
    },
    {
      id: 'copilotInstructions',
      label: '.github/copilot-instructions.md',
      path: path.join(cwd, '.github', 'copilot-instructions.md'),
      render: (entries) => renderProjectBlock(entries),
    },
  ]
}

function renderProfileBlock(entries: Entry[]): string {
  const pick = (kind: string) =>
    entries.filter((entry) => entry.meta.kind === kind && entry.meta.activation === 'always' && entry.meta.temporal.invalidatedAt === null)
  const lines: string[] = ['## 关于用户', ...pick('persona').map((entry) => `- ${entry.meta.title}：${entry.meta.summary}`)]
  const feedback = pick('feedback')
  if (feedback.length > 0) lines.push('', '## 协作纪律', ...feedback.map((entry) => `- ${entry.meta.title}：${entry.meta.summary}`))
  return lines.join('\n')
}

function renderProjectBlock(entries: Entry[]): string {
  const project = entries.filter(
    (entry) => entry.meta.kind === 'project' && entry.meta.temporal.invalidatedAt === null && entry.meta.scope === 'global',
  )
  const top = project.slice(0, 20)
  if (top.length === 0) return '(no project memories yet)'
  return ['## 项目记忆', ...top.map((entry) => `- ${entry.meta.title}：${entry.meta.summary}`)].join('\n')
}

/** 把内容写进受管区块；没有区块就在文末追加，绝不覆盖用户内容 */
export function mergeManagedBlock(existing: string, content: string): string {
  const block = `${BEGIN}\n${content.trim()}\n${END}`
  const start = existing.indexOf(BEGIN)
  const end = existing.indexOf(END)
  if (start >= 0 && end > start) {
    return `${existing.slice(0, start)}${block}${existing.slice(end + END.length)}`
  }
  const prefix = existing.trimEnd()
  return prefix.length > 0 ? `${prefix}\n\n${block}\n` : `${block}\n`
}

export async function applyProjection(target: ProjectionTarget, entries: Entry[]): Promise<ProjectionResult> {
  const existing = await readFile(target.path, 'utf8').catch(() => '')
  const next = mergeManagedBlock(existing, target.render(entries))
  if (next === existing) return { target: target.id, path: target.path, bytes: Buffer.byteLength(next), changed: false }
  await mkdir(path.dirname(target.path), { recursive: true })
  await writeFile(target.path, next, 'utf8')
  return { target: target.id, path: target.path, bytes: Buffer.byteLength(next), changed: true }
}

// ---------------------------------------------------------------------------
// zip 导入导出
// ---------------------------------------------------------------------------

export interface ExportResult {
  path: string
  bytes: number
  files: number
  excluded: number
}

/**
 * 导出 `.gam.zip`：真相源 + 派生聚合，**不含** `.cache/`、`snapshots/`、`sync/`。
 * 默认排除 PII 与 shareable:none 的条目（隐私默认值，见 docs/09）。
 */
export async function exportZip(root: string, opts: { includePii?: boolean } = {}): Promise<ExportResult> {
  const files: Record<string, Uint8Array> = {}
  let count = 0
  let excluded = 0
  const walk = async (absDir: string, relDir: string): Promise<void> => {
    let entries
    try {
      entries = await readdir(absDir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name
      const top = rel.split('/')[0]
      if (top === DIRS.cache || top === 'snapshots' || top === DIRS.sync || top === 'exports') continue
      const abs = path.join(absDir, entry.name)
      if (entry.isDirectory()) {
        await walk(abs, rel)
        continue
      }
      if (!entry.name.endsWith('.md') && !entry.name.endsWith('.jsonl') && !entry.name.endsWith('.yaml')) continue
      const content = await readFile(abs, 'utf8')
      // 导出是本机备份，不是团队同步 —— 只排除 PII；`shareable:none` 是团队同步的开关
      if (!opts.includePii && /pii:\s*true/.test(content)) {
        excluded++
        continue
      }
      files[`memory/${rel}`] = strToU8(content)
      count++
    }
  }
  await walk(root, '')

  const header = {
    formatVersion: 1,
    exportedAt: isoNow(),
    plugin: 'dsh-general-automatic-memory',
    files: count,
    excluded,
    note: 'Truth source only. .cache/ is always rebuildable and never exported.',
  }
  files['gam.json'] = strToU8(`${JSON.stringify(header, null, 2)}\n`)

  const zipped = zipSync(files, { level: 6 })
  const outDir = path.join(root, 'exports')
  await mkdir(outDir, { recursive: true })
  const outPath = path.join(outDir, `gam-${isoNow().replace(/[:.]/g, '-')}.zip`)
  await writeFile(outPath, zipped)
  return { path: outPath, bytes: zipped.byteLength, files: count, excluded }
}

export interface ZipImportResult {
  restored: number
  skipped: number
  preSnapshot?: string
}

/** 导入 zip：**不覆盖**已存在的文件（冲突留给导入器按条目决策，避免静默盖掉较新的记忆） */
export async function importZip(root: string, zipPath: string): Promise<ZipImportResult> {
  const buffer = await readFile(path.resolve(zipPath.replace(/^~(?=\/|$)/, homedir())))
  const unzipped = unzipSync(new Uint8Array(buffer))
  let restored = 0
  let skipped = 0
  for (const [name, bytes] of Object.entries(unzipped)) {
    if (!name.startsWith('memory/')) continue
    const rel = name.slice('memory/'.length)
    if (rel.split('/')[0] === 'snapshots' || rel.split('/')[0] === DIRS.cache) continue
    const abs = resolveInRoot(root, rel)
    const exists = await readFile(abs).then(
      () => true,
      () => false,
    )
    if (exists) {
      skipped++
      continue
    }
    await mkdir(path.dirname(abs), { recursive: true })
    await writeFile(abs, strFromU8(bytes), 'utf8')
    restored++
  }
  return { restored, skipped }
}
