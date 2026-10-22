import type { Ingestor } from '../ingest/index.js'
import type { MemoryConfig } from '../model.js'
import type { HostContext } from '../types.js'
import { conclusionOf, collectText } from '../ingest/extract.js'
import { projectSlug } from '../paths.js'

interface SessionBuffer {
  turn: number
  cwd?: string
  users: string[]
  assistants: unknown[]
}

/**
 * 自动写入的事件挂载。
 *
 * ⚠️ `turn/*`、`step/*`、`compaction/*` 是**持久化 session 事件类型，不是同名 Cordis 事件**，
 * 只能监听 `session/event` 再判 `event.type`（官方文档明确警告过）。
 *
 * 这里只做"攒上下文 → 交给 Ingestor"；所有抽取/门控/决策都在 ingest 里，
 * 保证实时路径与会话导入路径共用同一套逻辑。
 */
export function registerIngest(ctx: HostContext, ingestor: Ingestor, config: MemoryConfig): () => void {
  if (typeof ctx.on !== 'function') return () => {}
  const disposers: Array<() => void> = []
  const buffers = new Map<string, SessionBuffer>()
  /** 本会话实际使用的模型；LLM 兜底抽取必须跟着会话走，不能猜默认值 */
  const sessionModels = new Map<string, { provider: string; model: string }>()

  const bufferOf = (key: string): SessionBuffer => {
    let buffer = buffers.get(key)
    if (!buffer) {
      buffer = { turn: 0, users: [], assistants: [] }
      buffers.set(key, buffer)
    }
    return buffer
  }

  const flush = async (key: string, reason: 'turn' | 'rescue'): Promise<void> => {
    const buffer = buffers.get(key)
    if (!buffer || buffer.users.length === 0) return
    const snapshot = { ...buffer, users: [...buffer.users], assistants: [...buffer.assistants] }
    const model = sessionModels.get(key)
    buffers.set(key, { turn: buffer.turn + 1, users: [], assistants: [], ...(buffer.cwd ? { cwd: buffer.cwd } : {}) })
    try {
      const result = await ingestor.ingestTurn({
        sid: key,
        turn: snapshot.turn,
        ...(snapshot.cwd ? { cwd: snapshot.cwd } : {}),
        ...(model ? { model } : {}),
        userMessages: snapshot.users,
        assistantMessages: snapshot.assistants,
      })
      if (reason === 'rescue' && result.episodeId) {
        ctx.logger?.info?.(`[general-memory] compaction rescue → ${result.episodeId}`)
      }
    } catch (cause) {
      ctx.logger?.warn?.(`[general-memory] ingest failed: ${(cause as Error).message}`)
    }
  }

  disposers.push(
    ctx.on('session/event', ((session: unknown, event: { type?: string; data?: unknown }) => {
      const key = sessionKeyOf(session)
      // 会话工作目录：导入来源按用户的 workspace 扫，宿主进程 cwd 指不到那儿
      const cwd = (session as { cwd?: unknown } | null | undefined)?.cwd
      if (typeof cwd === 'string' && cwd.length > 0) ingestor.noteWorkspaceCwd(cwd)
      const type = event?.type ?? ''
      const data = (event?.data ?? {}) as Record<string, unknown>

      if (type === 'model/selection' || type === 'request/header') {
        const config = type === 'model/selection'
          ? data
          : (data.header as { config?: { provider?: unknown; model?: unknown } } | undefined)?.config
        const provider = config?.provider
        const model = config?.model
        if (typeof provider === 'string' && provider && typeof model === 'string' && model) {
          sessionModels.set(key, { provider, model })
        }
        return
      }
      if (type === 'turn/start') {
        const buffer = bufferOf(key)
        buffer.turn = typeof data.turn === 'number' ? data.turn : buffer.turn + 1
        return
      }
      if (type === 'user/message') {
        const text = collectText((data.message as unknown) ?? data)
        if (text) bufferOf(key).users.push(text)
        return
      }
      if (type === 'assistant/message') {
        const buffer = bufferOf(key)
        buffer.assistants.push(data.message ?? data)
        // 记录 cwd，供项目作用域判断
        if (!buffer.cwd) {
          const cwd = (session as { cwd?: unknown })?.cwd
          if (typeof cwd === 'string') buffer.cwd = cwd
        }
        return
      }
      if (type === 'turn/end') {
        void flush(key, 'turn')
        return
      }
      if (type === 'compaction/start') {
        // 压缩会永久丢掉这些消息 → 先抢救成 episode，再让 ingest 决定要不要升为长期记忆
        void flush(key, 'rescue')
        return
      }
      if (type === 'compaction/summary') {
        const summary = collectText(data.summary ?? data)
        const cwd = (session as { cwd?: unknown })?.cwd
        if (summary) {
          void ingestor.episodes.append(typeof cwd === 'string' ? projectSlug(cwd) : '_global', {
            sid: key,
            turn: 0,
            topic: '(compaction summary)',
            user: '',
            outcome: conclusionOf(summary) || summary.slice(0, 120),
            src: 'model-inferred',
          })
        }
      }
    }) as never) as () => void,
  )

  // 待确认提议的超时清理（15s 未操作 → 静默 NOOP）
  if (config.ingest.writeMode === 'suggest') {
    const timer = setInterval(() => {
      void ingestor.sweepPending().catch(() => {})
    }, 5000)
    if (typeof timer === 'object' && timer !== null && 'unref' in timer) (timer as { unref(): void }).unref()
    disposers.push(() => clearInterval(timer as unknown as ReturnType<typeof setInterval>))
  }

  return () => {
    for (const dispose of disposers) dispose()
  }
}

function sessionKeyOf(session: unknown): string {
  if (typeof session === 'string') return session
  if (session && typeof session === 'object') {
    const id = (session as { id?: unknown }).id
    if (typeof id === 'string') return id
  }
  return 'default'
}
