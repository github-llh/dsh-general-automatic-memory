# 04 · 自索引、召回与 token 预算

> 本章回答那个唯一的硬问题：**怎么在记忆无限增长的同时，让每轮注入的 token 成本恒定，并且该被想起的事真的被想起。**

## 1. 三级渐进披露（整个架构的骨架）

抄自 Anthropic Agent Skills 的三级披露 + Claude Code auto memory 的实测做法，落到记忆上：

| 级 | 内容 | 何时进上下文 | 成本 | 谁决定 |
|---|---|---|---|---|
| **L-A 常驻层** | `persona/PROFILE.md` 精简版 + 高优 `feedback` + `preference` 紧凑表 | **每个请求都在** | **≤2 KB 字符（硬）** | 插件（`activation: always`） |
| **L-B 目录层** | `INDEX.md` 的紧凑目录：`kind → title + summary`，**不含正文** | 每个请求都在，但按节流规则给完整版/精简版 | **≤400 token（硬）** | 插件 |
| **L-C 全文层** | 条目正文、episode 原文、archive | **只在被点名时** | 按需 | **模型**（调工具）或 glob 命中 |

**关键洞察（来自 Claude Code 的实测做法）**：目录层的作用不是"把记忆塞进去"，而是**让模型知道自己知道什么**，从而主动去调 `memory_recall` / `memory_read`。只把 `filename + description` 交给模型、让它自己挑最多 5 个文件读全文——这条路用模型的语义能力替代了向量库，零基础设施、零索引漂移、完全可解释。Anthropic 的 memory tool 更是**明确不提供 ranked retrieval**，官方推荐做法就是「建目录 → 维护 index 文件 → 定期 review & consolidate」，"路径即检索键"。

所以：**L-B 的质量决定整个系统的召回率**。`summary` 写不好，那条记忆就等于不存在。这也是为什么 `summary` 是必填字段、为什么固化任务的一项重要工作就是**重写 summary**。

### 1.1 反面教材：全量注入

ChatGPT 走的是另一条路——**没有向量库、没有知识图谱、没有检索排序**，四个记忆块每条消息全量注入，赌"模型处理无关上下文的能力 + 推理成本下降"胜过检索精度。Gemini CLI 把整个 `GEMINI.md` 拼进每个 prompt，Cline Memory Bank 要求"任务开始读完全部 6 个文件"。

我们不赌这个。原因很具体：**DeepSeek 的前缀缓存对内容稳定性极其敏感**，全量注入意味着记忆每变一次就击穿一次缓存。前作 `@a9i5k4/dsh-auto-memory` 就在这上面翻过车，作者发过 `level:"urgent"` 的强制升级公告，原文大意是「旧版本存在 DeepSeek 前缀缓存击穿问题，会白白消耗 token（命中率掉到个位数）」。

## 2. 检索后端分级（L0 / L1 / L2，可开关）

**真相源永远是 Markdown。所有检索结构都是可删除可重建的派生缓存。** 这条原则让我们可以随时降级，也让 `.cache/` 永不参与跨设备同步。

| 级 | 后端 | 依赖 | 默认 | 擅长 | 代价 |
|---|---|---|---|---|---|
| **L0** | 纯文件扫描 + frontmatter 过滤 + `.cache/catalog.json` | **零依赖** | ✅ 开 | 小规模（<500 条）完全够用；完全可解释；跨设备零成本 | 规模上去后线性变慢 |
| **L1** | SQLite **FTS5 / BM25** + 元数据表 | `node:sqlite`（Node 22.5+ 内置，Node 24 稳定） | ✅ 开（自动降级到 L0） | 词法检索，对**专有名词、标识符、中文术语**召回远强于向量；零模型成本 | 需要原生模块时 pnpm 会拦构建脚本，用户要点一次 "Allow these scripts and retry" |
| **L2** | 本地向量（`onnxruntime-node` + `@huggingface/transformers`） | 重依赖 + 模型下载 | ❌ 关（可选开启） | 语义同义召回 | 模型下载/内存/跨设备同步都痛。**前作走这条路，实测 `~/.dsh/models/js-semantic` 是空目录，模型从未下载成功** |

**优先用 `node:sqlite` 内置模块而不是 `better-sqlite3`**：dsh 的 pnpm 11 会拦截依赖的构建脚本（本机 `allowBuilds` 里就躺着 `onnxruntime-node`/`protobufjs`/`sharp`），装原生模块要用户手动授权一次。内置模块 = 零授权摩擦。

**融合策略**：L1 与 L2 都开时用 **RRF（Reciprocal Rank Fusion）** 合并排名，再乘 `heat` 与 `confidence` 权重。不做 cross-encoder rerank（成本不划算）。

**索引一致性（增量扫描）**：`MemoryStore` 在内存里维护 `path → {size, mtimeMs, 写入世代}` 的指纹表。每次扫描只重读指纹变化的文件，`size+mtimeMs` 覆盖外部改动（用户手改、别的设备同步过来），进程内自增的写入世代保证同一毫秒内连写两次也一定可见；`get(id)` 直接查内存索引，不再为改一条 frontmatter 全量扫描。**写入成本因此与库内条目数解耦**——旧实现导入 N 条要做 N 次全量扫描（O(N²)），Windows 上单次 create 被放大到秒级。全量重建耗时目标：1000 条目 < 2 s。

## 3. 注入管线

```
┌── 常驻层：ctx.systemPrompt.context({ name:'general-memory', order, text, required:true })
│      ↑ cache-safe：仅在内容变化或 compaction 移除后追加一条 durable 快照
│      ✗ 绝不用 section()：改动会触发 system prompt 面替换 → 击穿前缀缓存
│
├── 动态层：ctx.on('agent/pre-step', async waterfall)
│      1. 不拥有决策时 return await next()（真实 waterfall 是异步的）
│      2. pre-step 只计算目录/glob 快照，不改写 messages
│         —— dsh 会把决策里的普通消息当用户消息落盘，不能拿它做每轮注入
│      3. 快照按会话写入内存 map
│      4. 动态 ctx.systemPrompt.context({ name:'general-memory-catalog', text: ctx => … })
│         由 dsh 的 runtime-context 消息投递（source.kind='runtime-context'）
│         新快照会 supersede 旧快照，不膨胀普通用户历史
│      5. 会话身份取 incoming.agent.session.id（next() 的 fallback 决策不含 agent）
│
└── 按需层：模型调 memory_recall / memory_read / memory_graph
       + glob 命中自动注入（activation: glob 且 globs 匹配当前编辑路径）
```

### 3.1 三档内容的渲染模板

**常驻层**（≤2 KB，稳定优先，尽量不变）：
```
## 关于用户
后端出身（十年 Go），第一次接触 React —— 前端解释请类比后端概念。

## 协作纪律
- 改完代码后不要加总结（用户自己读 diff）
- 重构类改动倾向单个 PR 而非拆分

## 偏好
提交信息中文 · 包管理 pnpm · 缩进 2 空格
```

**目录层**（≤400 token，紧凑，可节流）：
```
## 记忆目录（用 memory_recall 检索，memory_read 读全文）
persona(12) feedback(23) project:data-platform-server(41) relations(18) procedure(6) reference(9)
- 鉴权中间件重写：session token 存 cookie 而非 localStorage，合规要求 [project·high]
- 张三负责 data-platform-server [relations·high]
- Nacos 配置在 .nacos/application-local.yml，不进版本控制 [project·medium]
…（按 heat 排序，砍到预算内；被砍条数写在尾行：`+38 more via memory_recall`）
```

尾行那句 `+38 more` 至关重要——它让模型知道**目录不完整**，从而在需要时主动检索，而不是以为没有。

## 4. token 预算表（全部可配，默认值即产品立场）

| 预算项 | 配置键 | 默认 | 硬上限 | 超限行为 |
|---|---|---|---|---|
| 常驻层字符 | `budget.alwaysChars` | 2000 | 4000 | 按 heat 裁剪 + 报警 |
| 目录层 token | `budget.catalogTokens` | 400 | 800 | 砍低 heat 行 + 尾行提示剩余数 |
| 单次工具返回字符 | `budget.recallChars` | 1600 | 4000 | 截断并提示 `memory_read` 取全文 |
| glob 动态注入字符 | `budget.globChars` | 1200 | 3000 | 按相关度裁剪 |
| 记忆总注入占比 | `budget.maxShareOfRequest` | **0.03** | 0.10 | 触发裁剪 + 面板告警 |
| 工具面 schema 字节 | `budget.maxToolSchemaBytes` | 6000 | 12000 | 自动切到 minimal 工具面 |
| 单条目正文字符 | `budget.entryChars` | 2000 | 8000 | 提议拆分 |
| 记忆工具数 | `toolSurface` | `standard`(6) | — | `minimal`(3) / `standard`(6) |

**占比怎么算**：用 `ctx.tokenMeter.measure(session, requestHeader)`（replay-based、确定性、零模型调用）拿到请求总 token，再除记忆注入部分。**不要用字符数估算 token**——中日韩字符与代码的 token 密度差 3–5 倍。面板的预算水位环直接展示这个实测值。

对标前作的预算设计（`injectBudgetChars: 8000` / `tier0MaxTokens: 400` / `tier0BudgetShare: 0.25` / `globalBriefChars: 1200` / `handoffPlanChars: 1200` / `maxPacketChars: 800`）：我们的**总预算更小（约 3.2 KB vs 8 KB）**，因为前作的 8000 字符是每轮常态开销，而它同时还挂了 15 个工具的 schema。少即是多。

## 5. 逐字节幂等（P4，一等约束）

**规则**：给定相同的输入指纹，注入文本必须逐字节相同。

```ts
// 伪代码
function renderSnapshot(input: SnapshotInput): string {
  const fp = hash([input.alwaysText, input.catalogVersion, input.projectSlug,
                   input.matchedGlobs, input.throttleState])
  const last = cache.get(input.sessionId)
  if (last?.fp === fp) return last.text          // 原样复读，绝不动前缀
  const text = render(input)
  cache.set(input.sessionId, { fp, text })
  return text
}
```

配套约束：

1. **禁止在注入文本里放时间戳、随机数、会话 id、相对时间（"3 分钟前"）** —— 这些每次都不一样，会稳定击穿缓存。要表达时效性就用日期（`2026-10-21`），一天内稳定
2. **排序必须确定性**：`heat desc, id asc` 而不是依赖文件系统返回顺序
3. **数字格式化固定**：不用 locale 相关的千分位
4. **`hits` 延迟刷盘**：召回计数不能立刻写回条目 frontmatter，否则下次渲染就变了。累积在 `.cache/`，固化时批量回写
5. **面板提供"前缀缓存健康"指标**：对比有/无插件时的 `usage.inputTokens` 与缓存命中，一旦劣化立即报警

前作在这一点上做过正确的事，日志里能看到 `原样复读（本请求已定稿·逐字节幂等）` 这个状态；我们要把它从"实现细节"提升为"有测试守护的契约"——CI 里必须有一个测试：同一输入渲染 100 次，字节完全一致。

## 6. 分层节流（对标前作的 tiered inject 四态）

| 状态 | 触发条件 | 注入内容 | 配置 |
|---|---|---|---|
| `cold` | 数据未就绪（首次启动、索引重建中） | 精简版（只有常驻层 + 一行"目录构建中"） | — |
| `full` | 距上次完整版 ≥N 个模型请求 | 常驻层 + 完整目录层 | `throttle.fullEvery = 20` |
| `slim` | 距上次投递 <M 个请求 | 常驻层 + glob 命中（目录层省略） | `throttle.slimEvery = 8` |
| `human` | 检测到真人输入（`user/message` 的 `source.kind === 'user'`） | **无条件完整版** | — |
| `verbatim` | 指纹未变 | 原样复读 | — |

`human` 这一态很重要：真人提问时召回质量的收益远大于 token 成本；agent 自己连续跑几十步时（subagent、长 tool chain）没必要每步都给完整目录。前作用 `完整版（human:9 · 真人在场）` 表达了同一判断。

## 7. 相关度门控与排序

**宁可不给，不可给错**——噪声记忆带偏回答的代价高于漏召。但漏召必须**可观测**（原则：反向指标不能静默）。

```
score = w1·relevance(query, entry)      # L1 BM25 归一化 / L2 余弦
      + w2·heat                         # stats.heat
      + w3·confidenceWeight             # high 1.0 / medium 0.7 / low 0.4
      + w4·sourceTrust                  # user-stated 1.0 / model-inferred 0.8 / imported 0.7 / tool-output 0.4 / web-content 0.2
      + w5·recency                      # 按 kind 差异化衰减，见 §8
      − penalty·conflictFlag            # conflictsWith 非空则降权
```

门控：`score < gateThreshold`（默认 0.35）→ **不注入，但写审计 `act: gate-drop`**，面板"召回诊断"里能看到"哪些候选被门控掉了、差多少分"。这是治"该记的没被想起来"这个最痛失败模式的唯一办法——让它可见、可调。

**零命中处理**：查询无结果时，工具返回**明确的空结果 + 建议**（"未在长期记忆中找到；可尝试 `scope=archive` 或用更具体的实体名"），而不是空字符串。前作日志里的 `recall tail: empty: renderTailFor returned nothing` 说明空结果处理不好会让模型困惑。

## 8. 召回面与衰减

| 层 | 默认进入 `memory_recall` 的 `all` 面 | 衰减率 |
|---|---|---|
| 长期条目（active） | ✅ | 按 kind 差异化：`feedback`/`persona`/`preference` **不衰减**；`project`/`relations` 慢（半衰期 180 天）；`reference` 中（90 天）；`procedure` 按成功率 |
| `episode` | ✅（近 14 天） | 快（半衰期 3 天），到期归档 |
| `archive/` | ❌ 需显式 `scope=archive` | — |
| `invalidated` | ❌ 但可 `memory_read` 与时间线时点查询 | — |

**为什么 `feedback` 不衰减**：用户纠正过的工作方式如果因为"很久没命中"就淡出，会导致重复犯同一个错——这是记忆系统最让人恼火的失败模式。安全/纪律类记忆必须钉死。

**热度公式**（curator 维护，写回 `stats.heat`）：

```
heat = 0.5·min(1, log(1+hits)/log(1+10))          # 召回命中，对数抑制刷量
     + 0.3·exp(-Δdays/60)                          # 时间近因
     + 0.2·explicitBoost                           # 用户显式确认/编辑/钉住 → 1.0
```

`explicitBoost` 让"用户在面板里手动改过这条"成为最强信号——人工投入即价值判断。

## 9. 召回遥测（对标前作 `recall-stats.json`）

`.cache/recall-stats.json`，面板总览的数据源：

```jsonc
{"version":"gam-recall-v1","since":1792566196641,
 "channels":{
   "inject":{"events":17,"hits":131,"zeroHit":0,
             "byLayer":{"always":17,"catalog":14,"glob":3},
             "byDay":{"2026-10-21":131},
             "chars":{"always":1840,"catalog":392,"glob":0},
             "gated":2,"lastAt":1792566341782},
   "tool":{"events":4,"hits":11,"zeroHit":1,"expand":3,"byKind":{"project":6,"relations":3,"feedback":2}},
   "shadow":{"events":0,"hits":0}},
 "budget":{"lastShare":0.021,"maxShare":0.03,"overruns":0},
 "cacheHealth":{"verbatimRate":0.71,"prefixBreaks":0}}
```

- `verbatimRate` = 原样复读的比率，**越高越好**（说明注入稳定）
- `prefixBreaks` = 检测到注入文本变化导致的前缀失效次数，**必须趋近 0**
- `gated` = 被门控裁掉的候选数（反向指标）
- `shadow` 通道：开启 `debug.shadowRetrieval` 时，用"更激进的检索"跑一遍但不注入，只记录"如果用它会多出什么"——用来调门控阈值而不冒污染上下文的风险。这是前作 `shadowRetrievalEnabled` 的好设计，保留。

## 10. 工具面设计（6 个，token 成本是一等考量）

**工具 schema 每轮都进 `request/header`。** 前作 15 个记忆工具，实测那次会话的 `request/header` 事件 42,965 B（51 个工具）。我们把记忆工具压到 6 个、schema 总量 ≤6 KB，并提供 `minimal`（3 个）档位。

| 工具 | 参数（`*`=必填） | 返回 | 说明 |
|---|---|---|---|
| `memory_recall` | `query*`, `limit`(≤10, 默认 5), `scope`(`active`\|`all`\|`archive`\|`episodes`), `kind`, `project`, `expand`(id) | **默认 L0 摘要列表**：`[{id, kind, title, summary, score, confidence, source, why}]`；传 `expand` 才返回该条全文 | 渐进式加载。`why` 字段说明为什么命中（可解释性） |
| `memory_read` | `id*` \| `path*`, `revision` | 全文 + frontmatter | 支持读 archive 与历史 revision |
| `memory_write` | `content*`, `kind*`, `title*`, `summary*`, `action`(`add`\|`update`\|`invalidate`, 默认 add), `targetId`, `scope`, `project`, `tags[]`, `entities[]`, `activation`, `globs[]`, `why`, `expectedRev` | `{id, decision, reason}` | 模型提交**候选 + 意图**，最终 `ADD/UPDATE/INVALIDATE/NOOP` 由插件决策（不让模型直接决定，防乱写）。`expectedRev` 乐观锁 |
| `memory_forget` | `id*`, `reason*`, `hard`(bool, 默认 false) | `{archived\|deleted}` | 默认失效归档（可恢复）；`hard:true` 才物理删除，需 `writeMode != manual` 且触发二次确认 |
| `memory_graph` | `entity*`\|`id*`, `direction`(`out`\|`in`\|`both`), `depth`(≤3), `rel` | 邻接表 + Mermaid 文本 | 正向展开与反向溯源**合一**（前作拆成 `memory_expand` + `memory_trace` 两个工具，浪费 schema） |
| `memory_status` | — | 预算水位、条目数按 kind、最近写入、缓存健康、待处理冲突数 | 只读、极便宜，模型自查用 |

**明确不做成工具的**（省 schema，改走命令或面板）：`import` / `export` / `consolidate` / `maintain` / `reflect` / `procedure_list` / `sync`。前作把这些都做成了工具，其中 `memory_reflect` 还需要在 system prompt 里写一大段触发纪律（实测它的记忆 system prompt section 约 3,020 字符，把会话 system prompt 从 5,957 撑到 8,976 字符）。**我们把纪律压到 ≤600 字符，其余靠插件自动触发，不靠模型自觉。**

### 10.1 system prompt 纪律文本（≤600 字符，逐字节稳定）

```
## 记忆
你有持久记忆，落在 ~/.dsh/memory/ 的明文 Markdown 里。
- 每轮上下文含【记忆目录】(title+summary)。目录不完整，尾行的 "+N more" 表示还有。
- 需要细节时调 memory_recall 检索、memory_read 读全文、memory_graph 查关系。
- 用户说了值得长期记住的事（身份、偏好、纠正、决策、人物关系），调 memory_write 提交候选；
  插件会自行判定 ADD/UPDATE/NOOP，你不需要也不应该重复提交同一件事。
- 思维链用完即焚；只有写进文件的才算记住。
```

## 11. Slash 命令（人用的入口）

| 命令 | 作用 |
|---|---|
| `/memory <subcommand>` | 管理入口：`status` / `search <q>` / `read <id>` / `add <文本>` / `forget <id>` / `doctor` / `import [源]` / `export [目标]` / `sync` / `panel`（打开侧栏面板） |
| `/remember <文本>` | 一键捕获为候选，走 `suggest` 确认流程，不打断当前任务 |
| `/recall <问题>` | **不改上下文**，直接把检索结果打印给人看 —— 调试召回质量的关键工具，让用户能验证"它到底能不能想起来" |

`/recall` 是产品上的小心思：用户不信任黑盒记忆时，最有效的解药不是解释架构，而是给他一个能反复试探的探针。

## 12. CLI / headless 降级

dsh 官方**不发布 TUI**（shipped bundle 只有 `base`/`web-app`/`headless`/`sdk-app`/`sdk-minimal`/`acp-app`），官方降级路径是 `UI (GUI; CLI emits JSONL)`。所以：

- 面板的每个视图都对应一个 HTTP 路由与一个命令输出：`/memory status` 打印总览、`/memory search` 打印浏览、`/memory doctor` 打印体检
- 所有命令支持 `--json` 输出，headless / acp / sdk 场景可被脚本消费
- 注入管线与 UI 完全无关，CLI 下照常工作 —— **没有 UI 不等于没有记忆**
