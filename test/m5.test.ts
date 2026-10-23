import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../src/config.js'
import { MemoryService } from '../src/host/api.js'
import { applyProjection, exportZip, importZip, mergeManagedBlock } from '../src/host/bridge.js'
import { curate } from '../src/host/curator.js'
import { createSnapshot, diffSnapshots, restoreSnapshot } from '../src/host/snapshot.js'
import { projectSlug } from '../src/host/paths.js'

let root: string
const services: MemoryService[] = []

async function createService(): Promise<MemoryService> {
  const service = await MemoryService.create(DEFAULT_CONFIG, root)
  services.push(service)
  return service
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'gam-m5-'))
})
afterEach(async () => {
  // Windows：先关 SQLite 句柄再删目录，否则 .cache/fts.sqlite 会 EBUSY
  for (const service of services.splice(0)) service.dispose()
  await rm(root, { recursive: true, force: true })
})

describe('固化 curator', () => {
  it('merges near-duplicate entries and archives the loser', async () => {
    const api = await createService()
    await api.create({ kind: 'feedback', title: '别加总结', summary: '用户自己读 diff', body: '短版本。', source: 'user-stated' })
    await api.create({ kind: 'feedback', title: '别加总结', summary: '用户自己读 diff', body: '长版本，补充了为什么。', source: 'user-stated' })
    expect(api.list()).toHaveLength(2)

    const result = await curate(api, DEFAULT_CONFIG)
    expect(result.merged).toBe(1)
    expect(api.list()).toHaveLength(1)
    expect(api.list()[0]!.body).toContain('长版本')
    expect(api.list()[0]!.body).toContain('短版本')
  })

  it('promotes a topic that repeats across sessions into one project memory', async () => {
    const api = await createService()
    const slug = projectSlug('/repo/demo')
    await api.episodes.append(slug, { sid: 's1', turn: 1, topic: '鉴权方案', user: '', outcome: '决定用 cookie 存 token', src: 'user' })
    await api.episodes.append(slug, { sid: 's2', turn: 1, topic: '鉴权方案', user: '', outcome: '确认 compliance 要求 cookie', src: 'user' })

    const result = await curate(api, DEFAULT_CONFIG)
    expect(result.promoted).toBe(1)
    const promoted = api.list().find((entry) => entry.meta.kind === 'project')
    expect(promoted).toBeDefined()
    expect(promoted!.meta.project).toBe(slug)
    expect(promoted!.body).toContain('cookie')

    const episodes = await api.episodes.listDay(slug, new Date().toISOString().slice(0, 10))
    expect(episodes.every((episode) => episode.promoted === promoted!.meta.id)).toBe(true)
  })

  it('never demotes hot entries, and archives cold ones', async () => {
    const api = await createService()
    const hot = await api.create({ kind: 'reference', title: '看板', summary: 'grafana 内网', body: 'b', source: 'user-stated' })
    await api.store.patchMeta(hot.meta.id, (meta) => ({ ...meta, stats: { ...meta.stats, hits: 9, heat: 0.9, lastUsedAt: new Date().toISOString() } }))
    const cold = await api.create({ kind: 'reference', title: '旧地址', summary: '早就没用了', body: 'b', source: 'user-stated' })
    await api.store.patchMeta(cold.meta.id, (meta) => ({
      ...meta,
      stats: { ...meta.stats, heat: 0, lastUsedAt: null },
      provenance: { ...meta.provenance, createdAt: '2025-01-01T00:00:00.000Z' },
    }))
    await api.refresh()
    const result = await curate(api, DEFAULT_CONFIG)
    expect(result.demoted).toBe(1)
    expect(api.list().map((entry) => entry.meta.id)).toEqual([hot.meta.id])
  })
})

describe('快照 diff 与回滚', () => {
  it('detects changes and restores the previous bytes', async () => {
    const api = await createService()
    const created = await api.create({ kind: 'feedback', title: '别加总结', summary: 's', body: '原始正文', source: 'user-stated' })
    const before = await createSnapshot(root, 'before')
    await api.update(created.meta.id, '被改过的正文', 1)
    const after = await createSnapshot(root, 'after')

    const diff = await diffSnapshots(root, before.label, after.label)
    expect(diff.changed.some((rel) => rel.includes(created.meta.id))).toBe(true)

    const restored = await restoreSnapshot(root, before.label)
    expect(restored.restored).toBeGreaterThan(0)
    await api.refresh()
    expect(api.list()[0]!.body).toContain('原始正文')
  })
})

describe('投影（受管区块）', () => {
  it('is byte-idempotent and never touches user content outside the block', async () => {
    const file = path.join(root, 'AGENTS.md')
    await writeFile(file, '# 我的规则\n\n用户手写的内容，不许动。\n', 'utf8')
    const target = { id: 't', label: 't', path: file, render: () => '## 记忆\n- 一条' }

    const first = await applyProjection(target, [])
    expect(first.changed).toBe(true)
    const second = await applyProjection(target, [])
    expect(second.changed).toBe(false)

    const text = await readFile(file, 'utf8')
    expect(text).toContain('用户手写的内容，不许动。')
    expect(text).toContain('<!-- BEGIN dsh-general-automatic-memory')
    expect(text.match(/BEGIN dsh-general-automatic-memory/g)).toHaveLength(1)
  })

  it('replaces only the managed block when content changes', () => {
    const once = mergeManagedBlock('# user\n', 'A')
    const twice = mergeManagedBlock(once, 'B')
    expect(twice).toContain('# user')
    expect(twice).toContain('B')
    expect(twice).not.toContain('\nA\n')
  })
})

describe('zip 导入导出', () => {
  it('round-trips the truth source without the cache', async () => {
    const api = await createService()
    await api.create({ kind: 'feedback', title: '别加总结', summary: 's', body: '正文', source: 'user-stated' })
    const exported = await exportZip(root)
    expect(exported.files).toBeGreaterThanOrEqual(1)

    const id = api.list()[0]!.meta.id
    await api.hardDelete(id, id.slice(-4))
    expect(api.list()).toHaveLength(0)

    const imported = await importZip(root, exported.path)
    expect(imported.restored).toBeGreaterThanOrEqual(1)
    await api.refresh()
    expect(api.list().map((entry) => entry.meta.id)).toContain(id)
  })

  it('skips files that already exist instead of silently overwriting newer memory', async () => {
    const api = await createService()
    await api.create({ kind: 'feedback', title: '别加总结', summary: 's', body: '正文', source: 'user-stated' })
    const exported = await exportZip(root)
    const imported = await importZip(root, exported.path)
    expect(imported.restored).toBe(0)
    expect(imported.skipped).toBeGreaterThanOrEqual(1)
  })
})

describe('L1 FTS5 索引', () => {
  it('is a rebuildable cache: search still works and the backend reports l1', async () => {
    const api = await createService()
    await api.create({ kind: 'project', title: '鉴权中间件重写', summary: 'session token 存 cookie', body: '合规要求', source: 'user-stated', scope: 'project', project: projectSlug('/repo/demo') })
    expect(api.indexBackend).toBe('l1')
    const hits = api.search('鉴权中间件')
    expect(hits[0]!.entry.meta.title).toBe('鉴权中间件重写')

    // 删掉缓存后重启：应自动重建，不需要任何人工步骤
    api.dispose()
    await rm(path.join(root, '.cache', 'fts.sqlite'), { force: true })
    const again = await createService()
    expect(again.indexBackend).toBe('l1')
    expect(again.search('鉴权').length).toBeGreaterThan(0)
  })
})

describe('召回统计持久化', () => {
  it('survives a restart instead of resetting the overview to zero', async () => {
    const api = await createService()
    api.snapshotFor('s1', { mode: 'full' })
    api.snapshotFor('s1', { mode: 'full' })
    api.noteRecall(['m_1'])
    await api.flushRecallStats()
    expect((await api.stats()).recall.inject.events).toBe(2)

    // 模拟重启：新实例从 .cache/recall-stats.json 恢复计数
    const restarted = await createService()
    const recall = (await restarted.stats()).recall
    expect(recall.inject.events).toBe(2)
    expect(recall.tool.events).toBe(1)
    expect(recall.tool.hits).toBe(1)
    expect(recall.maxShare).toBe(DEFAULT_CONFIG.budget.maxShareOfRequest)
  })

  it('persists the measured injection share so a restart does not show a fake 0.00%', async () => {
    const api = await createService()
    expect((await api.stats()).recall.lastShareAt).toBeNull()
    api.setRequestShare(0.0125)
    await api.flushRecallStats()

    const restarted = await createService()
    const recall = (await restarted.stats()).recall
    expect(recall.lastShare).toBe(0.0125)
    expect(recall.lastShareAt).not.toBeNull()
  })

  it('migrates v1 stats: gated belongs to tool recall, and an old file has no measured share', async () => {
    await mkdir(path.join(root, '.cache'), { recursive: true })
    await writeFile(
      path.join(root, '.cache', 'recall-stats.json'),
      JSON.stringify({
        version: 1,
        recall: {
          inject: { events: 3, hits: 4, verbatim: 1, zeroHit: 0, chars: 10, tokens: 2, gated: 5 },
          tool: { events: 1, hits: 2, zeroHit: 0 },
          lastShare: 0,
          maxShare: 0.03,
        },
      }),
      'utf8',
    )
    const api = await createService()
    const recall = (await api.stats()).recall
    expect(recall.tool.gated).toBe(5)
    expect(recall.inject.prefixBreaks).toBe(0)
    expect(recall.lastShareAt).toBeNull()
  })

  it('counts unexpected same-mode text drift as a prefix break', async () => {
    const api = await createService()
    await api.create({ kind: 'project', title: 'A', summary: '第一条', body: 'b', source: 'user-stated' })
    api.snapshotFor('s1', { mode: 'full' })
    await api.create({ kind: 'project', title: 'B', summary: '第二条', body: 'b', source: 'user-stated' })
    api.snapshotFor('s1', { mode: 'full' })
    const recall = (await api.stats()).recall
    expect(recall.inject.events).toBe(2)
    expect(recall.inject.verbatim).toBe(0)
    expect(recall.inject.prefixBreaks).toBe(1)
  })

  it('throttles repeated flushes so the hot path does not hammer the disk', async () => {
    const api = await createService()
    api.snapshotFor('s1', { mode: 'full' })
    await api.flushRecallStats()
    api.snapshotFor('s1', { mode: 'full' })
    await api.flushRecallStats()
    const restarted = await createService()
    // 第二次 flush 在 30s 窗口内被合并，只应保留第一次的 1 次
    expect((await restarted.stats()).recall.inject.events).toBe(1)
  })

  it('counts a slim step as no-show, not as a zero-hit', async () => {
    const api = await createService()
    await api.create({ kind: 'project', title: '部署走 CI', summary: '不要手工 scp', body: 'GitHub Actions。', source: 'user-stated' })
    api.snapshotFor('s1', { mode: 'slim' })
    api.snapshotFor('s1', { mode: 'full' })
    const recall = (await api.stats()).recall
    expect(recall.inject.events).toBe(2)
    expect(recall.inject.zeroHit).toBe(0)
    expect(recall.inject.hits).toBe(1)
  })
})
