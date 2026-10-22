import { rm } from 'node:fs/promises'
import path from 'node:path'
import yaml from 'js-yaml'
import { ensureDir, listSubdirs, readTextFile, resolveInRoot, walkMarkdown, writeFileAtomic } from './files.js'
import { FrontmatterError, parseFrontmatter, serializeEntry } from './frontmatter.js'
import { checksumOf, isoNow, normalizeBody, ulid, type Entry, type Frontmatter, type Kind } from './model.js'
import { DIRS, ENTRY_DIRS, MANIFEST_NAME, SCHEMA_VERSION } from './paths.js'

export interface ScanIssue {
  rel: string
  issue: 'parse' | 'invalid'
  message: string
}

/** 派生 Markdown 不是记忆条目：persona/PROFILE.md 就落在条目目录里 */
const DERIVED_MARKDOWN = new Set(['PROFILE.MD', 'INDEX.MD'])
function isDerivedMarkdown(rel: string): boolean {
  return DERIVED_MARKDOWN.has(path.posix.basename(rel).toUpperCase())
}
function baseIdOf(rel: string): string {
  const name = path.posix.basename(rel)
  return name.toLowerCase().endsWith('.md') ? name.slice(0, -3) : name
}

export interface ScanResult {
  entries: Entry[]
  issues: ScanIssue[]
}

export interface NewEntryInput {
  kind: Kind
  title: string
  summary: string
  body: string
  scope?: 'global' | 'project'
  project?: string
  tags?: string[]
  entities?: string[]
  activation?: Frontmatter['activation']
  globs?: string[]
  confidence?: Frontmatter['confidence']
  source?: Frontmatter['provenance']['source']
  createdBy?: string
  sessionId?: string
  eventSeq?: number
  origin?: string
  importedFrom?: string
  expiresAt?: string | null
  id?: string
  now?: string
}

export class MemoryStore {
  constructor(readonly root: string) {}

  async init(deviceId: string): Promise<void> {
    const dirs = [
      DIRS.persona,
      DIRS.preference,
      DIRS.feedback,
      DIRS.relations,
      DIRS.reference,
      DIRS.procedures,
      DIRS.project,
      DIRS.projects,
      DIRS.archive,
      DIRS.audit,
      DIRS.snapshots,
      DIRS.sync,
      DIRS.cache,
    ]
    for (const dir of dirs) await ensureDir(path.join(this.root, dir))

    const manifestPath = path.join(this.root, MANIFEST_NAME)
    if (!(await readTextFile(manifestPath))) {
      const manifest = yaml.dump(
        {
          schemaVersion: SCHEMA_VERSION,
          plugin: 'dsh-general-automatic-memory',
          createdAt: isoNow(),
          deviceId,
          note: 'Truth source. Everything under .cache/ is a disposable derived index.',
        },
        { schema: yaml.CORE_SCHEMA, sortKeys: false, lineWidth: -1, noRefs: true },
      )
      await writeFileAtomic(manifestPath, manifest)
    }
  }

  /** kind + scope → 相对目录。project 类落在 projects/<slug>/facts/。 */
  dirFor(kind: Kind, scope: 'global' | 'project', project?: string): string {
    if (kind === 'episode') throw new Error('episodes live in jsonl, not as entry files')
    if (kind === 'project') {
      // 项目事实默认落在 projects/<slug>/facts；没有项目上下文的通用工程事实
      // （例如"部署走 GitHub Actions"）落在全局 project/ 目录 —— 导入时这种很常见
      if (scope !== 'project') return DIRS.project
      if (!project) throw new Error('scope=project requires a project slug')
      return path.posix.join(DIRS.projects, project, 'facts')
    }
    const dir = kind === 'procedure' ? DIRS.procedures : kind
    if (!(ENTRY_DIRS as readonly string[]).includes(dir)) throw new Error(`no directory mapped for kind ${kind}`)
    return dir
  }

  relFor(kind: Kind, scope: 'global' | 'project', project: string | undefined, id: string): string {
    return path.posix.join(this.dirFor(kind, scope, project), `${id}.md`)
  }

  /** 扫描目录集合：6 个全局 kind 目录 + 每个项目的 facts/ */
  private async scanDirs(): Promise<string[]> {
    const dirs: string[] = [...ENTRY_DIRS]
    for (const slug of await listSubdirs(path.join(this.root, DIRS.projects))) {
      dirs.push(path.posix.join(DIRS.projects, slug, 'facts'))
    }
    return dirs
  }

  /** 扫描全部活跃条目。单个文件解析失败不影响其余，问题收集进 issues 交给 doctor。 */
  async scan(): Promise<ScanResult> {
    const entries: Entry[] = []
    const issues: ScanIssue[] = []
    for (const rel of await walkMarkdown(this.root, await this.scanDirs())) {
      if (isDerivedMarkdown(rel)) continue
      const text = await readTextFile(resolveInRoot(this.root, rel))
      if (text === null) continue
      try {
        entries.push(parseFrontmatter(text, rel))
      } catch (cause) {
        issues.push({
          rel,
          issue: cause instanceof FrontmatterError ? 'invalid' : 'parse',
          message: (cause as Error).message,
        })
      }
    }
    return { entries, issues }
  }

  buildMeta(input: NewEntryInput): Frontmatter {
    const now = input.now ?? isoNow()
    const today = now.slice(0, 10)
    const scope = input.scope ?? 'global'
    const activation = input.activation ?? 'on_demand'
    if (activation === 'glob' && (input.globs?.length ?? 0) === 0) {
      throw new Error('activation=glob requires at least one glob')
    }
    if (scope === 'project' && !input.project) throw new Error('scope=project requires a project slug')

    const source = input.source ?? 'manual'
    const body = normalizeBody(input.body)
    return {
      id: input.id ?? ulid(),
      kind: input.kind,
      title: input.title,
      summary: input.summary,
      scope,
      ...(scope === 'project' ? { project: input.project as string } : {}),
      tags: input.tags ?? [],
      entities: input.entities ?? [],
      activation,
      globs: input.globs ?? [],
      // model-inferred 初始不得为 high（docs/09 §3）
      confidence: input.confidence ?? (source === 'user-stated' || source === 'manual' ? 'high' : 'medium'),
      provenance: {
        source,
        createdAt: now,
        createdBy: input.createdBy ?? 'dsh',
        ...(input.sessionId ? { sessionId: input.sessionId } : {}),
        ...(input.eventSeq !== undefined ? { eventSeq: input.eventSeq } : {}),
        ...(input.origin ? { origin: input.origin } : {}),
        ...(input.importedFrom ? { importedFrom: input.importedFrom } : {}),
      },
      temporal: {
        observedAt: today,
        validFrom: today,
        invalidatedAt: null,
        supersededBy: null,
        expiresAt: input.expiresAt ?? null,
      },
      stats: { revisions: 1, hits: 0, lastUsedAt: null, heat: 0 },
      links: { relates: [], derivedFrom: [], conflictsWith: [] },
      privacy: { pii: false, sensitive: false, shareable: 'none' },
      checksum: checksumOf(body),
    }
  }

  async put(meta: Frontmatter, body: string): Promise<string> {
    const normalized = normalizeBody(body)
    const rel = this.relFor(meta.kind, meta.scope, meta.project, meta.id)
    const stamped: Frontmatter = { ...meta, checksum: checksumOf(normalized) }
    await writeFileAtomic(resolveInRoot(this.root, rel), serializeEntry(stamped, normalized))
    return rel
  }

  /** 只改 frontmatter（stats 刷盘等），正文不动。 */
  async patchMeta(id: string, patch: (meta: Frontmatter) => Frontmatter): Promise<Entry | null> {
    const entry = await this.get(id)
    if (!entry) return null
    const meta = patch(entry.meta)
    await this.put(meta, entry.body)
    return { meta, body: entry.body, rel: entry.rel }
  }

  async get(id: string): Promise<Entry | null> {
    const { entries } = await this.scan()
    return entries.find((e) => e.meta.id === id) ?? null
  }

  /**
   * 失效 ≠ 删除：写 temporal.invalidatedAt + supersededBy，然后移入 archive/<yyyy>/。
   * 归档文件与活跃文件格式完全一致（不追加任何注释），否则正文 checksum 会漂移。
   * 失效原因记在审计里，不进文件。
   */
  async invalidate(
    id: string,
    opts: { reason?: string; supersededBy?: string | null; now?: string } = {},
  ): Promise<Entry | null> {
    const entry = await this.get(id)
    if (!entry) return null
    const now = opts.now ?? isoNow()
    const meta: Frontmatter = {
      ...entry.meta,
      temporal: {
        ...entry.meta.temporal,
        invalidatedAt: now.slice(0, 10),
        supersededBy: opts.supersededBy ?? null,
      },
      stats: { ...entry.meta.stats, revisions: entry.meta.stats.revisions + 1 },
    }
    await this.moveToArchive(meta, entry.body, entry.rel, now)
    return { meta, body: entry.body, rel: entry.rel }
  }

  async archive(id: string, now: string = isoNow()): Promise<string | null> {
    const entry = await this.get(id)
    if (!entry) return null
    return this.moveToArchive(entry.meta, entry.body, entry.rel, now)
  }

  private async moveToArchive(meta: Frontmatter, body: string, activeRel: string, now: string): Promise<string> {
    const rel = path.posix.join(DIRS.archive, now.slice(0, 4), `${meta.id}.md`)
    await writeFileAtomic(resolveInRoot(this.root, rel), serializeEntry(meta, body))
    await rm(resolveInRoot(this.root, activeRel), { force: true })
    return rel
  }

  /** 物理删除：活跃副本 + 归档副本。派生索引由 rebuild 清除。仅用于用户硬删与 GDPR。 */
  async hardDelete(id: string): Promise<string[]> {
    const deleted: string[] = []
    const entry = await this.get(id)
    if (entry) {
      await rm(resolveInRoot(this.root, entry.rel), { force: true })
      deleted.push(entry.rel)
    }
    for (const rel of await walkMarkdown(this.root, [DIRS.archive])) {
      if (baseIdOf(rel) === id) {
        await rm(resolveInRoot(this.root, rel), { force: true })
        deleted.push(rel)
      }
    }
    return deleted
  }

  /** 归档面：memory_read 与时间线的时点查询会用到。 */
  async scanArchive(): Promise<Entry[]> {
    const out: Entry[] = []
    for (const rel of await walkMarkdown(this.root, [DIRS.archive])) {
      const text = await readTextFile(resolveInRoot(this.root, rel))
      if (text === null) continue
      try {
        out.push(parseFrontmatter(text, rel))
      } catch {
        // 归档里的坏文件由 doctor 报，不影响召回
      }
    }
    return out
  }
}
