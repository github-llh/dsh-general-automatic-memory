import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  api,
  type ApplyReportView,
  type AuditRow,
  type CatalogView,
  type DoctorReport,
  type EntryDetail,
  type EntrySummary,
  type ImportSourceStatus,
  type PendingView,
  type ProjectionView,
  type ScanReportView,
  type SnapshotInfo,
  type Stats,
} from './api.js'
import { ensureStyles } from './styles.js'
import { GraphView } from './graph.js'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  CopyButton,
  Dialog,
  EmptyState,
  ErrorState,
  IconAlert,
  IconArrowRight,
  IconAudit,
  IconBook,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconClose,
  IconCommand,
  IconDashboard,
  IconDownload,
  IconEdit,
  IconFile,
  IconFolder,
  IconGraph,
  IconImport,
  IconInfo,
  IconMemory,
  IconMinus,
  IconPlus,
  IconRecovery,
  IconRefresh,
  IconSave,
  IconSearch,
  IconSettings,
  IconShield,
  IconSparkle,
  IconTrash,
  IconUndo,
  IconUpload,
  KindBadge,
  Kbd,
  Markdown,
  Meter,
  PageHeader,
  SearchInput,
  Segmented,
  SelectField,
  SkeletonList,
  Spinner,
  cx,
  formatBytes,
  formatDate,
  formatDateTime,
  formatMonthDay,
  formatNumber,
  formatRelative,
  formatTime,
  interpolate,
  kindLabel,
  localDay,
  shortId,
  shiftDay,
  shortcutLabel,
  todayISO,
  useDebounced,
  useTicker,
  type Tone,
  type Translate,
} from './ui.js'

export type { Translate } from './ui.js'

/** 侧栏图标（slot: sidebar.panellist，owner props 为 { size, active }） */
export function MemoryPanelIcon(props: { size?: number; active?: boolean }): ReactNode {
  const size = props.size ?? 20
  return (
    <span className="gam-icon" style={{ display: 'grid', placeItems: 'center', opacity: props.active ? 1 : 0.78 }}>
      <IconMemory size={size} />
    </span>
  )
}

type ViewId = 'overview' | 'browse' | 'import' | 'timeline' | 'graph' | 'audit' | 'recovery' | 'settings'

interface NavItem {
  id: ViewId
  labelKey: string
  icon: (props: { size?: number }) => ReactNode
}

const NAV_GROUPS: Array<{ labelKey: string; items: NavItem[] }> = [
  {
    labelKey: 'nav.groupMemory',
    items: [
      { id: 'overview', labelKey: 'nav.overview', icon: IconDashboard },
      { id: 'browse', labelKey: 'nav.browse', icon: IconBook },
      { id: 'import', labelKey: 'nav.import', icon: IconImport },
      { id: 'timeline', labelKey: 'nav.timeline', icon: IconClock },
    ],
  },
  {
    labelKey: 'nav.groupSystem',
    items: [
      { id: 'graph', labelKey: 'nav.graph', icon: IconGraph },
      { id: 'audit', labelKey: 'nav.audit', icon: IconAudit },
      { id: 'recovery', labelKey: 'nav.recovery', icon: IconRecovery },
      { id: 'settings', labelKey: 'nav.settings', icon: IconSettings },
    ],
  },
]

const KINDS = ['persona', 'preference', 'feedback', 'relations', 'project', 'reference', 'procedure', 'episode']
const AUDIT_ACTS = ['read', 'write', 'update', 'invalidate', 'delete', 'import', 'export', 'consolidate', 'repair', 'gate-drop', 'deny', 'restore']

interface ToastItem {
  id: number
  message: string
  tone: Tone
}

interface CommonProps {
  t: Translate
  version: number
  onOpen: (id: string) => void
  onNavigate: (view: ViewId) => void
  onChanged: () => void
  toast: (message: string, tone?: Tone) => void
}

// ---------------------------------------------------------------------------
// 根面板
// ---------------------------------------------------------------------------

export function MemoryPanel(props: { t: Translate }): ReactNode {
  ensureStyles()
  const t = props.t
  const [view, setView] = useState<ViewId>('overview')
  const [openId, setOpenId] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [version, setVersion] = useState(0)
  const [browseKind, setBrowseKind] = useState('')
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [hosted, setHosted] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const toastSeq = useRef(0)

  const toast = useCallback((message: string, tone: Tone = 'neutral') => {
    const id = ++toastSeq.current
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }])
    window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3400)
  }, [])

  const changed = useCallback(() => setVersion((value) => value + 1), [])
  const navigate = useCallback((next: ViewId) => setView(next), [])

  const openEntry = useCallback((id: string) => setOpenId(id), [])

  const goBrowseKind = useCallback((kind: string) => {
    setBrowseKind(kind)
    setView('browse')
  }, [])

  // 宿主主题 token 存在时，原生控件（日期/下拉）应跟随宿主主题而不是系统偏好。
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const probe = getComputedStyle(root).getPropertyValue('--dsw-alias-bg-base').trim()
    setHosted(probe.length > 0)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target ? /^(input|textarea|select)$/i.test(target.tagName) || target.isContentEditable : false
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
        return
      }
      if (!mod && event.key === '/' && !typing && !event.altKey) {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const common: CommonProps = {
    t,
    version,
    onOpen: openEntry,
    onNavigate: navigate,
    onChanged: changed,
    toast,
  }

  return (
    <div ref={rootRef} className={cx('gam-root', hosted && 'gam-hosted')}>
      <header className="gam-header">
        <div className="gam-brand">
          <span className="gam-brandmark">
            <IconMemory size={21} />
          </span>
          <div className="gam-brandtext">
            <div className="gam-brandtitle">{t('panel.title')}</div>
            <div className="gam-brandsub">{t('panel.tagline')}</div>
          </div>
        </div>
        <div className="gam-header-actions">
          <span className="gam-live">
            <i />
            {t('panel.autoRefresh')}
          </span>
          <button type="button" className="gam-command-trigger" onClick={() => setPaletteOpen(true)}>
            <IconSearch size={14} />
            <span>{t('command.trigger')}</span>
            <Kbd>{shortcutLabel()}</Kbd>
          </button>
          <IconButtonRefresh t={t} onClick={() => { changed(); toast(t('common.refreshed'), 'success') }} />
        </div>
      </header>

      <div className="gam-shell">
        <aside className="gam-rail" aria-label={t('panel.title')}>
          {NAV_GROUPS.map((group) => (
            <div className="gam-railgroup" key={group.labelKey}>
              <div className="gam-rail-label">{t(group.labelKey)}</div>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cx('gam-navitem', view === item.id && 'is-active')}
                    aria-current={view === item.id ? 'page' : undefined}
                    onClick={() => setView(item.id)}
                  >
                    <span className="gam-navicon">
                      <Icon size={15} />
                    </span>
                    <span className="gam-navtext">{t(item.labelKey)}</span>
                  </button>
                )
              })}
            </div>
          ))}
          <div className="gam-railfoot">
            {t('panel.shortcutHint')} <Kbd>{shortcutLabel()}</Kbd>
          </div>
        </aside>

        <main className="gam-content">
          <div className="gam-content-inner">
            <Boundary key={view} label={view} t={t}>
              {view === 'overview' ? (
                <Overview {...common} onBrowseKind={goBrowseKind} />
              ) : view === 'browse' ? (
                <Browse {...common} kind={browseKind} onKindChange={setBrowseKind} />
              ) : view === 'import' ? (
                <ImportView {...common} />
              ) : view === 'timeline' ? (
                <TimelineView {...common} />
              ) : view === 'graph' ? (
                <GraphView {...common} />
              ) : view === 'audit' ? (
                <AuditView {...common} />
              ) : view === 'recovery' ? (
                <RecoveryView {...common} />
              ) : (
                <SettingsView {...common} />
              )}
            </Boundary>
          </div>
        </main>
      </div>

      {openId ? (
        <EntryDrawer
          id={openId}
          t={t}
          onClose={() => setOpenId(null)}
          onOpen={openEntry}
          onChanged={changed}
          toast={toast}
        />
      ) : null}

      <CommandPalette
        open={paletteOpen}
        t={t}
        onClose={() => setPaletteOpen(false)}
        onNavigate={navigate}
        onOpen={openEntry}
        onChanged={changed}
        toast={toast}
      />

      <div className="gam-toasts" aria-live="polite">
        {toasts.map((item) => (
          <div className="gam-toast" key={item.id} data-tone={item.tone}>
            {item.tone === 'success' ? <IconCheck size={14} /> : item.tone === 'danger' ? <IconAlert size={14} /> : <IconInfo size={14} />}
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function IconButtonRefresh(props: { t: Translate; onClick: () => void }): ReactNode {
  return (
    <button type="button" className="gam-iconbtn" title={props.t('common.refresh')} aria-label={props.t('common.refresh')} onClick={props.onClick}>
      <IconRefresh size={16} />
    </button>
  )
}

// ---------------------------------------------------------------------------
// 总览
// ---------------------------------------------------------------------------

function Overview(props: CommonProps & { onBrowseKind: (kind: string) => void }): ReactNode {
  const t = props.t
  const [stats, setStats] = useState<Stats | null>(null)
  const [pending, setPending] = useState<PendingView[]>([])
  const [recent, setRecent] = useState<AuditRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fixing, setFixing] = useState(false)
  const [catalog, setCatalog] = useState<CatalogView | null>(null)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [undo, setUndo] = useState<AuditRow | null>(null)
  const [undoing, setUndoing] = useState(false)
  const [deciding, setDeciding] = useState<string | null>(null)

  const load = useCallback(() => {
    api.stats().then((value) => { setStats(value); setError(null) }).catch((cause: Error) => setError(cause.message))
    api.pending().then((value) => setPending(value.items)).catch(() => {})
    api.audit(todayISO(), 30).then((value) => setRecent(value.items)).catch(() => {})
  }, [])

  useEffect(() => {
    load()
    const timer = window.setInterval(() => {
      if (!document.hidden) load()
    }, 5000)
    return () => window.clearInterval(timer)
  }, [load, props.version])

  useEffect(() => {
    if (!catalogOpen) return
    let alive = true
    setCatalog(null)
    api.catalog().then((value) => { if (alive) setCatalog(value) }).catch((cause: Error) => props.toast(cause.message, 'danger'))
    return () => { alive = false }
  }, [catalogOpen, props.toast])

  const runDoctor = () => {
    setFixing(true)
    api.doctor(true)
      .then((report) => {
        props.toast(interpolate(t('overview.doctorDone'), { n: report.rebuilt.length }), 'success')
        props.onChanged()
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setFixing(false))
  }

  const decide = (item: PendingView, action: 'accept' | 'reject') => {
    setDeciding(item.id)
    api.decidePending(item.id, action)
      .then(() => {
        setPending((prev) => prev.filter((entry) => entry.id !== item.id))
        props.toast(action === 'accept' ? t('overview.pendingAccepted') : t('overview.pendingRejected'), 'success')
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setDeciding(null))
  }

  const doUndo = () => {
    if (!undo?.id) return
    setUndoing(true)
    api.invalidate(undo.id, 'undo from overview')
      .then(() => {
        props.toast(t('overview.undone'), 'success')
        setUndo(null)
        props.onChanged()
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setUndoing(false))
  }

  if (error && !stats) {
    return (
      <div className="gam-page">
        <PageHeader eyebrow={t('nav.groupMemory')} title={t('nav.overview')} description={t('overview.desc')} />
        <ErrorState title={t('panel.hostUnavailable')} message={error} retryLabel={t('panel.retry')} onRetry={load} />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="gam-page">
        <PageHeader eyebrow={t('nav.groupMemory')} title={t('nav.overview')} description={t('overview.desc')} />
        <div className="gam-statgrid">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="gam-card gam-stat" key={index}>
              <div className="gam-skeleton gam-skeletonline" style={{ width: '46%', height: 9 }} />
              <div className="gam-skeleton gam-skeletonline" style={{ width: '38%', height: 28, marginTop: 12 }} />
              <div className="gam-skeleton gam-skeletonline" style={{ width: '72%', height: 9, marginTop: 'auto' }} />
            </div>
          ))}
        </div>
        <SkeletonList rows={3} />
      </div>
    )
  }

  const inject = stats.recall.inject
  const tool = stats.recall.tool
  const share = stats.recall.lastShare
  const shareMeasured = stats.recall.lastShareAt !== null
  const cap = stats.recall.maxShare || 0.03
  const shareRatio = cap > 0 ? share / cap : 0
  const verbatimRate = inject.events > 0 ? inject.verbatim / inject.events : null
  const zeroHitRate = tool.events > 0 ? tool.zeroHit / tool.events : null
  // 文件解析问题由 buildAlerts 转成 entry-invalid 告警；这里只按 issues 计一次，
  // 不能把「issues + 同源 alerts」相加，否则同一个问题会被算两遍。
  const errors = stats.issues.length + stats.alerts.filter((alert) => alert.level === 'error' && alert.code !== 'entry-invalid').length
  const warns = stats.alerts.filter((alert) => alert.level === 'warn').length
  const healthTone: Tone = errors > 0 ? 'danger' : warns > 0 ? 'warn' : 'success'
  const kindEntries = Object.entries(stats.byKind).sort((a, b) => b[1] - a[1])
  const visibleAlerts = stats.alerts.filter((alert) => alert.code !== 'entry-invalid')
  const writes = recent
    .filter((row) => row.act === 'write' || row.act === 'update' || row.act === 'invalidate' || row.act === 'import' || row.act === 'restore')
    .slice(0, 7)
  const attentionCount = errors + warns + pending.length
  const cacheTone: Tone = verbatimRate === null ? 'accent' : verbatimRate < 0.5 ? 'danger' : 'success'
  const recallTone: Tone = zeroHitRate === null ? 'accent' : zeroHitRate > 0.5 ? 'warn' : 'success'

  return (
    <div className="gam-page">
      <PageHeader
        eyebrow={t('nav.groupMemory')}
        title={t('nav.overview')}
        description={t('overview.desc')}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={<IconImport size={14} />} onClick={() => props.onNavigate('import')}>
              {t('nav.import')}
            </Button>
            <Button size="sm" icon={fixing ? <Spinner /> : <IconShield size={14} />} onClick={runDoctor} disabled={fixing}>
              {t('recovery.doctor')}
            </Button>
          </>
        }
      />

      <div className="gam-health" data-tone={healthTone}>
        <span className="gam-health-icon">
          {healthTone === 'success' ? <IconCheck size={15} /> : <IconAlert size={15} />}
        </span>
        <div className="gam-health-text">
          <div className="gam-health-title">
            {healthTone === 'success'
              ? t('overview.allClear')
              : errors > 0
                ? interpolate(t('overview.errorsFound'), { n: errors })
                : interpolate(t('overview.warningsFound'), { n: warns })}
          </div>
          <div className="gam-health-desc">
            {healthTone === 'success'
              ? t('overview.allClearDesc')
              : `${errors} ${t('overview.errors')} · ${warns} ${t('overview.warnings')} · ${pending.length} ${t('overview.pending')}`}
          </div>
        </div>
        <div className="gam-health-actions">
          {healthTone !== 'success' ? (
            <>
              <Button size="sm" onClick={runDoctor} disabled={fixing}>
                {t('overview.fixNow')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => props.onNavigate('recovery')}>
                {t('nav.recovery')}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="gam-statgrid">
        <StatCard
          label={t('overview.budget')}
          value={shareMeasured ? (share * 100).toFixed(2) : '—'}
          unit={shareMeasured ? '%' : undefined}
          action={<IconInfo size={14} className="gam-faint" />}
          aside={
            <Button size="sm" variant="ghost" onClick={() => setCatalogOpen(true)}>
              {t('overview.viewInjection')}
            </Button>
          }
          footer={
            <>
              <div className="gam-stat-row"><span>{t('overview.budgetShare')}</span><b>{(cap * 100).toFixed(1)}%</b></div>
              <div className="gam-stat-row">
                <span>{t('overview.measuredAt')}</span>
                <b title={shareMeasured ? formatDateTime(stats.recall.lastShareAt) : undefined}>
                  {shareMeasured ? formatRelative(stats.recall.lastShareAt) : t('overview.notMeasured')}
                </b>
              </div>
              <div className="gam-stat-row"><span>INDEX</span><b>{stats.index.lines}/{stats.index.maxLines} lines</b></div>
              <div className="gam-stat-row"><span>{t('overview.bytes')}</span><b>{formatBytes(stats.index.bytes)}</b></div>
            </>
          }
        >
          <Meter value={shareMeasured ? shareRatio : 0} tone={shareMeasured && shareRatio > 1 ? 'danger' : 'accent'} />
        </StatCard>

        <StatCard
          label={t('overview.cacheHealth')}
          value={verbatimRate === null ? '—' : (verbatimRate * 100).toFixed(0)}
          unit={verbatimRate === null ? undefined : '%'}
          footer={
            <>
              <div className="gam-stat-row">
                <span>{t('overview.verbatimRate')}</span>
                <b>{verbatimRate === null ? '—' : `${formatNumber(inject.verbatim)}/${formatNumber(inject.events)}`}</b>
              </div>
              <div className="gam-stat-row"><span>{t('overview.prefixBreaks')}</span><b>{formatNumber(inject.prefixBreaks)}</b></div>
              <div className="gam-stat-row"><span>{t('overview.injectChars')}</span><b>{formatNumber(inject.chars)}</b></div>
              <div className="gam-stat-row"><span>{t('overview.injectTokens')}</span><b>{formatNumber(inject.tokens)}</b></div>
            </>
          }
        >
          <Meter value={verbatimRate ?? 0} tone={cacheTone} />
        </StatCard>

        <StatCard
          label={t('overview.entries')}
          value={formatNumber(stats.entryCount)}
          unit={t('overview.itemsUnit')}
          footer={
            <>
              <div className="gam-stat-row"><span>{t('overview.kinds')}</span><b>{kindEntries.length}</b></div>
              <div className="gam-stat-row"><span>{t('overview.issues')}</span><b>{stats.issues.length}</b></div>
              <div className="gam-stat-row"><span>{t('overview.bodyBytes')}</span><b>{formatBytes(stats.bytes)}</b></div>
            </>
          }
        >
          <div className="gam-tagrow" style={{ marginTop: 9 }}>
            {kindEntries.map(([kind, count]) => (
              <span className="gam-tag" key={kind}>{kindLabel(t, kind)} {count}</span>
            ))}
          </div>
        </StatCard>

        <StatCard
          label={t('overview.recall')}
          value={formatNumber(tool.events)}
          unit={t('overview.callsUnit')}
          footer={
            <>
              <div className="gam-stat-row">
                <span>{t('overview.zeroHit')}</span>
                <b>{zeroHitRate === null ? '—' : `${(zeroHitRate * 100).toFixed(0)}%`}</b>
              </div>
              <div className="gam-stat-row"><span>{t('overview.toolHits')}</span><b>{formatNumber(tool.hits)}</b></div>
              <div className="gam-stat-row">
                <span>{t('overview.gated')}</span>
                <b>{tool.events > 0 ? formatNumber(tool.gated) : '—'}</b>
              </div>
              <div className="gam-stat-row">
                <span>{t('overview.autoInject')}</span>
                <b>{interpolate(t('overview.autoInjectValue'), { rounds: formatNumber(inject.events), shown: formatNumber(inject.hits) })}</b>
              </div>
            </>
          }
        >
          <Meter value={zeroHitRate === null ? 0 : 1 - zeroHitRate} tone={recallTone} />
        </StatCard>
      </div>

      <div className="gam-grid2">
        <Card
          title={t('overview.kindDistribution')}
          hint={t('overview.kindDistributionHint')}
          actions={<Button size="sm" variant="ghost" onClick={() => { props.onBrowseKind(''); props.onNavigate('browse') }}>{t('common.viewAll')}</Button>}
        >
          {kindEntries.length === 0 ? (
            <div className="gam-muted">{t('overview.noEntries')}</div>
          ) : (
            <div>
              {kindEntries.map(([kind, count]) => {
                const max = kindEntries[0]?.[1] ?? 1
                return (
                  <button type="button" className="gam-kindrow" key={kind} onClick={() => props.onBrowseKind(kind)}>
                    <span className="gam-kindname">{kindLabel(t, kind)}</span>
                    <span className="gam-kindbar"><i style={{ width: `${Math.max(4, (count / max) * 100)}%` }} /></span>
                    <span className="gam-kindcount">{count}</span>
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        <Card
          title={t('overview.attention')}
          hint={attentionCount === 0 ? t('overview.noAttention') : interpolate(t('overview.attentionCount'), { n: attentionCount })}
          actions={<Button size="sm" variant="ghost" onClick={() => props.onNavigate('recovery')}>{t('nav.recovery')}</Button>}
        >
          {attentionCount === 0 ? (
            <div className="gam-inline" style={{ padding: '8px 0' }}>
              <span className="gam-health-icon" style={{ width: 24, height: 24 }}><IconCheck size={13} /></span>
              <span className="gam-muted">{t('overview.noAttentionDesc')}</span>
            </div>
          ) : (
            <div className="gam-stack">
              {pending.length > 0 ? (
                <div className="gam-section">
                  <div className="gam-inline">
                    <Badge tone="accent" dot>{t('overview.pendingWrites')}</Badge>
                    <span className="gam-faint">{pending.length}</span>
                  </div>
                  <PendingRows items={pending.slice(0, 2)} t={t} busyId={deciding} onDecide={decide} />
                </div>
              ) : null}
              {stats.issues.slice(0, 3).map((issue) => (
                <button type="button" className="gam-rowitem" data-static="true" key={`${issue.rel}:${issue.issue}`} onClick={() => props.onNavigate('recovery')}>
                  <span className="gam-health-icon" style={{ width: 24, height: 24 }}><IconAlert size={13} /></span>
                  <span className="gam-rowitem-main">
                    <span className="gam-rowitem-title">{issue.issue}</span>
                    <span className="gam-rowitem-sum">{issue.rel} · {issue.message}</span>
                  </span>
                  <IconChevronRight size={14} className="gam-faint" />
                </button>
              ))}
              {visibleAlerts.slice(0, 3).map((alert) => (
                <button type="button" className="gam-rowitem" data-static="true" key={alert.code} onClick={() => props.onNavigate('recovery')}>
                  <span className="gam-health-icon" style={{ width: 24, height: 24 }}>
                    {alert.level === 'error' ? <IconAlert size={13} /> : <IconInfo size={13} />}
                  </span>
                  <span className="gam-rowitem-main">
                    <span className="gam-rowitem-title">{alert.code}</span>
                    <span className="gam-rowitem-sum">{alert.message}</span>
                  </span>
                  <IconChevronRight size={14} className="gam-faint" />
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="gam-grid2">
        <Card
          title={t('overview.recent')}
          hint={t('overview.recentHint')}
          actions={<Button size="sm" variant="ghost" onClick={() => props.onNavigate('audit')}>{t('nav.audit')}</Button>}
        >
          {writes.length === 0 ? (
            <div className="gam-muted">{t('overview.noRecent')}</div>
          ) : (
            <div>
              {writes.map((row, index) => {
                const canUndo = Boolean(row.id) && (row.act === 'write' || row.act === 'update') && row.decision !== 'NOOP'
                const summary = [row.kind ? kindLabel(t, String(row.kind)) : null, row.title ?? row.id ?? null, row.decision ?? null]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <div className="gam-rowitem" data-static="true" key={`${row.ts ?? ''}-${index}`}>
                    <div className="gam-rowitem-main">
                      <div className="gam-rowitem-top">
                        <span className="gam-rowitem-title">{summary || row.act || t('common.unknown')}</span>
                      </div>
                      <div className="gam-rowitem-meta">
                        <span>{formatTime(row.ts)}</span>
                        <span className="gam-dotsep">·</span>
                        <span>{row.act ?? '—'}</span>
                        {row.reason ? <><span className="gam-dotsep">·</span><span>{String(row.reason)}</span></> : null}
                      </div>
                    </div>
                    <div className="gam-rowitem-side">
                      {row.id ? (
                        <Button size="sm" variant="ghost" onClick={() => props.onOpen(String(row.id))}>
                          {t('common.open')}
                        </Button>
                      ) : null}
                      {canUndo ? (
                        <Button size="sm" variant="ghost" icon={<IconUndo size={12} />} onClick={() => setUndo(row)}>
                          {t('overview.undo')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card title={t('overview.quickActions')} hint={t('overview.quickActionsHint')}>
          <div className="gam-grid2" style={{ gap: 8 }}>
            <Button icon={<IconImport size={14} />} onClick={() => props.onNavigate('import')}>{t('nav.import')}</Button>
            <Button icon={<IconDownload size={14} />} onClick={() => props.onNavigate('recovery')}>{t('recovery.export')}</Button>
            <Button icon={<IconShield size={14} />} onClick={runDoctor} disabled={fixing}>{t('recovery.doctor')}</Button>
            <Button icon={<IconFile size={14} />} onClick={() => setCatalogOpen(true)}>{t('overview.viewInjection')}</Button>
          </div>
          <div className="gam-divider" style={{ margin: '14px 0 10px' }} />
          <div className="gam-stat-row">
            <span className="gam-muted">{t('overview.memoryRoot')}</span>
            <span className="gam-inline">
              <code className="gam-mono gam-truncate" style={{ maxWidth: 240 }} title={stats.root}>{stats.root}</code>
              <CopyButton text={stats.root} label={t('common.copyPath')} copiedLabel={t('common.copied')} onCopied={(ok) => { if (!ok) props.toast(t('common.copyFailed'), 'danger') }} />
            </span>
          </div>
          <div className="gam-stat-row" style={{ marginTop: 6 }}>
            <span className="gam-muted">{t('overview.ready')}</span>
            <Badge tone={stats.ready ? 'success' : 'warn'} dot>{stats.ready ? t('common.on') : t('common.loading')}</Badge>
          </div>
        </Card>
      </div>

      <CatalogDialog
        open={catalogOpen}
        t={t}
        catalog={catalog}
        onClose={() => setCatalogOpen(false)}
        toast={props.toast}
      />

      <ConfirmDialog
        open={Boolean(undo)}
        title={t('overview.undoTitle')}
        description={t('overview.undoDesc')}
        confirmLabel={t('overview.undo')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        busy={undoing}
        danger
        onConfirm={doUndo}
        onClose={() => setUndo(null)}
      >
        <pre className="gam-pre">{undo?.id ?? ''}</pre>
      </ConfirmDialog>
    </div>
  )
}

function StatCard(props: {
  label: string
  value: string
  unit?: string
  action?: ReactNode
  aside?: ReactNode
  footer?: ReactNode
  children?: ReactNode
}): ReactNode {
  return (
    <div className="gam-card gam-stat">
      <div className="gam-inline">
        <span className="gam-stat-label">{props.label}</span>
        <span className="gam-spacer" />
        {props.aside}
        {props.action}
      </div>
      <div className="gam-stat-value">
        {props.value}
        {props.unit ? <span className="gam-stat-unit">{props.unit}</span> : null}
      </div>
      {props.children}
      <div className="gam-stat-sub">{props.footer}</div>
    </div>
  )
}

function PendingRows(props: {
  items: PendingView[]
  t: Translate
  busyId: string | null
  onDecide: (item: PendingView, action: 'accept' | 'reject') => void
}): ReactNode {
  return (
    <div className="gam-pendinglist">
      {props.items.map((item) => (
        <div className="gam-pendingitem" key={item.id}>
          <div className="gam-pendingitem-top">
            <KindBadge kind={item.candidate.kind} t={props.t} />
            <span className="gam-tag">{item.candidate.source}</span>
          </div>
          <div className="gam-pendingitem-title">{item.candidate.title}</div>
          {item.candidate.summary && item.candidate.summary !== item.candidate.title ? (
            <div className="gam-pendingitem-sum">{item.candidate.summary}</div>
          ) : null}
          {item.decision.reason ? <div className="gam-confirm-reason is-block">{item.decision.reason}</div> : null}
          <div className="gam-confirm-actions" style={{ marginTop: 6 }}>
            <Button size="sm" variant="ghost" disabled={props.busyId === item.id} onClick={() => props.onDecide(item, 'reject')}>
              {props.t('confirm.reject')}
            </Button>
            <Button size="sm" variant="primary" disabled={props.busyId === item.id} onClick={() => props.onDecide(item, 'accept')}>
              {props.t('confirm.accept')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function CatalogDialog(props: { open: boolean; t: Translate; catalog: CatalogView | null; onClose: () => void; toast: (message: string, tone?: Tone) => void }): ReactNode {
  return (
    <Dialog
      open={props.open}
      title={props.t('overview.injectionPreview')}
      description={props.t('overview.injectionPreviewHint')}
      onClose={props.onClose}
      closeLabel={props.t('common.close')}
      size="wide"
      actions={
        <>
          {props.catalog ? <span className="gam-faint">{props.t('overview.shown')} {props.catalog.shown} · {props.t('overview.omitted')} {props.catalog.omitted}</span> : null}
          <span className="gam-spacer" />
          <CopyButton
            variant="secondary"
            text={props.catalog?.text ?? ''}
            label={props.t('common.copy')}
            copiedLabel={props.t('common.copied')}
            onCopied={(ok) => { if (!ok) props.toast(props.t('common.copyFailed'), 'danger') }}
          />
        </>
      }
    >
      {props.catalog ? <pre className="gam-pre" style={{ maxHeight: '52vh' }}>{props.catalog.text || props.t('overview.emptyCatalog')}</pre> : <SkeletonList rows={4} />}
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// 浏览
// ---------------------------------------------------------------------------

function Browse(props: CommonProps & { kind: string; onKindChange: (kind: string) => void }): ReactNode {
  const t = props.t
  const [query, setQuery] = useState('')
  const debounced = useDebounced(query, 220)
  const kind = props.kind
  const setKind = props.onKindChange
  const [scope, setScope] = useState('')
  const [sort, setSort] = useState('heat')
  const [items, setItems] = useState<EntrySummary[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)
  const pageSize = 80

  useEffect(() => {
    api.stats().then((value) => setCounts(value.byKind)).catch(() => {})
  }, [props.version])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    api.entries({ q: debounced || undefined, kind: kind || undefined, scope: scope || undefined, limit: pageSize, offset: 0 })
      .then((page) => {
        if (!alive) return
        setItems(page.items)
        setTotal(page.total)
      })
      .catch((cause: Error) => { if (alive) setError(cause.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [debounced, kind, scope, props.version, reload])

  const loadMore = () => {
    setLoadingMore(true)
    api.entries({ q: debounced || undefined, kind: kind || undefined, scope: scope || undefined, limit: pageSize, offset: items.length })
      .then((page) => {
        setItems((prev) => [...prev, ...page.items])
        setTotal(page.total)
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setLoadingMore(false))
  }

  const sorted = useMemo(() => {
    const copy = [...items]
    if (sort === 'recent') copy.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    else if (sort === 'used') copy.sort((a, b) => String(b.lastUsedAt ?? '').localeCompare(String(a.lastUsedAt ?? '')))
    else if (sort === 'hits') copy.sort((a, b) => b.hits - a.hits)
    else if (sort === 'title') copy.sort((a, b) => a.title.localeCompare(b.title))
    else copy.sort((a, b) => b.heat - a.heat)
    return copy
  }, [items, sort])

  const hasFilters = Boolean(query || kind || scope)
  const resetFilters = () => {
    setQuery('')
    setKind('')
    setScope('')
  }

  return (
    <div className="gam-page">
      <PageHeader
        eyebrow={t('nav.groupMemory')}
        title={t('nav.browse')}
        description={t('browse.desc')}
        actions={
          <>
            <Badge>{total} {t('overview.itemsUnit')}</Badge>
            <Button size="sm" variant="ghost" icon={<IconRefresh size={14} />} onClick={() => setReload((value) => value + 1)}>
              {t('common.refresh')}
            </Button>
          </>
        }
      />

      <div className="gam-toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={t('browse.search')}
          aria-label={t('browse.search')}
          clearLabel={t('common.clear')}
        />
        <SelectField
          value={scope}
          onChange={setScope}
          aria-label={t('browse.scope')}
          options={[
            { value: '', label: t('browse.allScopes') },
            { value: 'global', label: t('browse.scopeGlobal') },
            { value: 'project', label: t('browse.scopeProject') },
          ]}
        />
        <SelectField
          value={sort}
          onChange={setSort}
          aria-label={t('browse.sort')}
          options={[
            { value: 'heat', label: t('browse.sortHeat') },
            { value: 'recent', label: t('browse.sortRecent') },
            { value: 'used', label: t('browse.sortUsed') },
            { value: 'hits', label: t('browse.sortHits') },
            { value: 'title', label: t('browse.sortTitle') },
          ]}
        />
        {hasFilters ? <Button size="sm" variant="ghost" onClick={resetFilters}>{t('browse.clearFilters')}</Button> : null}
        {loading && items.length > 0 ? <Spinner /> : null}
      </div>

      <div className="gam-chiprow" data-scroll="true" role="group" aria-label={t('browse.allKinds')}>
        <button type="button" className={cx('gam-chip', !kind && 'is-active')} onClick={() => setKind('')}>
          {t('browse.allKinds')}
          <span className="gam-chipcount">{Object.values(counts).reduce((sum, count) => sum + count, 0)}</span>
        </button>
        {KINDS.map((value) => (
          <button type="button" className={cx('gam-chip', kind === value && 'is-active')} key={value} onClick={() => setKind(value)}>
            {kindLabel(t, value)}
            {counts[value] ? <span className="gam-chipcount">{counts[value]}</span> : null}
          </button>
        ))}
      </div>

      {error ? <ErrorState title={t('browse.loadFailed')} message={error} retryLabel={t('panel.retry')} onRetry={() => setReload((value) => value + 1)} /> : null}

      {loading && items.length === 0 ? (
        <SkeletonList rows={6} />
      ) : sorted.length === 0 && !error ? (
        hasFilters ? (
          <EmptyState
            icon={<IconSearch size={20} />}
            title={t('browse.noResults')}
            description={t('browse.noResultsDesc')}
            actions={<Button size="sm" onClick={resetFilters}>{t('browse.clearFilters')}</Button>}
          />
        ) : (
          <EmptyState
            icon={<IconMemory size={20} />}
            title={t('panel.empty')}
            description={t('browse.emptyDesc')}
            actions={<Button size="sm" variant="primary" icon={<IconImport size={14} />} onClick={() => props.onNavigate('import')}>{t('nav.import')}</Button>}
          />
        )
      ) : (
        <>
          <div className="gam-listcard">
            {sorted.map((item) => (
              <button type="button" className="gam-rowitem" key={item.id} onClick={() => props.onOpen(item.id)}>
                <div className="gam-rowitem-main">
                  <div className="gam-rowitem-top">
                    <KindBadge kind={item.kind} t={t} />
                    <span className="gam-rowitem-title">{item.title}</span>
                    {item.invalidatedAt ? <Badge tone="warn">{t('browse.invalidated')}</Badge> : null}
                    {item.pii ? <Badge tone="danger">{t('browse.pii')}</Badge> : null}
                  </div>
                  {item.summary && item.summary !== item.title ? <div className="gam-rowitem-sum">{item.summary}</div> : null}
                  <div className="gam-rowitem-meta">
                    <span>{item.source}</span>
                    <span className="gam-dotsep">·</span>
                    <span>{item.confidence}</span>
                    <span className="gam-dotsep">·</span>
                    <span>{item.hits} {t('browse.hits')}</span>
                    <span className="gam-dotsep">·</span>
                    <span>{formatDate(item.createdAt)}</span>
                    {item.project ? <><span className="gam-dotsep">·</span><span>{item.project}</span></> : null}
                  </div>
                </div>
                <div className="gam-rowitem-side">
                  {typeof item.score === 'number' ? <span className="gam-tag gam-hits">{item.score.toFixed(2)}</span> : null}
                  <IconChevronRight size={14} className="gam-faint" />
                </div>
              </button>
            ))}
          </div>
          {items.length < total ? (
            <div className="gam-inline" style={{ justifyContent: 'center', marginTop: 12 }}>
              <Button size="sm" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <Spinner /> : <IconPlus size={13} />}
                {t('browse.loadMore')}
                <span className="gam-faint">{items.length}/{total}</span>
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 条目详情抽屉
// ---------------------------------------------------------------------------

function EntryDrawer(props: {
  id: string
  t: Translate
  onClose: () => void
  onOpen: (id: string) => void
  onChanged: () => void
  toast: (message: string, tone?: Tone) => void
}): ReactNode {
  const t = props.t
  const [entry, setEntry] = useState<EntryDetail | null>(null)
  const [tab, setTab] = useState<'content' | 'meta' | 'raw'>('content')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showInvalidate, setShowInvalidate] = useState(false)
  const [reason, setReason] = useState('')
  const [invalidating, setInvalidating] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)

  const load = useCallback(() => {
    let alive = true
    setLoading(true)
    setError(null)
    api.entry(props.id)
      .then((value) => {
        if (!alive) return
        setEntry(value)
        setDraft(value.body)
      })
      .catch((cause: Error) => { if (alive) setError(cause.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [props.id])

  useEffect(() => load(), [load])

  const dirty = editing && entry !== null && draft !== entry.body
  const invalidated = Boolean(entry && (entry.meta.temporal as Record<string, unknown> | undefined)?.invalidatedAt)

  const requestClose = () => {
    if (dirty) setShowDiscard(true)
    else props.onClose()
  }

  useEffect(() => {
    if (showInvalidate || showDiscard) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (dirty) setShowDiscard(true)
      else props.onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showInvalidate, showDiscard, dirty, props.onClose])

  const save = () => {
    if (!entry) return
    setSaving(true)
    setSaveError(null)
    const rev = Number((entry.meta.stats as Record<string, unknown> | undefined)?.revisions ?? 0)
    api.patch(entry.meta.id, draft, rev)
      .then(() => {
        props.toast(t('detail.saved'), 'success')
        setEditing(false)
        props.onChanged()
        load()
      })
      .catch((cause: Error) => setSaveError(cause.message))
      .finally(() => setSaving(false))
  }

  const invalidate = () => {
    if (!entry || !reason.trim()) return
    setInvalidating(true)
    api.invalidate(entry.meta.id, reason.trim())
      .then(() => {
        props.toast(t('detail.invalidated'), 'success')
        props.onChanged()
        setShowInvalidate(false)
        props.onClose()
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setInvalidating(false))
  }

  const startEdit = () => {
    if (!entry) return
    setDraft(entry.body)
    setEditing(true)
    setSaveError(null)
    setTab('content')
  }

  return (
    <div
      className="gam-overlay"
      data-align="right"
      onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose() }}
    >
      <section className="gam-drawer" role="dialog" aria-modal="true" aria-label={entry?.meta.title ?? t('detail.title')}>
        <header className="gam-drawer-head">
          <div className="gam-drawer-head-main">
            <div className="gam-tagrow">
              {entry ? <KindBadge kind={entry.meta.kind} t={t} /> : null}
              {invalidated ? <Badge tone="warn">{t('browse.invalidated')}</Badge> : null}
              {entry ? <span className="gam-tag">{String(entry.meta.scope ?? '')}</span> : null}
              {entry ? <span className="gam-tag">{String(entry.meta.confidence ?? '')}</span> : null}
            </div>
            <h2 className="gam-drawer-title">{entry?.meta.title ?? (loading ? t('common.loading') : t('detail.title'))}</h2>
            {entry?.meta.summary ? <p className="gam-drawer-sub">{entry.meta.summary}</p> : null}
          </div>
          <Button size="sm" variant="ghost" onClick={requestClose} icon={<IconClose size={15} />}>{t('common.close')}</Button>
        </header>

        <div className="gam-drawer-tabs" role="tablist">
          <button type="button" className={cx('gam-tab', tab === 'content' && 'is-active')} role="tab" aria-selected={tab === 'content'} onClick={() => setTab('content')}>
            {t('detail.content')}
          </button>
          <button type="button" className={cx('gam-tab', tab === 'meta' && 'is-active')} role="tab" aria-selected={tab === 'meta'} onClick={() => setTab('meta')}>
            {t('detail.meta')}
          </button>
          <button type="button" className={cx('gam-tab', tab === 'raw' && 'is-active')} role="tab" aria-selected={tab === 'raw'} onClick={() => setTab('raw')}>
            {t('detail.raw')}
          </button>
        </div>

        <div className="gam-drawer-body">
          {loading ? <SkeletonList rows={5} /> : null}
          {error ? <ErrorState title={t('detail.loadFailed')} message={error} retryLabel={t('panel.retry')} onRetry={load} /> : null}
          {entry && !error ? (
            tab === 'content' ? (
              editing ? (
                <div className="gam-stack">
                  <textarea className="gam-textarea" value={draft} onChange={(event) => setDraft(event.target.value)} aria-label={t('detail.editBody')} />
                  <div className="gam-field-hint">{t('detail.markdownHint')} · {t('detail.unsaved')}</div>
                  {saveError ? <div className="gam-errorbox"><div className="gam-error-title">{t('detail.saveFailed')}</div><pre className="gam-pre">{saveError}</pre></div> : null}
                </div>
              ) : entry.body.trim() ? (
                <Markdown text={entry.body} />
              ) : (
                <EmptyState icon={<IconFile size={20} />} title={t('detail.emptyBody')} description={t('detail.emptyBodyDesc')} />
              )
            ) : tab === 'meta' ? (
              <MetaTab entry={entry} t={t} onOpen={props.onOpen} />
            ) : (
              <div className="gam-stack">
                <div className="gam-inline">
                  <span className="gam-muted">{t('detail.rawHint')}</span>
                  <span className="gam-spacer" />
                  <CopyButton text={JSON.stringify({ meta: entry.meta, body: entry.body, rel: entry.rel }, null, 2)} label={t('common.copy')} copiedLabel={t('common.copied')} />
                </div>
                <pre className="gam-pre">{JSON.stringify({ meta: entry.meta, body: entry.body, rel: entry.rel }, null, 2)}</pre>
              </div>
            )
          ) : null}
        </div>

        <footer className="gam-drawer-footer">
          {entry ? (
            <>
              <CopyButton text={entry.meta.id} label={t('common.copyId')} copiedLabel={t('common.copied')} onCopied={(ok) => { if (!ok) props.toast(t('common.copyFailed'), 'danger') }} />
              <CopyButton text={entry.body} label={t('detail.copyBody')} copiedLabel={t('common.copied')} onCopied={(ok) => { if (!ok) props.toast(t('common.copyFailed'), 'danger') }} />
              <span className="gam-spacer" />
              {!invalidated ? (
                <Button size="sm" variant="ghost" icon={<IconTrash size={13} />} onClick={() => setShowInvalidate(true)}>
                  {t('detail.invalidate')}
                </Button>
              ) : null}
              {editing ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => { setDraft(entry.body); setEditing(false); setSaveError(null) }}>
                    {t('common.cancel')}
                  </Button>
                  <Button size="sm" variant="primary" icon={saving ? <Spinner /> : <IconSave size={13} />} disabled={!dirty || saving} onClick={save}>
                    {saving ? t('common.saving') : t('common.save')}
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="primary" icon={<IconEdit size={13} />} disabled={invalidated} onClick={startEdit}>
                  {t('common.edit')}
                </Button>
              )}
            </>
          ) : null}
        </footer>
      </section>

      <Dialog
        open={showInvalidate}
        title={t('detail.invalidateTitle')}
        description={t('detail.invalidateDesc')}
        onClose={() => setShowInvalidate(false)}
        closeLabel={t('common.close')}
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowInvalidate(false)} disabled={invalidating}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={invalidate} disabled={!reason.trim() || invalidating}>
              {invalidating ? <Spinner /> : null}
              {t('detail.invalidateConfirm')}
            </Button>
          </>
        }
      >
        <div className="gam-field">
          <label className="gam-field-label" htmlFor="gam-invalidate-reason">{t('detail.reason')}</label>
          <textarea
            id="gam-invalidate-reason"
            className="gam-textarea"
            style={{ minHeight: 90 }}
            value={reason}
            placeholder={t('detail.reasonPlaceholder')}
            onChange={(event) => setReason(event.target.value)}
            autoFocus
          />
          <span className="gam-field-hint">{t('detail.invalidateHint')}</span>
        </div>
      </Dialog>

      <ConfirmDialog
        open={showDiscard}
        title={t('detail.discardTitle')}
        description={t('detail.discardDesc')}
        confirmLabel={t('detail.discardConfirm')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        danger
        onConfirm={() => { setShowDiscard(false); props.onClose() }}
        onClose={() => setShowDiscard(false)}
      />
    </div>
  )
}

function MetaTab(props: { entry: EntryDetail; t: Translate; onOpen: (id: string) => void }): ReactNode {
  const t = props.t
  const meta = props.entry.meta
  const provenance = asRecord(meta.provenance)
  const temporal = asRecord(meta.temporal)
  const stats = asRecord(meta.stats)
  const links = asRecord(meta.links)
  const privacy = asRecord(meta.privacy)
  const relationKeys = ['relates', 'conflictsWith', 'supersededBy']
  const related = relationKeys.flatMap((key) => asArray(links[key]).map((id) => ({ key, id: String(id) })))

  const groups: Array<{ title: string; rows: Array<{ label: string; value: ReactNode }> }> = [
    {
      title: t('detail.basic'),
      rows: [
        { label: 'id', value: <span className="gam-mono">{meta.id}</span> },
        { label: 'kind', value: kindLabel(t, meta.kind) },
        { label: 'scope', value: String(meta.scope ?? '—') },
        { label: 'confidence', value: String(meta.confidence ?? '—') },
        { label: 'activation', value: String(meta.activation ?? '—') },
        { label: 'project', value: (meta.project as string | null) ?? '—' },
      ],
    },
    {
      title: t('detail.time'),
      rows: [
        { label: 'createdAt', value: formatDateTime(asString(provenance.createdAt)) },
        { label: 'validFrom', value: formatDateTime(asString(temporal.validFrom)) },
        { label: 'invalidatedAt', value: temporal.invalidatedAt ? formatDateTime(asString(temporal.invalidatedAt)) : '—' },
        { label: 'lastUsedAt', value: stats.lastUsedAt ? formatDateTime(asString(stats.lastUsedAt)) : '—' },
      ],
    },
    {
      title: t('detail.usage'),
      rows: [
        { label: 'hits', value: formatNumber(Number(stats.hits ?? 0)) },
        { label: 'revisions', value: formatNumber(Number(stats.revisions ?? 0)) },
        { label: 'heat', value: Number(stats.heat ?? 0).toFixed(3) },
      ],
    },
    {
      title: t('detail.provenance'),
      rows: [
        { label: 'source', value: asString(provenance.source) ?? '—' },
        { label: 'createdBy', value: asString(provenance.createdBy) ?? '—' },
        { label: 'sessionId', value: asString(provenance.sessionId) ?? '—' },
        { label: 'importedFrom', value: asString(provenance.importedFrom) ?? '—' },
      ],
    },
    {
      title: t('detail.tagsEntities'),
      rows: [
        { label: 'tags', value: asArray(meta.tags).join(', ') || '—' },
        { label: 'entities', value: asArray(meta.entities).join(', ') || '—' },
        { label: 'privacy', value: `${asString(privacy.pii) ?? String(privacy.pii ?? false)} / ${String(privacy.shareable ?? '—')}` },
      ],
    },
  ]

  return (
    <div className="gam-stack" style={{ gap: 16 }}>
      {groups.map((group) => (
        <section key={group.title}>
          <div className="gam-subhead"><h2>{group.title}</h2></div>
          <div className="gam-listcard" style={{ background: 'transparent' }}>
            {group.rows.map((row) => (
              <div className="gam-settingrow" key={row.label}>
                <span className="gam-setting-key">{row.label}</span>
                <span className="gam-setting-val">{row.value}</span>
              </div>
            ))}
          </div>
        </section>
      ))}

      {related.length > 0 ? (
        <section>
          <div className="gam-subhead"><h2>{t('detail.relations')}</h2><span>{related.length}</span></div>
          <div className="gam-tagrow">
            {related.map((item) => (
              <button type="button" className="gam-chip" key={`${item.key}:${item.id}`} onClick={() => props.onOpen(item.id)} title={item.key}>
                {shortId(item.id, 10)}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="gam-subhead"><h2>{t('detail.file')}</h2></div>
        <div className="gam-listcard" style={{ background: 'transparent' }}>
          <div className="gam-settingrow">
            <span className="gam-setting-key">rel</span>
            <span className="gam-setting-val gam-mono">{props.entry.rel}</span>
          </div>
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 导入
// ---------------------------------------------------------------------------

type SourceFilter = 'all' | 'detected' | 'memory' | 'conversation'
type ItemFilter = 'all' | 'new' | 'existing' | 'pii'

function ImportView(props: CommonProps): ReactNode {
  const t = props.t
  const [sources, setSources] = useState<ImportSourceStatus[]>([])
  const [scanRoot, setScanRoot] = useState('')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [scan, setScan] = useState<ScanReportView | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [itemFilter, setItemFilter] = useState<ItemFilter>('all')
  const [itemQuery, setItemQuery] = useState('')
  const [report, setReport] = useState<ApplyReportView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [busyLabel, setBusyLabel] = useState('')
  const [pathSource, setPathSource] = useState<ImportSourceStatus | null>(null)
  const [pathValue, setPathValue] = useState('')
  const [confirmApply, setConfirmApply] = useState(false)

  const loadSources = useCallback(() => {
    api.importSources()
      .then((result) => {
        setSources(result.sources)
        setScanRoot(result.cwd)
      })
      .catch((cause: Error) => setError(cause.message))
  }, [])

  useEffect(loadSources, [loadSources, props.version])

  const startScan = (source: ImportSourceStatus, path?: string) => {
    setBusy(true)
    setBusyLabel(source.label)
    setScan(null)
    setReport(null)
    setError(null)
    setItemFilter('all')
    setItemQuery('')
    api.importScan({ source: source.id, limit: 200, ...(path ? { path } : {}) })
      .then((result) => {
        setScan(result)
        setSelected(new Set(result.items.filter((item) => !item.duplicateOf && !item.pii).map((item) => item.key)))
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setBusy(false))
  }

  const pickSource = (source: ImportSourceStatus) => {
    if (source.id === 'generic-dir') {
      setPathSource(source)
      setPathValue('')
      return
    }
    startScan(source)
  }

  const apply = () => {
    if (!scan || selected.size === 0) return
    setBusy(true)
    setBusyLabel(t('import.applying'))
    api.importApply({ scanId: scan.scanId, keys: [...selected] })
      .then((result) => {
        setReport(result)
        setScan(null)
        setSelected(new Set())
        setConfirmApply(false)
        props.onChanged()
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

  const filteredSources = sources
    .filter((source) => {
      if (sourceFilter === 'detected') return source.detected.length > 0
      if (sourceFilter === 'memory') return source.kind === 'memory'
      if (sourceFilter === 'conversation') return source.kind === 'conversation'
      return true
    })
    .sort((a, b) => Number(b.detected.length > 0) - Number(a.detected.length > 0) || a.label.localeCompare(b.label))

  const visibleItems = scan
    ? scan.items.filter((item) => {
        if (itemFilter === 'new' && item.duplicateOf) return false
        if (itemFilter === 'existing' && !item.duplicateOf) return false
        if (itemFilter === 'pii' && !item.pii) return false
        if (!itemQuery.trim()) return true
        const haystack = `${item.title} ${item.summary} ${item.origin}`.toLowerCase()
        return haystack.includes(itemQuery.trim().toLowerCase())
      })
    : []

  const memoryCount = sources.filter((source) => source.kind === 'memory').length
  const conversationCount = sources.filter((source) => source.kind === 'conversation').length
  const detectedCount = sources.filter((source) => source.detected.length > 0).length

  return (
    <div className="gam-page">
      <PageHeader
        eyebrow={t('nav.groupMemory')}
        title={t('nav.import')}
        description={t('import.hint')}
        actions={
          <Button size="sm" variant="ghost" icon={<IconRefresh size={14} />} onClick={loadSources}>
            {t('import.rescanSources')}
          </Button>
        }
      />

      {error ? <ErrorState title={t('import.scanFailed')} message={error} retryLabel={t('panel.retry')} onRetry={() => setError(null)} /> : null}

      {report ? (
        <Card title={t('import.done')} hint={t('import.doneHint')}>
          <div className="gam-tagrow">
            <Badge tone="success">{t('import.added')} {report.added}</Badge>
            <Badge tone="accent">{t('import.updated')} {report.updated}</Badge>
            <Badge>{t('import.noop')} {report.noop}</Badge>
            {report.rejected > 0 ? <Badge tone="danger">{t('import.rejected')} {report.rejected}</Badge> : null}
          </div>
          <div className="gam-stat-row" style={{ marginTop: 10 }}>
            <span className="gam-muted">{t('import.snapshot')}</span>
            <span className="gam-inline"><code className="gam-mono">{report.snapshot}</code><CopyButton text={report.snapshot} label={t('common.copy')} copiedLabel={t('common.copied')} /></span>
          </div>
          <div className="gam-inline" style={{ marginTop: 12 }}>
            <Button size="sm" variant="primary" onClick={() => props.onNavigate('browse')}>{t('import.viewMemories')}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setReport(null); setScan(null); setSelected(new Set()); loadSources() }}>{t('import.continue')}</Button>
          </div>
        </Card>
      ) : scan ? (
        <>
          <div className="gam-scanbar">
            <Badge tone="accent">{scan.label}</Badge>
            <span className="gam-muted">{scan.items.length} {t('import.items')}</span>
            <span className="gam-dotsep">·</span>
            <Badge tone="success">{t('import.new')} {scan.estimate.added}</Badge>
            <Badge tone="accent">{t('import.merge')} {scan.estimate.merged}</Badge>
            <Badge>{t('import.duplicate')} {scan.estimate.duplicate}</Badge>
            {scan.estimate.pii > 0 ? <Badge tone="danger">PII {scan.estimate.pii}</Badge> : null}
            {scan.estimate.alreadyImported > 0 ? (
              <Badge tone="warn">
                {t('import.alreadyImported')} {scan.estimate.alreadyImported}
              </Badge>
            ) : null}
            {scan.budget?.overBudget ? <Badge tone="warn">{t('import.budgetWarn')}</Badge> : null}
            <span className="gam-spacer" />
            <Button size="sm" variant="ghost" onClick={() => { setScan(null); setSelected(new Set()) }}>{t('import.cancel')}</Button>
          </div>

          {scan.estimate.alreadyImported > 0 ? (
            <div className="gam-muted" style={{ fontSize: 11 }}>
              {t('import.alreadyImportedNote')}
            </div>
          ) : null}

          {scan.skipped.length > 0 ? (
            <div className="gam-muted" style={{ fontSize: 11 }}>
              {t('import.skipped')}: {scan.skipped.length}
            </div>
          ) : null}

          <div className="gam-toolbar">
            <Segmented<ItemFilter>
              value={itemFilter}
              onChange={setItemFilter}
              ariaLabel={t('import.filterItems')}
              options={[
                { value: 'all', label: `${t('import.filterAll')} ${scan.items.length}` },
                { value: 'new', label: `${t('import.new')} ${scan.estimate.added}` },
                { value: 'existing', label: `${t('import.duplicate')} ${scan.estimate.duplicate + scan.estimate.merged}` },
                ...(scan.estimate.pii > 0 ? [{ value: 'pii' as const, label: `PII ${scan.estimate.pii}` }] : []),
              ]}
            />
            <SearchInput
              value={itemQuery}
              onChange={setItemQuery}
              placeholder={t('import.searchItems')}
              aria-label={t('import.searchItems')}
              clearLabel={t('common.clear')}
            />
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set(visibleItems.map((item) => item.key)))}>
              {t('import.selectVisible')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>{t('import.selectNone')}</Button>
          </div>

          {visibleItems.length === 0 ? (
            scan.items.length === 0 ? (
              <EmptyState
                icon={<IconFile size={20} />}
                title={t('import.noMinedItems')}
                description={
                  scan.skipped.length > 0
                    ? `${t('import.noMinedItemsDesc')}（${t('import.skipped')} ${scan.skipped.length}）`
                    : t('import.noMinedItemsDesc')
                }
              />
            ) : (
              <EmptyState icon={<IconFile size={20} />} title={t('import.noItems')} description={t('import.noItemsDesc')} />
            )
          ) : (
            <div className="gam-importlist">
              {visibleItems.map((item) => (
                <label className="gam-importrow" key={item.key}>
                  <input type="checkbox" checked={selected.has(item.key)} onChange={() => toggle(item.key)} />
                  <span className="gam-importrow-main">
                    <span className="gam-rowitem-top">
                      <KindBadge kind={item.kind} t={t} />
                      <span className="gam-rowitem-title">{item.title}</span>
                      {item.duplicateOf ? <Badge tone="warn">{t('import.duplicate')}</Badge> : <Badge tone="success">{t('import.new')}</Badge>}
                      {item.pii ? <Badge tone="danger">PII</Badge> : null}
                    </span>
                    {item.summary && item.summary !== item.title ? <span className="gam-rowitem-sum">{item.summary}</span> : null}
                    <span className="gam-rowitem-meta">
                      <span>{item.activation}</span>
                      <span className="gam-dotsep">·</span>
                      <span>{item.confidence}</span>
                      <span className="gam-dotsep">·</span>
                      <span className="gam-mono">{item.origin}</span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="gam-bulkbar">
            <span className="gam-muted">{interpolate(t('import.selectedCount'), { n: selected.size })}</span>
            <span className="gam-spacer" />
            <Button size="sm" variant="ghost" onClick={() => setScan(null)}>{t('common.cancel')}</Button>
            <Button size="sm" variant="primary" disabled={busy || selected.size === 0} onClick={() => setConfirmApply(true)}>
              {busy ? <Spinner /> : <IconImport size={13} />}
              {interpolate(t('import.applyCount'), { n: selected.size })}
            </Button>
          </div>
        </>
      ) : busy ? (
        <Card>
          <div className="gam-inline" style={{ padding: '18px 0', justifyContent: 'center' }}>
            <Spinner />
            <span className="gam-muted">{interpolate(t('import.scanning'), { name: busyLabel })}</span>
          </div>
        </Card>
      ) : (
        <>
          <div className="gam-toolbar">
            <Segmented<SourceFilter>
              value={sourceFilter}
              onChange={setSourceFilter}
              ariaLabel={t('import.filterSources')}
              options={[
                { value: 'all', label: `${t('import.filterAll')} ${sources.length}` },
                { value: 'detected', label: `${t('import.detected')} ${detectedCount}` },
                { value: 'memory', label: `${t('import.memory')} ${memoryCount}` },
                { value: 'conversation', label: `${t('import.conversation')} ${conversationCount}` },
              ]}
            />
            <span className="gam-spacer" />
            <span className="gam-faint">{t('import.scanOnlyHint')}</span>
          </div>

          {scanRoot ? (
            <div className="gam-muted" style={{ fontSize: 11 }}>
              {t('import.scanRoot')}: <span className="gam-mono">{scanRoot}</span>
            </div>
          ) : null}

          {filteredSources.length === 0 ? (
            <EmptyState icon={<IconFolder size={20} />} title={t('import.noSources')} description={t('import.noSourcesDesc')} />
          ) : (
            <div className="gam-importgrid">
              {filteredSources.map((source) => (
                <button
                  type="button"
                  className="gam-source"
                  key={source.id}
                  data-detected={source.detected.length > 0 ? 'true' : 'false'}
                  disabled={busy}
                  onClick={() => pickSource(source)}
                >
                  <span className="gam-source-head">
                    <span className="gam-source-dot" />
                    <span className="gam-source-title">{source.label}</span>
                    <span className="gam-source-count">
                      {source.detected.length > 0 ? `${source.detected.length} ${t('import.places')}` : t('import.notDetected')}
                    </span>
                  </span>
                  <span className="gam-source-path">
                    {source.id === 'generic-dir'
                      ? t('import.genericHint')
                      : source.detected[0] ?? t('import.notDetectedHint')}
                  </span>
                  <span className="gam-source-cta">
                    {source.id === 'generic-dir' ? t('import.chooseFolder') : t('import.scan')}
                    <IconArrowRight size={11} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog
        open={Boolean(pathSource)}
        title={t('import.genericTitle')}
        description={t('import.genericDesc')}
        onClose={() => setPathSource(null)}
        closeLabel={t('common.close')}
        actions={
          <>
            <Button variant="ghost" onClick={() => setPathSource(null)}>{t('common.cancel')}</Button>
            <Button
              variant="primary"
              disabled={!pathValue.trim()}
              onClick={() => {
                if (!pathSource) return
                const source = pathSource
                setPathSource(null)
                startScan(source, pathValue.trim())
              }}
            >
              {t('import.scan')}
            </Button>
          </>
        }
      >
        <div className="gam-field">
          <label className="gam-field-label" htmlFor="gam-import-path">{t('import.path')}</label>
          <input
            id="gam-import-path"
            className="gam-input"
            value={pathValue}
            placeholder={t('import.pathPlaceholder')}
            onChange={(event) => setPathValue(event.target.value)}
            autoFocus
          />
          <span className="gam-field-hint">{t('import.pathHint')}</span>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmApply}
        title={t('import.confirmTitle')}
        description={t('import.confirmDesc')}
        confirmLabel={interpolate(t('import.applyCount'), { n: selected.size })}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        busy={busy}
        onConfirm={apply}
        onClose={() => setConfirmApply(false)}
      >
        <div className="gam-stack">
          <div className="gam-stat-row"><span className="gam-muted">{t('import.countLabel')}</span><b>{selected.size}</b></div>
          <div className="gam-stat-row"><span className="gam-muted">{t('import.snapshot')}</span><b>{t('import.snapshotAuto')}</b></div>
          {scan?.budget?.overBudget ? <Badge tone="warn">{t('import.budgetWarn')}</Badge> : null}
        </div>
      </ConfirmDialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 时间线
// ---------------------------------------------------------------------------

function TimelineView(props: CommonProps): ReactNode {
  const t = props.t
  const [asOf, setAsOf] = useState(todayISO())
  const [items, setItems] = useState<EntrySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    api.entries({ limit: 1000 })
      .then((page) => { if (alive) { setItems(page.items); setError(null) } })
      .catch((cause: Error) => { if (alive) setError(cause.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [props.version])

  const valid = useMemo(() => {
    return items
      .filter((item) => localDay(item.createdAt) <= asOf && (!item.invalidatedAt || localDay(item.invalidatedAt) > asOf))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [items, asOf])

  const byDay = useMemo(() => {
    const map = new Map<string, EntrySummary[]>()
    for (const item of valid) {
      const day = localDay(item.createdAt)
      const list = map.get(day) ?? []
      list.push(item)
      map.set(day, list)
    }
    return [...map.entries()]
  }, [valid])

  return (
    <div className="gam-page">
      <PageHeader
        eyebrow={t('nav.groupMemory')}
        title={t('nav.timeline')}
        description={t('timeline.hint')}
        actions={
          <>
            <Badge>{valid.length} / {items.length}</Badge>
            <Button size="sm" variant="ghost" onClick={() => setAsOf(todayISO())}>{t('common.today')}</Button>
          </>
        }
      />

      <div className="gam-toolbar">
        <Button size="sm" icon={<IconChevronLeft size={14} />} onClick={() => setAsOf(shiftDay(asOf, -1))} aria-label={t('timeline.prevDay')} />
        <label className="gam-field-label" htmlFor="gam-asof">{t('timeline.asOf')}</label>
        <input id="gam-asof" className="gam-input" type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} style={{ width: 160 }} />
        <Button size="sm" onClick={() => setAsOf(shiftDay(asOf, 1))} aria-label={t('timeline.nextDay')}><IconChevronRight size={14} /></Button>
        <span className="gam-spacer" />
        <span className="gam-faint">{t('timeline.asOfHint')}</span>
      </div>

      {error ? <ErrorState title={t('timeline.loadFailed')} message={error} retryLabel={t('panel.retry')} /> : null}

      {loading ? (
        <SkeletonList rows={6} />
      ) : byDay.length === 0 ? (
        <EmptyState
          icon={<IconClock size={20} />}
          title={t('timeline.empty')}
          description={t('timeline.emptyDesc')}
          actions={<Button size="sm" variant="ghost" onClick={() => setAsOf(todayISO())}>{t('common.today')}</Button>}
        />
      ) : (
        <div className="gam-timeline">
          {byDay.map(([day, list]) => (
            <div className="gam-tl-day" key={day}>
              <div className="gam-tl-date">
                <b>{formatMonthDay(day)}</b>
                <span>{day.slice(0, 4)}</span>
              </div>
              <div className="gam-tl-rail"><span className="gam-tl-dot" /></div>
              <div className="gam-tl-items">
                {list.map((item) => (
                  <button type="button" className="gam-tl-item" key={item.id} onClick={() => props.onOpen(item.id)}>
                    <span className="gam-rowitem-main">
                      <span className="gam-rowitem-top">
                        <KindBadge kind={item.kind} t={t} />
                        <span className="gam-rowitem-title">{item.title}</span>
                        {item.invalidatedAt ? <Badge tone="warn">{t('timeline.invalidatedAfter')} {formatDate(item.invalidatedAt)}</Badge> : null}
                      </span>
                      {item.summary && item.summary !== item.title ? <span className="gam-rowitem-sum">{item.summary}</span> : null}
                      <span className="gam-rowitem-meta">
                        <span>{item.source}</span>
                        <span className="gam-dotsep">·</span>
                        <span>{item.hits} {t('browse.hits')}</span>
                      </span>
                    </span>
                    <IconChevronRight size={14} className="gam-faint" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 审计
// ---------------------------------------------------------------------------

function AuditView(props: CommonProps): ReactNode {
  const t = props.t
  const [date, setDate] = useState(todayISO())
  const [act, setAct] = useState('')
  const [query, setQuery] = useState('')
  const [rows, setRows] = useState<AuditRow[]>([])
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    api.audit(date, 1000)
      .then((result) => { if (alive) { setRows(result.items); setTotal(result.total); setError(null); setExpanded(new Set()) } })
      .catch((cause: Error) => { if (alive) setError(cause.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [date, props.version, reload])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (act && row.act !== act) return false
      if (!needle) return true
      return JSON.stringify(row).toLowerCase().includes(needle)
    })
  }, [rows, act, query])

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="gam-page">
      <PageHeader
        eyebrow={t('nav.groupSystem')}
        title={t('nav.audit')}
        description={t('audit.desc')}
        actions={
          <>
            <Badge>{filtered.length} / {total}</Badge>
            <CopyButton text={JSON.stringify(filtered, null, 2)} label={t('audit.copyRows')} copiedLabel={t('common.copied')} onCopied={(ok) => { if (!ok) props.toast(t('common.copyFailed'), 'danger') }} />
            <Button size="sm" variant="ghost" icon={<IconRefresh size={14} />} onClick={() => setReload((value) => value + 1)}>{t('common.refresh')}</Button>
          </>
        }
      />

      <div className="gam-toolbar">
        <Button size="sm" icon={<IconChevronLeft size={14} />} aria-label={t('audit.prevDay')} onClick={() => setDate(shiftDay(date, -1))} />
        <input className="gam-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} style={{ width: 150 }} aria-label={t('audit.date')} />
        <Button size="sm" icon={<IconChevronRight size={14} />} aria-label={t('audit.nextDay')} onClick={() => setDate(shiftDay(date, 1))} />
        <Button size="sm" variant="ghost" onClick={() => setDate(todayISO())}>{t('common.today')}</Button>
        <SelectField
          value={act}
          onChange={setAct}
          aria-label={t('audit.act')}
          options={[{ value: '', label: t('audit.allActs') }, ...AUDIT_ACTS.map((value) => ({ value, label: value }))]}
        />
        <SearchInput value={query} onChange={setQuery} placeholder={t('audit.search')} aria-label={t('audit.search')} clearLabel={t('common.clear')} />
        {loading ? <Spinner /> : null}
      </div>

      {error ? <ErrorState title={t('audit.loadFailed')} message={error} retryLabel={t('panel.retry')} onRetry={() => setReload((value) => value + 1)} /> : null}

      {loading && rows.length === 0 ? (
        <SkeletonList rows={7} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<IconAudit size={20} />} title={t('audit.empty')} description={t('audit.emptyDesc')} />
      ) : (
        <div className="gam-listcard">
          {filtered.map((row, index) => {
            const key = `${row.ts ?? ''}-${index}`
            const flagged = row.act === 'deny' || row.act === 'gate-drop'
            const open = expanded.has(key)
            const summary = [
              row.decision ?? null,
              row.reason ?? null,
              row.kind ?? null,
              row.title ?? null,
              row.id ?? null,
              row.source ?? null,
              row.snapshot ?? null,
              typeof row.merged === 'number' ? `merged ${row.merged}` : null,
              typeof row.promoted === 'number' ? `promoted ${row.promoted}` : null,
              typeof row.added === 'number' ? `+${row.added}` : null,
            ]
              .filter((value) => value !== null && value !== '')
              .join(' · ')
            return (
              <div className="gam-auditrow" key={key} data-flag={flagged ? 'true' : 'false'}>
                <button type="button" className="gam-audit-grid" onClick={() => toggle(key)} aria-expanded={open}>
                  <span className="gam-audit-time">{formatTime(row.ts)}</span>
                  <span><Badge tone={flagged ? 'danger' : row.act === 'import' ? 'accent' : 'neutral'}>{row.act ?? '—'}</Badge></span>
                  <span className="gam-audit-summary">{summary || '—'}</span>
                  <span className="gam-faint">{row.actor ?? '—'}</span>
                  <span className="gam-faint">{open ? <IconChevronDown size={13} /> : <IconChevronRight size={13} />}</span>
                </button>
                {open ? (
                  <div className="gam-audit-json">
                    <pre className="gam-pre">{JSON.stringify(row, null, 2)}</pre>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 恢复
// ---------------------------------------------------------------------------

function RecoveryView(props: CommonProps): ReactNode {
  const t = props.t
  const [snapshots, setSnapshots] = useState<SnapshotInfo[]>([])
  const [compare, setCompare] = useState<string[]>([])
  const [diff, setDiff] = useState<{ added: string[]; removed: string[]; changed: string[] } | null>(null)
  const [doctor, setDoctor] = useState<DoctorReport | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<SnapshotInfo | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [includePii, setIncludePii] = useState(false)
  const [exportResult, setExportResult] = useState<{ path: string; bytes: number; files: number; excluded: number } | null>(null)
  const [zipOpen, setZipOpen] = useState(false)
  const [zipPath, setZipPath] = useState('')
  const compareTouched = useRef(false)

  const load = useCallback(() => {
    api.snapshots()
      .then((result) => {
        setSnapshots(result.items)
        setCompare((prev) => {
          if (compareTouched.current) return prev
          if (prev.length === 2) return prev
          const first = result.items[0]
          const second = result.items[1]
          if (first && second) return [second.label, first.label]
          return first ? [first.label] : []
        })
      })
      .catch((cause: Error) => setError(cause.message))
  }, [])

  useEffect(load, [load, props.version])

  useEffect(() => {
    if (compare.length !== 2) {
      setDiff(null)
      return
    }
    const first = snapshots.find((snapshot) => snapshot.label === compare[0])
    const second = snapshots.find((snapshot) => snapshot.label === compare[1])
    if (!first || !second) return
    const ordered = [first, second].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    let alive = true
    api.snapshotDiff(ordered[0]!.label, ordered[1]!.label)
      .then((value) => { if (alive) setDiff(value) })
      .catch(() => { if (alive) setDiff(null) })
    return () => { alive = false }
  }, [compare, snapshots])

  const toggleCompare = (label: string) => {
    compareTouched.current = true
    setCompare((prev) => {
      if (prev.includes(label)) return prev.filter((value) => value !== label)
      if (prev.length >= 2) return [prev[1]!, label]
      return [...prev, label]
    })
  }

  const runDoctor = () => {
    setBusy('doctor')
    api.doctor(true)
      .then((result) => {
        setDoctor(result)
        props.toast(t('recovery.doctorDone'), result.after.length === 0 ? 'success' : 'warn')
        props.onChanged()
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setBusy(null))
  }

  const consolidate = () => {
    setBusy('consolidate')
    api.consolidate()
      .then((result) => {
        props.toast(`${t('recovery.consolidateDone')} · merged ${result.merged} · promoted ${result.promoted} · ${result.durationMs}ms`, 'success')
        props.onChanged()
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setBusy(null))
  }

  const createSnapshot = () => {
    setBusy('snapshot')
    api.createSnapshot('manual')
      .then((info) => {
        props.toast(`${t('recovery.snapshotCreated')} · ${info.label}`, 'success')
        load()
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setBusy(null))
  }

  const exportZip = () => {
    setBusy('export')
    api.exportZip(includePii)
      .then((result) => {
        setExportResult(result)
        setExportOpen(false)
        props.toast(t('recovery.exported'), 'success')
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setBusy(null))
  }

  const importZip = () => {
    if (!zipPath.trim()) return
    setBusy('zip')
    api.importZip(zipPath.trim())
      .then((result) => {
        props.toast(interpolate(t('recovery.zipImported'), { n: result.restored }), 'success')
        setZipOpen(false)
        setZipPath('')
        load()
        props.onChanged()
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setBusy(null))
  }

  const restore = () => {
    if (!restoreTarget) return
    setBusy('restore')
    api.restore(restoreTarget.label)
      .then((result) => {
        props.toast(`${t('recovery.restored')} ${result.restored} · ${t('recovery.preSnapshot')} ${result.preSnapshot}`, 'success')
        setRestoreTarget(null)
        load()
        props.onChanged()
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setBusy(null))
  }

  const orderedCompare = compare
    .map((label) => snapshots.find((snapshot) => snapshot.label === label))
    .filter((snapshot): snapshot is SnapshotInfo => Boolean(snapshot))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return (
    <div className="gam-page">
      <PageHeader
        eyebrow={t('nav.groupSystem')}
        title={t('nav.recovery')}
        description={t('recovery.desc')}
        actions={
          <>
            <Button size="sm" icon={busy === 'doctor' ? <Spinner /> : <IconShield size={14} />} onClick={runDoctor} disabled={Boolean(busy)}>{t('recovery.doctor')}</Button>
            <Button size="sm" icon={busy === 'snapshot' ? <Spinner /> : <IconPlus size={14} />} onClick={createSnapshot} disabled={Boolean(busy)}>{t('recovery.createSnapshot')}</Button>
            <Button size="sm" icon={busy === 'consolidate' ? <Spinner /> : <IconSparkle size={14} />} onClick={consolidate} disabled={Boolean(busy)}>{t('recovery.consolidate')}</Button>
          </>
        }
      />

      <div className="gam-grid2" data-align="start">
        <Card title={t('recovery.exportTitle')} hint={t('recovery.exportHint')}>
          <div className="gam-inline">
            <Button icon={<IconDownload size={14} />} onClick={() => setExportOpen(true)}>{t('recovery.export')}</Button>
            <Button icon={<IconUpload size={14} />} onClick={() => { setZipPath(''); setZipOpen(true) }}>{t('recovery.importZip')}</Button>
          </div>
          {exportResult ? (
            <div className="gam-stack" style={{ marginTop: 10 }}>
              <div className="gam-stat-row">
                <span className="gam-muted">{t('recovery.exported')}</span>
                <span className="gam-inline">
                  <code className="gam-mono gam-truncate" style={{ maxWidth: 220 }} title={exportResult.path}>{exportResult.path}</code>
                  <CopyButton text={exportResult.path} label={t('common.copyPath')} copiedLabel={t('common.copied')} />
                </span>
              </div>
              <div className="gam-stat-row"><span className="gam-muted">{t('recovery.files')}</span><b>{exportResult.files} · {formatBytes(exportResult.bytes)}</b></div>
              <div className="gam-stat-row"><span className="gam-muted">{t('recovery.excludedPii')}</span><b>{exportResult.excluded}</b></div>
            </div>
          ) : null}
        </Card>

        <Card title={t('recovery.doctorResult')} hint={t('recovery.doctorHint')}>
          {!doctor ? (
            <div className="gam-muted">{t('recovery.doctorIdle')}</div>
          ) : (
            <div className="gam-stack">
              <div className="gam-inline">
                <Badge tone={doctor.after.length === 0 ? 'success' : 'warn'} dot>
                  {doctor.after.length === 0 ? t('overview.allClear') : interpolate(t('overview.errorsFound'), { n: doctor.after.length })}
                </Badge>
                <span className="gam-faint">{doctor.rebuilt.length} {t('recovery.rebuilt')} · {doctor.unchanged} {t('recovery.unchanged')}</span>
              </div>
              {doctor.after.slice(0, 5).map((alert) => (
                <div className="gam-stat-row" key={alert.code}>
                  <span className="gam-muted">{alert.code}</span>
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {error ? <ErrorState title={t('recovery.loadFailed')} message={error} retryLabel={t('panel.retry')} onRetry={load} /> : null}

      <Card
        title={t('recovery.snapshots')}
        hint={t('recovery.snapshotsHint')}
        actions={<Button size="sm" variant="ghost" icon={<IconRefresh size={13} />} onClick={load}>{t('common.refresh')}</Button>}
      >
        {snapshots.length === 0 ? (
          <EmptyState
            icon={<IconRecovery size={20} />}
            title={t('recovery.noSnapshots')}
            description={t('recovery.noSnapshotsDesc')}
            actions={<Button size="sm" variant="primary" onClick={createSnapshot}>{t('recovery.createSnapshot')}</Button>}
          />
        ) : (
          <div>
            {snapshots.map((snapshot) => {
              const index = compare.indexOf(snapshot.label)
              return (
                <div className="gam-snapshotrow" key={snapshot.label}>
                  <input
                    type="checkbox"
                    checked={index >= 0}
                    onChange={() => toggleCompare(snapshot.label)}
                    aria-label={t('recovery.compare')}
                    style={{ accentColor: 'var(--gam-accent)' }}
                  />
                  {index >= 0 ? <Badge tone="accent">{index === 0 ? 'A' : 'B'}</Badge> : null}
                  <div className="gam-snapshotrow-main">
                    <div className="gam-snapshotrow-title">{snapshot.label}</div>
                    <div className="gam-snapshotrow-sub">
                      {formatDateTime(snapshot.createdAt)} · {snapshot.files} {t('recovery.files')} · {formatBytes(snapshot.bytes)}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setRestoreTarget(snapshot)}>{t('recovery.restore')}</Button>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card
        title={t('recovery.diff')}
        hint={compare.length === 2 && orderedCompare.length === 2 ? `${orderedCompare[0]!.label} → ${orderedCompare[1]!.label}` : t('recovery.diffHint')}
      >
        {!diff ? (
          <div className="gam-muted">{t('recovery.diffPick')}</div>
        ) : (
          <div className="gam-diff">
            <DiffColumn kind="add" title={`+ ${diff.added.length} ${t('recovery.added')}`} items={diff.added} emptyLabel={t('recovery.none')} />
            <DiffColumn kind="remove" title={`− ${diff.removed.length} ${t('recovery.removed')}`} items={diff.removed} emptyLabel={t('recovery.none')} />
            <DiffColumn kind="change" title={`~ ${diff.changed.length} ${t('recovery.changed')}`} items={diff.changed} emptyLabel={t('recovery.none')} />
          </div>
        )}
      </Card>

      <Dialog
        open={exportOpen}
        title={t('recovery.export')}
        description={t('recovery.exportDialogDesc')}
        onClose={() => setExportOpen(false)}
        closeLabel={t('common.close')}
        actions={
          <>
            <Button variant="ghost" onClick={() => setExportOpen(false)} disabled={busy === 'export'}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={exportZip} disabled={busy === 'export'}>
              {busy === 'export' ? <Spinner /> : <IconDownload size={13} />}
              {t('recovery.export')}
            </Button>
          </>
        }
      >
        <label className="gam-checkrow">
          <input type="checkbox" checked={includePii} onChange={(event) => setIncludePii(event.target.checked)} />
          {t('recovery.includePii')}
        </label>
        <p className="gam-field-hint" style={{ marginTop: 6 }}>{t('recovery.includePiiHint')}</p>
      </Dialog>

      <Dialog
        open={zipOpen}
        title={t('recovery.importZip')}
        description={t('recovery.importZipDesc')}
        onClose={() => setZipOpen(false)}
        closeLabel={t('common.close')}
        actions={
          <>
            <Button variant="ghost" onClick={() => setZipOpen(false)} disabled={busy === 'zip'}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={importZip} disabled={!zipPath.trim() || busy === 'zip'}>
              {busy === 'zip' ? <Spinner /> : <IconUpload size={13} />}
              {t('recovery.importZip')}
            </Button>
          </>
        }
      >
        <div className="gam-field">
          <label className="gam-field-label" htmlFor="gam-zip-path">{t('recovery.zipPath')}</label>
          <input
            id="gam-zip-path"
            className="gam-input"
            value={zipPath}
            placeholder={t('recovery.zipPathPlaceholder')}
            onChange={(event) => setZipPath(event.target.value)}
            autoFocus
          />
          <span className="gam-field-hint">{t('recovery.importZipHint')}</span>
        </div>
      </Dialog>

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        title={t('recovery.restoreTitle')}
        description={t('recovery.restoreDesc')}
        confirmLabel={t('recovery.restore')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        busy={busy === 'restore'}
        danger
        onConfirm={restore}
        onClose={() => setRestoreTarget(null)}
      >
        <div className="gam-stack">
          <div className="gam-stat-row"><span className="gam-muted">{t('recovery.snapshot')}</span><b className="gam-mono">{restoreTarget?.label}</b></div>
          <div className="gam-stat-row"><span className="gam-muted">{t('recovery.createdAt')}</span><b>{formatDateTime(restoreTarget?.createdAt)}</b></div>
          <div className="gam-stat-row"><span className="gam-muted">{t('recovery.preSnapshot')}</span><b>{t('recovery.auto')}</b></div>
        </div>
      </ConfirmDialog>
    </div>
  )
}

function DiffColumn(props: { kind: 'add' | 'remove' | 'change'; title: string; items: string[]; emptyLabel: string }): ReactNode {
  return (
    <div className="gam-diff-col" data-kind={props.kind}>
      <div className="gam-diff-head">{props.title}</div>
      {props.items.length === 0 ? (
        <div className="gam-diff-item">{props.emptyLabel}</div>
      ) : (
        props.items.slice(0, 120).map((item) => <div className="gam-diff-item" key={item}>{item}</div>)
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 设置
// ---------------------------------------------------------------------------

const SETTINGS_GROUPS: Array<{ titleKey: string; hintKey?: string; keys: string[] }> = [
  { titleKey: 'settings.groupStorage', keys: ['memoryRoot', 'indexBackend'] },
  { titleKey: 'settings.groupBudget', keys: ['budget'] },
  { titleKey: 'settings.groupInject', keys: ['inject'] },
  { titleKey: 'settings.groupIngest', hintKey: 'settings.groupIngestHint', keys: ['ingest'] },
  { titleKey: 'settings.groupRetrieval', keys: ['retrieval'] },
  { titleKey: 'settings.groupCurator', keys: ['curator'] },
  { titleKey: 'settings.groupPortability', keys: ['portability'] },
  { titleKey: 'settings.groupPrivacy', keys: ['privacy'] },
  { titleKey: 'settings.groupAdvanced', keys: ['toolSurface', 'advanced'] },
]

function SettingsView(props: CommonProps): ReactNode {
  const t = props.t
  const [config, setConfig] = useState<Record<string, unknown> | null>(null)
  const [targets, setTargets] = useState<ProjectionView[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [catalog, setCatalog] = useState<CatalogView | null>(null)
  const [showCatalog, setShowCatalog] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    api.config().then(setConfig).catch((cause: Error) => setError(cause.message))
    api.projections().then((result) => setTargets(result.targets)).catch(() => {})
  }, [props.version])

  useEffect(() => {
    if (!showCatalog || catalog) return
    api.catalog().then(setCatalog).catch((cause: Error) => props.toast(cause.message, 'danger'))
  }, [showCatalog, catalog, props.toast])

  const known = new Set(SETTINGS_GROUPS.flatMap((group) => group.keys))
  const unknown = config ? Object.keys(config).filter((key) => !known.has(key)) : []

  const applyProjections = (ids: string[]) => {
    setBusy('projections')
    api.applyProjections(ids)
      .then((result) => {
        props.toast(`${t('settings.applied')} ${result.results.filter((item) => item.changed).length}/${result.results.length}`, 'success')
      })
      .catch((cause: Error) => props.toast(cause.message, 'danger'))
      .finally(() => setBusy(null))
  }

  return (
    <div className="gam-page">
      <PageHeader
        eyebrow={t('nav.groupSystem')}
        title={t('nav.settings')}
        description={t('settings.hint')}
        actions={
          <>
            <CopyButton text={config ? JSON.stringify(config, null, 2) : ''} label={t('settings.copyConfig')} copiedLabel={t('common.copied')} onCopied={(ok) => { if (!ok) props.toast(t('common.copyFailed'), 'danger') }} />
            <Button size="sm" variant="ghost" onClick={() => setShowRaw((value) => !value)}>{showRaw ? t('settings.hideRaw') : t('settings.showRaw')}</Button>
          </>
        }
      />

      {error ? <ErrorState title={t('settings.loadFailed')} message={error} retryLabel={t('panel.retry')} /> : null}
      {!config ? <SkeletonList rows={5} /> : null}

      {config ? (
        <>
          <div className="gam-settingsgrid">
            {SETTINGS_GROUPS.map((group) => {
              const rows = group.keys.flatMap((key) => {
                const value = config[key]
                if (value === undefined) return []
                if (isPlainObject(value)) {
                  return Object.entries(value).map(([childKey, childValue]) => ({
                    label: childKey,
                    path: `${key}.${childKey}`,
                    value: childValue,
                  }))
                }
                return [{ label: key, path: key, value }]
              })
              if (rows.length === 0) return null
              return (
                <div className="gam-settinggroup" key={group.titleKey}>
                  <div className="gam-settinggroup-head">
                    <h3>{t(group.titleKey)}</h3>
                    {group.hintKey ? <p>{t(group.hintKey)}</p> : null}
                  </div>
                  {rows.map((row) => (
                    <div className="gam-settingrow" key={row.path}>
                      <span className="gam-setting-key" title={row.path}>{row.label}</span>
                      <span className="gam-setting-val">{renderSettingValue(row.value, t)}</span>
                    </div>
                  ))}
                </div>
              )
            })}
            {unknown.length > 0 ? (
              <div className="gam-settinggroup">
                <div className="gam-settinggroup-head"><h3>{t('settings.groupOther')}</h3></div>
                {unknown.map((key) => (
                  <div className="gam-settingrow" key={key}>
                    <span className="gam-setting-key">{key}</span>
                    <span className="gam-setting-val">{renderSettingValue(config[key], t)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <Card title={t('settings.projections')} hint={t('settings.projectionHint')}>
            <div className="gam-stack">
              {targets.map((target) => (
                <div className="gam-projectionrow" key={target.id}>
                  <div className="gam-projectionrow-main">
                    <div className="gam-projectionrow-title">{target.label}</div>
                    <div className="gam-projectionrow-path">{target.path}</div>
                  </div>
                  <span className="gam-switch" data-on={target.enabled ? 'true' : 'false'}>
                    {target.enabled ? t('common.on') : t('common.off')}
                  </span>
                  <Button size="sm" variant="ghost" disabled={busy === 'projections'} onClick={() => applyProjections([target.id])}>
                    {t('settings.generate')}
                  </Button>
                </div>
              ))}
              <div className="gam-inline" style={{ marginTop: 4 }}>
                <Button
                  size="sm"
                  icon={<IconRefresh size={13} />}
                  disabled={busy === 'projections' || targets.filter((target) => target.enabled).length === 0}
                  onClick={() => applyProjections(targets.filter((target) => target.enabled).map((target) => target.id))}
                >
                  {busy === 'projections' ? <Spinner /> : null}
                  {t('settings.applyEnabled')}
                </Button>
                <span className="gam-faint">{t('settings.projectionReadonly')}</span>
              </div>
            </div>
          </Card>

          <Card
            title={t('settings.injectionPreview')}
            hint={t('settings.injectionPreviewHint')}
            actions={
              <>
                <Button size="sm" variant="ghost" onClick={() => setShowCatalog((value) => !value)}>
                  {showCatalog ? t('common.hide') : t('common.show')}
                </Button>
                {catalog ? <CopyButton text={catalog.text} label={t('common.copy')} copiedLabel={t('common.copied')} /> : null}
              </>
            }
          >
            {!showCatalog ? (
              <div className="gam-muted">{t('settings.injectionPreviewIdle')}</div>
            ) : !catalog ? (
              <SkeletonList rows={3} />
            ) : (
              <div className="gam-stack">
                <span className="gam-faint">{t('overview.shown')} {catalog.shown} · {t('overview.omitted')} {catalog.omitted}</span>
                <pre className="gam-pre" style={{ maxHeight: 320 }}>{catalog.text || t('overview.emptyCatalog')}</pre>
              </div>
            )}
          </Card>

          {showRaw ? (
            <Card title={t('settings.rawConfig')} hint={t('settings.rawConfigHint')}>
              <pre className="gam-pre">{JSON.stringify(config, null, 2)}</pre>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function renderSettingValue(value: unknown, t: Translate): ReactNode {
  if (typeof value === 'boolean') {
    return <Badge tone={value ? 'success' : 'neutral'} dot>{value ? t('common.on') : t('common.off')}</Badge>
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? <span className="gam-muted">—</span> : (
      <span className="gam-tagrow">{value.map((item, index) => <span className="gam-tag" key={index}>{String(item)}</span>)}</span>
    )
  }
  if (isPlainObject(value)) {
    return <code>{JSON.stringify(value)}</code>
  }
  return <code>{String(value ?? '—')}</code>
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

// ---------------------------------------------------------------------------
// 命令面板
// ---------------------------------------------------------------------------

interface PaletteItem {
  id: string
  group: string
  label: string
  hint?: string
  icon: ReactNode
  run: () => void
}

function CommandPalette(props: {
  open: boolean
  t: Translate
  onClose: () => void
  onNavigate: (view: ViewId) => void
  onOpen: (id: string) => void
  onChanged: () => void
  toast: (message: string, tone?: Tone) => void
}): ReactNode {
  const t = props.t
  const [query, setQuery] = useState('')
  const debounced = useDebounced(query, 180)
  const [results, setResults] = useState<EntrySummary[]>([])
  const [searching, setSearching] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!props.open) return
    setQuery('')
    setResults([])
    setActive(0)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30)
    return () => window.clearTimeout(timer)
  }, [props.open])

  useEffect(() => {
    if (!props.open || !debounced.trim()) {
      setResults([])
      setSearching(false)
      return
    }
    let alive = true
    setSearching(true)
    api.entries({ q: debounced.trim(), limit: 8 })
      .then((page) => { if (alive) setResults(page.items) })
      .catch(() => { if (alive) setResults([]) })
      .finally(() => { if (alive) setSearching(false) })
    return () => { alive = false }
  }, [debounced, props.open])

  const navItems: PaletteItem[] = NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => {
      const Icon = item.icon
      return {
        id: `nav:${item.id}`,
        group: t('command.navigation'),
        label: t(item.labelKey),
        hint: group.labelKey === 'nav.groupMemory' ? t('command.memoryGroup') : t('command.systemGroup'),
        icon: <Icon size={14} />,
        run: () => props.onNavigate(item.id),
      }
    }),
  )

  const actionItems: PaletteItem[] = [
    {
      id: 'action:refresh',
      group: t('command.actions'),
      label: t('common.refresh'),
      hint: t('command.refreshHint'),
      icon: <IconRefresh size={14} />,
      run: () => { props.onChanged(); props.toast(t('common.refreshed'), 'success') },
    },
    {
      id: 'action:doctor',
      group: t('command.actions'),
      label: t('recovery.doctor'),
      hint: t('command.doctorHint'),
      icon: <IconShield size={14} />,
      run: () => {
        api.doctor(true)
          .then((report) => { props.toast(interpolate(t('overview.doctorDone'), { n: report.rebuilt.length }), 'success'); props.onChanged() })
          .catch((cause: Error) => props.toast(cause.message, 'danger'))
      },
    },
    {
      id: 'action:export',
      group: t('command.actions'),
      label: t('recovery.export'),
      hint: t('command.exportHint'),
      icon: <IconDownload size={14} />,
      run: () => {
        api.exportZip(false)
          .then((result) => props.toast(`${t('recovery.exported')} · ${result.files} files`, 'success'))
          .catch((cause: Error) => props.toast(cause.message, 'danger'))
      },
    },
  ]

  const entryItems: PaletteItem[] = results.map((entry) => ({
    id: `entry:${entry.id}`,
    group: t('command.memories'),
    label: entry.title,
    hint: [kindLabel(t, entry.kind), entry.summary].filter(Boolean).join(' · '),
    icon: <IconBook size={14} />,
    run: () => props.onOpen(entry.id),
  }))

  const needle = query.trim().toLowerCase()
  const filterItems = (items: PaletteItem[]) =>
    needle ? items.filter((item) => `${item.label} ${item.hint ?? ''}`.toLowerCase().includes(needle)) : items
  const items = needle ? [...entryItems, ...filterItems(navItems), ...filterItems(actionItems)] : [...navItems, ...actionItems]
  const activeItem = items[Math.min(active, Math.max(0, items.length - 1))]

  useEffect(() => { setActive(0) }, [query, results.length])

  if (!props.open) return null

  const runItem = (item: PaletteItem) => {
    item.run()
    props.onClose()
  }

  return (
    <div className="gam-overlay" data-align="top" onMouseDown={(event) => { if (event.target === event.currentTarget) props.onClose() }}>
      <div className="gam-command" role="dialog" aria-modal="true" aria-label={t('command.title')}>
        <div className="gam-command-inputrow">
          <IconSearch size={16} className="gam-faint" />
          <input
            ref={inputRef}
            className="gam-input"
            value={query}
            placeholder={t('command.placeholder')}
            aria-label={t('command.placeholder')}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActive((value) => Math.min(items.length - 1, value + 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActive((value) => Math.max(0, value - 1))
              } else if (event.key === 'Enter') {
                event.preventDefault()
                if (activeItem) runItem(activeItem)
              } else if (event.key === 'Escape') {
                event.preventDefault()
                props.onClose()
              }
            }}
          />
          {searching ? <Spinner /> : <Kbd>esc</Kbd>}
        </div>
        <div className="gam-command-list">
          {items.length === 0 ? (
            <div className="gam-empty" style={{ padding: '32px 16px' }}>
              <div className="gam-empty-title">{t('command.noResults')}</div>
              <div className="gam-empty-desc">{t('command.noResultsDesc')}</div>
            </div>
          ) : (
            items.map((item, index) => {
              const showGroup = index === 0 || items[index - 1]?.group !== item.group
              return (
                <div key={item.id}>
                  {showGroup ? <div className="gam-command-section">{item.group}</div> : null}
                  <button
                    type="button"
                    className={cx('gam-command-item', index === Math.min(active, items.length - 1) && 'is-active')}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => runItem(item)}
                  >
                    <span className="gam-command-icon">{item.icon}</span>
                    <span className="gam-command-label">
                      <b>{item.label}</b>
                      {item.hint ? <span>{item.hint}</span> : null}
                    </span>
                    <span className="gam-command-hint"><IconChevronRight size={12} /></span>
                  </button>
                </div>
              )
            })
          )}
        </div>
        <div className="gam-command-foot">
          <span><Kbd>↑</Kbd><Kbd>↓</Kbd>{t('command.select')}</span>
          <span><Kbd>↵</Kbd>{t('command.open')}</span>
          <span><Kbd>esc</Kbd>{t('command.close')}</span>
          <span className="gam-spacer" />
          <span>{shortcutLabel()}</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 会话内写入确认卡
// ---------------------------------------------------------------------------

export function WriteConfirmCard(props: { t: Translate }): ReactNode {
  ensureStyles()
  const t = props.t
  const [items, setItems] = useState<PendingView[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [queueOpen, setQueueOpen] = useState(false)
  const now = useTicker(1000, items.length > 0)

  useEffect(() => {
    const load = () => {
      if (document.hidden) return
      api.pending()
        .then((result) => setItems(result.items))
        .catch(() => {})
    }
    load()
    const timer = window.setInterval(load, 1800)
    return () => window.clearInterval(timer)
  }, [])

  const item = items[0]
  if (!item) return null

  const decide = (target: PendingView, action: 'accept' | 'reject') => {
    setBusyId(target.id)
    api.decidePending(target.id, action)
      .then(() => setItems((prev) => prev.filter((entry) => entry.id !== target.id)))
      .catch(() => {})
      .finally(() => setBusyId(null))
  }

  const created = new Date(item.createdAt).getTime()
  const total = Math.max(1, item.expiresAt - (Number.isNaN(created) ? Date.now() : created))
  const remaining = Math.max(0, item.expiresAt - now)
  const fraction = Math.max(0, Math.min(1, remaining / total))
  const seconds = Math.max(0, Math.ceil(remaining / 1000))
  const sameText = item.candidate.summary.trim() === item.candidate.title.trim()

  return (
    <div className="gam-confirm-scope">
      <div className="gam-confirm" role="group" aria-label={t('confirm.prompt')} aria-live="polite" title={item.decision.reason || undefined}>
        <div className="gam-confirm-top">
          <span className="gam-confirm-icon"><IconSparkle size={13} /></span>
          <span className="gam-confirm-title">{t('confirm.prompt')}</span>
          <KindBadge kind={item.candidate.kind} t={t} />
          <span className="gam-tag">{item.candidate.source}</span>
          {items.length > 1 ? (
            <button type="button" className="gam-chip" style={{ minHeight: 22, padding: '0 7px', fontSize: 10.5 }} onClick={() => setQueueOpen(true)}>
              {interpolate(t('confirm.more'), { n: items.length - 1 })}
            </button>
          ) : null}
          <span className="gam-spacer" />
          <span className="gam-confirm-reason">{interpolate(t('confirm.autoDismiss'), { n: seconds })}</span>
        </div>
        <div className="gam-confirm-main">
          <div className="gam-confirm-text">
            <div className="gam-confirm-body">{item.candidate.title}</div>
            {!sameText && item.candidate.summary ? <div className="gam-confirm-sum">{item.candidate.summary}</div> : null}
          </div>
          <div className="gam-confirm-actions">
            <Button size="sm" variant="ghost" disabled={busyId === item.id} onClick={() => decide(item, 'reject')}>
              {t('confirm.reject')}
            </Button>
            <Button size="sm" variant="primary" disabled={busyId === item.id} onClick={() => decide(item, 'accept')}>
              {t('confirm.accept')}
            </Button>
          </div>
        </div>
        <div className="gam-countdown"><i style={{ width: `${fraction * 100}%` }} /></div>
      </div>

      <Dialog
        open={queueOpen}
        title={t('confirm.queueTitle')}
        description={t('confirm.queueDesc')}
        onClose={() => setQueueOpen(false)}
        closeLabel={t('common.close')}
        size="wide"
      >
        <PendingRows items={items} t={t} busyId={busyId} onDecide={decide} />
      </Dialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 工具与边界
// ---------------------------------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

class Boundary extends Component<{ label: string; t: Translate; children?: ReactNode }, { error: Error | null }> {
  override state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error }
  }

  override render(): ReactNode {
    if (this.state.error) {
      const t = this.props.t
      return (
        <div className="gam-page">
          <PageHeader title={t('panel.error')} />
          <ErrorState
            title={t('panel.error')}
            message={`${this.props.label}: ${this.state.error.message}`}
            retryLabel={t('panel.retry')}
            onRetry={() => this.setState({ error: null })}
          />
        </div>
      )
    }
    return this.props.children
  }
}
