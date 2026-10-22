# 06 · 跨 agent 工具、跨设备、导入导出与恢复

> 可移植性有三个方向，必须分开设计：**导入（in）**、**投影（out）**、**同步（peer）**。混为一谈是这类功能做坏的主要原因——导入要处理格式差异，投影要处理"别把隐私写进公司仓库"，同步要处理冲突。

## 1. 单一真相源 + 单向投影（总原则）

```
                        ┌──────────────────────────────┐
   导入 (in)            │   ~/.dsh/memory/          │            投影 (out)
 ───────────────────►   │   明文 Markdown，唯一真相源   │   ───────────────────►
 Claude Code auto mem   │                              │   ~/.agents/AGENTS.md（受管区块）
 CLAUDE.md 层级         │   persona/ feedback/ …       │   <repo>/AGENTS.md
 Codex / AGENTS.md      │   projects/<slug>/           │   <repo>/.cursor/rules/*.mdc
 Cursor rules .mdc      │   archive/ audit/ snapshots/ │   <repo>/.windsurf/rules/*.md
 Windsurf rules         │                              │   <repo>/.github/copilot-instructions.md
 Cline memory-bank      └──────────────────────────────┘   ~/.gemini/GEMINI.md
 Gemini GEMINI.md                    ↕ 同步 (peer)          ~/.claude/CLAUDE.md + Claude Code auto memory 格式
 前作 dsh-auto-memory          git / zip / 可选后端          ~/.agents/skills/<proc>/SKILL.md
 任意目录 / zip 快照
```

**铁律**：投影是**单向、幂等、只写受管区块**的。投影产物永远不是真相源；用户改了投影文件不会回灌（除非 doctor 明确询问）。理由——多个工具都在写各自的 rules 文件，若允许回灌就会形成循环与相互覆盖。

**为什么真相源放 `~/.dsh/memory/`**：这是一个 **dsh 专属**的记忆中枢，数据和面板都归 dsh，默认就跟着 dsh 自己的家目录走（`$DSH_HOME`）。与其他工具的关系只有**入口**：把它们各自的记忆文件与会话读进来，在 dsh 里统一管理。如果确实希望别的工具直接读原始 Markdown，把 `memoryRoot` 指到 `~/.agents/memory` 即可——那是显式选择，不是默认。

## 2. 导入器矩阵（in）

所有导入器统一四步：**扫描 → 解析 → 映射为候选条目 → dry-run 预检报告 → 用户勾选 → 落盘**。落盘时 `provenance.source = imported`、`provenance.importedFrom = <原路径>`、`confidence ≤ medium`。

| # | 来源 | 路径 / 格式 | 映射到 kind | 备注 |
|---|---|---|---|---|
| 1 | **前作 `@a9i5k4/dsh-auto-memory`** | `~/.dsh/memory/MEMORY.md`、`~/.dsh/memory/hub/episodes.json`、`~/.dsh/memory/workspaces/<wsEnc>/handoff/{PLAN.md,index.json,events.jsonl}`、`~/.dsh/memory/global-brief/*.json`、`<repo>/.dsh-memory/{MEMORY.md,logs/,reflections/YYYY-MM-DD.md,archive/}`、`~/.dsh/dsh-auto-memory.json`（159 键配置） | `index.json.entries[]` 的 `layer`/`kind`/`tags` → 我们的 kind；`PLAN.md` 泳道 → whiteboard；`episodes.json.segments[]` → `episode`；配置里的预算/开关 → 我们的 Config 建议值 | 它的 `mem_<32hex>` id 保留在 `provenance.importedFrom` 与 `links.derivedFrom`，**不沿用为 id**（我们用自己的 ULID）。它的 `<!-- memory:id -->` 锚点解析必须容错（锚点丢失时按标题降级匹配）。它的 workspace 编码是 `---Users-…--`（前导 3 dash），与 dsh session 目录的 `--Users-…--` 不同，两套都要能识别 |
| 2 | **Claude Code auto memory** | `~/.claude/projects/<slug>/memory/MEMORY.md`（索引，200 行/25 KB 上限）+ 同目录 kebab-case `.md`，frontmatter `{name, description, type}`，`type ∈ user\|feedback\|project\|reference` | `type` 直接一对一映射到我们的 `persona\|feedback\|project\|reference` | **格式几乎同构，是最省事也最有价值的导入源**。`description` → `summary`，`name` → `title`。`MEMORY.md` 里的索引行若指向已删文件 → 报孤儿索引并跳过 |
| 3 | **CLAUDE.md 层级** | Managed `/Library/Application Support/ClaudeCode/CLAUDE.md` → Project `./CLAUDE.md`（或 `.claude/CLAUDE.md`）→ User `~/.claude/CLAUDE.md` → 子目录 CLAUDE.md；支持 `@path/to/import`（相对/绝对/`~`，嵌套上限官方记 5 跳） | 按章节启发式分类：含"不要/必须/always/never" → `feedback`；含"我是/我负责" → `persona`；含架构/约束 → `project`；含 URL/看板 → `reference` | `@import` 递归解析要限深并防环。dsh 的 `instructionFileCandidates` 默认就是 `['AGENTS.md','CLAUDE.md']`，所以这些文件本来就会被 dsh 读到——导入后要在投影侧**避免双份注入**（见 §3.3） |
| 4 | **AGENTS.md（Codex / Zed / Cursor / Aider / Warp / VS Code / Devin / Gemini CLI 通用标准）** | 仓库根 + 嵌套（每包一个），**就近优先**；标准本身无 import、无 scoping 元数据 | 同上启发式分类；`scope: project` | 这是唯一真正的跨工具事实标准，导入与投影都必须一等支持 |
| 5 | **Cursor rules + Memories** | `.cursor/rules/*.mdc`（frontmatter `alwaysApply` / `globs` / `description`）、User Rules、Team Rules；Memories 为项目级自动生成条目 | `alwaysApply:true` → `activation: always`；有 `globs` → `activation: glob` + 原样保留 globs；只有 `description` → `activation: on_demand` | Cursor 的四档触发（Always / Auto Attached / Agent Requested / Manual）与我们的 `activation` 四值**一一对应**，映射无损 |
| 6 | **Windsurf rules + memories** | 全局 `~/.codeium/windsurf/memories/global_rules.md`；工作区 `.windsurf/rules/*.md`、`.windsurfrules`；frontmatter `trigger ∈ always_on\|manual\|model_decision\|glob` | `trigger` 四值 → `activation` 四值直接映射 | 注意它的硬字符限制（全局 6,000 / 单文件 12,000）：投影到 Windsurf 时必须裁剪并报告被裁内容 |
| 7 | **GitHub Copilot / VS Code** | `.github/copilot-instructions.md`（仓库级）+ `**/*.instructions.md`（frontmatter `applyTo: "**/*.ts"` glob） | `applyTo` → `globs` + `activation: glob` | 各来源 additive 无优先级，导入时要检测同一规则在多处重复 → 合并为一条并记 `links.relates` |
| 8 | **Gemini CLI** | `~/.gemini/GEMINI.md`（全局，`GEMINI_MD_FILENAME` 可改名）→ 工作区 → 祖先/JIT 目录文件；`@file.md` import | 同 CLAUDE.md 启发式 | `/memory show` 的输出也可作为文本导入源 |
| 9 | **Cline Memory Bank** | `memory-bank/` 六文件：`projectbrief.md`（基石）→ `productContext.md` / `systemPatterns.md` / `techContext.md` → `activeContext.md`（最频繁更新）→ `progress.md` | `projectbrief`/`systemPatterns`/`techContext` → `project`；`activeContext` → `episode`（短期）；`progress` → whiteboard 的「进度与下一步」泳道 | 六文件结构是"强制全读"模式，导入后自动变成分层按需，token 立省 |
| 10 | **通用目录 / 任意 Markdown** | 用户指定路径，递归扫 `.md` / `.mdx` / `.txt` | 全部走 LLM 分类，`confidence: low`，`activation: on_demand` | 兜底通道 |
| 11 | **zip / `.gam.zip` 快照** | 本插件导出格式，或前作备份 | 按快照内 `manifest.jsonl` 精确还原 | 见 §4 |
| 12 | **MCP memory server 导出** | `@modelcontextprotocol/server-memory` 的 `~/.dsh-mcp-reference-memory.jsonl`、Memorix `~/.memorix/data`、Engram `~/.engram` | JSON 实体/关系 → `relations`；观察记录 → `episode` | dsh 官方只提供这三个**默认关闭**的参考配置，用户若用过就有数据可救 |

### 2.1 「纯链接模式」（保留前作最好的一个设计）

前作的 `memory_external` 工具有 `action: list|import`，其导入语义是**只写源文件的绝对路径指针，不抄内容**——理由是防脏内容混入、且指针不会过期。这个判断是对的，特别是对体量巨大的会话日志（实测一个 dsh 会话 5.5 MB 压缩 / 20.1 MB 明文 / 4610 行事件）。

我们把它实现为 `reference` 条目的 `linkOnly: true`：

```yaml
---
id: m_01J8…
kind: reference
title: Claude Code 会话日志（本项目）
summary: 完整对话原文，需要具体上下文时按需读取
activation: on_demand
provenance: { source: imported, createdBy: dsh, importedFrom: "~/.claude/projects/<slug>/" }
linkOnly: true
links:
  targets:
    - path: ~/.claude/projects/<slug>/3f9c….jsonl
      kind: session-log
      note: 2.1 MB jsonl
---
```

召回时只返回指针与 `summary`（几十字符），模型判断需要再用 `memory_read` 展开。**这是省 token 最狠的一招**：把 GB 级历史变成 KB 级目录。

### 2.2 dry-run 预检报告（导入的信任基础）

导入前必须给出可核对的报告，绝不"一键导入然后祈祷"：

```
扫描完成：Claude Code auto memory (~/.claude/projects/-Users-…-server--/memory/)
  发现 41 个条目文件 + 1 个 MEMORY.md 索引
  ├─ 新增 34 条   (persona 6 / feedback 11 / project 14 / reference 3)
  ├─ 更新  4 条   (与现有条目语义重复，将合并；显示双方原文 diff)
  ├─ 冲突  2 条   (与用户显式条目矛盾 → 默认保留用户条目，新条降级为 episode)
  ├─ 跳过  1 条   (孤儿索引：MEMORY.md 指向的文件不存在)
  └─ PII 命中 3 条 (含手机号/邮箱 → 自动标 privacy.pii，不进团队同步与仓库投影)
  预算影响：常驻层 1,240 → 1,980 字符（上限 2,000）⚠ 接近上限
  [逐条勾选] [全选新增] [导入] [取消]
```

## 3. 投影器矩阵（out）

### 3.1 受管区块协议

所有投影只写自己生成的区块，绝不触碰用户手写内容：

```markdown
<!-- BEGIN dsh-general-automatic-memory (managed, do not edit) -->
<!-- generated: 2026-10-21T09:30:00Z · entries: 23 · checksum: sha256:… -->
…内容…
<!-- END dsh-general-automatic-memory -->
```

- 幂等：同一批条目重复投影产生**逐字节相同**的区块（`generated` 时间戳只在内容变化时更新，否则维持原值 → 避免无意义 diff）
- 区块外的内容原样保留；区块被用户删除 → 下次投影重新插入并记审计
- 区块被用户**修改** → doctor 检测到 checksum 不符 → 询问"回灌为条目 / 丢弃手改重建 / 停止向此文件投影"

### 3.2 投影目标

| 目标 | 内容 | 默认 | 预算裁剪 |
|---|---|---|---|
| `~/.agents/AGENTS.md` | **只放一行指针**：`记忆索引见 ~/.dsh/memory/INDEX.md；需要时用 memory_recall / memory_read 工具检索。` | ⚠️ 见 §3.3 | ≤200 字符 |
| `~/.dsh/memory/persona/PROFILE.md` | 画像汇编全文（其他工具可直接读这个文件） | ✅ | ≤2 KB |
| `<repo>/AGENTS.md` | 常驻层 + 该项目 `project` 条目的目录 | ❌ 关（会污染仓库） | ≤3 KB |
| `<repo>/.cursor/rules/gam-*.mdc` | 按 `activation` 生成对应 frontmatter（`alwaysApply` / `globs` / `description`） | ❌ 关 | 每条独立文件 |
| `<repo>/.windsurf/rules/gam-*.md` | `trigger` 映射 | ❌ 关 | 全局 ≤6,000 / 单文件 ≤12,000 字符 |
| `<repo>/.github/copilot-instructions.md` | 受管区块 | ❌ 关 | ≤3 KB |
| `~/.gemini/GEMINI.md` | 受管区块（它会被全量拼进每个 prompt，所以必须极小） | ❌ 关 | **≤1 KB** |
| `~/.claude/CLAUDE.md` | 受管区块 + `@~/.dsh/memory/INDEX.md` import（利用它的 5 跳 import 能力） | ❌ 关 | ≤1 KB |
| `~/.claude/projects/<slug>/memory/` | **反向生成 Claude Code auto memory 原生格式**：`MEMORY.md` 索引 + kebab-case 条目 + `{name, description, type}` frontmatter | ❌ 关 | 索引 ≤200 行/25 KB |
| `~/.agents/skills/<procedure>/SKILL.md` | `procedure` 条目导出为技能（`dsh-skill-filesystem` 会扫这个目录） | ⚠️ 仅 `stage: active` 的 | 按技能规范 |

最后一行是个漂亮的闭环：**程序性记忆晋升为 active 后自动导出成 Skill**，于是它同时被 dsh（`~/.agents/skills/`）、Claude Code、以及任何支持 Agent Skills 的工具看见。

### 3.3 双注入陷阱（必须显式处理）

dsh 自带的 `dsh-agent-instructions` 会把 `~/.agents/AGENTS.md` 作为 durable baseline 注入（受 `maxBytes` 预算约束），而我们的插件又通过 `ctx.systemPrompt.context()` 注入常驻层。**如果两边都放画像全文，就是纯粹的双倍浪费。**

默认策略：

| 运行环境 | `~/.agents/AGENTS.md` 投影 | 我们的常驻层注入 |
|---|---|---|
| **dsh 内**（默认） | **只放一行指针**（≤200 字符） | 完整常驻层 |
| 非 dsh 工具（Claude Code / Codex / Cursor…） | 由那些工具自己读 `AGENTS.md`；我们通过投影 `PROFILE.md` + 指针，让它们知道去哪找 | 不适用 |

并且要做**去重检测**：`dsh-agent-instructions` 对同组内 trim 后字节相同的文件只渲染一次（`CLAUDE.md` 与 `AGENTS.md` 重复则不重复注入），但我们的 `context()` 与它的 baseline 是不同 section，不会被去重 → 必须由我们自己保证不重复。doctor 增加一项检查：`AGENTS.md` 受管区块与常驻层内容的重叠度 > 30% 则告警。

### 3.4 导出包 `.gam.zip`

```
gam-export-2026-10-21.zip
├── gam.yaml                 # {formatVersion:1, exportedAt, schemaVersion, rootId, device, entryCount,
│                            #  budget:{always,catalog}, included:{kinds,scopes}, excluded:{pii:true}}
├── manifest.jsonl           # {path, sha256, size} 逐文件 → 精确 diff 与增量导入
├── memory/…                 # 真相源原样（含 archive/，不含 .cache/）
├── projections/             # 当时生成的各工具投影产物（便于对方理解上下文）
└── README.md                # 人可读说明：这是什么、怎么导入、隐私声明
```

导出时**默认排除 `privacy.pii: true` 与 `privacy.shareable: none`** 的条目，并在 `gam.yaml` 里记录排除数量（可观测，不静默）。

## 4. 跨设备同步（peer）

### 4.1 三种传输（按成本递增，全部可选）

| 传输 | 做法 | 冲突处理 | 适用 |
|---|---|---|---|
| **git 仓库** | 把 `~/.dsh/memory/` 变成 git repo（或 symlink 到 dotfiles repo），用户自己 push/pull | 文本 merge；`.cache/` 与 `sync/outbox.jsonl` 进 `.gitignore` | 单人多机，零基础设施，最推荐 |
| **手动 zip** | 导出 → 拷贝 → 导入（走 §2.2 预检） | 导入器逐条决策 | 偶尔同步、气隙环境 |
| **可选后端**（S3 / WebDAV / 自建 HTTP） | `sync/outbox.jsonl` 队列 + 内容哈希增量 + 设备位点 | 自动检测 + LLM 语义合并 + 人工裁决 | 团队 / 多设备实时 |

**明确不做**：自建账号体系与多租户服务端。前作做了整套 S3 团队同步（`teamEnabled`/`teamEndpoint`/`teamBucket`/`teamSyncTransport:"s3"`/`teamE2E`/`teamConflictPolicy:"ask"`/`teamMaxConflicts:200` 等 20+ 配置键），我们的判断是：**先把 git 路线做到极致**，后端同步作为 M5 的可选扩展，且配置键 ≤6 个。

### 4.2 冲突模型

因为**一条记忆 = 一个文件 + 一个永不复用的 ULID**，多设备并发写**不会产生文本冲突**（不同设备写不同文件）。真正的冲突只有三种：

| 冲突类型 | 检测 | 解决 |
|---|---|---|
| **同 id 双改** | 双方 `checksum` 与 `stats.revisions` 都变了 | `revisions` 高者胜；相等则进 `sync/conflicts/` 等裁决 |
| **语义矛盾** | 不同 id 但 `entities`/`tags` 重叠且内容矛盾（doctor 的 `conflictsWith` 检查） | **LLM 语义合并**（对标 Agentic Git / GCC 的 synthesis operator：记忆冲突本质是语义冲突，文本三方合并必然产生垃圾）→ 生成建议 → 人工在面板裁决 → 双方原文进 `archive/` |
| **删除 vs 修改** | 一方硬删，另一方改了 | 修改胜出（删除是重操作，倾向于保留信息），但记审计并在面板提示 |

冲突队列默认策略 `ask`（对齐前作 `teamConflictPolicy: "ask"`），上限 200 条后拒绝新同步并告警（防止无人处理的冲突无限堆积）。

### 4.3 设备位点与增量

```jsonc
// sync/devices.json
{"schemaVersion":1,"rootId":"…","devices":[
  {"id":"dev-macbook-a1b2","name":"MacBook Pro","lastSeenAt":"2026-10-21T09:30:00Z",
   "clock":{"2026-10-21T09:00:00Z":41},"entryCount":128,"schemaVersion":1}]}
```

增量同步只传 `manifest.jsonl` 里 sha256 变化的文件（对标 sqlite-memory 用内容哈希跳过未变更文本）。`.cache/` **永不参与同步**——向量库跨设备同步是纯负担，且每台机器的模型/维度可能不同，落地后重建即可。

## 5. 恢复（可恢复是产品承诺，不是附加功能）

| 能力 | 实现 | 入口 |
|---|---|---|
| **快照** | 固化/导入/批量操作前自动 + 用户手动；`snapshot.yaml` + `manifest.jsonl` + `payload.zst`；默认保留最近 10 个 + 每日 1 个（30 天） | 面板 Recovery / `/memory snapshot` |
| **diff** | 用两份 `manifest.jsonl` 的 sha256 精确算出增删改的条目，逐条并排展示 | 面板 Recovery |
| **回滚** | 选择性回滚（只回滚某几条）或全量回滚；**回滚前自动再做一个快照**（回滚本身可撤销） | 面板 Recovery / `/memory restore <label>` |
| **doctor 体检** | [03 §10](03-memory-format.md#10-一致性校验doctor-的检查项) 的 12 项检查；能自动修的留审计与备份，不能修的明确报告 | 面板 Recovery / `/memory doctor` |
| **索引重建** | 派生文件全删后从条目重建（目标：1000 条 <2 s）；启动时自检 `sourceRevisions` 不符即重建 | 自动 + `/memory doctor --reindex` |
| **写坏修复** | 非 UTF-8 / BOM / CRLF / frontmatter 非法 → 规范化重写，原文备份到 `.cache/repair/` | doctor |
| **schema 迁移** | `MANIFEST.yaml: schemaVersion` 驱动；迁移**先快照后原地升级**，并保留降级说明（写入 `snapshots/<ts>__migration/`） | 启动时自动 |
| **完全丢失** | 从 `.gam.zip` 或 git 远端重建；`.cache/` 全部重算 | `/memory import` |

**恢复的关键设计：真相源与派生物严格分离。** 只要 `.md` 文件在，其余一切（索引、FTS、向量、聚合视图、投影产物）都能重建。这条性质让"恢复"从"数据修复"降级成"重算缓存"，可靠性完全不同。

## 6. 跨工具一致性验证

M4 的验收必须包含一张真实跑出来的矩阵，而不是"应该能用"：

| 工具 | 验证方式 | 通过标准 |
|---|---|---|
| dsh | 装插件 → 说一个偏好 → 新会话验证 | 新会话常驻层含该偏好；注入 token ≤3%；`verbatimRate ≥ 0.7` |
| Claude Code | 投影开启 → 打开同一仓库 | `CLAUDE.md` 受管区块存在；`~/.claude/projects/<slug>/memory/` 格式被 Claude Code 正确加载（`/memory` 能看到） |
| Codex / 任意 AGENTS.md 工具 | 投影 `<repo>/AGENTS.md` | 工具读到常驻层；就近优先规则不被破坏 |
| Cursor | 投影 `.cursor/rules/gam-*.mdc` | 四档 `activation` 在 Cursor 里表现为 Always / Auto Attached / Agent Requested |
| Windsurf | 投影 `.windsurf/rules/gam-*.md` | `trigger` 生效；字符数不超限（超限要有裁剪报告） |
| Gemini CLI | 投影 `~/.gemini/GEMINI.md` | `/memory show` 能看到区块；区块 ≤1 KB |
| 反向导入 | 各工具 → 导入器 → dry-run 报告 | 报告条目数与源文件数一致；PII 命中被正确标记 |

**注意 dsh 侧的已知限制**：`instructionFileCandidates` 默认 `['AGENTS.md','CLAUDE.md']`，但 dsh **不支持**小写文件名、`.claude/rules/` 目录、`@path` import 语法。所以指望 dsh 自动读 Cursor rules 是不行的，必须靠我们的投影器把内容搬到 `AGENTS.md`。另外 `dsh-hooks-claude-code` 桥虽然把 `SessionStart→agent/created`、`UserPromptSubmit→agent/pre-step` 等都映射好了，但 payload 里 `transcript_path` **恒为空字符串**（官方原因：*"the persistence seam exposes no artifact paths, and the default Zstandard-compressed session log is not readable by hook scripts"*）→ **跨 agent 记忆不能靠读 transcript 文件**，只能靠各自的记忆目录。
