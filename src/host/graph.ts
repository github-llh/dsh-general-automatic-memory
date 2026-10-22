import type { Confidence, Entry } from './model.js'

/**
 * 族谱视图模型。
 *
 * 关系记忆本身只有 `entities: string[]`，没有类型。这里在 Host 侧做一次**确定性推断**，
 * 把实体分成项目/代码/人员/团队/操作/系统/概念七个维度，并带上项目归属与关系类型，
 * 面板才能做多维筛选、按项目聚类和节点着色。推断只是启发式，面板永远显示原始实体名。
 */
export type GraphNodeType = 'project' | 'code' | 'person' | 'team' | 'action' | 'system' | 'concept'

export const NODE_TYPE_ORDER: readonly GraphNodeType[] = [
  'project',
  'code',
  'person',
  'team',
  'action',
  'system',
  'concept',
]

export const REL_TYPE_ORDER = [
  'owns',
  'belongs',
  'depends',
  'uses',
  'hosts',
  'participates',
  'supersedes',
  'conflicts',
  'related',
] as const
export type GraphRelType = (typeof REL_TYPE_ORDER)[number]

/** 没有 project 字段的关系归到这里；客户端负责本地化标签。 */
export const UNASSIGNED_PROJECT = '__unassigned__'

export interface GraphNodeView {
  id: string
  type: GraphNodeType
  /** 关联关系数（同一实体对可能出现多条关系） */
  degree: number
  /** 按出现次数降序的主项目候选；第一个即主归属 */
  projects: string[]
  /** 涉及多少条不同的关系记忆 */
  entries: number
  firstSeen: string
  lastSeen: string
}

export interface GraphEdgeView {
  id: string
  /** 产生这条边的记忆条目 id；多实体关系会从同一 entryId 派生多条边 */
  entryId: string
  from: string
  to: string
  rel: string
  relType: GraphRelType
  confidence: Confidence
  summary: string
  project?: string
  tags: string[]
  source: string
  createdAt: string
  /** 两端实体的主项目不同（两边都必须有项目归属） */
  crossProject: boolean
  entities: string[]
}

export interface GraphFacet {
  id: string
  label: string
  count: number
}

export interface GraphPayload {
  nodes: GraphNodeView[]
  edges: GraphEdgeView[]
  projects: GraphFacet[]
  nodeTypes: GraphFacet[]
  relTypes: GraphFacet[]
  sources: GraphFacet[]
  tags: GraphFacet[]
  total: {
    nodes: number
    edges: number
    relations: number
    relationsShown: number
    projects: number
  }
  limit: number
  truncated: boolean
  mermaid: string
}

export interface BuildGraphOptions {
  /** 最多载入多少条关系记忆；默认 800，硬上限 3000。 */
  limit?: number
}

export const DEFAULT_GRAPH_LIMIT = 800
export const MAX_GRAPH_LIMIT = 3000

const PERSON_TAGS = new Set([
  'person',
  'people',
  'user',
  'owner',
  'member',
  'contact',
  '人员',
  '用户',
  '负责人',
  '联系人',
  '个人',
])
const TEAM_TAGS = new Set([
  'team',
  'org',
  'organization',
  'group',
  'department',
  '团队',
  '组织',
  '小组',
  '部门',
  '中心',
])

const FILE_HINT =
  /\.(ts|tsx|js|jsx|mjs|cjs|md|sql|yml|yaml|json|py|java|go|rs|css|html|sh|toml)$/i
const CODE_HINT =
  /(^|[-_/ ])(server|client|service|module|repo|sdk|api|ui|db|sqlite|fts|cordis|dsh|plugin|component|hook|route|gate|index|script|gateway|worker|backend|frontend)([-_/ ]|$)/i
const SYSTEM_HINT =
  /(系统|平台|服务|网关|中间件|数据库|缓存|队列|集群|环境|仓库|流水线|管道|framework|platform|gateway|database|cache|queue|cluster|middleware|pipeline)/i
const ACTION_HINT =
  /(启动|修复|提交|导入|导出|回滚|重构|部署|发版|评审|排查|定位|优化|接管|归档|固化|同步|冲突|回退|上线|下线|巡检|压测|监控|告警|处理|操作|发布|恢复|备份|迁移|决策|审批|测试|验收|联调|演练|deploy|release|migrate|rollback|refactor|review|debug|fix|ship|test|audit|approve|restore|backup|monitor|optimi[sz]e|import|export)/i
const PROJECT_HINT = /(项目|工程|product|project)$/i
const TEAM_HINT = /(团队|小组|部门|中心|委员会|group|team|org|department)$/i
const ROLE_HINT =
  /^(前端|后端|客户端|服务端|移动端|运维|测试|设计|产品|研发|开发|数据|算法|安全|运营|市场|销售|frontend|backend|devops|qa|design|product|research|data|security|ops|sre)$/i

const REL_RULES: Array<{ id: GraphRelType; pattern: RegExp }> = [
  { id: 'owns', pattern: /负责|拥有|主导|owner|owns|owned/ },
  { id: 'belongs', pattern: /属于|隶属|汇报|belongs/ },
  { id: 'depends', pattern: /依赖|需要|基于|depend|require/ },
  { id: 'uses', pattern: /使用|采用|调用|接入|uses?|using/ },
  { id: 'hosts', pattern: /位于|部署|运行在|host/ },
  { id: 'participates', pattern: /参与|协作|配合|participat/ },
  { id: 'supersedes', pattern: /取代|替换|替代|supersede|replace/ },
  { id: 'conflicts', pattern: /冲突|矛盾|conflict/ },
]

/** 关系类型 id 用于筛选与统计；面板再映射成本地化标签。 */
export function relationTypeOf(title: string): GraphRelType {
  const text = title.toLowerCase()
  for (const rule of REL_RULES) if (rule.pattern.test(text)) return rule.id
  return 'related'
}

/**
 * 项目归属加权：`属于/部署于` 比跨项目依赖更能说明实体「家」在哪，
 * `负责` 次之，普通依赖/使用/参与按 1 计。否则一条跨项目关系会把两端
 * 同时拉进同一个项目，跨项目依赖就永远检测不出来。
 */
function projectVoteWeight(type: GraphRelType): number {
  if (type === 'belongs' || type === 'hosts') return 3
  if (type === 'owns') return 2
  return 1
}

export interface ClassifyContext {
  projects: Set<string>
  projectLabels: Set<string>
  people: Set<string>
  teams: Set<string>
}

export function classifyEntity(entity: string, context: ClassifyContext): GraphNodeType {
  const normalized = entity.trim()
  if (!normalized) return 'concept'
  if (context.people.has(normalized)) return 'person'
  if (context.teams.has(normalized)) return 'team'
  if (context.projects.has(normalized) || context.projectLabels.has(normalized)) return 'project'
  if (PROJECT_HINT.test(normalized)) return 'project'
  if (FILE_HINT.test(normalized) || CODE_HINT.test(normalized)) return 'code'
  if (SYSTEM_HINT.test(normalized)) return 'system'
  if (ACTION_HINT.test(normalized)) return 'action'
  return 'concept'
}

function looksTechnical(entity: string, context: { projects: Set<string>; projectLabels: Set<string> }): boolean {
  return (
    context.projects.has(entity) ||
    context.projectLabels.has(entity) ||
    FILE_HINT.test(entity) ||
    CODE_HINT.test(entity) ||
    SYSTEM_HINT.test(entity) ||
    ACTION_HINT.test(entity) ||
    PROJECT_HINT.test(entity)
  )
}

function normalizeEntities(entities: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of entities) {
    const value = raw.trim()
    if (!value || seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

function escapeMermaid(value: string): string {
  return value.replace(/"/g, "'").replace(/\|/g, '/').replace(/\s+/g, ' ').trim()
}

function buildMermaid(nodes: GraphNodeView[], edges: GraphEdgeView[]): string {
  const index = new Map(nodes.map((node, i) => [node.id, `n${i}`]))
  const lines = ['graph LR']
  for (const node of nodes) lines.push(`  ${index.get(node.id)}["${escapeMermaid(node.id)}"]`)
  for (const edge of edges) {
    const from = index.get(edge.from)
    const to = index.get(edge.to)
    if (!from || !to) continue
    lines.push(`  ${from} -->|${escapeMermaid(edge.rel)}| ${to}`)
  }
  return lines.join('\n')
}

function clampLimit(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return DEFAULT_GRAPH_LIMIT
  return Math.max(1, Math.min(MAX_GRAPH_LIMIT, Math.floor(value)))
}

export function buildGraph(entries: Entry[], options: BuildGraphOptions = {}): GraphPayload {
  const limit = clampLimit(options.limit)
  const active = entries.filter(
    (entry) => entry.meta.kind === 'relations' && entry.meta.temporal.invalidatedAt === null,
  )
  const relations = active
    .sort((a, b) => (a.meta.provenance.createdAt < b.meta.provenance.createdAt ? 1 : -1))
    .slice(0, limit)

  // 项目标签只从 project 条目取；普通条目里的 project 字段只提供 slug。
  const projects = new Set<string>()
  const projectLabels = new Set<string>()
  const projectLabelById = new Map<string, string>()
  const projectLabelAt = new Map<string, string>()
  for (const entry of entries) {
    if (entry.meta.kind !== 'project' || entry.meta.temporal.invalidatedAt !== null) continue
    const label = entry.meta.title.trim()
    if (label) projectLabels.add(label)
    if (!entry.meta.project) continue
    projects.add(entry.meta.project)
    if (!label) continue
    const previousAt = projectLabelAt.get(entry.meta.project)
    if (previousAt === undefined || previousAt < entry.meta.provenance.createdAt) {
      projectLabelAt.set(entry.meta.project, entry.meta.provenance.createdAt)
      projectLabelById.set(entry.meta.project, label)
    }
  }
  for (const entry of entries) {
    if (entry.meta.temporal.invalidatedAt === null && entry.meta.project) projects.add(entry.meta.project)
  }

  const people = new Set<string>()
  const teams = new Set<string>()
  for (const entry of relations) {
    const tags = entry.meta.tags.map((tag) => tag.toLowerCase())
    const entities = normalizeEntities(entry.meta.entities)
    if (tags.some((tag) => PERSON_TAGS.has(tag))) for (const entity of entities) people.add(entity)
    if (tags.some((tag) => TEAM_TAGS.has(tag))) for (const entity of entities) teams.add(entity)
  }
  // 规则抽取只给关系打「relation + 关系词」标签，人员往往只能从「X 负责 Y」的主语推断。
  for (const entry of relations) {
    const type = relationTypeOf(entry.meta.title)
    if (type !== 'owns' && type !== 'participates') continue
    const entities = normalizeEntities(entry.meta.entities)
    const subject = entities[0]
    if (!subject) continue
    if (TEAM_HINT.test(subject) || ROLE_HINT.test(subject)) {
      teams.add(subject)
      continue
    }
    if (looksTechnical(subject, { projects, projectLabels })) continue
    people.add(subject)
    const object = entities[1]
    if (object && (TEAM_HINT.test(object) || ROLE_HINT.test(object))) teams.add(object)
  }

  const nodeProjectVotes = new Map<string, Map<string, number>>()
  const nodeDegree = new Map<string, number>()
  const nodeEntries = new Map<string, Set<string>>()
  const nodeFirst = new Map<string, string>()
  const nodeLast = new Map<string, string>()

  const edges: GraphEdgeView[] = []
  for (const entry of relations) {
    const entities = normalizeEntities(entry.meta.entities)
    if (entities.length < 2) continue
    const project = entry.meta.project ?? undefined
    const relType = relationTypeOf(entry.meta.title)
    for (let i = 1; i < entities.length; i++) {
      const from = entities[0]
      const to = entities[i]
      if (!from || !to || from === to) continue
      edges.push({
        id: i === 1 ? entry.meta.id : `${entry.meta.id}~${i}`,
        entryId: entry.meta.id,
        from,
        to,
        rel: entry.meta.title,
        relType,
        confidence: entry.meta.confidence,
        summary: entry.meta.summary,
        ...(project ? { project } : {}),
        tags: entry.meta.tags,
        source: entry.meta.provenance.source,
        createdAt: entry.meta.provenance.createdAt,
        crossProject: false,
        entities,
      })
      for (const node of [from, to]) {
        nodeDegree.set(node, (nodeDegree.get(node) ?? 0) + 1)
        const entrySet = nodeEntries.get(node) ?? new Set<string>()
        entrySet.add(entry.meta.id)
        nodeEntries.set(node, entrySet)
        const first = nodeFirst.get(node)
        if (first === undefined || first > entry.meta.provenance.createdAt) nodeFirst.set(node, entry.meta.provenance.createdAt)
        const last = nodeLast.get(node)
        if (last === undefined || last < entry.meta.provenance.createdAt) nodeLast.set(node, entry.meta.provenance.createdAt)
        if (!project) continue
        const votes = nodeProjectVotes.get(node) ?? new Map<string, number>()
        votes.set(project, (votes.get(project) ?? 0) + projectVoteWeight(relType))
        nodeProjectVotes.set(node, votes)
      }
    }
  }

  const nodeIds = [...new Set(edges.flatMap((edge) => [edge.from, edge.to]))].sort()
  const nodes: GraphNodeView[] = nodeIds.map((id) => {
    const votes = nodeProjectVotes.get(id)
    const nodeProjects = votes
      ? [...votes.entries()]
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([project]) => project)
      : []
    return {
      id,
      type: classifyEntity(id, { projects, projectLabels, people, teams }),
      degree: nodeDegree.get(id) ?? 0,
      projects: nodeProjects,
      entries: nodeEntries.get(id)?.size ?? 0,
      firstSeen: nodeFirst.get(id) ?? '',
      lastSeen: nodeLast.get(id) ?? '',
    }
  })
  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  for (const edge of edges) {
    const from = nodeById.get(edge.from)
    const to = nodeById.get(edge.to)
    const fromProject = from?.projects[0]
    const toProject = to?.projects[0]
    edge.crossProject = fromProject !== undefined && toProject !== undefined && fromProject !== toProject
  }

  const projectCounts = new Map<string, number>()
  for (const edge of edges) {
    const id = edge.project ?? UNASSIGNED_PROJECT
    projectCounts.set(id, (projectCounts.get(id) ?? 0) + 1)
  }
  const projectFacets: GraphFacet[] = [...projectCounts.entries()]
    .map(([id, count]) => ({
      id,
      label: id === UNASSIGNED_PROJECT ? id : projectLabelById.get(id) ?? id,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  const typeCounts = new Map<GraphNodeType, number>()
  for (const node of nodes) typeCounts.set(node.type, (typeCounts.get(node.type) ?? 0) + 1)
  const nodeTypeFacets: GraphFacet[] = NODE_TYPE_ORDER.filter((type) => (typeCounts.get(type) ?? 0) > 0).map(
    (type) => ({ id: type, label: type, count: typeCounts.get(type) ?? 0 }),
  )

  const relCounts = new Map<string, number>()
  for (const edge of edges) relCounts.set(edge.relType, (relCounts.get(edge.relType) ?? 0) + 1)
  const relTypeFacets: GraphFacet[] = REL_TYPE_ORDER.filter((type) => (relCounts.get(type) ?? 0) > 0).map(
    (type) => ({ id: type, label: type, count: relCounts.get(type) ?? 0 }),
  )

  const sourceCounts = new Map<string, number>()
  for (const edge of edges) sourceCounts.set(edge.source, (sourceCounts.get(edge.source) ?? 0) + 1)
  const sourceFacets: GraphFacet[] = [...sourceCounts.entries()]
    .map(([id, count]) => ({ id, label: id, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  // 'relation' 与关系词本身不是有用的标签维度，加入筛选只会制造噪音。
  const tagCounts = new Map<string, { label: string; count: number }>()
  for (const edge of edges) {
    for (const raw of edge.tags) {
      const label = raw.trim()
      if (!label) continue
      const lower = label.toLowerCase()
      if (lower === 'relation' || lower === '关系') continue
      if (relationTypeOf(label) !== 'related') continue
      const current = tagCounts.get(lower)
      if (current) current.count += 1
      else tagCounts.set(lower, { label, count: 1 })
    }
  }
  const tagFacets: GraphFacet[] = [...tagCounts.entries()]
    .map(([id, value]) => ({ id, label: value.label, count: value.count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 24)

  const realProjects = new Set<string>()
  for (const edge of edges) if (edge.project) realProjects.add(edge.project)
  for (const node of nodes) for (const project of node.projects) realProjects.add(project)

  return {
    nodes,
    edges,
    projects: projectFacets,
    nodeTypes: nodeTypeFacets,
    relTypes: relTypeFacets,
    sources: sourceFacets,
    tags: tagFacets,
    total: {
      nodes: nodes.length,
      edges: edges.length,
      relations: active.length,
      relationsShown: relations.length,
      projects: realProjects.size,
    },
    limit,
    truncated: active.length > relations.length,
    mermaid: buildMermaid(nodes, edges),
  }
}

