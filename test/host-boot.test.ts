import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { removeDir, waitForService } from './support.js'

// 刻意 import **构建产物**而不是 src：这条测试守的是"真正会被 dsh 加载的那个文件"
import { apply } from '../lib/index.js'
import { DEFAULT_CONFIG } from '../src/config.js'
import type { MemoryConfig } from '../src/host/model.js'

interface FakeState {
  tools: Array<{ name: string }>
  commands: Array<{ name: string }>
  contexts: Array<{ name: string; text: string | ((context: unknown) => string) }>
  routes: Array<{ path: string; handler: (req: unknown, res: unknown) => Promise<void> | void }>
  listeners: Map<string, Array<(...args: unknown[]) => unknown>>
  provided: Record<string, unknown>
  logs: string[]
}

/** Windows 下不关掉 SQLite 句柄就删不掉临时目录：统一在 afterEach 里回收 effect。 */
const activeDisposers: Array<() => void> = []

function trackEffect(fn: () => unknown): () => void {
  const result = fn()
  const dispose = typeof result === 'function' ? (result as () => void) : () => {}
  activeDisposers.push(dispose)
  return dispose
}

function makeCtx() {
  const state: FakeState = {
    tools: [],
    commands: [],
    contexts: [],
    routes: [],
    listeners: new Map(),
    provided: {},
    logs: [],
  }
  const services: Record<string, unknown> = {}
  const ctx = {
    logger: {
      info: (...args: unknown[]) => state.logs.push(args.join(' ')),
      warn: (...args: unknown[]) => state.logs.push(args.join(' ')),
      error: (...args: unknown[]) => state.logs.push(args.join(' ')),
      success: (...args: unknown[]) => state.logs.push(args.join(' ')),
    },
    effect: (fn: () => unknown) => trackEffect(fn),
    on: (event: string, listener: (...args: unknown[]) => unknown) => {
      const list = state.listeners.get(event) ?? []
      list.push(listener)
      state.listeners.set(event, list)
      return () => {}
    },
    get: (name: string) => services[name],
    inject: (deps: string[], callback: (scoped: unknown) => unknown) => {
      if (deps.every((dep) => services[dep] !== undefined)) callback(ctx)
      return () => {}
    },
    provide: (serviceName: string, value: unknown) => {
      state.provided[serviceName] = value
      return () => {}
    },
    tools: {
      register: (definition: { name: string; output?: { render?: unknown } }) => {
        // 与 dsh-tools 的真实校验一致：缺 render 会拒绝注册
        if (typeof definition.output?.render !== 'function') throw new Error(`tool ${definition.name} missing output.render`)
        state.tools.push(definition)
        return () => {}
      },
    },
    commands: {
      register: (definition: { name: string }) => {
        state.commands.push(definition)
        return () => {}
      },
    },
    systemPrompt: {
      context: (section: { name: string; text: string }) => {
        state.contexts.push(section)
        return () => {}
      },
      getContextOrder: () => 900,
    },
    webServer: {
      register: (route: { path: string; handler: (req: unknown, res: unknown) => Promise<void> | void }) => {
        state.routes.push(route)
        return () => {}
      },
    },
  }
  Object.assign(services, {
    tools: ctx.tools,
    commands: ctx.commands,
    systemPrompt: ctx.systemPrompt,
    webServer: ctx.webServer,
  })
  return { ctx, state }
}

/** 只有 Cordis 核心能力、所有 dsh service 都缺席；属性访问会像真机一样抛错 */
function makeStrictCtx() {
  const provided: Record<string, unknown> = {}
  const logs: string[] = []
  const target: Record<string, unknown> = {
    logger: {
      info: (...args: unknown[]) => logs.push(args.join(' ')),
      warn: (...args: unknown[]) => logs.push(args.join(' ')),
      error: (...args: unknown[]) => logs.push(args.join(' ')),
      success: (...args: unknown[]) => logs.push(args.join(' ')),
    },
    effect: (fn: () => unknown) => trackEffect(fn),
    on: () => () => {},
    get: () => undefined,
    inject: () => () => {},
    provide: (serviceName: string, value: unknown) => {
      provided[serviceName] = value
      return () => {}
    },
  }
  const ctx = new Proxy(target, {
    get(object, prop, receiver) {
      if (typeof prop === 'symbol' || prop in object) return Reflect.get(object, prop, receiver)
      throw new Error(`cannot get property "${prop}" without inject`)
    },
  })
  return { ctx, provided, logs }
}

interface Api {
  create(input: Record<string, unknown>): Promise<{ meta: { id: string } }>
  list(): unknown[]
  stats(): Promise<{
    entryCount: number
    recall: { tool: { events: number; hits: number; zeroHit: number; gated: number } }
  }>
}

let root: string

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'gam-boot-'))
})

afterEach(async () => {
  // 先关插件/SQLite 句柄，再删目录：Windows 上顺序反了会 EBUSY
  for (const dispose of activeDisposers.splice(0).reverse()) {
    try {
      dispose()
    } catch {
      // 收尾失败不该掩盖原始测试错误
    }
  }
  await removeDir(root)
})

async function boot(config: Partial<MemoryConfig> = {}) {
  const { ctx, state } = makeCtx()
  apply(ctx as never, { ...DEFAULT_CONFIG, memoryRoot: root, ...config } as MemoryConfig)
  // apply 里的初始化是异步的：等 generalMemory 服务出现
  const api = await waitForService(() => state.provided.generalMemory as Api | undefined)
  if (!api) throw new Error(`plugin did not activate; logs: ${state.logs.join(' | ')}`)
  return { state, api }
}

describe('插件装配（对构建产物 lib/index.js）', () => {
  it('registers 6 tools, 3 commands, the http routes and the always-layer context', async () => {
    const { state } = await boot()
    expect(state.tools.map((t) => t.name).sort()).toEqual(
      ['memory_forget', 'memory_graph', 'memory_read', 'memory_recall', 'memory_status', 'memory_write'].sort(),
    )
    expect(state.commands.map((c) => c.name).sort()).toEqual(['memory', 'recall', 'remember'])
    expect(state.routes.map((r) => r.path)).toContain('/general-memory/stats')
    expect(state.routes.map((r) => r.path)).toContain('/general-memory/entries')
    expect(state.listeners.get('agent/pre-step')).toHaveLength(1)
    expect(state.listeners.get('session/event')?.length ?? 0).toBeGreaterThanOrEqual(2) // inject + ingest 各一个监听器
    // 记忆为空时不该注册常驻层（空 section 也占前缀）；目录 context 是动态的，可以空
    expect(state.contexts.filter((c) => c.name === 'general-memory')).toHaveLength(0)
    expect(state.contexts.some((c) => c.name === 'general-memory-catalog')).toBe(true)
  })

  it('activates even when every optional dsh service is absent', async () => {
    const { ctx, provided, logs } = makeStrictCtx()
    apply(ctx as never, { ...DEFAULT_CONFIG, memoryRoot: root } as MemoryConfig)
    for (let i = 0; i < 200 && provided.generalMemory === undefined; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5))
    }
    expect(provided.generalMemory).toBeDefined()
    expect(logs.join(' | ')).not.toContain('failed to start')
  })

  it('drops to the minimal tool surface when configured', async () => {
    const { state } = await boot({ toolSurface: 'minimal' })
    expect(state.tools).toHaveLength(3)
  })

  it('publishes the always layer through systemPrompt.context, never through section', async () => {
    const { state, api } = await boot()
    await api.create({
      kind: 'feedback',
      title: '改完代码后不要加总结',
      summary: '用户自己读 diff',
      body: '不要在回复末尾总结刚做的修改。',
      source: 'user-stated',
      activation: 'always',
    })
    const always = state.contexts.find((c) => c.name === 'general-memory')
    expect(always).toBeDefined()
    expect(always!.text).toContain('改完代码后不要加总结')
  })

  it('does not re-register the context when nothing changed (prefix-cache stability)', async () => {
    const { state, api } = await boot()
    await api.create({ kind: 'persona', title: '后端出身', summary: '十年 Go', body: 'b', source: 'user-stated', activation: 'always' })
    const countAfterCreate = state.contexts.filter((c) => c.name === 'general-memory').length
    // 再写一条 on_demand 的条目：常驻层内容没变，就不该动 system prompt
    await api.create({ kind: 'reference', title: '看板地址', summary: 'grafana 内网', body: 'b', source: 'user-stated', activation: 'on_demand' })
    expect(state.contexts.filter((c) => c.name === 'general-memory')).toHaveLength(countAfterCreate)
  })
})

describe('注入管线（agent/pre-step + 动态目录 context）', () => {
  const baseMessages = [{ role: 'user', content: [{ type: 'text', text: 'hi' }] }]

  function preStep(state: FakeState, sessionId: string, cwd = '/repo/demo') {
    const decision = {
      messages: [...baseMessages],
      agent: { session: { id: sessionId, cwd } },
      startsRequestSeries: true,
    }
    const listener = state.listeners.get('agent/pre-step')![0]!
    return listener(decision, () => decision) as Promise<typeof decision>
  }

  function catalogText(state: FakeState, sessionId: string, cwd = '/repo/demo'): string {
    const context = state.contexts.find((c) => c.name === 'general-memory-catalog')
    if (typeof context?.text === 'function') return context.text({ agent: { session: { id: sessionId, cwd } } })
    return context?.text ?? ''
  }

  it('injects nothing when memory is empty, and leaves the decision untouched', async () => {
    const { state } = await boot()
    const out = await preStep(state, 's-empty')
    expect(out.messages).toHaveLength(1)
    expect(out.startsRequestSeries).toBe(true)
    expect(catalogText(state, 's-empty')).toBe('')
  })

  it('publishes the catalog through a dynamic context without rewriting the decision', async () => {
    const { state, api } = await boot()
    await api.create({ kind: 'reference', title: '看板地址', summary: 'grafana 内网', body: 'b', source: 'user-stated' })
    const out = await preStep(state, 's-catalog')
    expect(out.messages).toHaveLength(1)
    expect(out.startsRequestSeries).toBe(true)
    expect(catalogText(state, 's-catalog')).toContain('看板地址')
  })

  it('emits byte-identical catalog text when a human is present on every turn', async () => {
    const { state, api } = await boot()
    await api.create({ kind: 'feedback', title: '别加总结', summary: '用户自己读 diff', body: 'b', source: 'user-stated', activation: 'always' })
    await api.create({ kind: 'reference', title: '鉴权中间件重写', summary: 'cookie 存 session token', body: 'b', source: 'user-stated' })

    const sessionEvent = state.listeners.get('session/event')![0]!
    const texts: string[] = []
    for (let i = 0; i < 5; i++) {
      sessionEvent({ id: 's-human' }, { type: 'user/message', data: { source: { kind: 'user' } } })
      await preStep(state, 's-human')
      texts.push(catalogText(state, 's-human'))
    }
    expect(texts.some((text) => text.includes('鉴权中间件重写'))).toBe(true)
    expect(new Set(texts).size).toBe(1)
  })

  it('returns the decision unchanged when the waterfall shape is unexpected (never undefined)', async () => {
    const { state } = await boot()
    const listener = state.listeners.get('agent/pre-step')![0]!
    // 没有 next、decision 不是对象：必须恒等返回，绝不能返回 undefined 冲掉 agent 的决策链
    await expect(listener('not-an-object', undefined)).resolves.toBe('not-an-object')
    await expect(listener(undefined, undefined)).resolves.toBe(undefined)
    const noMessages = { agent: { session: { id: 'x', cwd: '/repo' } } }
    await expect(listener(noMessages, () => noMessages)).resolves.toBe(noMessages)
  })
})

describe('HTTP 路由守卫', () => {
  function fakeRes() {
    const res = {
      statusCode: 200,
      headers: {} as Record<string, string>,
      body: '',
      setHeader(name: string, value: string) {
        this.headers[name] = value
      },
      end(chunk?: string) {
        this.body = chunk ?? ''
      },
    }
    return res
  }

  it('rejects cross-site requests', async () => {
    const { state } = await boot()
    const route = state.routes.find((r) => r.path === '/general-memory/stats')!
    const res = fakeRes()
    await route.handler({ method: 'GET', url: '/general-memory/stats', headers: { 'sec-fetch-site': 'cross-site' } }, res)
    expect(res.statusCode).toBe(403)
  })

  it('rejects cross-origin requests', async () => {
    const { state } = await boot()
    const route = state.routes.find((r) => r.path === '/general-memory/stats')!
    const res = fakeRes()
    await route.handler(
      { method: 'GET', url: '/general-memory/stats', headers: { origin: 'https://evil.example', host: '127.0.0.1:3080' } },
      res,
    )
    expect(res.statusCode).toBe(403)
  })

  it('requires the nonce for mutating routes', async () => {
    const { state } = await boot()
    const route = state.routes.find((r) => r.path === '/general-memory/entry/invalidate')!
    const res = fakeRes()
    await route.handler(
      { method: 'POST', url: '/general-memory/entry/invalidate', headers: { 'content-type': 'application/json' } },
      res,
    )
    expect(res.statusCode).toBe(403)
    expect(JSON.parse(res.body) as { error: string }).toEqual({ error: 'csrf' })
  })

  it('serves stats same-origin and never caches', async () => {
    const { state } = await boot()
    const route = state.routes.find((r) => r.path === '/general-memory/stats')!
    const res = fakeRes()
    await route.handler({ method: 'GET', url: '/general-memory/stats', headers: { host: '127.0.0.1:3080' } }, res)
    expect(res.statusCode).toBe(200)
    expect(res.headers['cache-control']).toBe('no-store')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    const payload = JSON.parse(res.body) as { root: string; entryCount: number }
    expect(payload.root).toBe(root)
    expect(payload.entryCount).toBe(0)
  })
})

describe('工具面', () => {
  interface ToolResult {
    toString(): string
  }
  type Tool = { name: string; execute(args: Record<string, unknown>, exec: { signal: AbortSignal }): Promise<ToolResult> }

  function tool(state: FakeState, toolName: string): Tool {
    return state.tools.find((t) => t.name === toolName) as unknown as Tool
  }

  it('memory_write refuses to write episodes and procedures', async () => {
    const { state } = await boot()
    const out = String(await tool(state, 'memory_write').execute({ title: 't', summary: 's', content: 'c', kind: 'episode' }, { signal: new AbortController().signal }))
    expect(out).toContain('REJECTED')
  })

  it('memory_write refuses relations without two entities', async () => {
    const { state } = await boot()
    const out = String(
      await tool(state, 'memory_write').execute({ title: 't', summary: 's', content: 'c', kind: 'relations', entities: ['张三'] }, { signal: new AbortController().signal }),
    )
    expect(out).toContain('REJECTED')
  })

  it('memory_write dedupes instead of stacking duplicates (NOOP is an explicit decision)', async () => {
    const { state, api } = await boot()
    const write = tool(state, 'memory_write')
    const exec = { signal: new AbortController().signal }
    const first = String(await write.execute({ title: '改完代码后不要加总结', summary: '用户自己读 diff', content: '正文', kind: 'feedback', userStated: true }, exec))
    expect(first).toContain('ADD')
    const second = String(await write.execute({ title: '改完代码后不要加总结', summary: '用户自己读 diff', content: '正文', kind: 'feedback', userStated: true }, exec))
    expect(second).toContain('NOOP')
    expect((await api.stats()).entryCount).toBe(1)
  })

  it('memory_forget requires a reason — forgetting must be explainable', async () => {
    const { state, api } = await boot()
    const write = tool(state, 'memory_write')
    const exec = { signal: new AbortController().signal }
    const added = String(await write.execute({ title: '看板在 grafana', summary: '内网地址', content: '正文', kind: 'reference' }, exec))
    const id = added.split(' ')[1]!
    expect(String(await tool(state, 'memory_forget').execute({ id, reason: '' }, exec))).toContain('REJECTED')
    expect(String(await tool(state, 'memory_forget').execute({ id, reason: '地址变了' }, exec))).toContain('INVALIDATED')
    expect((await api.stats()).entryCount).toBe(0)
    // 失效不是删除：归档里还在
    const read = String(await tool(state, 'memory_read').execute({ id }, exec))
    expect(read).toContain('INVALIDATED')
  })

  it('memory_status reports the budget instead of a vague ok', async () => {
    const { state } = await boot()
    const out = String(await tool(state, 'memory_status').execute({}, { signal: new AbortController().signal }))
    expect(out).toContain('root:')
    expect(out).toContain('index:')
    expect(out).toContain('injection:')
  })

  it('memory_recall returns compact lines and points at memory_read for full text', async () => {
    const { state } = await boot()
    const exec = { signal: new AbortController().signal }
    await tool(state, 'memory_write').execute({ title: '鉴权中间件重写', summary: 'session token 存 cookie', content: '因为合规要求', kind: 'project', project: 'demo' }, exec)
    const out = String(await tool(state, 'memory_recall').execute({ query: '鉴权中间件' }, exec))
    expect(out).toContain('鉴权中间件重写')
    expect(out).not.toContain('因为合规要求') // 摘要层不含正文
    expect(out).toContain('m_')
  })

  it('counts an empty-query memory_recall (the catalog) as a real tool recall', async () => {
    const { state, api } = await boot()
    const exec = { signal: new AbortController().signal }
    await tool(state, 'memory_write').execute({ title: '部署走 CI', summary: '不要手工上传', content: 'GitHub Actions', kind: 'project' }, exec)
    const out = String(await tool(state, 'memory_recall').execute({}, exec))
    expect(out).toContain('部署走 CI')
    const recall = (await api.stats()).recall.tool
    expect(recall.events).toBe(1)
    expect(recall.hits).toBeGreaterThan(0)
    expect(recall.zeroHit).toBe(0)
  })
})
