import { readdir, readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { hasExtension } from '../files.js'
import { expandUserPath } from '../paths.js'
import type { Activation, Kind } from '../model.js'
import {
  classify,
  clip,
  hasPii,
  makeImportItem,
  mapClaudeType,
  readFrontmatter,
  splitSections,
  type ImportItem,
  type ImportSourceId,
  type ScanOptions,
  type SkippedFile,
  type SourceDescriptor,
} from './types.js'

const HOME = () => homedir()

async function exists(target: string): Promise<boolean> {
  try {
    await stat(target)
    return true
  } catch {
    return false
  }
}

async function isDir(target: string): Promise<boolean> {
  try {
    return (await stat(target)).isDirectory()
  } catch {
    return false
  }
}

async function listFiles(dir: string, exts: string[], recursive = false, depth = 0): Promise<string[]> {
  if (depth > 3 || !(await isDir(dir))) return []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const out: string[] = []
  for (const entry of entries.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (recursive) out.push(...(await listFiles(abs, exts, true, depth + 1)))
      continue
    }
    if (exts.some((ext) => hasExtension(entry.name, ext))) out.push(abs)
  }
  return out
}

/** 去掉 Markdown 扩展名（大小写不敏感）用于标题兜底。 */
function baseNoExt(abs: string): string {
  const name = path.basename(abs)
  return name.toLowerCase().endsWith('.md') ? name.slice(0, -3) : name
}

async function readText(abs: string): Promise<string | null> {
  try {
    return await readFile(abs, 'utf8')
  } catch {
    return null
  }
}

/** 一个 Markdown 文件 → 若干条目（按二级标题切分，每节独立成条） */
function fromMarkdownFile(
  source: ImportSourceId,
  origin: string,
  text: string,
  defaults: { kind?: Kind; activation?: Activation; tags?: string[] } = {},
): ImportItem[] {
  const sections = splitSections(text)
  const out: ImportItem[] = []
  sections.forEach((section, index) => {
    const guess = classify(`${section.title}\n${section.body}`)
    out.push(
      makeImportItem({
        source,
        origin,
        index,
        title: section.title || clip(section.body, 40),
        summary: clip(section.body, 120),
        body: section.body,
        kind: defaults.kind ?? guess.kind,
        activation: defaults.activation ?? guess.activation,
        tags: [...(defaults.tags ?? []), ...guess.tags],
      }),
    )
  })
  return out
}

// ---------------------------------------------------------------------------
// 1. Claude Code auto memory（格式与我们的最接近，价值最高）
// ---------------------------------------------------------------------------

/** 自动记忆目录扫描：frontmatter name/description/type 与 Claude Code 同格式 */
async function scanAutoMemoryDirs(
  dirs: string[],
  source: ImportSourceId,
  options: ScanOptions,
): Promise<{ items: ImportItem[]; skipped: SkippedFile[] }> {
  const items: ImportItem[] = []
  const skipped: SkippedFile[] = []
  for (const dir of dirs) {
    for (const abs of await listFiles(dir, ['.md'])) {
      if (path.basename(abs).toLowerCase() === 'memory.md') continue // 索引文件不是记忆本体
      if (items.length >= options.limit) break
      const text = await readText(abs)
      if (!text) continue
      const { data, body } = readFrontmatter(text)
      if (!body.trim()) {
        skipped.push({ origin: abs, reason: 'empty' })
        continue
      }
      const kind = mapClaudeType(data.type)
      items.push(
        makeImportItem({
          source,
          origin: abs,
          index: 0,
          title: String(data.name ?? baseNoExt(abs)),
          summary: String(data.description ?? body),
          body,
          kind,
          activation: kind === 'feedback' ? 'always' : 'on_demand',
          tags: ['imported', ...sourceTags(source)],
          confidence: 'medium',
        }),
      )
    }
  }
  return { items, skipped }
}

function sourceTags(source: ImportSourceId): string[] {
  if (source === 'qoder-memory') return ['qoder']
  return ['claude-code']
}

const claudeCodeMemory: SourceDescriptor = {
  id: 'claude-code-memory',
  label: 'Claude Code auto memory',
  kind: 'memory',
  async detect() {
    return (await listUserProjectDirs('memory')).filter(Boolean)
  },
  async scan(_cwd, options) {
    return scanAutoMemoryDirs(await listUserProjectDirs('memory'), 'claude-code-memory', options)
  },
}

// ---------------------------------------------------------------------------
// 1b. Qoder auto memory（~/.qoder/memory 与各项目 memory/，格式同上）
// ---------------------------------------------------------------------------

/** Qoder 的全局记忆目录 + 每个项目的 memory/ 子目录 */
async function listQoderMemoryDirs(): Promise<string[]> {
  const dirs: string[] = []
  const global = path.join(HOME(), '.qoder', 'memory')
  if (await isDir(global)) dirs.push(global)
  const projects = path.join(HOME(), '.qoder', 'projects')
  if (await isDir(projects)) {
    try {
      for (const entry of await readdir(projects, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        const candidate = path.join(projects, entry.name, 'memory')
        if (await isDir(candidate)) dirs.push(candidate)
      }
    } catch {
      // 目录不可读就当没有
    }
  }
  return dirs
}

const qoderMemory: SourceDescriptor = {
  id: 'qoder-memory',
  label: 'Qoder auto memory',
  kind: 'memory',
  async detect() {
    return listQoderMemoryDirs()
  },
  async scan(_cwd, options) {
    return scanAutoMemoryDirs(await listQoderMemoryDirs(), 'qoder-memory', options)
  },
}

async function listUserProjectDirs(sub: string): Promise<string[]> {
  const root = path.join(HOME(), '.claude', 'projects')
  if (!(await isDir(root))) return []
  const dirs: string[] = []
  try {
    for (const entry of await readdir(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const candidate = path.join(root, entry.name, sub)
      if (await isDir(candidate)) dirs.push(candidate)
    }
  } catch {
    return []
  }
  return dirs
}

// ---------------------------------------------------------------------------
// 2/3. CLAUDE.md 与 AGENTS.md 层级
// ---------------------------------------------------------------------------

/**
 * 规则 / 指导文件来源：候选既可以是单文件（.clinerules、guidelines.md），
 * 也可以是目录（.roo/rules、.kiro/steering、.specstory/history、.continue/rules）。
 */
function rulesSource(
  id: ImportSourceId,
  label: string,
  candidates: (cwd: string) => string[],
  tags: string[],
): SourceDescriptor {
  return {
    id,
    label,
    kind: 'memory',
    async detect(cwd) {
      const found: string[] = []
      for (const candidate of candidates(cwd)) if (await exists(candidate)) found.push(candidate)
      return found
    },
    async scan(cwd, options) {
      const items: ImportItem[] = []
      const skipped: SkippedFile[] = []
      for (const candidate of candidates(cwd)) {
        if (items.length >= options.limit) break
        const files = (await isDir(candidate)) ? await listFiles(candidate, ['.md'], true) : (await exists(candidate) ? [candidate] : [])
        for (const abs of files) {
          if (items.length >= options.limit) break
          const text = await readText(abs)
          if (!text?.trim()) {
            skipped.push({ origin: abs, reason: 'empty' })
            continue
          }
          for (const entry of fromMarkdownFile(id, abs, text, { tags: ['imported', ...tags] })) {
            if (items.length >= options.limit) break
            items.push(entry)
          }
        }
      }
      return { items, skipped }
    },
  }
}

function instructionSource(id: ImportSourceId, label: string, candidates: (cwd: string) => string[], tags: string[]): SourceDescriptor {
  return {
    id,
    label,
    kind: 'memory',
    async detect(cwd) {
      const found: string[] = []
      for (const candidate of candidates(cwd)) if (await exists(candidate)) found.push(candidate)
      return found
    },
    async scan(cwd, options) {
      const items: ImportItem[] = []
      const skipped: SkippedFile[] = []
      for (const abs of candidates(cwd)) {
        const text = await readText(abs)
        if (!text) continue
        const parsed = fromMarkdownFile(id, abs, text, { tags: ['imported', ...tags] })
        for (const entry of parsed) {
          if (items.length >= options.limit) break
          items.push(entry)
        }
      }
      return { items, skipped }
    },
  }
}

const claudeMd = instructionSource(
  'claude-md',
  'CLAUDE.md',
  (cwd) => [path.join(HOME(), '.claude', 'CLAUDE.md'), path.join(cwd, 'CLAUDE.md'), path.join(cwd, '.claude', 'CLAUDE.md')],
  ['claude-code'],
)

const agentsMd = instructionSource(
  'agents-md',
  'AGENTS.md',
  (cwd) => [
    path.join(HOME(), '.agents', 'AGENTS.md'),
    path.join(HOME(), '.codex', 'AGENTS.md'),
    path.join(HOME(), '.config', 'mimocode', 'AGENTS.md'),
    path.join(cwd, 'AGENTS.md'),
    path.join(cwd, 'AGENTS.local.md'),
  ],
  ['agents-md'],
)

// Qwen Code 与 iFlow 的指令文件（分别是阿里与心流的 CLI，格式同 GEMINI.md 一脉）
const qwenMd = instructionSource(
  'qwen-md',
  'QWEN.md（Qwen Code）',
  (cwd) => [path.join(HOME(), '.qwen', 'QWEN.md'), path.join(cwd, 'QWEN.md')],
  ['qwen'],
)

const iflowMd = instructionSource(
  'iflow-md',
  'IFLOW.md（iFlow CLI）',
  (cwd) => [path.join(HOME(), '.iflow', 'IFLOW.md'), path.join(cwd, 'IFLOW.md')],
  ['iflow'],
)

// Cline / Roo 的项目规则（.clinerules 单文件 + .roo/rules 目录）
const clineRules = rulesSource(
  'clinerules',
  'Cline / Roo 规则（.clinerules、.roo/rules）',
  (cwd) => [path.join(cwd, '.clinerules'), path.join(cwd, '.roo', 'rules')],
  ['cline'],
)

// Augment 用户规则（家目录）与项目规则
const augmentRules = rulesSource(
  'augment-rules',
  'Augment rules',
  (cwd) => [path.join(HOME(), '.augment', 'rules'), path.join(cwd, '.augment', 'rules')],
  ['augment'],
)

// Kiro 的 steering 文档（规格驱动 IDE 的长期记忆机制）
const kiroSteering = rulesSource(
  'kiro-steering',
  'Kiro steering（.kiro/steering）',
  (cwd) => [path.join(cwd, '.kiro', 'steering')],
  ['kiro'],
)

// SpecStory 把 AI 对话历史落成 Markdown，是最容易被忽视的「记忆矿」
const specstoryHistory = rulesSource(
  'specstory-history',
  'SpecStory 历史（.specstory/history）',
  (cwd) => [path.join(cwd, '.specstory', 'history')],
  ['specstory'],
)

// Continue 的项目规则目录
const continueRules = rulesSource(
  'continue-rules',
  'Continue rules（.continue/rules）',
  (cwd) => [path.join(cwd, '.continue', 'rules')],
  ['continue'],
)

// JetBrains Junie 的 guidelines
const junieGuidelines = rulesSource(
  'junie-guidelines',
  'Junie guidelines（.junie）',
  (cwd) => [path.join(cwd, '.junie', 'guidelines.md')],
  ['junie'],
)

// ---------------------------------------------------------------------------
// 4. Cursor rules（.cursor/rules 目录 + 旧版 .cursorrules 单文件）
// ---------------------------------------------------------------------------
function cursorCandidates(cwd: string): string[] {
  return [path.join(cwd, '.cursor', 'rules'), path.join(cwd, '.cursorrules')]
}

const cursorRules: SourceDescriptor = {
  id: 'cursor-rules',
  label: 'Cursor rules (.cursor/rules)',
  kind: 'memory',
  async detect(cwd) {
    const found: string[] = []
    for (const candidate of cursorCandidates(cwd)) if (await exists(candidate)) found.push(candidate)
    return found
  },
  async scan(cwd, options) {
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    for (const candidate of cursorCandidates(cwd)) {
      const files = (await isDir(candidate)) ? await listFiles(candidate, ['.mdc', '.md']) : (await exists(candidate) ? [candidate] : [])
      for (const abs of files) {
        if (items.length >= options.limit) break
        const text = await readText(abs)
        if (!text) continue
        const { data, body } = readFrontmatter(text)
        if (!body.trim()) {
          skipped.push({ origin: abs, reason: 'empty' })
          continue
        }
        const globs = Array.isArray(data.globs) ? data.globs.map(String) : data.globs ? [String(data.globs)] : []
        const always = data.alwaysApply === true || data.alwaysApply === 'true'
        const activation: Activation = always ? 'always' : globs.length > 0 ? 'glob' : 'on_demand'
        const kind = classify(`${body}`).kind
        items.push(
          makeImportItem({
            source: 'cursor-rules',
            origin: abs,
            index: 0,
            title: String(data.description ?? path.basename(abs).replace(/\.(mdc|md)$/, '')),
            summary: String(data.description ?? body),
            body,
            kind,
            activation,
            tags: ['imported', 'cursor', ...(globs.length > 0 ? ['glob'] : [])],
          }),
        )
      }
    }
    return { items, skipped }
  },
}

// ---------------------------------------------------------------------------
// 5. Windsurf rules
// ---------------------------------------------------------------------------
const windsurfRules: SourceDescriptor = {
  id: 'windsurf-rules',
  label: 'Windsurf rules',
  kind: 'memory',
  async detect(cwd) {
    const found: string[] = []
    for (const candidate of [path.join(HOME(), '.codeium', 'windsurf', 'memories', 'global_rules.md'), path.join(cwd, '.windsurf', 'rules'), path.join(cwd, '.windsurfrules')]) {
      if (await exists(candidate)) found.push(candidate)
    }
    return found
  },
  async scan(cwd, options) {
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    const files = [
      path.join(HOME(), '.codeium', 'windsurf', 'memories', 'global_rules.md'),
      ...(await listFiles(path.join(cwd, '.windsurf', 'rules'), ['.md'])),
      path.join(cwd, '.windsurfrules'),
    ]
    for (const abs of files) {
      if (items.length >= options.limit) break
      const text = await readText(abs)
      if (!text) continue
      const { data, body } = readFrontmatter(text)
      if (!body.trim()) {
        skipped.push({ origin: abs, reason: 'empty' })
        continue
      }
      const trigger = String(data.trigger ?? '')
      const activation: Activation = trigger === 'always_on' ? 'always' : trigger === 'manual' ? 'manual' : 'on_demand'
      const kind = classify(body).kind
      items.push(
        makeImportItem({
          source: 'windsurf-rules',
          origin: abs,
          index: 0,
          title: String(data.description ?? path.basename(abs).replace(/\.md$/, '')),
          summary: String(data.description ?? body),
          body,
          kind,
          activation,
          tags: ['imported', 'windsurf'],
        }),
      )
    }
    return { items, skipped }
  },
}

// ---------------------------------------------------------------------------
// 6. Cline memory bank（6 个固定文件）
// ---------------------------------------------------------------------------
const clineMemoryBank: SourceDescriptor = {
  id: 'cline-memory-bank',
  label: 'Cline memory bank',
  kind: 'memory',
  async detect(cwd) {
    return (await exists(path.join(cwd, 'memory-bank'))) ? [path.join(cwd, 'memory-bank')] : []
  },
  async scan(cwd, options) {
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    for (const abs of await listFiles(path.join(cwd, 'memory-bank'), ['.md'])) {
      if (items.length >= options.limit) break
      const text = await readText(abs)
      if (!text?.trim()) {
        skipped.push({ origin: abs, reason: 'empty' })
        continue
      }
      const name = path.basename(abs, '.md')
      const kind: Kind = 'project'
      const activation: Activation = 'on_demand'
      items.push(
        makeImportItem({
          source: 'cline-memory-bank',
          origin: abs,
          index: 0,
          title: name,
          summary: clip(text, 120),
          body: text,
          kind,
          activation,
          tags: ['imported', 'cline', name],
          confidence: name === 'activeContext' ? 'low' : 'medium',
        }),
      )
    }
    return { items, skipped }
  },
}

// ---------------------------------------------------------------------------
// 7. Copilot instructions
// ---------------------------------------------------------------------------
const copilotInstructions: SourceDescriptor = {
  id: 'copilot-instructions',
  label: 'GitHub Copilot instructions',
  kind: 'memory',
  async detect(cwd) {
    const found: string[] = []
    for (const candidate of [path.join(cwd, '.github', 'copilot-instructions.md'), path.join(cwd, '.github', 'instructions')]) {
      if (await exists(candidate)) found.push(candidate)
    }
    return found
  },
  async scan(cwd, options) {
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    const files = [
      path.join(cwd, '.github', 'copilot-instructions.md'),
      ...(await listFiles(path.join(cwd, '.github', 'instructions'), ['.instructions.md', '.md'])),
    ]
    for (const abs of files) {
      if (items.length >= options.limit) break
      const text = await readText(abs)
      if (!text?.trim()) continue
      const { data, body } = readFrontmatter(text)
      const applyTo = data.applyTo ? [String(data.applyTo)] : []
      items.push(
        makeImportItem({
          source: 'copilot-instructions',
          origin: abs,
          index: 0,
          title: String(data.description ?? path.basename(abs).replace(/\.instructions\.md$|\.md$/, '')),
          summary: clip(body, 120),
          body,
          kind: classify(body).kind,
          activation: applyTo.length > 0 ? 'glob' : 'always',
          tags: ['imported', 'copilot', ...applyTo],
        }),
      )
    }
    return { items, skipped }
  },
}

// ---------------------------------------------------------------------------
// 8. Gemini CLI
// ---------------------------------------------------------------------------
const geminiMd = instructionSource(
  'gemini-md',
  'GEMINI.md',
  (cwd) => [path.join(HOME(), '.gemini', 'GEMINI.md'), path.join(cwd, 'GEMINI.md')],
  ['gemini'],
)

// ---------------------------------------------------------------------------
// 9. 前作 @a9i5k4/dsh-auto-memory
// ---------------------------------------------------------------------------
const dshAutoMemory: SourceDescriptor = {
  id: 'dsh-auto-memory',
  label: '第三方前作 dsh-auto-memory',
  kind: 'memory',
  async detect(cwd) {
    const found: string[] = []
    for (const candidate of [path.join(HOME(), '.dsh', 'memory', 'MEMORY.md'), path.join(cwd, '.dsh-memory', 'MEMORY.md'), path.join(cwd, '.dsh-memory')]) {
      if (await exists(candidate)) found.push(candidate)
    }
    return found
  },
  async scan(cwd, options) {
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    // 前作的默认存储根与本插件相同（~/.dsh/memory）：落在自家根里的一律跳过，否则等于自导入
    const ownRoot = options.excludeRoot ? path.resolve(options.excludeRoot) : undefined
    const isOwn = (abs: string): boolean => ownRoot !== undefined && path.resolve(abs).startsWith(ownRoot + path.sep)
    const files = [
      path.join(HOME(), '.dsh', 'memory', 'MEMORY.md'),
      path.join(cwd, '.dsh-memory', 'MEMORY.md'),
      ...(await listFiles(path.join(cwd, '.dsh-memory'), ['.md'], true)),
    ].filter((abs) => !isOwn(abs))
    for (const abs of files) {
      if (items.length >= options.limit) break
      const text = await readText(abs)
      if (!text?.trim()) continue
      // 清掉前作的锚点注释，它们对我们是噪声
      const cleaned = text.replace(/<!--\s*memory:[^>]+-->/g, '')
      for (const entry of fromMarkdownFile('dsh-auto-memory', abs, cleaned, { tags: ['imported', 'predecessor'] })) {
        if (items.length >= options.limit) break
        items.push(entry)
      }
    }
    return { items, skipped }
  },
}

// ---------------------------------------------------------------------------
// 10. 任意 Markdown 目录
// ---------------------------------------------------------------------------
const genericDir: SourceDescriptor = {
  id: 'generic-dir',
  label: '任意 Markdown 目录',
  kind: 'memory',
  async detect() {
    return []
  },
  async scan(_cwd, options) {
    if (!options.path) return { items: [], skipped: [{ origin: '(none)', reason: '需要指定 path' }] }
    const root = path.resolve(expandUserPath(options.path))
    const items: ImportItem[] = []
    const skipped: SkippedFile[] = []
    for (const abs of await listFiles(root, ['.md', '.markdown', '.txt'], true)) {
      if (items.length >= options.limit) break
      const text = await readText(abs)
      if (!text?.trim()) {
        skipped.push({ origin: abs, reason: 'empty' })
        continue
      }
      const parsed = fromMarkdownFile('generic-dir', abs, text, { tags: ['imported'] })
      for (const entry of parsed) {
        if (items.length >= options.limit) break
        items.push(entry)
      }
    }
    return { items, skipped }
  },
}

export const MEMORY_SOURCES: SourceDescriptor[] = [
  claudeCodeMemory,
  claudeMd,
  agentsMd,
  cursorRules,
  windsurfRules,
  clineMemoryBank,
  clineRules,
  copilotInstructions,
  geminiMd,
  qwenMd,
  iflowMd,
  augmentRules,
  kiroSteering,
  specstoryHistory,
  continueRules,
  junieGuidelines,
  qoderMemory,
  dshAutoMemory,
  genericDir,
]
