# 附录 A · dsh 契约速查（本地实证）

> 本章是**事实记录**，来源是解包本机 `/Applications/DeepSeek Harness.app/Contents/Resources/app.asar`（21,416 个文件、307 个 `@deepseek-ai/*` 包）+ 读取 `~/.dsh/**` 真实数据 + 解压真实会话日志。与网上教程冲突时以本章为准。
>
> ⚠️ 基线版本 **0.2.1-rc.2**，dsh 是 developer preview，上游会变。本章的价值在于"当时确认过什么"，实现时必须用 `cordis_inspect_query` 复核。

## 0. 基线复核结论（2026-10-21，对照 GitHub master）

**结论：`0.2.1-rc.2` 仍是最新，没有需要吸收的 breaking change。** 但本章初版有若干事实错误，已按官方仓库原文更正如下——实现时以下面这版为准：

| 项 | 初版记录（错） | 复核后（对） |
|---|---|---|
| `dshBuildCommit` | `332895e0f7c9d4dbfb29729f5eb367fa263ff986` | 该 SHA 在上游仓库**不存在**（API 返回 `422 No commit found`）；`dsh-v0.2.1-rc.2` tag 的真实 commit 是 `687f282e`。`332895e0` 只是本机 app.asar 里打的构建戳 |
| React 版本 | 18.3.x | **运行时是 `^18.2.0`**（`apps/web`）；`18.3.1` 是 `@types/react` 的版本，不是运行时 |
| schemastery | 3.18.0 | **3.18.5** |
| `ctx.sessionQuery` | "web profile 可能未挂载" | **web profile 默认被 `openAt: never` 明确禁用**，不是"可能"。必须 `ctx.get()` 可选注入，并准备完全拿不到的降级路径 |
| `ctx.settings.register(ns, schema)` | 列为可用 API | **不存在**。设置表单由插件导出的 `Config`（schemastery，与 interface 同名）自动生成；程序化写只有 `ctx.settings.update/replace/mutate` + `settings/document-updated` 事件 |
| `plugins.item` slot | 列为配置卡片入口 | 当前版本应使用 **`plugins.bundle.config` / `plugins.row.config`**（`plugins.*` 在 v0.2.1-alpha.1 重排过） |
| schemastery `.check()` | 列为可用 | **不存在**（npm 发布物 `.d.ts` 里 `check(` 命中 0 次）。跨字段校验放到 `apply()` 里手动做 |
| `compaction/*` | 已正确记录为 session 事件 | ✅ 复核确认：`turn/*`、`step/*`、`tool/call`、`tool/result`、`compaction/*` 都是**持久化 session 事件类型**，只能监听 `session/event` 再判 `event.type` |

**两条新增利好**：

1. 官方 `cordis-plugin-development` skill 里已经有**零构建的手写 lazy-CJS UI 插件模板**，以及 `references/ui-plugin.md` 作者指南 → 我们复刻 client bundle 格式有官方对照物，风险 R2 大幅下降。
2. `zod` 已进入 client 模块基线表。

**一条新增利空（已登记为风险 R17）**：discussion #10309 实测表明在 0.2.1-rc.2 上，**单个 client bundle 装载失败会导致整个 Desktop 进程退出**，用户的恢复手段只有「禁用所有第三方插件」，官方尚未回应。因此本插件把 bundle 冒烟测试做成 CI 必过项（`test/bundle.test.ts` 用 `node:vm` 沙箱真跑产物）。

**一条战略结论**：记忆赛道已有 **13+ 个社区插件**，但官方在所有记忆相关讨论下**从未回复**（`authorAssociation: NONE`）；讨论 #7862 / #9890 已准确指出 MCP 路线的两个结构性缺陷——**拿不到 `ctx.systemPrompt`、观察不到 `session/event`**。进程内 Cordis 插件两者都能做，这是本设计最该被放大的差异化（见 `docs/01 §5.6`）。

## 1. 版本基线

| 项 | 值 | 来源 |
|---|---|---|
| `CFBundleShortVersionString` / `CFBundleVersion` | `0.2.1-rc.2` | `Contents/Info.plist` |
| Electron shell 包名 / appId | `@deepseek-ai/dsh-desktop` / `com.deepseek.dsh` | `app.asar/package.json` |
| 更新通道 | `nightly` | 同上（`dshDesktopUpdateChannel`） |
| build commit | `332895e0f7c9d4dbfb29729f5eb367fa263ff986`（⚠️ 仅本机 asar 内的构建戳，**上游查无此 SHA**；`dsh-v0.2.1-rc.2` tag 的真实 commit 是 `687f282e`） | 同上（`dshBuildCommit`） |
| runtime node / pnpm | `24.21.0` / `11.28.5` | `Contents/Resources/runtime/versions.json` |
| 全部 `@deepseek-ai/dsh-*` 版本 | `0.2.1-rc.2`（313 个包一致） | asar 内 package.json |
| Cordis | `@deepseek-ai/cordis@4.0.5`；`cordis-plugin-loader@1.0.6`、`-group@1.0.5`、`-include@1.1.10`、`-timer@1.1.7` | asar |
| host protocol | `hostProtocolVersion: 4` | `app.asar/dsh/desktop-runtime.json` |
| session 格式 | `session.v4.jsonl.zstd`（迁移链 v0→v1→v2→v3→v4，asar 内有 `dsh-session-format-{catalog,v0-to-v1,…,v3-to-v4}`） | `~/.dsh/sessions/**` |
| 发布节奏 | 建仓 2026-08-13 → 10-17 共 30 个 release，1–3 天一个 prerelease，`alpha.N → rc.N` 双轨 | GitHub releases |

**asar 布局**：`app.asar` 只有 4 个根条目 —— `lib/`（Electron 主进程 + preload + welcome）、`renderer/`、`node_modules/`、`dsh/`（**整个 dsh 运行时**：`desktop-runtime.json` + `dsh/node_modules/**`）。`app.asar.unpacked` 只放原生二进制。

**解包方法**（无网络时）：asar header 解析 —— 读前 8 字节，`headerBufSize = readUInt32LE(4)`；再从 offset 8 读 `UInt32LE` 得 JSON 字符串长度；JSON 从 offset 12 开始。解出文件树后按 `offset`/`size` 抽取目标文件。

## 2. 官方文档在本机的位置（最权威、离线可读）

```
app.asar → dsh/node_modules/@deepseek-ai/dsh-agent-preset/skills/
├── cordis-plugin-development/
│   ├── SKILL.md
│   ├── references/{host-plugin, ui-plugin, practices, user-actions, mcp-bundle, verification}.md
│   └── templates/{decoration, mcp}/          ← 官方样板包（decoration 含完整 client.js）
├── cordis-composition-reference/
│   ├── SKILL.md
│   └── references/packages.md               ← 514 行，全部可安装插件包清单
├── editing-cordis-compositions/SKILL.md
└── agent-experience/SKILL.md
```

⚠️ SKILL.md 原文：*"In Desktop the directory sits inside `app.asar`, which only the Host process's own file reads can open"* —— agent 在 Desktop 里要用 **file-read 工具**读，shell `cat`/`ls` 会失败。

⚠️ `docs/subsystems/*.md`（README 里大量引用）**未随包附带**；`.d.ts` 也未附带（313 个包的 `.d.ts` 文件数为 **0**，`lib/types/*.js` 是类型擦除后的空 stub）。**唯一有真类型的是 `@deepseek-ai/cordis` + 3 个 `cordis-plugin-*`，它们随包带完整 `src/*.ts`（cordis 共 2696 行带 JSDoc）。**

每个 `@deepseek-ai/dsh-*` 都带 `README.md` + `README.zh.md`，结构统一：`Summary / Use this package / Understand the implementation / Further Exploration / Model Experience / KV Cache effect / Known Limitations / Dev Note`。**这是业务层唯一可靠的 API 文档。**

## 3. 清单：`package.json` 的 `dsh` 字段（全量枚举）

扫了 asar 内全部 313 个 `@deepseek-ai` 包，实际出现的 key 只有这些：

| 字段 | 出现次数 | 类型 | 语义 |
|---|---|---|---|
| `dsh.bundle.patch` | 18（17 string + 1 array） | `string \| string[]` | patch 文件路径，相对包根；数组按顺序作为一个 bundle layer 应用 |
| `dsh.client.platform` | 79 | 字面量 | **唯一合法值 `'web'`**（79/79） |
| `dsh.client.inject` | 78 | `string[]` | 依赖的 client 包名，**只用于排序激活**，不是运行时 import 许可 |
| `dsh.client.immediately` | 12 | `boolean` | 立即物化（默认懒加载） |
| `dsh.client.external` | 6 | `string[]` | 声明非 baseline 的模块请求 |
| `dsh.manifestVersion` | 0（仅 README 声明） | `1` | README 明确说**当前 installer/loader 不强制校验** |
| `dsh.sessionFormatMigration` | 4 | 内部 | 仅 `dsh-session-format-v*-to-v*` 用，非公开 |

**不存在** `plugin.json` / `dsh.plugin.json` / `manifest.json`。**不存在**任何插件级权限/沙箱声明字段。

官方 `DshManifest` 结构（来自仓库 `packages/util/package-manifest/src/types.ts`；注意本机 asar 内该包只有 README，`src/types.ts` 未随包附带）：

```ts
interface DshManifest { manifestVersion?: 1; bundle?: { patch: string|string[] }
                        profile?: { bundles?: string[] }
                        client?: { platform: string; inject?: string[]; immediately?: boolean; external?: string[] } }
interface DshPackageManifest { name: string; version: string; description?: string; icon?: string
                        private?: boolean; dependencies?: Record<string,string>; peerDependencies?: Record<string,string>
                        engines?: { dsh?: string; node?: string; npm?: string }; dsh?: DshManifest }
```

`dsh.client` 的运行时校验器（`dsh-client-modules/lib/index.js:66-74` 真实源码）：

```js
if (typeof decl.platform !== "string") throw new Error(`client-modules: ${pkgName} dsh.client.platform must be a string`);
const external = optionalStringArray(pkgName, "dsh.client.external", decl.external);
if (decl.immediately !== void 0 && typeof decl.immediately !== "boolean") throw new Error(`client-modules: ${pkgName} dsh.client.immediately must be a boolean`);
// :733  if (decl === void 0 || decl.platform !== "web") { /* skip */ }
```

**Profile 侧**（`~/.dsh/profiles/desktop/package.json` 结构）：`dsh.profile.bundles` 是**有序**列表，`@deepseek-ai/dsh-base` 必须在前；`web` profile 另有 `dsh.profile.patchReload: "live"`。

## 4. Cordis 真实类型签名

来自随包附带的 `@deepseek-ai/cordis/src/*.ts`（唯一有真类型的层）：

```ts
// registry.ts:92-135
export type Inject<M = Dict> = (keyof M)[] | { [K in keyof M]?: M[K] }
export type Plugin<T = any> = Plugin.Function<T> | Plugin.Constructor<T> | Plugin.Object<T>
export namespace Plugin {
  export interface Base<T = any> {
    name?: string                        // fiber 诊断 / logger 名
    Config?: StandardSchemaV1<any, T>      // 启动前校验 config
    inject?: Inject                      // 依赖的 service；全部可用才加载
    provide?: string | string[]
    intercept?: Dict<boolean>
  }
  export interface Function<T> extends Base<T> { (ctx: Context, config: T): any }
  export interface Constructor<T> extends Base<T> { new (ctx: Context, config: T): any }
  export interface Object<T> extends Base<T> { apply(ctx: Context, config: T): any }
}

// reflect.ts
get<K extends string & keyof this>(name: K, strict?: boolean): undefined | this[K]
provide<K extends string & keyof this>(name: K, value: undefined | this[K]): () => void
accessor(name: string, options: Omit<Property.Accessor,'type'>): void
mixin(name, mixins): void

// events.ts — DispatchMode = 'emit' | 'parallel' | 'serial' | 'bail' | 'waterfall'
emit / parallel / serial / bail / waterfall (name, ...args)
on<K extends keyof Events>(name: K, listener: Events[K], options?: boolean|EventOptions): () => boolean
once(...)

// fiber.ts
ctx.effect(execute: () => SyncEffect, label?: string): Disposable<Promise<void>>
ctx.effect(execute: () => Effect,     label?: string): AsyncDisposable<Promise<void>>

// cordis-plugin-timer（dsh-base 已挂载，id: timer）
ctx.setTimeout / setInterval / timeout / interval / throttle / debounce
```

Fiber 状态机：`PENDING → LOADING → ACTIVE (↘ FAILED) → UNLOADING → DISPOSED`。所有 `ctx.*` 注册都是 effect，卸载自动回收。

**官方没有 `load/enable/disable/unload/fork` 这套显式插件 API**：enable/disable 是 profile patch 里的 `disabled` 行 + `pluginManager.setPluginEnabled`；`fork` 在 dsh 语义里是 **session fork**（`ctx.sessions.fork`），不是插件 fork。

## 5. Slot 名录（88 个，从全部官方 client bundle grep `slots.inject(...)` 提取）

```
root:      main  main.conversation  shell.overlay  shell.leading  shell.bottom  shell.quota-notice
           rightbar  rightbar.session  workspace.toast

sidebar:   sidebar.panellist ★  sidebar.settings  sidebar.footer.action  sidebar.toggle.badge
           sidebar.brand.mark  sidebar.brand.name  sidebar.chat.conversation
           sidebar.session.row.leading  sidebar.session.row.hover
           sidebar.workspaces  sidebar.workspaces.session.menu.item  sidebar.workspaces.session.row.action
           sidebar.right.pane.tab  sidebar.right.pane.tab.title  sidebar.right.tab.menu.item
           sidebar.right.tab.guide  sidebar.right.tab.guide.entry
           sidebar.right.tab.document  sidebar.right.tab.document.action  sidebar.right.tab.document.actions
           sidebar.right.tab.document.office.pdf  sidebar.right.tab.document.unpreviewable
           sidebar.right.tab.files.actions

conversation: conversation.view  conversation.session  conversation.header  conversation.header.leading
           conversation.session.header  .actions  .corner  .lineage  .utilities
           conversation.hero.brand.mark  conversation.hero.options  conversation.hero.workspace
           conversation.chat.node  conversation.chat.flow  conversation.chat.commandview
           conversation.chat.assistant-actions  conversation.chat.reasoning.body
           conversation.chat.message.images  conversation.chat.user.images
           conversation.user.text.node  conversation.trajectory.images  conversation.approval.detail
           conversation.plan-review.actions
           conversation.composer  conversation.composer.bar  conversation.composer.dock ★
           conversation.input.dock ★  .left  .right  .overlay  .activity  .attachments
           conversation.input.model  conversation.input.model.label
           conversation.input.plan  conversation.input.permission

tool:      tool.call.toolview  tool.call.images  tool.view.cordis
           deliverables.file.actions  deliverables.review.file.actions

settings:  settings.section ★  settings.general.item  settings.plugins.tab  settings.onboarding
           settings.trigger  settings.header  settings.action  settings.close  settings.launcher
           settings.models.footer  settings.models.provider-card  settings.models.sign-in

plugins:   plugins.item  plugins.tab  plugins.row.config ★  plugins.detail.actions
           plugins.detail.badge  plugins.detail.section  plugins.bundle.config ★
           plugins.bundle.activation  plugins.add.actions
```

★ = 本插件使用的。

**cardinality 四种**：`single` / `list`（需 `id` + `order`）/ `keyed`（需 `key`）/ `chain`（需 `select(owner)`）。**scope 三种**：`root` / `session` / `session-maybe`。

`sidebar.panellist` owner props：`{ size, active }`；官方文档原文 *"Each list id addresses the matching main panel"*。`main` 是 keyed，`keyDomain: 'conversation'` 已被占用。

完整 100+ key 的权威来源：仓库 `packages/extensions/cordis-client-runner/src/client/slot-catalog.ts`；运行时用 `cordis_inspect_query` 的 `Slots` provider（`Slots.listSubTree` 返回 registration options 与 props）。

**注册签名与真实用例**：

```ts
ctx.slots.inject(ownerKey: string, () => ctx.slots.register(options, Component))
// options: { name, id?, key?, order, label?: () => string, locale?: string, inject?: () => props }
```

官方用例（`dsh-client-ui-agent-preset/lib/client.js:2455`）：
```js
ctx.slots.inject("settings.section", () => ctx.slots.register({
  name: "settings.section", id: "agent-presets", order: 20,
  label: () => ctx.locale.bind("settings.agentPreset")("nav"),
  locale: "settings.agentPreset", inject: sectionInjected
}, AgentPresetSection));
```

第三方用例（本机 `~/.dsh/profiles/desktop/node_modules/dsh-plugin/src/client/index.tsx`，**完整 TSX 源码在本地**）：
```tsx
export const name = NS                       // 'dsh-plugin'
export const inject = ['slots', 'locale']
export function apply(ctx: HubClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), `${NS}: dictionaries`)
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: NS, order: 60,
    label: () => t('nav'), locale: NS,
    inject: () => ({ t, locale: ctx.locale }),
  }, () => h(PluginHubSection, { t, locale: ctx.locale })))
}
```

官方 client 模板（`templates/decoration/client.js` 全文）：
```js
window.__ModuleLoader__.load({
  id: '@local/my-decoration',
  factory(require) {
    const React = require('react'); const h = React.createElement;
    function Decoration() { return h('svg', { viewBox:'0 0 64 64', width:48, height:48, 'aria-hidden':true,
      style:{display:'block',pointerEvents:'none'} }, h('circle',{cx:32,cy:32,r:24,fill:'#247bbf'})); }
    return { inject: ['slots'], apply(ctx) {
      ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
        name:'conversation.composer.dock', id:'my-decoration', order:5 }, Decoration));
    }};
  },
});
```
（`templates/decoration/index.js` Host 半侧就一行注释 + `export function apply() {}` —— 纯装饰插件的 Host 半侧可以为空，只为让包拥有一个 Loader row 好让 client module system 去 serve 它的浏览器半部。）

## 6. Client module 装载机制

- Host 扫所有 enabled Loader 条目里声明 `dsh.client` 的包 → 组 boot graph（`WebBootEntry` 行）→ 注入 `window.__DSH_BOOT__`（`<` 被转义防插件字符串 breakout）
- Web carrier 通过 `/plugins/<package>/client.js` 提供 bundle；实际用 combo 路由 `/plugins/??…&rev=…`（每 phase 在 URL 超 3 KiB 前分区），HMR 时切到单资源 revisioned URL
- bundle 格式是 **lazy-CJS**：执行只注册 factory，模块体副作用（含 CSS 注入）在**物化时**才跑
- `window.__ModuleLoader__.load({ id, factory(require){…} })`；`id` **必须等于包名**；`<id>/client` 与裸 `id` 解析到同一 exports
- `require.async("./client.<name>.js")` 对应 tsdown 拆出的 `import()` chunk
- `rev` 由 `mtimeMs`/`ctimeMs`/`size` 派生（**非内容哈希**）；`HEAD` 不物化 body；未知资源/revision → 404
- 缺 bundle 会「fail activation loudly with one build instruction」
- Browser half 挂在"specifier 是裸包名"的那条 Loader row 上；从 subpath export 挂的 row **不带 browser half**
- 组合阶段拒绝畸形请求、缺失 supplier、自请求、同步循环

**浏览器基线模块**（实测 grep 官方 client bundle 的 `require()`）：`react`(46)、`react/jsx-runtime`(50)、`react-dom`(11)、`react-dom/client`(1)、`@deepseek-ai/cordis`(10)、`@deepseek-ai/dsh-client-ui-primitives`(45)、`@deepseek-ai/dsh-client-store`(31)、`@deepseek-ai/dsh-client-ui-slots`(7)、`@deepseek-ai/dsh-client-ui-dockkit`(1)、`zod`(2)、`@tanstack/react-virtual`(2)。**React 运行时是 `^18.2.0`**（`apps/web`）；`18.3.1` 只是 `@types/react` 的版本。仓库文档口径的 `PLATFORM_MODULES` 含 React、Cordis、zod、`@tanstack/react-virtual` + 静态 UI 库，但 `practices.md` 只保证 `react` / `react/jsx-runtime` / `@deepseek-ai/cordis` → **第三方安全依赖只有这三个**。

## 7. 事件表（我们能挂的钩子）

⚠️ **陷阱**（官方文档明确警告）：`turn/*`、`step/*`、`tool/call`、`tool/result`、`compaction/*` 是**持久化 session 事件类型，不是同名 Cordis 事件**。要观察它们必须 `ctx.on('session/event', (session, event) => …)` 再判 `event.type`。

### 7.1 Cordis 内部
```
internal/plugin  internal/status  internal/config(waterfall)  internal/service
internal/update(waterfall)  internal/get(waterfall)  internal/set(waterfall)
internal/listener(bail)  internal/dispatch
```

### 7.2 Agent 生命周期
```
agent/created(serial)  agent/disposed  agent/status({agent,status:'idle'|'running'})  agent/error
agent/pre-step(waterfall)      ← ★ 记忆注入主战场：可拒绝提议的 step 或替换进入 step 的 messages
agent/request(waterfall)       ← listener 不能改 request messages
agent/request-error(waterfall) ← 可重试失败的模型请求
agent/turn-stopping(serial)    ← ★ 沉淀触发点：在已完成的 turn 关闭前运行，可 steer() 让它继续开着
agent/assistant-stream(emit)   ← 一次进程本地 attempt 的有序 start / transient chunk / end 帧
agent/inbox/spliced | inserted | claimed
agent-loop/config-start-failed
```

官方原文（`practices.md`）：
> *"Wait on durable events such as `turn/end`, `assistant/message`, or `tool/result`; render live tokens from `agent/assistant-stream`. Do not poll `agent/status`. `whenIdle()` does not mean one follow-up finished."*
> *"A waterfall listener that does not own the decision must return `next()`. When rewriting an `agent/pre-step` decision, spread it (`{ ...decision, messages }`) so fields such as `startsRequestSeries` survive."*

### 7.3 Session / Turn / Step / Tool（从 `dsh-session` lib 实测提取，共 62 个）
```
session/created  session/disposed  session/event  session/flush  session/end-seed
session/title  session/title-llm-request
turn/start  turn/end  step/start  step/end
system/message  developer/message  user/message  assistant/message  assistant/attempt
request/header  request/context
tool/call  tool/result  tool/ptc-dispatch  tool/ptc-dispatch-start
command/run  command/done  plan/mode  model/selection
permission/preset  sandbox/mode  approval/policy  approval/asked  approval/decided
compaction/start  compaction/summary  compaction/prune  compaction/end  image/offload
llm/retry  llm/retry-started
goal/change  goal/activation-changed  todo/write
subagent/catalog  subagent/descriptor  subagent/model-selection-policy
job/registered  job/settled     schedule/change  schedule/changed
workspace/changes  working-directory/change  deliverables/presented
feedback/record  feedback/message-put  feedback/message-delete
hook/invoked  hook/result  agent-preset/selected  team/member  team/task
tool-workflow/run-start|run-end|agent-start|agent-end
workspace/session-activity(waterfall)  workspace/session-stop(parallel)
```

### 7.4 Tools 管线
```
tools/change  tools/pre-execute(allow/deny/ask, waterfall)  tools/execute(around, 可换 exec.signal)
tools/post-execute(改结果)  tools/result(只读最终结果)  tools/ptc-dispatch-log
```
另有 `ctx.tools.restrict(filter)`（只能移除）与 `ctx.tools.guard(guard)`（同步、单调、只能 deny）。

### 7.5 其他
```
system-prompt/assemble(waterfall，返回即权威 —— 官方建议不要用它增删工具或文本)
llm/stream(waterfall)  llm/adapters-updated  llm/model-discovery-rejected
commands/change  skills/change  settings/document-updated(ns, revision)  domain/changed
plugin-manager/changed  loader/volatile-update
cordis/dynamic-package|dynamic-retract|request-run|inspect-query
compaction/summary-error(waterfall)  subagent/start|end
```

`ctx.remote.$on(key)` 的合法 key = `dsh-api-remotes/src/remote-events.ts` 的 `API_REMOTE_FORWARDED_EVENTS` 白名单，已确认存在：`credentials/reference-updated`、`settings/document-updated`、`connection/reset`、`schedule/changed`、`permission-presets/catalog-changed`、`api-session/{added,removed,activity,status,error}`、`plugin-market/changed`、`plugin-manager/{changed,install-log,install-state}`。

**无 heartbeat / idle-timer 事件**；`idle` 只能从 `agent/status` 拿。

### 7.6 Agent 主动驱动
```ts
handle.agent.followup({content:[{type:'text',text:'…'}], source:{kind:'my-plugin'}})  // 排队下一轮并唤醒 driver
handle.agent.steer({…})       // 提交 next-step 输入并唤醒
handle.agent.inject({…})      // 加模型可见上下文，不唤醒 → 落在下一个被接纳的 step，日志记为 agent/inbox/spliced
handle.agent.cancel(cause, {keepUserInbox?})
await handle.agent.whenIdle()
ctx.agents.create({sessionId, agentOptions:{provider, model, reasoningEffort?, maxTokens?}, parentAgent?, setup?})
ctx.agents.resume(...) / get(id) / list() / roots() / isOwnedBy(id, parent)
```

## 8. 关键 API 速查

```ts
// 工具
ctx.tools.register(defineTool({ name, description, parameters, output:{schema, render},
  execute(args, exec), timeoutMs?, presentCall?, presentResult?, projectContent?, finalizeContent? }))
// schema DSL: string/number/integer/boolean/null/array/object/json/oneOf；InferValue 精确保型 16 层容器
// ⚠️ object 输出 schema 必须写 additionalProperties: true，否则注册失败

// 命令
ctx.commands.register({ name /* 无斜杠, [a-z0-9_-] */, description, input:{hint?, attachments?},
  definitionId?, recordInput?=true, handler({agent, rawInput, invocation, …}) => {kind:'success'|'error', text?} })
ctx.commands.execute(agent, line, attachments, signal) / list(agent) / find(agent, name)
// 语法：byte 0 必须是 '/'，其余全部是 rawInput

// 技能
ctx.skills.register(SkillRegistration) / registerProvider(create)
// invocation policy { modelInvocable, userInvocable }；provider 标签 'runtime' 保留
// 文件系统根优先级：<projectRoot>/.dsh/skills(100) → <projectRoot>/.agents/skills(200)
//   → customSkillDirs(300) → <dshHome>/skills(400) → <agentsHome>/skills(500) → bundledSkillDir(600)

// 系统提示词
ctx.systemPrompt.section({ name, order, text, interpolate?, complete? })   // 改动会触发面替换
ctx.systemPrompt.context({ name, order, text, required? })                 // ★ cache-safe
ctx.systemPrompt.variable(name, fn) / getSectionOrder(name) / getContextOrder(name) / suppressRuntimeContext()

// 存储
const spec = defineDomain({ name, version, layout:'per-record'|'single', invalidRecords:'backup-and-skip',
  global:{…}, tables:{ facts: domainTable(zodSchema) } })
const domain = await ctx.storageDomain.open(spec)     // 调用方拥有 handle，自己 close()
domain.table('facts').get(k)/put(k,v)/update(k,fn)/delete(k)/entries()
domain.global.set(...)
// 写全部先落盘再改内存再发 domain/changed({domain,table,key,operation:'put'|'deleted',value?})
// ⚠️ domain/changed 仅进程内，跨进程推送是官方记录的已知限制
// json 后端：<root>/<unit>.json (single) 或 <root>/<unit>/<table>/<key>.json (per-record, {version, record})
// 临时文件 + fsync + 原子 rename + 父目录 fsync；记录 key 必须 [a-zA-Z0-9_-]+；root 必填，0o700

// 文件
ctx.fs: stat/listDir/readText/streamText/readBytes/writeText/editText + FsWriteIntent(createIfAbsent/replaceIfVersion)
// 事件 fs/observed、fs/write-intent、fs/edit-intent

// 路径
import { resolveDshHome, dshHomePath, dshCachePath, resolveAgentsHome } from '@deepseek-ai/dsh-home-paths'
// resolveDshHome(): 显式配置 > $DSH_HOME > ~/.dsh；resolveAgentsHome(): $DSH_AGENTS_HOME ?? ~/.agents

// HTTP
ctx.webServer.register({ kind:'exact', path:'/my/route', handler:(req,res)=>{} })

// 会话查询（跨会话回忆的官方正门）
ctx.sessionQuery: listSessions() / readSession(id) / filterSessions() / filterEvents(id, filters)
  / listEvents(id) / readSurface(id) / readEvent() / traceSession(id)（祖先链+递归后代树）
  / traceEvent() / searchSessions() / searchEvents()
// ⚠️ web profile 默认被 `openAt: never` **明确禁用** → 必须 ctx.get('sessionQuery') 可选注入，
//    并准备完全拿不到时的降级路径（只用我们自己的记忆文件）

// token 计量（replay-based、确定性、零模型调用）
const { totalTokens, surfaceTokens, nodes } = ctx.tokenMeter.measure(session, requestHeader?)
ctx.tokenMeter.estimateMessage(message)     // node 上还有 route-independent 的 heuristicTokens
ctx.llm.resolveModelInfo().context          // 模型容量归适配器所有
// 投影键：tokenUsage、contextPressure、contextBreakdown

// 会话投影
ctx.sessionProjections.register({ key, stateSchema, stateVersion, init(header, inheritedEventCount),
  apply(state, event), wire:{viewSchema, view} })
// snapshot(session) → {asOfSeq, values}；stateOf(session,key)；onChanged(listener)；checkpoint(session)

// 设置
// ⚠️ ctx.settings.register(namespace, schema) 不存在。表单由插件导出的 Config（schemastery，
//    与 interface 同名）自动生成；namespace 语义 = profile entry id，必须 /^[a-z][a-z0-9-]*$/
ctx.settings.update(ns, patch, expectedRevision?) / replace / mutate(ns, ops, …)   // 乐观锁
ctx.settings.configure({ auto?: boolean })
ctx.settingsController.openSettingsDocument(signal)
ctx.configForms.get(entryId) → {value, base, user, revision, writable} + set/unset/mutate
ctx.configForms.whileServed([NS], register)
// 事件：settings/document-updated(ns, revision)

// 定时（dsh-schedule：持久化 wall-clock）
after_seconds / at / every_seconds / daily / weekly / cron（五段 Vixie cron + IANA 时区）
```

**配置层叠顺序**（后者按 row 覆盖，`config` **整体替换不深合并**）：profile `dsh.profile.bundles` 里各 bundle 的 patch（`@deepseek-ai/dsh-base` 先）→ profile 自己的 `cordis.patch.yml` → `$DSH_HOME/cordis.patch.yml` → 各 `--patch`（argv 顺序）。

## 9. 桌面端渲染容器（实测 `app.asar/lib/main.js`）

```js
webPreferences: { preload, nodeIntegration: false, contextIsolation: true, sandbox: true,
                  webSecurity: true, webviewTag: primary, devTools: true }
navigateMain(url) → mainWindow.loadURL(url)      // url = Host 自己 webserver，默认 127.0.0.1:3080
```

- `WebContentsView` 只用于 DeepSeek 账户页（`/usage`、`/top_up`）
- `webviewTag` 只被 `dsh-client-ui-sidebar-browser` 的「Browser 标签页」用（Desktop-only，web profile 里 `disabled`）
- **插件 UI 与宿主 UI 在同一 document、同一 React tree、同一 CSP 下**

浏览器认证：每进程 mint 随机 launch token → `?token=…` 只在 `GET /` 接受 → 换成 authority-bound 签名 cookie（host-only、`Path=/`、`HttpOnly`、`SameSite=Strict`、默认 30 天、绑定 hostname+port、TLS 时才 `Secure`）→ 302 到干净 `./`。签名密钥存 `$DSH_HOME/.credentials.yaml` 的 `client-connection/browser-session` grant。所有请求先过 `Host`/`Origin` 信任检查（loopback / bind IP / `trustedHosts`），`sec-fetch-site: cross-site` 拒绝；失败 403，可信未认证 401。**`dsh web --host 0.0.0.0` 不支持。**

**沙箱与权限**（会话级，非插件声明级）：`sandbox-policy` config `{mode:'read-only'|'workspace-write'|'danger-full-access', workspaceRoot}`，默认 `read-only`（fail-safe），dsh-base 用 `!!js process.env.DSH_PERMISSION_MODE ?? 'workspace-write'`；`approval` config `{policy:'ask'|'never'}`；`permission-presets` 打包三档；切换 = 一条 log-only `sandbox/mode` 事件，`effective = explicit grant ?? fold(events) ?? deployment default`。

`dsh-plugin-manager/README.md` 原文：*"installed Host code executes in-process outside the workspace sandbox"*。

## 10. 跨 agent 兼容的官方能力

| 能力 | 细节 |
|---|---|
| 共享根 `~/.agents`（`$DSH_AGENTS_HOME`） | 官方注释原文：*"The root is deliberately outside `$DSH_HOME` because other agent tools share it; `dsh-agent-instructions` reads its user-global `AGENTS.md`, and `dsh-skill-filesystem` scans its `skills/` directory."* |
| `dsh-agent-instructions`（dsh-base 默认开启） | 首个请求注入 durable baseline：`$DSH_HOME/AGENTS.md` → `<agentsHome>/AGENTS.md` → 项目根到 cwd 的 `AGENTS.md`/`CLAUDE.md` 链（+ `AGENTS.local.md`/`CLAUDE.local.md` 覆盖层），受 `maxBytes` 约束；成功的 `read`/`write`/`edit` 触发更深层文件发现；**同组内 trim 后字节相同的文件只渲染一次** |
| 项目级候选文件 | `instructionFileCandidates` 默认 `['AGENTS.md','CLAUDE.md']`；`projectRootMarkers` 默认 `['.git']`。**明确不支持**小写名、`.claude/rules/`、`@path` import |
| `dsh-hooks-claude-code` | 读现成 Claude Code `hooks.json`，config `{configPath(必填), pluginRoot, projectDir, defaultTimeoutMs=600000, stderrSummaryMaxChars=500}`；映射 `SessionStart→agent/created`、`UserPromptSubmit→agent/pre-step`、`PreToolUse→tools/pre-execute`、`PostToolUse→tools/post-execute`、`Stop→agent/turn-stopping`、`SubagentStart/Stop→subagent/start|end`；支持 `${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_PROJECT_DIR}`。⚠️ **payload 里 `transcript_path` 恒为 `''`**（原文：*"the persistence seam exposes no artifact paths, and the default Zstandard-compressed session log is not readable by hook scripts"*）→ 跨 agent 记忆**不能**靠读 transcript |
| `dsh-hooks-codex` | 读 Codex `hooks.json`，5 个 hook point，config `{configPath, model, defaultTimeoutMs, stderrSummaryMaxChars}` |
| `dsh-experimental-claude-code-mods` | Claude Code **mods** 桥（`defineMod({name,version,root,userConfig,register})`）；与真 Claude Code 2.1.287 的差异：不读 `plugin.json`/`hooks.json`；`ui.render` 只支持 `AbovePrompt`，`Pane` 无位置 → `$.ui.open` 返回 `{isPlaced:false}`；**mods 无沙箱、拥有进程全部权限** |
| MCP 记忆 | `docs/user/guide/mcp-memory.md`：三个**默认关闭**的参考配置（Memorix `1.3.0`、`@modelcontextprotocol/server-memory@2026.7.4`、Engram `v1.20.0`），示例在 `apps/cli/config/examples/mcp-memory/*.cordis.yml`。原文：*"No memory server is present in the shipped composition"*、*"interoperability examples only… does not imply endorsement"*。stdio 桥会**主动剥离名字像凭据的环境变量与所有 `DSH_*` 变量** |
| `.mimocode` / `.workbuddy-ai` | 官方仓库与文档**零提及**（未文档化）；但前作插件的 `externalSources` 里有 `workbuddy-*`，说明是真实存在的国内工具 |

## 11. Session 持久化格式（实测）

**目录编码**：`~/.dsh/sessions/--<normalized-cwd>--/<session-id>/`，cwd 里 `/` → `-`；无 cwd 时 `_no-cwd/`。
⚠️ 前作记忆插件用**另一套编码**：`---Users-…--`（前导 3 dash，因为保留前导斜杠转出的 dash 再包 `--…--`）。**两套不能混。**

**每会话目录**：`session.v4.jsonl.zstd`（事件日志）+ `session.lock`（单写者锁）。子 agent 会话是**同级兄弟目录**，目录名是裸 uuid（无 `session-` 前缀）。

**物理编码**（`dsh-session-persistence-jsonl/README.md` 原文）：
> *"The default artifact is a standard concatenation of independent Zstandard frames: one checksummed frame containing only the header line, then one checksummed frame per durable append batch, using Node's built-in Zstandard API at its default compression level (no level knob)."*

实测：45,267 B 文件含 **18 个 zstd magic (`28 b5 2f fd`) 帧**。⚠️ **`zlib.zstdDecompressSync` 只解第一帧**，必须按 magic offset 切片逐帧解（Node ≥23.8 内置 zstd，无需 flag）。

`compression` config：`'zstd'`（默认）或 `'none'`（换行分隔 UTF-8 明文，外部读取器可直接消费）。`root` 必填无默认。`listConcurrency: 3`。

**首行是物理 header**：
```json
{"type":"session","version":4,"id":"session-<uuid>","createdAt":1792566196613,
 "cwd":"/…","isSeeded":false,"delegationDepth":0,"agentPreset":"standard"}
```
后续每行一个事件，通用信封 `{type, seq, time, data}`；surface 事件额外带 `surfaceOp`。

**实测事件类型分布**（大型项目会话 5.5 MB 压缩 / 20.1 MB 明文 / 4610 行）：
```
session:1  permission/preset:2  sandbox/mode:2  approval/policy:2
command/run:4  command/done:4  plan/mode:2  agent/inbox/spliced:54
turn/start:6  turn/end:6  step/start:742  step/end:742
system/message:2  user/message:38  assistant/message:739  assistant/attempt:39
request/header:8  request/context:1
tool/call:1014  tool/result:1057  llm/retry:36  llm/retry-started:36
compaction/prune:43  compaction/start:2  compaction/summary:2  compaction/end:2
goal/change:5  todo/write:3  workspace/changes:3
session/title:1  session/title-llm-request:1  session/end-seed:2  subagent/catalog:9
```

**`request/header` 事件 = 整个请求信封的规范化快照**（实测 42,965 B，含 `config:{provider,model,reasoningEffort}` + `tools[]` 全量 schema）→ 这是**测量工具面 token 成本的准确数据源**。
**`request/context`** = `{provider, model, contextWindow}`（实测 `contextWindow: 1024000`）。
**`assistant/message`** 内嵌完整紧凑流（`stream[]`：`block-start`/`reasoning-chunks`/`text-chunks`，含 `dt[]` 时间增量数组）+ `usage:{inputTokens,outputTokens,totalTokens}` + `source.replayState`。

`sourceEventSeqs` 的无损存储表示：连续 ≥3 个 seq 压成 `[start, end]` 对，其余原样；读取时展开成精确内存数组。

⚠️ **不要往 session 事件流 append 自定义 `type`**（会让 Session 拒绝重新打开）。`appendPluginRecord()` 只对官方 `packages/experimental/` 开放且有仓库检查。**插件自有数据放 storage service 或自己的文件。**

**其他持久化**：
- `~/.dsh/storages/<unit>.json`（storage-domain JSON 后端）：`{unit:{name,version}, global:{…}, tables:{<table>:{<key>:…}}}`
- `~/.dsh/storages/session_projcache/sessions/<sessionId>.json`：投影检查点（`writeEveryEvents: 200` / `writeIntervalMs: 5000` 节流 write-behind）

## 12. 本机可直接抄的第三方样板

| 包 | 路径 | 价值 |
|---|---|---|
| `dsh-plugin@2.0.5` | `~/.dsh/profiles/desktop/node_modules/dsh-plugin/` | **带完整 `src/` TSX 源码**（`src/client/index.tsx`、`components/`、`views/`、`hooks/`、`styles/*.module.css` 11 个、`src/server/{http,services}/`）+ `lib/types/**/*.d.ts`。一个完整的「市场页面」插件：`settings.section` slot、任务队列、日志面板、诊断面板、Modal |
| `dshmarket@1.66.42` | 同上 `/dshmarket/` | `src/client/*.tsx` 30 个文件（MarketSection、RecoveryPanel、OperationsPanel、Diagnostics、CommentsModal、InstallToast、HostRecoveryBanner…）+ `sidebar-entry.ts`、`settings-nav-icon.ts`、`section-gate.ts`；`UPDATE-API-V1.md`；`locale/{en,zh}.json`；`assets/logo.svg` + 顶层 `icon` 字段 |
| `dsh-easyrewrite@2.6.0` | 同上 `/dsh-easyrewrite/` | **最贴近我们需求的样板**：Host 侧 `ctx.webServer.register` 9+ 条 `exact` 路由（`/bubble/log`、`/bubble/backup`、`/bubble/recall`、`/bubble/clean-ghost`…）+ `ctx.sessions.fork/flush` + `ctx.settings.register` + `ctx.agents`；Client 侧 `slots.inject` 到 `conversation.chat.node` / `conversation.input.dock` / `conversation.chat.assistant-actions`；自己写日志到 `$DSH_HOME/dsh-easyrewrite.log`；自己做版本检测/自更新。**它的 `guard(req,res)` 做 `requestFromSameOrigin` + JSON content-type + sessionId 校验，可直接抄**（`lib/index.js:330` 附近） |
| `dsh-sandbox-allowlist@0.2.1-beta.1` | 同上 | Host 侧工具策略 + Client 侧 `settings` 页面；决策日志落 `~/.dsh/sandbox-allowlist-decisions.jsonl`（883 行，每行 `{at, phase, tool, command, verdict, escalate, reason, statements:[{text,kind,action}]}`） |
| `@devilspiderx/dsh-chinese-thinking@1.0.0` | 同上 | **最小 Host-only 包**：只有 `dsh.bundle.patch`，无 client，导出 `./locale/*.json`。它贡献的就是一段「## 思考语言（强制规则）」system prompt section —— 这是"用 section 注入固定纪律"的最小可行样板 |
| 官方 `templates/decoration` / `templates/mcp` | asar 内 `dsh-agent-preset/skills/cordis-plugin-development/templates/` | 官方样板 |

## 13. 已知坑清单（社区实测 + 本地验证）

1. `--patch` 用绝对路径时，插件的裸导入会**从插件目录向上找 `node_modules`** → 本地开发要软链 `@deepseek-ai/*`
2. `@deepseek-ai/dsh-headless` 依赖的 `@deepseek-ai/dsh-code-runtime-worker` **不在 npm 上** → e2e 用默认 headless profile + `--patch`
3. tool 的 object 输出 schema **必须写 `additionalProperties: true`**，否则注册失败
4. `ctx.sessionQuery` 在 web 默认**不挂载**，别当硬依赖
5. `desktop` profile 名被 Electron 保留，**CLI 拒绝 boot/dump**
6. `dsh plugin add` **转发给 profile 目录里的 pnpm，没有 pnpm 会直接报错**
7. `NODE_OPTIONS` 里有 `--no-experimental-strip-types` 会让构建失败
8. pnpm 11 拦依赖构建脚本 → 失败安装报 `pendingBuilds`，用户需 Web 页面「Allow these scripts and retry」或 `install_bundle` 的 `approvedBuilds` 授权；按包名持久化在 profile 的 `pnpm-workspace.yaml` `allowBuilds`
9. 替换已装包需要**重启**（新的 JS module generation）；新 bundle 可 HMR
10. 组件抛错只会让 slot **空白**，console 只留 `slot entry crashed in '<slot>'`
11. 复用已占用的 slot `id`/`key` 会**替换内置 UI**（`replaceRisk: 'shadows-shipped-ui'`）
12. `zstdDecompressSync` **只解第一帧**，多帧 session 日志必须按 magic offset 切片
13. 第三方市场（`bradeGithub/DSH-Plugins-Marketplace`）的安装管线是**特征驱动**的：cordis 插件不要在根目录放 install 脚本、版本必须 bump、不要自己注册 patch（否则双加载崩溃）
14. 官方仓库 `has_issues=false`、`has_pull_requests=false`，CONTRIBUTING 原文 *"We are sorry that we cannot accept external pull requests at the moment."*
15. Cordis 的 service **不能当普通属性读**：未写进 `inject` 或服务尚未就绪时，`ctx.foo` 会直接抛 `cannot get property "foo" without inject`，`if (ctx.foo)` 也躲不过。规则：运行期可选读取用 `ctx.get('foo')`；注册期能力（tools/commands/webServer/systemPrompt）必须 `ctx.inject(['foo'], (scoped) => …)` 等服务激活后再注册——`apply` 执行时这些服务不保证已就绪
16. 派生文件会落在条目目录里：`persona/PROFILE.md` 是 GENERATED 文件，扫描记忆条目时必须排除，否则 doctor 会把它报成 `missing YAML frontmatter`
17. `ctx.tools.register` 的工具定义**必须**声明 `output: { schema, render }`；缺 `render` 会直接抛错，工具静默不出现（真机上表现为 agent 说「没有 memory_write 工具」）
18. `agent/pre-step` 是**异步 waterfall**：`next()` 返回 Promise，必须 `await`；`next()` 的 fallback 决策**不含 `agent`**，会话身份要取 incoming payload 的 `agent.session.id`。pre-step 决策里的普通消息会被 dsh 当作用户消息落盘，不能拿它做每轮注入
19. `tool/call` 的 `arguments` 是 **JSON 字符串**（不是对象），提取文件路径前必须 `JSON.parse`；路径键可能是 `file_path`/`path`，也可能是相对 cwd 的
20. 动态、按轮变化的事实走 `ctx.systemPrompt.context({ text: (context) => … })`：dsh 用 runtime-context 快照承载它，新快照 supersede 旧快照，不会膨胀普通用户历史
21. `ctx.llm.stream` 必须显式给 `provider`/`model`；文本增量是 `{ type: 'text-delta', text }`，结束块是 `{ type: 'finish', kind: 'error' | 'aborted' }`。会话实际模型来自 `model/selection` 事件（`data.provider/model`），不要猜默认模型
22. `slim` 节流只应省略目录层；`activation=glob` 的文件相关记忆必须保留，否则工具调用后的下一步就失去上下文

## 14. 前作 `@a9i5k4/dsh-auto-memory@3.3.15` 数据格式（对标参考）

> 它于 2026-10-21 15:02 安装、15:28 前后卸载，**只运行约 25 分钟**，落盘数据几乎是空壳。残留证据：`~/.dsh/profiles/desktop/pnpm-workspace.yaml` 的 `minimumReleaseAgeExclude: ['@a9i5k4/dsh-auto-memory@3.3.15']`、空的 `node_modules/@a9i5k4/`、`episodes.json` 里的 `"namespace":"dsh-auto-memory-pre"`。包体已从本机彻底删除（pnpm store / `~/.dsh/cache` / `~/Library/pnpm` 均无 tarball），**实现细节只能从残留数据 + 会话日志里的工具 schema + system prompt 文本反推**。

### 14.1 数据文件

| 文件 | 结构要点 |
|---|---|
| `~/.dsh/memory/hub/episodes.json` | `{schemaVersion, namespace:"dsh-auto-memory-pre", policyVersion:"episodic_store_pre_v1", savedAt, episodes:[], current:{sessionRef, startedAt, segments:[{kind,eventSeq,contextVersion,userText,assistantText,ts}], userTexts:[], assistantTexts:[]}}`；固化门槛 `episodicMinSegments: 2`，上限 `episodicRetention: 256` |
| `~/.dsh/memory/workspaces-summary.json` | `{workspaces:[], graph:{topics:[],links:[]}, generatedAt}`；上限 `workspaceDiscoverMax: 200` |
| `~/.dsh/memory/recall-stats.json` | `{version:"recall_stats_pre_v1", since, channels:{model,inject,shadow}}`；每 channel `{events,hits,zeroHit,ids:{<segId>:{count,first,last,layer,score,reason}}, byLayer, byDay, lastAt}`；**`score` 单位是字符**，`layer` ∈ `otherDynamic`/`memoryReferences` |
| `~/.dsh/memory/global-brief/<wsEnc>.json` | **不是 brief 正文，是 watch-state 指纹表**：`{ "<绝对路径>": "<byteSize>:<mtimeMs 带小数>" }`（实测 28 个键，含 `~/.claude/CLAUDE.md` 与 `~/.claude/projects/<projEnc>/<uuid>.jsonl`）；用于 `globalBriefWatch{Memory,Docs,External,Team}` 变更检测 |
| `…/handoff/PLAN.md` | 人可读白板，`<!-- memory:mem_<32hex> -->` 锚点绑定段落 ↔ 条目 id（`memoryAnchorEnabled`）；`type:goal|state|dead-end|progress` 泳道 tag |
| `…/handoff/index.json` | `{version:"wb_sidecar_pre_v1", ws, rebuilt_at, entries:[{id,anchorId,title,docTitle,source,kind,section,mtime,criteria,ts,bullets,chars,lineStart,anchored,tags,cues,preview,body,layer,status,cue}], by_tag, by_cue, versions, sourceRevisions:{<path>:"<sha256>"}}` |
| `…/handoff/events.jsonl` | append-only：`{ts,date,actor:"engine",event:"written",target:"PLAN.md",details:{chars,movedHistory}}` |
| `~/.dsh/memory/workbench.json` | `{version:2, sessionId, epoch:"B10371", cwd, permission:"danger-full-access", createdAt, periodDays:2, epochToken, phase, current, previous, drainStartedAt, greetCount, consentGranted, host:{pid,startedAt,instance,heartbeatAt}, visibleAt, gen:{consolidate:{n,gen},greet:{n,gen}}, lastGenAt}` |
| `~/.dsh/memory/polling-heartbeat.json` | `{pid, heartbeatAt, uptimeMs, queueLength, lastConsolidatedAt, todayCount, instances:[{pid,startedAt,heartbeatAt,uptimeMs,qLen}], instanceCount}` → 多进程选主 |
| `~/.dsh/memory/greetings/<YYYY-MM-DD>.json` | `{morning|afternoon|…: "<问候语>"}`，一天一份 |
| `~/.dsh/memory/{update-check-pre,notices-cache-pre}.json` | 插件自更新探测与服务端公告缓存 |
| `~/.dsh/dsh-auto-memory.json` | **159 个配置键**（见 §14.3） |
| `~/.dsh/dsh-auto-memory-diagnose.log` | `<ISO ts> <message>` 纯文本行 |
| `~/.dsh/models/js-semantic` | **空目录，模型从未下载成功** |
| `<repo>/.dsh-memory/` | 项目级：`MEMORY.md`、日志、`reflections/YYYY-MM-DD.md`、`archive/` |

### 14.2 15 个 `memory_*` 工具（从真实 `request/header` 事件反解，参数为真实 wire 值）

| 工具 | 参数（`*`=required） | 作用 |
|---|---|---|
| `memory_log` | `note*`, `date`, `kind{rule\|preference\|fact\|todo}` | 追加当日日志（append-only，绝不覆盖） |
| `memory_note` | `content*`, `action{append\|replace}`, `kind{note\|handoff\|plan}`, `expectedRevision`, `cardId`, `expectedCardRevision`, `supersedes[]`, `retract[]`, `retractReason`, `restore[]`, `archivedIds[]` | 写项目 `MEMORY.md` 或交接白板；乐观并发 + 卡片级修订 |
| `memory_user` | `content*`, `action*{append\|replace}` | 写 `~/.dsh/memory/MEMORY.md`（跨项目用户级） |
| `memory_rules` | `op*{list\|add\|update\|remove}`, `index`, `expect`, `content`, `dateSection` | 用户级硬性约束的**条目级**增删改；删/改必须带 `expect`（当前文本原样回填）防索引漂移。**这段每轮无条件注入且不参与裁剪 → prompt 成本主要来源** |
| `memory_read` | `kind*{log\|reflection\|user\|notes\|calendar\|plan\|archive}`, `name`, `date` | 按需读全文 |
| `memory_recall` | `query*`, `limit`, `scope{all\|handoff\|sessions\|archive}`, `format{l0\|full}`, `expand` | **默认返回 L0 摘要列表**（`id`/得分/匹配原因）；`expand="mem_xxx"` 渐进加载全文 |
| `memory_expand` | `tag`, `limit`(默认 10，硬帽 20) | 白板正向图遍历（需 `boardMode=graph`） |
| `memory_trace` | `id` | 白板反向回溯：cue / tag / 相邻条目 / `prev_version` 归档链 |
| `memory_external` | `action*{list\|import}`, `source`, `target{project\|user}` | 跨 AI 工具记忆，**「纯链接模式」= 只写源文件绝对路径指针，不抄内容** |
| `memory_consolidate` | `days` | 「做梦式固化」：读最近 N 天日志 → AI 提炼 → 写项目 + 用户级 `MEMORY.md` |
| `memory_maintain` | `days`(缺省 30) | 30 天蒸馏：要点入 `MEMORY.md`，原文归档到 `archive/` 后从活跃日志移除；**归档 = 退出 `memory_recall` 的 `all` 面** |
| `memory_reflect` | `date*`, `text*` | 每日反思 → `reflections/YYYY-MM-DD.md`；**触发条件严格**：仅在收到框架「昨日反思待生成」提示且已在正文呈现后才调 |
| `memory_procedure` | `action{write\|activate\|update}`, `procedureId`, `title`, `steps`, `successCriteria`, `preconditions`, `checks`, `rollback`, `riskLevel{low\|medium\|high}` | 技能库直写；`write` 进审批列表，`activate` 一步激活（可自动召回 + 自动导出 `SKILL.md`）。**无 `successCriteria` 的条目结构上永远无法晋升** |
| `memory_procedure_list` | `scope{all\|workspace\|global}`, `stage{all\|observed\|validated\|active\|deprecated}`, `query`, `limit` | 只读浏览，含「为什么还不能晋升」的原因码 |
| `memory_status` | — | 只读诊断：存储位置、各文件大小、今日日志条数、待反思、上次刷新时间 |

### 14.3 159 个配置键（分组，值为本机实际值）

```
存储      userMemoryDir:"~/.dsh/memory"  projectMemoryDir:".dsh-memory"  memoryRoot:"~/.dsh/memory/workspaces"
          boardMode:"graph"  locale:"system"
注入预算  injectEnabled:true  injectBudgetChars:8000  externalInjectionChars:1400  recentDaysInjected:1
          snapshotTieredInject:true  snapshotMinGapRounds:20  slimEveryRounds:8  snapshotReinjectOnCompact:true
          tier0CatalogEnabled:true  tier0MaxTokens:400  tier0BudgetShare:0.25
          promptSectionToggles:{}  promptLayerOverrides:{}  injectExcludeSources:[]
          softInjectionEnabled:false  procedureInjectEnabled:true
容量      noteCapacityChars:24000  userCapacityChars:24000  capacityDefaultsVersion:24
自动沉淀  autoConsolidate:true  autoConsolidateMinChars:240  autoConsolidateCooldownMinutes:30
          autoConsolidateDailyMax:8  consolidateScheduleEnabled:true  consolidateScheduleTime:"09:30"
          consolidateScheduleDays:7  maintainScheduleEnabled:true  maintainScheduleTime:"10:00"
          reflectEnabled:true  reflectStyle:"auto"  dayBoundaryMinutes:450  autoSummaryTimes:[]
工作台    workbenchEnabled:true  workbenchRoot:""  workbenchPeriodDays:2  workbenchLoopShort:10
          workbenchLoopLong:24  workbenchRetryMs:30000  subagentModel:""  subagentProvider:""
          subagentReasoningEffort:""  subagentReasoningEffortShort:""  subagentReasoningEffortLong:""
          subagentGcEnabled:true  subagentGcKeepDays:3
白板      handoffEnabled:true  handoffPlanChars:1200  handoffLedgerChars:800  slimPlanChars:400
          slimLedgerChars:300  memoryFileIndexEnabled:false  memoryAnchorEnabled:false
          rulesLayeringMode:"self"  criteriaGate:true
水位      waterLevelWindowTokens:0  waterLevelThreshold:0.75  waterLevelThresholdMode:"auto"
          waterLevelAutoMargin:0.9  waterLevelAdvisory:true  waterLevelProxyCompat:true
          waterLevelAutoHandoff:true  autoContinueEnabled:false  autoContinueThreshold:0.75
          autoContinueConfirmSeconds:35  autoContinueRefreshRitual:true  autoContinueRefreshTimeoutSeconds:120
          autoContinueProbeTimeoutSeconds:60  autoContinueCooldownMinutes:30
归档      sessionArchiveEnabled:true  autoArchiveEnabled:true  autoArchiveDays:2  autoDeleteEnabled:true
          autoDeleteDays:7  autoArchiveCheckMin:60  awayMinutes:60  unattendedMode:false
          unattendedAuto:false  unattendedAutoHours:["22:00-08:00"]
外部源    externalSources:{ workbuddy-user, workbuddy-profile, workbuddy-sessions, codebuddy-memory,
          claude-global, claude-sessions, codex-sessions, zcode-memory, zcode-sessions,
          kimi-global, kimi-sessions, trae-rules, project-conventions }  ← 13 个，全 true
记忆中枢  memoryHubEnabled:true  episodicMinSegments:2  episodicRetention:256  factRetentionMax:1000
          workspaceDiscoverMax:200  procedureMinSessions:3  procedureMinSuccess:2
          procedureCorrectionCap:0.3  procedureHighRiskApproval:true  procedureActiveLevel:"checklist"
          procedurePromotionEnabled:false
语义检索  semanticEngineMode:"auto"  activationSource:"js"  l0IndexEnabled:true  localWasmPaths:"auto"
          semanticEmbedIncremental:true  pythonBackendEnabled:false  pythonBackendExecutable:""
          pythonBackendWorkerPath:"…/python/worker_semantic_v1.py"（实测死链，触发了自愈逻辑）
关联记忆  associativeMemoryEnabled:false  shadowRetrievalEnabled:true  contextBridgeEnabled:true
          contextSinkMode:"null"  contextBridgeObserveChildSessions:true  activationInboxEnabled:true
          jsDecideCooldownRounds:1  jsDecideDeltaExp:0.01  jsDecideExcerptChars:40
          jsDecideCandidateScheme:"balanced"  jsDecideCandidatesN:4
          reasoningObserverEnabled:true  streamingInterruptionEnabled:false
投递节流  maxPacketItems:2  maxPacketChars:800  packetTtlSteps:2  injectionCooldownSteps:3
全局简报  globalBriefEnabled:true  globalBriefChars:1200  globalBriefInstruction:"soft"
          globalBriefUnattended:true  globalBriefWatch{Memory,Docs,External,Team}:true
UI        settingsEntryInDsSettings:true  settingsEntryInPluginsPage:true  autoPopupEnabled:true
          welcomeTourEnabled:true
团队同步  teamEnabled:false  teamProjectId/teamEndpoint/teamBucket/teamRegion/teamPathStyle
          teamSyncTransport:"s3"  teamAccessKeyId/teamSecretAccessKey  teamSyncIntervalMs:5000
          teamPushPath  teamPullPageLimit:200  teamOutboxMaxItems:500  teamMaxConflicts:200
          teamShowMemberBadges:true  teamE2E:"off"  teamUsageReport:false  teamUsageLog
          teamInjectEnabled:false  teamDerivedDebounceMs:2000  teamServerUrl  teamId  teamMemberName
          teamConflictPolicy:"ask"  teamAuditEnabled:false
```

### 14.4 分层注入的 9 个 segment（实测 `recall-stats.json`）

| segment id | layer | 字符 score |
|---|---|---|
| `seg:frame-head` | `otherDynamic` | 302 |
| `seg:frame-meta` | `otherDynamic` | 108 |
| `seg:frame-inscription` | `otherDynamic` | **1430** |
| `seg:frame-tail` | `otherDynamic` | 17 |
| `seg:external-memory` | `otherDynamic` | 175 |
| `seg:external-sessions` | `otherDynamic` | 90 |
| `seg:global-brief` | `otherDynamic` | 359 |
| `seg:tier0-catalog` | `memoryReferences` | 405 |
| `seg:whiteboard-plan` | `memoryReferences` | 437 |

`otherDynamic` = 动态运行时上下文（每请求重读）；`memoryReferences` = 记忆引用层。

### 14.5 分层节流五态（从诊断日志文案直读）

```
精简版（冷启动·数据未就绪，待下帧补完整版）
完整版（turn:1 · 距上次完整版 1 个模型请求 / 门槛 20）          ← snapshotMinGapRounds: 20
完整版（human:9 · 真人在场）                                    ← 检测到真人交互无条件完整版
精简版被节流(距上次投递 < 8 个模型请求),本步不注入快照            ← slimEveryRounds: 8
原样复读（本请求已定稿·逐字节幂等）                              ← ★ KV cache 保护
```

### 14.6 它注入的 system prompt 纪律（实测两段约 3,020 字符）

```
[记忆系统 — 固定纪律]
思维链=本轮推理(用完即焚);铭文=落盘的记忆文件(跨会话永久)。你的记忆更新必须落在铭文层——
显式调用工具写盘,不能只"想过"。
本提醒由框架在每一轮对话开始时重新注入(记忆动态快照变化即刷新,衰减期只有一轮):
读写只走工具、路径写死、每轮结束框架自动评估沉淀兜底——记忆无法被绕过,也不依赖自觉。
```

实测该会话 system prompt = **8,976 字符**，同期普通项目会话 = **5,957/5,958 字符**，差值 ≈3,020 正是这两段。**我们的目标是把纪律压到 ≤600 字符**（见 [04 §10.1](04-index-and-recall.md#101-system-prompt-纪律文本600-字符逐字节稳定)）。

### 14.7 它的一条 `level:"urgent"` 公告（血泪教训）

```jsonc
{"id":"2026-08-16-cache-upgrade","level":"urgent","maxVersion":"0.1.15",
 "startAt":"2026-08-16T00:00:00+08:00","endAt":"2026-09-15T00:00:00+08:00",
 "link":"https://github.com/Aik358/dsh-auto-memory"}
```
内容大意：*旧版本存在 DeepSeek 前缀缓存击穿问题，会白白消耗 token（命中率掉到个位数），0.1.16 已重写缓存策略。* → 这是原则 **P4（逐字节幂等）** 的直接来源。

## 15. 关键路径速查

```
/Applications/DeepSeek Harness.app/Contents/Resources/app.asar              # 174M，dsh 运行时全在里面
/Applications/DeepSeek Harness.app/Contents/Resources/runtime/versions.json
~/.dsh/profiles/desktop/{package.json, cordis.patch.yml, pnpm-workspace.yaml, compatibility.json?}
~/.dsh/profiles/desktop/node_modules/          # 已装第三方插件（含完整 TSX 源码）
~/.dsh/profiles/desktop/.plugin-manager/logs/  # pnpm.log / git.log
~/.dsh/sessions/--<normalized-cwd>--/<session-id>/session.v4.jsonl.zstd
~/.dsh/storages/{workspace.json, mcp_connector.json, session_projcache/}
~/.agents/{AGENTS.md, skills/}                 # ★ 跨工具共享根，我们的 memory/ 放这里
```

## 16. 来源

**官方**
- https://github.com/deepseek-ai/deepseek-harness · https://deepseek-harness.github.io/deepseek-harness/ · https://deepseek.com/harness
- `docs/user/develop/{basic,framework,practice}/*`、`docs/cordis-tutorial/*`、`docs/cordis-api/{context,service,events,registry}.md`、`docs/cordis-primer.md`、`docs/rescope.md`
- `docs/cookbook/{extension-cookbook,adding-a-tool,adding-a-settings-card,adding-an-llm-adapter,adding-a-plugin-preview,adding-a-package}.md`
- `docs/subsystems/{slots,client-modules,client-resources,web-client,settings,storage,persistence,session,core,tools,commands,skills,system-prompt,compaction,filesystem,workspace,boot,extensions,mcp,claude-code-mods,sidebar-right,ssh}.md`
- `docs/{web-styling,ui-radius,persistence-catalog,agent-lifecycle,event-producer-consumer,config-catalog,architecture,development}.md`、`docs/defensive-patterns/client-components.md`
- `docs/user/guide/{plugin-market,mcp-memory,public-deployments}.md`
- `docs/upgrade-guide/{v0.2.0-rc.2/subpath-plugin-display-manifest, v0.2.1-alpha.1/plugin-option-placement, v0.2.1-alpha.2/plugin-install-over-installed, v0.2.1-alpha.3/plugin-engines-dsh}/guide.md`
- `packages/util/{package-manifest,home-paths,plugin-market-index}/`、`packages/storage/storage-{json,sqlite}/`、`packages/session-query/session-query/`、`packages/boot/{app-boot,plugin-manager,config-editor}/`、`packages/context/agent-instructions/`、`packages/skill/skill-filesystem/`、`packages/experimental/hooks-{claude-code,codex}/`
- `packages/extensions/cordis-client-runner/src/client/slot-catalog.ts`、`packages/client/{ui-primitives,ui-slots,ui-renderer,modules,web,ui-plugin-manager,ui-settings-plugins,ui-settings-shell}/`
- `packages/bundle/{base,web-app}/cordis.patch.yml`、`apps/{cli,desktop,plugin-market-generator}/`
- Discussions：https://github.com/deepseek-ai/deepseek-harness/discussions/961 （实战踩坑）· /discussions/2269 （市场识别层 STANDARD.md 提案）
- 发现机制：GitHub topic `dsh-plugin` → https://github.com/topics/dsh-plugin

**业界记忆方案**（完整来源见 [01 §4](01-product-vision.md#4-竞品能力矩阵)）
- OpenAI：https://openai.com/index/memory-and-new-controls-for-chatgpt/ · https://openai.com/index/chatgpt-memory-dreaming/
- Anthropic：https://code.claude.com/docs/en/memory · https://claude.com/resources/articles/context-management · https://claude.com/resources/articles/claudes-memory-works-everywhere-and-you-decide-whats-in-it · https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills · https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- 逆向分析：https://embracethered.com/blog/posts/2025/chatgpt-how-does-chat-history-memory-preferences-work/ · https://www.shloked.com/chatgpt-memory · https://harrisonsec.com/blog/claude-code-memory-simpler-than-you-think/ · https://mnemoverse.com/docs/library/anthropic-memory-api-no-ranked-retrieval
- 论文：MemGPT https://arxiv.org/pdf/2310.08560 · mem0 https://arxiv.org/html/2504.19413v1 · Zep https://arxiv.org/html/2501.13956v1 · sleep-time https://arxiv.org/html/2504.13171v1 · MemoryOS https://arxiv.org/abs/2506.06326 · Agentic Git https://arxiv.org/html/2508.00031v2 · 记忆投毒系统研究 https://arxiv.org/html/2606.04329v1
- 安全：https://unit42.paloaltonetworks.com/indirect-prompt-injection-poisons-ai-longterm-memory/ · https://christian-schneider.net/blog/persistent-memory-poisoning-in-ai-agents/
- 标准：https://agents.md/
