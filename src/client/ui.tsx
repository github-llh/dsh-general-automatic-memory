import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'

let dialogSeq = 0

export type Translate = (key: string) => string
export type Tone = 'neutral' | 'accent' | 'danger' | 'warn' | 'success'

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

// ---------------------------------------------------------------------------
// 图标：全部单色 currentColor，不引入图标库
// ---------------------------------------------------------------------------

interface IconProps {
  size?: number
  className?: string
}

function Svg(props: IconProps & { children: ReactNode; viewBox?: string; fill?: boolean }): ReactNode {
  const size = props.size ?? 16
  return (
    <svg
      className={props.className}
      viewBox={props.viewBox ?? '0 0 24 24'}
      width={size}
      height={size}
      fill={props.fill ? 'currentColor' : 'none'}
      stroke={props.fill ? 'none' : 'currentColor'}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {props.children}
    </svg>
  )
}

export const IconMemory = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4.5h10.5L19 8v11.5H5z" />
    <path d="M15.5 4.5V8H19" />
    <circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="16" r="1.1" fill="currentColor" stroke="none" />
    <path d="M9 12l6 4" opacity=".55" />
  </Svg>
)
export const IconDashboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="4.5" rx="1.5" />
    <rect x="13" y="11" width="7" height="9" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
  </Svg>
)
export const IconBook = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 5.5A2.5 2.5 0 017 3h12.5v17H7a2.5 2.5 0 00-2.5 2.5z" />
    <path d="M4.5 5.5V22" opacity=".45" />
    <path d="M8 7.5h8M8 11h6" />
  </Svg>
)
export const IconImport = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v11" />
    <path d="M8 10l4 4 4-4" />
    <path d="M4 16.5V20h16v-3.5" />
  </Svg>
)
export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
)
export const IconGraph = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6" cy="6.5" r="2.2" />
    <circle cx="18" cy="7" r="2.2" />
    <circle cx="12" cy="18" r="2.2" />
    <path d="M8 7.5l7.8 8.6M16.4 8.5l-3 7.2M8.1 7l3.2 8.7" opacity=".7" />
  </Svg>
)
export const IconAudit = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3.5h12v17H6z" />
    <path d="M9 8h6M9 12h6M9 16h4" />
  </Svg>
)
export const IconRecovery = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 12a7.5 7.5 0 101.8-4.9" />
    <path d="M4.5 4.5V9H9" />
    <path d="M12 8.5V12l2.5 1.5" />
  </Svg>
)
export const IconSettings = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Svg>
)
export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l4.5 4.5" />
  </Svg>
)
export const IconCommand = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6.5A2.5 2.5 0 106.5 9H9zm0 0V9m0 0h6m-6 0v6m6-6A2.5 2.5 0 1117.5 9H15zm0 0v6m0-6h-6m6 6A2.5 2.5 0 1117.5 15H15zm0 0h-6m0 0A2.5 2.5 0 116.5 15H9z" />
  </Svg>
)
export const IconRefresh = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12a7 7 0 11-2-4.9" />
    <path d="M19 4v4.5h-4.5" />
  </Svg>
)
export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)
export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Svg>
)
export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4L21 20H3z" />
    <path d="M12 9v5M12 17.2v.1" />
  </Svg>
)
export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8v.1" />
  </Svg>
)
export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)
export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
)
export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 9l7 7 7-7" />
  </Svg>
)
export const IconChevronLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
)
export const IconCopy = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8" y="8" width="11" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2h2" />
  </Svg>
)
export const IconEdit = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4l11-11-4-4L4 16z" />
    <path d="M13.5 6.5l4 4" />
  </Svg>
)
export const IconSave = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4h11l3 3v13H5z" />
    <path d="M8 4v6h8V4M8 20v-6h8v6" />
  </Svg>
)
export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13" />
    <path d="M10 11v5M14 11v5" />
  </Svg>
)
export const IconUpload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 16V5" />
    <path d="M8 9l4-4 4 4" />
    <path d="M4 16.5V20h16v-3.5" />
  </Svg>
)
export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v11" />
    <path d="M8 11l4 4 4-4" />
    <path d="M4 17v3h16v-3" />
  </Svg>
)
export const IconFile = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3.5h8l4 4v13H6z" />
    <path d="M14 3.5v4h4" />
  </Svg>
)
export const IconUndo = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9h9a6 6 0 010 12h-3" />
    <path d="M8 5L4 9l4 4" />
  </Svg>
)
export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
)
export const IconSparkle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
    <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" />
  </Svg>
)
export const IconFolder = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 6.5h6l2 2h9v11h-17z" />
  </Svg>
)
export const IconList = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4.5 6h.1M4.5 12h.1M4.5 18h.1" />
  </Svg>
)
export const IconGraphView = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6" cy="6" r="1.7" />
    <circle cx="18" cy="6" r="1.7" />
    <circle cx="12" cy="18" r="1.7" />
    <path d="M7.5 7l3.5 9M16.5 7l-3.5 9M7.7 6h8.6" />
  </Svg>
)
export const IconExternal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 5h6v6" />
    <path d="M19 5l-8 8" />
    <path d="M19 14v5H5V5h5" />
  </Svg>
)
export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Svg>
)
export const IconPause = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5v14M15 5v14" />
  </Svg>
)

// ---------------------------------------------------------------------------
// 基础元件
// ---------------------------------------------------------------------------

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  icon?: ReactNode
}

export function Button(props: ButtonProps): ReactNode {
  const { variant = 'secondary', size = 'md', icon, className, children, type = 'button', ...rest } = props
  return (
    <button {...rest} type={type} className={cx('gam-btn', className)} data-variant={variant} data-size={size}>
      {icon}
      {children}
    </button>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  icon: ReactNode
  size?: 'sm' | 'md'
  tone?: 'default' | 'danger'
}

export function IconButton(props: IconButtonProps): ReactNode {
  const { label, icon, size = 'md', tone = 'default', className, type = 'button', ...rest } = props
  return (
    <button
      {...rest}
      type={type}
      className={cx('gam-iconbtn', className)}
      data-size={size}
      data-tone={tone}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  )
}

export function Badge(props: { children: ReactNode; tone?: Tone; dot?: boolean; className?: string }): ReactNode {
  return (
    <span className={cx('gam-badge', props.className)} data-tone={props.tone ?? 'neutral'}>
      {props.dot ? <i /> : null}
      {props.children}
    </span>
  )
}

export function kindLabel(t: Translate, kind: string): string {
  const key = `kind.${kind}`
  const label = t(key)
  return label === key ? kind : label
}

export function KindBadge(props: { kind: string; t: Translate }): ReactNode {
  return <span className="gam-badge gam-kindbadge">{kindLabel(props.t, props.kind)}</span>
}

export function Kbd(props: { children: ReactNode }): ReactNode {
  return <kbd className="gam-kbd">{props.children}</kbd>
}

export function PageHeader(props: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}): ReactNode {
  return (
    <header className="gam-pagehead">
      <div className="gam-pagehead-main">
        {props.eyebrow ? <p className="gam-eyebrow">{props.eyebrow}</p> : null}
        <h1 className="gam-pagetitle">{props.title}</h1>
        {props.description ? <p className="gam-pagedesc">{props.description}</p> : null}
      </div>
      {props.actions ? <div className="gam-pageactions">{props.actions}</div> : null}
    </header>
  )
}

export function Card(props: {
  title?: ReactNode
  hint?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  flat?: boolean
}): ReactNode {
  return (
    <section className={cx('gam-card', props.className)} data-flat={props.flat ? 'true' : undefined}>
      {props.title || props.actions ? (
        <div className="gam-cardhead">
          <div>
            {props.title ? <h3 className="gam-cardtitle">{props.title}</h3> : null}
            {props.hint ? <p className="gam-cardhint">{props.hint}</p> : null}
          </div>
          {props.actions ? <div className="gam-card-actions">{props.actions}</div> : null}
        </div>
      ) : null}
      {props.children}
    </section>
  )
}

export function SkeletonList(props: { rows?: number }): ReactNode {
  const rows = props.rows ?? 5
  return (
    <div className="gam-listcard" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div className="gam-rowitem" key={index} data-static="true">
          <div className="gam-rowitem-main">
            <div className="gam-skeleton gam-skeletonline" style={{ width: `${38 + ((index * 17) % 34)}%` }} />
            <div className="gam-skeleton gam-skeletonline" style={{ width: `${64 + ((index * 11) % 22)}%`, height: 9 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Spinner(): ReactNode {
  return <span className="gam-spinner" aria-hidden="true" />
}

export function EmptyState(props: {
  icon?: ReactNode
  title: string
  description?: string
  actions?: ReactNode
}): ReactNode {
  return (
    <div className="gam-empty">
      <div className="gam-empty-icon">{props.icon ?? <IconMemory size={20} />}</div>
      <div className="gam-empty-title">{props.title}</div>
      {props.description ? <p className="gam-empty-desc">{props.description}</p> : null}
      {props.actions ? <div className="gam-empty-actions">{props.actions}</div> : null}
    </div>
  )
}

export function ErrorState(props: { title: string; message: string; retryLabel: string; onRetry?: () => void }): ReactNode {
  return (
    <div className="gam-errorbox" role="alert">
      <div className="gam-error-title">{props.title}</div>
      <pre className="gam-pre">{props.message}</pre>
      {props.onRetry ? (
        <div className="gam-inline" style={{ marginTop: 10 }}>
          <Button size="sm" icon={<IconRefresh size={13} />} onClick={props.onRetry}>
            {props.retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function Meter(props: { value: number; tone?: 'accent' | 'warn' | 'danger' | 'success'; large?: boolean }): ReactNode {
  const pct = Math.max(0, Math.min(1, Number.isFinite(props.value) ? props.value : 0)) * 100
  return (
    <div className={cx('gam-meter', props.large && 'gam-meter-lg')} data-tone={props.tone} role="presentation">
      <i style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Segmented<T extends string>(props: {
  value: T
  options: Array<{ value: T; label: ReactNode }>
  onChange: (value: T) => void
  ariaLabel: string
}): ReactNode {
  return (
    <div className="gam-chiprow" role="group" aria-label={props.ariaLabel}>
      {props.options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cx('gam-chip', props.value === option.value && 'is-active')}
          aria-pressed={props.value === option.value}
          onClick={() => props.onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  shortcut?: string
  clearLabel: string
}

export function SearchInput(props: SearchInputProps): ReactNode {
  const { value, onChange, shortcut, clearLabel, className, ...rest } = props
  return (
    <div className={cx('gam-inputwrap', className)}>
      <span className="gam-inputicon">
        <IconSearch size={14} />
      </span>
      <input {...rest} className="gam-input" type="search" value={value} onChange={(event) => onChange(event.target.value)} />
      {value ? (
        <span className="gam-inputclear">
          <IconButton size="sm" label={clearLabel} icon={<IconClose size={12} />} onClick={() => onChange('')} />
        </span>
      ) : shortcut ? (
        <span className="gam-inputkbd">
          <Kbd>{shortcut}</Kbd>
        </span>
      ) : null}
    </div>
  )
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}

export function SelectField(props: SelectFieldProps): ReactNode {
  const { value, onChange, options, className, ...rest } = props
  return (
    <span className={cx('gam-selectwrap', className)}>
      <select {...rest} className="gam-select" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="gam-select-chevron">
        <IconChevronDown size={13} />
      </span>
    </span>
  )
}

export function CopyButton(props: {
  text: string
  label: string
  copiedLabel: string
  size?: 'sm' | 'md'
  onCopied?: (ok: boolean) => void
  variant?: 'secondary' | 'ghost'
  children?: ReactNode
}): ReactNode {
  const [done, setDone] = useState(false)
  return (
    <Button
      size={props.size ?? 'sm'}
      variant={props.variant ?? 'ghost'}
      icon={done ? <IconCheck size={13} /> : <IconCopy size={13} />}
      title={props.label}
      onClick={async () => {
        const ok = await copyText(props.text)
        setDone(ok)
        props.onCopied?.(ok)
        if (ok) window.setTimeout(() => setDone(false), 1600)
      }}
    >
      {props.children ?? (done ? props.copiedLabel : props.label)}
    </Button>
  )
}

// ---------------------------------------------------------------------------
// 覆盖层
// ---------------------------------------------------------------------------

export function Dialog(props: {
  open: boolean
  title: string
  description?: string
  children?: ReactNode
  actions?: ReactNode
  onClose: () => void
  closeLabel: string
  size?: 'sm' | 'default' | 'wide'
  align?: 'center' | 'top'
}): ReactNode {
  const titleId = useRef(`gam-dialog-${++dialogSeq}`).current
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!props.open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        props.onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    const timer = window.setTimeout(() => panelRef.current?.focus(), 20)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer)
    }
  }, [props.open, props.onClose])

  if (!props.open) return null
  return (
    <div
      className="gam-overlay"
      data-align={props.align === 'top' ? 'top' : undefined}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) props.onClose()
      }}
    >
      <div
        className="gam-dialog"
        data-size={props.size ?? 'default'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="gam-dialog-head">
          <div className="gam-dialog-head-main">
            <h2 className="gam-dialog-title" id={titleId}>
              {props.title}
            </h2>
            {props.description ? <p className="gam-dialog-desc">{props.description}</p> : null}
          </div>
          <IconButton label={props.closeLabel} icon={<IconClose size={15} />} onClick={props.onClose} />
        </div>
        {props.children ? <div className="gam-dialog-body">{props.children}</div> : null}
        {props.actions ? <div className="gam-dialog-actions">{props.actions}</div> : null}
      </div>
    </div>
  )
}

export function ConfirmDialog(props: {
  open: boolean
  title: string
  description?: string
  children?: ReactNode
  confirmLabel: string
  cancelLabel: string
  closeLabel: string
  busy?: boolean
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}): ReactNode {
  // 键盘确认：Enter 在对话框空白处等于点“确认”；焦点在控件上时让浏览器自己处理。
  useEffect(() => {
    if (!props.open || props.busy) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return
      const target = event.target as HTMLElement | null
      if (target && /^(input|textarea|select|button|a)$/i.test(target.tagName)) return
      props.onConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [props.open, props.busy, props.onConfirm])

  return (
    <Dialog
      open={props.open}
      title={props.title}
      description={props.description}
      onClose={props.onClose}
      closeLabel={props.closeLabel}
      size="sm"
      actions={
        <>
          <Button variant="ghost" onClick={props.onClose} disabled={props.busy}>
            {props.cancelLabel}
          </Button>
          <Button variant={props.danger ? 'danger' : 'primary'} onClick={props.onConfirm} disabled={props.busy}>
            {props.busy ? <Spinner /> : null}
            {props.confirmLabel}
          </Button>
        </>
      }
    >
      {props.children}
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Markdown（安全渲染：只构造 React 节点，不使用 innerHTML）
// ---------------------------------------------------------------------------

export function Markdown(props: { text: string }): ReactNode {
  const lines = props.text.replace(/\r\n?/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0
  let key = 0

  const next = () => lines[index] ?? ''

  while (index < lines.length) {
    const line = next()

    if (/^```/.test(line.trim())) {
      const language = line.trim().slice(3).trim()
      index++
      const code: string[] = []
      while (index < lines.length && !/^```/.test(next().trim())) {
        code.push(next())
        index++
      }
      if (index < lines.length) index++
      blocks.push(
        <pre key={key++} data-language={language || undefined}>
          <code>{code.join('\n')}</code>
        </pre>,
      )
      continue
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      const level = (heading[1] ?? '#').length
      const content = inline(heading[2] ?? '', key++)
      if (level === 1) blocks.push(<h1 key={key++}>{content}</h1>)
      else if (level === 2) blocks.push(<h2 key={key++}>{content}</h2>)
      else blocks.push(<h3 key={key++}>{content}</h3>)
      index++
      continue
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\s*[-*]\s+/.test(next())) {
        items.push(next().replace(/^\s*[-*]\s+/, ''))
        index++
      }
      blocks.push(
        <ul key={key++}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inline(item, key++)}</li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length && /^\s*\d+\.\s+/.test(next())) {
        items.push(next().replace(/^\s*\d+\.\s+/, ''))
        index++
      }
      blocks.push(
        <ol key={key++}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{inline(item, key++)}</li>
          ))}
        </ol>,
      )
      continue
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      while (index < lines.length && /^>\s?/.test(next())) {
        quote.push(next().replace(/^>\s?/, ''))
        index++
      }
      blocks.push(<blockquote key={key++}>{inline(quote.join(' '), key++)}</blockquote>)
      continue
    }

    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push(<hr key={key++} />)
      index++
      continue
    }

    if (!line.trim()) {
      index++
      continue
    }

    const paragraph: string[] = []
    while (index < lines.length) {
      const current = next()
      if (!current.trim() || /^(#{1,3})\s+/.test(current) || /^\s*[-*]\s+/.test(current) || /^\s*\d+\.\s+/.test(current) || /^>\s?/.test(current) || /^```/.test(current.trim())) break
      paragraph.push(current)
      index++
    }
    blocks.push(<p key={key++}>{inline(paragraph.join(' '), key++)}</p>)
  }

  return <div className="gam-prose">{blocks}</div>
}

function inline(text: string, baseKey: number): ReactNode[] {
  const out: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\*[^*]+\*)/g
  let last = 0
  let match: RegExpExecArray | null
  let index = 0
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index))
    const token = match[0]
    const key = `${baseKey}-${index++}`
    if (token.startsWith('**')) out.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    else if (token.startsWith('`')) out.push(<code key={key}>{token.slice(1, -1)}</code>)
    else if (token.startsWith('[')) {
      const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(token)
      out.push(
        <a key={key} href={link?.[2]} target="_blank" rel="noreferrer noopener">
          {link?.[1] ?? token}
        </a>,
      )
    } else out.push(<em key={key}>{token.slice(1, -1)}</em>)
    last = match.index + token.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

export function interpolate(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (whole: string, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : whole,
  )
}

export function useDebounced<T>(value: T, delay = 220): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useTicker(intervalMs: number, enabled = true): number {
  const [tick, setTick] = useState(Date.now())
  useEffect(() => {
    if (!enabled) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setTick(Date.now())
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs, enabled])
  return tick
}

export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  const platform = navigator.platform || ''
  const ua = navigator.userAgent || ''
  return /Mac|iPhone|iPad|iPod/.test(platform) || /Mac OS X/.test(ua)
}

export function shortcutLabel(): string {
  return isMac() ? '⌘ K' : 'Ctrl K'
}

export function parseDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null
  // `YYYY-MM-DD` 在浏览器里按 UTC 解析，负时区会显示成前一天；补一个本地正午再解析。
  const source = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value
  const date = new Date(source)
  return Number.isNaN(date.getTime()) ? null : date
}

function locale(): string {
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language
  return 'zh-CN'
}

export function formatNumber(value: number): string {
  try {
    return new Intl.NumberFormat(locale()).format(value)
  } catch {
    return String(value)
  }
}

export function formatDate(value: string | number | Date | null | undefined, opts: Intl.DateTimeFormatOptions = {}): string {
  const date = parseDate(value)
  if (!date) return typeof value === 'string' ? value : '—'
  try {
    return new Intl.DateTimeFormat(locale(), { year: 'numeric', month: 'short', day: 'numeric', ...opts }).format(date)
  } catch {
    return date.toISOString().slice(0, 10)
  }
}

export function formatMonthDay(value: string | number | Date | null | undefined): string {
  const date = parseDate(value)
  if (!date) return typeof value === 'string' ? value : '—'
  try {
    return new Intl.DateTimeFormat(locale(), { month: 'short', day: 'numeric' }).format(date)
  } catch {
    return date.toISOString().slice(5, 10)
  }
}

export function formatTime(value: string | number | Date | null | undefined): string {
  const date = parseDate(value)
  if (!date) return typeof value === 'string' ? value.slice(11, 19) : '—'
  try {
    return new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date)
  } catch {
    return date.toISOString().slice(11, 19)
  }
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  const date = parseDate(value)
  if (!date) return typeof value === 'string' ? value : '—'
  return `${formatDate(date)} ${formatTime(date)}`
}

export function formatRelative(value: string | number | Date | null | undefined): string {
  const date = parseDate(value)
  if (!date) return '—'
  const diff = date.getTime() - Date.now()
  const abs = Math.abs(diff)
  try {
    const formatter = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' })
    if (abs < 60_000) return formatter.format(Math.round(diff / 1000), 'second')
    if (abs < 3_600_000) return formatter.format(Math.round(diff / 60_000), 'minute')
    if (abs < 86_400_000) return formatter.format(Math.round(diff / 3_600_000), 'hour')
    if (abs < 2_592_000_000) return formatter.format(Math.round(diff / 86_400_000), 'day')
    return formatDate(date)
  } catch {
    return formatDate(date)
  }
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function shortId(id: string, length = 8): string {
  return id.length <= length ? id : id.slice(0, length)
}

export function todayISO(): string {
  return localDay(new Date())
}

/** 本地时区的 `YYYY-MM-DD`：用户心智里的“今天”，不是 UTC 日期。 */
export function localDay(value: string | number | Date | null | undefined): string {
  const date = parseDate(value)
  if (!date) return typeof value === 'string' ? value : ''
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function shiftDay(iso: string, delta: number): string {
  const date = new Date(`${iso}T12:00:00`)
  date.setDate(date.getDate() + delta)
  return date.toISOString().slice(0, 10)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.top = '-1000px'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}
