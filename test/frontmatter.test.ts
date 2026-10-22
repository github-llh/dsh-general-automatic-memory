import { describe, expect, it } from 'vitest'
import { FrontmatterError, parseFrontmatter, serializeEntry, splitDocument } from '../src/host/frontmatter.js'
import { checksumOf, computeHeat, estimateTokens, isoDate, ulid } from '../src/host/model.js'
import { MemoryStore } from '../src/host/store.js'

const BODY = `不要在回复末尾总结刚做的修改。

**Why:** 用户能自己读 diff，总结是纯噪声。

**How to apply:** 每次 Edit/Write 之后只输出下一步动作。
`

function sampleMeta() {
  return new MemoryStore('/tmp/unused').buildMeta({
    kind: 'feedback',
    title: '改完代码后不要加总结',
    summary: '用户能自己读 diff，禁止在回复末尾复述刚做的修改',
    body: BODY,
    source: 'user-stated',
    now: '2026-10-21T07:03:16.556Z',
    id: 'm_01J8ZK3M9QW7RTX2YVBN4C5D6E',
  })
}

describe('frontmatter', () => {
  it('round-trips without changing a single byte', () => {
    const meta = sampleMeta()
    const once = serializeEntry(meta, BODY)
    const twice = serializeEntry(meta, BODY)
    expect(twice).toBe(once)

    const parsed = parseFrontmatter(once, 'feedback/m_x.md')
    expect(parsed.meta.id).toBe(meta.id)
    expect(parsed.meta.kind).toBe('feedback')
    expect(parsed.meta.provenance.source).toBe('user-stated')
    expect(parsed.meta.temporal.validFrom).toBe('2026-10-21')
    expect(parsed.meta.privacy.shareable).toBe('none')
    expect(parsed.body.trim()).toBe(BODY.trim())
    // 重新序列化必须逐字节相同（checksum 只覆盖正文，所以 stats 变化不会破坏它）
    expect(serializeEntry(parsed.meta, parsed.body)).toBe(once)
  })

  it('checksum covers the body only', () => {
    const meta = sampleMeta()
    const doc = serializeEntry(meta, BODY)
    const parsed = parseFrontmatter(doc, 'x.md')
    expect(parsed.meta.checksum).toBe(checksumOf(parsed.body))
    // 用户手改正文 → checksum 随之改变，doctor 靠这个识别手工编辑
    const edited = doc.replace('纯噪声', '噪音')
    const reparsed = parseFrontmatter(edited, 'x.md')
    expect(reparsed.meta.checksum).not.toBe(parsed.meta.checksum)
  })

  it('rejects malformed documents instead of guessing', () => {
    expect(() => parseFrontmatter('no frontmatter here', 'x.md')).toThrow(FrontmatterError)
    expect(() => parseFrontmatter('---\nid: nope\n---\nbody\n', 'x.md')).toThrow(/id must match m_<ULID>/)
    expect(() => parseFrontmatter('---\nid: m_01J8ZK3M9QW7RTX2YVBN4C5D6E\nkind: bogus\ntitle: t\nsummary: s\nscope: global\nactivation: on_demand\nconfidence: high\nprovenance:\n  source: manual\n  createdAt: 2026-10-21T00:00:00Z\n  createdBy: dsh\ntemporal:\n  observedAt: 2026-10-21\n  validFrom: 2026-10-21\nstats: {}\nlinks: {}\nprivacy:\n  pii: false\n  sensitive: false\n  shareable: none\n---\nbody\n', 'x.md')).toThrow(/kind must be one of/)
  })

  it('requires a summary — it is the only text the catalog layer shows', () => {
    const doc = serializeEntry({ ...sampleMeta(), summary: '' }, BODY)
    expect(() => parseFrontmatter(doc, 'x.md')).toThrow(/summary must not be empty/)
  })

  it('rejects activation=glob without globs', () => {
    expect(() =>
      new MemoryStore('/tmp/unused').buildMeta({ kind: 'project', title: 't', summary: 's', body: 'b', activation: 'glob' }),
    ).toThrow(/requires at least one glob/)
  })

  it('keeps dates as plain strings, never Date objects', () => {
    const { raw } = splitDocument(serializeEntry(sampleMeta(), BODY))
    expect(raw).toContain('observedAt: 2026-10-21')
    expect(raw).not.toContain('!!timestamp')
    // CORE_SCHEMA 下裸日期就是字符串，不会被解析成 Date 再序列化出别的格式
    expect(parseFrontmatter(serializeEntry(sampleMeta(), BODY), 'x.md').meta.temporal.observedAt).toBe('2026-10-21')
  })
})

describe('model', () => {
  it('generates monotonic, sortable ULIDs', () => {
    const ids = Array.from({ length: 500 }, () => ulid(1_792_566_196_613))
    expect(new Set(ids).size).toBe(ids.length)
    const sorted = [...ids].sort()
    expect(sorted).toEqual(ids)
    for (const id of ids) expect(id).toMatch(/^m_[0-9A-HJKMNP-TV-Z]{26}$/)
  })

  it('never decays feedback-style memories below usefulness', () => {
    const hot = computeHeat({ hits: 6, lastUsedAt: new Date().toISOString() })
    const cold = computeHeat({ hits: 0, lastUsedAt: null })
    expect(hot).toBeGreaterThan(cold)
    expect(hot).toBeLessThanOrEqual(1)
  })

  it('estimates CJK as denser than latin per character', () => {
    const cjk = estimateTokens('记忆索引目录层')
    const latin = estimateTokens('abcdefgh')
    expect(cjk / 7).toBeGreaterThan(latin / 8)
  })

  it('formats dates without locale dependence (prefix-cache stability)', () => {
    expect(isoDate(new Date('2026-10-21T07:03:16.556Z'))).toBe('2026-10-21')
    expect(isoDate(new Date('2026-10-21T07:03:16.556Z'))).toBe(isoDate(new Date('2026-10-21T23:59:00.000Z')))
  })
})
