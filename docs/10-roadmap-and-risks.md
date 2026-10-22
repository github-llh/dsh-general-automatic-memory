# 10 · 路线图、验收标准与风险

## 1. 里程碑

排序原则：**先让"记忆不丢且可编辑"成立，再让"自动"成立，最后让"跨设备/团队"成立。** 每个里程碑都必须是可用状态，不做半成品。

### M0 · 骨架可加载（1 周）— ✅ 已完成

| 项 | 内容 |
|---|---|
| 交付 | `package.json`（含 `dsh.bundle.patch` + `dsh.client`）、`cordis.patch.yml`、Host `apply`、client bundle 构建链（自复刻 tsdown preset + `scripts/wrap-client.mjs`）、`locale/{en,zh}.json`、`icon.svg`、`scripts/verify-bundle.mjs` |
| 验收 | ✅ client bundle 首行与 `id === 包名` 断言通过；✅ `node:vm` 沙箱真跑产物（`test/bundle.test.ts`）；✅ 只 `require("react")`；✅ `sidebar.panellist` 与 `main` 的 id/key 配对 |
| 未完成 | ⬜ 在真实 `dsh web --patch` 里点亮侧栏图标（需要一次真机冒烟） |
| 关键风险 | **官方 client bundle preset 未发布成包**，必须自己复刻 lazy-CJS 输出格式 → M0 的唯一目标就是打通它。**已打通**：tsdown 出 `.cjs`，wrap 脚本套壳，产物与本机 `dsh-plugin@2.0.5` 的 `client/client.js` 结构逐字对齐 |

### M1 · 记忆格式 + 只读召回（2 周）— ✅ 主体完成

| 项 | 内容 |
|---|---|
| 交付 | `store`（frontmatter 解析/校验、单调 ULID、原子写、checksum、路径白名单）、8 类目录布局、`INDEX.md`/`PROFILE.md`/`graph.jsonl` 生成器（内容哈希门控，没变不写）、L0 词法检索（CJK 单字+双字，BM25 简化）、三档注入（`systemPrompt.context` + `agent/pre-step`）、**逐字节幂等快照 + 分层节流**、6 个工具、3 个 slash 命令、审计流水、面板「总览/浏览」两视图 + 6 条 HTTP 路由 |
| 验收 | ✅ 契约测试：同输入渲染 100 次字节一致、条目顺序打乱输出不变；✅ 注入文本无时刻/相对时间/uuid；✅ 目录层超限自动裁剪并留 `+N more` 尾行；✅ 预算占比可测；✅ 63 个测试全绿 |
| 未完成 | ⬜ L1 SQLite FTS5（现为纯 TS 词法检索，规模上千条后需要）；⬜ glob 注入依赖 `tool/call` 事件的 payload 形状，需真机校准；⬜ `ctx.tokenMeter` 占比是实测还是估算需真机确认 |
| 说明 | 此阶段**没有自动写入**，全靠手工、命令与 `memory_write` 工具。这是刻意的：先证明"明文可编辑 + 恒定预算召回"这条主干成立 |

### M2 · 自动写入 + 审计（2 周）— ✅ 主体完成

已实现：`episode` 层（jsonl + 单日 FIFO 上限 + 过期归档）、规则抽取（显式指令/纠正/确认/身份/决策/关系三元组/外部指向/相对日期归一）、门控（密钥硬拒 / 敏感话题默认不记 / PII 标记不可共享 / 突增熔断 / 证据强制）、`ADD/UPDATE/INVALIDATE/NOOP` 决策（用户条目永不被自动条目覆盖）、`suggest` 待确认队列（15s → 静默 NOOP）、compaction 前抢救、全量审计。

未完成：LLM 兜底抽取的 `ctx.llm.stream` 契约需真机复核；确认卡组件尚未挂到 `conversation.input.dock`（HTTP 接口与队列已就绪）。

| 项 | 内容 |
|---|---|
| 交付 | `session/event` 监听（`turn/end`、`compaction/start|summary`、`assistant/message`）、规则抽取、LLM 抽取（`ctx.llm.stream`，带 evidence 强制）、来源分级门控、`ADD/UPDATE/INVALIDATE/NOOP` 决策、`memory_write`/`memory_forget`、`suggest` 模式确认卡（`conversation.input.dock`）、审计流水 |
| 验收 | 说"以后别加总结" → 确认卡出现 → 批准 → 新会话常驻层含它；网页内容只能进 episode；突增熔断触发；`NOOP` 占比落在 30–60%；审计可查全链路 |
| 关键指标 | 用户手工删除/修正率 ≤5% |

### M3 · 面板完整（3 周）

| 项 | 内容 |
|---|---|
| 交付 | 10 个视图全部实现（Overview / Browse / Editor / Graph / Timeline / Portability / Recovery / Sync(占位) / Settings / Audit）、HTTP 路由全表 + 同源与 nonce 守卫、ErrorBoundary、响应式三档、i18n、可访问性、`--json` CLI 等价输出 |
| 验收 | 每个视图在桌面（≥1200）、小窗（768–1199）、手机浏览器（<768）三档下可用；全键盘可达；ErrorBoundary 生效（人为抛错不白屏）；跨源请求 403；`gate-drop` 在 Audit 里可见 |
| 说明 | 面板是**信任的载体**。前作把后台工作台藏起来（`danger-full-access` 父会话 + 隐藏 subagent），我们把固化进度、被门控的候选、被拦截的写入全部摆到台面上 |

### M4 · 可移植性（3 周）— ✅ 导入侧主体完成

已实现 **10 个记忆导入源**（Claude Code auto memory、CLAUDE.md、AGENTS.md、Cursor rules、Windsurf、Cline memory-bank、Copilot instructions、GEMINI.md、前作 dsh-auto-memory、任意 Markdown 目录）+ **4 个会话导入源**（dsh `session.v4.jsonl.zstd` 多帧解码、Claude Code jsonl、通用 jsonl、通用 Markdown），统一 dry-run 预检（新增/合并/已有/PII/预算影响）+ 导入前快照 + 去重预览，面板已有「导入」视图。

未完成：投影器（**默认关闭、低优先级**，不是核心定位）、zip 导入导出。

| 项 | 内容 |
|---|---|
| 交付 | 12 个导入器（前作 / Claude Code auto memory / CLAUDE.md / AGENTS.md / Cursor / Windsurf / Copilot / Gemini / Cline / 通用目录 / `.gam.zip` / MCP memory server）、dry-run 预检报告、10 个投影器 + 受管区块协议、`linkOnly` 纯链接条目、procedure → `SKILL.md` 导出 |
| 验收 | [06 §6](06-portability.md#6-跨工具一致性验证) 的矩阵逐项跑通（真实工具，不是模拟）；导入 1000 条无数据损坏；投影幂等（重复投影字节一致）；双注入重叠度告警生效 |
| 关键风险 | 各工具格式随时变；导入器必须逐源隔离（一个源解析失败不影响其余） |

### M5 · 固化与恢复（2 周）

| 项 | 内容 |
|---|---|
| 交付 | `curator` 全任务（merge / rewrite-summary / rewrite-profile / promote / demote / expire / reindex / validate）、快照与 diff 与选择性回滚、doctor 12 项检查 + 自动修复、心跳选主、白board 双向通道 |
| 验收 | 灌 2000 条近义记忆 → 固化后条目数下降且常驻层字符数不增；杀掉进程在 rename 前后各一次 → 无半写文件；快照 → 破坏 → 回滚 → checksum 全部一致；两个 dsh 实例只有一个跑 curator |

### M6 · 跨设备与团队（3 周，可选）

| 项 | 内容 |
|---|---|
| 交付 | git 传输（推荐路线，做到极致）、`.gam.zip` 手动同步、可选远端后端（S3/WebDAV/HTTP，凭据走 `role('secret')`）、设备位点与内容哈希增量、冲突检测 + LLM 语义合并 + 人工裁决、团队 `shareable` 过滤 |
| 验收 | 两台机器双向同步 500 条无丢失；并发写同一语义产生冲突 → 面板并排 diff → 裁决后双方原文进 archive；PII 条目永不出现在远端 |
| 说明 | **配置键预算 ≤6 个**。前作在这块用了 20+ 键（`team*`），是它配置爆炸的主要来源之一 |

### M7 · L2 向量与规模化（可选，按需）

只有当用户记忆量普遍超过 L1 能力时才做。交付：可选 peer 依赖（`onnxruntime-node` + `@huggingface/transformers`）、增量 embed、RRF 融合、向量与文件的漂移检测。**前作走这条路且模型从未下载成功（`~/.dsh/models/js-semantic` 是空目录）**，所以要把它做成"失败了也不影响 L0/L1"的纯增强层。

## 2. 风险登记表

| # | 风险 | 概率 | 影响 | 对策 |
|---|---|---|---|---|
| R1 | **dsh 破坏性变更**（README 原文 "THERE WILL BE COMPATIBILITY-BREAKING CHANGES"；历史已发生 `engines.dsh` 强制化、subpath 显示清单改法、`plugins.*` slot 重排） | **高** | 高 | 适配层隔离（所有 `ctx.*` 收敛到 `src/host/adapters/**`，lint 强制）；可选服务用 `ctx.get()`；`engines.dsh` 精确 range；CI 跑双版本；关注 `docs/upgrade-guide/<ver>/<slug>/guide.md` |
| R2 | **client bundle 构建格式复刻失败**（官方 preset `packages/client/tsdown.client.ts` 未发布） | 中 | **致命** | M0 就打通；加产物格式断言测试；参考本机已装的第三方 UI 插件（`dsh-plugin@2.0.5` 带完整 `src/` TSX 源码、`dshmarket@1.66.42` 带 30 个 `.tsx`） |
| R3 | **前缀缓存击穿** → token 成本暴涨、用户流失 | 中 | **致命** | 逐字节幂等作为契约测试（P4）；注入文本禁含时间戳/随机数/相对时间；`hits` 延迟刷盘；面板 `prefixBreaks` 指标必须趋近 0 |
| R4 | **`.d.ts` 缺失导致对接 API 靠猜**（asar 内 `@deepseek-ai/*` 的 `.d.ts` 文件数为 0，`lib/types/*.js` 是空 stub；唯一有真类型的是 `@deepseek-ai/cordis` + 3 个 `cordis-plugin-*`） | **高** | 中 | 以每个包随附的 `README.md` + `README.zh.md` 为准（结构统一：Summary / Use this package / Understand the implementation / Known Limitations / Dev Note）；用 `cordis_inspect_query` 运行时校验；写集成测试而不是相信类型 |
| R5 | **记忆膨胀** → 索引超限、召回变差 | 高 | 中 | 硬预算 + 超限触发固化而非静默截断；`heat` 衰减与归档；面板膨胀速率指标 |
| R6 | **索引与内容漂移**（文件式记忆的头号故障） | 高 | 中 | 索引永远由 frontmatter 反向生成、永不手写；`sourceRevisions` 哈希增量校验；启动自检；doctor 孤儿/漏索引检查 |
| R7 | **记忆投毒** | 中 | **高** | 五层防护（[09 §3](09-security-and-privacy.md#3-记忆投毒防护t1)）；来源门控是数据模型级约束，不是可选策略 |
| R8 | **用户不信任黑盒记忆** | 中 | 高 | 明文文件 + 逐条可编辑 + `suggest` 确认卡 + 注入透明化（turn-tail）+ `/recall` 探针 + 全量审计可见 |
| R9 | **原生依赖安装摩擦**（pnpm 拦构建脚本，需用户手动授权） | 中 | 中 | `dependencies` 目标为空；SQLite 用 `node:sqlite` 内置；向量层可选且默认关 |
| R10 | **多进程/多设备写坏数据** | 中 | 高 | 条目级文件 + 原子写 + 单写者锁 + `expectedRev` 乐观锁 + 心跳选主 |
| R11 | **投影污染用户仓库 / 泄漏隐私** | 中 | 高 | 仓库投影默认全关；受管区块协议；PII 与 `shareable: none` 永不投影 |
| R12 | **双注入浪费 token**（`dsh-agent-instructions` 已读 `~/.agents/AGENTS.md`） | 高 | 中 | `AGENTS.md` 只放 ≤200 字符指针；doctor 检查重叠度 >30% 告警 |
| R13 | **slot id/key 撞车**（复用已占用 id 会替换内置 UI，slot-catalog 标 `replaceRisk: 'shadows-shipped-ui'`） | 低 | 中 | 所有 id/key 加 `general-memory` 前缀；`main` 避开已被占用的 `keyDomain: 'conversation'` |
| R14 | **组件抛错导致 slot 空白**（console 只留 `slot entry crashed in '<slot>'`，用户看到"点了没反应"） | 中 | 中 | 每视图 ErrorBoundary + 常驻诊断区 + schema 不匹配时明确提示重启 |
| R15 | **前作用户迁移失败** | 低 | 中 | 导入器对锚点丢失、编码差异（`---Users-…--` vs `--Users-…--`）、空文件全部容错；dry-run 预检 + 快照 |
| R16 | **官方不接受上游合并**（CONTRIBUTING 原文 *"We are sorry that we cannot accept external pull requests at the moment."*） | **确定** | 低 | 不指望上游；缺失的能力全部在自己插件内实现；用 Discussions 反馈 |
| R17 | **client bundle 装载失败会带走整个 Desktop 进程**（discussion #10309 在 0.2.1-rc.2 上实测；官方未回应；用户的恢复手段只有「禁用所有第三方插件」） | 中 | **致命** | ① `test/bundle.test.ts` 用 `node:vm` 沙箱**真的执行**产物，断言能注册、factory 可调用、`apply` 在最小 ctx 上不抛；② 模块顶层零副作用（`document`/`fetch` 只在 `apply` 与组件内碰）；③ 只 `require("react")`，其余全打进 bundle，杜绝 combo 路由 404；④ `scripts/verify-bundle.mjs` 在 CI 与 `prepack` 双跑；⑤ README 写清「如何在不启动 Desktop 的情况下卸载本插件」（`dsh plugin remove` 走 CLI，不需要 GUI） |
| R18 | **MCP 路线的竞品无法做注入与事件观察** —— 反过来说，如果我们哪天退化成 MCP server 就会失去核心差异化 | 低 | 高 | 架构上禁止把记忆能力做成 MCP server；`docs/01 §5.6` 已把这条写成差异化论证 |

## 3. 开放问题（需要实现期验证）

| # | 问题 | 验证方式 |
|---|---|---|
| Q1 | `!!js` 表达式在 `config` 里能否调用 `resolveAgentsHome()`？（已确认 dsh-base 用 `!!js dshHomePath('sessions')`） | 起 dsh 用 `--dump-config` 打印组合结果 |
| Q2 | `ctx.webServer.register` 的 `kind:'exact'` 是否支持 query string 与 POST body 解析？ | 读本机 `dsh-easyrewrite@2.6.0` 的 `lib/index.js:330` 附近实现（它注册了 9+ 条路由） |
| Q3 | `ctx.systemPrompt.context()` 的 `required` 语义与 `order` 取值范围？ | 读 `@deepseek-ai/dsh-system-prompt/README.md` + `getSectionOrder`/`getContextOrder` |
| Q4 | `conversation.input.dock` 的 owner props 与高度约束？确认卡会不会遮挡输入框？ | `cordis_inspect_query` 查 `Slots`；参考 `templates/decoration`（它就是往这个 slot 注入） |
| Q5 | `node:sqlite` 的 FTS5 在 Node 24.21 是否默认可用（编译选项）？ | 起一个最小脚本 `CREATE VIRTUAL TABLE … USING fts5` 试 |
| Q6 | 面板在公网部署（手机浏览器经 SSH/public deployment 访问）下，同源 fetch 与 cookie 是否照常？ | 按 `docs/user/guide/public-deployments.md` 部署一次实测 |
| Q7 | `ctx.tokenMeter.measure()` 在 `agent/pre-step` 阶段能否拿到本次 requestHeader？ | 读 `dsh-token-meter` README + 实测 |
| Q8 | 第三方包能否安全 `require('@tanstack/react-virtual')`（它在基线里出现 2 次，但官方只保证 react/cordis）？ | 起一个最小 client 插件试；失败则用自实现窗口化（已准备） |

## 4. 下一步：M2 起手清单（自动写入管线）

M0 + M1 主体已完成（63 个测试全绿，构建产物 `lib/index.js` 94 KB + `client/client.js` 26 KB）。M2 的目标是**让记忆自己长出来**，同时不破坏 M1 已经守住的三条不变量（逐字节幂等、预算恒定、路径白名单）。

### 5.1 已经就位、可以直接复用的

| 已有 | 在哪 | M2 怎么用 |
|---|---|---|
| 写入与去重的最小版本 | `adapters/tools.ts` 的 `memory_write`（`api.search` 相似度 >0.85 → NOOP） | 抽成 `ingest/decide.ts`，工具与自动管线共用同一套决策 |
| 事件挂载点 | `adapters/inject.ts` 已在监听 `session/event`（`user/message` / `turn/end` / `compaction/*` / `tool/call`） | 在同一个监听器里加 ingest 入队，不要再注册第二个 `session/event` |
| 审计 | `host/audit.ts` + `api.writeAudit()` | 每个决策（含 NOOP 与 deny）都要落一行 |
| 延迟刷盘 | `api.noteRecall()` / `flushHits()`（`turn/end` 时 flush） | 自动写入同样不能在渲染路径上改条目 |
| 确认卡的 slot | 设计已定：`conversation.input.dock`（官方 `templates/decoration` 就是往这个 slot 注入） | client 侧新增 `WriteConfirmCard`，数据走 `/general-memory/pending-writes` |

### 5.2 要新增的文件

```
src/host/ingest/extract.ts     规则层抽取（零 token）：显式记忆指令 / 纠正句式 / 确认句式 /
                               身份陈述 / 决策句 / 关系三元组 / 外部指向 / 相对日期→绝对日期
src/host/ingest/llm-extract.ts LLM 兜底抽取：ctx.llm.stream()，强制 evidence（原文引用 ≤80 字），
                               无 evidence 一律丢弃；每日调用预算 config.ingest.dailyLlmCalls
src/host/ingest/gate.ts        来源分级门控 + PII/密钥/敏感话题扫描 + 突增熔断（burstThreshold）
src/host/ingest/decide.ts      ADD / UPDATE / INVALIDATE / NOOP，带理由；用户显式条目永不被自动条目覆盖
src/host/ingest/queue.ts       节流与冷却（同项目 30 min）、每日 LLM 预算计数、可中止
src/host/adapters/ingest.ts    挂 session/event：turn/end 入队、compaction/start 抢救、
                               assistant/message 只提结论行
src/host/episode.ts            projects/<slug>/episodes/YYYY-MM-DD.jsonl 的 append + TTL + FIFO
src/client/confirm.ts          WriteConfirmCard（≤3 行高、15s 自动忽略、显示来源标签）
```

### 5.3 顺序与验收

1. **episode 层先行**（`episode.ts`）—— 它是唯一允许 `tool-output`/`web-content` 直接落地的层，也是 compaction 抢救的落点。没有它，门控就没有"降级去处"。
2. **规则层抽取 + 门控 + 决策**（不花 token 的那条路径先通），验收：说"以后别加总结" → 落一条 `feedback`，`provenance.source: user-stated`；读一个网页 → 只进 `episode`。
3. **compaction 抢救**，验收：触发 compaction 后 `episodes/*.jsonl` 里能看到被压缩那一轮的结论行。
4. **LLM 抽取兜底**，验收：无 evidence 的候选 100% 被丢弃；每日超预算后自动停用并在面板告警。
5. **suggest 确认卡**，验收：15 秒无操作 → 静默 NOOP（绝不偷偷写）；批准后 `explicitBoost` 生效、heat 上升。
6. **突增熔断**，验收：一小时写入 >10 条 → 暂停自动写入 + 审计 `act:deny` + 面板红色告警。

### 5.4 M2 期间不能碰坏的东西

- `test/recall.test.ts` 的幂等契约必须继续通过：ingest **不得**在渲染路径上写回 `stats.hits`
- 常驻层文本只在内容真变时才重注册（`host-boot.test.ts` 已守）
- 工具面维持 6 个：ingest 的所有能力都走事件与面板，**不要**为了自动化再加模型可见工具（每个工具的 schema 都是每轮固定开销）
- `~/.dsh/memory/` 之外的写入仍然一律拒绝；投影器（M4）落地前不要提前开任何仓库写入


## 5. 度量与验收的总门槛

发布 1.0 前必须全部达标：

- [ ] 注入 token 占比 ≤3%（`ctx.tokenMeter` 实测，非字符估算）
- [ ] 前缀缓存命中率相对无插件基线下降 ≤1 个百分点；`prefixBreaks` 趋近 0
- [ ] 记忆工具 schema ≤6 KB（对标前作 15 个工具、`request/header` 42,965 B）
- [ ] 逐字节幂等契约测试通过
- [ ] 配置键 ≤40（当前设计 38）
- [ ] 零命中查询率 ≤15%
- [ ] 用户手工删除/修正率 ≤5%
- [ ] [06 §6](06-portability.md#6-跨工具一致性验证) 跨工具矩阵全部跑通
- [ ] doctor 12 项检查全部实现且有测试
- [ ] 硬删除完整性检查通过（已删 id 在任何派生物中不残留）
- [ ] 面板三档响应式 + 全键盘可达 + ErrorBoundary 生效
- [ ] 1000 条目索引全量重建 <2 s
