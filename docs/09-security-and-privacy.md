# 09 · 安全与隐私

> 记忆插件的特殊性在于：**它把一次性的输入变成了持久的事实**。任何写入错误都会被放大到未来所有会话。所以安全设计不是附加章节，是数据模型的一部分（`provenance` / `confidence` / `privacy` 是必填字段，不是可选元数据）。

## 1. 威胁模型

| # | 威胁 | 攻击路径 | 影响 | 主要对策 |
|---|---|---|---|---|
| T1 | **记忆投毒** | 间接 prompt injection（恶意网页/README/工具输出）→ 污染会话摘要 → 写入长期记忆 → 跨会话存活 → 休眠载荷被无关查询触发 → 静默外传 | 持久化指令执行、数据外泄 | 来源门控（§3）、写入白名单、突增告警、trust-aware retrieval、TTL |
| T2 | **PII / 机密外泄** | 记忆里存了手机号、密钥、客户名 → 被团队同步或投影进 git 仓库 | 合规事故、密钥泄露 | PII 扫描（§4）、`shareable` 分级、投影默认排除、密钥模式硬拦截 |
| T3 | **越权文件访问** | 插件 Host 代码**无沙箱、进程内、全权限**；面板 HTTP 路由若接受任意 path 参数 → 任意文件读 | 本机任意文件泄露 | 路径白名单 + realpath 前缀校验（§6）、路由不接受自由 path |
| T4 | **跨源请求伪造** | 面板路由同源但无 CSRF 防护 → 恶意页面在已认证浏览器里触发写操作 | 记忆被篡改/删除 | 同源守卫 + `x-gam-nonce` + 拒绝 `sec-fetch-site: cross-site`（§7） |
| T5 | **数据损坏** | 并发写、写坏编码、索引漂移、上游格式变更 | 记忆丢失或不可读 | 原子写、单写者锁、checksum、快照、doctor（见 [03 §10](03-memory-format.md#10-一致性校验doctor-的检查项)） |
| T6 | **供应链** | 依赖被投毒、pnpm 构建脚本执行任意代码 | 本机沦陷 | 依赖最小化（目标 `dependencies` 为空）、`engines.dsh` 精确声明、避免原生模块 |
| T7 | **隐私失控（用户视角）** | 用户不知道记了什么、改不动、删不掉 | 信任崩塌、合规风险 | 明文文件、逐条可编辑、全量审计、硬删除、面板可见（§5、§8） |

## 2. 权限边界：dsh 不会替我们管，必须自律

**实测事实**（这点必须写清楚，因为它决定了整个安全设计的责任归属）：

- dsh 清单里**没有任何权限/沙箱声明字段**（扫了 asar 内全部 313 个 `@deepseek-ai` 包，`dsh.*` 的 key 只有 `bundle.patch` / `client.platform` / `client.inject` / `client.immediately` / `client.external` / `manifestVersion` / `sessionFormatMigration`）
- `dsh-plugin-manager/README.md` 原文：*"installed Host code executes in-process outside the workspace sandbox"*
- `dsh-app-boot/README.md` 原文：*"These checks are not a sandbox against malicious package code."*（指 `engines.dsh` 版本检查）
- dsh 的权限模型是**运行时会话级**的，不是插件声明级的：`sandbox-policy` config `{mode: 'read-only'|'workspace-write'|'danger-full-access', workspaceRoot}`，默认 `read-only`（fail-safe）；切换 = 一条 log-only `sandbox/mode` session 事件
- 浏览器侧插件 UI 与宿主**同源同 document，无独立 CSP、无 iframe 沙箱、无 DOM 文件系统访问**

**结论**：我们的插件代码拥有 dsh 进程的全部权限，dsh 不会限制我们。所以约束必须自己实现：

| 自律规则 | 实现 |
|---|---|
| **只在 `MEMORY_ROOT` 内写** | 所有写操作前 `realpath` 解析 + 前缀校验；符号链接指向 root 外一律拒绝；违规写审计 `act:deny` 并抛错 |
| **投影写白名单文件** | 只允许写 [06 §3.2](06-portability.md#32-投影目标) 列出的 10 个目标路径，且只写受管区块（区块外字节必须逐字保留，写前写后各校验一次） |
| **读也要有边界** | 导入器读取用户指定路径，但要在 UI 里明确显示"将读取这些路径"；`linkOnly` 条目在展开时提示"即将读取外部文件" |
| **不申请高权限** | **绝不需要 `danger-full-access`**。这是与前作的明确差异：前作的后台工作台以 `permission: "danger-full-access"` 创建父会话（实测 `~/.dsh/memory/workbench.json`）。我们所有后台工作都在插件进程内用 `ctx.llm.stream()` 完成，不开会话、不提权 |
| **不碰凭据文件** | 显式黑名单：`$DSH_HOME/.credentials.yaml`、`$DSH_HOME/openai-gateway/api-key`、`.env`、`~/.ssh/**`、任何 `*token*`/`*secret*`/`*credential*` 路径。导入器扫到这些一律跳过并报告 |
| **网络请求最小化** | 只有 `syncTransport: remote` 时才发网络请求，且目标必须用户显式配置；不做遥测上报（`product-analytics` 是官方包的事，我们不参与） |

## 3. 记忆投毒防护（T1）

### 3.1 有量化证据的风险

- 间接 prompt injection → 长期记忆污染 → 跨会话存活 → 静默外传，已被 Unit42 在 Bedrock Agents 上完整复现
- MINJA / GhostWriter 类攻击报道的成功率高达 **95%**，且**攻击与执行时间解耦**、载荷可休眠数月后被无关查询触发
- 系统性研究给出平均 **ASR 50.46%**
- ChatGPT 早在 2024 年就被演示可用 prompt injection 伪造 memory

### 3.2 五层防护

**第 1 层 · 来源门控（数据模型级，最硬的一道）**

```
user-stated / manual  ──→ 可进长期层，confidence 可为 high
imported              ──→ 可进长期层，confidence ≤ medium，且需用户在 dry-run 里逐条勾选
model-inferred        ──→ 可进长期层，confidence ≤ medium，需 hits≥2 或用户确认才进 always 档
tool-output           ──→ **只能进 episode**；晋升需用户显式批准
web-content           ──→ **只能进 episode**；晋升需用户显式批准；召回时 sourceTrust 权重仅 0.2
team                  ──→ 可进长期层，但标 `provenance.source: team` 且在 UI 里显示来源成员
```

**第 2 层 · 证据强制**：LLM 抽取的候选必须带 `evidence`（原文引用 ≤80 字），**没有 evidence 的候选一律丢弃**（`ingest.requireEvidence: true`）。这直接掐断"模型凭幻觉编造记忆"的路径。

**第 3 层 · 写入白名单**：`ingest.autoKinds` 默认只含 `['episode', 'project']`。**`procedure` 永不自动写入**——自动生成的操作规程风险最高（会被当成"已验证的做法"执行）。前作也用 `procedureHighRiskApproval: true` 做了同样判断，并要求 `successCriteria` 非空 + 成功次数 ≥2 + 失败率 ≤30% 才能晋升，我们保留这套门槛。

**第 4 层 · trust-aware retrieval**：召回排序里 `sourceTrust` 是显式因子（`user-stated 1.0 / model-inferred 0.8 / imported 0.7 / tool-output 0.4 / web-content 0.2`），且召回结果**把来源标出来给模型看**（`memory_recall` 返回的 `source` 字段），让模型自己也能对低可信内容保持警惕。

**第 5 层 · 异常检测与熔断**：

| 信号 | 阈值 | 动作 |
|---|---|---|
| 写入突增 | >10 条/小时（`ingest.burstThreshold`） | 暂停自动写入 + 面板红色告警 + toast |
| 单会话写入过多 | >5 条 | 后续候选全部降级为 episode |
| 同一来源反复写同类条目 | >3 条/会话 | 标记可疑，等固化时人工复核 |
| 内容含指令句式 | 匹配"ignore previous"/"从现在开始你必须"/"system:"等模式 | 强制 `confidence: low` + 不进 always 档 + 面板高亮 |
| `web-content` 占比异常 | >30% 的当日写入 | 告警 |

**TTL 限制中毒窗口**：`episode` 默认 14 天 TTL，即使投毒成功也会自然过期；晋升为长期条目必须跨过用户确认或 hits 门槛。

## 4. PII 与敏感数据（T2）

### 4.1 三道扫描

| 道 | 手段 | 命中后 |
|---|---|---|
| **密钥模式（硬拦截）** | 高熵字符串 + 已知前缀（`sk-`、`ghp_`、`AKIA`、`-----BEGIN`、`xoxb-`、JWT 三段式）+ 关键字（password/token/secret/api_key） | **拒绝写入**，只在审计里记"拦截了一次密钥写入"（不记内容） |
| **PII 模式（标记）** | 手机号、身份证、邮箱、银行卡、IP、车牌、生日等正则 | 写 `privacy.pii: true`；**不进团队同步、不进仓库投影**；面板里黄色标记 |
| **敏感话题（默认不记）** | 类别：健康/医疗、宗教信仰、性取向、政治立场、财务细节、司法记录、未成年人信息 | `privacy.sensitiveTopics: true`（默认）时**根本不生成条目**，审计记 `act:deny reason:sensitive-topic` |

**产品立场对齐 Claude**：Claude 的 sensitive-topics 设置在 Team/Enterprise **默认关闭记忆**，健康、信仰等类别不入库。「默认不记 + 显式开启」是当前最佳姿态，我们照做。

### 4.2 数据最小化

- 只存**结论**不存原文（对标 ChatGPT Dreaming 的 Synthesize 阶段）
- `episode` 只存用户消息截断（200 字）+ 一行 outcome，**丢掉助手长回复**（可重新推导）
- 审计日志**不含记忆正文**，只含 id 与字节数（避免审计成为第二份隐私副本）
- 大体量外部内容用 `linkOnly` 指针而非拷贝（见 [06 §2.1](06-portability.md#21-纯链接模式保留前作最好的一个设计)）
- 默认 `sharePii: false`，导出 `.gam.zip` 时默认排除 `pii: true` 与 `shareable: none`，并在 `gam.yaml` 里记录排除数量（**可观测，不静默**）

## 5. 可追责：全量审计

每一次读写都留痕（格式见 [03 §7](03-memory-format.md#7-audityyyy-mm-ddjsonl-格式)）。这是"记忆可追责"的前提，也是用户信任的抓手。

`act` 枚举（16 种）：`read` / `write` / `update` / `invalidate` / `delete` / `restore` / `import` / `export` / `consolidate` / `archive` / `sync-push` / `sync-pull` / `sync-conflict` / `repair` / `gate-drop` / `deny`。

三个必须存在的审计场景：

1. **`deny`**：被安全策略拦下的写入（密钥、敏感话题、路径越权、突增熔断）。用户能看到"系统替我挡了什么"，这比默默挡掉更有价值
2. **`gate-drop`**：被相关度门控裁掉的召回候选。这是**反向指标**——"该记的没被想起来"是最痛的失败模式，必须可见可调
3. **`repair`**：doctor 自动修复的每一处（含原文件备份路径）。自动修复不留痕等于偷偷改用户数据

保留期默认 90 天，滚动压缩为 `.zst`。审计本身**永不参与团队同步**（含会话 id 与行为轨迹）。

## 6. 面板 HTTP 路由安全（T3 / T4）

宿主的认证**不等于**授权。dsh 已经做了：launch token → authority-bound 签名 cookie（host-only、`Path=/`、`HttpOnly`、`SameSite=Strict`、绑定 hostname+port、TLS 时才 `Secure`）→ `Host`/`Origin` 信任检查（loopback / bind IP / `trustedHosts`）→ `sec-fetch-site: cross-site` 拒绝（403）、可信未认证 401。`dsh web --host 0.0.0.0` **不支持**。

我们必须自己再加一层：

```js
function guard(req, res, route) {
  // 1. 同源
  const origin = req.headers.origin ?? req.headers.referer
  if (origin && !sameOrigin(origin, req)) return deny(res, 403, 'cross-origin')
  if (req.headers['sec-fetch-site'] === 'cross-site') return deny(res, 403, 'cross-site')

  // 2. 内容类型（写操作必须 JSON）
  if (isMutating(req) && !isJson(req)) return deny(res, 415, 'bad-content-type')

  // 3. 一次性 nonce（防同源页面里的其他脚本误触/CSRF）
  if (isMutating(req) && req.headers['x-gam-nonce'] !== currentNonce) return deny(res, 403, 'csrf')

  // 4. 参数白名单（关键：不接受自由 path）
  if (route.takesPath && !isInsideMemoryRoot(req.query.path)) return deny(res, 400, 'path-outside-root')

  return true
}
```

**参数设计原则**：所有条目访问用 `id`（`m_<ULID>`）而不是文件路径。`id → path` 的解析在 Host 内部完成，且结果必须通过 realpath 前缀校验。这样即使 id 被构造成 `../../etc/passwd` 也无法逃逸——因为 id 必须存在于索引中才有效。

响应头：`Cache-Control: no-store`（记忆内容不该被中间缓存）、`X-Content-Type-Options: nosniff`、错误响应**不回显堆栈**（只在日志里）。

## 7. 供应链（T6）

| 措施 | 说明 |
|---|---|
| `dependencies` 目标为空 | SQLite 用 `node:sqlite`（Node 22.5+ 内置，dsh 基线 Node 24.21）；向量层作为**可选 peer** 默认不装 |
| 避免原生模块 | dsh 的 pnpm 11 会拦依赖构建脚本，需要用户手动 "Allow these scripts and retry"（本机 `allowBuilds` 里躺着 `onnxruntime-node`/`protobufjs`/`sharp`）。每多一个原生依赖 = 多一次安装摩擦 + 多一个二进制供应链风险 |
| `engines.dsh` 精确声明 | `">=0.2.1-rc.2 <0.3.0"`，宁可不激活也不要在不兼容版本上跑出错乱数据 |
| 不 `require` 宿主 client 包 | 官方 `practices.md` 明令禁止；`dsh.client.inject` 里的包名**只用于排序激活**，且它们「change without notice」 |
| 锁定 client bundle 格式 | 产物首行断言 + `id === 包名` 断言，防构建产物漂移 |
| 市场无审核 → 自我约束 | 官方原文 *"Markets are third-party content… DSH checks the file format but not those claims."* 我们不指望平台审核，自己的 CI 必须包含 `oxlint` + 依赖审计 |

## 8. 合规（GDPR 视角）

| 权利 | 实现 |
|---|---|
| **访问权（Art.15）** | 面板 Browse/Audit 可枚举全部条目与操作历史；`.gam.zip` 导出全量 |
| **更正权（Art.16）** | 面板 Editor 直接改，或改文件；checksum 检测手改并重算索引 |
| **删除权 / 被遗忘权（Art.17）** | `memory_forget --hard` / 面板硬删除：**物理删除文件 + 派生索引行 + 向量 + 投影产物中的对应内容**（软删有泄漏风险）。审计里保留"删过什么 id"但不保留正文 |
| **可携带权（Art.20）** | `.gam.zip` 是纯明文 Markdown + manifest，任何工具都能读 |
| **数据最小化（Art.5(1)(c)）** | 只存结论、episode 丢助手长回复、审计不含正文、大体量内容用指针 |
| **默认隐私保护（Art.25）** | 敏感话题默认不记、PII 默认不共享、仓库投影默认关、`sharePii` 默认 false |

**硬删除的完整性检查清单**（漏一处就是泄漏）：条目文件 → `INDEX.md` / `PROFILE.md` / `GENEALOGY.md` / `graph.jsonl` / `index.json` → `.cache/fts.sqlite` 行 → `.cache/vectors/` 向量 → `.cache/catalog.json` → 投影产物（10 个目标）→ `sync/outbox.jsonl` → 快照（询问用户是否一并清除，默认保留但标记）。doctor 有一项检查专门验证"已删除 id 在任何派生物里都不残留"。

## 9. 隐私默认值一览（产品立场，不是技术选择）

| 配置 | 默认 | 理由 |
|---|---|---|
| `privacy.sensitiveTopics` | `true`（不记） | 对齐 Claude Team/Enterprise 默认 |
| `privacy.piiScan` | `true` | 成本极低，收益极高 |
| `privacy.sharePii` | `false` | 团队同步与仓库投影永不带 PII |
| `ingest.writeMode` | `suggest` | 涉及用户身份与纪律的写入需要批准（对齐 Cursor Memories） |
| `ingest.autoKinds` | `['episode','project']` | 长期层默认不自动写 |
| `portability.projections` | 只开 `agentsMdPointer` + `skills` | 默认不往用户 git 仓库写任何东西 |
| `portability.syncTransport` | `none` | 同步是显式选择，不是默认行为 |
| `retrieval.vectorEnabled` | `false` | 不下载模型、不引入原生依赖，除非用户明确要 |
| `inject.showTurnTail` | `false` | 默认不打扰，但随时可开（透明性是可选项而非强制噪声） |
| `advanced.shadowRetrieval` | `false` | 调试用，会多花检索成本 |
