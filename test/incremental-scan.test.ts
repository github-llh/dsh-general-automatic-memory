import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryService } from '../src/host/api.js'
import { DEFAULT_CONFIG } from '../src/config.js'
import { MemoryStore } from '../src/host/store.js'
import type { Frontmatter } from '../src/host/model.js'

/**
 * 这条测试守的是 **Windows CI 超时的根因**：写入成本必须与库内条目数解耦。
 *
 * 旧实现每次 refresh 都把全部条目重新读+解析一遍（`store.get` 更是为了找一条
 * 把整个库读一遍），导入 N 条 = O(N²) 次文件读。Windows 上每次读文件都要过实时
 * 扫描，于是单次 create 被放大到秒级、5s 用例超时、1s 内的插件激活也失败。
 *
 * 这里用 vi.mock 数 `readTextFile` 的调用次数：无论库里有 30 条还是 90 条，
 * 改一条 frontmatter 的文件读取次数必须是常数。
 */
const state = vi.hoisted(() => ({ reads: 0 }))

vi.mock('../src/host/files.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../src/host/files.js')>()
  return {
    ...real,
    readTextFile: async (abs: string) => {
      state.reads++
      return real.readTextFile(abs)
    },
  }
})

let root: string
const services: MemoryService[] = []

async function createService(): Promise<MemoryService> {
  const service = await MemoryService.create(DEFAULT_CONFIG, root)
  services.push(service)
  return service
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'gam-inc-'))
  state.reads = 0
})

afterEach(async () => {
  for (const service of services.splice(0)) service.dispose()
  await rm(root, { recursive: true, force: true }).catch(() => {})
})

function many(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    kind: 'project' as const,
    title: `条目 ${i}`,
    summary: `第 ${i} 条摘要`,
    body: 'b',
    source: 'user-stated' as const,
  }))
}

describe('增量扫描（写入成本与条目数解耦）', () => {
  it('keeps file reads constant as the store grows', async () => {
    const service = await createService()
    await service.createMany(many(30))
    expect(service.list()).toHaveLength(30)

    const id = service.list()[0]!.meta.id
    state.reads = 0
    await service.update(id, '新正文')
    const smallStore = state.reads

    await service.createMany(many(60))
    expect(service.list()).toHaveLength(90)
    state.reads = 0
    await service.update(id, '更新的正文')
    const largeStore = state.reads

    // 旧实现在 30 条时就要 30+ 次读，90 条时 90+ 次；现在两条路径都只读
    // 「改动的那一个文件」+ 3 个派生文件的内容比对，与条目总数无关。
    expect(smallStore).toBeLessThan(10)
    expect(largeStore).toBeLessThan(10)
    expect((await service.read(id))?.body).toContain('更新的正文')
  }, 60000)

  it('looks a single entry up without rescanning the whole store', async () => {
    const service = await createService()
    await service.createMany(many(30))
    const id = service.list()[15]!.meta.id
    state.reads = 0
    const found = await service.read(id)
    expect(found?.meta.id).toBe(id)
    // 命中内存索引：一次读都不该发生（read 只走 store.get，不再全量扫描）
    expect(state.reads).toBe(0)

    // 查不到的 id 也不该触发全量扫描
    state.reads = 0
    expect(await service.read('m_00000000000000000000000000')).toBeNull()
    expect(state.reads).toBe(0)
  }, 60000)

  it('still notices edits made behind the store back', async () => {
    const service = await createService()
    const created = await service.create({ kind: 'feedback', title: '别加总结', summary: 's', body: '正文', source: 'user-stated' })
    const rel = created.rel
    const abs = path.join(root, rel)

    const original = await readFile(abs, 'utf8')
    await writeFile(abs, original.replace('title: 别加总结', 'title: 用户改过的标题'), 'utf8')

    // 外部改动必须被看见：指纹里的 size/mtimeMs 就是为这个存在的
    await service.refresh()
    expect(service.list()[0]!.meta.title).toBe('用户改过的标题')
  }, 60000)

  it('sees two of its own writes even inside the same millisecond', async () => {
    const service = await createService()
    const created = await service.create({ kind: 'reference', title: 't', summary: 's', body: 'b', source: 'user-stated' })
    const id = created.meta.id

    // 只改 frontmatter 的 stats.heat：文件大小可能不变、mtime 可能同一毫秒，
    // 靠写入世代计数器保证第二次写入一定可见（否则会读到第一次的旧值）。
    const store = service.store
    await store.patchMeta(id, (meta: Frontmatter) => ({ ...meta, stats: { ...meta.stats, heat: 0.1111 } }))
    await store.patchMeta(id, (meta: Frontmatter) => ({ ...meta, stats: { ...meta.stats, heat: 0.2222 } }))
    expect((await store.get(id))?.meta.stats.heat).toBe(0.2222)
  }, 60000)

  it('does not resurrect an entry that was invalidated in between', async () => {
    const store = new MemoryStore(root)
    await store.init('dev-test')
    const meta = store.buildMeta({ kind: 'reference', title: 't', summary: 's', body: 'b' })
    await store.put(meta, 'b')
    await store.invalidate(meta.id, { reason: 'x' })
    // 缓存必须跟着删：否则 get 会把已经移走的 active 副本当幽灵返回
    expect(await store.get(meta.id)).toBeNull()
    expect((await store.scan()).entries).toHaveLength(0)
  })
})
