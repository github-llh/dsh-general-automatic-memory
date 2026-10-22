import { readFileSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { describe, expect, it } from 'vitest'

/**
 * client bundle 装载冒烟测试。
 *
 * 为什么这个测试值得单独存在：dsh 0.2.1-rc.2 上**单个 client bundle 装载失败会导致整个
 * Desktop 进程退出**，官方尚未回应，用户的恢复手段只有「禁用所有第三方插件」
 * （deepseek-harness discussion #10309）。所以我们不能只在真机上试——
 * 必须在 CI 里用一个假的 __ModuleLoader__ 沙箱把 bundle 真的执行一遍，
 * 证明它①能被解析②能注册③factory 能被调用④apply 能在最小 ctx 上跑完不抛。
 */

const ROOT = path.resolve(import.meta.dirname, '..')
const PKG = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
  name: string
  exports: Record<string, unknown>
  dsh?: { bundle?: { patch?: string }; client?: { platform?: string } }
}

interface Registered {
  id: string
  factory: (require: (name: string) => unknown) => unknown
}

function loadBundle(): Registered[] {
  const code = readFileSync(path.join(ROOT, 'client/client.js'), 'utf8')
  const registered: Registered[] = []
  const sandbox = {
    window: { __ModuleLoader__: { load: (entry: Registered) => registered.push(entry) } },
    document: {
      getElementById: () => null,
      createElement: () => ({ style: {}, setAttribute() {} }),
      head: { appendChild() {} },
      hidden: false,
    },
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    setInterval: () => 0,
    clearInterval: () => {},
    console,
  }
  vm.runInNewContext(code, sandbox, { filename: 'client/client.js' })
  return registered
}

/** 最小 React 替身：只需要 createElement 返回一个可辨识的对象 */
function fakeReact() {
  const createElement = (type: unknown, props: unknown, ...children: unknown[]) => ({ type, props, children })
  const Component = class {
    state = {}
    setState(patch: unknown) {
      this.state = { ...this.state, ...(patch as object) }
    }
  }
  return {
    createElement,
    Component,
    useState: (initial: unknown) => [initial, () => {}],
    useEffect: () => {},
    useCallback: (fn: unknown) => fn,
    default: { createElement, Component },
  }
}

describe('client bundle 装载', () => {
  it('registers exactly one module whose id equals the package name', () => {
    const registered = loadBundle()
    expect(registered).toHaveLength(1)
    expect(registered[0]!.id).toBe(PKG.name)
  })

  it('factory returns a Cordis plugin object with name / inject / apply', () => {
    const [entry] = loadBundle()
    const react = fakeReact()
    const plugin = entry!.factory((name: string) => {
      if (name === 'react') return react
      throw new Error(`unexpected require("${name}") — not in the browser baseline`)
    }) as { name: string; inject: string[]; apply: (ctx: unknown) => void }

    expect(typeof plugin.name).toBe('string')
    expect(Array.isArray(plugin.inject)).toBe(true)
    expect(typeof plugin.apply).toBe('function')
  })

  it('apply registers the sidebar icon and the main panel without throwing', () => {
    const [entry] = loadBundle()
    const react = fakeReact()
    const plugin = entry!.factory((name: string) => (name === 'react' ? react : undefined)) as {
      apply: (ctx: unknown) => void
    }

    const owners: string[] = []
    const registrations: Array<Record<string, unknown>> = []
    const ctx = {
      effect: (fn: () => unknown) => {
        fn()
        return () => {}
      },
      slots: {
        inject: (ownerKey: string, register: () => unknown) => {
          owners.push(ownerKey)
          register()
          return () => {}
        },
        register: (options: Record<string, unknown>, component: unknown) => {
          registrations.push({ ...options, component })
          return {}
        },
      },
      get: () => undefined,
      // 真机 Cordis：未 inject 的 service 属性访问会抛错，必须走 get()
      get locale(): never {
        throw new Error('cannot get property "locale" without inject')
      },
    }

    expect(() => plugin.apply(ctx)).not.toThrow()
    expect(owners).toContain('sidebar.panellist')
    expect(owners).toContain('main')

    const icon = registrations.find((r) => r.name === 'sidebar.panellist')
    const panel = registrations.find((r) => r.name === 'main')
    expect(icon?.id).toBe('general-memory')
    // main 是 keyed slot：key 必须与侧栏 entry id 相同，宿主才会把两者配对
    expect(panel?.key).toBe(icon?.id)
    expect(typeof icon?.component).toBe('function')
    expect(typeof panel?.component).toBe('function')
  })

  it('registers dictionaries through the locale service when it exists', () => {
    const [entry] = loadBundle()
    const react = fakeReact()
    const plugin = entry!.factory((name: string) => (name === 'react' ? react : undefined)) as {
      apply: (ctx: unknown) => void
    }
    let registered: Record<string, unknown> | undefined
    const ctx = {
      effect: (fn: () => unknown) => {
        fn()
        return () => {}
      },
      slots: {
        inject: (_ownerKey: string, register: () => unknown) => {
          register()
          return () => {}
        },
        register: (_options: Record<string, unknown>, _component: unknown) => ({}),
      },
      get: (name: string) =>
        name === 'locale'
          ? {
              register: (_namespace: string, dictionaries: Record<string, unknown>) => {
                registered = dictionaries
                return () => {}
              },
              bind: () => (key: string) => key,
            }
          : undefined,
      get locale(): never {
        throw new Error('must use get()')
      },
    }

    expect(() => plugin.apply(ctx)).not.toThrow()
    expect(registered).toBeDefined()
  })

  it('does not touch the DOM at module scope (side effects must wait for materialisation)', () => {
    const code = readFileSync(path.join(ROOT, 'client/client.js'), 'utf8')
    // 模块体副作用会在物化时才跑；顶层就动 document 会拖慢启动并可能在错误时机崩
    const topLevel = code.slice(0, code.indexOf('factory'))
    expect(topLevel).not.toContain('document.')
  })

  it('declares the client half in the manifest with the only legal platform value', () => {
    expect(PKG.dsh?.client?.platform).toBe('web')
    expect(PKG.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    expect(PKG.exports['./client']).toBe('./client/client.js')
    expect(PKG.exports['./locale/*.json']).toBe('./locale/*.json')
    expect(PKG.exports['./icon']).toBe('./icon.svg')
  })
})
