import { describe, expect, it } from 'vitest'
import {
  buildGraph,
  classifyEntity,
  relationTypeOf,
  UNASSIGNED_PROJECT,
  type GraphNodeType,
} from '../src/host/graph.js'
import type { Confidence, Entry, Kind } from '../src/host/model.js'

let sequence = 0

function entry(input: {
  kind: Kind
  title: string
  entities?: string[]
  project?: string
  tags?: string[]
  summary?: string
  confidence?: Confidence
  invalidatedAt?: string | null
}): Entry {
  sequence += 1
  const createdAt = `2026-01-01T00:00:${String(sequence % 60).padStart(2, '0')}.000Z`
  return {
    meta: {
      id: `m_${String(sequence).padStart(26, '0')}`,
      kind: input.kind,
      title: input.title,
      summary: input.summary ?? input.title,
      scope: input.project ? 'project' : 'global',
      ...(input.project ? { project: input.project } : {}),
      tags: input.tags ?? [],
      entities: input.entities ?? [],
      activation: 'on_demand',
      globs: [],
      confidence: input.confidence ?? 'high',
      provenance: { source: 'user-stated', createdAt, createdBy: 'test' },
      temporal: {
        observedAt: createdAt,
        validFrom: createdAt,
        invalidatedAt: input.invalidatedAt ?? null,
        supersededBy: null,
        expiresAt: null,
      },
      stats: { revisions: 1, hits: 0, lastUsedAt: null, heat: 0 },
      links: { relates: [], derivedFrom: [], conflictsWith: [] },
      privacy: { pii: false, sensitive: false, shareable: 'none' },
      checksum: 'sha256:test',
    },
    body: '',
    rel: 'relations/test.md',
  }
}

function fixture(): Entry[] {
  return [
    entry({ kind: 'project', title: '支付平台', project: 'pay' }),
    entry({ kind: 'project', title: '基础设施', project: 'infra' }),
    entry({ kind: 'relations', title: '张三 负责 支付网关', entities: ['张三', '支付网关'], project: 'pay', tags: ['relation', '负责', 'core'] }),
    entry({ kind: 'relations', title: '支付网关 依赖 billing.ts', entities: ['支付网关', 'billing.ts'], project: 'pay', tags: ['relation', '依赖'] }),
    entry({ kind: 'relations', title: '支付团队 参与 支付网关', entities: ['支付团队', '支付网关'], project: 'pay', tags: ['relation', '参与'] }),
    entry({ kind: 'relations', title: '灰度发布 属于 基础设施', entities: ['灰度发布', '基础设施'], project: 'infra', tags: ['relation', '属于'] }),
    entry({ kind: 'relations', title: 'billing.ts 属于 基础设施', entities: ['billing.ts', '基础设施'], project: 'infra', tags: ['relation', '属于'] }),
    entry({ kind: 'relations', title: '支付平台 依赖 支付网关', entities: ['支付平台', '支付网关'], project: 'pay', tags: ['relation', '依赖'] }),
    entry({ kind: 'relations', title: '订单 依赖 支付网关', entities: ['订单', '支付网关'], project: 'pay', tags: ['relation', '依赖'] }),
    entry({ kind: 'relations', title: '张三 参与 基础设施', entities: ['张三', '基础设施'], project: 'infra', tags: ['relation', '参与'] }),
    entry({ kind: 'relations', title: '李四 负责 巡检', entities: ['李四', '巡检'], tags: ['relation', '负责'] }),
  ]
}

function nodeTypeOf(entries: Entry[], id: string): GraphNodeType | undefined {
  return buildGraph(entries).nodes.find((node) => node.id === id)?.type
}

describe('族谱实体推断', () => {
  it('classifies projects, people, teams, code, actions, systems and concepts', () => {
    const entries = fixture()
    expect(nodeTypeOf(entries, '支付平台')).toBe('project')
    expect(nodeTypeOf(entries, '基础设施')).toBe('project')
    expect(nodeTypeOf(entries, '张三')).toBe('person')
    expect(nodeTypeOf(entries, '李四')).toBe('person')
    expect(nodeTypeOf(entries, '支付团队')).toBe('team')
    expect(nodeTypeOf(entries, 'billing.ts')).toBe('code')
    expect(nodeTypeOf(entries, '灰度发布')).toBe('action')
    expect(nodeTypeOf(entries, '巡检')).toBe('action')
    expect(nodeTypeOf(entries, '支付网关')).toBe('system')
    expect(nodeTypeOf(entries, '订单')).toBe('concept')
    expect(relationTypeOf('张三 负责 支付网关')).toBe('owns')
    expect(relationTypeOf('支付网关 依赖 billing.ts')).toBe('depends')
    expect(relationTypeOf('未知关系')).toBe('related')
  })

  it('keeps explicit people tags above the project/code heuristics', () => {
    const entities = new Set<string>()
    const type = classifyEntity('支付网关', {
      projects: new Set(['pay']),
      projectLabels: new Set(['支付平台']),
      people: entities,
      teams: new Set(),
    })
    expect(type).toBe('system')
    entities.add('支付网关')
    expect(
      classifyEntity('支付网关', {
        projects: new Set(['pay']),
        projectLabels: new Set(['支付平台']),
        people: entities,
        teams: new Set(),
      }),
    ).toBe('person')
  })
})

describe('族谱项目与跨项目关系', () => {
  it('tracks multi-project membership and marks cross-project edges', () => {
    const payload = buildGraph(fixture())
    const zhang = payload.nodes.find((node) => node.id === '张三')
    expect(zhang?.projects.sort()).toEqual(['infra', 'pay'])
    const cross = payload.edges.find((edge) => edge.from === '支付网关' && edge.to === 'billing.ts')
    expect(cross?.crossProject).toBe(true)
    const internal = payload.edges.find((edge) => edge.from === '支付平台' && edge.to === '支付网关')
    expect(internal?.crossProject).toBe(false)
  })

  it('builds project, type and tag facets without relation noise', () => {
    const payload = buildGraph(fixture())
    const pay = payload.projects.find((project) => project.id === 'pay')
    expect(pay?.label).toBe('支付平台')
    expect(pay?.count).toBeGreaterThan(0)
    expect(payload.projects.some((project) => project.id === UNASSIGNED_PROJECT)).toBe(true)
    expect(payload.nodeTypes.map((facet) => facet.id)).toEqual(
      expect.arrayContaining(['project', 'code', 'person', 'team', 'action', 'system', 'concept']),
    )
    expect(payload.relTypes.map((facet) => facet.id)).toEqual(expect.arrayContaining(['owns', 'depends', 'belongs', 'participates']))
    expect(payload.tags.map((facet) => facet.id)).toContain('core')
    expect(payload.tags.map((facet) => facet.id)).not.toContain('relation')
    expect(payload.tags.map((facet) => facet.id)).not.toContain('负责')
    expect(payload.sources[0]?.id).toBe('user-stated')
    expect(payload.total.projects).toBe(2)
  })
})

describe('族谱性能护栏与边界', () => {
  it('excludes invalidated relations and respects the load limit', () => {
    const entries = [
      ...fixture(),
      entry({
        kind: 'relations',
        title: '旧关系 依赖 旧模块',
        entities: ['旧关系', '旧模块'],
        project: 'pay',
        invalidatedAt: '2026-02-01T00:00:00.000Z',
      }),
    ]
    expect(buildGraph(entries).nodes.some((node) => node.id === '旧关系')).toBe(false)
    const limited = buildGraph(entries, { limit: 2 })
    expect(limited.edges.length).toBeLessThanOrEqual(2)
    expect(limited.truncated).toBe(true)
    expect(limited.total.relationsShown).toBe(2)
    expect(limited.total.relations).toBeGreaterThan(2)
    expect(limited.limit).toBe(2)
  })

  it('derives one edge per extra entity and keeps a single entryId', () => {
    const payload = buildGraph([
      entry({ kind: 'relations', title: 'A 参与 B 和 C', entities: ['A', 'B', 'C'], project: 'pay' }),
    ])
    expect(payload.edges).toHaveLength(2)
    expect(new Set(payload.edges.map((edge) => edge.id)).size).toBe(2)
    expect(new Set(payload.edges.map((edge) => edge.entryId)).size).toBe(1)
  })

  it('escapes Mermaid labels', () => {
    const payload = buildGraph([
      entry({ kind: 'relations', title: 'X | "Y" 依赖 Z', entities: ['X | "Y"', 'Z'], project: 'pay' }),
    ])
    expect(payload.mermaid).toContain("graph LR")
    expect(payload.mermaid).not.toContain('|"Y"|')
    expect(payload.mermaid).toContain("X / 'Y'")
  })
})
