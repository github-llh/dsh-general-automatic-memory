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
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { accept: 'application/json', ...(init?.headers ?? {}) },
  })
  if (!response.ok) {
    let detail = ''
    try {
      detail = JSON.stringify(await response.json())
    } catch {
      detail = response.statusText
    }
    throw new Error(`${response.status} ${path} ${detail}`)
  }
  return (await response.json()) as T
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
  estimate: { added: number; merged: number; duplicate: number; pii: number }
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

export const api = {
  stats: () => get<Stats>('stats'),
  entries: (params: { q?: string; kind?: string; scope?: string; limit?: number; offset?: number }) =>
    get<{ total: number; items: EntrySummary[] }>('entries', params),
  entry: (id: string) => get<EntryDetail>('entry', { id }),
  catalog: (project?: string) => get<{ text: string; shown: number; omitted: number }>('catalog', { project }),
  patch: (id: string, body: string, expectedRev?: number) => post<{ ok: true; rev: number; checksum: string }>('entry/patch', { id, body, expectedRev }),
  invalidate: (id: string, reason: string) => post<{ ok: true; id: string }>('entry/invalidate', { id, reason }),
  doctor: (fix: boolean) => post<{ issues: unknown[]; rebuilt: string[]; unchanged: number; fixed: boolean }>(`doctor${fix ? '?fix=1' : ''}`, {}),
  importSources: () => get<{ cwd: string; sources: ImportSourceStatus[] }>('import/sources'),
  importScan: (body: { source: string; path?: string; limit?: number; maxTurns?: number }) => post<ScanReportView>('import/scan', body),
  importApply: (body: { scanId: string; keys: string[]; project?: string }) => post<ApplyReportView>('import/apply', body),
  snapshots: () => get<{ items: SnapshotInfo[] }>('snapshots'),
  audit: (date: string, limit = 200) => get<{ date: string; total: number; items: AuditRow[] }>('audit', { date, limit }),
  graph: (entity?: string) => get<{ nodes: string[]; edges: GraphEdge[]; mermaid: string }>('graph', { entity }),
  consolidate: () => post<CurateView>('consolidate', {}),
  snapshotDiff: (a: string, b: string) => get<{ added: string[]; removed: string[]; changed: string[] }>('snapshot/diff', { a, b }),
  restore: (label: string) => post<{ restored: number; preSnapshot: string }>('snapshot/restore', { label }),
  projections: () => get<{ cwd: string; targets: ProjectionView[] }>('projections'),
  applyProjections: (ids: string[]) => post<{ results: Array<{ target: string; path: string; changed: boolean }> }>('projections/apply', { ids }),
  exportZip: () => post<{ path: string; bytes: number; files: number; excluded: number }>('export', {}),
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

export interface GraphEdge {
  id: string
  from: string
  to: string
  rel: string
  confidence: string
  summary: string
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
