import type { MemoryService } from '../api.js'
import type { Entry } from '../model.js'
import type { HostContext, WebRequest, WebResponse } from '../types.js'

const PREFIX = '/general-memory'

/**
 * 面板 ↔ Host 通信。
 *
 * 走 `ctx.webServer.register` 的 exact 路由 + 客户端同源 fetch，而不是官方 Typert Remote：
 * Remote 的方法集由 `dsh-api-remotes` 的白名单决定，第三方新增命名空间成本远高于自建路由。
 *
 * 宿主的认证 ≠ 授权。dsh 已经做了 launch token → 签名 cookie（HttpOnly / SameSite=Strict /
 * host-only）→ Origin 信任检查 → 拒绝 sec-fetch-site: cross-site。但插件代码在进程内**无沙箱**，
 * 所以这里必须自己再加一层守卫。
 */
export function registerHttp(ctx: HostContext, api: MemoryService, nonce: string): () => void {
  if (!ctx.webServer?.register) return () => {}
  const disposers: Array<() => void> = []

  const route = (name: string, handler: (req: WebRequest, res: WebResponse, query: URLSearchParams) => Promise<void> | void, mutating = false) => {
    disposers.push(
      ctx.webServer!.register({
        kind: 'exact',
        path: `${PREFIX}/${name}`,
        handler: async (req, res) => {
          const denied = guard(req, res, mutating, nonce)
          if (denied) return
          const query = queryOf(req.url)
          try {
            await handler(req, res, query)
          } catch (cause) {
            // 错误响应不回显堆栈，细节只进日志
            ctx.logger?.warn?.(`[general-memory] route ${name} failed:`, (cause as Error).message)
            send(res, 500, { error: 'internal' })
          }
        },
      }) as () => void,
    )
  }

  route('stats', async (_req, res) => send(res, 200, await api.stats()))

  route('entries', async (_req, res, query) => {
    const kind = query.get('kind') ?? undefined
    const scope = query.get('scope') ?? undefined
    const q = query.get('q')?.trim() ?? ''
    const limit = Number(query.get('limit') ?? '100')
    const offset = Number(query.get('offset') ?? '0')
    const hits = q ? api.search(q, { limit: Number.MAX_SAFE_INTEGER, kind }) : null
    const pool = hits
      ? hits.filter((h) => !h.gated).map((h) => ({ ...summaryOf(h.entry), score: h.score, why: h.why }))
      : api
          .list()
          .filter((e) => (kind ? e.meta.kind === kind : true) && (scope ? e.meta.scope === scope : true))
          .map((e) => summaryOf(e))
    const sorted = pool.slice().sort((a, b) => (b.heat !== a.heat ? b.heat - a.heat : a.id < b.id ? -1 : 1))
    send(res, 200, { total: sorted.length, items: sorted.slice(offset, offset + limit) })
  })

  route('entry', async (_req, res, query) => {
    const id = query.get('id')
    if (!id) return send(res, 400, { error: 'id is required' })
    const entry = await api.read(id)
    if (!entry) return send(res, 404, { error: 'not-found' })
    send(res, 200, { meta: entry.meta, body: entry.body, rel: entry.rel })
  })

  route('catalog', async (_req, res, query) => {
    send(res, 200, api.catalog(query.get('project') ?? undefined))
  })

  route(
    'entry/patch',
    async (req, res) => {
      const payload = await readJson(req)
      if (!payload) return send(res, 400, { error: 'json body required' })
      const id = String(payload.id ?? '')
      const body = typeof payload.body === 'string' ? payload.body : null
      if (!id || body === null) return send(res, 400, { error: 'id and body are required' })
      const result = await api.update(id, body, typeof payload.expectedRev === 'number' ? payload.expectedRev : undefined)
      if (!result.ok) return send(res, result.reason === 'stale' ? 409 : 404, { error: result.reason, currentRev: result.currentRev })
      await api.writeAudit('update', { id, via: 'panel', rev: result.entry.meta.stats.revisions })
      send(res, 200, { ok: true, rev: result.entry.meta.stats.revisions, checksum: result.entry.meta.checksum })
    },
    true,
  )

  route(
    'entry/invalidate',
    async (req, res) => {
      const payload = await readJson(req)
      const id = String(payload?.id ?? '')
      const reason = String(payload?.reason ?? '')
      if (!id || !reason) return send(res, 400, { error: 'id and reason are required' })
      const entry = await api.invalidate(id, { reason, supersededBy: payload?.supersededBy ? String(payload.supersededBy) : null })
      send(res, entry ? 200 : 404, entry ? { ok: true, id } : { error: 'not-found' })
    },
    true,
  )

  route(
    'doctor',
    async (_req, res, query) => {
      const fix = query.get('fix') === '1'
      const before = await api.stats()
      const { written, unchanged } = await api.rebuildDerived()
      const after = await api.stats()
      if (fix) await api.writeAudit('repair', { rebuilt: written, via: 'panel' })
      send(res, 200, { before: before.alerts, after: after.alerts, issues: after.issues, rebuilt: written, unchanged: unchanged.length, fixed: fix })
    },
    true,
  )

  return () => {
    for (const dispose of disposers) dispose()
  }
}

function summaryOf(entry: Entry) {
  const m = entry.meta
  return {
    id: m.id,
    kind: m.kind,
    title: m.title,
    summary: m.summary,
    scope: m.scope,
    project: m.project ?? null,
    confidence: m.confidence,
    source: m.provenance.source,
    activation: m.activation,
    heat: m.stats.heat,
    hits: m.stats.hits,
    revisions: m.stats.revisions,
    lastUsedAt: m.stats.lastUsedAt,
    createdAt: m.provenance.createdAt,
    invalidatedAt: m.temporal.invalidatedAt,
    pii: m.privacy.pii,
    rel: entry.rel,
  }
}

/** 同源 + 内容类型 + 一次性 nonce。nonce 防同源页面里的其他脚本误触写操作。 */
export function guard(req: WebRequest, res: WebResponse, mutating: boolean, nonce: string): boolean {
  const site = headerOf(req, 'sec-fetch-site')
  if (site === 'cross-site') {
    send(res, 403, { error: 'cross-site' })
    return true
  }
  const origin = headerOf(req, 'origin') ?? headerOf(req, 'referer')
  if (origin) {
    try {
      const url = new URL(origin)
      const host = headerOf(req, 'host') ?? ''
      if (host && url.host !== host) {
        send(res, 403, { error: 'cross-origin' })
        return true
      }
    } catch {
      send(res, 403, { error: 'bad-origin' })
      return true
    }
  }
  if (mutating) {
    if (req.method !== 'POST' && req.method !== 'PUT') {
      send(res, 405, { error: 'method-not-allowed' })
      return true
    }
    if (headerOf(req, 'x-gam-nonce') !== nonce) {
      send(res, 403, { error: 'csrf' })
      return true
    }
  }
  return false
}

export function headerOf(req: WebRequest, name: string): string | undefined {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value
}

export function queryOf(url: string): URLSearchParams {
  try {
    return new URL(url, 'http://localhost').searchParams
  } catch {
    return new URLSearchParams()
  }
}

export async function readJson(req: WebRequest): Promise<Record<string, unknown> | null> {
  const type = headerOf(req, 'content-type') ?? ''
  if (!type.includes('application/json')) return null
  const chunks: Buffer[] = []
  for await (const chunk of req as unknown as AsyncIterable<Buffer | string>) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk)
  }
  const raw = Buffer.concat(chunks).toString('utf8')
  if (raw.length === 0 || raw.length > 1_000_000) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function send(res: WebResponse, status: number, payload: unknown): void {
  const body = JSON.stringify(payload)
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('content-length', String(Buffer.byteLength(body)))
  res.end(body)
}

/** 面板加载时取一次；写操作必须带回来 */
export function registerNonceRoute(ctx: HostContext, nonce: string): () => void {
  if (!ctx.webServer?.register) return () => {}
  return ctx.webServer.register({
    kind: 'exact',
    path: `${PREFIX}/nonce`,
    handler: (_req, res) => send(res, 200, { nonce }),
  }) as () => void
}
