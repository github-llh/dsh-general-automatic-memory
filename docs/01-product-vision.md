# 01 · 产品定位

## 1. 问题陈述

Agent 工具的"记忆"目前有三条互不相通的路，每条都缺一块：

| 路线 | 代表 | 缺什么 |
|---|---|---|
| 云端黑盒画像 | ChatGPT Saved memories + Dreaming、claude.ai Topics | 不可逐字编辑、不可导出、不跨工具、无法审计、无法离线 |
| 明文规则文件 | `AGENTS.md` / `CLAUDE.md` / `.cursor/rules` / `GEMINI.md` | 全量常驻注入，token 随文件线性膨胀；无自动写入；无分类；无遗忘 |
| 检索型记忆库 | mem0 / Zep / Letta / MCP memory server | 真相源在数据库里，人读不了改不了；跨设备同步与冲突要自建后端；绑定单一 agent |

**空位**：一份「人可以直接用编辑器打开修改、可以被 git/云盘带走、可以被 Claude Code 和 Codex 和 Cursor 同时读懂、注入成本恒定、并且能自动分类分层自我整理」的记忆。这就是本插件。

## 2. 目标用户

| 画像 | 痛点 | 我们给什么 |
|---|---|---|
| **多工具重度用户**（同时用 dsh + Claude Code + Codex/Cursor） | 记忆散在 4 个工具里；换工具就失忆；想让 dsh 成为唯一的记忆入口 | **把它们的记忆文件与历史会话一次性收编进 dsh**，之后只在 dsh 里维护；其他工具的原始文件原样保留，随时可再导一次 |
| **有大量历史会话的人** | 过去几百轮对话里积累的决策与偏好无法被检索，等于白聊 | **会话 → 记忆**：把 dsh / Claude Code / 通用 jsonl 会话批量喂进同一条抽取管线，生成可检索、可编辑的记忆条目 |
| **长周期项目开发者**（一个仓库做几个月） | 会话被 compaction 压掉，架构决策与踩坑反复重新发现 | 项目事实层 + compaction 前抢救 + 交接白板 |
| **不信任黑盒记忆的人**（含安全/合规敏感岗位） | "它到底记了我什么？能不能删？谁写的？" | 明文文件 + 逐条 provenance + 全量审计 + 硬删除 + 快照回滚 |
| **团队 lead** | 新人接手项目要重新被指导一遍 | 团队同步 + 可 review 的记忆条目 + `shareable` 分级 |
| **token 敏感用户**（自费 API / 有额度上限） | 记忆越记越贵，前缀缓存被击穿 | 恒定预算 + 三级披露 + 逐字节幂等 + 预算水位可视化 |

**非目标用户**：需要多租户服务端记忆平台的场景（那是 mem0/Zep 的地盘，我们只做本地优先 + 可选同步）。

## 3. 核心场景（按优先级）

| # | 场景 | 触发 | 期望结果 |
|---|---|---|---|
| S1 | **自动记住纠正** | 用户说"别在改完代码后加总结" | 生成 `feedback` 条目，`activation: always`，下一次会话开头就在常驻层里；用户可在面板里看到、改、删 |
| S2 | **该想起的时候想起** | 用户问"上次那个鉴权中间件为什么重写" | 目录层让模型知道有这条 → 调 `memory_recall` → 拿 `project` 条目全文 + `derivedFrom` 指回当时的 episode |
| S3 | **把其他 agent 的记忆收编进来** | 用户在 Claude Code 里积累了一堆 auto memory / CLAUDE.md | 导入器扫描这些文件 → dry-run 预检（新增/合并/冲突/PII/预算影响）→ 逐条勾选 → 落成规范条目，`provenance.importedFrom` 保留原始出处 |
| S3b | **把历史会话挖成记忆** | 用户有几百个历史会话 | 会话导入器解析（dsh 多帧 zstd / Claude Code jsonl / 通用格式）→ 按轮切分 → 走同一条「抽取 → 门控 → 决策」管线 → 批量生成条目，重复的自动 NOOP |
| S4 | **接手别人的记忆** | 用户装了本插件，机器上已有前作 / CLAUDE.md / Cursor rules | 导入器 dry-run 预检 → 逐条勾选 → 落盘为规范条目，保留 `provenance.importedFrom` |
| S5 | **记错了能撤** | 用户发现某条记忆是错的 | 编辑 / `invalidate` / 回滚快照；被取代的原件进 `archive/`，不物理删除 |
| S6 | **换机器** | 新设备 | 同步或 zip 导入 → doctor 体检 → 派生索引重建（`.cache/` 从不参与同步） |
| S7 | **人物/系统关系** | "谁是这个服务的负责人" | `relations` 条目构成图；面板族谱视图 + `memory_graph` 工具正/反向遍历 |
| S8 | **token 账单可控** | 用户担心记忆太贵 | 面板总览显示三档注入的实测字符/token 占比、前缀缓存健康、被门控裁掉的候选数 |
| S9 | **不被投毒** | 会话里读了一个恶意网页 | 网页来源内容只进 `episode`，不进长期层；召回时标注低可信并降权 |
| S10 | **团队共享** | lead 想让新人继承项目记忆 | 只同步 `shareable: team` 且 `privacy.pii: false` 的条目；冲突走语义合并 |

## 4. 竞品能力矩阵

图例：✅ 完整 · ⚠️ 部分 · ❌ 无

| 维度 | ChatGPT | claude.ai | Claude memory tool | Claude Code auto memory | Cursor | Windsurf | Cline Memory Bank | mem0 | Zep/Graphiti | Letta | **本插件** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 自动写入（隐式） | ✅ Dreaming 后台重写 | ✅ Topics | ⚠️ 需 prompt 驱动 | ✅ | ✅ sidecar 提议+批准 | ✅ | ⚠️ 需显式触发 | ✅ | ✅ | ✅ sleep-time | ✅ |
| 存储形态 | 云端不透明 | 云端 Topics | **客户端文件** | Markdown+frontmatter | `.mdc`+云端 | Markdown | 6 个固定 md | 向量库+图 | 图数据库 | blocks+向量 | **Markdown+frontmatter** |
| 人可直接编辑 | ⚠️ 单条删/改，画像不可逐字编辑 | ✅ 逐条 | ✅ | ✅✅ | ⚠️ | ⚠️ | ✅ | ❌ 需 API | ❌ 需 UI | ⚠️ | ✅✅ |
| 自动分类 | ⚠️ 4 个固定块 | ⚠️ Topics | ❌ | ✅ 4 类（user/feedback/project/reference） | ❌ | ❌ | ✅ 6 文件固定 | ❌ | ⚠️ 三层子图 | ⚠️ blocks | ✅ **8 类** |
| 自索引 | ❌ 无索引全量注入 | ❌ | ❌（无 ranked retrieval） | ✅ `MEMORY.md` 200 行/25 KB | ⚠️ description | ⚠️ | ❌ | ✅ 向量 | ✅ 图 | ⚠️ | ✅ 生成式 + 硬预算 |
| 关系图谱/族谱 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ mem0g | ✅✅ 时序知识图 | ❌ | ✅ `relations` + 族谱视图 |
| token 预算控制 | ❌ 全量注入 | ⚠️ | ✅ context editing | ✅✅ 硬上限 | ⚠️ | ✅ 6k/12k 字符 | ❌ 全读易爆 | ✅ | ✅ | ✅ block limit | ✅✅ **三档硬预算 + 水位可视化** |
| 前缀缓存友好 | — | — | — | — | — | — | — | — | — | — | ✅ **逐字节幂等（一等约束）** |
| 跨工具 | ❌ | ❌ | ⚠️ 仅 Anthropic API | ⚠️ 可读 AGENTS.md | ⚠️ | ❌ | ❌ | ✅ MCP | ✅ | ✅ MCP | ✅✅ **10 个记忆源 + 4 个会话源（含会话挖掘）；投影可选** |
| 跨设备 | ✅ 账号级 | ✅ | ⚠️ 取决宿主 | ❌ machine-local | ⚠️ | ⚠️ | ✅ 随 git | ✅ 服务端 | ✅ | ✅ | ✅ git/zip/可选后端 |
| 溯源 provenance | ❌ | ⚠️ | ⚠️ 文件级 | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅✅ | ⚠️ | ✅✅ 条目级 + 指回 eventSeq |
| 遗忘/衰减 | ✅ 重写覆盖 | ⚠️ 用户删 | ⚠️ 手动 | ⚠️ 手动 | ⚠️ | ⚠️ | ⚠️ | ✅ DELETE+TTL | ✅ bi-temporal 失效 | ✅ compaction | ✅ **失效不删 + 热度晋升 + TTL** |
| 可视化管理界面 | ⚠️ 设置页列表 | ⚠️ | ❌ | ⚠️ 文本编辑器 | ✅ | ✅ | ❌ | ⚠️ | ✅ | ⚠️ | ✅✅ **一等主面板 10 视图** |
| 记忆投毒防护 | ⚠️ | ⚠️ 敏感话题开关 | ❌ | ❌ | ⚠️ 批准制 | ⚠️ | ❌ | ⚠️ | ⚠️ | ⚠️ | ✅ **来源分级门控 + 白名单 + 告警** |

### 可直接借鉴的机制（已吸收进本设计）

| 来自 | 机制 | 用在哪 |
|---|---|---|
| Claude Code auto memory | `MEMORY.md` 索引硬上限 200 行 / 25 KB；召回时只把 filename+description 给模型让它挑 ≤5 个文件读全文 | [04](04-index-and-recall.md) 目录层与按需层 |
| Anthropic memory tool | 6 原语（view/create/str_replace/insert/delete/rename）+ 客户端执行 → 存储后端与协议解耦 | [05](05-write-pipeline.md) 写入原语；[03](03-memory-format.md) 路径即检索键 |
| Anthropic memory tool 类型学 | `user / feedback / project / reference` 四分法写进 frontmatter `type` | [03](03-memory-format.md) 扩展为 8 类，type 决定作用域与保留策略 |
| ChatGPT Model Set Context | 用户显式记忆是真相源，冲突时覆盖自动推断 | [05](05-write-pipeline.md) 优先级 `user-stated > feedback > model-inferred`；自动条目不得覆盖用户条目 |
| ChatGPT Recent Conversation Content | 只回灌用户消息（时间戳+话题），丢掉助手回复 → 极高密度 | [03](03-memory-format.md) `episode` 层压缩格式 |
| ChatGPT Dreaming | 后台跨历史整体重写画像，存"结论"不存原文，新信号覆盖旧 | [05](05-write-pipeline.md) `PROFILE.md` 周期性重写 + 上一版快照 |
| mem0 | 抽取 → 检索 top-s 相似 → LLM 判 `ADD/UPDATE/DELETE/NOOP` | [05](05-write-pipeline.md) 写入决策核心 |
| Zep / Graphiti | bi-temporal：矛盾不删除，标 `invalid_at`，支持时点回溯 | [03](03-memory-format.md) `temporal.*` 字段；[07](07-plugin-ui.md) 时间线时点视图 |
| Letta sleep-time compute | 离线 agent 重写 memory blocks，主 agent 不持有编辑权，test-time compute 降 ~5× | [05](05-write-pipeline.md) 后台固化；对话热路径只允许追加候选 |
| MemoryOS | 短/中/长三层 + 热度晋升 + 短期 FIFO | [03](03-memory-format.md) `stats.heat` 与晋升规则 |
| Cursor / Windsurf / Copilot | 四档触发 `always_on / glob / model_decision / manual` 声明式元数据 | [03](03-memory-format.md) `activation` + `globs` |
| Anthropic Agent Skills | 三级渐进披露（name+description 常驻 → 正文触发 → 附件按需） | [04](04-index-and-recall.md) 整个召回架构 |
| Anthropic context editing | 清理陈旧 tool result（−84% token）的前提是"清掉的必须先落盘" | [05](05-write-pipeline.md) `compaction/start` 抢救钩子 |
| Agentic Git (GCC) | `MERGE` 用 LLM 合成算子而非文本三方合并 | [06](06-portability.md) 同步冲突解决 |
| Cursor Memories | 后台提议 + **用户批准**才生效 → 建立信任 | [05](05-write-pipeline.md) `writeMode: suggest` 与输入框确认卡 |

## 5. 差异化（一句话版本）

1. **唯一把「明文可编辑」和「自动分类分层」同时做到的方案** —— Claude Code 有明文但只有 4 类且 machine-local；mem0/Zep 有自动化但真相源不可读。
2. **唯一把前缀缓存当一等约束的记忆插件** —— 逐字节幂等注入 + 面板里的缓存健康指标。前作在这上面翻过车。
3. **唯一能把「各 agent 的记忆」和「各 agent 的会话」统一收编成一份可编辑记忆的方案** —— 注意方向：**是导入进来，不是共享出去**。Claude Code 的 auto memory、Cursor 的 rules、Windsurf / Cline / Copilot / Gemini 的约定、以及你机器上那个第三方前作的数据，全都能读进来变成同一种格式；更关键的是**会话本身也是记忆来源**：把历史会话（dsh 的 `session.v4.jsonl.zstd`、Claude Code 的 jsonl、任意导出的对话）喂进同一条「抽取 → 门控 → 决策」管线，批量生成记忆。别人做的是"下次对话时记得"，我们做的是"把过去所有对话一次性变成可检索的记忆"。
4. **配置克制** —— 目标 ≤40 个配置键（前作 159 个），工具面 6 个（前作 15 个）。工具 schema 每轮都进请求头，前作 51 个工具里 15 个是记忆工具，`request/header` 事件 42 KB —— 这是实打实的每轮固定开销。
5. **后台任务受限且可见** —— 不申请 `danger-full-access`，不用隐藏父会话；固化任务在面板里有进度、有日志、有快照、可中止。
6. **进程内 Cordis 插件，而不是 MCP server** —— 这条最容易被忽略，却是结构性的。dsh 官方给记忆留的位置是 MCP（3 个默认关闭的参考配置），社区也已经有 13+ 个记忆插件走 MCP 路线；但 MCP server 是**子进程 + 工具调用**，它**拿不到 `ctx.systemPrompt`**（无法做常驻层与目录层注入），也**观察不到 `session/event`**（无法在 `turn/end`、`compaction/start` 上做自动抽取与抢救）。社区讨论 #7862 / #9890 已经准确指出了这两个缺陷。我们是进程内插件，两件事都能做——这不是"实现得更好"，而是**能不能做的差别**。同时 dsh 的 stdio 桥会主动剥离名字像凭据的环境变量与所有 `DSH_*` 变量，MCP 路线连"知道自己在哪个 workspace"都要靠猜。

> 官方在记忆相关的讨论下**从未回复**（全部 `authorAssociation: NONE`），说明这块官方短期不会自己做。窗口是开着的。

### 5.1 一句话说清定位

**这是一个 dsh 专属的记忆中枢：把其他所有 agent 的记忆和会话收编进来，在 dsh 的插件页里统一管理。**

| 是 | 不是 |
|---|---|
| ✅ dsh 插件：数据在 `$DSH_HOME/memory`，面板在 dsh 侧栏，管理全在 dsh 内 | ❌ 一个所有 agent 共用的记忆服务 |
| ✅ 导入 Claude Code / Codex / Cursor / Windsurf / Cline / Copilot / Gemini 的记忆文件 | ❌ 让这些工具来读我们的存储 |
| ✅ 导入它们的会话记录，批量挖出记忆 | ❌ 给别的工具提供 API / MCP 端点 |
| ✅ 「会话 → 记忆」是与实时写入**同一条**管线：抽取 → 门控 → 决策 | ❌ 两套抽取逻辑 |
| ✅ 单向导出成通用格式作为**可选**互操作出口（默认关闭） | ❌ 把投影当核心卖点 |

真正的护城河在 in 侧：**能读的格式越多、能挖的会话越多，收编价值越大。** 存储位置默认跟随 dsh 自己的家目录（`~/.dsh/memory`），需要让外部工具直接读原文件时再把 `memoryRoot` 指到 `~/.dsh/memory`——那是显式选择。

## 6. 非目标（明确不做）

- ❌ 不做服务端多租户记忆平台，不做账号体系
- ❌ 不把向量库当真相源（`.cache/vectors/` 永远可删可重建）
- ❌ 不做浏览器/桌面独立 App（前端只作为 dsh slot 内的 React 组件存在，官方明令禁止 iframe 方案）
- ❌ 不做 TUI（dsh 官方不发布 TUI；我们提供 slash 命令与 JSONL 降级）
- ❌ 不接管会话历史存储（会话仍归 dsh `sessionPersistence`；我们只读 `ctx.sessionQuery`）
- ❌ 不往 dsh session 事件流里写自定义事件类型（会导致 Session 拒绝重新打开）
- ❌ 不追求「记住一切」—— 默认保守，宁可漏记噪声也不写脏数据

## 7. 成功指标

### 北极星

> **「该被想起的事被想起了」的有效率** = 1 − (用户显式指出"你忘了/我说过"的次数 ÷ 会话数)

### 分层指标

| 层 | 指标 | 目标 |
|---|---|---|
| 成本 | 记忆注入 token ÷ 请求总 token | **≤ 3%**（常驻层 ≤2 KB，目录层 ≤400 token） |
| 成本 | DeepSeek 前缀缓存命中率相对无插件基线的下降 | **≤ 1 个百分点** |
| 成本 | 记忆工具 schema 在 `request/header` 里的字节数 | **≤ 6 KB**（对标前作 15 工具） |
| 召回 | 目录层命中 → 模型主动调 `memory_recall` 的比率 | ≥ 60% |
| 召回 | 零命中查询比率（`zeroHit / events`） | ≤ 15% |
| 质量 | 用户手工删除/修正条目的比率（= 记错了） | ≤ 5% |
| 质量 | 写入决策中 `NOOP` 占比（= 噪声过滤有效性） | 30–60% 区间（过低说明在乱写，过高说明抽取器没用） |
| 质量 | 矛盾共存条目数（doctor 检出） | 趋近 0 |
| 膨胀 | 常驻层字符数月增长率 | 趋近 0（固化在起作用） |
| 信任 | 面板周活跃查看率（装了插件的用户里打开过面板的比例） | ≥ 40% |
| 可移植 | 导入成功率（dry-run 预检条目 → 实际落盘无错误） | ≥ 99% |

### 反向指标（必须监控，任一恶化即视为回归）

- **静默漏召**：被相关度门控裁掉的候选数 —— 必须写进审计并在面板可见，不能默默丢
- **索引漂移**：`INDEX.md` 与条目文件不一致的条数
- **派生文件被手改后覆盖**：用户改了 `PROFILE.md` 却被下次生成覆盖的次数（必须为 0，靠 doctor 拦截）
- **记忆膨胀速率**：条目总数 / 字符总量的周增长
- **审计里的异常突增**：单位时间写入量超过阈值（投毒信号）

## 8. 产品姿态

三个决定用户信任的默认值，全部对齐业界最佳实践而非最炫技的做法：

1. **敏感话题默认不记**（对齐 Claude：Team/Enterprise 默认关闭健康、信仰等类别）
2. **长期记忆默认需要"用户说过"或"热度晋升"**（对齐 Cursor：后台提议 + 用户批准）
3. **默认不写进用户的 git 仓库**（`~/.dsh/memory/` 在仓库外；仓库投影是显式开关，避免把个人画像带进公司代码库）
