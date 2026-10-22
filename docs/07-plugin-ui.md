# 07 · 插件页前端设计（dsh 侧栏一等主面板）

> 目标：一个能被 dsh 管理、桌面/浏览器/手机三端同一份 bundle、不违反任何官方样式与模块约束的记忆管理面板。

## 1. 形态决策与官方约束

### 1.1 选定形态

**侧栏一等主面板**：`sidebar.panellist`（list, root）注册图标 + `main`（keyed, root）用**同一个 id** 注册面板 —— 与内置的 Plugins、Task Manager 平级。官方 slot 文档原文：*"Each list id addresses the matching main panel"*。

辅助入口（不占额外架构成本，按需叠加）：

| slot | 用途 | cardinality |
|---|---|---|
| `sidebar.panellist` | 侧栏图标（一等入口） | list，需 `id` + `order` |
| `main` | 中央面板（`key` = 侧栏 entry id） | keyed |
| `conversation.input.dock` | **写入确认卡**（`writeMode: suggest` 时） | list |
| `plugins.bundle.config` / `plugins.row.config` | Plugins 页里的配置卡片（复用官方设置表单，owner 给 `view:'summary'\|'page'` 与 `form?: ConfigPageForm`） | — |
| `settings.section` | 设置里的独立分区（放全局开关与预算） | list |
| `workspace.toast` | 固化完成 / 冲突待裁决 / 预算超限 通知 | list |

⚠️ `main` 的 `keyDomain: 'conversation'` 已被内置占用，我们用 `key: 'general-memory'`。⚠️ 复用已占用的 slot `id`/`key` 会**替换**内置 UI（slot-catalog 标记为 `replaceRisk: 'shadows-shipped-ui'`），必须避开。

### 1.2 必须遵守的官方硬约束

| 约束 | 原文/依据 | 我们的做法 |
|---|---|---|
| **禁止 iframe / Host 提供 HTML 页** | *"Render plugin pages as React components in a slot. Do not serve an HTML page from the Host and embed it in an iframe: an iframe document does not receive the host's theme tokens, light/dark switching, or `ctx.locale`."* | React 组件注入 slot |
| **禁止 import 宿主 client 包** | `practices.md` 明确禁止 `require('@deepseek-ai/dsh-client-ui-primitives')` 等；`dsh.client.inject` 里的包名**只用于排序激活**，且「change without notice」 | 控件自己写，markup/CSS/行为从 primitive 拷进来、类名换成 `.gam-*` 前缀 |
| **只用主题 token** | feature 包只消费 `--dsw-alias-*`；**禁止写死颜色**、禁止在 feature CSS 里写主题选择器（`ui-theme` 拥有 `--dsw-*` 静态刻度、语义别名、排版、动效、阴影、滚动条与明暗偏好） | 全部颜色/间距/圆角走 `--dsw-alias-*`；字面颜色只用于 artwork（图标、图谱节点色） |
| **组件拿不到 `ctx`** | slot 组件的私有数据只能通过注册项的 `inject` 工厂传（返回 `{...callbacks, hooks:{status}}`，renderer 会把 `hooks:{status}` 变成 `useStatus(selector)` prop） | `inject: () => ({ t, api })`，`api` 是我们自己的 fetch 封装 |
| **不替换 app root / 不往 body 追加第二个应用 / 不读别的插件 DOM** | `practices.md` | 严格限定在自己的 slot 子树内 |
| **CSS Modules + clsx**；**禁止组件库与 Tailwind** | `docs/web-styling.md` | CSS Modules，类名 `.gam-*` |
| **client bundle 必须是 lazy-CJS factory 格式** | `window.__ModuleLoader__.load({ id, factory(require) })`，`id` **必须等于包名** | 自己复刻构建（官方 tsdown preset `packages/client/tsdown.client.ts` **未发布成包**） |
| **抛错的组件会让 slot 空白** | console 只留 `slot entry crashed in '<slot>'` | 每个视图包 ErrorBoundary，降级到文本视图而不是白屏 |

### 1.3 浏览器基线模块（能 require 什么）

实测官方 client bundle 的 `require()` 统计：`react`(46)、`react/jsx-runtime`(50)、`react-dom`(11)、`@deepseek-ai/cordis`(10)、`@deepseek-ai/dsh-client-ui-primitives`(45)、`@deepseek-ai/dsh-client-store`(31)、`zod`(2)、`@tanstack/react-virtual`(2)。React 版本 **18.3.x**。

**结论与决策**：虽然 `zod` 与 `@tanstack/react-virtual` 出现在基线里，但官方只保证 `react` / `react/jsx-runtime` / `@deepseek-ai/cordis`（`practices.md` 口径）。因此：

- ✅ 硬依赖：`react`、`react/jsx-runtime`、`@deepseek-ai/cordis`
- ⚠️ `@tanstack/react-virtual`：**不硬依赖**。长列表自己实现窗口化（≈60 行：`scrollTop` + 固定行高 + overscan），条目数上限也就几千条
- ✅ `zod`：已进入官方 client 模块表，可以在浏览器半侧用（但我们把校验都放 Host 侧，client 保持零依赖更稳）
- 若确需额外模块 → 声明 `dsh.client.external`（只声明**非 baseline** 的精确请求；type-only import 会被擦除、不产生请求）

## 2. 打包与注册骨架

### 2.1 `package.json`（前端相关部分）

```jsonc
{
  "name": "dsh-general-automatic-memory",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".":                { "types": "./lib/types/index.d.ts",        "default": "./lib/index.js" },
    "./client":         { "types": "./lib/types/client/index.d.ts", "default": "./lib/client.js" },
    "./locale/*.json":  "./locale/*.json",
    "./icon":           "./icon.svg"
  },
  "files": ["lib", "locale", "icon.svg", "cordis.patch.yml", "README.md"],
  "icon": "icon.svg",
  "engines": { "dsh": ">=0.2.1-rc.2 <0.3.0", "node": "^22.19.0 || >=24.0.0" },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "platform": "web",          // 唯一合法值（实测 79/79 官方包）
      "immediately": false,       // 懒物化：不打开面板就不加载 bundle
      "inject": ["@deepseek-ai/dsh-client-ui-conversation"]   // 仅排序激活，不是 import 许可
    }
  }
}
```

图标约束：SVG/PNG/JPEG/WebP，**≤256 KiB**，realpath 后必须在包内（绝对路径/URL/离开包的 symlink 一律拒）。`locale/{en,zh}.json` 必须含 `meta.title` / `meta.description`（Plugin Manager 与 Settings 在**不激活插件**的情况下读取它们），且 `exports` 与 `files` 都要带上。`LocalizedText` 对象形式**必须含 `en`**。

### 2.2 Host 半侧 `index.js`

```js
export const name = 'general-memory'
export const inject = ['tools', 'commands', 'systemPrompt', 'settings', 'webServer']  // 只放必需服务
export { Config } from './config.js'      // schemastery，不是 JSON Schema，也不是普通对象

export function apply(ctx, config) {
  const api = createMemoryApi(ctx, config)         // 唯一契约层
  registerTools(ctx, api, config)                  // 6 个
  registerCommands(ctx, api)                       // 3 个
  registerHttpRoutes(ctx, api)                     // /general-memory/*
  registerInjection(ctx, api, config)              // systemPrompt.context + agent/pre-step
  registerIngest(ctx, api, config)                 // session/event 监听
  registerCurator(ctx, api, config)                // 定时 + 空闲 + 阈值
  // 可选服务一律 ctx.get()，不写进 inject
  const sessionQuery = ctx.get('sessionQuery')     // web profile 可能未挂载
}
```

⚠️ Host 半侧**不能为空**（官方 decoration 模板里 Host 半侧确实可以是 `export function apply(){}`，但那是纯装饰插件）。我们需要它承载全部逻辑；client 半侧只是视图。

### 2.3 Client 半侧 `client.js`（构建产物形态）

```js
window.__ModuleLoader__.load({
  id: 'dsh-general-automatic-memory',          // 必须 === 包名
  factory(require) {
    const React = require('react')
    const { MemoryPanelIcon } = require('./client/icon.js')
    const { MemoryPanel } = require('./client/panel.js')
    return {
      name: 'general-memory',
      inject: ['slots', 'locale'],
      apply(ctx) {
        const NS = 'general-memory'
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), `${NS}: dictionaries`)
        const t = ctx.locale.bind(NS)
        const api = createClientApi()          // 纯 fetch 封装，不碰 ctx

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: NS, order: 350,
          label: () => t('panel.title'),
          inject: () => ({ t, size: 'default' }),
        }, MemoryPanelIcon))

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: NS, order: 100,
          inject: () => ({ t, api }),
        }, MemoryPanel))

        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock', id: `${NS}-confirm`, order: 40,
          inject: () => ({ t, api, hooks: { status: usePendingWrites } }),
        }, WriteConfirmCard))
      },
    }
  },
})
```

**构建**：`tsdown`（官方用 `^0.22.2`）打 ESM → 再包一层 lazy-CJS wrapper。官方 preset 未发布，必须在仓库里自己维护 `tsdown.client.ts` 并加一个格式断言测试（产物首行必须是 `window.__ModuleLoader__.load({`，`id` 必须等于 `package.json.name`）。

**装载链路**（理解它才能调对 bug）：Host 扫所有 enabled Loader 条目里声明 `dsh.client` 的包 → 组 boot graph → 注入 `window.__DSH_BOOT__`（`<` 被转义防脚本逃逸）→ 浏览器通过 combo 路由 `GET /plugins/??<pkg>/client.js&rev=<rev>` 取脚本（每 phase 在 URL 超 3 KiB 前分区）→ 执行只注册 factory，**模块体副作用（含 CSS 注入）在物化时才跑**。`rev` 由 `mtimeMs`/`ctimeMs`/`size` 派生（**非内容哈希**）；Desktop 给 plugin bundle 响应打 `no-store`；未知资源/revision → 404；缺 bundle 会「fail activation loudly with one build instruction」。

## 3. 前后端通信

**选定：Host `ctx.webServer.register` + Client 同源 `fetch`**（第三方最常用、最省事；本机已装的 `dsh-easyrewrite@2.6.0` 就是这么做的，注册了 9+ 条 `/bubble/*` 路由并自带同源守卫）。

不用官方 Typert Remote（`ctx.remote.*`）的理由：Remote 的方法集由 `dsh-api-remotes` 的 `API_REMOTE_FORWARDED_EVENTS` 白名单决定，第三方新增命名空间成本远高于自建路由。

### 3.1 安全守卫（每个路由必过）

dsh 的浏览器认证模型（实测）：每进程 mint 一个随机 launch token → `?token=...` 只在 `GET /` 接受 → 换成 authority-bound 签名 cookie（host-only、`Path=/`、`HttpOnly`、`SameSite=Strict`、默认 30 天、绑定 hostname+port、TLS 时才 `Secure`）→ 302 到干净 `./`。所有请求先过 `Host`/`Origin` 信任检查（loopback / bind IP / `trustedHosts`），`sec-fetch-site: cross-site` 拒绝；失败 403，可信未认证 401。`dsh web --host 0.0.0.0` **不支持**。

我们的路由**必须自己再加一层**（宿主的认证不等于授权）：

```js
function guard(req, res) {
  if (!sameOrigin(req)) return json(res, 403, { error: 'cross-origin' })
  if (req.method !== 'GET' && !isJson(req)) return json(res, 415, { error: 'bad-content-type' })
  if (isMutating(req) && !csrfTokenOk(req)) return json(res, 403, { error: 'csrf' })
  return true
}
```

写操作额外要求 `x-gam-nonce`（面板加载时由 Host 下发的一次性 token），防同源页面里的其他脚本误触。

### 3.2 路由表

| 路由 | 方法 | 入参 | 出参 | 服务视图 |
|---|---|---|---|---|
| `/general-memory/stats` | GET | — | 预算水位、条目数按 kind/scope、`recall-stats`、缓存健康、告警列表 | Overview |
| `/general-memory/entries` | GET | `kind,scope,project,tag,q,activation,sort,offset,limit` | `{total, items:[{id,kind,title,summary,scope,confidence,source,heat,hits,lastUsedAt,path,rev}]}` | Browse |
| `/general-memory/entry` | GET | `id` \| `path`, `rev?` | 全文 + frontmatter + 关联条目 + 溯源链 | Editor |
| `/general-memory/entry` | PUT | `{id, body, frontmatterPatch, expectedRev}` | `{ok, rev, checksum}` 或 `409 {rev}` | Editor |
| `/general-memory/entry/invalidate` | POST | `{id, reason, supersededBy?}` | `{ok, archivedTo}` | Editor / Browse |
| `/general-memory/entry/restore` | POST | `{id}` | `{ok}` | Recovery |
| `/general-memory/entry/delete` | POST | `{id, hard, confirm}` | `{ok, purged:{index,vectors,audit}}` | Editor（二次确认） |
| `/general-memory/graph` | GET | `limit?`（`entity?` 兼容旧调用） | `{nodes, edges, projects, nodeTypes, relTypes, sources, tags, total, limit, truncated, mermaid}` | Graph |
| `/general-memory/timeline` | GET | `from, to, kind?, asOf?` | 按天聚合的 episode + 审计 + **时点有效条目集** | Timeline |
| `/general-memory/audit` | GET | `act?, actor?, from, to, limit` | 流水行 | Audit |
| `/general-memory/import/scan` | POST | `{source, path?}` | dry-run 预检报告（新增/更新/冲突/跳过/PII/预算影响） | Portability |
| `/general-memory/import/apply` | POST | `{source, selected:[…]}` | `{added, updated, skipped, snapshot}` | Portability |
| `/general-memory/export` | POST | `{format:'gam-zip'\|'projection', targets:[…]}` | `{path, bytes, excluded:{pii,shareable}}` | Portability |
| `/general-memory/projections` | GET/POST | `{target, enabled}` | 各投影目标状态 + 最后生成时间 + 重叠度告警 | Portability |
| `/general-memory/snapshots` | GET | — | `[{label, trigger, createdAt, entryCount, bytes}]` | Recovery |
| `/general-memory/snapshots/diff` | GET | `a, b` | 逐条增删改 | Recovery |
| `/general-memory/snapshots/restore` | POST | `{label, ids?}` | `{ok, preRestoreSnapshot}` | Recovery |
| `/general-memory/doctor` | POST | `{fix:bool}` | 12 项检查结果 + 已修复项 + 备份路径 | Recovery |
| `/general-memory/sync/state` | GET | — | 设备列表、位点、outbox 长度、冲突数 | Sync |
| `/general-memory/sync/conflicts` | GET/POST | `{id, resolution}` | 冲突并排 diff + LLM 合并建议 + 裁决 | Sync |
| `/general-memory/config` | GET/PUT | — | 当前 Config + schema（走 `ctx.configForms`） | Settings |
| `/general-memory/pending-writes` | GET/POST | `{id, decision:'accept'\|'edit'\|'reject'}` | suggest 模式的待确认候选 | 确认卡 |

**轮询而非推送**：dsh 的 `domain/changed` 事件**仅进程内**（官方记录的已知限制），跨进程推送不可用。面板用 2 s 间隔轮询 `stats` + `pending-writes`，页面不可见时（`document.hidden`）停轮询。

## 4. 信息架构与视图规格

面板布局：左侧二级导航（图标 + 文字，可折叠）+ 中央内容区 + 右侧详情抽屉（宽屏）。窄屏（手机）退化为单栏 + 底部 tab + 全屏抽屉。

```
┌──┬──────────────────────────────────────────────────────────────┐
│图│  总览 Overview                                    [刷新][体检] │
│标│ ┌────────────┬────────────┬────────────┬────────────────────┐ │
│ ·│ │ 注入预算    │ 前缀缓存    │ 条目统计    │ 告警               │ │
│总│ │ 环形水位    │ verbatim   │ 按 kind     │ ⚠ 常驻层接近上限   │ │
│览│ │ 2.1% / 3%  │ 71%        │ 128 条      │ ⚠ 2 个同步冲突     │ │
│浏│ └────────────┴────────────┴────────────┴────────────────────┘ │
│览│  最近写入 · 召回热点 · 固化任务进度                            │
│编│                                                                │
│辑├──────────────────────────────────────────────────────────────┤
│族│  内容区（按导航切换）                                          │
│谱│                                                                │
│时│                                                                │
│移│                                                                │
│恢│                                                                │
│同│                                                                │
│设│                                                                │
│审│                                                                │
└──┴──────────────────────────────────────────────────────────────┘
```

### 4.1 总览 Overview

**目的**：一眼回答"记忆系统健康吗？花了多少 token？有没有需要我处理的事？"

| 区块 | 内容 | 数据源 |
|---|---|---|
| 注入预算环 | 三档（常驻/目录/动态）实测 token 与占比，阈值刻度线；超标变红 | `ctx.tokenMeter.measure()` 的真实值，**不是字符估算** |
| 前缀缓存健康 | `verbatimRate`（越高越好）、`prefixBreaks`（必须趋近 0）、近 7 天趋势 | `recall-stats.cacheHealth` |
| 条目统计 | 按 kind 堆叠条 + 按 scope 分布 + 总量/总字节 + 周增长率（膨胀指标） | `stats` |
| 告警中心 | 索引漂移、派生文件被手改、预算超限、同步冲突、写入突增（投毒信号）、PII 命中、孤儿条目 | doctor 结果 |
| 召回质量 | `zeroHit` 率、`gated` 被门控数、工具调用次数、命中率按 kind | `recall-stats` |
| 最近写入 | 时间倒序 10 条，带 `decision` 与 `reason`，一键撤销 | `audit` |
| 固化任务 | 进度条 + 本次合并/归档/晋升条数 + **可中止** + 日志展开 | curator 状态 |

**空态**：全新安装时显示"还没有记忆。说点什么让它记住，或者从其他工具导入。"+ 两个 CTA（`导入` / `查看示例`）。

### 4.2 浏览 Browse

- 过滤条：kind（8 个 chip，多选）、scope（global/project 下拉）、project 选择器、tag 云、activation、confidence、source、时间范围
- 搜索框：走 L1 FTS（BM25），后端不可用时降级到 L0 前端过滤；支持 `kind:feedback 鉴权` 这种字段限定语法
- 列表：窗口化虚拟滚动（自实现，见 §1.3）；每行 = `title` + `summary`（单行省略）+ kind 色标 + confidence 点 + source 图标 + heat 条 + `hits`/`lastUsedAt`
- 排序：heat / 最近使用 / 最近写入 / 修订数 / 标题
- 批量选择 → 批量归档 / 批量改 tag / 批量导出
- 行内快捷操作：钉住（`explicitBoost = 1`）、归档、失效、复制 id、在编辑器打开
- 点击行 → 右侧详情抽屉（宽屏）或全屏页（窄屏）

### 4.3 编辑器 Editor

**双模式切换**：`渲染视图`（Markdown 渲染 + frontmatter 表单）↔ `原始 Markdown`（纯文本编辑，等宽字体，行号）。默认渲染视图，因为大多数用户改的是正文而不是元数据。

- frontmatter 表单：按 [03 §4.1](03-memory-format.md#41-frontmatter-字段全表) 的字段分组（基本 / 分类 / 激活 / 可信度 / 时间 / 关联 / 隐私），枚举用下拉，日期用日期选择器，id 列表用带搜索的多选
- 正文编辑：纯 textarea + 轻量语法高亮（自实现，不引编辑器库）；`feedback` 类显示三段式模板提示（规则 / **Why:** / **How to apply:**）
- 保存：`expectedRev` 乐观锁 → 409 时提示"另一处已修改"并展示双方 diff；保存后重算 checksum、增量重建索引、写审计
- 变更历史：`revisions` 列表，可查看任一历史版本、可回滚到该版本
- 溯源面板：`provenance` 全字段可视化 + `derivedFrom` 链（点进去看它由哪些 episode 提炼）+ "打开原始会话"（若 `sessionId` 存在且 `ctx.sessionQuery` 可用）
- 关联面板：`relates` / `conflictsWith` / `supersededBy`，可点击跳转
- 危险操作区：失效（可逆）/ 硬删除（二次确认，输入 id 后 4 位）

### 4.4 族谱 Graph

**自绘 SVG，不引第三方图库**（既因为禁止 import 宿主包，也因为体积与可控性）。0.2.x 起族谱从「邻接表 + 一张固定力导向图」重做成**可缩放、可筛选、可多维分析**的视图，Host 侧负责确定性建模，面板侧负责交互与避让。

**Host 侧 `buildGraph()`（`src/host/graph.ts`）**

- 输入：全部有效 `relations` 条目；`invalidatedAt != null` 一律排除
- 实体维度：`project / code / person / team / action / system / concept` 七类；按项目条目标签、`属于/部署于` 关系、人员标签、代码/系统/操作词表**确定性推断**，并始终保留原始实体名
- 项目归属：按关系类型加权投票（`属于/部署于` 权重最高，`负责` 次之），避免一条跨项目关系把两端拉进同一项目；节点可归属多个项目，`projects[0]` 为主项目
- 跨项目：两端实体主项目不同即 `crossProject = true`，用于「只看跨项目」与项目依赖分析
- 关系边：一条 `entities` 超过 2 个时，以第一个实体为主语派生多条边，`entryId` 仍指向同一条记忆；关系类型收敛为 `owns/belongs/depends/uses/hosts/participates/supersedes/conflicts/related`
- facet：项目 / 实体类型 / 关系类型 / 置信度 / 来源 / 标签，供面板多维筛选；`relation` 与关系词本身不会进标签筛选
- 性能护栏：默认只载入最近 `800` 条关系记忆（`limit` 上限 `3000`），`truncated` 与 `total` 让面板明确告知裁剪范围；Mermaid 由 Host 与客户端各自生成，导出时对引号/竖线转义

**面板侧（`src/client/graph.tsx`）**

- 三种视图：**图谱 / 列表 / 洞察**
  - 图谱：力导向、按项目分组、按实体类型分组；滚轮缩放、拖拽平移、双击定位、键盘 `+/-/0/F/Esc`、双指捏合；跨项目边加粗虚线；标签做**碰撞避让**（选中/命中优先，放下 → 上 → 右 → 左，放不下不画），并随缩放 LOD 增减标签与关系词
  - 列表：按项目 / 关系 / 置信度 / 不分组；分片加载，搜索只过滤当前列表
  - 洞察：项目画像、项目 × 实体类型矩阵、跨项目依赖、关键实体；点卡片/单元格可直接回灌图谱筛选
- 筛选：项目、实体类型、关系类型、置信度、来源、标签、时间范围、只看跨项目；同维度 OR、跨维度 AND，已选条件以可移除 pill 呈现
- 侧栏：未选中时给项目概览与关键实体；选中后给类型、当前可见关联数、项目 chips、只看关联、定位、复制名称，以及可点开的源关系列表
- **降级**：多项目默认按项目分组；>240 节点再自动分组并提示；>800 条关系默认裁剪并可「加载更多」，避免面板与移动端卡死

### 4.5 时间线 Timeline

- 纵向时间轴，按天聚合：当天的 episode（`topic` + `outcome`）、写入/固化/导入事件、会话边界
- **时点视图（bi-temporal 的兑现）**：顶部一个日期选择器，选中某天后，列表显示"**当时有效**"的条目集合（`validFrom ≤ asOf < invalidatedAt`）。用来回答"为什么 agent 那时候做了那个决定"
- 对比模式：选两天 → 并排展示差异（新增/失效/修改）
- 每条可展开看原文、可跳转条目

### 4.6 导入导出 Portability

- 导入：来源卡片网格（12 个来源，见 [06 §2](06-portability.md#2-导入器矩阵in)），每张显示"检测到 / 未检测到"与路径；点卡片 → 扫描 → **dry-run 预检报告**（新增/更新/冲突/跳过/PII/预算影响）→ 逐条勾选表格（可全选新增）→ 应用 → 结果与快照标签
- 冲突条目并排 diff（左：现有，右：导入），三个选择：保留现有 / 采用导入 / 都留（标 `conflictsWith`）
- 导出：`.gam.zip`（勾选 kinds/scopes，显示将排除的 PII 数量）/ 投影产物预览 / 单条导出为 Markdown
- 投影管理：10 个目标的开关矩阵，每个显示最后生成时间、字节数、**与常驻层的重叠度告警**（>30% 变黄，防双注入浪费）；点"预览"看将写入的受管区块内容
- 纯链接条目（`linkOnly: true`）单独一区，显示指向的外部文件与其大小、是否存在（失效指针标红）

### 4.7 恢复与体检 Recovery

- 快照列表：label / trigger / 时间 / 条目数 / 字节；选两个 → diff（增/删/改三栏，改的并排展示）→ 选择性回滚（勾选条目）或全量回滚；回滚前提示"将自动创建 pre-restore 快照"
- doctor 体检：12 项检查结果分组（error/warn/info），每项显示受影响条目数、可否自动修复、修复动作说明；"全部自动修复"按钮（会先建快照）
- 索引重建：一键删除全部派生物并重建，显示耗时
- schema 迁移状态：当前 `schemaVersion`、可用迁移、上次迁移时间与快照

### 4.8 同步 Sync

- 设备列表：名称、最后在线、条目数、位点时钟、schema 版本；本机高亮
- 传输方式选择：git（显示 repo 状态、待 push 提交数）/ zip / 后端（S3/WebDAV/HTTP，凭据走 `role('secret')` 字段**不出现在表单响应里**）
- outbox 队列：待推送变更列表，可重试、可丢弃
- 冲突裁决：并排双方原文 + LLM 语义合并建议（可编辑）+ 三个按钮（采用 A / 采用 B / 采用合并建议）；裁决后双方原文进 archive
- 同步历史：最近 50 次 push/pull 的时间、条目数、耗时、结果

### 4.9 设置 Settings

优先复用官方表单：导出的 `Config`（schemastery）会让官方设置页**自动生成表单**，需要控制存活期时用 `ctx.configForms.whileServed([NS], register)`，并把卡片注册到 `plugins.bundle.config` / `plugins.row.config`（⚠️ **不是 `plugins.item`**，那个 key 在当前版本已重排）。面板内的 Settings 视图只做**分组导航 + 深链**到官方表单，外加官方表单表达不了的东西：

- 预算滑块的**实时预览**（改 `budget.alwaysChars` → 立刻显示"常驻层将变成 N 字符 / 占比 X%"）
- 配置预设：`保守`（writeMode=manual，只 always 层）/ `平衡`（默认）/ `激进`（auto 写、L2 向量开、预算翻倍）
- 一键导出/导入配置
- 危险区：清空全部记忆（需输入 `DELETE`）、重置为出厂默认

### 4.10 审计 Audit

- 只读表格，虚拟滚动；过滤 `act`（16 种）/ `actor` / 时间 / kind / 条目 id
- 每行展开看完整 JSON
- `gate-drop` 行特殊高亮（反向指标：被相关度门控裁掉的候选，点开显示"差多少分、为什么"）
- 导出为 jsonl / csv
- 保留期设置与滚动压缩状态

## 5. 会话内组件

### 5.1 侧栏图标（`sidebar.panellist`）

- owner props：`{ size, active }`；`active` 时高亮
- 徽标：待确认写入数 / 冲突数（红点，最多显示 9+）
- 图标：单色 SVG，`currentColor`，随主题明暗自适应；artwork 部分可用字面色

### 5.2 写入确认卡（`conversation.input.dock`）

`writeMode: suggest` 时出现。**这是建立用户信任的最重要组件**，设计要点：

```
┌────────────────────────────────────────────────────────────┐
│ 🧠 要记住这条吗？                          [feedback] [global] │
│ 改完代码后不要加总结                                          │
│ ▸ 展开查看完整正文与来源                                      │
│                        [改一下] [不要] [记住]   15s 后自动忽略 │
└────────────────────────────────────────────────────────────┘
```

- 高度 ≤3 行（折叠态），不遮挡输入框
- **15 秒无操作自动收起为静默 NOOP** —— 绝不打断当前任务，绝不因为用户没点就偷偷写
- `[改一下]` 展开为内联编辑器，改完直接落盘
- 多条候选排队时只显示最新一条 + "还有 N 条"（对标前作 `maxPacketItems: 2` 的克制）
- 永远显示来源标签（`user-stated` / `model-inferred`），让用户知道这是谁的主张

### 5.3 注入透明化（可选，`conversation.chat.node` 的 turn-tail）

在每个 turn 末尾显示一行极简信息：`记忆 2.1% · 命中 3 条 · [查看]`，点击展开本轮实际注入了哪些条目、各花多少字符。

**产品理由**：ChatGPT 画像"不可逐字编辑、看不到全部"是被吐槽最多的一点。让注入内容随时可见，是廉价的信任来源。默认关闭（怕吵），设置里可开。

### 5.4 通知（`workspace.toast`）

只用于三类**需要用户动作**的事：固化完成且有异常、同步冲突待裁决、预算超限。常规成功不打扰。

## 6. 跨平台适配

**核心事实**：`dsh.client.platform` 唯一合法值是 `'web'`；Desktop 只是把 Host webserver 的 URL 装进 `BrowserWindow`；手机/平板浏览器访问同一 Host URL 得到同一页面同一 bundle。**所以 UI 天然三端复用，无需平台分支**（平台差异只在 Host 侧，如 `ctx.get('profileContext')?.name === 'desktop'`）。

需要做的只是**响应式**：

| 断点 | 布局 | 说明 |
|---|---|---|
| ≥1200 px | 三栏：导航 + 列表 + 详情抽屉 | 桌面全屏 |
| 768–1199 px | 两栏：导航（可折叠为图标条）+ 内容，详情走抽屉覆盖 | 桌面小窗 / 平板横屏 |
| <768 px | 单栏 + 底部 tab 导航 + 全屏详情页 | 手机 / 平板竖屏 |

- 用 CSS 容器查询 + 媒体查询组合（面板在 slot 里，容器宽度不等于视口宽度）
- 触摸目标 ≥44 px；图谱在触摸设备上启用拖拽/双指缩放
- 不假设 hover（移动端用长按菜单替代 hover 操作）
- 明暗主题全部走 `--dsw-alias-*`，**不写主题选择器**（宿主 `ui-theme` 拥有明暗偏好）
- 移动端访问路径：dsh 官方无移动客户端，官方路径是把 Web Host 部署出去由手机浏览器访问（`docs/user/guide/public-deployments.md`、`docs/subsystems/ssh.md`）→ 我们的面板必须在公网部署下也正常（同源相对路径 fetch 已满足；不要写死 `127.0.0.1:3080`）

## 7. CLI / headless 降级

dsh 官方**不发布 TUI**（shipped bundle 只有 `base`/`web-app`/`headless`/`sdk-app`/`sdk-minimal`/`acp-app`），官方降级路径原文：`UI (GUI; CLI emits JSONL)`。

| 面板视图 | CLI 等价物 |
|---|---|
| Overview | `/memory status`（文本表格）/ `--json` |
| Browse | `/memory search <q>` / `--json` |
| Editor | `/memory read <id>` + 用 `$EDITOR` 打开文件（`ctx.settingsController.openSettingsDocument()` 同类能力） |
| Graph | `/memory graph <entity>`（打印 Mermaid 文本 + 邻接表） |
| Timeline | `/memory timeline --from --to` |
| Portability | `/memory import <source>` / `/memory export` |
| Recovery | `/memory doctor [--fix]` / `/memory restore <label>` |
| Sync | `/memory sync` |
| Settings | 官方 Plugins 页配置表单（dsh 自带）或改 `cordis.patch.yml` |
| Audit | `/memory audit --act write` |

**设计原则 P7 的兑现**：面板上没有任何一个操作是"只能点鼠标"的。

## 8. 状态管理与数据获取

不引第三方状态库（基线里没有，`dsh.client.inject` 的包不可依赖）：

- `useGam(path, opts)`：自写 fetch hook（≈50 行），管 loading/error/data/轮询/AbortSignal/`document.hidden` 暂停
- `useGamMutation(path)`：POST/PUT + 乐观更新 + 409 冲突处理
- 跨视图共享状态用一个极简 store（`useSyncExternalStore`，React 18 内置）
- 长列表窗口化自实现（固定行高 + `scrollTop` + overscan 5）
- 所有列表数据服务端分页（`offset`/`limit`），不做客户端全量加载

## 9. 错误处理与防御

官方有专门的 `docs/defensive-patterns/client-components.md`，且实测行为是：**组件抛错只会让该 slot 空白**，console 里只留一行 `slot entry crashed in '<slot>'` —— 用户看到的是"图标点了没反应"，极难排查。

对策：

1. 每个视图外层包 `ErrorBoundary`，降级为「本视图出错 + 错误摘要 + 重试按钮 + 复制诊断信息」，**绝不白屏**
2. 面板顶部有一个常驻的"诊断"折叠区：显示 client bundle 版本、Host 路由可达性、`stats` 最后一次成功时间、schema 版本是否匹配
3. Host 路由不可用时（`ctx.webServer` 未挂载），面板显示明确指引而不是无限 loading
4. 所有 fetch 有超时（10 s）与重试（幂等 GET 最多 2 次）
5. schema 不匹配（Host 与 client 版本不一致，例如只更新了一半）→ 显示"请重启 dsh"而不是渲染错乱数据

## 10. 可访问性

- 全键盘可达：`Tab` 顺序、`Esc` 关抽屉、`/` 聚焦搜索、`j/k` 列表上下、`Enter` 打开、`Cmd/Ctrl+S` 保存
- ARIA：导航 `role="navigation"` + `aria-current`；列表 `role="list"`/`listitem`；抽屉 `role="dialog"` + `aria-modal` + 焦点陷阱与恢复；图谱提供 `aria-label` 摘要与**等价的表格视图**（图无法被读屏软件理解，必须有文本替代）
- 对比度全部由 `--dsw-alias-*` 保证（不自定义颜色就不会破坏对比度）
- 动效遵守 `prefers-reduced-motion`
- 色标之外必须有形状/文字冗余（kind 既有色标也有文字标签），照顾色觉障碍

## 11. i18n

```js
// locale/zh.json（meta 部分被 Plugin Manager 在不激活插件时读取）
{ "meta": { "title": "通用自动记忆", "description": "跨工具、可编辑、可恢复的分层长期记忆" } }
```

- 运行时字典：`ctx.locale.register('general-memory', { zh, en })`（必须在 `ctx.effect` 里）→ `const t = ctx.locale.bind(NS)` → `t('panel.title')`
- slot 注册项的 `locale: NS` 字段把 slot label 绑到该字典
- **所有可见文本必须走 locale service**，包括 `aria-label`、`title`、toast、错误消息、空态文案
- 语言 id 正则 `/^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/u`；对象形式必须含 `en`
- 日期/数字格式化用 `Intl`，跟随 `ctx.locale` 当前语言；**但注入到 prompt 的文本一律用固定格式**（原则 P4，不受 locale 影响）
- README 双语：`README.md` + `README.zh.md`（`README.i18n.yaml` 配对校验是 DSH 仓库内部约定，第三方不强制）

## 12. 视觉规范

| 项 | 规范 |
|---|---|
| 颜色 | 只用 `--dsw-alias-*`（运行时可用 `cordis_inspect_query` 的 `Theme` provider 列出全部）；字面色仅限 artwork |
| 圆角 | 遵循官方 `docs/ui-radius.md` 的刻度，不自创值 |
| 间距 | 4 px 基准网格（4/8/12/16/24/32） |
| 字体 | 继承宿主排版 token；正文 13 px、标题 15/18 px、代码等宽用宿主 token |
| kind 色标 | 8 类各一个语义色（persona 蓝 / feedback 橙 / relations 紫 / project 绿 / reference 青 / procedure 黄 / episode 灰 / preference 粉），全部映射到 alias token 而非硬编码 |
| 密度 | 提供 `舒适 / 紧凑` 两档行高（紧凑模式一屏多看 40% 条目，重度用户会感激） |
| 空态 | 每个视图都有插画级空态 + 明确的下一步动作，不留白屏 |
| 加载 | 骨架屏而非 spinner（列表/详情），避免布局跳动 |
