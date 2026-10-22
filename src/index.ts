import { randomBytes } from 'node:crypto'
import { registerCommands } from './host/adapters/commands.js'
import { registerFeatures } from './host/adapters/features.js'
import { registerHttp, registerNonceRoute } from './host/adapters/http.js'
import { registerIngest } from './host/adapters/ingest.js'
import { Ingestor } from './host/ingest/index.js'
import { ImportService } from './host/importers/index.js'
import { registerInjection } from './host/adapters/inject.js'
import { registerTools } from './host/adapters/tools.js'
import { MemoryService } from './host/api.js'
import type { MemoryConfig } from './host/model.js'
import { resolveMemoryRoot } from './host/paths.js'
import type { HostContext } from './host/types.js'
import { Config, DEFAULT_CONFIG } from './config.js'

export { Config }
export const name = 'general-memory'

/**
 * 刻意**不**导出 `inject`：写进 inject 的服务未就绪时插件永不激活。
 * 所有 dsh 服务我们都按可选处理（adapter 内部自己判存在性），
 * 这样即使上游改了服务名，插件也只是降级而不是彻底不加载。
 */
export function apply(ctx: HostContext, config: MemoryConfig): void {
  const merged: MemoryConfig = deepMerge(DEFAULT_CONFIG, config ?? {})
  const root = resolveMemoryRoot(merged.memoryRoot)
  // 面板加载时取一次，写操作必须带回来（同源页面里的其他脚本拿不到）
  const nonce = randomBytes(16).toString('hex')

  ctx.effect(() => {
    let disposed = false
    const disposers: Array<() => void> = []

    void (async () => {
      try {
        const api = await MemoryService.create(merged, root)
        if (disposed) return
        const ingestor = new Ingestor(api, merged, ctx)
        const importer = new ImportService(api, ingestor, merged)
        disposers.push(
          registerTools(ctx, api, merged),
          registerCommands(ctx, api),
          registerInjection(ctx, api, merged),
          registerHttp(ctx, api, nonce),
          registerNonceRoute(ctx, nonce),
          registerIngest(ctx, ingestor, merged),
          registerFeatures(ctx, nonce, { api, ingestor, importer }),
        )
        // 暴露给其他插件（例如未来的团队同步插件），也让 cordis_inspect 能看到
        ctx.provide?.('generalMemory', api)
        const stats = await api.stats()
        ctx.logger?.info?.(`[general-memory] ready · ${root} · ${stats.entryCount} entries · index ${stats.index.lines}/${stats.index.maxLines} lines`)
      } catch (cause) {
        ctx.logger?.error?.(`[general-memory] failed to start: ${(cause as Error).message}`)
      }
    })()

    return () => {
      disposed = true
      for (const dispose of disposers) dispose()
    }
  }, 'general-memory:boot')
}

/** config 是整体替换不深合并（Loader 语义），所以这里自己补全嵌套默认值 */
function deepMerge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base
  if (typeof base !== 'object' || base === null || Array.isArray(base)) return (override ?? base) as T
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (value === undefined) continue
    const current = out[key]
    out[key] = typeof current === 'object' && current !== null && !Array.isArray(current) ? deepMerge(current, value) : value
  }
  return out as T
}
