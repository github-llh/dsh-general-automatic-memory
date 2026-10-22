import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { MemoryService } from '../api.js'
import type { Ingestor } from '../ingest/index.js'
import type { ImportService } from '../importers/index.js'
import { resolveInRoot } from '../files.js'
import { createSnapshot, listSnapshots } from '../snapshot.js'
import { DIRS } from '../paths.js'
import { guard, queryOf, readJson, send } from './http.js'
import type { HostContext, WebRequest, WebResponse } from '../types.js'

const PREFIX = '/general-memory'

/**
 * 导入 / 待确认 / 快照 / 审计 / 时间线 的路由。
 *
 * 与主 http 路由同一套守卫：同源 + 写操作必须带一次性 nonce。
 * 导入是**批量写**，所以它比单条编辑更需要快照与 dry-run——
 * 这里的 apply 在落盘前强制 createSnapshot。
 */
export function registerFeatures(
  ctx: HostContext,
  nonce: string,
  deps: { api: MemoryService; ingestor: Ingestor; importer: ImportService },
): () => void {
  if (!ctx.webServer?.register) return () => {}
  const disposers: Array<() => void> = []

  const route = (
    name: string,
    handler: (req: WebRequest, res: WebResponse, query: URLSearchParams) => Promise<void> | void,
    mutating = false,
  ) => {
    disposers.push(
      ctx.webServer!.register({
        kind: 'exact',
        path: `${PREFIX}/${name}`,
        handler: async (req, res) => {
          if (guard(req, res, mutating, nonce)) return
          try {
            await handler(req, res, queryOf(req.url))
          } catch (cause) {
            ctx.logger?.warn?.(`[general-memory] route ${name} failed: ${(cause as Error).message}`)
            send(res, 400, { error: (cause as Error).message })
          }
        },
      }) as () => void,
    )
  }

  // ---- 导入 -------------------------------------------------------------
  route('import/sources', async (_req, res, query) => {
    const cwd = query.get('cwd') ?? process.cwd()
    send(res, 200, { cwd, sources: await deps.importer.sources(cwd) })
  })

  route(
    'import/scan',
    async (req, res) => {
      const body = (await readJson(req)) ?? {}
      const source = String(body.source ?? '')
      if (!source) return send(res, 400, { error: 'source is required' })
      const report = await deps.importer.scan(source as never, {
        ...(typeof body.cwd === 'string' ? { cwd: body.cwd } : {}),
        ...(typeof body.path === 'string' ? { path: body.path } : {}),
        ...(typeof body.limit === 'number' ? { limit: body.limit } : {}),
        ...(typeof body.maxTurns === 'number' ? { maxTurns: body.maxTurns } : {}),
      })
      send(res, 200, {
        ...report,
        budget: deps.importer.budgetImpact(report.items, deps.importer.configSnapshot.budget.alwaysChars),
      })
    },
    true,
  )

  route(
    'import/apply',
    async (req, res) => {
      const body = (await readJson(req)) ?? {}
      const scanId = String(body.scanId ?? '')
      const keys = Array.isArray(body.keys) ? body.keys.map(String) : []
      if (!scanId || keys.length === 0) return send(res, 400, { error: 'scanId and keys are required' })
      const report = await deps.importer.apply(scanId, keys, typeof body.project === 'string' ? body.project : undefined)
      send(res, 200, report)
    },
    true,
  )

  // ---- 待确认写入（suggest 模式） ---------------------------------------
  route('pending-writes', async (_req, res) => {
    send(res, 200, { items: deps.ingestor.pending.list(), size: deps.ingestor.pending.size })
  })

  route(
    'pending-writes/decide',
    async (req, res) => {
      const body = (await readJson(req)) ?? {}
      const id = String(body.id ?? '')
      const action = body.action === 'accept' ? 'accept' : 'reject'
      if (!id) return send(res, 400, { error: 'id is required' })
      const result = await deps.ingestor.resolvePending(id, action)
      send(res, result.ok ? 200 : 410, result)
    },
    true,
  )

  // ---- 快照 -------------------------------------------------------------
  route('snapshots', async (_req, res) => send(res, 200, { items: await listSnapshots(deps.api.root) }))

  route(
    'snapshot',
    async (req, res) => {
      const body = (await readJson(req)) ?? {}
      const info = await createSnapshot(deps.api.root, String(body.label ?? 'manual'))
      await deps.api.writeAudit('export', { snapshot: info.label, files: info.files, bytes: info.bytes })
      send(res, 200, info)
    },
    true,
  )

  // ---- 时间线 / 审计 ----------------------------------------------------
  route('episodes', async (_req, res, query) => {
    const slug = query.get('slug')
    const days = Math.min(Number(query.get('days') ?? '7') || 7, 90)
    if (!slug) return send(res, 400, { error: 'slug is required' })
    send(res, 200, { slug, days, items: await deps.api.episodes.recent(slug, days) })
  })

  route('audit', async (_req, res, query) => {
    const date = query.get('date') ?? new Date().toISOString().slice(0, 10)
    const limit = Math.min(Number(query.get('limit') ?? '200') || 200, 1000)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return send(res, 400, { error: 'date must be yyyy-mm-dd' })
    const abs = resolveInRoot(deps.api.root, path.posix.join(DIRS.audit, `${date}.jsonl`))
    let text = ''
    try {
      text = await readFile(abs, 'utf8')
    } catch {
      return send(res, 200, { date, items: [] })
    }
    const lines = text.split('\n').filter(Boolean)
    const items = lines.slice(-limit).map((line) => {
      try {
        return JSON.parse(line) as unknown
      } catch {
        return { raw: line }
      }
    })
    send(res, 200, { date, total: lines.length, items })
  })

  return () => {
    for (const dispose of disposers) dispose()
  }
}
