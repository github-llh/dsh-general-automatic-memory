/**
 * 面板 ↔ Host 的通信：同源相对路径 fetch。
 *
 * 不写死 host/port —— 手机浏览器经 SSH / public deployment 访问同一个 Host 时，
 * 相对路径才是唯一正确的做法（docs/07 §6）。
 */
const PREFIX = '/general-memory'

let nonce: string | null = null
let noncePromise: Promise<string | null> | null = null

async function ensureNonce(): Promise<string | null> {
  if (nonce !== null) return nonce
  if (!noncePromise) {
    noncePromise = fetchJson<{ nonce?: string }>(`${PREFIX}/nonce`)
      .then((value) => {
        nonce = value?.nonce ?? null
        return nonce
      })
      .catch(() => null)
  }
  return noncePromise
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  // 面板可能挂在一个不响应的 Host 上；没有超时会永远停在 loading。
  const timeout = typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(15_000) : undefined
  const response = await fetch(path, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
    signal: init?.signal ?? timeout,
    headers: { accept: 'application/json', ...(init?.headers ?? {}) },
  })
  if (!response.ok) {
    let detail = ''
    try {
      const body = (await response.json()) as { error?: string } | null
      detail = body?.error ?? JSON.stringify(body)
    } catch {
      detail = response.statusText
    }
    throw new Error(detail ? `${detail} (${response.status})` : `${response.status} ${path}`)
  }
  return (await response.json()) as T
}

/** 面板按本地日期筛选审计；把该日期的本地时区偏移传给 Host，用来换算 UTC 文件名。 */
export function tzOffsetForDate(date: string): number {
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return 0
  return -parsed.getTimezoneOffset()
}

export async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) if (value !== undefined && value !== '') search.set(key, String(value))
  const qs = search.toString()
  return fetchJson<T>(`${PREFIX}/${path}${qs ? `?${qs}` : ''}`)
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const token = await ensureNonce()
  return fetchJson<T>(`${PREFIX}/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { 'x-gam-nonce': token } : {}) },
    body: JSON.stringify(body ?? {}),
  })
}

export interface Stats {
  root: string
  ready: boolean
  entryCount: number
  issues: Array<{ rel: string; issue: string; message: string }>
  byKind: Record<string, number>
  byScope: Record<string, number>
  bySource: Record<string, number>
  bytes: number
  index: { lines: number; bytes: number; maxLines: number; maxBytes: number; overBudget: boolean }
  recall: {
    inject: { events: number; hits: number; verbatim: number; zeroHit: number; chars: number; tokens: number; gated: number }
    tool: { events: number; hits: number; zeroHit: number }
    lastShare: number
    maxShare: number
  }
  alerts: Array<{ level: 'error' | 'warn' | 'info'; code: string; message: string }>
}

export interface EntrySummary {
  id: string
  kind: string
  title: string
  summary: string
  scope: string
  project: string | null
  confidence: string
  source: string
  activation: string
  heat: number
  hits: number
  revisions: number
  lastUsedAt: string | null
  createdAt: string
  invalidatedAt: string | null
  pii: boolean
  rel: string
  score?: number
  why?: string
}

export interface EntryDetail {
  meta: Record<string, unknown> & { id: string; kind: string; title: string; summary: string; provenance: Record<string, unknown>; temporal: Record<string, unknown>; stats: Record<string, unknown> }
  body: string
  rel: string
}

export interface ImportSourceStatus {
  id: string
  label: string
  kind: 'memory' | 'conversation'
  detected: string[]
}

export interface ImportItemView {
  key: string
  source: string
  origin: string
  kind: string
  title: string
  summary: string
  activation: string
  confidence: string
  pii: boolean
  duplicateOf?: string
}

export interface ScanReportView {
  scanId: string
  source: string
  label: string
  items: ImportItemView[]
  skipped: Array<{ origin: string; reason: string }>
  estimate: { added: number; merged: number; duplicate: number; alreadyImported: number; pii: number }
  budget?: { alwaysEntries: number; alwaysChars: number; overBudget: boolean }
}

export interface ApplyReportView {
  added: number
  updated: number
  invalidated: number
  noop: number
  rejected: number
  snapshot: string
  details: Array<{ key: string; title: string; outcome: string; reason?: string }>
}

export interface DoctorReport {
  before: Array<{ level: string; code: string; message: string }>
  after: Array<{ level: string; code: string; message: string }>
  issues: Array<{ rel: string; issue: string; message: string }>
  rebuilt: string[]
  unchanged: number
  fixed: boolean
}

export interface CatalogView {
  text: string
  shown: number
  omitted: number
}

export interface ExportView {
  path: string
  bytes: number
  files: number
  excluded: number
}

export const api = {
  stats: () => get<Stats>('stats'),
  entries: (params: { q?: string; kind?: string; scope?: string; limit?: number; offset?: number }) =>
    get<{ total: number; items: EntrySummary[] }>('entries', params),
  entry: (id: string) => get<EntryDetail>('entry', { id }),
  catalog: (project?: string) => get<CatalogView>('catalog', { project }),
  patch: (id: string, body: string, expectedRev?: number) => post<{ ok: true; rev: number; checksum: string }>('entry/patch', { id, body, expectedRev }),
  invalidate: (id: string, reason: string) => post<{ ok: true; id: string }>('entry/invalidate', { id, reason }),
  doctor: (fix: boolean) => post<DoctorReport>(`doctor${fix ? '?fix=1' : ''}`, {}),
  importSources: () => get<{ cwd: string; sources: ImportSourceStatus[] }>('import/sources'),
  importScan: (body: { source: string; path?: string; limit?: number; maxTurns?: number }) => post<ScanReportView>('import/scan', body),
  importApply: (body: { scanId: string; keys: string[]; project?: string }) => post<ApplyReportView>('import/apply', body),
  importZip: (path: string) => post<{ restored: number; skipped: number; preSnapshot?: string }>('import/zip', { path }),
  snapshots: () => get<{ items: SnapshotInfo[] }>('snapshots'),
  createSnapshot: (label = 'manual') => post<SnapshotInfo>('snapshot', { label }),
  audit: (date: string, limit = 200) => get<{ date: string; total: number; items: AuditRow[] }>('audit', { date, limit, tzOffset: tzOffsetForDate(date) }),
  graph: (limit?: number) => get<GraphPayload>('graph', { limit }),
  consolidate: () => post<CurateView>('consolidate', {}),
  snapshotDiff: (a: string, b: string) => get<{ added: string[]; removed: string[]; changed: string[] }>('snapshot/diff', { a, b }),
  restore: (label: string, paths?: string[]) => post<{ restored: number; preSnapshot: string }>('snapshot/restore', { label, paths }),
  projections: () => get<{ cwd: string; targets: ProjectionView[] }>('projections'),
  applyProjections: (ids: string[]) => post<{ results: Array<{ target: string; path: string; changed: boolean }> }>('projections/apply', { ids }),
  exportZip: (includePii = false) => post<ExportView>('export', { includePii }),
  config: () => get<Record<string, unknown>>('config'),
  pending: () => get<{ items: PendingView[]; size: number }>('pending-writes'),
  decidePending: (id: string, action: 'accept' | 'reject') => post<{ ok: boolean }>('pending-writes/decide', { id, action }),
}

export interface PendingView {
  id: string
  candidate: { kind: string; title: string; summary: string; source: string }
  decision: { kind: string; reason: string }
  createdAt: string
  expiresAt: number
}

export interface SnapshotInfo {
  label: string
  createdAt: string
  files: number
  bytes: number
}

export interface AuditRow {
  ts?: string
  actor?: string
  act?: string
  id?: string
  kind?: string
  decision?: string
  reason?: string
  [key: string]: unknown
}

export type GraphNodeType = 'project' | 'code' | 'person' | 'team' | 'action' | 'system' | 'concept'

export type GraphRelType =
  | 'owns'
  | 'belongs'
  | 'depends'
  | 'uses'
  | 'hosts'
  | 'participates'
  | 'supersedes'
  | 'conflicts'
  | 'related'

export interface GraphEdge {
  id: string
  entryId: string
  from: string
  to: string
  rel: string
  relType: GraphRelType
  confidence: 'high' | 'medium' | 'low'
  summary: string
  project?: string
  tags: string[]
  source: string
  createdAt: string
  crossProject: boolean
  entities: string[]
}

export interface GraphNode {
  id: string
  type: GraphNodeType
  degree: number
  projects: string[]
  entries: number
  firstSeen: string
  lastSeen: string
}

export interface GraphFacet {
  id: string
  label: string
  count: number
}

export interface GraphPayload {
  nodes: GraphNode[]
  edges: GraphEdge[]
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

export interface CurateView {
  expiredEpisodes: number
  promoted: number
  merged: number
  summariesRewritten: number
  demoted: number
  durationMs: number
}

export interface ProjectionView {
  id: string
  label: string
  path: string
  enabled: boolean
}
