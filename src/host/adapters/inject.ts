import type { MemoryService } from '../api.js'
import type { HostContext } from '../types.js'
import type { Entry, MemoryConfig } from '../model.js'
import { renderAlwaysLayer } from '../recall.js'
import { projectSlug } from '../paths.js'

/**
 * 注入管线。两条通道，刻意分开：
 *
 * 1. 常驻层 → `ctx.systemPrompt.context()`。**不用 `section()`**：section 改动会触发
 *    system prompt 面替换，直接击穿 DeepSeek 前缀缓存；context 是 cache-safe 的，
 *    仅在内容变化或 compaction 移除后追加一条 durable 快照。
 * 2. 目录层 → `agent/pre-step` waterfall 改写 messages。**不落盘为新 session 事件**，
 *    所以不会膨胀会话日志。
 *
 * ⚠️ `turn/*`、`compaction/*` 是持久化 session 事件类型，不是同名 Cordis 事件，
 * 必须监听 `session/event` 再判 `event.type`。
 */
export function registerInjection(ctx: HostContext, api: MemoryService, config: MemoryConfig): () => void {
  if (!config.inject.enabled) return () => {}
  const disposers: Array<() => void> = []

  // --- 常驻层 -------------------------------------------------------------
  let alwaysText = ''
  let alwaysDispose: (() => void) | null = null
  // 注册期能力不能在 apply 时假设服务已就绪；等 systemPrompt 激活后再接常驻层。
  // 目录层（agent/pre-step）只依赖核心事件，不跟着一起等。
  let systemPrompt: HostContext['systemPrompt']
  const syncAlwaysLayer = (): void => {
    if (!systemPrompt?.context) return
    const next = renderAlwaysLayer(api.list(), config.budget.alwaysChars)
    if (next === alwaysText) return // 内容没变就不动，保住前缀缓存
    alwaysDispose?.()
    alwaysText = next
    if (alwaysText.length === 0) {
      alwaysDispose = null
      return
    }
    alwaysDispose = systemPrompt.context({
      name: 'general-memory',
      order: systemPrompt.getContextOrder?.('runtime-context') ?? 900,
      text: alwaysText,
      required: false,
    }) as () => void
  }

  ctx.inject(['systemPrompt'], (scoped) => {
    systemPrompt = scoped.get('systemPrompt') as HostContext['systemPrompt']
    syncAlwaysLayer()
  })

  // --- 会话事件：真人到场检测 + compaction 后重排节流 ----------------------
  const humanPending = new Set<string>()
  /** 最近被工具触碰过的文件路径，按会话保留最近 20 个，用于 activation=glob 匹配 */
  const touched = new Map<string, string[]>()
  if (typeof ctx.on === 'function') {
    disposers.push(
      ctx.on('session/event', ((session: unknown, event: SessionEvent) => {
        const key = sessionKeyOf(session)
        if (event?.type === 'user/message' && isUserMessage(event)) humanPending.add(key)
        // compaction 会移除已注入的 durable 快照 → 下一次必须给完整版
        if (event?.type === 'compaction/start' || event?.type === 'compaction/end') api.throttles.get(key)?.reset()
        if (event?.type === 'turn/end') {
          // hits 延迟刷盘：立刻写回条目会让下一次渲染指纹变化（原则 P4）
          void api.flushHits()
        }
        if (event?.type === 'tool/call') {
          const paths = extractTouchedPaths(event)
          if (paths.length > 0) touched.set(key, [...(touched.get(key) ?? []), ...paths].slice(-20))
        }
      }) as never) as () => void,
    )
  }

  // --- 目录层：agent/pre-step waterfall -----------------------------------
  if (typeof ctx.on === 'function') {
    disposers.push(
      ctx.on('agent/pre-step', ((...args: unknown[]) => {
        // waterfall 契约：不拥有决策时必须 return next()；改写时必须 spread，
        // 否则 startsRequestSeries 之类的字段会丢。
        // ⚠️ 形状与预期不符时**恒等返回**——返回 undefined 会把 agent 的决策链冲掉，
        //    那比「这一轮没注入记忆」严重得多。
        const incoming = args[0]
        const next = args[1]
        const decision = typeof next === 'function' ? (next as () => unknown)() : incoming
        if (!decision || typeof decision !== 'object') return decision

        const messages = (decision as { messages?: unknown }).messages
        if (!Array.isArray(messages)) return decision

        const key = sessionKeyOf((decision as { session?: unknown }).session)
        const humanPresent = humanPending.has(key)
        humanPending.delete(key)

        const throttle = api.throttleFor(key)
        const mode = throttle.next({ ready: api.ready, humanPresent })
        const globMatches = globMatchesFor(api, decision, touched.get(key) ?? [])
        const snapshot = api.snapshotFor(key, { mode, project: projectOf(decision), globMatches })
        if (snapshot.text.length === 0) return decision

        // 注入占比遥测（面板预算水位的数据源）
        const total = measureTotal(ctx, decision)
        if (total > 0) api.setRequestShare(snapshot.tokens / total)

        return {
          ...(decision as object),
          messages: [...messages, { role: 'user', content: [{ type: 'text', text: snapshot.text }], source: { kind: 'general-memory' } }],
        }
      }) as never) as () => void,
    )
  }

  // 条目变化后刷新常驻层（写入/失效/导入都会触发 refresh）
  disposers.push(api.onChange(syncAlwaysLayer))

  return () => {
    for (const dispose of disposers) dispose()
    alwaysDispose?.()
  }
}

interface SessionEvent {
  type?: string
  data?: unknown
}

function isUserMessage(event: SessionEvent): boolean {
  const source = (event.data as { source?: { kind?: unknown } } | undefined)?.source
  return source?.kind === 'user'
}

function sessionKeyOf(session: unknown): string {
  if (typeof session === 'string') return session
  if (session && typeof session === 'object') {
    const candidate = (session as { id?: unknown }).id
    if (typeof candidate === 'string') return candidate
  }
  return 'default'
}

/** 会话 cwd → 项目 slug，用于把 project 作用域的记忆纳入目录层 */
function projectOf(decision: unknown): string | undefined {
  const cwd = cwdOf(decision)
  return cwd ? projectSlug(cwd) : undefined
}

function cwdOf(decision: unknown): string | undefined {
  const candidates = [
    (decision as { session?: { cwd?: unknown } })?.session?.cwd,
    (decision as { cwd?: unknown })?.cwd,
    (decision as { agent?: { cwd?: unknown } })?.agent?.cwd,
  ]
  for (const candidate of candidates) if (typeof candidate === 'string' && candidate.startsWith('/')) return candidate
  return undefined
}

/**
 * glob 命中的条目（activation=glob）。
 * 匹配面 = 会话 cwd + 最近被工具触碰过的文件路径。路径来自 tool/call 事件，
 * 提取不到就没有 glob 注入 —— fail-safe，宁可少注入也不注入无关内容。
 */
function globMatchesFor(api: MemoryService, decision: unknown, touched: string[]): Entry[] {
  const cwd = cwdOf(decision)
  const surfaces = cwd ? [cwd, ...touched] : touched
  if (surfaces.length === 0) return []
  const out: Entry[] = []
  for (const entry of api.list()) {
    if (entry.meta.activation !== 'glob' || entry.meta.temporal.invalidatedAt !== null) continue
    if (entry.meta.globs.some((pattern) => surfaces.some((surface) => matchGlob(pattern, surface, cwd)))) out.push(entry)
  }
  return out
}

/** 极简 glob：支持 `**`、`*`、`?`。路径先相对 cwd 归一化再匹配。 */
export function matchGlob(pattern: string, target: string, cwd?: string): boolean {
  const relative = cwd && target.startsWith(cwd) ? target.slice(cwd.length).replace(/^\//, '') : target.replace(/^\//, '')
  const rx = new RegExp(
    `^${pattern
      .split('/')
      .map((segment) => {
        if (segment === '**') return '.*'
        return segment.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]')
      })
      .join('/')}$`,
  )
  return rx.test(relative) || rx.test(target)
}

/**
 * 从 tool/call 事件里捞出文件路径参数。
 * 只认「键名像路径 + 值是以 / 开头的绝对路径」的组合 —— 既不误收命令串，
 * 也不需要知道各家工具的确切 payload 形状。
 */
export function extractTouchedPaths(event: { type?: string; data?: unknown }): string[] {
  const out: string[] = []
  const PATH_KEY = /^(file_path|filePath|path|target|notebook_path)$/
  const walk = (value: unknown, key: string | undefined, depth: number): void => {
    if (depth > 5 || value === null || value === undefined) return
    if (typeof value === 'string') {
      if (key !== undefined && PATH_KEY.test(key) && value.startsWith('/') && value.length < 4096) out.push(value)
      return
    }
    if (Array.isArray(value)) {
      for (const item of value.slice(0, 20)) walk(item, key, depth + 1)
      return
    }
    if (typeof value === 'object') {
      for (const [childKey, child] of Object.entries(value as Record<string, unknown>).slice(0, 60)) {
        walk(child, childKey, depth + 1)
      }
    }
  }
  walk(event.data, undefined, 0)
  return out
}

function measureTotal(ctx: HostContext, decision: unknown): number {
  const meter = ctx.get('tokenMeter') as HostContext['tokenMeter']
  if (!meter?.measure) return 0
  const session = (decision as { session?: unknown })?.session
  if (!session) return 0
  try {
    return meter.measure(session, (decision as { requestHeader?: unknown }).requestHeader)?.totalTokens ?? 0
  } catch {
    return 0
  }
}
