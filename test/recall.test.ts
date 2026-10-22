import { describe, expect, it } from 'vitest'
import { SnapshotCache, Throttle, renderCatalogLayer, renderSnapshot, renderAlwaysLayer, fingerprintOf } from '../src/host/recall.js'
import { MemoryStore } from '../src/host/store.js'
import type { Entry } from '../src/host/model.js'

const store = new MemoryStore('/tmp/unused')

function entry(over: Partial<Parameters<MemoryStore['buildMeta']>[0]> & { id?: string } = {}): Entry {
  const input = {
    kind: 'feedback' as const,
    title: 'title',
    summary: 'summary',
    body: 'body',
    source: 'user-stated' as const,
    activation: 'always' as const,
    ...over,
  }
  const meta = store.buildMeta(input)
  return { meta: { ...meta, ...(over.id ? { id: over.id } : {}) }, body: 'body', rel: `${meta.kind}/${meta.id}.md` }
}

function entries(n: number): Entry[] {
  return Array.from({ length: n }, (_, i) =>
    entry({
      id: `m_${String(i).padStart(26, '0')}`,
      title: `记忆条目 ${i}`,
      summary: `第 ${i} 条记忆的摘要，用于目录层展示`,
      kind: i % 3 === 0 ? 'feedback' : i % 3 === 1 ? 'persona' : 'project',
      activation: i % 3 === 2 ? 'on_demand' : 'always',
      scope: i % 3 === 2 ? 'project' : 'global',
      ...(i % 3 === 2 ? { project: 'a1b2c3d4e5f6-demo' } : {}),
    }),
  )
}

const BUDGET = { alwaysChars: 2000, catalogChars: 1600, globChars: 1200 }

describe('原则 P4 · 逐字节幂等（契约测试）', () => {
  it('renders the same input to byte-identical output 100 times', () => {
    const list = entries(40)
    const first = renderSnapshot({ entries: list, mode: 'full', budget: BUDGET, ready: true })
    for (let i = 0; i < 100; i++) {
      const again = renderSnapshot({ entries: list, mode: 'full', budget: BUDGET, ready: true })
      expect(again.text).toBe(first.text)
      expect(again.fingerprint).toBe(first.fingerprint)
    }
  })

  it('is stable across entry insertion order (sorting must be deterministic)', () => {
    const list = entries(30)
    const shuffled = [...list].reverse()
    const a = renderSnapshot({ entries: list, mode: 'full', budget: BUDGET, ready: true })
    const b = renderSnapshot({ entries: shuffled, mode: 'full', budget: BUDGET, ready: true })
    expect(b.text).toBe(a.text)
  })

  it('never leaks a timestamp, relative time or random value into injected text', () => {
    const text = renderSnapshot({ entries: entries(20), mode: 'full', budget: BUDGET, ready: true }).text
    expect(text).not.toMatch(/\d{2}:\d{2}:\d{2}/)
    expect(text).not.toMatch(/(分钟前|小时前|刚刚|ago|minutes? ago|hours? ago)/)
    expect(text).not.toMatch(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}\b/)
    // 同一天内多次渲染必须一致：日期可以出现，时刻不行
    expect(renderSnapshot({ entries: entries(20), mode: 'full', budget: BUDGET, ready: true }).text).toBe(text)
  })

  it('returns the identical string instance when the fingerprint matches', () => {
    const cache = new SnapshotCache()
    const list = entries(10)
    const first = cache.get('s1', renderSnapshot({ entries: list, mode: 'full', budget: BUDGET, ready: true }))
    const second = cache.get('s1', renderSnapshot({ entries: list, mode: 'full', budget: BUDGET, ready: true }))
    expect(second).toBe(first)
    expect(cache.wasVerbatim('s1', fingerprintOf(first.text, 'full'))).toBe(true)
  })

  it('changes the fingerprint when the content actually changes', () => {
    const cache = new SnapshotCache()
    const a = cache.get('s1', renderSnapshot({ entries: entries(10), mode: 'full', budget: BUDGET, ready: true }))
    const b = cache.get('s1', renderSnapshot({ entries: entries(11), mode: 'full', budget: BUDGET, ready: true }))
    expect(b.fingerprint).not.toBe(a.fingerprint)
  })
})

describe('预算与裁剪', () => {
  it('keeps the always layer inside its hard cap', () => {
    const text = renderAlwaysLayer(entries(500), 2000)
    expect(text.length).toBeLessThanOrEqual(2200) // 头部 + 截断提示的余量
    expect(Buffer.byteLength(text, 'utf8')).toBeLessThanOrEqual(6000)
  })

  it('keeps the catalog inside its cap and reports what it dropped', () => {
    const { text, shown, omitted } = renderCatalogLayer(entries(200), 1600)
    expect(text.length).toBeLessThanOrEqual(1600)
    expect(shown).toBeGreaterThan(0)
    expect(omitted).toBeGreaterThan(0)
    // 尾行必须告诉模型「目录不完整」，否则它会以为没有更多记忆
    expect(text).toContain(`+${omitted} more via memory_recall`)
  })

  it('drops slim mode down to the always layer only', () => {
    const list = entries(20)
    const full = renderSnapshot({ entries: list, mode: 'full', budget: BUDGET, ready: true })
    const slim = renderSnapshot({ entries: list, mode: 'slim', budget: BUDGET, ready: true })
    expect(slim.chars.catalog).toBe(0)
    expect(slim.text.length).toBeLessThan(full.text.length)
  })

  it('renders a cold-start placeholder instead of an empty injection', () => {
    const cold = renderSnapshot({ entries: [], mode: 'cold', budget: BUDGET, ready: false })
    expect(cold.text.length).toBeGreaterThan(0)
    expect(cold.text).toContain('memory_recall')
  })

  it('renders nothing rather than an empty section when memory is empty', () => {
    const empty = renderSnapshot({ entries: [], mode: 'full', budget: BUDGET, ready: true })
    expect(empty.text).toBe('')
  })
})

describe('分层节流', () => {
  it('gives a full catalog to a human, every time', () => {
    const throttle = new Throttle(20, 8)
    for (let i = 0; i < 5; i++) expect(throttle.next({ ready: true, humanPresent: true })).toBe('human')
  })

  it('throttles to slim between full snapshots', () => {
    const throttle = new Throttle(20, 8)
    const modes = Array.from({ length: 25 }, () => throttle.next({ ready: true, humanPresent: false }))
    expect(modes.filter((m) => m === 'slim').length).toBeGreaterThan(0)
    expect(modes.filter((m) => m === 'full').length).toBeGreaterThan(0)
  })

  it('reports cold until the index is ready', () => {
    const throttle = new Throttle(20, 8)
    expect(throttle.next({ ready: false, humanPresent: true })).toBe('cold')
  })

  it('forces a full snapshot after a reset (compaction removed the durable copy)', () => {
    const throttle = new Throttle(20, 8)
    throttle.next({ ready: true, humanPresent: false })
    throttle.reset()
    expect(throttle.next({ ready: true, humanPresent: false })).toBe('full')
  })
})
