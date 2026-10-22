import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { MemoryService } from '../api.js'
import type { Ingestor } from '../ingest/index.js'
import type { ImportService } from '../importers/index.js'
import { resolveInRoot } from '../files.js'
import { utcDayFilesForLocalDate } from '../audit.js'
import { buildGraph } from '../graph.js'
import { createSnapshot, diffSnapshots, listSnapshots, restoreSnapshot } from '../snapshot.js'
import { applyProjection, exportZip, importZip, projectionTargets } from '../bridge.js'
import { curate } from '../curator.js'
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
  const server = ctx.get('webServer') as HostContext['webServer']
  if (!server?.register) return () => {}
  const disposers: Array<() => void> = []

  const route = (
    name: string,
    handler: (req: WebRequest, res: WebResponse, query: URLSearchParams) => Promise<void> | void,
    mutating = false,
  ) => {
    disposers.push(
      server.register({
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
    // 面板按用户本地日期查询；审计文件按 UTC 日期命名，所以要把本地日换算成 UTC 区间。
    const tzOffset = Number(query.get('tzOffset') ?? '0') || 0
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return send(res, 400, { error: 'date must be yyyy-mm-dd' })
    if (!Number.isFinite(tzOffset) || Math.abs(tzOffset) > 24 * 60) return send(res, 400, { error: 'bad tzOffset' })
    const { start, end, files } = utcDayFilesForLocalDate(date, tzOffset)
    const rows: Array<Record<string, unknown>> = []
    let total = 0
    for (const file of files) {
      let text = ''
      try {
        text = await readFile(resolveInRoot(deps.api.root, path.posix.join(DIRS.audit, `${file}.jsonl`)), 'utf8')
      } catch {
        continue
      }
      for (const line of text.split('\n').filter(Boolean)) {
        try {
          const row = JSON.parse(line) as Record<string, unknown>
          const ts = Date.parse(String(row.ts ?? ''))
          if (Number.isFinite(ts) && (ts < start || ts >= end)) continue
          rows.push(row)
        } catch {
          rows.push({ raw: line })
        }
      }
    }
    rows.sort((a, b) => String(a.ts ?? '').localeCompare(String(b.ts ?? '')))
    total = rows.length
    send(res, 200, { date, total, items: rows.slice(-limit) })
  })


  // ---- 固化 -------------------------------------------------------------
  route(
    'consolidate',
    async (_req, res) => {
      const result = await curate(deps.api, deps.importer.configSnapshot)
      send(res, 200, result)
    },
    true,
  )

  // ---- 快照 diff / 回滚 -------------------------------------------------
  route('snapshot/diff', async (_req, res, query) => {
    const a = query.get('a')
    const b = query.get('b')
    if (!a || !b) return send(res, 400, { error: 'a and b are required' })
    send(res, 200, await diffSnapshots(deps.api.root, a, b))
  })

  route(
    'snapshot/restore',
    async (req, res) => {
      const body = (await readJson(req)) ?? {}
      const label = String(body.label ?? '')
      if (!label) return send(res, 400, { error: 'label is required' })
      const paths = Array.isArray(body.paths) ? body.paths.map(String) : undefined
      const result = await restoreSnapshot(deps.api.root, label, paths)
      await deps.api.refresh()
      await deps.api.writeAudit('restore', { label, restored: result.restored, preSnapshot: result.preSnapshot })
      send(res, 200, result)
    },
    true,
  )

  // ---- 投影（可选，默认关闭） -------------------------------------------
  route('projections', async (_req, res, query) => {
    const cwd = query.get('cwd') ?? process.cwd()
    const enabled = deps.importer.configSnapshot.portability.projections
    send(res, 200, {
      cwd,
      targets: projectionTargets(cwd).map((target) => ({ id: target.id, label: target.label, path: target.path, enabled: enabled[target.id] === true })),
    })
  })

  route(
    'projections/apply',
    async (req, res) => {
      const body = (await readJson(req)) ?? {}
      const cwd = typeof body.cwd === 'string' ? body.cwd : process.cwd()
      const wanted = Array.isArray(body.ids) ? body.ids.map(String) : Object.entries(deps.importer.configSnapshot.portability.projections).filter(([, on]) => on === true).map(([id]) => id)
      const entries = deps.api.list()
      const results = []
      for (const target of projectionTargets(cwd)) {
        if (!wanted.includes(target.id)) continue
        results.push(await applyProjection(target, entries))
      }
      await deps.api.writeAudit('export', { projections: results.map((r) => r.target), changed: results.filter((r) => r.changed).length })
      send(res, 200, { results })
    },
    true,
  )

  // ---- zip 导入导出 -----------------------------------------------------
  route(
    'export',
    async (req, res) => {
      const body = (await readJson(req)) ?? {}
      const result = await exportZip(deps.api.root, { includePii: body.includePii === true })
      await deps.api.writeAudit('export', { path: result.path, files: result.files, excluded: result.excluded })
      send(res, 200, result)
    },
    true,
  )

  route(
    'import/zip',
    async (req, res) => {
      const body = (await readJson(req)) ?? {}
      const zipPath = String(body.path ?? '')
      if (!zipPath) return send(res, 400, { error: 'path is required' })
      const pre = await createSnapshot(deps.api.root, 'pre-zip-import')
      const result = await importZip(deps.api.root, zipPath)
      await deps.api.refresh()
      await deps.api.writeAudit('import', { source: 'zip', zipPath, restored: result.restored, skipped: result.skipped, snapshot: pre.label })
      send(res, 200, { ...result, preSnapshot: pre.label })
    },
    true,
  )

  // ---- 族谱 / 配置 ------------------------------------------------------
  route('graph', async (_req, res, query) => {
    const entity = query.get('entity')
    const rawLimit = Number(query.get('limit'))
    const payload = buildGraph(deps.api.list(), {
      ...(Number.isFinite(rawLimit) && rawLimit > 0 ? { limit: rawLimit } : {}),
    })
    // entity 参数保留给旧调用方；新面板一次拉全量在本地筛选，交互不打后端。
    const edges = entity ? payload.edges.filter((edge) => edge.from === entity || edge.to === entity || edge.id === entity || edge.entryId === entity) : payload.edges
    const nodes = entity ? payload.nodes.filter((node) => node.id === entity || edges.some((edge) => edge.from === node.id || edge.to === node.id)) : payload.nodes
    send(res, 200, { ...payload, nodes, edges })
  })

  route('config', async (_req, res) => {
    const config = deps.importer.configSnapshot
    send(res, 200, { ...config, memoryRoot: deps.api.root, indexBackend: deps.api.indexBackend })
  })

  return () => {
    for (const dispose of disposers) dispose()
  }
}
