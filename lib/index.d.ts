import Schema from "@deepseek-ai/schemastery";
//#region src/host/model.d.ts
declare const WRITE_MODES: readonly ['auto', 'suggest', 'manual'];
type WriteMode = (typeof WRITE_MODES)[number];
interface MemoryConfig {
  memoryRoot: string;
  budget: {
    alwaysChars: number;
    catalogChars: number;
    recallChars: number;
    globChars: number;
    maxShareOfRequest: number;
    whiteboardChars: number;
  };
  inject: {
    enabled: boolean;
    fullEvery: number;
    slimEvery: number;
    showTurnTail: boolean;
  };
  ingest: {
    writeMode: WriteMode;
    autoKinds: string[];
    suggestTimeoutSec: number;
    llmExtract: boolean;
    dailyLlmCalls: number;
    burstThreshold: number;
    requireEvidence: boolean;
  };
  retrieval: {
    backend: 'l0' | 'l1' | 'auto';
    vectorEnabled: boolean;
    gateThreshold: number;
    recallLimit: number;
  };
  curator: {
    enabled: boolean;
    scheduleTime: string;
    consolidateEverySessions: number;
    promoteMinHits: number;
    episodeTtlDays: number;
    archiveAfterDays: number;
  };
  portability: {
    projections: Record<string, boolean>;
    importOnFirstRun: boolean;
    syncTransport: 'none' | 'git' | 'zip' | 'remote';
    syncConflictPolicy: 'ask' | 'prefer-local' | 'prefer-remote';
  };
  privacy: {
    sensitiveTopics: boolean;
    piiScan: boolean;
    sharePii: boolean;
    auditKeepDays: number;
  };
  toolSurface: 'minimal' | 'standard';
  advanced: {
    snapshotKeep: number;
    indexRebuildOnStart: boolean;
    shadowRetrieval: boolean;
  };
}
//#endregion
//#region src/host/types.d.ts
/**
 * dsh 宿主服务的薄契约声明。
 *
 * 为什么不直接 import @deepseek-ai/dsh-*：这些包在 npm 上只有 0.0.1-rc.x 占位版本，
 * 真代码随 app.asar 分发、且**不附带 .d.ts**（313 个包里 0 个）。所以这里按 0.2.1-rc.2
 * 各包 README 的口径声明我们用到的最小子集，全部调用收敛在 src/host/adapters/**。
 * 上游破坏性变更只需要改这一层。
 */
type Dict<T = unknown> = Record<string, T>;
interface Disposable {
  (): void;
}
interface HostLogger {
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  success(...args: unknown[]): void;
}
/** ctx.tools.register 接受的裸 ToolDefinition（dsh-tools 也接受 defineTool 的产物） */
interface ToolDefinition {
  name: string;
  description: string;
  parameters: Dict;
  /** dsh-tools 强制要求 render；缺了会直接拒绝注册 */
  output: {
    schema: Dict;
    render(args: Dict, value: unknown): Array<{
      type: 'text';
      text: string;
    }>;
  };
  execute(args: Dict, exec: ToolExec): unknown | Promise<unknown>;
}
interface ToolExec {
  signal: AbortSignal;
  sessionId?: string;
  [key: string]: unknown;
}
interface CommandInvocation {
  agent: unknown;
  rawInput: string;
  invocation?: unknown;
  [key: string]: unknown;
}
interface CommandDefinition {
  name: string;
  description: string;
  input?: {
    hint?: string;
  };
  recordInput?: boolean;
  handler(invocation: CommandInvocation): CommandResult | Promise<CommandResult>;
}
type CommandResult = {
  kind: 'success';
  text?: string;
} | {
  kind: 'error';
  text?: string;
};
/** ctx.systemPrompt.context —— cache-safe，仅在内容变化或 compaction 移除后追加 durable 快照 */
interface PromptContext {
  name: string;
  order: number;
  text: string | ((context: unknown) => string);
  required?: boolean;
}
interface WebRoute {
  kind: 'exact';
  path: string;
  handler(req: WebRequest, res: WebResponse): void | Promise<void>;
}
interface WebRequest {
  method: string;
  url: string;
  headers: Dict<string | string[] | undefined>;
  [key: string]: unknown;
}
interface WebResponse {
  statusCode: number;
  setHeader(name: string, value: string | number): void;
  end(chunk?: string): void;
}
interface HostContext {
  logger: HostLogger;
  effect(execute: () => void | Disposable, label?: string): unknown;
  on(name: string, listener: (...args: never[]) => unknown): Disposable;
  get(name: string, strict?: boolean): unknown;
  /** 等待依赖服务激活后再执行；注册期能力必须走这里，不要在 apply 时假设服务已就绪 */
  inject(deps: string[], callback: (scoped: HostContext) => unknown): unknown;
  provide?(name: string, value: unknown): Disposable;
  tools?: {
    register(definition: ToolDefinition): Disposable;
  };
  commands?: {
    register(definition: CommandDefinition): Disposable;
  };
  systemPrompt?: {
    context(section: PromptContext): Disposable;
    section?(section: {
      name: string;
      order: number;
      text: string;
    }): Disposable;
    getContextOrder?(name: string): number;
  };
  webServer?: {
    register(route: WebRoute): Disposable;
  };
  tokenMeter?: {
    measure(session: unknown, requestHeader?: unknown): {
      totalTokens: number;
      surfaceTokens?: number;
    };
    estimateMessage?(message: unknown): number;
  };
  setTimeout?(fn: () => void, ms: number): Disposable;
  setInterval?(fn: () => void, ms: number): Disposable;
  [service: string]: unknown;
}
//#endregion
//#region src/config.d.ts
interface Config extends MemoryConfig {}
declare const Config: Schema<MemoryConfig>;
//#endregion
//#region src/index.d.ts
declare const name = "general-memory";
/**
 * 刻意**不**导出 `inject`：写进 inject 的服务未就绪时插件永不激活。
 * 所有 dsh 服务我们都按可选处理（adapter 内部自己判存在性），
 * 这样即使上游改了服务名，插件也只是降级而不是彻底不加载。
 */
declare function apply(ctx: HostContext, config: MemoryConfig): void;
//#endregion
export { Config, apply, name };