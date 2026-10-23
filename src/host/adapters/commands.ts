import type { MemoryService } from '../api.js'
import type { CommandDefinition, CommandResult, HostContext } from '../types.js'

const SUBCOMMANDS = ['status', 'search', 'read', 'add', 'forget', 'doctor', 'catalog', 'panel'] as const

export function registerCommands(ctx: HostContext, api: MemoryService): () => void {
  const commands = ctx.get('commands') as HostContext['commands']
  if (!commands) return () => {}
  const disposers: Array<() => void> = []
  for (const command of [memoryCommand(api), rememberCommand(api), recallCommand(api)]) {
    disposers.push(commands.register(command) as () => void)
  }
  return () => {
    for (const dispose of disposers) dispose()
  }
}

function ok(text: string): CommandResult {
  return { kind: 'success', text }
}
function fail(text: string): CommandResult {
  return { kind: 'error', text }
}

/** `/memory <subcommand>` —— 面板能做的事都必须有等价的命令（原则 P7：UI 只是 API 的一个视图） */
function memoryCommand(api: MemoryService): CommandDefinition {
  return {
    name: 'memory',
    description: `Manage long-term memory (${SUBCOMMANDS.join(' / ')})`,
    input: { hint: '<status|search|read|add|forget|doctor|catalog|panel> …' },
    async handler({ rawInput }) {
      const [sub, ...rest] = rawInput.trim().split(/\s+/)
      const arg = rest.join(' ')
      switch (sub) {
        case undefined:
        case '':
        case 'status':
          return ok(await renderStatus(api))
        case 'search':
          if (!arg) return fail('usage: /memory search <query>')
          return ok(renderHits(api, arg))
        case 'catalog':
          return ok(api.catalog().text || '(memory is empty)')
        case 'read':
          if (!arg) return fail('usage: /memory read <id>')
          return ok(await renderEntry(api, arg))
        case 'add':
          if (!arg) return fail('usage: /memory add <text>')
          return ok(await quickAdd(api, arg))
        case 'forget':
          if (!arg) return fail('usage: /memory forget <id> [reason]')
          return ok(await forget(api, arg))
        case 'doctor':
          return ok(await renderDoctor(api))
        case 'panel':
          return ok('Open the Memory panel from the sidebar. (CLI has no TUI; every panel view has a /memory equivalent.)')
        default:
          return fail(`unknown subcommand "${sub}". Try: ${SUBCOMMANDS.join(', ')}`)
      }
    },
  }
}

/** `/remember <text>` —— 一键捕获，不打断当前任务 */
function rememberCommand(api: MemoryService): CommandDefinition {
  return {
    name: 'remember',
    description: 'Capture something into long-term memory right now',
    input: { hint: '<text to remember>' },
    async handler({ rawInput }) {
      const text = rawInput.trim()
      if (!text) return fail('usage: /remember <text>')
      return ok(await quickAdd(api, text))
    },
  }
}

/**
 * `/recall <question>` —— 不注入上下文，只把检索结果打印给人看。
 * 用户不信任黑盒记忆时，最有效的解药不是解释架构，而是给他一个能反复试探的探针。
 */
function recallCommand(api: MemoryService): CommandDefinition {
  return {
    name: 'recall',
    description: 'Probe what memory would be recalled for a query (does not touch the conversation)',
    input: { hint: '<question>' },
    async handler({ rawInput }) {
      const query = rawInput.trim()
      if (!query) return fail('usage: /recall <question>')
      const hits = api.search(query, { limit: 10 })
      if (hits.length === 0) return ok(`Nothing in memory matches "${query}".`)
      const lines = hits.map((h) => {
        const flag = h.gated ? ' [GATED below threshold]' : ''
        return `${h.score.toFixed(3)}${flag} ${h.entry.meta.id} [${h.entry.meta.kind}·${h.entry.meta.confidence}·${h.entry.meta.provenance.source}]\n    ${h.entry.meta.title} — ${h.entry.meta.summary}\n    ${h.why}`
      })
      return ok(`Probe for "${query}" (${hits.length} candidate(s), ${hits.filter((h) => h.gated).length} gated):\n${lines.join('\n')}`)
    },
  }
}

async function quickAdd(api: MemoryService, text: string): Promise<string> {
  const title = text.length > 40 ? `${text.slice(0, 39)}…` : text
  const entry = await api.create({
    kind: 'feedback',
    title,
    summary: text.length > 120 ? `${text.slice(0, 119)}…` : text,
    body: text,
    source: 'user-stated',
    createdBy: 'slash-command',
    activation: 'on_demand',
  })
  return `Remembered ${entry.meta.id} [feedback·user-stated]. It will show up in the catalog on the next request; use /memory read ${entry.meta.id} to review.`
}

async function forget(api: MemoryService, arg: string): Promise<string> {
  const [id, ...reason] = arg.split(/\s+/)
  const entry = await api.invalidate(id!, { reason: reason.join(' ') || 'forgotten by user' })
  return entry ? `Invalidated ${id} → archive (recoverable via /memory doctor or the Recovery view).` : `No memory entry with id ${id}.`
}

async function renderStatus(api: MemoryService): Promise<string> {
  const s = await api.stats()
  const kinds = Object.entries(s.byKind)
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([k, n]) => `  ${k}: ${n}`)
    .join('\n')
  const verbatimRate = s.recall.inject.events > 0 ? s.recall.inject.verbatim / s.recall.inject.events : null
  const injection = s.recall.lastShareAt
    ? `${(s.recall.lastShare * 100).toFixed(2)}% of request (cap ${(s.recall.maxShare * 100).toFixed(0)}%, measured ${s.recall.lastShareAt})`
    : 'not measured yet'
  return [
    `Memory root : ${s.root}`,
    `Entries     : ${s.entryCount}`,
    kinds || '  (none)',
    `Index       : ${s.index.lines}/${s.index.maxLines} lines · ${s.index.bytes}/${s.index.maxBytes} bytes${s.index.overBudget ? ' · OVER BUDGET' : ''}`,
    `Injection   : ${injection}`,
    `Prefix cache: verbatim ${verbatimRate === null ? '—' : `${(verbatimRate * 100).toFixed(0)}%`} · prefix breaks ${s.recall.inject.prefixBreaks} · inject events ${s.recall.inject.events} · catalog entries ${s.recall.inject.hits}`,
    `Recall      : tool events ${s.recall.tool.events} · hits ${s.recall.tool.hits} · zero-hit ${s.recall.tool.zeroHit} · gated ${s.recall.tool.gated}`,
    `Issues      : ${s.issues.length}`,
    s.alerts.length > 0 ? `Alerts:\n${s.alerts.map((a) => `  [${a.level}] ${a.code}: ${a.message}`).join('\n')}` : 'Alerts      : none',
  ].join('\n')
}

function renderHits(api: MemoryService, query: string): string {
  const hits = api.search(query, { limit: 10 })
  if (hits.length === 0) return `Nothing matches "${query}".`
  return hits
    .map((h) => `${h.score.toFixed(3)}${h.gated ? ' [gated]' : ''} ${h.entry.meta.id} [${h.entry.meta.kind}] ${h.entry.meta.title} — ${h.entry.meta.summary}`)
    .join('\n')
}

async function renderEntry(api: MemoryService, id: string): Promise<string> {
  const entry = await api.read(id)
  if (!entry) return `No memory entry with id ${id}.`
  const m = entry.meta
  return [
    `${m.id} · ${m.kind} · ${m.scope}${m.project ? `/${m.project}` : ''} · ${m.confidence} · ${m.provenance.source}`,
    `title   : ${m.title}`,
    `summary : ${m.summary}`,
    `activation: ${m.activation}${m.globs.length > 0 ? ` (${m.globs.join(', ')})` : ''}`,
    `created : ${m.provenance.createdAt}${m.provenance.origin ? ` · ${m.provenance.origin}` : ''}`,
    `stats   : rev ${m.stats.revisions} · hits ${m.stats.hits} · heat ${m.stats.heat}`,
    m.temporal.invalidatedAt ? `INVALIDATED ${m.temporal.invalidatedAt}${m.temporal.supersededBy ? ` → ${m.temporal.supersededBy}` : ''}` : '',
    `path    : ${entry.rel}`,
    '',
    entry.body.trim(),
  ]
    .filter((line) => line !== undefined)
    .join('\n')
}

async function renderDoctor(api: MemoryService): Promise<string> {
  const before = await api.stats()
  const { written, unchanged } = await api.rebuildDerived()
  const after = await api.stats()
  const lines = [
    `Scanned ${after.entryCount} entries.`,
    after.issues.length === 0 ? 'No invalid entries.' : `${after.issues.length} invalid entr(ies):`,
    ...after.issues.slice(0, 10).map((i) => `  [${i.issue}] ${i.rel}: ${i.message}`),
    `Derived files: rewrote ${written.length ? written.join(', ') : 'none'} · unchanged ${unchanged.length} (content-hash matched)`,
    after.index.overBudget
      ? `INDEX.md is over budget (${after.index.lines}/${after.index.maxLines} lines) — consolidation needed.`
      : `INDEX.md within budget (${after.index.lines}/${after.index.maxLines} lines).`,
  ]
  if (before.alerts.length > 0) lines.push(`Alerts: ${before.alerts.map((a) => `${a.code}(${a.level})`).join(', ')}`)
  return lines.join('\n')
}
