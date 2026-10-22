import type { MemoryService } from '../api.js'
import type { HostContext, ToolDefinition } from '../types.js'
import type { Activation, Kind, MemoryConfig } from '../model.js'

/**
 * 工具面。schema 每轮都进 request/header，所以这是一笔**每轮固定开销**：
 * 前作挂了 15 个 memory_* 工具，实测那次会话 request/header 42,965 B。
 * 我们压到 6 个，并支持 minimal(3) 档。
 *
 * 所有工具返回**纯文本**而不是 JSON：省 token，且模型读文本比读嵌套 JSON 更稳。
 */
export function registerTools(ctx: HostContext, api: MemoryService, config: MemoryConfig): () => void {
  // 可选服务必须走 get()：Cordis 对未 inject 的 service 属性访问会直接抛错
  const tools = ctx.get('tools') as HostContext['tools']
  if (!tools) return () => {}
  const disposers: Array<() => void> = []
  const surface = config.toolSurface === 'minimal' ? MINIMAL : STANDARD
  for (const toolName of surface) {
    const definition = TOOLS[toolName]?.(api, config)
    if (definition) disposers.push(tools.register(definition) as () => void)
  }
  return () => {
    for (const dispose of disposers) dispose()
  }
}

const MINIMAL = ['memory_recall', 'memory_read', 'memory_status']
const STANDARD = [...MINIMAL, 'memory_write', 'memory_forget', 'memory_graph']

const OBJECT_SCHEMA = { type: 'object', additionalProperties: true } as const

const TOOLS: Record<string, (api: MemoryService, config: MemoryConfig) => ToolDefinition> = {
  memory_recall: (api, config) => ({
    name: 'memory_recall',
    description:
      'Search long-term memory. Returns a compact list of id + title + summary (no bodies). Use memory_read with an id to get the full text. Leave query empty to get the catalog.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What to look for. Empty = return the catalog.' },
        limit: { type: 'number', description: `Max results (default ${config.retrieval.recallLimit})` },
        kind: { type: 'string', description: 'persona|preference|feedback|relations|project|reference|procedure' },
        project: { type: 'string', description: 'Project slug to restrict to' },
      },
      required: [],
      additionalProperties: true,
    },
    output: { schema: OBJECT_SCHEMA },
    async execute(args) {
      const query = typeof args.query === 'string' ? args.query : ''
      if (!query.trim()) {
        const catalog = api.catalog(typeof args.project === 'string' ? args.project : undefined)
        return catalog.text || '(memory is empty)'
      }
      const hits = api.search(query, {
        limit: typeof args.limit === 'number' ? args.limit : undefined,
        kind: typeof args.kind === 'string' ? args.kind : undefined,
        project: typeof args.project === 'string' ? args.project : undefined,
      })
      const kept = hits.filter((h) => !h.gated).slice(0, typeof args.limit === 'number' ? args.limit : config.retrieval.recallLimit)
      const gated = hits.filter((h) => h.gated).length
      // 被门控裁掉的候选要可观测：这是「该记的没被想起来」的唯一诊断入口
      if (gated > 0) {
        api.noteGated(gated)
        void api.writeAudit('gate-drop', { q: query.slice(0, 80), gated })
      }
      api.noteRecall(kept.map((h) => h.entry.meta.id))
      if (kept.length === 0) {
        return `No long-term memory matched "${query}". Try a more specific entity name, or memory_read an id from the catalog.`
      }
      const budget = config.budget.recallChars
      const lines: string[] = []
      let used = 0
      for (const hit of kept) {
        const line = `- ${hit.entry.meta.id} [${hit.entry.meta.kind}·${hit.entry.meta.confidence}·${hit.entry.meta.provenance.source}] ${hit.entry.meta.title} — ${hit.entry.meta.summary} (${hit.why})`
        if (used + line.length > budget) {
          lines.push(`(${kept.length - lines.length} more matches truncated; narrow the query)`)
          break
        }
        lines.push(line)
        used += line.length
      }
      return lines.join('\n')
    },
  }),

  memory_read: (api) => ({
    name: 'memory_read',
    description: 'Read the full text of one memory entry by id. Also works for archived entries.',
    parameters: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Entry id, e.g. m_01J8ZK3M9QW7RTX2YVBN4C5D6E' } },
      required: ['id'],
      additionalProperties: true,
    },
    output: { schema: OBJECT_SCHEMA },
    async execute(args) {
      const id = String(args.id ?? '')
      const entry = await api.read(id)
      if (!entry) return `No memory entry with id ${id}.`
      api.noteRecall([id])
      const m = entry.meta
      const meta = [
        `id: ${m.id}`,
        `kind: ${m.kind} · scope: ${m.scope}${m.project ? ` · project: ${m.project}` : ''}`,
        `confidence: ${m.confidence} · source: ${m.provenance.source} · created: ${m.provenance.createdAt.slice(0, 10)}`,
        m.temporal.invalidatedAt ? `INVALIDATED at ${m.temporal.invalidatedAt}${m.temporal.supersededBy ? ` superseded by ${m.temporal.supersededBy}` : ''}` : '',
        m.tags.length > 0 ? `tags: ${m.tags.join(', ')}` : '',
        m.entities.length > 0 ? `entities: ${m.entities.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n')
      return `${meta}\n\n${entry.body.trim()}\n`
    },
  }),

  memory_status: (api) => ({
    name: 'memory_status',
    description: 'Read-only diagnostics: where memory lives, how many entries, injection budget usage, alerts.',
    parameters: { type: 'object', properties: {}, required: [], additionalProperties: true },
    output: { schema: OBJECT_SCHEMA },
    async execute() {
      const s = await api.stats()
      const kinds = Object.entries(s.byKind)
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([k, n]) => `${k}:${n}`)
        .join(' ')
      const lines = [
        `root: ${s.root}`,
        `entries: ${s.entryCount} (${kinds || 'none'})`,
        `index: ${s.index.lines}/${s.index.maxLines} lines, ${s.index.bytes}/${s.index.maxBytes} bytes${s.index.overBudget ? ' — OVER BUDGET' : ''}`,
        `injection: ${(s.recall.lastShare * 100).toFixed(2)}% of request (cap ${(s.recall.maxShare * 100).toFixed(0)}%)`,
        `recall: inject ${s.recall.inject.events} events / ${s.recall.inject.hits} hits / verbatim ${s.recall.inject.verbatim} · tool ${s.recall.tool.events} events / zeroHit ${s.recall.tool.zeroHit} · gated ${s.recall.inject.gated}`,
        s.issues.length > 0 ? `issues: ${s.issues.length} (run /memory doctor)` : 'issues: none',
      ]
      if (s.alerts.length > 0) lines.push(`alerts:\n${s.alerts.map((a) => `  [${a.level}] ${a.code}: ${a.message}`).join('\n')}`)
      return lines.join('\n')
    },
  }),

  memory_write: (api) => ({
    name: 'memory_write',
    description:
      'Submit something worth remembering long-term (who the user is, how they want you to work, a decision and why, who/what relates to what). The plugin decides ADD / UPDATE / NOOP — do not resubmit the same fact.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'One line, <=40 chars' },
        summary: { type: 'string', description: 'One sentence, <=120 chars. This is the ONLY text shown in the always-loaded catalog — write it so future-you can recognise the memory.' },
        content: { type: 'string', description: 'The memory body. For feedback use: rule / **Why:** / **How to apply:**' },
        kind: { type: 'string', description: 'persona|preference|feedback|relations|project|reference' },
        entities: { type: 'array', items: { type: 'string' }, description: 'People/systems this is about (required for relations)' },
        tags: { type: 'array', items: { type: 'string' } },
        activation: { type: 'string', description: 'always|glob|on_demand|manual (default on_demand)' },
        globs: { type: 'array', items: { type: 'string' }, description: 'Required when activation=glob' },
        project: { type: 'string', description: 'Project slug when the memory is project-scoped' },
        userStated: { type: 'boolean', description: 'true only if the user literally said this' },
      },
      required: ['title', 'summary', 'content', 'kind'],
      additionalProperties: true,
    },
    output: { schema: OBJECT_SCHEMA },
    async execute(args) {
      const kind = String(args.kind ?? '')
      const title = String(args.title ?? '').trim()
      const summary = String(args.summary ?? '').trim()
      const content = String(args.content ?? '')
      if (!title || !summary || !content) return 'REJECTED: title, summary and content are all required.'
      if (!['persona', 'preference', 'feedback', 'relations', 'project', 'reference'].includes(kind)) {
        return `REJECTED: kind must be one of persona|preference|feedback|relations|project|reference (got "${kind}"). episodes and procedures are not writable by this tool.`
      }
      // 去重：同 kind 下标题或摘要高度重合就不写（NOOP 是显式决策，不是失败）
      const similar = api.search(`${title} ${summary}`, { limit: 3, kind })
      const duplicate = similar.find((h) => h.parts.relevance > 0.85)
      if (duplicate) {
        return `NOOP: ${duplicate.entry.meta.id} already covers this ("${duplicate.entry.meta.title}"). Use memory_forget + memory_write only if it is actually wrong.`
      }
      const entities = Array.isArray(args.entities) ? args.entities.map(String) : []
      if (kind === 'relations' && entities.length < 2) {
        return 'REJECTED: relations needs at least two entities (from, to).'
      }
      const scope = args.project ? 'project' : 'global'
      const activation = String(args.activation ?? 'on_demand')
      const entry = await api.create({
        kind: kind as Kind,
        title,
        summary,
        body: content,
        scope,
        ...(args.project ? { project: String(args.project) } : {}),
        tags: Array.isArray(args.tags) ? args.tags.map(String) : [],
        entities,
        activation: (['always', 'glob', 'on_demand', 'manual'].includes(activation) ? activation : 'on_demand') as Activation,
        globs: Array.isArray(args.globs) ? args.globs.map(String) : [],
        source: args.userStated === true ? 'user-stated' : 'model-inferred',
        createdBy: 'dsh-agent',
      })
      return `ADD ${entry.meta.id} [${entry.meta.kind}·${entry.meta.provenance.source}] ${title}`
    },
  }),

  memory_forget: (api) => ({
    name: 'memory_forget',
    description: 'Invalidate a memory (reversible, moved to archive). Pass hard=true with confirm to delete permanently.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        reason: { type: 'string' },
        supersededBy: { type: 'string', description: 'id of the entry that replaces it' },
        hard: { type: 'boolean' },
        confirm: { type: 'string', description: 'Last 4 characters of the id; required when hard=true' },
      },
      required: ['id', 'reason'],
      additionalProperties: true,
    },
    output: { schema: OBJECT_SCHEMA },
    async execute(args) {
      const id = String(args.id ?? '')
      const reason = String(args.reason ?? '')
      if (!reason) return 'REJECTED: a reason is required — forgetting must be explainable.'
      if (args.hard === true) {
        const result = await api.hardDelete(id, String(args.confirm ?? ''))
        return 'error' in result ? `REJECTED: ${result.error}` : `DELETED ${id} (${result.deleted.length} file(s)); derived indexes rebuilt.`
      }
      const entry = await api.invalidate(id, { reason, supersededBy: args.supersededBy ? String(args.supersededBy) : null })
      return entry ? `INVALIDATED ${id} → archive (recoverable). Reason: ${reason}` : `No memory entry with id ${id}.`
    },
  }),

  memory_graph: (api) => ({
    name: 'memory_graph',
    description: 'Traverse the relations graph from an entity or an entry id. Forward and backward in one call.',
    parameters: {
      type: 'object',
      properties: {
        entity: { type: 'string' },
        id: { type: 'string' },
        limit: { type: 'number' },
      },
      required: [],
      additionalProperties: true,
    },
    output: { schema: OBJECT_SCHEMA },
    async execute(args) {
      const limit = typeof args.limit === 'number' ? Math.min(args.limit, 20) : 10
      const needle = String(args.entity ?? args.id ?? '').trim()
      if (!needle) return 'Provide either entity or id.'
      const entries = api
        .list()
        .filter((e) => e.meta.kind === 'relations' && e.meta.temporal.invalidatedAt === null)
        .filter((e) => e.meta.entities.some((x) => x === needle) || e.meta.id === needle)
        .slice(0, limit)
      if (entries.length === 0) return `No relations found for "${needle}".`
      return entries
        .map((e) => {
          const [from, to] = e.meta.entities
          const state = e.meta.temporal.invalidatedAt ? ` (invalidated ${e.meta.temporal.invalidatedAt})` : ''
          return `- ${from} —[${e.meta.title}]→ ${to}${state} · ${e.meta.id} · ${e.meta.summary}`
        })
        .join('\n')
    },
  }),
}
