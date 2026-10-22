# 05 · 写入管线、后台固化与遗忘

> 本章回答：**什么时候写、写什么、怎么防止写脏、怎么让记忆不无限膨胀。**

## 1. 触发点全表

⚠️ 事件语义陷阱（官方文档明确警告）：`turn/*`、`step/*`、`tool/call`、`tool/result`、`compaction/*` 是**持久化 session 事件类型，不是同名 Cordis 事件**。要观察它们必须 `ctx.on('session/event', (session, event) => …)` 再判 `event.type`。

| 触发 | 挂载点 | 做什么 | 节流 |
|---|---|---|---|
| turn 结束 | `session/event` → `event.type === 'turn/end'` | 入队抽取本轮 user/assistant 消息 | cooldown 30 min（同项目） |
| turn 将结束 | `agent/turn-stopping`（serial，可 `steer()`） | 最后一次抽取窗口 | — |
| **compaction 前抢救** | `session/event` → `compaction/start` | 扫描将被压缩的消息，抽取候选落 `episode` | 无节流（不可逆操作前必须跑） |
| compaction 摘要 | `session/event` → `compaction/summary` | 摘要本身落 `episode`，标 `source: model-inferred`、`confidence: low` | — |
| 助手消息落定 | `session/event` → `assistant/message` | 提取"决策/结论"一行（不存长回复） | 批量 |
| 工具结果 | `session/event` → `tool/result` | **只提取实体与关系**（谁负责什么、依赖什么），不提取内容作为事实 | 批量 |
| 会话结束 | `session/event` → `session/end-seed` / `workspace/session-stop` |  flush 队列 + 生成项目白板 | — |
| 空闲 | `agent/status === 'idle'`（**不 poll**，只在事件回调里读） | 跑一次轻量固化 | 距上次 ≥10 min |
| 定时 | `dsh-schedule`（cron + IANA 时区）或 `ctx.setInterval` | 每日固化 + 归档 + 快照 | 默认 09:30 |
| 文件变更 | watcher + `.cache/fingerprints.json` | 用户手改了条目 → 重算 checksum、增量重建索引 | 自身写入豁免 |
| 用户显式 | `/remember`、`memory_write`、面板编辑 | 立即处理，跳过队列 | — |

**为什么不做心跳轮询**：官方 `practices.md` 原文 *"Do not poll `agent/status`. `whenIdle()` does not mean one follow-up finished."* 前作有 `polling-heartbeat.json` + `awayMinutes: 60` + `unattendedAutoHours: ["22:00-08:00"]` 一整套轮询/在场检测。我们保留"多进程心跳"（那是并发选主必需的），但**不用轮询做触发**。

## 2. 候选抽取

两级：**规则先行（零成本、高精度），LLM 兜底（覆盖语义）**。

### 2.1 规则层（正则 + 结构匹配，不花 token）

| 信号 | 抽取为 | 例 |
|---|---|---|
| 显式记忆指令 | 对应 kind，`source: user-stated`，`confidence: high` | "记住…"、"以后都…"、"别忘了…"、"remember that…" |
| 纠正句式 | `feedback` | "不要…"、"别再…"、"我说过…"、"stop …"、"不是这样" |
| 确认句式 | `feedback`（正向，同样重要） | "对，就这样"、"perfect"、"keep doing that"、用户接受了非常规做法而未反对 |
| 身份陈述 | `persona` | "我是…"、"我负责…"、"我做了 N 年…" |
| 决策句 | `project` | "决定用 X 而不是 Y，因为…"、"我们选了…" |
| 关系三元组 | `relations` | "X 负责 Y"、"A 依赖 B"、"C 向 D 汇报" |
| 外部指向 | `reference` | URL + "看板/文档/仪表盘/oncall" 等关键词 |
| 截止日期/绝对化 | 归一化 | "周四" → `2026-10-22`（**相对日期必须转绝对**，否则记忆过期后无法解释） |

**只抽取用户消息与助手的结论行，不抽取助手的长回复**——对标 ChatGPT 的 Recent Conversation Content：只回灌用户消息（时间戳 + 话题），丢掉助手回复，因为助手输出可重新推导，用户输入才携带偏好信号。

### 2.2 LLM 层（后台，受限预算）

规则层没命中但本轮信息量大时，用一次离线推理抽取。**不要用会话 + subagent 做这件事**：前作在 `~/.dsh/aik_auto_memory_use` 建了一个 `permission: "danger-full-access"` 的父会话（标题「记忆中枢 #B10371」），所有后台任务作为 subagent 挂在下面，靠 `send_message` relay 结果回父会话。这套机制的代价是：权限过大、用户看不见、会话列表被污染、还多一整套 `workbenchLoopShort/Long`、`subagentGc*`、`epochToken` 状态机。

我们的做法：

```ts
// Host 侧直接调 LLM，不开会话、不要 danger-full-access
const res = await ctx.llm.stream({
  model: config.curator.model ?? currentSessionModel,
  messages: [{ role: 'user', content: EXTRACTION_PROMPT + transcriptExcerpt }],
  signal,
})
```

抽取 prompt 的硬性要求：输出 JSON 数组，每项 `{kind, title, summary, content, entities, confidence, evidence}`；`evidence` 必须是原文引用（≤80 字），用于溯源与人工核验；**没有 evidence 的候选一律丢弃**（防幻觉记忆）。

预算：单次 ≤4 KB 输入、每日 ≤8 次（对标前作 `autoConsolidateDailyMax: 8`）、可在面板中止。

## 3. 来源分级与门控（P5，防投毒的核心）

```
user-stated  ─┐
manual       ─┼─→ 可直接进长期层（persona/feedback/preference/project/relations/reference/procedure）
imported     ─┘     （imported 需经导入预检与用户勾选）

model-inferred ───→ 可进长期层，但 confidence 初始 ≤ medium，且需 hits≥2 或用户确认才进 always 档

tool-output  ─┐
web-content  ─┼─→ **只能进 episode 层**；晋升为长期条目必须满足：
team         ─┘     (a) 用户在面板/确认卡里显式批准，或
                    (b) hits≥2 且来源可信度评分未触发告警
```

理由（有量化证据）：间接 prompt injection → 污染会话摘要 → 写入长期记忆 → 跨会话存活 → 休眠载荷被无关查询触发 → 静默外传，这条链已被 Unit42 在 Bedrock Agents 上完整复现；MINJA 类攻击的成功率报道达 95%，且**攻击与执行时间解耦**、载荷可休眠数月；系统性研究给出平均 ASR 50.46%。ChatGPT 早在 2024 年就被演示可用注入伪造 memory。

配套四件套：

1. **provenance 标注**：每条记忆记来源与可信度（已在 frontmatter 强制）
2. **trust-aware retrieval**：`sourceTrust` 参与排序（`web-content` 权重 0.2），召回结果里显式标注来源，让模型自己也能警惕
3. **写入白名单**：`ingest.allowAutoKinds` 配置哪些 kind 允许自动写（默认不含 `procedure`——自动生成的操作规程风险最高，前作也用 `procedureHighRiskApproval: true` 做了同样判断）
4. **异常突增告警**：单位时间写入量 > `ingest.burstThreshold`（默认 10 条/小时）→ 面板红色告警 + 暂停自动写入

## 4. 写入决策：`ADD / UPDATE / INVALIDATE / NOOP`

抄 mem0 的两阶段管线（论文报告 p95 延迟 −91%、token −90%、LOCOMO 上比 OpenAI memory 准确率高 26%）：

```
候选
 ↓ 1. 相似检索 top-s（s=5）：L0 frontmatter 过滤 + L1 BM25(+L2 向量) → 同 kind、同 scope、同 entities 优先
 ↓ 2. 决策（规则优先，规则不确定时才用 LLM）
 │
 ├─ 无相似（score < 0.5）                    → ADD
 ├─ 有近似条目且语义等价                       → NOOP（记录理由，不写）
 ├─ 有近似条目且新信息是其细化/补充             → UPDATE（str_replace 式最小改动，revisions++）
 ├─ 有近似条目且语义矛盾                       → INVALIDATE 旧条目（写 invalidatedAt + supersededBy）+ ADD 新条目
 └─ 候选与用户显式条目冲突                     → **用户条目胜出**，新候选降级为 episode 并标 conflictsWith
 ↓ 3. writeMode 判定（见 §5）
 ↓ 4. 原子落盘 → 索引增量重建 → 审计一行
```

**优先级铁律**（对标 ChatGPT：Model Set Context 是真相源，与其他自动块冲突时覆盖）：

```
user-stated / manual  >  feedback（用户纠正过）  >  model-inferred  >  tool-output / web-content
```

**自动写入的条目永远不得覆盖用户显式写入或手工编辑过的条目**——只能被后者失效。用户改一次就永久生效，这是建立信任的关键。

`NOOP` 必须记录理由并计入遥测：`NOOP` 占比是"噪声过滤有效性"的指标，目标区间 30–60%。过低说明在乱写，过高说明抽取器没用。

## 5. `writeMode`：三种产品姿态

| 模式 | 行为 | 适用 |
|---|---|---|
| `auto`（默认） | 直接落盘，事后在「总览 → 最近写入」一键撤销 | 默认；记忆产品的心智就是"先记住，再管理" |
| `suggest` | **落盘前推确认卡**到 `conversation.input.dock`，用户批准才写 | 涉及用户身份与纪律、希望先审批的场景 |
| `manual` | 只有 `/remember`、`memory_write`、面板编辑能写 | 高安全要求场景 |

默认选 `auto`：把"是否记住"从每次打断用户的确认，改成可撤销的自动写入。面板在总览直接暴露最近写入与撤销按钮，信任来自可回滚而不是弹窗。需要审批的人把 `ingest.writeMode` 改成 `suggest` 即可。

`suggest` 抄的是 Cursor Memories 的做法（后台 sidecar 模型提议 → **用户批准**后生效）。确认卡设计（见 [07 §5.4](07-plugin-ui.md)）：**单行折叠、宽度跟随输入区**，kind/来源标签 + 记住/忽略两键；完整摘要见卡片第二行，理由放在悬停提示里。**默认 15 秒无操作自动收起为静默 NOOP**，绝不打断当前任务，也绝不因为用户没点就偷偷写。

## 6. 原子写与并发

```
1. 序列化 frontmatter（固定键序，保证同内容同字节）+ 正文
2. 计算 body 的 sha256 → checksum
3. 写 <path>.tmp.<pid>.<rand>
4. fsync 文件
5. rename 到目标路径（原子）
6. fsync 父目录
7. 更新 .cache/fingerprints.json（含自身写入豁免标记）
8. 增量重建受影响的索引段落（按 sourceRevisions 比对哈希）
9. 审计一行
```

| 并发场景 | 对策 |
|---|---|
| 多进程写同一条目 | `expectedRev` 乐观锁：读时拿 `revisions`，写时比对，不符则重读重决策（不静默覆盖） |
| 多进程同时固化 | `.cache/heartbeat.json` 选主（`{pid, heartbeatAt, instanceCount}`），只有 leader 跑 curator |
| 多设备同时写 | 条目级文件 + 唯一 id → 天然无文本冲突；语义冲突走 [06 §5](06-portability.md) 的 LLM 合并 |
| 写入中断 | tmp 文件残留 → doctor 清理；rename 是原子的所以不存在半写状态 |
| 索引与内容不一致 | 索引永远可从条目重建；启动时校验 `sourceRevisions`，不符则重建 |

## 7. 后台固化（curator）

对标 Letta 的 sleep-time compute（离线 agent 重写 memory blocks，**主 agent 不持有编辑权**，test-time compute 降约 5×）与 ChatGPT Dreaming（Collect → Synthesize → Weigh & update → Inject）。

**读写权限分离**是一条真实的安全设计：对话热路径只允许「追加候选 + 标记」，**合并/重写/归档/晋升只能在 curator 里发生**。这样即使会话被注入，攻击者也只能塞进 episode 层，改不动长期记忆的结构。

### 7.1 固化任务清单

| 任务 | 动作 | 触发 |
|---|---|---|
| `merge` | 找近义条目（同 kind + BM25/向量相似 > 0.85）→ LLM 合成一条，保留双方原文到 `archive/`，新条目 `links.derivedFrom` 指向双方 | 每日 / 阈值 |
| `rewrite-summary` | 重写低质量 `summary`（太短、太泛、与正文不符） | 每日 |
| `rewrite-profile` | **整体重写** `persona/PROFILE.md`：新信号覆盖旧、重复出现的加权（Dreaming 的 Weigh & update） | 每 N 会话（默认 20）或每周 |
| `promote` | `episode` → 长期条目（满足 §5 晋升规则） | 每日 |
| `demote` | 冷条目（`heat < 0.1` 且 `lastUsedAt` > 90 天）→ `archive/` | 每周 |
| `expire` | `episode` TTL 到期 → 蒸馏要点 → 归档 | 每日 |
| `reindex` | 重建 `INDEX.md` / `catalog.json` / `graph.jsonl` / FTS | 每次固化末尾 |
| `validate` | doctor 全量检查 | 每次固化末尾 |

### 7.2 固化的安全网

1. **每次固化前自动快照**（`snapshots/<ts>__consolidate/`），失败或结果不满意可一键回滚
2. **合并即有损 → 必须可回溯**：新条目的 `links.derivedFrom` 指向被合并的双方，双方原文进 `archive/`（永不删）
3. **LLM 合并失败 → 退回"整条原文归档"**，信息不丢（前作验证过的降级路径）
4. **面板可见**：固化任务在面板"总览"里有进度、日志、本次合并/归档条数，可中止。这是对前作"隐藏工作台"的明确纠正
5. **预算限制**：每日 LLM 调用次数上限、单次输入上限，超限则本次固化只做规则部分

### 7.3 与 dsh compaction 的关系

dsh 的 compaction 压缩的是**会话消息流**，不动记忆文件。所以「该长期留的东西必须在 compaction 前被写进文件」——这正是 `compaction/start` 抢救钩子存在的理由。同理 Claude Code 的 `/compact` 与 auto-compact 也不动 memory 文件，且 `CLAUDE.md` 只在会话开始读一次、中途改不生效。

抢救逻辑：`compaction/start` → 取将被压缩的事件范围 → 规则抽取 + 一次 LLM 抽取 → 全部落 `episode`（不做晋升判断，先保住信息）→ `compaction/summary` 到达时把摘要也落一条 `episode`（`source: model-inferred`, `confidence: low`）。

## 8. 遗忘与衰减

「遗忘」在本设计里有四种不同语义，**必须分开**，混为一谈是记忆系统的常见设计错误：

| 语义 | 实现 | 可逆 | 用途 |
|---|---|---|---|
| **失效** invalidate | 写 `temporal.invalidatedAt` + `supersededBy`，文件移入 `archive/` | ✅ 可 restore | 事实被新事实取代（"现在用 pnpm 了"取代"用 npm"） |
| **过期** expire | `temporal.expiresAt` 到期 → 蒸馏要点 → 归档 | ✅ | episode TTL |
| **降级** demote | `heat` 过低 → 归档，退出默认召回面 | ✅ | 控制索引膨胀 |
| **删除** delete | 物理删除文件 + 派生索引 + 向量 + （可选）审计正文 | ❌ | **仅用于 GDPR 被遗忘权与用户显式硬删** |

默认永远是前三种。物理删除是重操作，需要 `hard: true` + 二次确认 + 审计留痕（审计里保留"删过什么 id"但不保留正文）。

**bi-temporal 的价值**（对标 Zep/Graphiti 的 `t_valid`/`t_invalid` + `created_at`/`expired_at`）：支持"当时他是怎么说的"这类时点查询。面板时间线可以选择某一天，展示**当时有效**的条目集合——这对排查"为什么 agent 那时候做了那个决定"极其有用，也是"矛盾不删除"这个决策能兑现价值的地方。

## 9. 白板（whiteboard）—— 保留前作最好的一个设计

`projects/<slug>/whiteboard.md` 是一个人可读可写的 Markdown，5 条泳道：

```markdown
## 目标          <!-- tag: type:goal -->
## 进行中        <!-- tag: type:progress -->
## 失败与弯路    <!-- tag: type:dead-end -->
## 进度与下一步  <!-- tag: type:next -->
## 版本归档      <!-- tag: type:archived -->
```

与 `PLAN.md` 类白板的区别：**它是派生产物 + 人工可写层的双向通道**。curator 每轮更新它；用户手工改动会被检测（checksum），doctor 询问"回灌为条目还是丢弃"。

「失败与弯路」这条泳道特别有价值：它记的是**此路不通**，这类知识在代码和 git history 里都查不到，却是重复踩坑的主要来源。

预算：注入时裁剪到 `budget.whiteboardChars`（默认 1200，slim 态 400）——对标前作 `handoffPlanChars: 1200 / slimPlanChars: 400`。
