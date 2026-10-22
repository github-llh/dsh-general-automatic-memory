# 02 · 架构

## 1. 两半结构（dsh 强制的形态）

dsh 插件在物理上必须分成两个独立的模块，分别运行在两个 realm：

```
┌────────────────────────────── Host 半侧（Node，dsh 进程内，无沙箱）──────────────────────────────┐
│  index.js  →  export function apply(ctx, config)                                                │
│                                                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌─────────────┐ ┌──────────────┐ ┌───────────┐ ┌─────────────┐   │
│  │ store      │ │ index      │ │ recall      │ │ ingest       │ │ curator   │ │ bridge      │   │
│  │ 条目读写   │→│ 派生索引   │→│ 检索+注入   │ │ 抽取+决策    │ │ 后台固化  │ │ 导入/投影   │   │
│  │ 原子/锁    │ │ INDEX/FTS  │ │ 预算+幂等   │ │ ADD/UPDATE.. │ │ 快照/归档 │ │ 同步/恢复   │   │
│  └────────────┘ └────────────┘ └─────────────┘ └──────────────┘ └───────────┘ └─────────────┘   │
│         ↑              ↑              ↑                ↑               ↑              ↑         │
│  ┌──────┴──────────────┴──────────────┴────────────────┴───────────────┴──────────────┴──────┐  │
│  │                        api  （唯一的对外契约层：MemoryApi 接口）                          │  │
│  └───────────────────────────────────────────────────────────────────────────────────────────┘  │
│      ↓ 暴露给 4 个消费者                                                                        │
│   tools(6)      commands(5)     webServer(/general-memory/*)     systemPrompt.context()          │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                          ↕ 同源 HTTP（fetch）
┌──────────────────────── Client 半侧（浏览器，与宿主同 document 同 React tree）──────────────────┐
│  client.js  →  window.__ModuleLoader__.load({ id:'<包名>', factory(require){ … } })              │
│  ctx.slots.inject('sidebar.panellist') + ctx.slots.inject('main')                                │
│  views/ Overview Browse Editor Graph Timeline Portability Recovery Sync Settings Audit           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**为什么是这个形态**（官方约束，不是选择）：

- 官方 `practices.md` 原文禁止 iframe 方案：*"Render plugin pages as React components in a slot. Do not serve an HTML page from the Host and embed it in an iframe: an iframe document does not receive the host's theme tokens, light/dark switching, or `ctx.locale`."*
- 插件页与宿主 UI 在**同一个 document、同一个 React tree、同一个 CSP** 下（实测：Desktop 主窗口是 `BrowserWindow` + `sandbox:true` + `contextIsolation:true`，`loadURL` 指向 Host 自己的 webserver，默认 `127.0.0.1:3080`）
- `dsh.client.platform` 的唯一合法值是 `'web'`（实测 79/79 个官方包）→ **一份 client bundle 覆盖桌面 / 浏览器 / 手机**，无需平台分支

**关键架构决策：所有能力先落在 `api` 层，tools / commands / HTTP 路由 / 注入器都只是它的适配器。** 这直接支撑原则 P7（UI 只是 API 的一个视图），也让 CLI / headless / 无 UI 环境不丢能力。

## 2. 模块地图

| 模块 | 职责 | 关键依赖（dsh 服务） | 失败时降级 |
|---|---|---|---|
| `store` | 条目 CRUD、原子写（tmp+fsync+rename）、单写者锁、frontmatter 解析/校验、checksum、archive 迁移 | `ctx.fs`（可选，降级到 `node:fs`） | 只读模式，禁止写入并告警 |
| `index` | 从 frontmatter 反向生成 `INDEX.md` / `PROFILE.md` / `GENEALOGY.md` / `graph.jsonl` / `index.json`；增量重建（content-hash 跳过未变） | — | 索引缺失时全量重建（启动即自愈） |
| `recall` | 三级披露渲染、L0/L1/L2 检索、相关度门控、预算裁剪、**逐字节幂等快照** | `ctx.systemPrompt`、`agent/pre-step` | 检索后端不可用 → 降到 L0 纯文件扫描 |
| `ingest` | 候选抽取、来源分级、相似检索、`ADD/UPDATE/INVALIDATE/NOOP` 决策、审计 | `ctx.llm`（可选）、`session/event` | 无 LLM → 只做规则抽取 + 落 `episode`，不自动晋升 |
| `curator` | 后台固化：合并、重写画像、热度晋升、冷条目归档、快照、doctor 体检 | `ctx.schedule`（可选）、timer | 定时不可用 → 仅在空闲与阈值触发 |
| `bridge` | 导入器（8 种来源）、投影器（6 种目标）、跨设备同步、快照/恢复 | — | 单个导入器失败不影响其余（逐源隔离） |
| `api` | `MemoryApi` 接口，Host 侧唯一对外契约 | — | — |
| `tools` | 6 个模型可见工具 | `ctx.tools` | 工具面可按 config 降级到 3 个（minimal） |
| `commands` | 5 个 slash 命令 | `ctx.commands` | — |
| `http` | `/general-memory/*` exact 路由 + 同源守卫 | `ctx.webServer` | 未挂载时面板显示"Host 路由不可用"，工具与命令仍可用 |
| `client` | 10 个视图 + 状态管理 | `ctx.slots`、`ctx.locale` | slot 组件抛错只会让该 slot 空白，不影响宿主 |

## 3. 数据流

### 3.1 召回（读路径，每个模型请求）

```
agent/pre-step (waterfall)
   │
   ├─ recall.snapshot(session, turn) ─────────────────────────────┐
   │     1. 计算指纹 fp = hash(常驻层内容, 目录层内容, 项目 slug, 触发 glob)
   │     2. fp 与上次定稿相同 → 原样复读上次字符串（逐字节幂等，保护前缀缓存）
   │     3. 不同 → 渲染三档：
   │          always   ≤2 KB    persona/PROFILE.md 精简版 + 高优 feedback
   │          catalog  ≤400 tok  INDEX.md 紧凑目录（title + summary，按 kind 分组，top-N）
   │          dynamic  按需      glob 命中的 project facts / 上一轮 recall 结果的延续
   │     4. 预算超限 → 按 (kind 优先级 × heat × 相关度) 裁剪，被裁候选写审计
   │     5. 分层节流：fullEvery(20) / slimEvery(8) / humanPresent → 无条件完整
   │
   └─ return { ...decision, messages }     ← 必须 spread，否则 startsRequestSeries 等字段丢失
```

常驻层走 `ctx.systemPrompt.context({ name, order, text, required })` 而**不是** `section()`：`context()` 是 cache-safe 的（仅在内容变化或 compaction 移除后追加一条 durable 快照），`section()` 改动会触发 system prompt 面替换，直接击穿前缀缓存。

动态快照走 `agent/pre-step` 的 waterfall 改写，**不落盘为新 session 事件**（不膨胀会话日志）。

### 3.2 写入（写路径）

```
session/event(type=='turn/end')  ──┐
agent/turn-stopping              ──┤
compaction/start   （抢救钩子）   ──┼─→ ingest.enqueue(session, range)  →  节流/去重队列
agent/status=='idle'             ──┤                                        │
schedule（每日固化）              ──┘                                        ↓
                                              1. 抽取候选（规则优先，LLM 兜底）
                                              2. 来源分级 user-stated > feedback > model-inferred > tool-output/web
                                              3. 相似检索 top-s（L0 frontmatter + L1 FTS + L2 向量可选）
                                              4. 决策 ADD / UPDATE / INVALIDATE / NOOP（带理由）
                                              5. writeMode == suggest → 推确认卡到 conversation.input.dock，等用户批准
                                              6. store.put() 原子写  →  7. index 增量重建  →  8. audit 一行
```

⚠️ 事件语义陷阱（官方文档明确警告）：`turn/*`、`step/*`、`tool/call`、`tool/result`、`compaction/*` 是**持久化 session 事件类型，不是同名 Cordis 事件**。要观察它们必须监听 `session/event` 再判 `event.type`。同理**不要 poll `agent/status`**，官方原文：*"Wait on durable events such as `turn/end`, `assistant/message`, or `tool/result`… `whenIdle()` does not mean one follow-up finished."*

### 3.3 面板（UI 路径）

```
Client: fetch('/general-memory/entries?kind=feedback&q=…')
   ↓ 同源（相对路径，带宿主签发的 HttpOnly SameSite=Strict cookie）
Host: http 路由 → 同源守卫（Origin/Host 信任检查 + content-type: application/json + 可选 sessionId 校验）
   ↓
api.* → store/index/recall/bridge → JSON 响应
```

不走官方 Typert Remote（`ctx.remote.*`）的理由：Remote 的方法集由 `dsh-api-remotes` 的白名单决定，第三方新增命名空间成本高得多；自建 exact 路由是第三方插件的通行做法（本机已装的 `dsh-easyrewrite@2.6.0` 就注册了 9+ 条 `/bubble/*` 路由 + client 侧一一对应 `fetch`）。

## 4. dsh 挂载点全表

| 用途 | 挂载点 | 备注 |
|---|---|---|
| 注册 6 个工具 | `ctx.tools.register(defineTool({name, description, parameters, output:{schema, render}, execute}))` | object 输出 schema 必须写 `additionalProperties: true`，否则注册失败（社区实测坑） |
| 注册 5 个 slash 命令 | `ctx.commands.register({name, description, input:{hint}, handler})` | `name` 不带斜杠，`[a-z0-9_-]` |
| 常驻层注入 | `ctx.systemPrompt.context({name:'general-memory', order, text, required})` | cache-safe；**不要用 `section()`** |
| 动态快照注入 | `ctx.on('agent/pre-step', …)` waterfall | 不拥有决策时必须 `return next()`；改写时 spread |
| 写入触发 | `ctx.on('session/event', …)` 判 `event.type` | 见 §3.2 陷阱 |
| 抢救压缩前信息 | `session/event` 判 `compaction/start` / `compaction/summary` | 摘要本身也落 episode，标 `model-inferred` |
| 跨会话回忆 | `ctx.sessionQuery.searchEvents()` / `traceSession()` | ⚠️ **web profile 默认被 `openAt: never` 关掉**（不是"可能没挂载"，是明确禁用）→ 必须 `ctx.get('sessionQuery')` 可选注入，拿不到就退化到只用我们自己的记忆文件 |
| token 计量 | `ctx.tokenMeter.measure(session, requestHeader)` / `estimateMessage(msg)` | replay-based、确定性、零模型调用；面板预算水位的真实数据源 |
| 后台离线推理 | `ctx.llm.stream(…)` | **不要**像前作那样开 `danger-full-access` 父会话 + subagent |
| 定时固化 | `ctx.setInterval` / `dsh-schedule`（cron + IANA 时区） | 定时器必须用 ctx 上的（disposal-aware） |
| 持久 KV（可选） | `ctx.storageDomain.open(defineDomain({name, version, layout:'per-record', tables:{…}}))` | 只用于 `.cache/` 里的派生状态（设备位点、outbox），**不用于记忆条目本身** |
| HTTP 路由 | `ctx.webServer.register({kind:'exact', path:'/general-memory/x', handler})` | 面板通信 |
| 设置表单 | 导出 `Config`（schemastery，与 interface 同名）→ 官方设置页**自动生成表单** | ⚠️ `ctx.settings.register(namespace, schema)` **不存在**；程序化写用 `ctx.settings.update(ns, patch, expectedRevision?)` / `mutate()`，变更广播 `settings/document-updated(ns, revision)` |
| i18n | `ctx.locale.register('general-memory', { zh, en })` + `ctx.locale.bind()` | 在 `ctx.effect` 里注册 |
| UI | `ctx.slots.inject('sidebar.panellist' | 'main' | 'conversation.input.dock' | 'plugins.item', …)` | 见 [07](07-plugin-ui.md) |
| 文件 IO | `ctx.fs`（`stat/listDir/readText/writeText/editText` + `FsWriteIntent` 版本守卫） | 可选依赖，降级 `node:fs` |
| 路径解析 | `resolveAgentsHome()` / `dshHomePath()` / `dshCachePath()`（`@deepseek-ai/dsh-home-paths`） | 记忆根 = `resolveAgentsHome()/memory` |
| 运行时自省 | `cordis_inspect_list` → `cordis_inspect_query`（provider: `Service`/`Event`/`Config`/`Tool`/`Slots`/`Theme`） | 开发期发现 API 的第一手段 |

### 明确不做的事

- ❌ **不往 session 事件流 append 自定义 `type`** —— 会导致 Session 拒绝重新打开；`appendPluginRecord()` 只对官方 `packages/experimental/` 开放且有仓库检查
- ❌ **不用 `system-prompt/assemble` waterfall** —— 它会替换整个装配，官方 `practices.md` 建议不要用它增删工具或文本
- ❌ **不手写 profile 的 `package.json` / `cordis.patch.yml` / `pnpm-lock.yaml`** —— 官方 SKILL.md 明令禁止，安装一律走 `plugin_manager.install_bundle` 或 `dsh plugin add`
- ❌ **不 import `@deepseek-ai/dsh-client-ui-primitives` 或任何宿主 client 包** —— `practices.md` 原文禁止；`dsh.client.inject` 里的包名只用于排序激活，且它们「change without notice」

## 5. 存储分层

| 层 | 位置 | 内容 | 是否同步 | 是否可删 |
|---|---|---|---|---|
| 真相源 | `~/.dsh/memory/**` 的 `.md` / `.jsonl` | 条目、审计、白板 | ✅ | ❌ |
| 派生聚合 | 同目录下的 `INDEX.md` / `PROFILE.md` / `GENEALOGY.md` / `graph.jsonl` / `index.json` | 由 frontmatter 生成 | ⚠️ 可同步也可重建 | ✅ 可删（启动自愈） |
| 冷存储 | `~/.dsh/memory/archive/<yyyy>/` | 失效/过期/被取代条目 | ✅ | ❌（除非用户硬删） |
| 快照 | `~/.dsh/memory/snapshots/<ts>-<label>/` | 固化/导入/批量操作前的备份 | ⚠️ 可配 | ✅ 按保留期滚动 |
| 派生缓存 | `~/.dsh/memory/.cache/` | FTS5 sqlite、向量、指纹表 | ❌ **永不同步** | ✅ 随时可删 |

**为什么根目录选 `~/.dsh/memory/`**：这是 dsh 专属插件——数据、面板、管理全归 dsh，所以默认跟随 `$DSH_HOME`，与 dsh 自己的 `sessions/`、`storages/` 同级。与其他工具的唯一关系是**导入**（它们的记忆文件与会话），不是共享。需要让外部工具直接读原文件时，把 `memoryRoot` 指到 `~/.agents/memory`——显式选择。

## 6. 进程与并发模型

多个 dsh 进程（Desktop + CLI + 多个 workspace 窗口）可能共用同一个 `~/.dsh/memory/`。

| 风险 | 对策 |
|---|---|
| 并发写坏文件 | 条目级文件（一条一文件）+ 临时文件 + fsync + 原子 rename + 父目录 fsync；不存在"两个进程改同一个文件"的常态 |
| 重复固化 / 重复后台任务 | 心跳选主：`.cache/heartbeat.json` 写 `{pid, heartbeatAt, instanceCount}`，只有 leader 跑 curator（对标前作 `polling-heartbeat.json`） |
| 索引并发重建 | 单写者锁 + 内容哈希增量（只重算受影响段落） |
| 跨进程变更通知 | dsh `domain/changed` 事件**仅进程内**（官方记录的已知限制）→ 面板用 HTTP 轮询 + 文件 mtime 指纹检测，不假设推送 |
| 自身写入触发 watcher | 写入豁免表：记住自己刚写的 path+size+mtime，watcher 命中即跳过（对标前作「自身写入豁免」） |

## 7. 对抗上游破坏性变更

dsh 是 developer preview，README 原文 **"THERE WILL BE COMPATIBILITY-BREAKING CHANGES"**，且每个破坏性变更只发一份 `docs/upgrade-guide/<version>/<change>/guide.md`。历史已发生：`engines.dsh` 强制化（v0.2.1-alpha.3）、subpath 显示清单改法（v0.2.0-rc.2）、`plugins.*` slot 重排（v0.2.1-alpha.1）。

对策：

1. **适配层隔离**：所有 `ctx.*` 调用收敛到 `src/host/adapters/*.ts`，每个适配器 ≤50 行，破坏性变更只改适配器
2. **可选注入优先**：非核心服务一律 `ctx.get('x')` 而不是写进 `export const inject`（写进 `inject` 会导致服务未就绪时插件**永不激活**）
3. **`engines.dsh` 精确声明**：`">=0.2.1-rc.2 <0.3.0"`，宁可不激活也不要在不兼容版本上跑出错乱数据
4. **数据格式与 dsh 版本解耦**：记忆文件 schema 有自己的 `MANIFEST.yaml: schemaVersion`，永不依赖 session 事件格式版本（当前 `session.v4`，已有 v0→v4 五代迁移链）
5. **CI 跑双版本**：对当前 rc 与上一个 stable 各跑一遍冒烟
6. **不依赖未发布的构建 preset**：官方 client bundle 的 tsdown preset（`packages/client/tsdown.client.ts`）**未发布成包**，必须在仓库里自己复刻一份并锁定输出格式
