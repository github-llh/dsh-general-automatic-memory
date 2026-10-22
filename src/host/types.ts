/**
 * dsh 宿主服务的薄契约声明。
 *
 * 为什么不直接 import @deepseek-ai/dsh-*：这些包在 npm 上只有 0.0.1-rc.x 占位版本，
 * 真代码随 app.asar 分发、且**不附带 .d.ts**（313 个包里 0 个）。所以这里按 0.2.1-rc.2
 * 各包 README 的口径声明我们用到的最小子集，全部调用收敛在 src/host/adapters/**。
 * 上游破坏性变更只需要改这一层。
 */

export type Dict<T = unknown> = Record<string, T>

export interface Disposable {
  (): void
}

export interface HostLogger {
  info(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
  success(...args: unknown[]): void
}

/** ctx.tools.register 接受的裸 ToolDefinition（dsh-tools 也接受 defineTool 的产物） */
export interface ToolDefinition {
  name: string
  description: string
  parameters: Dict
  output?: { schema: Dict }
  execute(args: Dict, exec: ToolExec): unknown | Promise<unknown>
}

export interface ToolExec {
  signal: AbortSignal
  sessionId?: string
  [key: string]: unknown
}

export interface CommandInvocation {
  agent: unknown
  rawInput: string
  invocation?: unknown
  [key: string]: unknown
}

export interface CommandDefinition {
  name: string
  description: string
  input?: { hint?: string }
  recordInput?: boolean
  handler(invocation: CommandInvocation): CommandResult | Promise<CommandResult>
}

export type CommandResult = { kind: 'success'; text?: string } | { kind: 'error'; text?: string }

/** ctx.systemPrompt.context —— cache-safe，仅在内容变化或 compaction 移除后追加 durable 快照 */
export interface PromptContext {
  name: string
  order: number
  text: string
  required?: boolean
}

export interface WebRoute {
  kind: 'exact'
  path: string
  handler(req: WebRequest, res:WebResponse): void | Promise<void>
}

export interface WebRequest {
  method: string
  url: string
  headers: Dict<string | string[] | undefined>
  [key: string]: unknown
}

export interface WebResponse {
  statusCode: number
  setHeader(name: string, value: string | number): void
  end(chunk?: string): void
}

/**
 * agent/pre-step 是 waterfall：不拥有决策时必须 return next()；
 * 改写时必须 spread（`{ ...decision, messages }`），否则 startsRequestSeries 等字段丢失。
 */
export type WaterfallNext<T> = () => T
export type PreStepDecision = { messages?: unknown[]; [key: string]: unknown }

export interface HostContext {
  logger: HostLogger
  effect(execute: () => void | Disposable, label?: string): unknown
  on(name: string, listener: (...args: never[]) => unknown): Disposable
  get(name: string, strict?: boolean): unknown
  /** 等待依赖服务激活后再执行；注册期能力必须走这里，不要在 apply 时假设服务已就绪 */
  inject(deps: string[], callback: (scoped: HostContext) => unknown): unknown
  provide?(name: string, value: unknown): Disposable

  tools?: { register(definition: ToolDefinition): Disposable }
  commands?: { register(definition: CommandDefinition): Disposable }
  systemPrompt?: {
    context(section: PromptContext): Disposable
    section?(section: { name: string; order: number; text: string }): Disposable
    getContextOrder?(name: string): number
  }
  webServer?: { register(route: WebRoute): Disposable }
  tokenMeter?: {
    measure(session: unknown, requestHeader?: unknown): { totalTokens: number; surfaceTokens?: number }
    estimateMessage?(message: unknown): number
  }
  setTimeout?(fn: () => void, ms: number): Disposable
  setInterval?(fn: () => void, ms: number): Disposable

  [service: string]: unknown
}
