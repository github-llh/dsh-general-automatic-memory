import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryService } from '../src/host/api.js'
import { PathEscapeError, resolveInRoot } from '../src/host/files.js'
import { DEFAULT_CONFIG } from '../src/config.js'
import { projectSlug } from '../src/host/paths.js'
import { MemoryStore } from '../src/host/store.js'
import { matchGlob, extractTouchedPaths } from '../src/host/adapters/inject.js'

let root: string

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'gam-test-'))
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('路径边界（Host 插件代码不受 workspace sandbox 约束，边界必须自己守）', () => {
  it('rejects traversal out of the memory root', () => {
    expect(() => resolveInRoot(root, '../../etc/passwd')).toThrow(PathEscapeError)
    expect(() => resolveInRoot(root, 'persona/../../secret')).toThrow(PathEscapeError)
    expect(() => resolveInRoot(root, '/etc/passwd')).toThrow(PathEscapeError)
  })

  it('accepts paths inside the root, and rejects absolute paths outside it', () => {
    expect(resolveInRoot(root, 'persona/m_x.md')).toBe(path.join(root, 'persona/m_x.md'))
    expect(resolveInRoot(root, path.join(root, 'persona/m_x.md'))).toBe(path.join(root, 'persona/m_x.md'))
    // 绝对路径不是"当作 root 相对"来处理，而是必须真的落在 root 内——语义更可预测
    expect(() => resolveInRoot(root, '/persona/m_x.md')).toThrow(PathEscapeError)
  })
})

describe('项目 slug', () => {
  it('is stable, readable and distinct from the dsh session encoding', () => {
    const a = projectSlug('/Users/x/company/data-platform-server')
    const b = projectSlug('/Users/x/company/data-platform-server/')
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-zA-Z_-]{12}-data-platform-server$/)
    // dsh 会话目录编码是 --Users-x-…--，前作是 ---Users-x-…--；两者都不能被误当成 slug
    expect(a.startsWith('-')).toBe(false)
    expect(projectSlug('/Users/x/other/data-platform-server')).not.toBe(a)
  })
})

describe('glob 匹配', () => {
  it('matches relative and absolute forms', () => {
    const cwd = '/repo/proj'
    expect(matchGlob('src/auth/**', '/repo/proj/src/auth/login.ts', cwd)).toBe(true)
    expect(matchGlob('src/auth/**', 'src/auth/login.ts', cwd)).toBe(true)
    expect(matchGlob('src/auth/**', '/repo/proj/src/db/pool.ts', cwd)).toBe(false)
    expect(matchGlob('*.md', '/repo/proj/README.md', cwd)).toBe(true)
    expect(matchGlob('**/*.test.ts', '/repo/proj/a/b/c.test.ts', cwd)).toBe(true)
  })

  it('extracts only file-path-looking arguments from tool events', () => {
    const paths = extractTouchedPaths({
      type: 'tool/call',
      data: { name: 'edit', args: { file_path: '/repo/a.ts', note: 'not a path', nested: { path: '/repo/b.ts' } } },
    })
    expect(paths.sort()).toEqual(['/repo/a.ts', '/repo/b.ts'])
    expect(extractTouchedPaths({ type: 'tool/call', data: { args: { cmd: 'ls -la' } } })).toEqual([])
  })
})

describe('store', () => {
  it('writes entries atomically and reads them back', async () => {
    const store = new MemoryStore(root)
    await store.init('dev-test')
    const meta = store.buildMeta({ kind: 'feedback', title: '别加总结', summary: '用户自己读 diff', body: '正文', source: 'user-stated' })
    const rel = await store.put(meta, '正文')
    expect(rel).toBe(`feedback/${meta.id}.md`)

    const raw = await readFile(path.join(root, rel), 'utf8')
    expect(raw.startsWith('---\n')).toBe(true)
    const scanned = await store.scan()
    expect(scanned.entries).toHaveLength(1)
    expect(scanned.issues).toHaveLength(0)
    expect(scanned.entries[0]!.meta.title).toBe('别加总结')
  })

  it('never leaves a half-written file behind', async () => {
    const store = new MemoryStore(root)
    await store.init('dev-test')
    const meta = store.buildMeta({ kind: 'persona', title: 't', summary: 's', body: 'b' })
    await store.put(meta, 'b')
    const { walkMarkdown } = await import('../src/host/files.js')
    const files = await walkMarkdown(root, ['persona'])
    expect(files).toHaveLength(1)
    expect(files[0]!.endsWith('.md')).toBe(true)
  })

  it('routes project-scoped facts under projects/<slug>/facts', async () => {
    const store = new MemoryStore(root)
    await store.init('dev-test')
    const slug = projectSlug('/repo/demo')
    const meta = store.buildMeta({ kind: 'project', title: 't', summary: 's', body: 'b', scope: 'project', project: slug })
    const rel = await store.put(meta, 'b')
    expect(rel).toBe(`projects/${slug}/facts/${meta.id}.md`)
    expect((await store.scan()).entries).toHaveLength(1)
  })

  it('invalidation archives instead of deleting, and the archive stays readable', async () => {
    const store = new MemoryStore(root)
    await store.init('dev-test')
    const meta = store.buildMeta({ kind: 'reference', title: 't', summary: 's', body: 'b' })
    await store.put(meta, 'b')
    const archived = await store.invalidate(meta.id, { reason: 'superseded', now: '2026-10-21T10:00:00Z' })
    expect(archived?.meta.temporal.invalidatedAt).toBe('2026-10-21')
    expect((await store.scan()).entries).toHaveLength(0)
    const archive = await store.scanArchive()
    expect(archive).toHaveLength(1)
    expect(archive[0]!.meta.id).toBe(meta.id)
  })

  it('hard delete removes both the active and the archived copy', async () => {
    const store = new MemoryStore(root)
    await store.init('dev-test')
    const meta = store.buildMeta({ kind: 'reference', title: 't', summary: 's', body: 'b' })
    await store.put(meta, 'b')
    await store.invalidate(meta.id, { reason: 'x' })
    const deleted = await store.hardDelete(meta.id)
    expect(deleted.length).toBe(1)
    expect(await store.scanArchive()).toHaveLength(0)
  })

  it('collects broken files as issues instead of failing the whole scan', async () => {
    const store = new MemoryStore(root)
    await store.init('dev-test')
    const good = store.buildMeta({ kind: 'persona', title: 'ok', summary: 'ok', body: 'b' })
    await store.put(good, 'b')
    const { writeFileAtomic } = await import('../src/host/files.js')
    await writeFileAtomic(path.join(root, 'persona', 'm_broken.md'), 'not a memory file at all\n')
    const result = await store.scan()
    expect(result.entries).toHaveLength(1)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]!.rel).toBe('persona/m_broken.md')
  })

  it('ignores derived PROFILE.md inside an entry directory', async () => {
    const store = new MemoryStore(root)
    await store.init('dev-test')
    const { writeFileAtomic } = await import('../src/host/files.js')
    await writeFileAtomic(path.join(root, 'persona', 'PROFILE.md'), '# generated by the plugin\n')
    const result = await store.scan()
    expect(result.entries).toHaveLength(0)
    expect(result.issues).toHaveLength(0)
  })
})

describe('service', () => {
  it('generates derived indexes and keeps them content-hash stable', async () => {
    const service = await MemoryService.create(DEFAULT_CONFIG, root)
    const indexPath = path.join(root, 'INDEX.md')

    await service.create({ kind: 'feedback', title: '别加总结', summary: '用户自己读 diff', body: '正文', source: 'user-stated' })
    const afterFirst = await readFile(indexPath, 'utf8')
    expect(afterFirst).toContain('GENERATED by dsh-general-automatic-memory')
    expect(afterFirst).toContain('别加总结')

    // 内容没变时一个字节都不写：避免 mtime 抖动让 watcher 与跨设备同步误判为"有变更"
    const idle = await service.rebuildDerived()
    expect(idle.written).toHaveLength(0)
    expect(idle.unchanged.length).toBeGreaterThan(0)

    // 条目变了，create() 内部的 refresh 就该把索引重写掉
    await service.create({ kind: 'persona', title: '后端出身', summary: '十年 Go', body: '前端解释类比后端', source: 'user-stated' })
    const afterSecond = await readFile(indexPath, 'utf8')
    expect(afterSecond).not.toBe(afterFirst)
    expect(afterSecond).toContain('后端出身')
    expect((await service.rebuildDerived()).written).toHaveLength(0)
  })

  it('search finds a memory by a Chinese phrase and gates low-relevance hits', async () => {
    const service = await MemoryService.create(DEFAULT_CONFIG, root)
    await service.create({ kind: 'project', title: '鉴权中间件重写', summary: 'session token 存 cookie，合规要求', body: '因为 legal  flagged 会话 token 存储方式', source: 'user-stated', scope: 'project', project: projectSlug('/repo/demo') })
    await service.create({ kind: 'persona', title: '后端出身', summary: '十年 Go，第一次碰 React', body: '前端解释请类比后端概念', source: 'user-stated' })

    const hits = service.search('鉴权 中间件')
    expect(hits[0]!.entry.meta.title).toBe('鉴权中间件重写')
    expect(hits[0]!.gated).toBe(false)

    const noise = service.search('完全无关的查询词组')
    expect(noise.every((hit) => hit.gated)).toBe(true)
  })

  it('rejects a stale optimistic-lock update with 409 semantics', async () => {
    const service = await MemoryService.create(DEFAULT_CONFIG, root)
    const created = await service.create({ kind: 'reference', title: 't', summary: 's', body: 'b' })
    const stale = await service.update(created.meta.id, 'new body', 99)
    expect(stale.ok).toBe(false)
    const fresh = await service.update(created.meta.id, 'new body', 1)
    expect(fresh.ok).toBe(true)
  })

  it('hard delete requires the id tail as confirmation', async () => {
    const service = await MemoryService.create(DEFAULT_CONFIG, root)
    const created = await service.create({ kind: 'reference', title: 't', summary: 's', body: 'b' })
    const refused = await service.hardDelete(created.meta.id, 'wrong')
    expect('error' in refused).toBe(true)
    const accepted = await service.hardDelete(created.meta.id, created.meta.id.slice(-4))
    expect('deleted' in accepted).toBe(true)
    expect(service.list()).toHaveLength(0)
    // 硬删后派生文件里不得残留该 id（GDPR）
    const index = await readFile(path.join(root, 'INDEX.md'), 'utf8')
    expect(index).not.toContain(created.meta.id)
  })

  it('keeps the catalog within budget and records the injection share', async () => {
    const service = await MemoryService.create(DEFAULT_CONFIG, root)
    for (let i = 0; i < 40; i++) {
      await service.create({ kind: 'project', title: `条目 ${i}`, summary: `第 ${i} 条摘要`, body: 'b', scope: 'project', project: projectSlug('/repo/demo') })
    }
    const snapshot = service.snapshotFor('s1', { mode: 'full', project: projectSlug('/repo/demo') })
    expect(snapshot.chars.total).toBeLessThanOrEqual(DEFAULT_CONFIG.budget.alwaysChars + DEFAULT_CONFIG.budget.catalogChars + DEFAULT_CONFIG.budget.globChars)
    service.setRequestShare(0.05)
    const stats = await service.stats()
    expect(stats.recall.lastShare).toBe(0.05)
    expect(stats.alerts.some((a) => a.code === 'budget-overrun')).toBe(true)
  })
})
