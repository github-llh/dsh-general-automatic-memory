import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import {
  api,
  type GraphEdge,
  type GraphFacet,
  type GraphNode,
  type GraphNodeType,
  type GraphPayload,
  type GraphRelType,
} from './api.js'
import {
  Badge,
  Button,
  Card,
  CopyButton,
  EmptyState,
  ErrorState,
  IconArrowRight,
  IconCheck,
  IconChevronRight,
  IconClose,
  IconCopy,
  IconFilter,
  IconFit,
  IconGraph,
  IconGraphView,
  IconInfo,
  IconList,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconSparkle,
  IconButton,
  Kbd,
  PageHeader,
  SearchInput,
  Segmented,
  SelectField,
  SkeletonList,
  Spinner,
  cx,
  formatDate,
  formatNumber,
  formatRelative,
  interpolate,
  shortId,
  type Tone,
  type Translate,
} from './ui.js'

type PanelView = 'overview' | 'browse' | 'import' | 'timeline' | 'graph' | 'audit' | 'recovery' | 'settings'
type ViewMode = 'graph' | 'list' | 'insight'
type LayoutMode = 'force' | 'project' | 'type'
type GroupBy = 'project' | 'relation' | 'confidence' | 'none'
type Confidence = GraphEdge['confidence']

const UNASSIGNED_PROJECT = '__unassigned__'
const DEFAULT_LIMIT = 800
const MAX_LIMIT = 3000
const NODE_TYPE_ORDER: GraphNodeType[] = ['project', 'code', 'person', 'team', 'action', 'system', 'concept']
const REL_TYPE_ORDER: GraphRelType[] = [
  'owns',
  'belongs',
  'depends',
  'uses',
  'hosts',
  'participates',
  'supersedes',
  'conflicts',
  'related',
]
const CONFIDENCE_ORDER: Confidence[] = ['high', 'medium', 'low']
const TIME_RANGES = [0, 7, 30, 90, 365] as const

export interface GraphViewProps {
  t: Translate
  version: number
  onOpen: (id: string) => void
  onNavigate: (view: PanelView) => void
  toast: (message: string, tone?: Tone) => void
}

// ---------------------------------------------------------------------------
// 标签与筛选
// ---------------------------------------------------------------------------

function text(t: Translate, key: string, fallback: string): string {
  const value = t(key)
  return value === key ? fallback : value
}

function nodeTypeLabel(t: Translate, type: GraphNodeType): string {
  return text(t, `graph.nodeType.${type}`, type)
}

function relTypeLabel(t: Translate, type: string): string {
  return text(t, `graph.relType.${type}`, type)
}

function confidenceLabel(t: Translate, value: string): string {
  return text(t, `graph.confidence.${value}`, value)
}

function sourceLabel(t: Translate, value: string): string {
  return text(t, `graph.source.${value}`, value)
}

function timeLabel(t: Translate, days: number): string {
  if (days === 0) return t('graph.timeAll')
  if (days === 365) return t('graph.timeYear')
  return interpolate(t('graph.timeDays'), { days })
}

function projectTone(id: string): number {
  if (id === UNASSIGNED_PROJECT) return 6
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return hash % 6
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = (hash * 33 + value.charCodeAt(i)) >>> 0
  return hash
}

interface GraphFilters {
  projects: string[]
  types: GraphNodeType[]
  rels: GraphRelType[]
  confidences: Confidence[]
  sources: string[]
  tags: string[]
  days: number
  crossOnly: boolean
}

function blankFilters(): GraphFilters {
  return { projects: [], types: [], rels: [], confidences: [], sources: [], tags: [], days: 0, crossOnly: false }
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function activeFilterCount(filters: GraphFilters): number {
  return (
    filters.projects.length +
    filters.types.length +
    filters.rels.length +
    filters.confidences.length +
    filters.sources.length +
    filters.tags.length +
    (filters.days > 0 ? 1 : 0) +
    (filters.crossOnly ? 1 : 0)
  )
}

interface FilteredGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  nodeById: Map<string, GraphNode>
}

function filterGraph(data: GraphPayload, filters: GraphFilters): FilteredGraph {
  const fullNodeById = new Map(data.nodes.map((node) => [node.id, node]))
  const projectSet = new Set(filters.projects)
  const typeSet = new Set(filters.types)
  const relSet = new Set(filters.rels)
  const confidenceSet = new Set(filters.confidences)
  const sourceSet = new Set(filters.sources)
  const tagSet = new Set(filters.tags)
  const cutoff = filters.days > 0 ? Date.now() - filters.days * 86_400_000 : 0

  const edges: GraphEdge[] = []
  for (const edge of data.edges) {
    if (projectSet.size > 0 && !projectSet.has(edge.project ?? UNASSIGNED_PROJECT)) continue
    if (relSet.size > 0 && !relSet.has(edge.relType)) continue
    if (confidenceSet.size > 0 && !confidenceSet.has(edge.confidence)) continue
    if (sourceSet.size > 0 && !sourceSet.has(edge.source)) continue
    if (tagSet.size > 0 && !edge.tags.some((tag) => tagSet.has(tag.toLowerCase()))) continue
    if (filters.crossOnly && !edge.crossProject) continue
    if (cutoff > 0) {
      const time = Date.parse(edge.createdAt)
      if (!Number.isFinite(time) || time < cutoff) continue
    }
    if (typeSet.size > 0) {
      const fromType = fullNodeById.get(edge.from)?.type
      const toType = fullNodeById.get(edge.to)?.type
      if (!fromType || !toType || !typeSet.has(fromType) || !typeSet.has(toType)) continue
    }
    edges.push(edge)
  }

  const ids = new Set<string>()
  for (const edge of edges) {
    ids.add(edge.from)
    ids.add(edge.to)
  }
  const nodes = data.nodes.filter((node) => ids.has(node.id))
  return { nodes, edges, nodeById: new Map(nodes.map((node) => [node.id, node])) }
}

interface GraphMatch {
  nodes: Set<string>
  edges: Set<string>
  reach: Set<string>
  active: boolean
  miss: boolean
}

const EMPTY_MATCH: GraphMatch = { nodes: new Set(), edges: new Set(), reach: new Set(), active: false, miss: false }

function computeMatch(
  nodes: GraphNode[],
  edges: GraphEdge[],
  query: string,
  projectLabel: (id: string) => string,
  typeLabel: (type: GraphNodeType) => string,
  relationLabel: (type: string) => string,
): GraphMatch {
  const needle = query.trim().toLowerCase()
  if (!needle) return EMPTY_MATCH
  const matchedNodes = new Set<string>()
  const matchedEdges = new Set<string>()
  const reach = new Set<string>()
  for (const node of nodes) {
    const hit =
      node.id.toLowerCase().includes(needle) ||
      typeLabel(node.type).toLowerCase().includes(needle) ||
      node.projects.some((project) => projectLabel(project).toLowerCase().includes(needle))
    if (!hit) continue
    matchedNodes.add(node.id)
    reach.add(node.id)
  }
  for (const edge of edges) {
    const hit =
      edge.rel.toLowerCase().includes(needle) ||
      edge.summary.toLowerCase().includes(needle) ||
      relationLabel(edge.relType).toLowerCase().includes(needle) ||
      edge.tags.some((tag) => tag.toLowerCase().includes(needle))
    if (!hit) continue
    matchedEdges.add(edge.id)
    reach.add(edge.from)
    reach.add(edge.to)
  }
  const active = matchedNodes.size > 0 || matchedEdges.size > 0
  return { nodes: matchedNodes, edges: matchedEdges, reach, active, miss: !active }
}

function facetWithSelected(facets: GraphFacet[], selected: string[]): GraphFacet[] {
  const seen = new Set(facets.map((facet) => facet.id))
  const extra = selected.filter((id) => !seen.has(id)).map((id) => ({ id, label: id, count: 0 }))
  return extra.length > 0 ? [...facets, ...extra] : facets
}

// ---------------------------------------------------------------------------
// 布局（自绘、确定性、无第三方图库）
// ---------------------------------------------------------------------------

interface Positioned {
  x: number
  y: number
}

interface GraphGroupBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  count: number
  ids: string[]
}

interface GraphLayout {
  positions: Map<string, Positioned>
  groups: GraphGroupBox[]
}

function nodeRadius(degree: number): number {
  return 6 + Math.min(13, Math.sqrt(Math.max(0, degree)) * 2.7)
}

interface LabelBox {
  x0: number
  y0: number
  x1: number
  y1: number
}

function boxesOverlap(a: LabelBox, b: LabelBox): boolean {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0
}

/** 估算标签宽度：CJK 按字号，拉丁按 0.58 字号；用于标签避让，不追求像素级精确。 */
function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0
  for (const char of text) {
    width += /[\u3000-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(char) ? fontSize : fontSize * 0.58
  }
  return width
}

function boundsOfPositions(nodes: GraphNode[], positions: Map<string, Positioned>): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const node of nodes) {
    const point = positions.get(node.id)
    if (!point) continue
    const pad = nodeRadius(node.degree) + 34
    minX = Math.min(minX, point.x - pad)
    minY = Math.min(minY, point.y - pad)
    maxX = Math.max(maxX, point.x + pad)
    maxY = Math.max(maxY, point.y + pad)
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  return { minX, minY, maxX, maxY }
}

function layoutBounds(layout: GraphLayout, nodes: GraphNode[]): { minX: number; minY: number; maxX: number; maxY: number } {
  if (layout.groups.length === 0) return boundsOfPositions(nodes, layout.positions)
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const group of layout.groups) {
    minX = Math.min(minX, group.x)
    minY = Math.min(minY, group.y)
    maxX = Math.max(maxX, group.x + group.width)
    maxY = Math.max(maxY, group.y + group.height)
  }
  return { minX: minX - 8, minY: minY - 8, maxX: maxX + 8, maxY: maxY + 8 }
}

interface SimPoint {
  id: string
  degree: number
  x: number
  y: number
  dx: number
  dy: number
}

interface Quad {
  x0: number
  y0: number
  x1: number
  y1: number
  mass: number
  cx: number
  cy: number
  point: SimPoint | null
  bucket: SimPoint[] | null
  children: Quad[] | null
}

function makeQuad(x0: number, y0: number, x1: number, y1: number): Quad {
  return { x0, y0, x1, y1, mass: 0, cx: 0, cy: 0, point: null, bucket: null, children: null }
}

function childIndex(quad: Quad, point: SimPoint): number {
  const midX = (quad.x0 + quad.x1) / 2
  const midY = (quad.y0 + quad.y1) / 2
  return (point.x >= midX ? 1 : 0) + (point.y >= midY ? 2 : 0)
}

function subdivide(quad: Quad): Quad[] {
  const midX = (quad.x0 + quad.x1) / 2
  const midY = (quad.y0 + quad.y1) / 2
  return [
    makeQuad(quad.x0, quad.y0, midX, midY),
    makeQuad(midX, quad.y0, quad.x1, midY),
    makeQuad(quad.x0, midY, midX, quad.y1),
    makeQuad(midX, midY, quad.x1, quad.y1),
  ]
}

function insertPoint(quad: Quad, point: SimPoint, depth = 0): void {
  if (depth > 28) {
    if (quad.point) {
      quad.bucket = [quad.point]
      quad.point = null
    }
    quad.bucket = quad.bucket ?? []
    quad.bucket.push(point)
    const mass = quad.mass + 1
    quad.cx = (quad.cx * quad.mass + point.x) / mass
    quad.cy = (quad.cy * quad.mass + point.y) / mass
    quad.mass = mass
    return
  }
  if (!quad.children && quad.bucket) {
    quad.bucket.push(point)
    const mass = quad.mass + 1
    quad.cx = (quad.cx * quad.mass + point.x) / mass
    quad.cy = (quad.cy * quad.mass + point.y) / mass
    quad.mass = mass
    return
  }
  if (!quad.children && quad.point === null && quad.bucket === null) {
    quad.point = point
    quad.mass = 1
    quad.cx = point.x
    quad.cy = point.y
    return
  }
  if (!quad.children && quad.point) {
    const old = quad.point
    if (old.x === point.x && old.y === point.y) {
      point.x += 0.01
      point.y += 0.01
    }
    quad.point = null
    quad.children = subdivide(quad)
    insertPoint(quad.children[childIndex(quad, old)] as Quad, old, depth + 1)
  }
  if (!quad.children) return
  insertPoint(quad.children[childIndex(quad, point)] as Quad, point, depth + 1)
  const mass = quad.mass + 1
  quad.cx = (quad.cx * quad.mass + point.x) / mass
  quad.cy = (quad.cy * quad.mass + point.y) / mass
  quad.mass = mass
}

function applyRepulsion(quad: Quad, point: SimPoint, k2: number, theta: number): void {
  if (quad.mass === 0) return
  if (!quad.children) {
    const others = quad.bucket ?? (quad.point ? [quad.point] : [])
    for (const other of others) {
      if (other === point) continue
      let dx = point.x - other.x
      let dy = point.y - other.y
      let d2 = dx * dx + dy * dy
      if (d2 < 0.01) {
        dx = 0.1
        dy = 0.1
        d2 = 0.02
      }
      const dist = Math.sqrt(d2)
      const force = k2 / dist
      point.dx += (dx / dist) * force
      point.dy += (dy / dist) * force
    }
    return
  }
  const dx = point.x - quad.cx
  const dy = point.y - quad.cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  const size = quad.x1 - quad.x0
  if (dist > 0 && size / dist < theta) {
    const safe = Math.max(0.5, dist)
    const force = (k2 * quad.mass) / safe
    point.dx += (dx / safe) * force
    point.dy += (dy / safe) * force
    return
  }
  for (const child of quad.children) applyRepulsion(child, point, k2, theta)
}

function noise(index: number): number {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453
  return (value - Math.floor(value)) * 2 - 1
}

function forceLayout(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number): GraphLayout {
  if (nodes.length === 0) return { positions: new Map(), groups: [] }
  const ordered = [...nodes].sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id))
  const k = Math.max(28, Math.sqrt(Math.max(1, width * height) / Math.max(1, nodes.length)) * 0.55)
  const points: SimPoint[] = ordered.map((node, index) => {
    const angle = index * 2.399963229728653
    const radius = index === 0 ? 0 : k * 0.42 * Math.sqrt(index)
    return {
      id: node.id,
      degree: node.degree,
      x: Math.cos(angle) * radius + noise(index) * 3,
      y: Math.sin(angle) * radius + noise(index + 17) * 3,
      dx: 0,
      dy: 0,
    }
  })
  const byId = new Map(points.map((point) => [point.id, point]))
  const iterations = points.length <= 80 ? 220 : points.length <= 250 ? 160 : points.length <= 600 ? 110 : 80
  let temperature = k * 0.55
  const cooling = temperature / (iterations + 1)

  for (let iteration = 0; iteration < iterations; iteration++) {
    for (const point of points) {
      point.dx = 0
      point.dy = 0
    }
    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY
    for (const point of points) {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    }
    const root = makeQuad(minX - 1, minY - 1, maxX + 1, maxY + 1)
    for (const point of points) insertPoint(root, point)
    for (const point of points) applyRepulsion(root, point, k * k, 0.9)

    for (const edge of edges) {
      const from = byId.get(edge.from)
      const to = byId.get(edge.to)
      if (!from || !to || from === to) continue
      const dx = to.x - from.x
      const dy = to.y - from.y
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy))
      const force = (dist * dist) / k
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      from.dx += fx
      from.dy += fy
      to.dx -= fx
      to.dy -= fy
    }

    for (const point of points) {
      point.dx -= point.x * 0.012
      point.dy -= point.y * 0.012
      const length = Math.sqrt(point.dx * point.dx + point.dy * point.dy)
      if (length < 0.001) continue
      const step = Math.min(length, temperature)
      point.x += (point.dx / length) * step
      point.y += (point.dy / length) * step
    }
    temperature -= cooling
  }

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const point of points) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }
  const extent = Math.max(maxX - minX, maxY - minY)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const target = Math.max(420, Math.sqrt(points.length) * 130)
  const scale = extent > 0.5 ? target / extent : 1
  const positions = new Map<string, Positioned>()
  for (const point of points) {
    positions.set(point.id, {
      x: (point.x - centerX) * scale,
      y: (point.y - centerY) * scale,
    })
  }
  return { positions, groups: [] }
}

function clusterLayout(nodes: GraphNode[], mode: 'project' | 'type'): GraphLayout {
  if (nodes.length === 0) return { positions: new Map(), groups: [] }
  const groups = new Map<string, GraphNode[]>()
  for (const node of nodes) {
    const key = mode === 'project' ? node.projects[0] ?? UNASSIGNED_PROJECT : node.type
    const list = groups.get(key) ?? []
    list.push(node)
    groups.set(key, list)
  }

  const items = [...groups.entries()]
    .map(([id, list]) => {
      const ordered = [...list].sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id))
      const angleOffset = ((hashString(id) % 360) * Math.PI) / 180
      const local = ordered.map((node, index) => {
        if (index === 0) return { node, x: 0, y: 0 }
        const angle = index * 2.399963229728653 + angleOffset
        const radius = 32 + 27 * Math.sqrt(index)
        return { node, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
      })
      let minX = Number.POSITIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      for (const point of local) {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      }
      const contentWidth = maxX - minX
      const contentHeight = maxY - minY
      const width = Math.max(200, contentWidth + 84)
      const height = Math.max(140, contentHeight + 58 + 34)
      const shifted = local.map((point) => ({
        id: point.node.id,
        x: point.x - minX + (width - contentWidth) / 2,
        y: point.y - minY + 58,
      }))
      return { id, width, height, ids: ordered.map((node) => node.id), local: shifted, gx: 0, gy: 0 }
    })
    .sort((a, b) => b.ids.length - a.ids.length || a.id.localeCompare(b.id))

  const gap = 28
  const area = items.reduce((sum, item) => sum + item.width * item.height, 0)
  const targetWidth = Math.max(560, Math.sqrt(Math.max(1, area)) * 1.45)
  let cursorX = 0
  let cursorY = 0
  let rowHeight = 0
  for (const item of items) {
    if (cursorX > 0 && cursorX + item.width > targetWidth) {
      cursorX = 0
      cursorY += rowHeight + gap
      rowHeight = 0
    }
    item.gx = cursorX
    item.gy = cursorY
    cursorX += item.width + gap
    rowHeight = Math.max(rowHeight, item.height)
  }
  const totalWidth = Math.max(...items.map((item) => item.gx + item.width))
  const totalHeight = Math.max(...items.map((item) => item.gy + item.height))
  const offsetX = -totalWidth / 2
  const offsetY = -totalHeight / 2
  const positions = new Map<string, Positioned>()
  const boxes: GraphGroupBox[] = []
  for (const item of items) {
    boxes.push({
      id: item.id,
      x: item.gx + offsetX,
      y: item.gy + offsetY,
      width: item.width,
      height: item.height,
      count: item.ids.length,
      ids: item.ids,
    })
    for (const point of item.local) {
      positions.set(point.id, { x: item.gx + offsetX + point.x, y: item.gy + offsetY + point.y })
    }
  }
  return { positions, groups: boxes }
}

function buildLayout(mode: LayoutMode, nodes: GraphNode[], edges: GraphEdge[], width: number, height: number): GraphLayout {
  return mode === 'force' ? forceLayout(nodes, edges, width, height) : clusterLayout(nodes, mode)
}

// ---------------------------------------------------------------------------
// 聚合（项目概览、洞察、跨项目依赖）
// ---------------------------------------------------------------------------

interface ProjectAggregate {
  id: string
  label: string
  nodes: number
  edges: number
  crossEdges: number
  types: Record<GraphNodeType, number>
  neighbors: Array<{ id: string; count: number }>
  lastSeen: string
}

function emptyTypeCounts(): Record<GraphNodeType, number> {
  return { project: 0, code: 0, person: 0, team: 0, action: 0, system: 0, concept: 0 }
}

function aggregateProjects(
  nodes: GraphNode[],
  edges: GraphEdge[],
  projectLabel: (id: string) => string,
): ProjectAggregate[] {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const aggregates = new Map<string, ProjectAggregate>()
  const neighborCounts = new Map<string, Map<string, number>>()
  const ensure = (id: string): ProjectAggregate => {
    const existing = aggregates.get(id)
    if (existing) return existing
    const created: ProjectAggregate = {
      id,
      label: projectLabel(id),
      nodes: 0,
      edges: 0,
      crossEdges: 0,
      types: emptyTypeCounts(),
      neighbors: [],
      lastSeen: '',
    }
    aggregates.set(id, created)
    neighborCounts.set(id, new Map())
    return created
  }
  const primaryOf = (nodeId: string): string | undefined => nodeById.get(nodeId)?.projects[0]

  for (const node of nodes) {
    const id = node.projects[0] ?? UNASSIGNED_PROJECT
    const aggregate = ensure(id)
    aggregate.nodes += 1
    aggregate.types[node.type] += 1
    if (node.lastSeen > aggregate.lastSeen) aggregate.lastSeen = node.lastSeen
  }
  for (const edge of edges) {
    const aggregate = ensure(edge.project ?? UNASSIGNED_PROJECT)
    aggregate.edges += 1
    if (edge.createdAt > aggregate.lastSeen) aggregate.lastSeen = edge.createdAt
    if (!edge.crossProject) continue
    const fromProject = primaryOf(edge.from)
    const toProject = primaryOf(edge.to)
    if (!fromProject || !toProject || fromProject === toProject) continue
    ensure(fromProject).crossEdges += 1
    ensure(toProject).crossEdges += 1
    const fromNeighbors = neighborCounts.get(fromProject)
    const toNeighbors = neighborCounts.get(toProject)
    if (fromNeighbors) fromNeighbors.set(toProject, (fromNeighbors.get(toProject) ?? 0) + 1)
    if (toNeighbors) toNeighbors.set(fromProject, (toNeighbors.get(fromProject) ?? 0) + 1)
  }
  for (const aggregate of aggregates.values()) {
    const counts = neighborCounts.get(aggregate.id)
    if (!counts) continue
    aggregate.neighbors = [...counts.entries()]
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
  }
  return [...aggregates.values()].sort((a, b) => b.edges - a.edges || b.nodes - a.nodes || a.label.localeCompare(b.label))
}

interface CrossLink {
  from: string
  to: string
  count: number
  rels: string[]
}

function crossLinks(nodes: GraphNode[], edges: GraphEdge[]): CrossLink[] {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const map = new Map<string, { from: string; to: string; count: number; rels: Set<string> }>()
  for (const edge of edges) {
    if (!edge.crossProject) continue
    const from = nodeById.get(edge.from)?.projects[0]
    const to = nodeById.get(edge.to)?.projects[0]
    if (!from || !to || from === to) continue
    const key = `${from}\u0000${to}`
    const current = map.get(key) ?? { from, to, count: 0, rels: new Set<string>() }
    current.count += 1
    current.rels.add(edge.relType)
    map.set(key, current)
  }
  return [...map.values()]
    .map((link) => ({ from: link.from, to: link.to, count: link.count, rels: [...link.rels] }))
    .sort((a, b) => b.count - a.count || a.from.localeCompare(b.from) || a.to.localeCompare(b.to))
}

function mermaidOf(nodes: GraphNode[], edges: GraphEdge[]): string {
  if (nodes.length === 0 || edges.length === 0) return ''
  const index = new Map(nodes.map((node, i) => [node.id, `n${i}`]))
  const escape = (value: string): string => value.replace(/"/g, "'").replace(/\|/g, '/').replace(/\s+/g, ' ').trim()
  const lines = ['graph LR']
  for (const node of nodes) lines.push(`  ${index.get(node.id)}["${escape(node.id)}"]`)
  for (const edge of edges) {
    const from = index.get(edge.from)
    const to = index.get(edge.to)
    if (!from || !to) continue
    lines.push(`  ${from} -->|${escape(edge.rel)}| ${to}`)
  }
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// 主视图
// ---------------------------------------------------------------------------

export function GraphView(props: GraphViewProps): ReactNode {
  const t = props.t
  const [data, setData] = useState<GraphPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [reload, setReload] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('graph')
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('force')
  const [filters, setFilters] = useState<GraphFilters>(blankFilters)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [isolate, setIsolate] = useState(false)
  const [focusTarget, setFocusTarget] = useState<string | null>(null)
  const [focusToken, setFocusToken] = useState(0)
  const [listGroup, setListGroup] = useState<GroupBy>('project')
  const autoGrouped = useRef(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    api
      .graph(limit)
      .then((result) => {
        if (!alive) return
        setData(result)
        setError(null)
      })
      .catch((cause: Error) => {
        if (alive) setError(cause.message)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [limit, props.version, reload])

  useEffect(() => {
    if (!data || autoGrouped.current) return
    const realProjects = data.projects.filter((project) => project.id !== UNASSIGNED_PROJECT).length
    if (realProjects < 2) return
    autoGrouped.current = true
    setLayoutMode('project')
    props.toast(data.nodes.length > 240 ? t('graph.autoGrouped') : t('graph.defaultProject'), 'neutral')
  }, [data, props, t])

  const projectLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const project of data?.projects ?? []) map.set(project.id, project.label)
    return map
  }, [data])

  const projectLabel = useCallback(
    (id: string): string => (id === UNASSIGNED_PROJECT ? t('graph.unassigned') : projectLabelMap.get(id) ?? id),
    [projectLabelMap, t],
  )
  const typeLabel = useCallback((type: GraphNodeType): string => nodeTypeLabel(t, type), [t])
  const relationLabel = useCallback((type: string): string => relTypeLabel(t, type), [t])

  const filtered = useMemo(() => (data ? filterGraph(data, filters) : { nodes: [], edges: [], nodeById: new Map() }), [data, filters])
  const match = useMemo(
    () =>
      computeMatch(filtered.nodes, filtered.edges, search, projectLabel, typeLabel, relationLabel),
    [filtered, search, projectLabel, typeLabel, relationLabel],
  )

  const focusEdges = useMemo(() => {
    if (!isolate || !selected) return filtered.edges
    return filtered.edges.filter((edge) => edge.from === selected || edge.to === selected)
  }, [filtered.edges, isolate, selected])
  const focusNodeIds = useMemo(() => {
    const ids = new Set<string>()
    for (const edge of focusEdges) {
      ids.add(edge.from)
      ids.add(edge.to)
    }
    return ids
  }, [focusEdges])
  const graphNodes = useMemo(
    () => (isolate && selected ? filtered.nodes.filter((node) => focusNodeIds.has(node.id)) : filtered.nodes),
    [filtered.nodes, focusNodeIds, isolate, selected],
  )

  useEffect(() => {
    if (selected && !filtered.nodeById.has(selected)) {
      setSelected(null)
      setIsolate(false)
    }
  }, [filtered.nodeById, selected])

  useEffect(() => {
    if (viewMode !== 'graph') setIsolate(false)
  }, [viewMode])

  const selectNode = useCallback((id: string | null) => {
    setSelected(id)
    if (id === null) setIsolate(false)
  }, [])

  const locateNode = useCallback((id: string) => {
    setSelected(id)
    setIsolate(false)
    setFocusTarget(id)
    setFocusToken((value) => value + 1)
  }, [])

  const resetFilters = useCallback(() => setFilters(blankFilters()), [])

  const applyProjectFilter = useCallback((id: string) => {
    setFilters({ ...blankFilters(), projects: [id] })
    setSelected(null)
    setIsolate(false)
    setViewMode('graph')
  }, [])

  const applyCellFilter = useCallback((project: string, type: GraphNodeType) => {
    setFilters({ ...blankFilters(), projects: [project], types: [type] })
    setSelected(null)
    setIsolate(false)
    setViewMode('graph')
  }, [])

  const applyCrossLink = useCallback((from: string, to: string) => {
    setFilters({ ...blankFilters(), projects: [from, to], crossOnly: true })
    setSelected(null)
    setIsolate(false)
    setLayoutMode('project')
    setViewMode('graph')
    autoGrouped.current = true
  }, [])

  const groupFilter = useCallback(
    (id: string) => {
      if (layoutMode === 'project') applyProjectFilter(id)
      else {
        setFilters({ ...blankFilters(), types: [id as GraphNodeType] })
        setSelected(null)
        setIsolate(false)
      }
    },
    [applyProjectFilter, layoutMode],
  )

  const submitSearch = useCallback(() => {
    if (!match.active) {
      props.toast(t('graph.noMatch'), 'warn')
      return
    }
    const best = [...match.reach]
      .map((id) => filtered.nodeById.get(id))
      .filter((node): node is GraphNode => node !== undefined)
      .sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id))[0]
    if (!best) {
      props.toast(t('graph.noMatch'), 'warn')
      return
    }
    setViewMode('graph')
    locateNode(best.id)
  }, [filtered.nodeById, locateNode, match, props, t])

  const visibleEdges = useMemo(() => {
    if (viewMode !== 'list' || !search.trim()) return filtered.edges
    if (!match.active) return []
    return filtered.edges.filter(
      (edge) => match.edges.has(edge.id) || match.nodes.has(edge.from) || match.nodes.has(edge.to),
    )
  }, [filtered.edges, match, search, viewMode])

  const confidenceCounts = useMemo(() => {
    const counts: Record<Confidence, number> = { high: 0, medium: 0, low: 0 }
    for (const edge of data?.edges ?? []) counts[edge.confidence] += 1
    return counts
  }, [data])

  const mermaid = useMemo(() => mermaidOf(graphNodes, focusEdges), [graphNodes, focusEdges])
  const counts = data?.total ?? { nodes: 0, edges: 0, relations: 0, relationsShown: 0, projects: 0 }
  const filterCount = activeFilterCount(filters)
  const hasAnyEdges = (data?.edges.length ?? 0) > 0
  const noVisible = hasAnyEdges && filtered.edges.length === 0
  const visibleProjectCount = useMemo(() => {
    const ids = new Set<string>()
    for (const edge of filtered.edges) ids.add(edge.project ?? UNASSIGNED_PROJECT)
    return ids.size
  }, [filtered.edges])

  return (
    <div className="gam-page">
      <PageHeader
        eyebrow={t('nav.groupSystem')}
        title={t('nav.graph')}
        description={t('graph.desc')}
        actions={
          <>
            <Badge>{formatNumber(counts.nodes)} {t('graph.nodes')}</Badge>
            <Badge>{formatNumber(counts.edges)} {t('graph.edges')}</Badge>
            <Badge>{formatNumber(counts.projects)} {t('graph.projects')}</Badge>
            {mermaid ? (
              <CopyButton
                text={mermaid}
                label={t('graph.copyMermaid')}
                copiedLabel={t('common.copied')}
                onCopied={(ok) => {
                  if (!ok) props.toast(t('common.copyFailed'), 'danger')
                }}
              />
            ) : null}
            {loading && data ? <span className="gam-grefreshing"><Spinner /> {t('graph.refreshing')}</span> : null}
          </>
        }
      />

      <div className="gam-toolbar">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('graph.searchPlaceholder')}
          aria-label={t('graph.searchPlaceholder')}
          clearLabel={t('common.clear')}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submitSearch()
            }
          }}
        />
        <Button
          size="sm"
          variant={filterOpen ? 'secondary' : 'ghost'}
          icon={<IconFilter size={13} />}
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen((value) => !value)}
        >
          {t('graph.filters')}
          {filterCount > 0 ? <span className="gam-gfcount">{filterCount}</span> : null}
        </Button>
        {search ? (
          <span className={cx('gam-gmatchinfo', match.miss && 'is-miss')}>
            {match.miss
              ? t('graph.noMatch')
              : interpolate(t('graph.matchInfo'), {
                  nodes: match.nodes.size,
                  edges: match.edges.size,
                })}
          </span>
        ) : null}
        <span className="gam-spacer" />
        {viewMode === 'list' ? (
          <SelectField
            value={listGroup}
            onChange={(value) => setListGroup(value as GroupBy)}
            options={[
              { value: 'project', label: t('graph.groupProject') },
              { value: 'relation', label: t('graph.groupRelation') },
              { value: 'confidence', label: t('graph.groupConfidence') },
              { value: 'none', label: t('graph.groupNone') },
            ]}
            aria-label={t('graph.groupBy')}
          />
        ) : null}
        <Segmented<ViewMode>
          value={viewMode}
          onChange={setViewMode}
          ariaLabel={t('graph.mode')}
          options={[
            { value: 'graph', label: <><IconGraphView size={13} /> {t('graph.graphMode')}</> },
            { value: 'list', label: <><IconList size={13} /> {t('graph.listMode')}</> },
            { value: 'insight', label: <><IconSparkle size={13} /> {t('graph.insightMode')}</> },
          ]}
        />
      </div>

      {filterOpen ? (
        <GraphFilterPanel
          t={t}
          data={data}
          filters={filters}
          confidenceCounts={confidenceCounts}
          projectLabel={projectLabel}
          onChange={(patch) => setFilters((previous) => ({ ...previous, ...patch }))}
          onReset={resetFilters}
        />
      ) : filterCount > 0 ? (
        <GraphActiveFilters
          t={t}
          filters={filters}
          data={data}
          projectLabel={projectLabel}
          onChange={(patch) => setFilters((previous) => ({ ...previous, ...patch }))}
          onReset={resetFilters}
        />
      ) : null}

      {error && data ? (
        <div className="gam-gnotice" data-tone="danger" role="alert">
          <IconInfo size={15} />
          <div className="gam-gnotice-main">
            <b>{t('graph.refreshFailed')}</b>
            <span>{error}</span>
          </div>
          <Button size="sm" icon={<IconRefresh size={13} />} onClick={() => setReload((value) => value + 1)}>
            {t('panel.retry')}
          </Button>
        </div>
      ) : null}

      {data?.truncated ? (
        <div className="gam-gnotice" data-tone="info">
          <IconInfo size={15} />
          <div className="gam-gnotice-main">
            <b>{t('graph.truncatedTitle')}</b>
            <span>
              {interpolate(t('graph.truncatedDesc'), {
                shown: formatNumber(data.total.relationsShown),
                total: formatNumber(data.total.relations),
              })}
            </span>
          </div>
          {data.limit < MAX_LIMIT ? (
            <Button
              size="sm"
              icon={<IconPlus size={13} />}
              onClick={() => {
                const next = Math.min(MAX_LIMIT, Math.max(DEFAULT_LIMIT, limit * 2))
                setLimit(next)
                props.toast(interpolate(t('graph.loadMoreToast'), { limit: formatNumber(next) }), 'neutral')
              }}
            >
              {t('graph.loadMore')}
            </Button>
          ) : (
            <span className="gam-gnotice-note">{t('graph.limitReached')}</span>
          )}
        </div>
      ) : null}

      {loading && !data ? (
        <SkeletonList rows={5} />
      ) : error && !data ? (
        <ErrorState
          title={t('graph.loadFailed')}
          message={error}
          retryLabel={t('panel.retry')}
          onRetry={() => setReload((value) => value + 1)}
        />
      ) : !data || data.edges.length === 0 ? (
        <EmptyState
          icon={<IconGraph size={20} />}
          title={t('graph.empty')}
          description={t('graph.emptyDesc')}
          actions={
            <>
              <Button size="sm" variant="primary" icon={<IconArrowRight size={13} />} onClick={() => props.onNavigate('import')}>
                {t('graph.goImport')}
              </Button>
              <Button size="sm" variant="ghost" icon={<IconRefresh size={13} />} onClick={() => setReload((value) => value + 1)}>
                {t('graph.refresh')}
              </Button>
            </>
          }
        />
      ) : noVisible ? (
        <EmptyState
          icon={<IconFilter size={20} />}
          title={t('graph.filteredEmpty')}
          description={t('graph.filteredEmptyDesc')}
          actions={
            <Button size="sm" variant="primary" onClick={() => { resetFilters(); setSearch('') }}>
              {t('graph.clearAll')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="gam-gsummary">
            <span>
              {filterCount > 0 || search
                ? interpolate(t('graph.visibleSummary'), {
                    nodes: formatNumber(graphNodes.length),
                    edges: formatNumber(focusEdges.length),
                    totalNodes: formatNumber(counts.nodes),
                    totalEdges: formatNumber(counts.edges),
                  })
                : interpolate(t('graph.totalSummary'), {
                    nodes: formatNumber(graphNodes.length),
                    edges: formatNumber(focusEdges.length),
                  })}
            </span>
            <span className="gam-dotsep">·</span>
            <span>{interpolate(t('graph.projectSummary'), { projects: formatNumber(visibleProjectCount) })}</span>
            {match.active ? (
              <>
                <span className="gam-dotsep">·</span>
                <span className="gam-gsummary-match">
                  <IconCheck size={12} /> {interpolate(t('graph.searchActive'), { count: match.nodes.size + match.edges.size })}
                </span>
              </>
            ) : null}
            {search && match.miss ? (
              <>
                <span className="gam-dotsep">·</span>
                <span className="gam-gsummary-match is-miss">{t('graph.noMatch')}</span>
              </>
            ) : null}
          </div>

          {viewMode === 'graph' ? (
            <div className="gam-glayout">
              <div className="gam-gcanvascol">
                <GraphCanvas
                  t={t}
                  nodes={graphNodes}
                  edges={focusEdges}
                  layoutMode={layoutMode}
                  onLayoutMode={setLayoutMode}
                  selected={selected}
                  onSelect={selectNode}
                  onOpen={props.onOpen}
                  onGroupSelect={groupFilter}
                  projectLabel={projectLabel}
                  match={match}
                  focusTarget={focusTarget}
                  focusToken={focusToken}
                  layoutNote={isolate ? t('graph.isolateHint') : undefined}
                />
              </div>
              <GraphSide
                t={t}
                selected={selected}
                node={selected ? filtered.nodeById.get(selected) : undefined}
                nodes={graphNodes}
                edges={filtered.edges}
                nodeById={filtered.nodeById}
                projectLabel={projectLabel}
                onOpen={props.onOpen}
                onSelect={selectNode}
                onLocate={locateNode}
                onFilterProject={applyProjectFilter}
                isolate={isolate}
                onIsolate={setIsolate}
                toast={props.toast}
              />
            </div>
          ) : viewMode === 'list' ? (
            <GraphList
              t={t}
              edges={visibleEdges}
              nodeById={filtered.nodeById}
              projectLabel={projectLabel}
              groupBy={listGroup}
              onOpen={props.onOpen}
              onClearSearch={() => setSearch('')}
              hasSearch={Boolean(search)}
            />
          ) : (
            <GraphInsights
              t={t}
              nodes={graphNodes}
              edges={focusEdges}
              projectLabel={projectLabel}
              onProject={applyProjectFilter}
              onCell={applyCellFilter}
              onCrossLink={applyCrossLink}
              onEntity={locateNode}
            />
          )}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 筛选面板
// ---------------------------------------------------------------------------

interface GraphFilterPanelProps {
  t: Translate
  data: GraphPayload | null
  filters: GraphFilters
  confidenceCounts: Record<Confidence, number>
  projectLabel: (id: string) => string
  onChange: (patch: Partial<GraphFilters>) => void
  onReset: () => void
}

function GraphFilterPanel(props: GraphFilterPanelProps): ReactNode {
  const t = props.t
  const data = props.data
  const projects = facetWithSelected(data?.projects ?? [], props.filters.projects)
  const types = facetWithSelected(data?.nodeTypes ?? [], props.filters.types)
  const rels = facetWithSelected(data?.relTypes ?? [], props.filters.rels)
  const sources = facetWithSelected(data?.sources ?? [], props.filters.sources)
  const tags = facetWithSelected(data?.tags ?? [], props.filters.tags)
  const count = activeFilterCount(props.filters)
  return (
    <section className="gam-gfilters" aria-label={t('graph.filters')}>
      <div className="gam-gfilters-head">
        <div>
          <h3>{t('graph.filters')}</h3>
          <p>{t('graph.filtersHint')}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={props.onReset} disabled={count === 0}>
          {t('graph.clearFilters')}
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className="gam-gfilters-row">
          <span className="gam-gfilters-label">{t('graph.project')}</span>
          <div className="gam-chiprow">
            {projects.map((project) => {
              const active = props.filters.projects.includes(project.id)
              return (
                <button
                  key={project.id}
                  type="button"
                  className={cx('gam-chip', 'gam-gfacet', active && 'is-active')}
                  aria-pressed={active}
                  onClick={() => props.onChange({ projects: toggleValue(props.filters.projects, project.id) })}
                >
                  <i className="gam-gdot" data-tone={projectTone(project.id)} />
                  <span className="gam-gfacet-label">{project.id === UNASSIGNED_PROJECT ? t('graph.unassigned') : project.label}</span>
                  <span className="gam-chipcount">{project.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {types.length > 0 ? (
        <div className="gam-gfilters-row">
          <span className="gam-gfilters-label">{t('graph.entityType')}</span>
          <div className="gam-chiprow">
            {types.map((facet) => {
              const type = facet.id as GraphNodeType
              const active = props.filters.types.includes(type)
              return (
                <button
                  key={type}
                  type="button"
                  className={cx('gam-chip', 'gam-gfacet', active && 'is-active')}
                  aria-pressed={active}
                  onClick={() => props.onChange({ types: toggleValue(props.filters.types, type) })}
                >
                  <i className="gam-gdot" data-type={type} />
                  <span>{nodeTypeLabel(t, type)}</span>
                  <span className="gam-chipcount">{facet.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {rels.length > 0 ? (
        <div className="gam-gfilters-row">
          <span className="gam-gfilters-label">{t('graph.relationType')}</span>
          <div className="gam-chiprow">
            {rels.map((facet) => {
              const type = facet.id as GraphRelType
              const active = props.filters.rels.includes(type)
              return (
                <button
                  key={type}
                  type="button"
                  className={cx('gam-chip', active && 'is-active')}
                  aria-pressed={active}
                  onClick={() => props.onChange({ rels: toggleValue(props.filters.rels, type) })}
                >
                  <i className="gam-gdot" data-rel={type} />
                  <span>{relTypeLabel(t, type)}</span>
                  <span className="gam-chipcount">{facet.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="gam-gfilters-row">
        <span className="gam-gfilters-label">{t('graph.confidenceLevel')}</span>
        <div className="gam-chiprow">
          {CONFIDENCE_ORDER.map((value) => {
            const active = props.filters.confidences.includes(value)
            return (
              <button
                key={value}
                type="button"
                className={cx('gam-chip', active && 'is-active')}
                aria-pressed={active}
                onClick={() => props.onChange({ confidences: toggleValue(props.filters.confidences, value) })}
              >
                <i className="gam-gdot" data-confidence={value} />
                <span>{confidenceLabel(t, value)}</span>
                <span className="gam-chipcount">{props.confidenceCounts[value]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {sources.length > 0 ? (
        <div className="gam-gfilters-row">
          <span className="gam-gfilters-label">{t('graph.sourceType')}</span>
          <div className="gam-chiprow">
            {sources.map((facet) => {
              const active = props.filters.sources.includes(facet.id)
              return (
                <button
                  key={facet.id}
                  type="button"
                  className={cx('gam-chip', active && 'is-active')}
                  aria-pressed={active}
                  onClick={() => props.onChange({ sources: toggleValue(props.filters.sources, facet.id) })}
                >
                  <span>{sourceLabel(t, facet.id)}</span>
                  <span className="gam-chipcount">{facet.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div className="gam-gfilters-row">
          <span className="gam-gfilters-label">{t('graph.tags')}</span>
          <div className="gam-chiprow gam-gtagrow">
            {tags.map((facet) => {
              const active = props.filters.tags.includes(facet.id)
              return (
                <button
                  key={facet.id}
                  type="button"
                  className={cx('gam-chip', active && 'is-active')}
                  aria-pressed={active}
                  onClick={() => props.onChange({ tags: toggleValue(props.filters.tags, facet.id) })}
                >
                  <span>{facet.label}</span>
                  <span className="gam-chipcount">{facet.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="gam-gfilters-row">
        <span className="gam-gfilters-label">{t('graph.time')}</span>
        <div className="gam-chiprow">
          {TIME_RANGES.map((days) => {
            const active = props.filters.days === days
            return (
              <button
                key={days}
                type="button"
                className={cx('gam-chip', active && 'is-active')}
                aria-pressed={active}
                onClick={() => props.onChange({ days })}
              >
                {timeLabel(t, days)}
              </button>
            )
          })}
          <button
            type="button"
            className={cx('gam-chip', props.filters.crossOnly && 'is-active')}
            aria-pressed={props.filters.crossOnly}
            onClick={() => props.onChange({ crossOnly: !props.filters.crossOnly })}
          >
            <IconArrowRight size={12} />
            {t('graph.crossOnly')}
          </button>
        </div>
      </div>

      <p className="gam-gfilters-note">
        <IconInfo size={12} /> {t('graph.heuristicNote')}
        {data?.truncated ? ` ${t('graph.facetTruncated')}` : ''}
      </p>
    </section>
  )
}

interface GraphActiveFiltersProps {
  t: Translate
  filters: GraphFilters
  data: GraphPayload | null
  projectLabel: (id: string) => string
  onChange: (patch: Partial<GraphFilters>) => void
  onReset: () => void
}

function GraphActiveFilters(props: GraphActiveFiltersProps): ReactNode {
  const t = props.t
  const tagLabels = new Map((props.data?.tags ?? []).map((facet) => [facet.id, facet.label]))
  const chips: Array<{ key: string; label: string; remove: () => void }> = []
  for (const id of props.filters.projects) {
    chips.push({ key: `p:${id}`, label: props.projectLabel(id), remove: () => props.onChange({ projects: toggleValue(props.filters.projects, id) }) })
  }
  for (const type of props.filters.types) {
    chips.push({ key: `t:${type}`, label: nodeTypeLabel(t, type), remove: () => props.onChange({ types: toggleValue(props.filters.types, type) }) })
  }
  for (const rel of props.filters.rels) {
    chips.push({ key: `r:${rel}`, label: relTypeLabel(t, rel), remove: () => props.onChange({ rels: toggleValue(props.filters.rels, rel) }) })
  }
  for (const confidence of props.filters.confidences) {
    chips.push({
      key: `c:${confidence}`,
      label: confidenceLabel(t, confidence),
      remove: () => props.onChange({ confidences: toggleValue(props.filters.confidences, confidence) }),
    })
  }
  for (const source of props.filters.sources) {
    chips.push({
      key: `s:${source}`,
      label: sourceLabel(t, source),
      remove: () => props.onChange({ sources: toggleValue(props.filters.sources, source) }),
    })
  }
  for (const tag of props.filters.tags) {
    chips.push({ key: `g:${tag}`, label: tagLabels.get(tag) ?? tag, remove: () => props.onChange({ tags: toggleValue(props.filters.tags, tag) }) })
  }
  if (props.filters.days > 0) {
    chips.push({ key: 'days', label: timeLabel(t, props.filters.days), remove: () => props.onChange({ days: 0 }) })
  }
  if (props.filters.crossOnly) {
    chips.push({ key: 'cross', label: t('graph.crossOnly'), remove: () => props.onChange({ crossOnly: false }) })
  }
  return (
    <div className="gam-gactivefilters">
      <span className="gam-gactivefilters-label">{t('graph.activeFilters')}</span>
      {chips.map((chip) => (
        <button type="button" key={chip.key} className="gam-gfilterpill" onClick={chip.remove} aria-label={`${chip.label} ×`}>
          <span>{chip.label}</span>
          <IconClose size={11} />
        </button>
      ))}
      <Button size="sm" variant="ghost" onClick={props.onReset}>
        {t('graph.clearFilters')}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 图谱画布
// ---------------------------------------------------------------------------

interface ViewState {
  x: number
  y: number
  k: number
}

type LevelOfDetail = 'far' | 'mid' | 'near'

interface GraphCanvasProps {
  t: Translate
  nodes: GraphNode[]
  edges: GraphEdge[]
  layoutMode: LayoutMode
  onLayoutMode: (mode: LayoutMode) => void
  selected: string | null
  onSelect: (id: string | null) => void
  onOpen: (entryId: string) => void
  onGroupSelect: (id: string) => void
  projectLabel: (id: string) => string
  match: GraphMatch
  focusTarget: string | null
  focusToken: number
  layoutNote?: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

function GraphCanvas(props: GraphCanvasProps): ReactNode {
  const t = props.t
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const tipRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 960, height: 600 })
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, k: 1 })
  const viewRef = useRef<ViewState>(view)
  const [hover, setHover] = useState<{ kind: 'node' | 'edge'; id: string } | null>(null)
  const [legendOpen, setLegendOpen] = useState(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const pendingView = useRef<ViewState | null>(null)
  const viewRaf = useRef<number | null>(null)
  const animRaf = useRef<number | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const dragRef = useRef<{ startX: number; startY: number; view: ViewState; moved: boolean } | null>(null)
  const pinchRef = useRef<{ distance: number; view: ViewState; midX: number; midY: number } | null>(null)
  const suppressClickUntil = useRef(0)
  const lastFocusToken = useRef(0)

  const widthBucket = Math.round(size.width / 60) * 60
  const heightBucket = Math.round(size.height / 60) * 60
  const layout = useMemo(
    () => buildLayout(props.layoutMode, props.nodes, props.edges, widthBucket, heightBucket),
    [props.layoutMode, props.nodes, props.edges, widthBucket, heightBucket],
  )
  const nodeById = useMemo(() => new Map(props.nodes.map((node) => [node.id, node])), [props.nodes])
  const edgeById = useMemo(() => new Map(props.edges.map((edge) => [edge.id, edge])), [props.edges])
  const lod: LevelOfDetail = view.k < 0.55 ? 'far' : view.k < 1.05 ? 'mid' : 'near'

  const commitView = useCallback((next: ViewState) => {
    viewRef.current = next
    setView(next)
  }, [])

  const scheduleView = useCallback(
    (next: ViewState) => {
      pendingView.current = next
      if (viewRaf.current !== null) return
      viewRaf.current = requestAnimationFrame(() => {
        viewRaf.current = null
        const pending = pendingView.current
        pendingView.current = null
        if (pending) commitView(pending)
      })
    },
    [commitView],
  )

  const animateTo = useCallback(
    (next: ViewState) => {
      if (animRaf.current !== null) cancelAnimationFrame(animRaf.current)
      if (prefersReducedMotion()) {
        commitView(next)
        return
      }
      const from = viewRef.current
      const start = performance.now()
      const duration = 280
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - progress, 3)
        commitView({
          x: from.x + (next.x - from.x) * eased,
          y: from.y + (next.y - from.y) * eased,
          k: from.k + (next.k - from.k) * eased,
        })
        if (progress < 1) animRaf.current = requestAnimationFrame(step)
        else animRaf.current = null
      }
      animRaf.current = requestAnimationFrame(step)
    },
    [commitView],
  )

  const fitView = useCallback(
    (animate = false) => {
      const bounds = layoutBounds(layout, props.nodes)
      const padX = 64
      const padTop = 78
      const padBottom = 54
      const contentWidth = Math.max(1, bounds.maxX - bounds.minX)
      const contentHeight = Math.max(1, bounds.maxY - bounds.minY)
      const k = clamp(
        Math.min((size.width - padX * 2) / contentWidth, (size.height - padTop - padBottom) / contentHeight),
        0.08,
        1.8,
      )
      const centerX = (bounds.minX + bounds.maxX) / 2
      const centerY = (bounds.minY + bounds.maxY) / 2
      const next = {
        x: size.width / 2 - centerX * k,
        y: padTop + (size.height - padTop - padBottom) / 2 - centerY * k,
        k,
      }
      if (animate) animateTo(next)
      else commitView(next)
    },
    [animateTo, commitView, layout, props.nodes, size.height, size.width],
  )
  const fitRef = useRef(fitView)
  fitRef.current = fitView

  useEffect(() => {
    const element = wrapRef.current
    if (!element) return
    const update = () => {
      const rect = element.getBoundingClientRect()
      setSize({ width: Math.max(320, Math.round(rect.width)), height: Math.max(320, Math.round(rect.height)) })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => fitRef.current(false))
    return () => cancelAnimationFrame(raf)
  }, [layout])

  useEffect(() => {
    const raf = requestAnimationFrame(() => fitRef.current(false))
    return () => cancelAnimationFrame(raf)
  }, [size.width, size.height])

  useEffect(() => {
    if (!props.focusTarget || props.focusToken === lastFocusToken.current) return
    lastFocusToken.current = props.focusToken
    const point = layout.positions.get(props.focusTarget)
    if (!point) return
    const k = clamp(Math.max(1.15, viewRef.current.k), 0.08, 2.4)
    animateTo({ x: size.width / 2 - point.x * k, y: size.height / 2 - point.y * k, k })
  }, [animateTo, layout, props.focusTarget, props.focusToken, size.height, size.width])

  useEffect(() => {
    const element = wrapRef.current
    if (!element) return
    const onWheel = (event: WheelEvent) => {
      const target = event.target as Element | null
      if (target?.closest('[data-gcontrol]')) return
      event.preventDefault()
      const rect = element.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
      const factor = Math.exp(-delta * (event.ctrlKey ? 0.004 : 0.0016))
      const current = viewRef.current
      const k = clamp(current.k * factor, 0.08, 6)
      if (k === current.k) return
      const ratio = k / current.k
      scheduleView({
        x: mouseX - (mouseX - current.x) * ratio,
        y: mouseY - (mouseY - current.y) * ratio,
        k,
      })
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [scheduleView])

  const positionTip = useCallback((point: { x: number; y: number }) => {
    const tip = tipRef.current
    const wrap = wrapRef.current
    if (!tip || !wrap) return
    const width = tip.offsetWidth
    const height = tip.offsetHeight
    const maxX = wrap.clientWidth - width - 12
    const maxY = wrap.clientHeight - height - 12
    tip.style.transform = `translate(${clamp(point.x + 16, 10, Math.max(10, maxX))}px, ${clamp(point.y + 16, 10, Math.max(10, maxY))}px)`
  }, [])

  useEffect(() => {
    if (hover) positionTip(lastPointer.current)
  }, [hover, positionTip])

  const localPoint = (event: { clientX: number; clientY: number }): { x: number; y: number } => {
    const rect = wrapRef.current?.getBoundingClientRect()
    return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) }
  }

  const zoomBy = (factor: number, anchor?: { x: number; y: number }) => {
    const current = viewRef.current
    const k = clamp(current.k * factor, 0.08, 6)
    const ax = anchor?.x ?? size.width / 2
    const ay = anchor?.y ?? size.height / 2
    const ratio = k / current.k
    animateTo({
      x: ax - (ax - current.x) * ratio,
      y: ay - (ay - current.y) * ratio,
      k,
    })
  }

  const centerNode = useCallback(
    (id: string) => {
      const point = layout.positions.get(id)
      if (!point) return
      const k = clamp(Math.max(1.2, viewRef.current.k * 1.15), 0.08, 2.4)
      animateTo({ x: size.width / 2 - point.x * k, y: size.height / 2 - point.y * k, k })
    },
    [animateTo, layout, size.height, size.width],
  )

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as Element
    if (target.closest('[data-gnode],[data-ggroup],[data-gcontrol]')) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const point = localPoint(event)
    pointers.current.set(event.pointerId, point)
    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      if (a && b) {
        pinchRef.current = {
          distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
          view: viewRef.current,
          midX: (a.x + b.x) / 2,
          midY: (a.y + b.y) / 2,
        }
        dragRef.current = null
      }
      return
    }
    dragRef.current = { startX: point.x, startY: point.y, view: viewRef.current, moved: false }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    const point = localPoint(event)
    pointers.current.set(event.pointerId, point)
    const pinch = pinchRef.current
    if (pinch && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      if (!a || !b) return
      const distance = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y))
      const midX = (a.x + b.x) / 2
      const midY = (a.y + b.y) / 2
      const k = clamp((pinch.view.k * distance) / pinch.distance, 0.08, 6)
      const ratio = k / pinch.view.k
      scheduleView({
        x: midX - (pinch.midX - pinch.view.x) * ratio,
        y: midY - (pinch.midY - pinch.view.y) * ratio,
        k,
      })
      return
    }
    const drag = dragRef.current
    if (!drag) return
    const dx = point.x - drag.startX
    const dy = point.y - drag.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true
    scheduleView({ x: drag.view.x + dx, y: drag.view.y + dy, k: drag.view.k })
  }

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size < 2) pinchRef.current = null
    if (pointers.current.size === 0) {
      if (dragRef.current?.moved) suppressClickUntil.current = performance.now() + 150
      dragRef.current = null
    }
  }

  const onPointerLeave = () => {
    if (dragRef.current?.moved) suppressClickUntil.current = performance.now() + 150
    pointers.current.clear()
    dragRef.current = null
    pinchRef.current = null
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      zoomBy(1.25)
    } else if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      zoomBy(0.8)
    } else if (event.key === '0' || event.key.toLowerCase() === 'f') {
      event.preventDefault()
      fitView(true)
    } else if (event.key === 'Escape') {
      props.onSelect(null)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      animateTo({ ...viewRef.current, x: viewRef.current.x + 70 })
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      animateTo({ ...viewRef.current, x: viewRef.current.x - 70 })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      animateTo({ ...viewRef.current, y: viewRef.current.y + 70 })
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      animateTo({ ...viewRef.current, y: viewRef.current.y - 70 })
    }
  }

  const labels = useMemo(() => {
    const budget = lod === 'far' ? (props.nodes.length <= 40 ? props.nodes.length : 24) : lod === 'mid' ? (props.nodes.length <= 160 ? props.nodes.length : 120) : props.nodes.length <= 420 ? props.nodes.length : 320
    return new Set(
      [...props.nodes]
        .sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id))
        .slice(0, budget)
        .map((node) => node.id),
    )
  }, [lod, props.nodes])

  const selectedNeighbors = useMemo(() => {
    const ids = new Set<string>()
    if (!props.selected) return ids
    ids.add(props.selected)
    for (const edge of props.edges) {
      if (edge.from === props.selected) ids.add(edge.to)
      if (edge.to === props.selected) ids.add(edge.from)
    }
    return ids
  }, [props.edges, props.selected])

  const incidentEdges = useMemo(() => {
    const ids = new Set<string>()
    if (!props.selected) return ids
    for (const edge of props.edges) {
      if (edge.from === props.selected || edge.to === props.selected) ids.add(edge.id)
    }
    return ids
  }, [props.edges, props.selected])

  const hoverNode = hover?.kind === 'node' ? nodeById.get(hover.id) : undefined
  const hoverEdge = hover?.kind === 'edge' ? edgeById.get(hover.id) : undefined
  const projectLabel = props.projectLabel

  const scene = useMemo(() => {
    const hasQuery = props.match.active
    const dimNodes = new Set<string>()
    for (const node of props.nodes) {
      const focusDim = Boolean(props.selected) && !selectedNeighbors.has(node.id)
      const searchDim = hasQuery && !props.match.reach.has(node.id)
      if (focusDim || searchDim) dimNodes.add(node.id)
    }
    const dimEdges = new Set<string>()
    for (const edge of props.edges) {
      const focusDim = Boolean(props.selected) && !incidentEdges.has(edge.id)
      const searchEdgeActive =
        props.match.edges.has(edge.id) || props.match.nodes.has(edge.from) || props.match.nodes.has(edge.to)
      const searchDim = hasQuery && !searchEdgeActive
      if (focusDim || searchDim) dimEdges.add(edge.id)
    }
    const pairCounts = new Map<string, number>()
    for (const edge of props.edges) {
      const key = edge.from < edge.to ? `${edge.from}\u0000${edge.to}` : `${edge.to}\u0000${edge.from}`
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1)
    }
    const pairSeen = new Map<string, number>()
    const drawEdges = [...props.edges].reverse()
    const incidentLabelBudget = incidentEdges.size <= 28
    const groups = props.layoutMode !== 'force' ? layout.groups : []
    const labelText = (node: GraphNode): string => {
      const maxChars = lod === 'far' ? 18 : lod === 'near' ? 30 : 23
      return node.id.length > maxChars ? `${node.id.slice(0, maxChars - 1)}…` : node.id
    }

    // 标签避让：优先保证选中/命中/邻域节点，再按度数从高到低尝试
    // 下 → 上 → 右 → 左 → 更远的上/下，放不下就不画，避免互相压字。
    const labelPlacements = new Map<string, { dx: number; dy: number; anchor: 'middle' | 'start' | 'end' }>()
    const occupied: LabelBox[] = []
    for (const group of groups) occupied.push({ x0: group.x, y0: group.y, x1: group.x + group.width, y1: group.y + 32 })
    for (const node of props.nodes) {
      const point = layout.positions.get(node.id)
      if (!point) continue
      const pad = nodeRadius(node.degree) + 2
      occupied.push({ x0: point.x - pad, y0: point.y - pad, x1: point.x + pad, y1: point.y + pad })
    }
    const labelCandidates = props.nodes
      .map((node) => {
        const selected = props.selected === node.id
        const matched = props.match.reach.has(node.id)
        const hovered = hover?.kind === 'node' && hover.id === node.id
        const dim = dimNodes.has(node.id)
        const visible =
          selected ||
          matched ||
          hovered ||
          (!dim && (labels.has(node.id) || (props.selected !== null && selectedNeighbors.has(node.id))))
        return {
          node,
          visible,
          priority: selected ? 0 : hovered ? 1 : matched ? 2 : 3,
        }
      })
      .filter((item) => item.visible)
      .sort((a, b) => a.priority - b.priority || b.node.degree - a.node.degree || a.node.id.localeCompare(b.node.id))
    for (const item of labelCandidates) {
      const point = layout.positions.get(item.node.id)
      if (!point) continue
      const text = labelText(item.node)
      const width = estimateTextWidth(text, 11)
      const radius = nodeRadius(item.node.degree)
      const options: Array<{ dx: number; dy: number; anchor: 'middle' | 'start' | 'end'; box: LabelBox }> = [
        {
          dx: 0,
          dy: radius + 13,
          anchor: 'middle',
          box: { x0: point.x - width / 2, y0: point.y + radius + 3, x1: point.x + width / 2, y1: point.y + radius + 16 },
        },
        {
          dx: 0,
          dy: -(radius + 6),
          anchor: 'middle',
          box: { x0: point.x - width / 2, y0: point.y - radius - 18, x1: point.x + width / 2, y1: point.y - radius - 5 },
        },
        {
          dx: radius + 6,
          dy: 4,
          anchor: 'start',
          box: { x0: point.x + radius + 5, y0: point.y - 9, x1: point.x + radius + 5 + width, y1: point.y + 5 },
        },
        {
          dx: -(radius + 6),
          dy: 4,
          anchor: 'end',
          box: { x0: point.x - radius - 5 - width, y0: point.y - 9, x1: point.x - radius - 5, y1: point.y + 5 },
        },
        {
          dx: 0,
          dy: radius + 27,
          anchor: 'middle',
          box: { x0: point.x - width / 2, y0: point.y + radius + 17, x1: point.x + width / 2, y1: point.y + radius + 30 },
        },
        {
          dx: 0,
          dy: -(radius + 20),
          anchor: 'middle',
          box: { x0: point.x - width / 2, y0: point.y - radius - 32, x1: point.x + width / 2, y1: point.y - radius - 19 },
        },
      ]
      let placed = false
      for (const option of options) {
        if (occupied.some((box) => boxesOverlap(option.box, box))) continue
        labelPlacements.set(item.node.id, { dx: option.dx, dy: option.dy, anchor: option.anchor })
        occupied.push(option.box)
        placed = true
        break
      }
      if (!placed && item.priority <= 2) {
        const fallback = options[0] as (typeof options)[number]
        labelPlacements.set(item.node.id, { dx: fallback.dx, dy: fallback.dy, anchor: fallback.anchor })
        occupied.push(fallback.box)
      }
    }

    return (
      <>
        {groups.map((group) => {
          const dim = group.ids.length > 0 && group.ids.every((id) => dimNodes.has(id))
          const label = props.layoutMode === 'project' ? projectLabel(group.id) : nodeTypeLabel(t, group.id as GraphNodeType)
          const maxChars = Math.max(8, Math.floor((group.width - 70) / 7))
          const short = label.length > maxChars ? `${label.slice(0, maxChars - 1)}…` : label
          return (
            <g key={`group-${group.id}`} className={cx('gam-ggroup', dim && 'is-dim')}>
              <rect
                className="gam-ghull"
                data-tone={props.layoutMode === 'project' ? projectTone(group.id) : undefined}
                data-type={props.layoutMode === 'type' ? group.id : undefined}
                x={group.x}
                y={group.y}
                width={group.width}
                height={group.height}
                rx={18}
                ry={18}
              />
              <g
                data-ggroup={group.id}
                className="gam-ggroup-head"
                role="button"
                tabIndex={0}
                aria-label={`${label} · ${group.count}`}
                onClick={(event) => {
                  event.stopPropagation()
                  props.onGroupSelect(group.id)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    props.onGroupSelect(group.id)
                  }
                }}
              >
                <circle
                  className="gam-gdot-svg"
                  data-tone={props.layoutMode === 'project' ? projectTone(group.id) : undefined}
                  data-type={props.layoutMode === 'type' ? group.id : undefined}
                  cx={group.x + 18}
                  cy={group.y + 22}
                  r={4}
                />
                <text className="gam-ghull-label" x={group.x + 28} y={group.y + 26}>
                  {short}
                </text>
                <text className="gam-ghull-count" x={group.x + group.width - 14} y={group.y + 26} textAnchor="end">
                  {group.count}
                </text>
              </g>
            </g>
          )
        })}

        {drawEdges.map((edge) => {
          const from = layout.positions.get(edge.from)
          const to = layout.positions.get(edge.to)
          if (!from || !to) return null
          const fromNode = nodeById.get(edge.from)
          const toNode = nodeById.get(edge.to)
          const fromRadius = fromNode ? nodeRadius(fromNode.degree) : 7
          const toRadius = toNode ? nodeRadius(toNode.degree) : 7
          let dx = to.x - from.x
          let dy = to.y - from.y
          const length = Math.max(1, Math.hypot(dx, dy))
          const ux = dx / length
          const uy = dy / length
          const sx = from.x + ux * (fromRadius + 3)
          const sy = from.y + uy * (fromRadius + 3)
          const ex = to.x - ux * (toRadius + 5)
          const ey = to.y - uy * (toRadius + 5)
          const pairKey = edge.from < edge.to ? `${edge.from}\u0000${edge.to}` : `${edge.to}\u0000${edge.from}`
          const total = pairCounts.get(pairKey) ?? 1
          const seen = pairSeen.get(pairKey) ?? 0
          pairSeen.set(pairKey, seen + 1)
          const offset = total > 1 ? (seen - (total - 1) / 2) * 26 : 0
          const mx = (sx + ex) / 2 - uy * offset
          const my = (sy + ey) / 2 + ux * offset
          const d = `M${sx.toFixed(2)},${sy.toFixed(2)} Q${mx.toFixed(2)},${my.toFixed(2)} ${ex.toFixed(2)},${ey.toFixed(2)}`
          const labelX = 0.25 * sx + 0.5 * mx + 0.25 * ex
          const labelY = 0.25 * sy + 0.5 * my + 0.25 * ey
          const active = Boolean(props.selected && incidentEdges.has(edge.id))
          const matched = hasQuery && props.match.edges.has(edge.id)
          const showLabel =
            edge.id === hover?.id ||
            (props.edges.length <= 12 && offset === 0) ||
            (hasQuery && matched) ||
            (active && incidentLabelBudget)
          const shortRel = edge.rel.length > 16 ? `${edge.rel.slice(0, 15)}…` : edge.rel
          return (
            <g
              key={edge.id}
              className={cx(
                'gam-gedge-group',
                edge.crossProject && 'is-cross',
                dimEdges.has(edge.id) && 'is-dim',
                active && 'is-active',
                matched && 'is-match',
              )}
            >
              {props.edges.length <= 900 ? (
                <path
                  className="gam-gedge-hit"
                  d={d}
                  data-gedge={edge.id}
                  onClick={(event) => {
                    if (performance.now() < suppressClickUntil.current) {
                      event.preventDefault()
                      return
                    }
                    event.stopPropagation()
                    props.onOpen(edge.entryId)
                  }}
                  onPointerEnter={(event) => {
                    lastPointer.current = { x: event.clientX, y: event.clientY }
                    setHover({ kind: 'edge', id: edge.id })
                  }}
                  onPointerMove={(event) => {
                    lastPointer.current = { x: event.clientX, y: event.clientY }
                    positionTip(lastPointer.current)
                  }}
                  onPointerLeave={() => setHover((current) => (current?.kind === 'edge' && current.id === edge.id ? null : current))}
                />
              ) : null}
              <path
                className={cx('gam-gedge', edge.confidence !== 'high' && 'is-low')}
                data-rel={edge.relType}
                d={d}
                markerEnd={props.edges.length <= 900 ? 'url(#gam-garrow)' : undefined}
              />
              {showLabel ? (
                <text className="gam-gedge-label" x={labelX} y={labelY - 5} textAnchor="middle">
                  {shortRel}
                </text>
              ) : null}
            </g>
          )
        })}

        {props.nodes.map((node) => {
          const point = layout.positions.get(node.id)
          if (!point) return null
          const radius = nodeRadius(node.degree)
          const isSelected = props.selected === node.id
          const isMatched = props.match.reach.has(node.id)
          const isHovered = hover?.kind === 'node' && hover.id === node.id
          const dim = dimNodes.has(node.id)
          const placement = labelPlacements.get(node.id)
          const focusable = isSelected || isMatched || placement !== undefined
          return (
            <g
              key={node.id}
              data-gnode={node.id}
              className={cx('gam-gnode', dim && 'is-dim', isSelected && 'is-selected', isMatched && 'is-match', isHovered && 'is-hover')}
              transform={`translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`}
              role="button"
              tabIndex={focusable ? 0 : -1}
              aria-label={`${node.id} · ${nodeTypeLabel(t, node.type)} · ${node.degree}`}
              onClick={(event) => {
                event.stopPropagation()
                if (event.detail > 1) return
                props.onSelect(isSelected ? null : node.id)
              }}
              onDoubleClick={(event) => {
                event.stopPropagation()
                props.onSelect(node.id)
                centerNode(node.id)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  event.stopPropagation()
                  props.onSelect(isSelected ? null : node.id)
                }
              }}
              onPointerEnter={(event) => {
                lastPointer.current = { x: event.clientX, y: event.clientY }
                setHover({ kind: 'node', id: node.id })
              }}
              onPointerMove={(event) => {
                lastPointer.current = { x: event.clientX, y: event.clientY }
                positionTip(lastPointer.current)
              }}
              onPointerLeave={() => setHover((current) => (current?.kind === 'node' && current.id === node.id ? null : current))}
            >
              {(isSelected || isMatched || isHovered) && (
                <circle className="gam-gnode-ring" r={radius + 5} data-type={node.type} />
              )}
              <circle className="gam-gnode-dot" data-type={node.type} r={radius} />
              {placement ? (
                <text
                  className="gam-gnode-label"
                  x={placement.dx}
                  y={placement.dy}
                  textAnchor={placement.anchor}
                >
                  {labelText(node)}
                </text>
              ) : null}
            </g>
          )
        })}
      </>
    )
  }, [
    centerNode,
    hover,
    incidentEdges,
    labels,
    layout,
    lod,
    nodeById,
    positionTip,
    projectLabel,
    props,
    selectedNeighbors,
    t,
  ])

  return (
    <div
      className="gam-gstage"
      ref={wrapRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={onPointerLeave}
      onDoubleClick={(event) => {
        const target = event.target as Element
        if (target.closest('[data-gnode],[data-ggroup],[data-gedge],[data-gcontrol]')) return
        const point = localPoint(event)
        const current = viewRef.current
        const k = clamp(current.k * 1.5, 0.08, 6)
        const ratio = k / current.k
        animateTo({
          x: point.x - (point.x - current.x) * ratio,
          y: point.y - (point.y - current.y) * ratio,
          k,
        })
      }}
      aria-label={t('graph.svgLabel')}
    >
      <svg className="gam-gsvg" width={size.width} height={size.height} role="group" aria-label={t('graph.svgLabel')}>
        <title>{t('graph.svgLabel')}</title>
        <defs>
          <marker id="gam-garrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
            <path className="gam-garrow" d="M0 0 L8 4 L0 8 z" />
          </marker>
        </defs>
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>{scene}</g>
      </svg>

      <div className="gam-gstage-top" data-gcontrol>
        <Segmented<LayoutMode>
          value={props.layoutMode}
          onChange={props.onLayoutMode}
          ariaLabel={t('graph.layout')}
          options={[
            { value: 'force', label: t('graph.layoutForce') },
            { value: 'project', label: t('graph.layoutProject') },
            { value: 'type', label: t('graph.layoutType') },
          ]}
        />
        {props.layoutNote ? <span className="gam-gstage-note">{props.layoutNote}</span> : null}
      </div>

      <div className="gam-gzoom" data-gcontrol role="group" aria-label={t('graph.zoom')}>
        <IconButton label={t('graph.zoomOut')} icon={<IconMinus size={14} />} onClick={() => zoomBy(0.8)} />
        <span className="gam-gzoom-pct" aria-label={t('graph.zoomLevel')}>{Math.round(view.k * 100)}%</span>
        <IconButton label={t('graph.zoomIn')} icon={<IconPlus size={14} />} onClick={() => zoomBy(1.25)} />
        <IconButton label={t('graph.fit')} icon={<IconFit size={14} />} onClick={() => fitView(true)} />
      </div>

      <div className="gam-glegend" data-gcontrol>
        <button type="button" className="gam-glegend-toggle" onClick={() => setLegendOpen((value) => !value)} aria-expanded={legendOpen}>
          <IconInfo size={12} />
          {t('graph.legend')}
        </button>
        {legendOpen ? (
          <div className="gam-glegend-card">
            <div className="gam-glegend-types">
              {NODE_TYPE_ORDER.map((type) => (
                <span key={type} className="gam-glegend-item">
                  <i className="gam-gdot" data-type={type} />
                  {nodeTypeLabel(t, type)}
                </span>
              ))}
            </div>
            <div className="gam-glegend-edges">
              <span><i className="gam-glegend-line" /> {t('graph.legendEdge')}</span>
              <span><i className="gam-glegend-line is-low" /> {t('graph.legendLow')}</span>
            </div>
            <div className="gam-glegend-hints">
              <span>{t('graph.hintPanZoom')}</span>
              <span>{t('graph.hintDoubleClick')}</span>
              <span>{t('graph.hintKeys')} <Kbd>+</Kbd> <Kbd>−</Kbd> <Kbd>0</Kbd></span>
            </div>
          </div>
        ) : (
          <span className="gam-glegend-hint">{t('graph.hintPanZoomShort')}</span>
        )}
      </div>

      <div className="gam-gtip" ref={tipRef} data-visible={hover !== null} role="presentation">
        {hoverNode ? (
          <>
            <div className="gam-gtip-head">
              <i className="gam-gdot" data-type={hoverNode.type} />
              <span className="gam-gtip-title">{hoverNode.id}</span>
            </div>
            <div className="gam-gtip-meta">
              <span>{nodeTypeLabel(t, hoverNode.type)}</span>
              <span>·</span>
              <span>{interpolate(t('graph.tipDegree'), { count: hoverNode.degree })}</span>
            </div>
            {hoverNode.projects.length > 0 ? (
              <div className="gam-gtip-meta">
                <span>{projectLabel(hoverNode.projects[0] ?? UNASSIGNED_PROJECT)}</span>
              </div>
            ) : null}
            <div className="gam-gtip-hint">{t('graph.tipNodeHint')}</div>
          </>
        ) : hoverEdge ? (
          <>
            <div className="gam-gtip-head">
              <span className="gam-gtip-title">{hoverEdge.from} → {hoverEdge.to}</span>
            </div>
            <div className="gam-gtip-meta">
              <span>{relTypeLabel(t, hoverEdge.relType)}</span>
              <span>·</span>
              <span>{confidenceLabel(t, hoverEdge.confidence)}</span>
              {hoverEdge.project ? (
                <>
                  <span>·</span>
                  <span>{projectLabel(hoverEdge.project)}</span>
                </>
              ) : null}
            </div>
            {hoverEdge.crossProject ? (
              <div className="gam-gtip-cross">
                <IconArrowRight size={10} />
                {t('graph.crossProjectTag')}
              </div>
            ) : null}
            {hoverEdge.summary ? <div className="gam-gtip-summary">{hoverEdge.summary}</div> : null}
            <div className="gam-gtip-hint">{t('graph.tipEdgeHint')}</div>
          </>
        ) : null}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 侧栏
// ---------------------------------------------------------------------------

interface GraphSideProps {
  t: Translate
  selected: string | null
  node?: GraphNode
  nodes: GraphNode[]
  edges: GraphEdge[]
  nodeById: Map<string, GraphNode>
  projectLabel: (id: string) => string
  onOpen: (entryId: string) => void
  onSelect: (id: string | null) => void
  onLocate: (id: string) => void
  onFilterProject: (id: string) => void
  isolate: boolean
  onIsolate: (value: boolean) => void
  toast: (message: string, tone?: Tone) => void
}

function GraphSide(props: GraphSideProps): ReactNode {
  const t = props.t
  const [sideLimit, setSideLimit] = useState(40)
  const selected = props.selected
  useEffect(() => setSideLimit(40), [selected])

  const projectRows = useMemo(
    () => aggregateProjects(props.nodes, props.edges, props.projectLabel).slice(0, 14),
    [props.edges, props.nodes, props.projectLabel],
  )
  const topEntities = useMemo(
    () => [...props.nodes].sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id)).slice(0, 8),
    [props.nodes],
  )
  const incidentEdges = useMemo(() => {
    if (!selected) return []
    return props.edges
      .filter((edge) => edge.from === selected || edge.to === selected)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [props.edges, selected])

  if (!props.node) {
    return (
      <aside className="gam-gside" aria-label={t('graph.sideOverview')}>
        <div className="gam-gside-head">
          <span>{t('graph.sideOverview')}</span>
          <Badge>{formatNumber(props.nodes.length)} {t('graph.nodes')}</Badge>
        </div>
        <div className="gam-gside-scroll">
          {projectRows.length > 0 ? (
            <div className="gam-gside-section">
              <div className="gam-gside-sectiontitle">{t('graph.projectProfiles')}</div>
              {projectRows.map((project) => (
                <button type="button" key={project.id} className="gam-gprojectrow" onClick={() => props.onFilterProject(project.id)}>
                  <span className="gam-gprojectrow-main">
                    <span className="gam-gprojectrow-top">
                      <i className="gam-gdot" data-tone={projectTone(project.id)} />
                      <span className="gam-gprojectrow-name">{project.label}</span>
                      {project.crossEdges > 0 ? <span className="gam-gtag">{interpolate(t('graph.crossCount'), { count: project.crossEdges })}</span> : null}
                    </span>
                    <span className="gam-gprojectrow-meta">
                      {interpolate(t('graph.projectRowMeta'), {
                        nodes: project.nodes,
                        edges: project.edges,
                      })}
                    </span>
                  </span>
                  <IconChevronRight size={13} className="gam-faint" />
                </button>
              ))}
            </div>
          ) : null}

          {topEntities.length > 0 ? (
            <div className="gam-gside-section">
              <div className="gam-gside-sectiontitle">{t('graph.coreEntities')}</div>
              {topEntities.map((node) => (
                <button type="button" key={node.id} className="gam-gentityrow" onClick={() => props.onLocate(node.id)}>
                  <i className="gam-gdot" data-type={node.type} />
                  <span className="gam-gentityrow-name">{node.id}</span>
                  <span className="gam-gentityrow-meta">{node.degree}</span>
                </button>
              ))}
            </div>
          ) : null}

          <p className="gam-gside-hint">
            <IconInfo size={12} /> {t('graph.sideHint')}
          </p>
        </div>
      </aside>
    )
  }

  const node = props.node
  const shown = incidentEdges.slice(0, sideLimit)
  return (
    <aside className="gam-gside" aria-label={t('graph.sideRelations')}>
      <div className="gam-gside-head gam-gside-headnode">
        <span className="gam-gside-nodename">
          <i className="gam-gdot" data-type={node.type} />
          {node.id}
        </span>
        <IconButton size="sm" label={t('graph.clearSelection')} icon={<IconClose size={13} />} onClick={() => props.onSelect(null)} />
      </div>
      <div className="gam-gside-scroll">
        <div className="gam-gside-badges">
          <Badge tone="accent">{nodeTypeLabel(t, node.type)}</Badge>
          <Badge>{interpolate(t('graph.nodeDegree'), { count: incidentEdges.length })}</Badge>
          {node.lastSeen ? <Badge>{formatRelative(node.lastSeen)}</Badge> : null}
        </div>

        {node.projects.length > 0 ? (
          <div className="gam-gside-projects">
            {node.projects.map((project) => (
              <button type="button" key={project} className="gam-gtag gam-gtagbutton" onClick={() => props.onFilterProject(project)}>
                <i className="gam-gdot" data-tone={projectTone(project)} />
                {props.projectLabel(project)}
              </button>
            ))}
          </div>
        ) : null}

        <div className="gam-gside-actions">
          <Button
            size="sm"
            variant={props.isolate ? 'primary' : 'secondary'}
            icon={<IconGraphView size={13} />}
            onClick={() => props.onIsolate(!props.isolate)}
            aria-pressed={props.isolate}
          >
            {props.isolate ? t('graph.isolateOn') : t('graph.isolate')}
          </Button>
          <Button size="sm" variant="ghost" icon={<IconFit size={13} />} onClick={() => props.onLocate(node.id)}>
            {t('graph.locate')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<IconCopy size={13} />}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(node.id)
                props.toast(t('common.copied'), 'success')
              } catch {
                props.toast(t('common.copyFailed'), 'danger')
              }
            }}
          >
            {t('graph.copyName')}
          </Button>
        </div>

        <div className="gam-gside-section">
          <div className="gam-gside-sectiontitle">
            {interpolate(t('graph.relationsOf'), { name: node.id })}
            <span>{incidentEdges.length}</span>
          </div>
          {incidentEdges.length === 0 ? (
            <p className="gam-gside-hint">{t('graph.noRelations')}</p>
          ) : (
            <div className="gam-grelations">
              {shown.map((edge) => (
                <button type="button" key={edge.id} className="gam-grelation" onClick={() => props.onOpen(edge.entryId)} title={t('graph.openSource')}>
                  <span className="gam-grelation-line">
                    <span className={cx('gam-grelation-entity', edge.from === node.id && 'is-focus')}>
                      <i className="gam-gdot" data-type={props.nodeById.get(edge.from)?.type ?? 'concept'} />
                      {edge.from}
                    </span>
                    <IconArrowRight size={11} />
                    <span className={cx('gam-grelation-entity', edge.to === node.id && 'is-focus')}>
                      <i className="gam-gdot" data-type={props.nodeById.get(edge.to)?.type ?? 'concept'} />
                      {edge.to}
                    </span>
                  </span>
                  <span className="gam-grelation-rel">
                    <span className="gam-grel-badge" data-rel={edge.relType}>{relTypeLabel(t, edge.relType)}</span>
                    <span className="gam-grelation-summary">{edge.summary}</span>
                  </span>
                  <span className="gam-grelation-meta">
                    <span>{confidenceLabel(t, edge.confidence)}</span>
                    <span>·</span>
                    <span>{formatDate(edge.createdAt)}</span>
                    <span>·</span>
                    <span className="gam-mono">{shortId(edge.entryId, 10)}</span>
                  </span>
                </button>
              ))}
              {incidentEdges.length > sideLimit ? (
                <Button size="sm" variant="ghost" onClick={() => setSideLimit((value) => value + 40)}>
                  {interpolate(t('graph.loadMoreRows'), { shown: shown.length, total: incidentEdges.length })}
                </Button>
              ) : null}
            </div>
          )}
        </div>

        <p className="gam-gside-hint">
          <IconInfo size={12} /> {t('graph.sideEditHint')}
        </p>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// 列表视图
// ---------------------------------------------------------------------------

interface GraphListProps {
  t: Translate
  edges: GraphEdge[]
  nodeById: Map<string, GraphNode>
  projectLabel: (id: string) => string
  groupBy: GroupBy
  onOpen: (entryId: string) => void
  onClearSearch: () => void
  hasSearch: boolean
}

interface EdgeGroup {
  id: string
  label: string
  edges: GraphEdge[]
}

function groupEdges(edges: GraphEdge[], groupBy: GroupBy, projectLabel: (id: string) => string, t: Translate): EdgeGroup[] {
  if (groupBy === 'none') return [{ id: 'all', label: '', edges }]
  const groups = new Map<string, GraphEdge[]>()
  for (const edge of edges) {
    const key =
      groupBy === 'project' ? edge.project ?? UNASSIGNED_PROJECT : groupBy === 'relation' ? edge.relType : edge.confidence
    const list = groups.get(key) ?? []
    list.push(edge)
    groups.set(key, list)
  }
  const ordered =
    groupBy === 'confidence'
      ? CONFIDENCE_ORDER.filter((value) => groups.has(value))
      : groupBy === 'relation'
        ? REL_TYPE_ORDER.filter((value) => groups.has(value))
        : [...groups.keys()]
  const labelOf = (id: string): string =>
    groupBy === 'project' ? projectLabel(id) : groupBy === 'relation' ? relTypeLabel(t, id) : confidenceLabel(t, id)
  return ordered
    .map((id) => ({
      id,
      label: labelOf(id),
      edges: (groups.get(id) ?? []).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    }))
    .sort((a, b) => b.edges.length - a.edges.length || a.label.localeCompare(b.label))
}

function GraphList(props: GraphListProps): ReactNode {
  const t = props.t
  const [limit, setLimit] = useState(80)
  const groups = useMemo(
    () => groupEdges(props.edges, props.groupBy, props.projectLabel, t),
    [props.edges, props.groupBy, props.projectLabel, t],
  )
  useEffect(() => setLimit(80), [props.edges])

  let remaining = limit
  const rendered: ReactNode[] = []
  for (const group of groups) {
    if (remaining <= 0) break
    const slice = group.edges.slice(0, remaining)
    remaining -= slice.length
    rendered.push(
      <div className="gam-glistgroup" key={group.id}>
        {props.groupBy !== 'none' ? (
          <div className="gam-glistgroup-head">
            <span>{group.label}</span>
            <span className="gam-chipcount">{group.edges.length}</span>
          </div>
        ) : null}
        <div className="gam-listcard">
          {slice.map((edge) => {
            const from = props.nodeById.get(edge.from)
            const to = props.nodeById.get(edge.to)
            return (
              <button type="button" className="gam-rowitem gam-glistrow" key={edge.id} onClick={() => props.onOpen(edge.entryId)}>
                <span className="gam-glistrow-main">
                  <span className="gam-glistrow-entities">
                    <span className="gam-grelation-entity">
                      <i className="gam-gdot" data-type={from?.type ?? 'concept'} />
                      {edge.from}
                    </span>
                    <IconArrowRight size={12} />
                    <span className="gam-grelation-entity">
                      <i className="gam-gdot" data-type={to?.type ?? 'concept'} />
                      {edge.to}
                    </span>
                    <span className="gam-grel-badge" data-rel={edge.relType}>{relTypeLabel(t, edge.relType)}</span>
                  </span>
                  <span className="gam-rowitem-sum">{edge.summary}</span>
                  <span className="gam-rowitem-meta">
                    <span>{props.projectLabel(edge.project ?? UNASSIGNED_PROJECT)}</span>
                    <span className="gam-dotsep">·</span>
                    <span className="gam-gconfidence" data-confidence={edge.confidence}>{confidenceLabel(t, edge.confidence)}</span>
                    <span className="gam-dotsep">·</span>
                    <span>{formatDate(edge.createdAt)}</span>
                    <span className="gam-dotsep">·</span>
                    <span>{sourceLabel(t, edge.source)}</span>
                  </span>
                </span>
                <IconChevronRight size={14} className="gam-faint" />
              </button>
            )
          })}
        </div>
      </div>,
    )
  }
  const shown = Math.min(limit, props.edges.length)
  if (props.edges.length === 0) {
    return (
      <EmptyState
        icon={<IconList size={20} />}
        title={t('graph.searchEmpty')}
        description={t('graph.searchEmptyDesc')}
        actions={props.hasSearch ? <Button size="sm" onClick={props.onClearSearch}>{t('graph.clearSearch')}</Button> : undefined}
      />
    )
  }
  return (
    <div className="gam-glist">
      {rendered}
      <div className="gam-glist-footer">
        <span>{interpolate(t('graph.listShowing'), { shown: formatNumber(shown), total: formatNumber(props.edges.length) })}</span>
        {props.edges.length > limit ? (
          <Button size="sm" variant="ghost" onClick={() => setLimit((value) => value + 120)}>
            {t('graph.loadMoreRowsShort')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 洞察视图
// ---------------------------------------------------------------------------

interface GraphInsightsProps {
  t: Translate
  nodes: GraphNode[]
  edges: GraphEdge[]
  projectLabel: (id: string) => string
  onProject: (id: string) => void
  onCell: (project: string, type: GraphNodeType) => void
  onCrossLink: (from: string, to: string) => void
  onEntity: (id: string) => void
}

function GraphInsights(props: GraphInsightsProps): ReactNode {
  const t = props.t
  const projects = useMemo(
    () => aggregateProjects(props.nodes, props.edges, props.projectLabel),
    [props.nodes, props.edges, props.projectLabel],
  )
  const links = useMemo(() => crossLinks(props.nodes, props.edges), [props.nodes, props.edges])
  const topEntities = useMemo(
    () => [...props.nodes].sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id)).slice(0, 12),
    [props.nodes],
  )
  const crossCount = useMemo(() => props.edges.filter((edge) => edge.crossProject).length, [props.edges])
  const peopleCount = useMemo(() => props.nodes.filter((node) => node.type === 'person' || node.type === 'team').length, [props.nodes])
  const matrixRows = projects.slice(0, 12)
  const maxCell = useMemo(() => {
    let max = 1
    for (const project of matrixRows) for (const type of NODE_TYPE_ORDER) max = Math.max(max, project.types[type])
    return max
  }, [matrixRows])

  return (
    <div className="gam-ginsights">
      <p className="gam-gfilters-note">
        <IconInfo size={12} /> {t('graph.insightHint')}
      </p>

      <div className="gam-gstatgrid">
        <div className="gam-gstat">
          <span className="gam-gstat-label">{t('graph.insightProjects')}</span>
          <span className="gam-gstat-value">{formatNumber(projects.filter((project) => project.id !== UNASSIGNED_PROJECT).length)}</span>
        </div>
        <div className="gam-gstat">
          <span className="gam-gstat-label">{t('graph.insightNodes')}</span>
          <span className="gam-gstat-value">{formatNumber(props.nodes.length)}</span>
        </div>
        <div className="gam-gstat">
          <span className="gam-gstat-label">{t('graph.insightEdges')}</span>
          <span className="gam-gstat-value">{formatNumber(props.edges.length)}</span>
        </div>
        <div className="gam-gstat">
          <span className="gam-gstat-label">{t('graph.insightPeople')}</span>
          <span className="gam-gstat-value">{formatNumber(peopleCount)}</span>
        </div>
        <div className="gam-gstat" data-tone="accent">
          <span className="gam-gstat-label">{t('graph.insightCross')}</span>
          <span className="gam-gstat-value">{formatNumber(crossCount)}</span>
        </div>
      </div>

      <Card title={t('graph.projectProfiles')} hint={t('graph.projectProfilesHint')} actions={<Badge>{projects.length}</Badge>}>
        {projects.length === 0 ? (
          <p className="gam-gside-hint">{t('graph.noProjects')}</p>
        ) : (
          <div className="gam-gprofilegrid">
            {projects.slice(0, 12).map((project) => {
              const totalTypes = Math.max(1, Object.values(project.types).reduce((sum, value) => sum + value, 0))
              return (
                <div className="gam-gprofile" key={project.id}>
                  <div className="gam-gprofile-head">
                    <i className="gam-gdot" data-tone={projectTone(project.id)} />
                    <span className="gam-gprofile-name">{project.label}</span>
                    <span className="gam-gprofile-count">{interpolate(t('graph.projectRowMeta'), { nodes: project.nodes, edges: project.edges })}</span>
                  </div>
                  <div className="gam-gtypebar" aria-hidden="true">
                    {NODE_TYPE_ORDER.map((type) =>
                      project.types[type] > 0 ? (
                        <i key={type} data-type={type} style={{ width: `${(project.types[type] / totalTypes) * 100}%` }} />
                      ) : null,
                    )}
                  </div>
                  <div className="gam-gprofile-types">
                    {NODE_TYPE_ORDER.filter((type) => project.types[type] > 0).map((type) => (
                      <span key={type} className="gam-gtag">
                        <i className="gam-gdot" data-type={type} />
                        {nodeTypeLabel(t, type)} {project.types[type]}
                      </span>
                    ))}
                  </div>
                  <div className="gam-gprofile-foot">
                    <span className="gam-gprofile-cross">
                      {project.crossEdges > 0 ? interpolate(t('graph.crossCount'), { count: project.crossEdges }) : t('graph.noCross')}
                      {project.neighbors.length > 0 ? ` · ${project.neighbors.slice(0, 3).map((neighbor) => props.projectLabel(neighbor.id)).join(' / ')}` : ''}
                    </span>
                    <Button size="sm" variant="ghost" icon={<IconGraphView size={13} />} onClick={() => props.onProject(project.id)}>
                      {t('graph.viewInGraph')}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {projects.length > 12 ? (
          <p className="gam-gfilters-note">{interpolate(t('graph.profileMore'), { count: projects.length - 12 })}</p>
        ) : null}
      </Card>

      <Card title={t('graph.matrixTitle')} hint={t('graph.matrixHint')}>
        <div className="gam-gmatrix-wrap">
          <table className="gam-gmatrix">
            <thead>
              <tr>
                <th scope="col">{t('graph.project')}</th>
                {NODE_TYPE_ORDER.map((type) => (
                  <th scope="col" key={type}>
                    <span className="gam-gmatrix-th">
                      <i className="gam-gdot" data-type={type} />
                      {nodeTypeLabel(t, type)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((project) => (
                <tr key={project.id}>
                  <th scope="row">
                    <span className="gam-gmatrix-project">
                      <i className="gam-gdot" data-tone={projectTone(project.id)} />
                      {project.label}
                    </span>
                  </th>
                  {NODE_TYPE_ORDER.map((type) => {
                    const count = project.types[type]
                    return (
                      <td key={type}>
                        <button
                          type="button"
                          className="gam-gmatrix-cell"
                          disabled={count === 0}
                          style={count > 0 ? { background: `color-mix(in srgb, var(--gam-accent) ${Math.round((count / maxCell) * 20)}%, transparent)` } : undefined}
                          onClick={() => props.onCell(project.id, type)}
                          aria-label={`${project.label} · ${nodeTypeLabel(t, type)} · ${count}`}
                        >
                          {count || ''}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {projects.length > 12 ? <p className="gam-gfilters-note">{interpolate(t('graph.matrixMore'), { count: projects.length - 12 })}</p> : null}
      </Card>

      <div className="gam-grid2" data-align="start">
        <Card title={t('graph.crossLinksTitle')} hint={t('graph.crossLinksHint')} actions={<Badge tone={crossCount > 0 ? 'accent' : 'neutral'}>{crossCount}</Badge>}>
          {links.length === 0 ? (
            <p className="gam-gside-hint">{t('graph.noCrossLinks')}</p>
          ) : (
            <div className="gam-gcrosslist">
              {links.slice(0, 20).map((link) => (
                <button type="button" key={`${link.from}\u0000${link.to}`} className="gam-gcrossrow" onClick={() => props.onCrossLink(link.from, link.to)}>
                  <span className="gam-gcrossrow-main">
                    <span className="gam-gcrossrow-projects">
                      <i className="gam-gdot" data-tone={projectTone(link.from)} />
                      {props.projectLabel(link.from)}
                      <IconArrowRight size={11} />
                      <i className="gam-gdot" data-tone={projectTone(link.to)} />
                      {props.projectLabel(link.to)}
                    </span>
                    <span className="gam-gcrossrow-rels">{link.rels.map((rel) => relTypeLabel(t, rel)).join(' · ')}</span>
                  </span>
                  <span className="gam-gcrossrow-count">{link.count}</span>
                </button>
              ))}
              {links.length > 20 ? <p className="gam-gfilters-note">{interpolate(t('graph.crossMore'), { count: links.length - 20 })}</p> : null}
            </div>
          )}
        </Card>

        <Card title={t('graph.coreEntities')} hint={t('graph.coreEntitiesHint')}>
          {topEntities.length === 0 ? (
            <p className="gam-gside-hint">{t('graph.noEntities')}</p>
          ) : (
            <div className="gam-gentitygrid">
              {topEntities.map((node) => (
                <button type="button" key={node.id} className="gam-gentitychip" onClick={() => props.onEntity(node.id)}>
                  <i className="gam-gdot" data-type={node.type} />
                  <span className="gam-gentitychip-name">{node.id}</span>
                  <span className="gam-gentitychip-meta">{node.degree}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
