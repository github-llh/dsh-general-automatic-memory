# dsh-general-automatic-memory

> 通用自动记忆插件 · for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`， tested against **0.2.1-rc.2**）

一句话定位：**让任何 agent 工具都共享同一份「明文可编辑、可导入导出、可回滚恢复、自动分类分层」的长期记忆，并且为此付出的 token 成本恒定可控。**

当前状态：**M0–M5 主体完成，已在真实 dsh 0.2.1-rc.2 完成冒烟（注入 / FTS5 / glob / LLM 兜底）**。

```
typecheck ✓   build ✓ (host ~190 KB / client 52 KB)   bundle verify ✓ (只 require react)   tests 105/105 ✓
```

| 里程碑 | 状态 | 说明 |
|---|---|---|
| M0 骨架可加载 | ✅ | 清单、patch、client bundle 构建链（自己复刻 lazy-CJS）、locale、icon、bundle 格式校验 |
| M1 格式 + 只读召回 | ✅ 主体 | 8 类目录、frontmatter 规范、原子写、`INDEX.md`/`PROFILE.md`/`graph.jsonl` 生成、L0 词法检索、三级注入、逐字节幂等、6 工具 + 3 命令、面板「总览/浏览」两个视图 |
| M1 剩余 | ✅ | 真实 dsh 冒烟完成：常驻/目录注入、`memory_recall` 走 L1 FTS5、glob 激活（`tool/call.arguments` 是 JSON 字符串；slim 也保留 glob） |
| M2 自动写入 | ✅ 主体 | 规则抽取（8 类信号 + 相对日期转绝对）、来源门控（密钥/PII/敏感话题/突增熔断）、`ADD/UPDATE/INVALIDATE/NOOP`、episode 层、默认 `auto` 落盘 + 总览一键撤销、可选 `suggest` 待确认队列（15s 静默 NOOP）、compaction 抢救、审计 |
| M2 剩余 | ✅ | LLM 兜底已按真实契约核对：`provider/model` 取本会话 `model/selection`，组装 `text-delta`；真机 `llmCalls=1`，候选进入 pending（15s 静默 NOOP） |
| M4 导入 | ✅ 主体 | 10 个记忆源（Claude Code auto memory / CLAUDE.md / AGENTS.md / Cursor / Windsurf / Cline / Copilot / Gemini / 前作 / 任意目录）+ 4 个会话源（dsh 多帧 zstd / Claude Code jsonl / 通用 jsonl / 通用 Markdown）；dry-run 预检 + 快照 + 去重预览 |
| M4 剩余 | ✅ | 投影器（受管区块、默认关闭）+ zip 导入导出 已补齐 |
| M5 固化恢复 | ✅ 主体 | 快照（含 sha256 manifest）、diff、回滚（回滚前自动快照）、固化（合并近义/清理低质 summary/晋升重复主题/降级冷条目/episode 过期） |
| M3 面板 | ✅ 主体 | 8 个视图：总览 / 浏览 / 导入 / 时间线（时点有效）/ 族谱（邻接表+Mermaid）/ 审计 / 恢复 / 设置；族谱暂未做力导向图 |

## 安装（从 GitHub）

```bash
# 装进 desktop profile（也可以用 web profile）
dsh plugin --profile desktop add github:github-llh/dsh-general-automatic-memory
```

`lib/` 与 `client/` 是**随源码提交的发布产物**，安装时不做任何构建，几秒完成。这是刻意的：dsh profile 的 pnpm 供应链策略会拒绝 git 依赖的 `prepare`/`prepack`（报 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`），所以仓库不能依赖安装期构建，修改源码后必须 `npm run build` 并把产物一起提交（CI 会检查产物是否过期）。如果卡在下载，换成官方源：

```bash
npm_config_registry=https://registry.npmjs.org dsh plugin --profile desktop add github:github-llh/dsh-general-automatic-memory
```

装完重启 dsh（替换已装包需要重启才生效），侧栏会出现「记忆」图标。

**升级**：第三方 Git 插件在 DSH 里**没有“更新”按钮**，官方路径是先卸载再安装。直接对已安装的包再点一次“安装”会失败：DSH 按依赖值的前后变化判断装了哪个包，同名依赖只变版本时变化为空，会报「无法从依赖变更中确定安装了哪一个包」，并回滚 `package.json` / `pnpm-lock.yaml`（node_modules 可能留下新文件，状态反而不一致）。

```bash
dsh plugin --profile desktop remove dsh-general-automatic-memory
dsh plugin --profile desktop add github:github-llh/dsh-general-automatic-memory
```

用插件页操作时同理：通用自动记忆 → 卸载 → 添加插件。**安装时请把 `github:github-llh/dsh-general-automatic-memory` 作为 Git 地址填写，不要混用 `https://github.com/...`**；两种写法在 DSH 眼里不是同一个已安装依赖，会触发上面那个误判。卸载/重装都不会动 `~/.dsh/memory` 里的数据。

**可选：上架到插件市场**。仓库里带了索引生成器：

```bash
npm run market        # 用当前 HEAD 生成 market/index.json（format:1，git 源钉 commit）
```

把 `market/index.json` 放到任意静态托管，在 dsh 的 Plugins → More → Custom plugin markets 里填它的 URL 即可。

## 本地开发

```bash
pnpm install --registry=https://registry.npmjs.org   # ⚠️ 见下方 registry 说明
npm run check      # typecheck → build → bundle 校验 → 100 个测试
npm run build      # lib/index.js + client/client.js
```

装载进 dsh（本地开发用 overlay，不需要先安装进 profile）：

```bash
dsh web --patch /absolute/path/to/dsh-general-automatic-memory/dev.patch.yml
```

⚠️ **registry**：本机 `~/.npmrc` 指向 `registry.npmmirror.com`，实测其 CDN 只有约 **6.5 KB/s**（102 KB 要 16 秒），会让 `pnpm install` 看起来像卡死。装本插件依赖时用 `--registry=https://registry.npmjs.org`，同样内容 2 秒完成。

⚠️ **`--patch` 的裸导入会从插件目录向上找 `node_modules`**，所以本地开发需要 `@deepseek-ai/cordis` 在 `node_modules` 里（已作为 devDependency 装好）。

### 测试守的是什么

| 测试文件 | 守护的不变量 |
|---|---|
| `test/recall.test.ts` | **原则 P4**：同输入渲染 100 次逐字节相同；条目顺序打乱后输出不变；注入文本里没有时刻/相对时间/会话 uuid；预算硬上限；`+N more` 尾行必须存在 |
| `test/bundle.test.ts` | **风险 R17**：用 `node:vm` 沙箱**真的执行**产物，证明它能注册、factory 可调用、`apply` 在最小 ctx 上不抛、`sidebar.panellist` 与 `main` 的 id/key 配对正确 |
| `test/host-boot.test.ts` | 装配链：6 工具 / 3 命令 / 路由 / 常驻层；waterfall 形状不符时**恒等返回而不是 undefined**；常驻层内容没变就不重注册（保前缀缓存）；跨源与缺 nonce 一律 403 |
| `test/frontmatter.test.ts` | 往返逐字节相同、checksum 只覆盖正文、非法文件明确报错而不是猜 |
| `test/store.test.ts` | 路径穿越一律拒；失效=归档而非删除；硬删要 id 尾 4 位确认；派生文件内容没变则一个字节都不写 |

## 安全卸载（对应风险 R17）

dsh 0.2.1-rc.2 上单个 client bundle 装载失败会导致**整个 Desktop 进程退出**（[discussion #10309](https://github.com/deepseek-ai/deepseek-harness/discussions/10309)，官方尚未回应）。万一遇到，**不需要 GUI**：

```bash
dsh plugin --profile desktop remove dsh-general-automatic-memory   # CLI 卸载，不启动 Desktop
```

记忆数据在 `~/.dsh/memory/`，卸载插件不会动它。


---

## 为什么做这个

三条事实构成了这个插件的全部立项理由：

1. **dsh 官方没有内置记忆能力。** 官方 extension cookbook 把 Memory 定位成一个扩展点（`Memory → section provider + tool`），随包只提供 3 个**默认关闭**的 MCP 记忆参考配置（Memorix / `@modelcontextprotocol/server-memory` / Engram），并明确声明「不代表背书、不承诺支持」。这条赛道是空的。
2. **业界头部方案都不解决「跨工具 + 可编辑 + 跨设备」这三件事的交集。** ChatGPT 记忆在云端、不可逐字编辑、不跨工具；Claude Code 的 auto memory 是明文文件、可编辑、有硬预算，但**明确 machine-local**，不跨设备不跨团队；Anthropic memory tool 是客户端文件式协议，但存储与检索全靠宿主自己实现且**不提供 ranked retrieval**；Cursor / Windsurf 的 memories 各自锁在自己的目录里。
3. **已有的第三方 dsh 记忆插件（`@a9i5k4/dsh-auto-memory`）证明了需求真实存在，也证明了这条路的坑。** 它做到 159 个配置键、15 个 `memory_*` 工具、13 个跨 AI 工具外部源、S3 团队同步、后台"记忆中枢"工作台；代价是配置爆炸、工具面吃掉大量请求头 token、后台任务以 `danger-full-access` 权限运行且用户不可见，并且曾因注入内容不稳定**击穿 DeepSeek 前缀缓存**而发出 `level:"urgent"` 的强制升级公告。

本插件的设计目标就是**在保留前作野心的同时，把它的三类代价消掉**：配置克制、工具面精简、后台任务受限且可见，并把「逐字节幂等注入」当成一等约束而不是事后修补。

## 核心设计原则（不可妥协的 7 条）

| # | 原则 | 落地方式 |
|---|---|---|
| P1 | **明文文件是唯一真相源** | 一条记忆 = 一个 Markdown 文件 + YAML frontmatter。索引、FTS、向量、聚合视图全部是**可删除可重建的派生缓存** |
| P2 | **用户能改，改了算数** | 所有条目人可直接编辑；`checksum` 检测手工改动；派生文件被手改时 doctor 提示回灌而不是静默覆盖 |
| P3 | **注入成本恒定，不随记忆增长** | 常驻层硬预算 ≤2 KB，目录层 ≤400 token；超限触发后台固化，而不是静默截断或无限膨胀 |
| P4 | **逐字节幂等，保护前缀缓存** | 同一请求内已定稿的注入文本原样复读；只有内容真变或 compaction 移除后才产出新快照 |
| P5 | **来源决定可信度，可信度决定层级** | `tool-output` / `web-content` 只能落 `episode` 层，需热度晋升或用户确认才能升级为长期条目（防记忆投毒） |
| P6 | **矛盾不删除，只失效** | bi-temporal：写 `invalidatedAt` + `supersededBy`，原件移入 `archive/`，支持时点回溯 |
| P7 | **UI 只是 API 的一个视图** | 面板能做的每件事都能通过工具 / slash 命令 / HTTP 路由做到；CLI、headless、无 UI 环境不丢任何能力 |

## 能力总览

| 能力 | 说明 | 文档 |
|---|---|---|
| **导入各 agent 记忆** | Claude Code auto memory、CLAUDE.md / AGENTS.md、Cursor rules、Windsurf、Cline memory-bank、Copilot、Gemini、第三方前作 dsh-auto-memory、任意 Markdown 目录、zip 快照；全部带 dry-run 预检 | [06](docs/06-portability.md) |
| **导入会话生成记忆** | 把历史会话喂进与实时写入同一条管线（抽取 → 门控 → 决策）：dsh `session.v4.jsonl.zstd`（多帧 zstd）、Claude Code jsonl、通用 jsonl/markdown | [06](docs/06-portability.md) |
| 自动分类 | 8 类记忆自动分隔：自索引 / 画像 / 族谱 / 反馈 / 项目事实 / 外部指向 / 程序 / 情景 | [03](docs/03-memory-format.md) |
| 自索引 | `INDEX.md` 由 frontmatter 反向生成，永不手写；硬上限 200 行 / 25 KB | [04](docs/04-index-and-recall.md) |
| 省 token 召回 | 三级渐进披露（摘要常驻 → 目录可选 → 全文按需）+ 分级检索后端 L0/L1/L2 | [04](docs/04-index-and-recall.md) |
| 自动写入 | 抽取 → 相似检索 → `ADD/UPDATE/INVALIDATE/NOOP` 决策 → 原子落盘 → 索引增量重建 → 审计 | [05](docs/05-write-pipeline.md) |
| 后台固化 | 离线合并、重写画像、热度晋升、冷条目归档；每次固化前自动快照 | [05](docs/05-write-pipeline.md) |
| 跨设备 | 追加式条目 + 内容哈希增量 + 设备位点；冲突走 LLM 语义合并 + 人工裁决 | [06](docs/06-portability.md) |
| 可恢复 | 快照 / diff / 一键回滚 / doctor 体检 | [06](docs/06-portability.md) |
| 插件页前端 | dsh 侧栏**一等主面板**（`sidebar.panellist` + `main` 同 id 配对），桌面 / 浏览器 / 手机同一份 bundle | [07](docs/07-plugin-ui.md) |
| 安全隐私 | provenance 门控、PII 检测、敏感话题默认不记、全量审计、GDPR 硬删除、**不需要 `danger-full-access`** | [09](docs/09-security-and-privacy.md) |
| 可选：单向投影 | 把记忆导出成 `AGENTS.md` / `.cursor/rules` / `GEMINI.md` 等，方便其他工具读——**默认关闭，不是核心定位** | [06 §3](docs/06-portability.md) |

## 文档索引

| 文档 | 内容 |
|---|---|
| [01 产品定位](docs/01-product-vision.md) | 目标用户、核心场景、竞品能力矩阵、差异化、非目标、成功指标与反向指标 |
| [02 架构](docs/02-architecture.md) | Host/Client 两半、模块地图、数据流、dsh 挂载点全表、降级策略 |
| [03 记忆数据模型](docs/03-memory-format.md) | 类型学、目录布局、frontmatter 全字段规范、id 与 checksum、生命周期状态机 |
| [04 自索引与召回](docs/04-index-and-recall.md) | 三级披露、L0/L1/L2 检索、注入管线、token 预算表、KV-cache 幂等 |
| [05 写入管线与固化](docs/05-write-pipeline.md) | 触发点、抽取、决策、原子写、后台固化、遗忘与衰减 |
| [06 可移植性](docs/06-portability.md) | 跨工具投影、导入器矩阵、跨设备同步、冲突、快照恢复 |
| [07 插件页前端](docs/07-plugin-ui.md) | 信息架构、10 个视图、slot 注册骨架、HTTP 路由表、样式与 i18n 约束、响应式与降级 |
| [08 打包与配置](docs/08-packaging-and-config.md) | `package.json` / `cordis.patch.yml` / client bundle 构建 / Config schema / market index |
| [09 安全与隐私](docs/09-security-and-privacy.md) | 投毒防护、PII、审计、权限边界、合规 |
| [10 路线图与风险](docs/10-roadmap-and-risks.md) | M0–M6 里程碑、验收标准、风险登记表 |
| [附录 A：dsh 契约速查](docs/appendix-dsh-contract.md) | 本地实证（解包 `app.asar`）得到的 API、slot 名录、事件表、版本基线 |

## 技术基线（本地实证，非文档推断）

```
dsh 运行时          0.2.1-rc.2   (dshBuildCommit 332895e0, update channel: nightly)
Cordis              @deepseek-ai/cordis 4.0.5（随包附带完整 src/*.ts，是唯一有真类型的层）
Node / pnpm         24.21.0 / 11.28.5
React（浏览器基线）  18.3.x
插件清单            package.json 的 dsh 字段 + cordis.patch.yml（没有 plugin.json）
UI 机制             宿主同 document 内 React 组件注入具名 slot（官方明令禁止 iframe）
记忆存储根          ~/.dsh/memory/（$DSH_HOME ?? ~/.dsh；dsh 专属，不是跨工具共享根）
```

⚠️ dsh 仍是 developer preview，README 原文警告 **"THERE WILL BE COMPATIBILITY-BREAKING CHANGES"**，且核心仓库**不接受外部 PR**。所有对接点必须写成薄适配层，见 [02 §7](docs/02-architecture.md#7-对抗上游破坏性变更).

## 关键参考

- 官方仓库与文档：https://github.com/deepseek-ai/deepseek-harness · https://deepseek-harness.github.io/deepseek-harness/
- 官方插件开发技能（随包，本机路径）：`app.asar → dsh/node_modules/@deepseek-ai/dsh-agent-preset/skills/cordis-plugin-development/`
- 官方记忆立场：`docs/user/guide/mcp-memory.md`（三个默认关闭的 MCP 参考配置）
- 对标：Anthropic memory tool / Claude Code auto memory / ChatGPT Dreaming / mem0 / Zep-Graphiti / Letta sleep-time —— 详见 [01 §4](docs/01-product-vision.md#4-竞品能力矩阵)
