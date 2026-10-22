# 03 · 记忆数据模型与文件规范

> 本章是**规范（spec）**，不是建议。实现与文档冲突时以本章为准，修改本章需同步升 `schemaVersion`。

## 1. 三条不可妥协的存储决策

| 决策 | 理由 |
|---|---|
| **一条记忆 = 一个 Markdown 文件**（per-record，而不是一个主题多条目） | 原子写不需要读改写整文件 → 天然免疫并发写坏；单条可 diff / review / 删除 / 回滚；手工编辑影响面最小。前作把多条塞进 `PLAN.md` + `<!-- memory:id -->` 锚点，代价是必须维护 sidecar 索引与锚点一致性 |
| **聚合视图全部是派生产物** | `INDEX.md` / `PROFILE.md` / `GENEALOGY.md` / `graph.jsonl` 都由条目 frontmatter 反向生成，**永不手写**。这是治「索引与内容漂移」这个文件式记忆头号故障的唯一办法 |
| **真相源在 `~/.dsh/memory/`** | 这是 dsh 专属插件，数据默认跟随 `$DSH_HOME`；与其他工具的关系是**导入**而不是共享。需要外部工具直接读原文件时再显式覆盖 `memoryRoot` |

## 2. 记忆类型学（8 类，自动分隔）

对标 Anthropic memory tool 的四分法（`user / feedback / project / reference`），扩展出关系图谱、程序性、情景三类，并把"自索引"独立为派生层而非一种记忆。

| kind | 中文 | 存什么 | 作用域 | 注入档 | 允许的来源 | 保留策略 | 衰减 |
|---|---|---|---|---|---|---|---|
| `persona` | 画像 | 用户身份、角色、技术栈、沟通风格、长期目标 | global | **always** | `user-stated` / `model-inferred`（需晋升） | 长期，周期重写 | 不衰减，但被新信号覆盖 |
| `feedback` | 反馈偏好 | 用户对工作方式的纠正与确认（"别加总结"、"就用单个 PR"） | global / project | **always**（高优先） | `user-stated` 为主 | 长期 | **不衰减**（安全/纪律类记忆衰减会造成重复犯错） |
| `relations` | 族谱/关系 | 人物、组织、服务、系统之间的关系三元组（谁负责什么、谁向谁汇报、A 依赖 B） | global / project | on_demand + 图遍历 | `user-stated` / `tool-output`（需晋升） | 长期 | bi-temporal 失效 |
| `project` | 项目事实 | 架构决策、约束、术语、踩坑、环境怪癖 | project | glob / on_demand | 全部（`tool-output` 需晋升） | 长期 | 慢衰减 |
| `reference` | 外部指向 | 外部系统在哪：看板、文档、仪表盘、oncall 频道 | global / project | on_demand | `user-stated` | 长期 | 定期校验链接有效性 |
| `procedure` | 程序性 | 可复用操作步骤、检查清单、回滚方案；可一键导出为 `SKILL.md` | project / global | on_demand | `model-inferred` + 成功次数门槛 | 长期 | 按成功率淘汰 |
| `episode` | 情景 | 短期上下文：某次会话在干什么、临时结论、原始证据片段 | project | **不注入**，仅检索 | **全部**（唯一允许 `web-content` / `tool-output` 直接落地的层） | TTL（默认 14 天）+ FIFO | 快衰减，到期归档 |
| `preference` | 偏好（细粒度） | 可枚举的具体选择项（语言、框架、命名风格、工具链版本） | global / project | always（紧凑表） | `user-stated` | 长期 | 被新值覆盖 |

> **`persona` vs `preference` vs `feedback` 的判别**（抽取器的分类规则，必须写进 prompt 与 doctor 校验）：
> - `persona` = 关于**用户是谁**（"用户是后端开发，十年 Go 经验，第一次碰 React"）
> - `preference` = 关于**用户要什么**（"提交信息用中文"、"用 pnpm 不用 npm"）—— 键值型，可枚举
> - `feedback` = 关于**agent 该怎么做**（"不要在改完代码后加总结"）—— 指令型，必须带 **Why**
>
> `feedback` 条目正文强制三段式：规则本身 → `**Why:**`（用户给的理由，常是过往事故）→ `**How to apply:**`（何时生效）。理由字段让未来的自己能判断边界情况，而不是机械遵守。

### 2.1 自索引不是记忆，是派生层

用户提到的"自索引"在本设计里是**三个派生产物**，全部由 `index` 模块从 frontmatter 生成：

| 产物 | 面向 | 内容 | 硬上限 |
|---|---|---|---|
| `INDEX.md` | 人 + 模型 | 按 kind 分组的紧凑目录，每行 `- [title](path) — summary` | **200 行 / 25 KB**（对齐 Claude Code auto memory 的实测上限） |
| `.cache/catalog.json` | 插件自己 | 目录层的结构化版本（避免每次解析 Markdown） | 无（派生缓存） |
| `PROFILE.md` / `GENEALOGY.md` | 人 + 其他 agent 工具 | 画像汇编 / 族谱图（Mermaid + 邻接表） | 2 KB / 4 KB |

**超限时不静默截断**：触发 `curator` 固化（合并近义、降级冷条目到 archive），并在面板总览与 doctor 里报警。静默截断 = 静默丢失记忆，是最坏的失败模式。

## 3. 目录布局

```
~/.dsh/memory/                         # MEMORY_ROOT，可被 $DSH_MEMORY_ROOT 或 config.memoryRoot 覆盖
├── MANIFEST.yaml                         # schemaVersion / rootId / createdAt / device 列表 / 语言
├── INDEX.md                              # 【派生】总索引，硬上限 200 行 / 25 KB
├── persona/
│   ├── PROFILE.md                        # 【派生】画像汇编（跨工具可直接读）
│   └── m_<ULID>.md
├── preference/
│   └── m_<ULID>.md
├── feedback/
│   └── m_<ULID>.md
├── relations/
│   ├── GENEALOGY.md                      # 【派生】Mermaid 图 + 邻接表
│   ├── graph.jsonl                       # 【派生】边表：{from, rel, to, confidence, mid, validFrom, invalidatedAt}
│   └── m_<ULID>.md
├── reference/
│   └── m_<ULID>.md
├── procedures/
│   └── m_<ULID>.md
├── projects/
│   └── <slug>/                           # slug 规则见 §3.1
│       ├── BRIEF.md                      # 【派生】项目简报（glob 触发注入的正文来源）
│       ├── facts/m_<ULID>.md             # kind: project
│       ├── episodes/YYYY-MM-DD.jsonl     # append-only，每行一个 episode（格式见 §6）
│       ├── relations/m_<ULID>.md         # 项目内关系（可选）
│       ├── whiteboard.md                 # 交接白板，人可读可写（对齐前作 handoff/PLAN.md 的好设计）
│       └── index.json                    # 【派生】项目内 sidecar 索引
├── archive/
│   └── <yyyy>/m_<ULID>.md                # 失效/过期/被取代条目，退出召回面，仍可 memory_read
├── audit/
│   └── YYYY-MM-DD.jsonl                  # 审计流水（格式见 §7）
├── snapshots/
│   └── <ISO-ts>__<label>/                # 固化/导入/批量操作前的备份（格式见 §8）
├── sync/
│   ├── devices.json                      # 设备列表 + 各自最后位点（向量时钟）
│   ├── outbox.jsonl                      # 待推送变更
│   └── conflicts/<ts>-<mid>.json         # 待裁决冲突（并排双方原文 + LLM 合并建议）
└── .cache/                               # 【全部可删、永不同步】
    ├── fts.sqlite                        # L1：FTS5 + 元数据表
    ├── vectors/<model>.bin               # L2：本地向量（可选）
    ├── catalog.json                      # 目录层结构化缓存
    ├── fingerprints.json                 # path → "<size>:<mtimeMs>"，增量重建用
    └── heartbeat.json                    # 多进程选主
```

### 3.1 `<slug>` 规则（重要：不要复用 dsh 的编码）

dsh 自己的会话目录编码是 `--<cwd 里 / 换成 ->--`，而前作记忆插件用的是 `---<保留前导斜杠>--`（前导 3 个 dash）——**两套编码不一致，混用会导致导入错位**。

本插件定义唯一规则并写进 `MANIFEST.yaml`：

```
slug = base64url(sha256(absolutePath)) 的前 12 位  +  "-"  + humanTail
humanTail = 路径最后一段，做 [^a-zA-Z0-9._-] → "-" 归一化，截断到 32 字符
例：/Users/lilinhan/company/sy/idea/data-platform-server
  → a1b2c3d4e5f6-data-platform-server
```

哈希前缀保证唯一与稳定（改名/移动可检测），人类尾巴保证 `ls` 时可读。`projects/<slug>/index.json` 里记录 `absolutePath` 与 `pathHash`，路径变更时 doctor 能识别并提议迁移。

### 3.2 命名与编码约束

- 文件名 `m_<ULID>.md`，ULID 大写 Crockford base32（26 字符）。选 ULID 不选 UUIDv4：**按时间可排序**，`ls` 即时间线；不选前作的 `mem_<32hex>`（md5，无序、不可读、碰撞处理麻烦）
- 全部 UTF-8 无 BOM，LF 换行。写后校验 UTF-8 合法性（防前作社区报告过的"CLAUDE.md 被写进二进制/十六进制乱码"事故）
- 单条目正文软上限 2 KB、硬上限 8 KB；超限说明该拆分或该进 `episode`
- 路径全部在 `MEMORY_ROOT` 内，写入前做 realpath 前缀校验（防目录穿越）

## 4. 条目文件规范

```markdown
---
id: m_01J8ZK3M9QW7RTX2YVBN4C5D6E
kind: feedback
title: 改完代码后不要加总结
summary: 用户能自己读 diff，禁止在回复末尾复述刚做的修改
scope: global
tags: [communication, response-style]
entities: []
activation: always
globs: []
confidence: high
provenance:
  source: user-stated
  createdAt: 2026-10-21T07:03:16.556Z
  createdBy: dsh
  sessionId: session-ea944a10-098e-41af-b40e-667a0ee80d22
  eventSeq: 12
  origin: "turn 3 用户消息"
temporal:
  observedAt: 2026-10-21
  validFrom: 2026-10-21
  invalidatedAt: null
  supersededBy: null
  expiresAt: null
stats:
  revisions: 3
  hits: 7
  lastUsedAt: 2026-10-21T09:12:44.000Z
  heat: 0.62
links:
  relates: [m_01J8ZK3M9QW7RTX2YVBN4C5D7F]
  derivedFrom: []
  conflictsWith: []
privacy:
  pii: false
  sensitive: false
  shareable: team
checksum: sha256:9f2c…
---

不要在回复末尾总结刚做的修改。

**Why:** 用户能自己读 diff，总结是纯噪声；2026-10 明确纠正过一次。

**How to apply:** 每次 Edit/Write 之后，只输出下一步动作或阻塞点，不复述改动内容。
```

### 4.1 frontmatter 字段全表

| 字段 | 类型 | 必填 | 语义 / 校验 |
|---|---|---|---|
| `id` | `m_<ULID>` | ✅ | 全局唯一，**永不复用、永不改变**（跨设备同步与 `supersededBy` 的锚点） |
| `kind` | enum(8) | ✅ | 见 §2；决定存放目录，目录与 kind 不一致时 doctor 报错 |
| `title` | string ≤40 字 | ✅ | 索引用；不含换行 |
| `summary` | string ≤120 字 | ✅ | **目录层唯一展示的正文信息**，写不好就等于永远召不回。固化任务会重写它 |
| `scope` | `global`\|`project` | ✅ | `project` 时必须有 `project` 字段且文件在 `projects/<slug>/` 下 |
| `project` | slug | ⚠️ | scope=project 必填 |
| `tags` | string[] | ❌ | kebab-case，≤8 个；派生出 `by_tag` 倒排 |
| `entities` | string[] | ❌ | 关系图谱节点名；`relations` 类必填 ≥2 |
| `activation` | `always`\|`glob`\|`on_demand`\|`manual` | ✅ | 注入档位，见 [04](04-index-and-recall.md)。对标 Cursor/Windsurf 的四档触发 |
| `globs` | string[] | ⚠️ | activation=glob 必填 ≥1 |
| `confidence` | `high`\|`medium`\|`low` | ✅ | 参与召回排序与相关度门控；`model-inferred` 初始不得为 high |
| `provenance.source` | enum | ✅ | `user-stated`\|`model-inferred`\|`tool-output`\|`web-content`\|`imported`\|`team`\|`manual`。**决定可信度与可落层级**（见 [09](09-security-and-privacy.md)） |
| `provenance.createdAt` | ISO8601 | ✅ | 首次写入时间，不可变 |
| `provenance.createdBy` | string | ✅ | `dsh`\|`claude-code`\|`codex`\|`cursor`\|`manual`\|… |
| `provenance.sessionId` / `eventSeq` | string / int | ❌ | 指回 dsh 会话事件，可精确溯源到"哪一轮说的" |
| `provenance.origin` | string ≤80 | ❌ | 人话描述来源，面板展示用 |
| `provenance.importedFrom` | path | ❌ | 导入条目必填，保留原始出处 |
| `temporal.observedAt` | date | ✅ | 事实被观察到的时间（事件时间线） |
| `temporal.validFrom` | date | ✅ | 生效起点 |
| `temporal.invalidatedAt` | date\|null | ✅ | **失效而非删除**（bi-temporal，对标 Zep/Graphiti） |
| `temporal.supersededBy` | id\|null | ✅ | 指向取代它的新条目 |
| `temporal.expiresAt` | date\|null | ✅ | `episode` 必填（TTL）；其他类通常为 null |
| `stats.revisions` | int | ✅ | 每次 UPDATE +1 |
| `stats.hits` | int | ✅ | 被召回次数 → 热度晋升信号 |
| `stats.lastUsedAt` | ISO\|null | ✅ | 时间衰减基准 |
| `stats.heat` | float 0–1 | ✅ | 综合 hits / recency / 用户显式确认，curator 维护 |
| `links.relates` | id[] | ❌ | 横向关联 |
| `links.derivedFrom` | id[] | ❌ | **溯源链**：长期条目指回它由哪些 episode 提炼而来 |
| `links.conflictsWith` | id[] | ❌ | doctor 检出矛盾时写入，等固化或人工裁决 |
| `privacy.pii` | bool | ✅ | 命中 PII 扫描 → true；true 时**不进团队同步、不进仓库投影** |
| `privacy.sensitive` | bool | ✅ | 敏感话题（健康/信仰/性/政治/财务细节/证件号）；默认不生成此类条目 |
| `privacy.shareable` | `team`\|`none` | ✅ | `none` = 只在本机 |
| `checksum` | `sha256:<hex>` | ✅ | **只覆盖正文**（frontmatter 之后的字节），用于检测手工编辑与写坏 |

### 4.2 字段设计取舍说明

- **为什么 checksum 只覆盖正文**：frontmatter 会被插件频繁改写（`stats.hits` 每次召回都变），若一起算哈希则每次召回都要重写整个文件。正文哈希既能检测用户手改，又不产生写放大。
- **为什么 `stats` 放进条目而不是索引**：跨设备同步时 `stats` 参与冲突判断（谁的 `hits` 更高说明谁在用），必须在真相源里。写放大用「延迟刷盘」解决：`hits`/`lastUsedAt` 累积在 `.cache/` 里，固化时才批量回写。
- **为什么没有 `embedding` 字段**：向量是派生物，写进 frontmatter 会让文件变得不可读且同步体积暴涨。放 `.cache/vectors/`。
- **为什么用 `activation` 而不是让模型全靠自己判断**：声明式元数据让用户能直接控预算（Cursor/Windsurf 已验证这是用户真正会去调的旋钮），也让我们能在**不读正文**的情况下决定要不要注入。

## 5. 生命周期状态机

```
                    ┌──────────── 用户确认 / 热度晋升 ────────────┐
                    ↓                                            │
[候选 candidate] → [活跃 active] ──UPDATE──→ [活跃 active]        │
   (未落盘，           │                                        │
    在队列里)          ├──INVALIDATE──→ [失效 invalidated] ──→ archive/<yyyy>/
                       │                  (invalidatedAt+supersededBy 已写)
                       ├──EXPIRE (TTL)──→ [过期 expired] ────→ archive/<yyyy>/
                       ├──ARCHIVE (冷)───→ [归档 archived] ───→ archive/<yyyy>/
                       └──DELETE (用户硬删)→ 【物理删除】+ 派生索引与向量一并清除 + 审计留痕
                                                                     ↑
                                              GDPR 被遗忘权走这条路，其余一律只失效不删
```

**晋升规则（episode → 长期条目）**，必须同时满足：

1. `provenance.source` ∈ {`user-stated`, `model-inferred`}，**或** `tool-output`/`web-content` 但已被用户显式确认
2. `stats.hits >= 2`（被召回过至少两次 = 真的有用）**或** 用户在面板里点了"提升为长期记忆"
3. 不命中 PII / 敏感话题规则
4. `procedure` 类额外要求：`successCriteria` 非空 **且** 观察到的成功次数 ≥2、失败率 ≤30%（对标前作 `procedureMinSessions:3 / procedureMinSuccess:2 / procedureCorrectionCap:0.3`，其中"无 successCriteria 则结构上永远无法晋升"是很好的设计）

**归档 = 冷存储**：退出 `memory_recall` 的默认检索面，只有蒸馏出的要点通过长期条目继续参与召回；取回原文需显式 `memory_read` 或 `scope=archive` 检索。这与前作的 `memory_maintain` 30 天蒸馏语义一致，是被验证过的做法。

## 6. `episodes/YYYY-MM-DD.jsonl` 格式

append-only，每行一个 JSON 对象。设计对标 ChatGPT 的 Recent Conversation Content（**只留用户消息 + 一行结论，丢掉助手长回复**，因为助手输出可重新推导，密度极高）：

```jsonc
{"v":1,"id":"e_01J8ZK…","sid":"session-ea944a10…","turn":3,"ts":"2026-10-21T07:03:16.556Z",
 "topic":"鉴权中间件重写","user":"<用户消息截断到 200 字>",
 "outcome":"决定用 session token 存 cookie 而不是 localStorage，合规要求","conclusionOnly":true,
 "src":"user|tool-output|web-content","tokens":{"in":19240,"out":58},
 "promoted":null}
```

- `outcome` ≤120 字，是**结论而非过程**（对标 Dreaming 的「存结论不存原文」）
- `promoted` 为 null 表示尚未晋升；晋升后写入目标条目 id，形成双向溯源
- TTL：默认 14 天，到期由 curator 蒸馏出要点后整行移入 `archive/episodes/<yyyy-mm>.jsonl.zst`
- 单日文件上限 256 条（对标前作 `episodicRetention: 256`），超限 FIFO 淘汰最旧

## 7. `audit/YYYY-MM-DD.jsonl` 格式

每一次读写都必须留痕，这是"记忆可追责"与用户信任的前提：

```jsonc
{"ts":"2026-10-21T07:03:16.556Z","actor":"ingest","act":"write","kind":"feedback",
 "id":"m_01J8ZK…","decision":"ADD","reason":"用户显式纠正，无相似条目","src":"user-stated",
 "sid":"session-ea944a10…","bytes":412,"rev":1}
{"ts":"…","actor":"recall","act":"read","ids":["m_…","m_…"],"q":"鉴权","channel":"tool",
 "gated":["m_…"],"budget":{"always":1840,"catalog":392,"total":2232}}
{"ts":"…","actor":"curator","act":"consolidate","merged":3,"archived":7,"snapshot":"2026-10-21T09-30-00__daily"}
{"ts":"…","actor":"user","act":"edit","id":"m_…","via":"panel","rev":4,"checksumChanged":true}
{"ts":"…","actor":"bridge","act":"import","source":"claude-code-auto-memory","added":12,"updated":3,"skipped":1}
```

`act` 枚举：`read` / `write` / `update` / `invalidate` / `delete` / `restore` / `import` / `export` / `consolidate` / `archive` / `sync-push` / `sync-pull` / `sync-conflict` / `repair` / `gate-drop`（被相关度门控裁掉，**反向指标必须可见**）。

保留期默认 90 天，滚动压缩为 `.zst`。审计本身**不含记忆正文**（只含 id 与摘要长度），避免成为第二份隐私副本。

## 8. 快照格式（可恢复的基础）

```
snapshots/2026-10-21T09-30-00__daily-consolidate/
├── snapshot.yaml      # {label, trigger, createdAt, schemaVersion, entryCount, bytes, files: n, checksumRoot}
├── manifest.jsonl     # 每行 {path, sha256, size}  → 支持增量快照与精确 diff
└── payload.zst        # tar 归档（只含真相源与派生聚合，不含 .cache/）
```

- **触发时机**：每次固化前、每次导入前、每次批量操作前、用户手动。默认保留最近 10 个 + 每日 1 个（保留 30 天）
- **增量**：`manifest.jsonl` 的 sha256 让"与上一个快照的差异"可精确计算 → 面板 diff 视图只展示真正变化的条目
- **恢复**：`restore` 前**自动再做一个快照**（恢复本身也可撤销）

## 9. 派生文件格式

### 9.1 `INDEX.md`

```markdown
<!-- GENERATED by dsh-general-automatic-memory · 不要手工编辑 · 重建：/memory doctor -->
<!-- root: ~/.dsh/memory · schema: 1 · entries: 128 · bytes: 18432 / 25600 -->

## 画像 persona (12)
- [后端出身，第一次碰 React](persona/m_01J8ZK3M9QW7RTX2YVBN4C5D6E.md) — 十年 Go，前端解释要类比后端概念
…
## 反馈 feedback (23)
- [改完代码后不要加总结](feedback/m_01J8ZK3M9QW7RTX2YVBN4C5D7F.md) — 用户能自己读 diff
…
## 项目 · data-platform-server (41)
…
```

生成规则：按 `kind` → `scope` → `heat desc` 排序；每类最多 N 行（N 由预算反推，不是固定值）；超限先砍 `heat` 最低的行并把被砍数量写进头部注释（**可观测**，不静默）。

### 9.2 `relations/graph.jsonl`

```jsonc
{"from":"张三","rel":"负责","to":"data-platform-server","mid":"m_01J8…","conf":"high","validFrom":"2026-08-01","invalidatedAt":null}
{"from":"data-platform-server","rel":"依赖","to":"nacos","mid":"m_01J9…","conf":"medium","validFrom":"2026-09-12","invalidatedAt":null}
```

`rel` 是受控词表（可扩展）：`负责 / 汇报给 / 属于 / 依赖 / 使用 / 位于 / 参与 / 取代 / 冲突于`。受控词表让图可查询、可去重；自由文本关系会导致同义边爆炸。

### 9.3 `projects/<slug>/index.json`

sidecar 索引，结构对标前作 `wb_sidecar_pre_v1` 但去掉锚点耦合：

```jsonc
{"version":"gam-index-v1","slug":"a1b2c3d4e5f6-data-platform-server",
 "absolutePath":"/Users/…/data-platform-server","pathHash":"sha256:…",
 "rebuiltAt":"2026-10-21T07:03:19.846Z","entryCount":41,
 "entries":[{"id":"m_…","kind":"project","title":"…","summary":"…","activation":"glob",
             "globs":["src/auth/**"],"heat":0.62,"rev":3,"checksum":"sha256:…","path":"facts/m_….md"}],
 "byTag":{"auth":["m_…"],"compliance":["m_…"]},
 "byGlob":{"src/auth/**":["m_…"]},
 "sourceRevisions":{"facts/m_….md":"sha256:…"}}
```

`sourceRevisions` 让增量重建只需比对哈希，不必解析全部文件。

## 10. 一致性校验（doctor 的检查项）

| 检查 | 严重度 | 自动修复 |
|---|---|---|
| frontmatter 缺必填字段 / 枚举值非法 | error | ❌ 报告，等人工 |
| `kind` 与所在目录不一致 | error | ✅ 提议移动到正确目录 |
| `checksum` 与正文不符 | warn | ✅ 判定为"用户手工编辑"→ 接受新正文并重算 checksum，写审计 `act:repair` |
| 派生文件（`INDEX.md`/`PROFILE.md`）被手工编辑 | warn | ❌ **绝不静默覆盖**：提示"回灌为条目"或"确认丢弃手改并重建" |
| `INDEX.md` 有条目但文件不存在（孤儿索引） | error | ✅ 从索引移除 |
| 文件存在但索引没有（漏索引） | error | ✅ 重建索引 |
| `supersededBy` 指向不存在的 id | error | ❌ 报告 |
| `conflictsWith` 非空且双方都 active | warn | ✅ 加入下次固化队列 |
| 非 UTF-8 / 含 BOM / CRLF | error | ✅ 规范化重写（原文备份到 `.cache/repair/`） |
| 常驻层预算超限 | warn | ✅ 触发固化 |
| 条目正文 >8 KB | warn | ✅ 提议拆分 |
| `episode` 过期未归档 | info | ✅ 归档 |

**修复原则**：能自动修的必须留审计与备份；不能自动修的必须明确报告而不是猜测。宁可停下问人，不可静默改数据。
