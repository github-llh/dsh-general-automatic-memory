import en from '../../locale/en.json'
import zh from '../../locale/zh.json'
import { MemoryPanel, MemoryPanelIcon, WriteConfirmCard, type Translate } from './panel.js'
import { ensureStyles } from './styles.js'

/**
 * 浏览器半侧。构建后由 scripts/wrap-client.mjs 套上 lazy-CJS 外壳，
 * 产出 client/client.js，通过 `exports["./client"]` 暴露给 dsh 的 client module system。
 *
 * 组件永远拿不到 ctx：私有数据只能通过注册项的 `inject` 工厂传下去。
 */

export interface ClientSlots {
  inject(ownerKey: string, register: () => unknown): () => void
  register(options: Record<string, unknown>, component: unknown): unknown
}

export interface ClientLocale {
  register(namespace: string, dictionaries: Record<string, unknown>): () => void
  bind(namespace: string): Translate
}

export interface ClientContext {
  slots: ClientSlots
  /** Cordis：未写进 inject 的 service，属性访问会抛错；可选服务必须走 get() */
  get(name: string, strict?: boolean): unknown
  effect(execute: () => void | (() => void), label?: string): unknown
}

export const name = 'general-memory'
export const inject = ['slots']

const NS = 'general-memory'
const dictionaries = { zh, en }

export function apply(ctx: ClientContext): void {
  ensureStyles()

  // locale 服务是可选的：拿不到就用内置字典兜底，面板不能因为缺服务而空白。
  // 必须用 get()：Cordis 对未 inject 的 service 属性访问会直接抛错。
  const locale = ctx.get('locale') as ClientLocale | undefined
  if (locale) ctx.effect(() => locale.register(NS, dictionaries), `${NS}:dictionaries`)
  const translate: Translate = locale ? locale.bind(NS) : (key: string) => lookup(key)

  ctx.slots.inject('sidebar.panellist', () =>
    ctx.slots.register(
      {
        name: 'sidebar.panellist',
        id: NS,
        order: 350,
        label: () => translate('panel.title'),
        locale: NS,
        inject: () => ({ size: 20 }),
      },
      MemoryPanelIcon,
    ),
  )

  // `main` 是 keyed slot，key 必须与 sidebar.panellist 的 id 相同 —— 官方文档：
  // "Each list id addresses the matching main panel"。
  // 避开已被占用的 keyDomain 'conversation'。
  // 会话输入区上方的确认卡：只在有 pending 时渲染，不占位
  ctx.slots.inject('conversation.input.dock', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.dock',
        id: `${NS}-confirm`,
        order: 40,
        inject: () => ({ t: translate }),
      },
      WriteConfirmCard,
    ),
  )

  ctx.slots.inject('main', () =>
    ctx.slots.register(
      {
        name: 'main',
        key: NS,
        order: 100,
        inject: () => ({ t: translate }),
      },
      MemoryPanel,
    ),
  )
}

type Dict = Record<string, string | Record<string, string>>

function lookup(key: string): string {
  const dict = (dictionaries.zh ?? dictionaries.en) as Dict
  const [group, leaf] = key.split('.')
  if (group && leaf) {
    const nested = dict[group]
    if (nested && typeof nested === 'object') return (nested as Record<string, string>)[leaf] ?? key
  }
  const flat = dict[key]
  return typeof flat === 'string' ? flat : key
}
