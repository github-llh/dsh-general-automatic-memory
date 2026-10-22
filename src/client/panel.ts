import { Component, createElement as h, useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  api,
  type ApplyReportView,
  type AuditRow,
  type EntryDetail,
  type EntrySummary,
  type GraphEdge,
  type ImportSourceStatus,
  type PendingView,
  type ProjectionView,
  type ScanReportView,
  type SnapshotInfo,
  type Stats,
} from './api.js'
import { ensureStyles } from './styles.js'

export type Translate = (key: string) => string

/** 侧栏图标（slot: sidebar.panellist，owner props 为 { size, active }） */
export function MemoryPanelIcon(props: { size?: number; active?: boolean }): ReactNode {
  const size = props.size ?? 20
  return h(
    'svg',
    {
      className: 'gam-icon',
      viewBox: '0 0 24 24',
      width: size,
      height: size,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.6,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': true,
      opacity: props.active ? 1 : 0.75,
    },
    h('path', { d: 'M5 4h10l4 4v12H5z' }),
    h('path', { d: 'M15 4v4h4' }),
    h('circle', { cx: '9', cy: '12', r: '1.2', fill: 'currentColor', stroke: 'none' }),
    h('circle', { cx: '15', cy: '16', r: '1.2', fill: 'currentColor', stroke: 'none' }),
    h('path', { d: 'M9 12l6 4', opacity: 0.6 }),
  )
}

/**
 * 面板根组件。每个视图都包 ErrorBoundary：组件抛错时 dsh 只会让 slot 空白，
 * console 里留一行 `slot entry crashed in '<slot>'`，用户看到的是「点了没反应」——
 * 必须自己降级成可读的错误而不是白屏。
 */
export function MemoryPanel(props: { t: Translate }): ReactNode {
  ensureStyles()
  const [view, setView] = useState<ViewId>('overview')
  const t = props.t

  return h(
    'div',
    { className: 'gam-root' },
    h(
      'header',
      { className: 'gam-head' },
      h('span', { className: 'gam-title' }, t('panel.title')),
      h('span', { className: 'gam-sub' }, 'dsh-general-automatic-memory'),
    ),
    h(
      'nav',
      { className: 'gam-nav', 'aria-label': t('panel.title') },
      navButton('overview', t('nav.overview'), view, setView),
      navButton('browse', t('nav.browse'), view, setView),
      navButton('import', t('nav.import'), view, setView),
      navButton('timeline', t('nav.timeline'), view, setView),
      navButton('graph', t('nav.graph'), view, setView),
      navButton('audit', t('nav.audit'), view, setView),
      navButton('recovery', t('nav.recovery'), view, setView),
      navButton('settings', t('nav.settings'), view, setView),
    ),
    h(
      'main',
      { className: 'gam-body' },
      h(
        Boundary,
        { label: view },
        view === 'overview'
          ? h(Overview, { t })
          : view === 'browse'
            ? h(Browse, { t })
            : view === 'import'
              ? h(ImportView, { t })
              : view === 'timeline'
                ? h(TimelineView, { t })
                : view === 'graph'
                  ? h(GraphView, { t })
                  : view === 'audit'
                    ? h(AuditView, { t })
                    : view === 'recovery'
                      ? h(RecoveryView, { t })
                      : h(SettingsView, { t }),
      ),
    ),
  )
}

type ViewId = 'overview' | 'browse' | 'import' | 'timeline' | 'graph' | 'audit' | 'recovery' | 'settings'

function navButton(id: ViewId, label: string, current: string, setView: (v: ViewId) => void): ReactNode {
  return h(
    'button',
    {
      type: 'button',
      key: id,
      'aria-current': current === id ? 'page' : undefined,
      onClick: () => setView(id),
    },
    label,
  )
}

// ---------------------------------------------------------------------------
// 总览：一眼回答「记忆系统健康吗？花了多少 token？有没有要我处理的事？」
// ---------------------------------------------------------------------------

function Overview(props: { t: Translate }): ReactNode {
  const t = props.t
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fixing, setFixing] = useState(false)

  const load = useCallback(() => {
    api.stats().then(setStats).catch((cause: Error) => setError(cause.message))
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(() => {
      // 页面不可见时不轮询：dsh 的 domain/changed 只在进程内，跨进程推送不可用，
      // 所以只能轮询 —— 那就别在后台白轮询
      if (!document.hidden) load()
    }, 2000)
    return () => clearInterval(timer)
  }, [load])

  if (error) {
    return h(
      'div',
      { className: 'gam-error' },
      h('div', null, t('panel.hostUnavailable')),
      h('pre', { className: 'gam-pre' }, error),
      h('div', { className: 'gam-actions' }, h('button', { className: 'gam-btn', type: 'button', onClick: () => { setError(null); load() } }, t('panel.retry'))),
    )
  }
  if (!stats) return h('div', { className: 'gam-empty' }, t('panel.loading'))

  const share = stats.recall.lastShare
  const shareCap = stats.recall.maxShare || 0.03
  const verbatimRate = stats.recall.inject.events > 0 ? stats.recall.inject.verbatim / stats.recall.inject.events : 1
  const zeroHitRate = stats.recall.tool.events > 0 ? stats.recall.tool.zeroHit / stats.recall.tool.events : 0

  return h(
    'div',
    null,
    h(
      'div',
      { className: 'gam-grid' },
      card(t('overview.budget'), h('div', { className: 'gam-big' }, `${(share * 100).toFixed(2)}%`), [
        meter(Math.min(1, share / shareCap)),
        row(t('overview.budgetShare'), `${(shareCap * 100).toFixed(0)}% cap`),
        row('index', `${stats.index.lines}/${stats.index.maxLines} lines`),
        row('bytes', `${stats.index.bytes}/${stats.index.maxBytes}`),
      ]),
      card(t('overview.cacheHealth'), h('div', { className: 'gam-big' }, `${(verbatimRate * 100).toFixed(0)}%`), [
        meter(verbatimRate),
        row(t('overview.verbatimRate'), `${stats.recall.inject.verbatim}/${stats.recall.inject.events}`),
        row('inject chars', String(stats.recall.inject.chars)),
        row('inject tokens', String(stats.recall.inject.tokens)),
      ]),
      card(t('overview.entries'), h('div', { className: 'gam-big' }, String(stats.entryCount)), [
        ...Object.entries(stats.byKind)
          .sort((a, b) => b[1] - a[1])
          .map(([kind, n]) => row(`${t(`kind.${kind}`) === `kind.${kind}` ? kind : t(`kind.${kind}`)}`, String(n))),
        row('issues', String(stats.issues.length)),
      ]),
      card(t('overview.recall'), h('div', { className: 'gam-big' }, String(stats.recall.tool.events)), [
        row(t('overview.zeroHit'), `${(zeroHitRate * 100).toFixed(0)}%`),
        row(t('overview.gated'), String(stats.recall.inject.gated)),
        row('hits', String(stats.recall.tool.hits)),
      ]),
    ),
    h(
      'section',
      { className: 'gam-alerts', 'aria-label': t('overview.alerts') },
      stats.alerts.length === 0
        ? h('div', { className: 'gam-muted' }, t('overview.noAlerts'))
        : stats.alerts.map((alert) =>
            h('div', { className: 'gam-alert', key: alert.code, 'data-level': alert.level }, `${alert.code} · ${alert.message}`),
          ),
    ),
    h(
      'div',
      { className: 'gam-actions' },
      h(
        'button',
        {
          className: 'gam-btn',
          type: 'button',
          disabled: fixing,
          onClick: () => {
            setFixing(true)
            api
              .doctor(true)
              .then(load)
              .catch((cause: Error) => setError(cause.message))
              .finally(() => setFixing(false))
          },
        },
        fixing ? '…' : `${t('nav.recovery')} · doctor`,
      ),
      h('button', { className: 'gam-btn', type: 'button', onClick: load }, t('panel.retry')),
    ),
    h('p', { className: 'gam-muted', style: { marginTop: '12px', wordBreak: 'break-all' } }, stats.root),
  )
}

function card(title: string, headline: ReactNode, rows: ReactNode[]): ReactNode {
  return h('div', { className: 'gam-card', key: title }, h('h3', null, title), headline, ...rows)
}

function row(label: string, value: string): ReactNode {
  return h('div', { className: 'gam-row', key: label }, h('span', { className: 'gam-muted' }, label), h('span', null, value))
}

function meter(ratio: number): ReactNode {
  const pct = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0)) * 100
  return h('div', { className: 'gam-meter', role: 'presentation' }, h('i', { style: { width: `${pct}%` } }))
}

// ---------------------------------------------------------------------------
// 浏览：过滤 + 搜索 + 列表 + 详情
// ---------------------------------------------------------------------------

const KINDS = ['persona', 'preference', 'feedback', 'relations', 'project', 'reference', 'procedure']

function Browse(props: { t: Translate }): ReactNode {
  const t = props.t
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('')
  const [items, setItems] = useState<EntrySummary[]>([])
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<EntryDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(
    (q: string, k: string) => {
      setBusy(true)
      api
        .entries({ q: q || undefined, kind: k || undefined, limit: 200 })
        .then((page) => {
          setItems(page.items)
          setTotal(page.total)
        })
        .catch((cause: Error) => setError(cause.message))
        .finally(() => setBusy(false))
    },
    [],
  )

  useEffect(() => {
    load(query, kind)
  }, [kind, load, query])

  const open = useCallback((id: string) => {
    api.entry(id).then(setSelected).catch((cause: Error) => setError(cause.message))
  }, [])

  return h(
    'div',
    null,
    h(
      'div',
      { className: 'gam-toolbar' },
      h('input', {
        className: 'gam-input',
        type: 'search',
        value: query,
        placeholder: t('browse.search'),
        'aria-label': t('browse.search'),
        onChange: (event: { target: { value: string } }) => setQuery(event.target.value),
      }),
      h(
        'select',
        {
          className: 'gam-select',
          value: kind,
          'aria-label': t('browse.allKinds'),
          onChange: (event: { target: { value: string } }) => setKind(event.target.value),
        },
        h('option', { value: '' }, t('browse.allKinds')),
        ...KINDS.map((value) => h('option', { value, key: value }, t(`kind.${value}`))),
      ),
      h('span', { className: 'gam-muted' }, busy ? '…' : `${total}`),
    ),
    error ? h('div', { className: 'gam-error' }, error) : null,
    items.length === 0 && !busy
      ? h('div', { className: 'gam-empty' }, query || kind ? t('browse.noResults') : t('panel.empty'))
      : h(
          'div',
          { className: 'gam-list', role: 'list' },
          items.map((item) =>
            h(
              'button',
              { className: 'gam-item', type: 'button', role: 'listitem', key: item.id, onClick: () => open(item.id) },
              h('div', { className: 'gam-item-title' }, item.title),
              h('div', { className: 'gam-item-sum' }, item.summary),
              h(
                'div',
                { className: 'gam-tags' },
                h('span', { className: 'gam-tag' }, t(`kind.${item.kind}`)),
                h('span', { className: 'gam-tag' }, item.confidence),
                h('span', { className: 'gam-tag' }, item.source),
                h('span', { className: 'gam-tag' }, item.activation),
                item.pii ? h('span', { className: 'gam-tag' }, 'PII') : null,
                item.invalidatedAt ? h('span', { className: 'gam-tag' }, 'invalidated') : null,
                h('span', { className: 'gam-tag' }, `${item.hits} ${t('browse.hits')}`),
                typeof item.score === 'number' ? h('span', { className: 'gam-tag' }, item.score.toFixed(3)) : null,
              ),
            ),
          ),
        ),
    selected ? h(Detail, { entry: selected, t, onChanged: () => { load(query, kind); setSelected(null) } }) : null,
  )
}

function Detail(props: { entry: EntryDetail; t: Translate; onChanged: () => void }): ReactNode {
  const t = props.t
  const entry = props.entry
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  return h(
    'div',
    { className: 'gam-detail' },
    h('div', { className: 'gam-item-title' }, entry.meta.title),
    h('div', { className: 'gam-muted' }, entry.meta.summary),
    h(
      'div',
      { className: 'gam-tags' },
      h('span', { className: 'gam-tag' }, entry.meta.id),
      h('span', { className: 'gam-tag' }, entry.rel),
      h('span', { className: 'gam-tag' }, JSON.stringify(entry.meta.provenance)),
    ),
    h('pre', { className: 'gam-pre' }, entry.body),
    h(
      'div',
      { className: 'gam-actions' },
      h('input', {
        className: 'gam-input',
        value: reason,
        placeholder: 'reason (required to invalidate)',
        'aria-label': 'reason',
        onChange: (event: { target: { value: string } }) => setReason(event.target.value),
      }),
      h(
        'button',
        {
          className: 'gam-btn',
          type: 'button',
          'data-tone': 'danger',
          onClick: () => {
            if (!reason.trim()) {
              setMessage('a reason is required — forgetting must be explainable')
              return
            }
            api
              .invalidate(entry.meta.id, reason.trim())
              .then(() => props.onChanged())
              .catch((cause: Error) => setMessage(cause.message))
          },
        },
        'Invalidate',
      ),
      message ? h('span', { className: 'gam-muted' }, message) : null,
    ),
    h('p', { className: 'gam-muted' }, t('browse.open') + ': ' + entry.rel),
  )
}

// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// 导入：把其他 agent 的记忆与会话收编进来（这是本插件的核心价值）
// ---------------------------------------------------------------------------

function ImportView(props: { t: Translate }): ReactNode {
  const t = props.t
  const [sources, setSources] = useState<ImportSourceStatus[]>([])
  const [scan, setScan] = useState<ScanReportView | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [report, setReport] = useState<ApplyReportView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api
      .importSources()
      .then((result) => setSources(result.sources))
      .catch((cause: Error) => setError(cause.message))
  }, [])

  const pick = (source: ImportSourceStatus) => {
    setBusy(true)
    setReport(null)
    setError(null)
    setScan(null)
    api
      .importScan({ source: source.id, limit: 200 })
      .then((result) => {
        setScan(result)
        // 默认只勾「新增」且不含 PII 的条目：合并/已有/PII 让用户显式选择
        setSelected(new Set(result.items.filter((item) => !item.duplicateOf && !item.pii).map((item) => item.key)))
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setBusy(false))
  }

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const apply = () => {
    if (!scan || selected.size === 0) return
    setBusy(true)
    api
      .importApply({ scanId: scan.scanId, keys: [...selected] })
      .then((result) => {
        setReport(result)
        setScan(null)
        setSelected(new Set())
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setBusy(false))
  }

  const memorySources = sources.filter((source) => source.kind === 'memory')
  const conversationSources = sources.filter((source) => source.kind === 'conversation')

  return h(
    'div',
    null,
    h('p', { className: 'gam-muted' }, t('import.hint')),
    error ? h('div', { className: 'gam-error' }, error) : null,
    scan ? null : h(
      'div',
      null,
      section(t('import.memory'), memorySources, pick, busy),
      section(t('import.conversation'), conversationSources, pick, busy),
    ),
    report
      ? h(
          'div',
          { className: 'gam-detail' },
          h('div', { className: 'gam-item-title' }, t('import.done')),
          h(
            'div',
            { className: 'gam-tags' },
            chip(`${t('import.added')} ${report.added}`),
            chip(`${t('import.updated')} ${report.updated}`),
            chip(`${t('import.noop')} ${report.noop}`),
            chip(`${t('import.rejected')} ${report.rejected}`),
          ),
          h('p', { className: 'gam-muted' }, `${t('import.snapshot')}: ${report.snapshot}`),
        )
      : null,
    scan
      ? h(
          'div',
          { className: 'gam-detail' },
          h('div', { className: 'gam-item-title' }, `${scan.label} · ${scan.items.length}`),
          h(
            'div',
            { className: 'gam-tags' },
            chip(`${t('import.new')} ${scan.estimate.added}`),
            chip(`${t('import.merge')} ${scan.estimate.merged}`),
            chip(`${t('import.duplicate')} ${scan.estimate.duplicate}`),
            scan.estimate.pii > 0 ? chip(`PII ${scan.estimate.pii}`) : null,
            scan.budget?.overBudget ? h('span', { className: 'gam-tag' }, t('import.budgetWarn')) : null,
          ),
          scan.skipped.length > 0
            ? h('p', { className: 'gam-muted' }, `${t('import.skipped')}: ${scan.skipped.length}`)
            : null,
          h(
            'div',
            { className: 'gam-actions' },
            h('button', { className: 'gam-btn', type: 'button', onClick: () => setSelected(new Set(scan.items.map((i) => i.key))) }, t('import.selectAll')),
            h('button', { className: 'gam-btn', type: 'button', onClick: () => setSelected(new Set()) }, t('import.selectNone')),
            h('button', { className: 'gam-btn', type: 'button', onClick: () => setScan(null) }, t('import.cancel')),
            h(
              'button',
              { className: 'gam-btn', type: 'button', disabled: busy || selected.size === 0, onClick: apply },
              `${t('import.apply')} ${selected.size}`,
            ),
          ),
          h(
            'div',
            { className: 'gam-list', style: { marginTop: '10px' } },
            scan.items.slice(0, 300).map((item) =>
              h(
                'label',
                { className: 'gam-item', key: item.key, style: { cursor: 'pointer' } },
                h('input', {
                  type: 'checkbox',
                  checked: selected.has(item.key),
                  onChange: () => toggle(item.key),
                  style: { marginRight: '8px' },
                }),
                h('span', { className: 'gam-item-title' }, item.title),
                h('div', { className: 'gam-item-sum' }, item.summary),
                h(
                  'div',
                  { className: 'gam-tags' },
                  chip(t(`kind.${item.kind}`)),
                  chip(item.activation),
                  item.duplicateOf ? chip(t('import.duplicate')) : null,
                  item.pii ? chip('PII') : null,
                  h('span', { className: 'gam-tag' }, item.origin),
                ),
              ),
            ),
          ),
        )
      : null,
  )
}

function section(title: string, sources: ImportSourceStatus[], pick: (source: ImportSourceStatus) => void, busy: boolean): ReactNode {
  if (sources.length === 0) return null
  return h(
    'section',
    { style: { marginTop: '14px' } },
    h('h3', { style: { fontSize: '12px', margin: '0 0 8px', opacity: 0.7 } }, title),
    h(
      'div',
      { className: 'gam-grid' },
      sources.map((source) =>
        h(
          'button',
          {
            className: 'gam-card',
            key: source.id,
            type: 'button',
            disabled: busy,
            onClick: () => pick(source),
            style: { textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit', background: 'transparent' },
          },
          h('h3', null, source.label),
          h(
            'div',
            { className: 'gam-muted' },
            source.detected.length > 0 ? `${source.detected.length} 处 · ${source.detected[0]}` : '未检测到',
          ),
        ),
      ),
    ),
  )
}

function chip(text: string): ReactNode {
  return h('span', { className: 'gam-tag' }, text)
}


// ---------------------------------------------------------------------------
// 时间线：按「当时有效」看记忆（bi-temporal 的兑现）
// ---------------------------------------------------------------------------

function TimelineView(props: { t: Translate }): ReactNode {
  const t = props.t
  const [asOf, setAsOf] = useState(() => new Date().toISOString().slice(0, 10))
  const [items, setItems] = useState<EntrySummary[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .entries({ limit: 500 })
      .then((page) => setItems(page.items))
      .catch((cause: Error) => setError(cause.message))
  }, [])

  if (error) return h('div', { className: 'gam-error' }, error)

  // 时点有效性：validFrom <= asOf < invalidatedAt（无 invalidatedAt 视为一直有效）
  const valid = items
    .filter((item) => item.createdAt.slice(0, 10) <= asOf && (!item.invalidatedAt || item.invalidatedAt > asOf))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  const byDay = new Map<string, EntrySummary[]>()
  for (const item of valid) {
    const day = item.createdAt.slice(0, 10)
    const list = byDay.get(day) ?? []
    list.push(item)
    byDay.set(day, list)
  }

  return h(
    'div',
    null,
    h(
      'div',
      { className: 'gam-toolbar' },
      h('label', { className: 'gam-muted' }, t('timeline.asOf')),
      h('input', {
        className: 'gam-input',
        type: 'date',
        value: asOf,
        'aria-label': t('timeline.asOf'),
        onChange: (event: { target: { value: string } }) => setAsOf(event.target.value),
      }),
      h('span', { className: 'gam-muted' }, `${valid.length} / ${items.length}`),
    ),
    h('p', { className: 'gam-muted' }, t('timeline.hint')),
    byDay.size === 0
      ? h('div', { className: 'gam-empty' }, t('browse.noResults'))
      : [...byDay.entries()].map(([day, list]) =>
          h(
            'section',
            { key: day, style: { marginBottom: '14px' } },
            h('h3', { style: { fontSize: '12px', margin: '0 0 6px', opacity: 0.7 } }, day),
            h(
              'div',
              { className: 'gam-list' },
              list.map((item) =>
                h(
                  'div',
                  { className: 'gam-item', key: item.id },
                  h('span', { className: 'gam-item-title' }, item.title),
                  h('div', { className: 'gam-item-sum' }, item.summary),
                  h('div', { className: 'gam-tags' }, chip(t(`kind.${item.kind}`)), chip(item.confidence), item.invalidatedAt ? chip(`invalidated ${item.invalidatedAt}`) : null),
                ),
              ),
            ),
          ),
        ),
  )
}

// ---------------------------------------------------------------------------
// 族谱：关系邻接表 + Mermaid（不引图库，先给可读可复制的形式）
// ---------------------------------------------------------------------------

function GraphView(props: { t: Translate }): ReactNode {
  const t = props.t
  const [entity, setEntity] = useState('')
  const [nodes, setNodes] = useState<string[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [mermaid, setMermaid] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = (value: string) => {
    api
      .graph(value || undefined)
      .then((result) => {
        setNodes(result.nodes)
        setEdges(result.edges)
        setMermaid(result.mermaid)
      })
      .catch((cause: Error) => setError(cause.message))
  }

  useEffect(() => load(''), [])

  return h(
    'div',
    null,
    h(
      'div',
      { className: 'gam-toolbar' },
      h('input', {
        className: 'gam-input',
        value: entity,
        placeholder: t('graph.entity'),
        'aria-label': t('graph.entity'),
        onChange: (event: { target: { value: string } }) => setEntity(event.target.value),
      }),
      h('button', { className: 'gam-btn', type: 'button', onClick: () => load(entity) }, t('panel.retry')),
      h('span', { className: 'gam-muted' }, `${nodes.length} nodes · ${edges.length} edges`),
    ),
    error ? h('div', { className: 'gam-error' }, error) : null,
    edges.length === 0
      ? h('div', { className: 'gam-empty' }, t('graph.empty'))
      : h(
          'div',
          { className: 'gam-list' },
          edges.map((edge) =>
            h(
              'div',
              { className: 'gam-item', key: edge.id },
              h('span', { className: 'gam-item-title' }, `${edge.from} → ${edge.to}`),
              h('div', { className: 'gam-item-sum' }, `${edge.rel} · ${edge.summary}`),
              h('div', { className: 'gam-tags' }, chip(edge.confidence), chip(edge.id)),
            ),
          ),
        ),
    mermaid ? h('pre', { className: 'gam-pre', 'aria-label': 'mermaid' }, mermaid) : null,
  )
}

// ---------------------------------------------------------------------------
// 审计：全量读写流水（含被门控/被拦截的写）
// ---------------------------------------------------------------------------

const AUDIT_ACTS = ['read', 'write', 'update', 'invalidate', 'delete', 'import', 'export', 'consolidate', 'repair', 'gate-drop', 'deny', 'restore']

function AuditView(props: { t: Translate }): ReactNode {
  const t = props.t
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [act, setAct] = useState('')
  const [rows, setRows] = useState<AuditRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = (day: string) => {
    api
      .audit(day, 500)
      .then((result) => setRows(result.items))
      .catch((cause: Error) => setError(cause.message))
  }

  useEffect(() => load(date), [date])

  const shown = rows.filter((row) => (act ? row.act === act : true))
  return h(
    'div',
    null,
    h(
      'div',
      { className: 'gam-toolbar' },
      h('input', {
        className: 'gam-input',
        type: 'date',
        value: date,
        'aria-label': 'date',
        onChange: (event: { target: { value: string } }) => setDate(event.target.value),
      }),
      h(
        'select',
        {
          className: 'gam-select',
          value: act,
          'aria-label': 'act',
          onChange: (event: { target: { value: string } }) => setAct(event.target.value),
        },
        h('option', { value: '' }, t('audit.allActs')),
        ...AUDIT_ACTS.map((value) => h('option', { value, key: value }, value)),
      ),
      h('span', { className: 'gam-muted' }, `${shown.length} / ${rows.length}`),
    ),
    error ? h('div', { className: 'gam-error' }, error) : null,
    shown.length === 0
      ? h('div', { className: 'gam-empty' }, t('audit.empty'))
      : h(
          'div',
          { className: 'gam-list' },
          shown.map((row, index) =>
            h(
              'div',
              { className: 'gam-item', key: `${row.ts ?? index}-${index}` },
              h('span', { className: 'gam-item-title' }, `${row.act ?? '?'} · ${row.actor ?? '?'}`),
              h('div', { className: 'gam-item-sum' }, [row.decision, row.reason, row.kind, row.id].filter(Boolean).join(' · ')),
              h('div', { className: 'gam-tags' }, chip(row.ts ?? ''), row.target ? chip(String(row.target)) : null),
            ),
          ),
        ),
  )
}

// ---------------------------------------------------------------------------
// 恢复：快照 / diff / 回滚 / 固化 / 体检
// ---------------------------------------------------------------------------

function RecoveryView(props: { t: Translate }): ReactNode {
  const t = props.t
  const [snapshots, setSnapshots] = useState<SnapshotInfo[]>([])
  const [diff, setDiff] = useState<{ added: string[]; removed: string[]; changed: string[] } | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    api
      .snapshots()
      .then((result) => {
        setSnapshots(result.items)
        if (result.items.length >= 2) {
          void api.snapshotDiff(result.items[1]!.label, result.items[0]!.label).then(setDiff).catch(() => setDiff(null))
        }
      })
      .catch((cause: Error) => setError(cause.message))
  }

  useEffect(load, [])

  const run = (label: string, task: () => Promise<string>) => {
    setBusy(true)
    setMessage(null)
    task()
      .then((text) => {
        setMessage(text)
        load()
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setBusy(false))
  }

  return h(
    'div',
    null,
    h(
      'div',
      { className: 'gam-actions' },
      h('button', { className: 'gam-btn', type: 'button', disabled: busy, onClick: () => void api.doctor(true).then(() => setMessage('doctor done')).catch((e: Error) => setError(e.message)) }, 'doctor'),
      h(
        'button',
        {
          className: 'gam-btn',
          type: 'button',
          disabled: busy,
          onClick: () =>
            run('consolidate', async () => {
              const result = await api.consolidate()
              return `merged ${result.merged} · promoted ${result.promoted} · demoted ${result.demoted} · expired ${result.expiredEpisodes} · summaries ${result.summariesRewritten} · ${result.durationMs}ms`
            }),
        },
        t('recovery.consolidate'),
      ),
      h(
        'button',
        {
          className: 'gam-btn',
          type: 'button',
          disabled: busy,
          onClick: () =>
            run('snapshot', async () => {
              const result = await api.exportZip()
              return `${t('recovery.exported')}: ${result.path} (${result.files} files, ${result.bytes} B)`
            }),
        },
        t('recovery.export'),
      ),
    ),
    error ? h('div', { className: 'gam-error' }, error) : null,
    message ? h('p', { className: 'gam-muted' }, message) : null,
    diff
      ? h(
          'div',
          { className: 'gam-detail' },
          h('div', { className: 'gam-item-title' }, t('recovery.diff')),
          h('div', { className: 'gam-tags' }, chip(`+${diff.added.length}`), chip(`-${diff.removed.length}`), chip(`~${diff.changed.length}`)),
          diff.changed.length > 0 ? h('pre', { className: 'gam-pre' }, diff.changed.slice(0, 20).join('\n')) : null,
        )
      : null,
    h('h3', { style: { fontSize: '12px', margin: '14px 0 8px', opacity: 0.7 } }, t('recovery.snapshots')),
    snapshots.length === 0
      ? h('div', { className: 'gam-empty' }, t('recovery.noSnapshots'))
      : h(
          'div',
          { className: 'gam-list' },
          snapshots.map((snapshot) =>
            h(
              'div',
              { className: 'gam-item', key: snapshot.label },
              h('span', { className: 'gam-item-title' }, snapshot.label),
              h('div', { className: 'gam-item-sum' }, `${snapshot.createdAt} · ${snapshot.files} files · ${snapshot.bytes} B`),
              h(
                'div',
                { className: 'gam-actions' },
                h(
                  'button',
                  {
                    className: 'gam-btn',
                    type: 'button',
                    disabled: busy,
                    onClick: () => run('restore', async () => {
                      const result = await api.restore(snapshot.label)
                      return `${t('recovery.restored')} ${result.restored} · pre-snapshot ${result.preSnapshot}`
                    }),
                  },
                  t('recovery.restore'),
                ),
              ),
            ),
          ),
        ),
  )
}

// ---------------------------------------------------------------------------
// 设置：只读摘要 + 指向官方设置页
// ---------------------------------------------------------------------------

function SettingsView(props: { t: Translate }): ReactNode {
  const t = props.t
  const [config, setConfig] = useState<Record<string, unknown> | null>(null)
  const [targets, setTargets] = useState<ProjectionView[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.config().then(setConfig).catch((cause: Error) => setError(cause.message))
    api.projections().then((result) => setTargets(result.targets)).catch(() => {})
  }, [])

  return h(
    'div',
    null,
    h('p', { className: 'gam-muted' }, t('settings.hint')),
    error ? h('div', { className: 'gam-error' }, error) : null,
    message ? h('p', { className: 'gam-muted' }, message) : null,
    h('pre', { className: 'gam-pre' }, config ? JSON.stringify(config, null, 2) : '…'),
    h('h3', { style: { fontSize: '12px', margin: '14px 0 8px', opacity: 0.7 } }, t('settings.projections')),
    h('p', { className: 'gam-muted' }, t('settings.projectionHint')),
    h(
      'div',
      { className: 'gam-list' },
      targets.map((target) =>
        h(
          'div',
          { className: 'gam-item', key: target.id },
          h('span', { className: 'gam-item-title' }, target.label),
          h('div', { className: 'gam-item-sum' }, target.path),
          h('div', { className: 'gam-tags' }, chip(target.enabled ? 'enabled' : 'off')),
        ),
      ),
    ),
    h(
      'div',
      { className: 'gam-actions' },
      h(
        'button',
        {
          className: 'gam-btn',
          type: 'button',
          onClick: () =>
            api
              .applyProjections(targets.filter((target) => target.enabled).map((target) => target.id))
              .then((result) => setMessage(`${t('settings.applied')} ${result.results.filter((r) => r.changed).length}/${result.results.length}`))
              .catch((cause: Error) => setError(cause.message)),
        },
        t('settings.applyEnabled'),
      ),
    ),
  )
}


/**
 * 写入确认卡（slot: conversation.input.dock）。
 *
 * 这是建立用户信任的最重要组件：`writeMode: suggest` 时，涉及画像/纪律的写入
 * 必须先被用户看见并批准。**15 秒无操作即静默放弃** —— 绝不因为用户没点就偷偷写。
 */
export function WriteConfirmCard(props: { t: Translate }): ReactNode {
  ensureStyles()
  const t = props.t
  const [items, setItems] = useState<PendingView[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const load = () => {
      if (document.hidden) return
      api
        .pending()
        .then((result) => setItems(result.items))
        .catch(() => {})
    }
    load()
    const timer = setInterval(load, 2000)
    return () => clearInterval(timer)
  }, [])

  const item = items[0]
  if (!item) return null

  const decide = (action: 'accept' | 'reject') => {
    setBusy(true)
    api
      .decidePending(item.id, action)
      .then(() => setItems((prev) => prev.filter((entry) => entry.id !== item.id)))
      .catch(() => {})
      .finally(() => setBusy(false))
  }

  const seconds = Math.max(0, Math.round((item.expiresAt - Date.now()) / 1000))
  return h(
    'div',
    { className: 'gam-confirm', role: 'group', 'aria-label': t('confirm.prompt') },
    h(
      'div',
      { className: 'gam-confirm-head' },
      h('span', { className: 'gam-confirm-title' }, t('confirm.prompt')),
      chip(t(`kind.${item.candidate.kind}`)),
      chip(item.candidate.source),
      items.length > 1 ? chip(`+${items.length - 1}`) : null,
      h('span', { className: 'gam-muted' }, t('confirm.autoDismiss').replace('{n}', String(seconds))),
    ),
    h('div', { className: 'gam-confirm-body' }, item.candidate.title),
    h('div', { className: 'gam-item-sum' }, item.candidate.summary),
    h(
      'div',
      { className: 'gam-confirm-actions' },
      h('button', { className: 'gam-btn', type: 'button', disabled: busy, onClick: () => decide('reject') }, t('confirm.reject')),
      h('button', { className: 'gam-btn', type: 'button', disabled: busy, onClick: () => decide('accept') }, t('confirm.accept')),
    ),
  )
}

class Boundary extends Component<{ label: string; children?: ReactNode }, { error: Error | null }> {
  override state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error }
  }

  override render(): ReactNode {
    if (this.state.error) {
      return h(
        'div',
        { className: 'gam-error' },
        h('div', null, 'This view failed to render.'),
        h('pre', { className: 'gam-pre' }, `${this.props.label}: ${this.state.error.message}`),
        h(
          'div',
          { className: 'gam-actions' },
          h('button', { className: 'gam-btn', type: 'button', onClick: () => this.setState({ error: null }) }, 'Retry'),
        ),
      )
    }
    return this.props.children
  }
}
