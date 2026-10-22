# 08 · 打包、配置与分发

## 1. 仓库结构

```
dsh-general-automatic-memory/
├── package.json                  # 清单就是它的 dsh 字段（没有 plugin.json / manifest.json）
├── cordis.patch.yml              # bundle patch
├── tsdown.config.ts              # Host 半侧构建
├── tsdown.client.ts              # Client 半侧构建（官方 preset 未发布，必须自己复刻）
├── icon.svg                      # ≤256 KiB，必须在包内
├── locale/
│   ├── en.json                   # 含 meta.title / meta.description
│   └── zh.json
├── src/
│   ├── index.ts                  # Host 入口：apply / inject / Config
│   ├── config.ts                 # schemastery Config
│   ├── api.ts                    # MemoryApi —— 唯一对外契约层
│   ├── host/
│   │   ├── adapters/             # ★ 所有 ctx.* 调用收敛在这里，每个 ≤50 行（对抗上游破坏性变更）
│   │   │   ├── tools.ts  commands.ts  system-prompt.ts  events.ts
│   │   │   ├── web-server.ts  llm.ts  storage.ts  schedule.ts  fs.ts  session-query.ts
│   │   ├── store/                # 条目 CRUD、原子写、锁、frontmatter 解析校验、checksum
│   │   ├── index/                # INDEX/PROFILE/GENEALOGY/graph.jsonl/catalog/FTS 生成与增量重建
│   │   ├── recall/               # 三级披露渲染、L0/L1/L2 检索、门控、预算裁剪、逐字节幂等快照
│   │   ├── ingest/               # 抽取、来源分级、决策 ADD/UPDATE/INVALIDATE/NOOP
│   │   ├── curator/              # 固化：merge / rewrite / promote / demote / expire / snapshot
│   │   ├── bridge/               # 导入器(12) / 投影器(10) / 同步 / 恢复
│   │   ├── security/             # provenance 门控、PII 扫描、路径白名单、审计
│   │   └── http/                 # /general-memory/* 路由 + 同源/CSRF 守卫
│   └── client/
│       ├── client.ts             # window.__ModuleLoader__.load 包装前的真实实现
│       ├── panel.tsx  icon.tsx
│       ├── views/                # Overview Browse Editor Graph Timeline Portability Recovery Sync Settings Audit
│       ├── components/           # 自写控件（.gam-* 前缀，从 primitive 拷贝改造，不 import 宿主包）
│       ├── hooks/                # useGam / useGamMutation / useStore / useVirtualList
│       └── styles/*.module.css
├── lib/                          # 构建产物（进 files）
├── test/
│   ├── unit/                     # store / frontmatter / 决策 / 预算裁剪
│   ├── contract/                 # ★ 逐字节幂等测试：同输入渲染 100 次字节一致
│   ├── integration/              # 用 --patch 起真实 dsh，跑注入与工具调用
│   └── portability/              # 导入导出与投影的一致性矩阵（06 §6）
├── docs/                         # 本设计文档
└── market/index.json             # plugin market index（format:1）
```

## 2. `package.json`（完整）

```jsonc
{
  "name": "dsh-general-automatic-memory",
  "version": "0.1.0",
  "description": "Cross-tool, human-editable, self-indexing long-term memory for DeepSeek Harness",
  "type": "module",
  "icon": "icon.svg",
  "exports": {
    ".":               { "types": "./lib/types/index.d.ts",        "default": "./lib/index.js" },
    "./client":        { "types": "./lib/types/client/index.d.ts", "default": "./lib/client.js" },
    "./locale/*.json": "./locale/*.json",
    "./icon":          "./icon.svg"
  },
  "files": ["lib", "locale", "icon.svg", "cordis.patch.yml", "README.md", "README.zh.md"],
  "engines": { "dsh": ">=0.2.1-rc.2 <0.3.0", "node": "^22.19.0 || >=24.0.0" },
  "scripts": {
    "build": "tsdown -c tsdown.config.ts && tsdown -c tsdown.client.ts",
    "dev": "tsdown -c tsdown.client.ts --watch",
    "test": "vitest run",
    "lint": "oxlint src test"
  },
  "peerDependencies": {
    "@deepseek-ai/cordis": "^4.0.5",
    "@deepseek-ai/dsh-tools": ">=0.2.0",
    "@deepseek-ai/dsh-commands": ">=0.2.0",
    "@deepseek-ai/dsh-system-prompt": ">=0.2.0",
    "@deepseek-ai/dsh-settings": ">=0.2.0",
    "@deepseek-ai/dsh-host-webserver": ">=0.2.0",
    "@deepseek-ai/dsh-home-paths": ">=0.2.0"
  },
  "devDependencies": {
    "@deepseek-ai/cordis": "4.0.5",
    "@deepseek-ai/dsh-tools": "0.2.1-rc.2",
    "@deepseek-ai/dsh-commands": "0.2.1-rc.2",
    "@deepseek-ai/dsh-system-prompt": "0.2.1-rc.2",
    "@deepseek-ai/dsh-settings": "0.2.1-rc.2",
    "@deepseek-ai/dsh-host-webserver": "0.2.1-rc.2",
    "@deepseek-ai/dsh-home-paths": "0.2.1-rc.2",
    "@types/react": "~18.3.1",
    "react": "18.3.1",
    "tsdown": "^0.22.2",
    "typescript": "^6.0.3",
    "vitest": "^4.0.0",
    "oxlint": "latest"
  },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "platform": "web",
      "immediately": false,
      "inject": ["@deepseek-ai/dsh-client-ui-conversation"]
    }
  }
}
```

**规则与依据**：

- dsh 包要**同时**写进 `peerDependencies`（运行时用宿主实例）与 `devDependencies`（供类型检查与独立测试）；独立版本化的第三方依赖与无状态工具才放 `dependencies`
- 我们的 `dependencies` 目标是**空或接近空**：SQLite 用 Node 内置 `node:sqlite`（Node 22.5+，dsh 基线 Node 24.21），向量层为可选 peer（`onnxruntime-node` + `@huggingface/transformers`，默认不装）。理由：dsh 的 pnpm 11 会拦依赖构建脚本，装原生模块要用户手动点一次 "Allow these scripts and retry"（本机 `allowBuilds` 里就躺着 `onnxruntime-node`/`protobufjs`/`sharp`），每多一个原生依赖就多一次安装摩擦
- pnpm 用 strict symlinked linker：**未声明的依赖直接失败**，别指望幽灵依赖
- `engines.dsh` 是 SemVer range，在**安装与 profile 启动两处强制**；声明了它就**只看它**（`peerDependencies` 被忽略）；空/非法 range（含 `workspace:`）视为不兼容 → 拒绝时报 `incompatible-version`
- `dsh.manifestVersion` 当前 installer/loader **不强制校验**，但写上 `"manifestVersion": 1` 无害且面向未来
- 子路径插件（如 `my-plugins/search`）不是包、不读 `package.json`，改为导出 `./search/locale/*.json` 与 `./search/icon` —— 我们不用子路径插件

## 3. `cordis.patch.yml`

```yaml
- insert:
    - id: general-memory
      name: dsh-general-automatic-memory
      config:
        memoryRoot: !!js "dshAgentsHomePath('memory')"
        storage:
          archiveAfterDays: 90
        budget:
          alwaysChars: 2000
          catalogTokens: 400
```

**patch 方言要点**（官方 `cordis-composition-reference` SKILL 原文）：

- `insert: [rows]` 追加行；若 `id` 指向一个已存在的 `group: true` 行，则插入到该 group 的 `config` 列表内
- 带 `id` 且无 `insert` = **覆盖**已存在的行；**`config` 整体替换，绝不深合并** → 覆盖时必须重述该行所有字段
- 行字段：`id`、`name`（包 specifier；相对路径锚定到 patch 文件旁）、`config`、`disabled`、`inject`、`intercept`、`isolate`、`group`
- `!!js` 是 Loader 表达式（**不是 `!js`**），在 `config` 内的求值时机 = 该行声明的 injection 激活之后，作用于该插件的 context
- `disabled` 接受 boolean / null / `!!js` 表达式（每次 mount 决策时求值）
- 层级顺序：profile 根 `cordis.yml`（内容为 `[]`，注释明确写「Edit cordis.patch.yml, not this file」）→ 各 bundle 的 `dsh.bundle.patch` → profile 的 `cordis.patch.yml` → `$DSH_HOME/cordis.patch.yml`（**优先级高于 profile**）→ `--patch`（最高）。**同一 id 后写胜出**

⚠️ `!!js dshAgentsHomePath('memory')` 的可用性需要在实现时验证（已确认 dsh-base 用 `!!js dshHomePath('sessions')`，`@deepseek-ai/dsh-home-paths` 导出 `resolveAgentsHome()`）。**兜底**：Config 的 `memoryRoot` 默认值在代码里用 `resolveAgentsHome()` 计算，patch 里不写也能工作。

## 4. Config schema（schemastery）

### 4.1 设计原则：配置克制

官方设计原则原文：*"anything that two deployments may want to set differently to be a configuration field"*。反过来讲——**两个部署不会想设成不同值的东西，就不该是配置项**。

前作有 **159 个配置键**，其中大量是实现细节外泄（`jsDecideDeltaExp: 0.01`、`dayBoundaryMinutes: 450`、`autoArchiveCheckMin: 60`、`teamDerivedDebounceMs: 2000`）。用户面对 159 个键的结果是**一个都不改**，而且改错任何一个都可能出诡异行为。

我们的目标：**≤40 键，7 组**，其余全部硬编码为经过论证的默认值。高级键集中在 `advanced.*` 一组并在 UI 里折叠。

### 4.2 完整 Config

```ts
import Schema from '@deepseek-ai/schemastery'

export interface Config {
  memoryRoot: string
  budget: {
    alwaysChars: number; catalogTokens: number; recallChars: number
    globChars: number; maxShareOfRequest: number; maxToolSchemaBytes: number
  }
  inject: {
    enabled: boolean; fullEvery: number; slimEvery: number
    globActivation: boolean; showTurnTail: boolean
  }
  ingest: {
    writeMode: 'auto' | 'suggest' | 'manual'
    autoKinds: string[]; suggestTimeoutSec: number
    llmExtract: boolean; dailyLlmCalls: number; burstThreshold: number; requireEvidence: boolean
  }
  retrieval: {
    backend: 'l0' | 'l1' | 'auto'; vectorEnabled: boolean
    gateThreshold: number; recallLimit: number
  }
  curator: {
    enabled: boolean; scheduleTime: string; consolidateEverySessions: number
    promoteMinHits: number; episodeTtlDays: number; archiveAfterDays: number
  }
  portability: {
    projections: Record<string, boolean>; importOnFirstRun: boolean
    syncTransport: 'none' | 'git' | 'zip' | 'remote'; syncConflictPolicy: 'ask' | 'prefer-local' | 'prefer-remote'
  }
  privacy: {
    sensitiveTopics: boolean; piiScan: boolean; sharePii: boolean; auditKeepDays: number
  }
  toolSurface: 'minimal' | 'standard'
  advanced: { snapshotKeep: number; indexRebuildOnStart: boolean; shadowRetrieval: boolean }
}

export const Config: Schema<Config> = Schema.object({
  memoryRoot: Schema.string().default(''),                 // 空 = resolveAgentsHome()/memory
  budget: Schema.object({
    alwaysChars: Schema.number().default(2000),
    catalogTokens: Schema.number().default(400),
    recallChars: Schema.number().default(1600),
    globChars: Schema.number().default(1200),
    maxShareOfRequest: Schema.number().default(0.03),
    maxToolSchemaBytes: Schema.number().default(6000),
  }).default({}),
  inject: Schema.object({
    enabled: Schema.boolean().default(true),
    fullEvery: Schema.number().default(20),
    slimEvery: Schema.number().default(8),
    globActivation: Schema.boolean().default(true),
    showTurnTail: Schema.boolean().default(false),
  }).default({}),
  ingest: Schema.object({
    writeMode: Schema.union(['auto', 'suggest', 'manual']).default('suggest'),
    autoKinds: Schema.array(Schema.string()).default(['episode', 'project']),
    suggestTimeoutSec: Schema.number().default(15),
    llmExtract: Schema.boolean().default(true),
    dailyLlmCalls: Schema.number().default(8),
    burstThreshold: Schema.number().default(10),
    requireEvidence: Schema.boolean().default(true),
  }).default({}),
  retrieval: Schema.object({
    backend: Schema.union(['l0', 'l1', 'auto']).default('auto'),
    vectorEnabled: Schema.boolean().default(false),
    gateThreshold: Schema.number().default(0.35),
    recallLimit: Schema.number().default(5),
  }).default({}),
  curator: Schema.object({
    enabled: Schema.boolean().default(true),
    scheduleTime: Schema.string().default('09:30'),
    consolidateEverySessions: Schema.number().default(20),
    promoteMinHits: Schema.number().default(2),
    episodeTtlDays: Schema.number().default(14),
    archiveAfterDays: Schema.number().default(90),
  }).default({}),
  portability: Schema.object({
    projections: Schema.dict(Schema.boolean()).default({ agentsMdPointer: true, skills: true }),
    importOnFirstRun: Schema.boolean().default(true),
    syncTransport: Schema.union(['none', 'git', 'zip', 'remote']).default('none'),
    syncConflictPolicy: Schema.union(['ask', 'prefer-local', 'prefer-remote']).default('ask'),
  }).default({}),
  privacy: Schema.object({
    sensitiveTopics: Schema.boolean().default(true),       // true = 敏感话题不记（对齐 Claude 默认）
    piiScan: Schema.boolean().default(true),
    sharePii: Schema.boolean().default(false),
    auditKeepDays: Schema.number().default(90),
  }).default({}),
  toolSurface: Schema.union(['minimal', 'standard']).default('standard'),
  advanced: Schema.object({
    snapshotKeep: Schema.number().default(10),
    indexRebuildOnStart: Schema.boolean().default(false),
    shadowRetrieval: Schema.boolean().default(false),
  }).default({}),
})
```

共 **38 个键**。

### 4.3 schemastery 注意事项

**已在本机 asar 内 `@deepseek-ai/schemastery@3.18.0` 的 README 中逐条核实**：

- **不要导出普通对象作为 `Config`** —— dsh 官方原文 *"it does not implement the Standard Schema interface required by Cordis"*
- `interface Config` 与 `const Config` **必须同名**（Cordis 靠同名配对）。**TS 类型以 `interface` 为准，schema 只负责运行时校验** —— 所以 `Schema.union(['auto','suggest','manual'])` 这种简写不会丢失字面量联合类型
- **枚举的简写语法**：`1` → `Schema.const(1)`（仅原始类型）、`String` → `Schema.string()`、`Number` → `Schema.number()`、`Boolean` → `Schema.boolean()`、`Date` → `Schema.is(Date)`、`undefined` → `Schema.any()`。官方 Advanced Examples 的 Enumeration 就是 `Schema.union(['red', 'blue'])`
- `.default(value)` 与 `.required()` **互斥**
- `.description(text)` 设置字段描述 → **这是设置表单里 label/hint 的来源，每个键都要写**
- `.simplify(value)`：去掉等于默认值的部分 → 我们写 `cordis.patch.yml` 时用它，**保证用户配置文件只含真正改过的键**（前作把 159 个键全量落盘，是它的配置文件难读的原因之一）
- 校验选项：`Config(value, { autofix: true })` 可移除非法属性；另有 `ignore`（跳过指定节点）与 `path`（嵌套错误的初始路径）
- 高级类型：`Schema.union` / `intersect` / `transform` / `tuple` / `dict` / `is(ctor)`；可用 `Schema.extend()` 自定义类型

⚠️ **待复核**（来自 dsh `docs/subsystems/settings.md`，但本机 schemastery 3.18.5 README 的 Instance Methods 一节未列出，可能是 dsh 通过 `Schema.extend()` 的扩展）：

- `.volatile()` → `Volatile<T>` + `.get()` + 监听 `loader/volatile-update`：适合"运行时可变且需立即生效"的键（如 `inject.enabled`）
- `role('secret')` 让字段**不出现在表单响应里** —— 同步后端凭据必须用它（若不可用，改为把凭据存在 `MEMORY_ROOT` 外的独立文件，不进 Config）

❌ **`.check()` 不存在**（npm 发布物 `@deepseek-ai/schemastery@3.18.5` 的类型声明里 `check(` 命中数为 0）。跨字段校验改为在 `apply()` 里手动做：校验失败就记 warn 并回落到默认值，不要让插件激活失败。

`dsh --dump-config-schema` 可把已组合树的 schema 打成 JSON Schema，但**会 import 插件模块**，官方警告只对可信 profile 用。

### 4.4 用户在哪改配置

| 途径 | 说明 |
|---|---|
| GUI · Plugins 页 | 我们的 bundle 配置页（`plugins.item` / `plugins.bundle.config` slot，owner 提供 `view:'summary'\|'page'` 与 `form?: ConfigPageForm`） |
| GUI · Settings | `settings.section` 分区（我们注册的深链 + 预算实时预览） |
| GUI · 面板内 Settings 视图 | 分组导航 + 预设切换 + 危险区 |
| 文件 | `$DSH_HOME/profiles/<name>/cordis.patch.yml`（per-profile）或 `$DSH_HOME/cordis.patch.yml`（机器级，**优先级更高**） |

底层由 `packages/boot/config-editor` 写进 profile 的 `cordis.patch.yml`，**升级后存活**。表单命名空间 = **profile entry id**（同插件多实例各有独立表单）。程序化写：`ctx.settings.update(ns, patch, expectedRevision?)` / `replace` / `mutate(ns, ops, …)`（乐观锁，写前校验完整 Config）；变更广播 `settings/document-updated(ns, revision)`。

⚠️ **没有 per-workspace 配置层**（官方未文档化）；工作区级只有 `.dsh/skills`、`.agents/skills` 与 AGENTS.md 链。所以"项目 A 用激进模式、项目 B 用保守模式"这种需求，只能靠记忆条目自身的 `scope: project` + `activation` 表达，不能靠配置分层。这是设计约束，不是遗漏。

## 5. 构建

| 半侧 | 工具 | 产物 | 关键点 |
|---|---|---|---|
| Host | `tsdown` → ESM | `lib/index.js` + `lib/types/**/*.d.ts` | 官方 publish 示例是**纯 ESM `index.js`，免构建即可加载**；但我们要 TS + 类型，所以还是构建 |
| Client | `tsdown` + 自写 lazy-CJS wrapper | `lib/client.js` | 产物首行必须是 `window.__ModuleLoader__.load({`，`id` 必须 === 包名；`require.async("./client.<name>.js")` 对应 tsdown 拆出的 `import()` chunk |

**官方 client preset 未发布成包**（`packages/client/tsdown.client.ts` 在仓库里但没发 npm），必须自己复刻并加格式断言测试。这是本插件最高的工程风险之一，M0 就要打通。

工具链基线（官方仓库）：`"type": "module"`、Node `^22.19.0 || >=24.0.0`（CI 覆盖 22.19 / 24 / 26）、`packageManager: pnpm@11.28.5`（corepack）、TypeScript `^6.0.3`、`tsdown ^0.22.2`、Vite `8.2.2`、React 18.3、`zod ^4.4.3`、vitest 4、oxlint。注意 Node 的 TypeScript type stripping：`NODE_OPTIONS` 里有 `--no-experimental-strip-types` 会让构建失败。

## 6. 本地开发与调试

```bash
# 1. 起 web host（desktop profile 名被 Electron 保留，CLI 拒绝 boot/dump）
npx @deepseek-ai/dsh web --no-open          # 默认 http://127.0.0.1:3080

# 2. 用 --patch 挂载开发中的插件（最高优先级层）
npx @deepseek-ai/dsh web --patch /abs/path/to/dsh-general-automatic-memory/cordis.patch.yml
```

已知坑（社区实测，会省你几小时）：

- `--patch` 用绝对路径时，插件的**裸导入会从插件目录向上找 `node_modules`** → 本地开发要把 `@deepseek-ai/*` 软链进插件目录，否则 `import '@deepseek-ai/cordis'` 解析失败
- `@deepseek-ai/dsh-headless` 依赖的 `@deepseek-ai/dsh-code-runtime-worker` **不在 npm 上** → e2e 用默认 headless profile + `--patch`，别单独装 headless
- tool 的 object 输出 schema 必须写 `additionalProperties: true`，否则注册失败
- `ctx.sessionQuery` 在 web 默认**不挂载**，别当硬依赖
- 新 bundle 可 HMR 激活（`@deepseek-ai/dsh-hmr`：编辑源文件 → 卸载旧 → 加载新）；**替换已装包需要重启**（新的 JS module generation）
- 安装状态语义：`failed`（需诊断）/ `overridden`（更高优先级层胜出）/ `restart-required`（未生效）/ `applied`（HMR 已生效）

**运行时自省**（官方推荐的第一发现手段）：`cordis_inspect_list` → `cordis_inspect_query`，provider 有 `Service` / `Event` / `Config` / `Tool` / `Slots` / `Theme`。`Slots.listSubTree` 返回 slot 的 registration options 与 props；`Config.listConfigs` 按 `name` 过滤找到 entry，查 entry 返回 `packageDir`，然后读 `<packageDir>/README.md`（**每个 `@deepseek-ai/dsh-*` 都带 `README.md` + `README.zh.md`，是本地最权威的 API 文档**；注意 `.d.ts` 未随包附带，asar 内 `.d.ts` 文件数为 0，唯一有真类型的是 `@deepseek-ai/cordis` 与 3 个 `cordis-plugin-*`）。

`DSH_PROFILE` / `DSH_PROFILE_DIR` 在 profile 启动的每次 shell 调用里都有；`dsh --profile "$DSH_PROFILE" --dump-config` 打印组合后的 profile。

## 7. 安装与分发

### 7.1 安装通道

| 通道 | 命令 / 位置 | 备注 |
|---|---|---|
| CLI | `dsh plugin --profile <name> add <包名 \| github:账号/仓库 \| 本地路径>` | 转发给 profile 目录里的 pnpm，**没有 pnpm 会直接报错** |
| GUI | Plugins → Add plugin | 同上 |
| Agent 工具 | `plugin_manager` 的 `install_bundle`（`target` = 绝对包目录 / registry spec / git / tarball） | 每个 action 都需 `danger-full-access` 或逐次审批；**默认 `disabled: true`，只在 Creator mode 开** |
| 市场 | Plugins → More → Experimental plugins → Custom plugin markets → 出现 **Discover** tab | 索引源 per-profile |
| 卸载 | `dsh plugin --profile <name> remove <pkg>` | — |

⚠️ **SKILL.md 明确禁止手写 profile 的 `package.json` / `cordis.patch.yml` / `pnpm-lock.yaml`，禁止手动跑 pnpm，禁止在 `$DSH_HOME` 下建包。** `install_bundle` 会自己写这些文件。

Registry 回退链：`options.registry` → 配置的 `registry`（`null` = pnpm 自己配的）→ `fallbackRegistries`（默认 `['https://registry.npmmirror.com/']`）。私有 registry 单独问、不 fall through 到公共。GitHub spec 先用 `git ls-remote` 探测（`githubConnectionTimeoutMs` 默认 5000，禁用 credential helper 与 prompt），失败报 `failedAt: 'spec-host'`。

### 7.2 命名与识别

- 包名必须合法：`/^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/u`，≤214 字符
- Loader row `id` 全 profile 唯一；Cordis service 名全局唯一（重复 id 被 registry 拒）
- settings namespace 必须匹配 `/^[a-z][a-z0-9-]*$/` → 我们用 `general-memory`
- skill 名必须 kebab-case（导出 procedure 为 SKILL 时注意）
- 命名惯例 `dsh-<name>` / `@scope/dsh-<name>`；官方包 `@deepseek-ai/dsh-*`；名字以 `@deepseek-ai/dsh-experimental-` 开头会自动显示 Experimental 标记
- **官方发现机制 = 给仓库打 GitHub topic `dsh-plugin`**（README 与 CONTRIBUTING 都这么写）

### 7.3 Market index（`format: 1`，完整 schema 已从校验器逆向）

```jsonc
{
  "format": 1,
  "title": { "en": "General Automatic Memory", "zh": "通用自动记忆" },   // 对象形式必须含 en
  "description": { "en": "Cross-tool, human-editable, self-indexing long-term memory", "zh": "跨工具、可编辑、自索引的长期记忆" },
  "metadata": {
    "categories": { "memory": { "title": { "en": "Memory", "zh": "记忆" } } },
    "labels": { "file-based": { "title": { "en": "File-based", "zh": "文件式" } } },
    "sortKeys": { "popularity": { "title": { "en": "Popularity", "zh": "热度" }, "order": "desc" } }
  },
  "plugins": [{
    "name": "dsh-general-automatic-memory",
    "title": { "en": "General Automatic Memory", "zh": "通用自动记忆" },
    "description": { "en": "…", "zh": "…" },
    "icon": "icons/icon.svg",                       // 相对解析到 index origin，或 data: URL（≤32 KiB 解码后），跨源必须 https
    "author": "…",
    "homepage": "https://github.com/<org>/dsh-general-automatic-memory#readme",
    "repository": { "url": "https://github.com/<org>/dsh-general-automatic-memory" },
    "metadata": { "category": "memory", "keywords": ["memory", "recall", "agents-md"], "labels": ["file-based"], "sortKeys": { "popularity": 0 } },
    "versions": [{                                   // 非空、version 不可重复、按 SemVer 降序
      "version": "0.1.0",                            // 精确 SemVer 2.0.0，不接受 range
      "publishTimestamp": 1792566196,                // 整数 Unix 秒，[0, 1e11)
      "source": { "type": "npm" },                   // 或 {type:'git', url(https,canonical,≥2 path 段,不可 .tgz), commit(/^[0-9a-f]{40}$/), path?}
      "engines": { "dsh": ">=0.2.1-rc.2 <0.3.0" }    // SemVer range，不可 workspace:
    }]
  }]
}
```

校验器导出：`parseMarketIndex(value, indexUrl)`（第一条违规即抛 `MarketIndexError{path, reason}`，path 形如 `$.plugins[0].versions[1].version`）、`marketInstallTarget(name, version)` → `{spec, registry?}`、`MAX_INLINE_ICON_BYTES = 32*1024`。

索引源约束：必须 `http:`/`https:`、不含 userinfo 与 `#` fragment、≤128 MiB、2xx **无重定向**。`dsh-plugin-market` service config：`indexes: []`（volatile）、`fetchTimeoutMs: 15000`、`maxBytes: 134217728`、`cacheTtlMs: 600000`。查询字段：`text`、`category`、`labels`、`sort`、`offset`、`limit`(1–100)、`refresh`。CJK 分词用**重叠字符对 + 末字符**（无词典）、NFKC + 大小写无关、前缀匹配，≥4 字符允许编辑距离 `round(len/5)`（上限 2）；name/title 权重 ×3、keyword ×2。

⚠️ 官方原文：*"Markets are third-party content… DSH checks the file format but not those claims."* —— **市场无审核**。

⚠️ 内置插件的 640×300 预览图（`BUNDLE_PREVIEWS`）**第三方无法声明**：*"Packages cannot declare illustrations through their manifest or exports; third-party plugins have no preview interface."* → 想要市场页好看，只能靠 `icon` + `description`。

### 7.4 社区市场的额外规则（若要上架第三方市场）

`bradeGithub/DSH-Plugins-Marketplace` 的 `STANDARD.md` 指出其安装管线是**特征驱动**的（按 `preset.yml` / `install.ps1` / `package.json` / `SKILL.md` 顺序扫描，先命中者决定安装方式），因此：

- cordis 插件**不要在根目录放 install 脚本**（会被误判为脚本型插件）
- **版本必须 bump**，否则更新检测失效
- 插件**不要自己注册 patch**，否则双加载崩溃

这些是社区市场的规则，官方 market index 格式里没有类型判定这一层。

## 8. 版本兼容与豁免

- `engines.dsh` 未声明时，回退检查所有 `@deepseek-ai/dsh` / `@deepseek-ai/dsh-*` 的 peer ranges；两者都无则不设约束
- prerelease 参与 range 匹配
- 不兼容包需 profile 自己的 `compatibility.json`（与 `package.json`、`cordis.patch.yml` 并列）做精确 `package@version → [dsh 版本]` 豁免；**插件升级与 dsh 升级都不继承授权**；文件损坏不阻止 profile 启动，但会变成只读
- CLI：`dsh plugin --profile <name> version-exemptions` / `allow-version <package@version> --dsh-version <runtime> --accept-risk` / `revoke-version`
- 官方明说这些检查 *"are not a sandbox against malicious package code"*

## 9. 测试与验证清单

| 类别 | 必须通过的测试 |
|---|---|
| **契约（最高优先）** | 同一输入渲染注入文本 100 次，**字节完全一致**（原则 P4）；注入文本不含时间戳/随机数/会话 id/相对时间 |
| 契约 | client bundle 首行是 `window.__ModuleLoader__.load({`，`id === package.json.name` |
| 契约 | 所有 `ctx.*` 调用只出现在 `src/host/adapters/**`（用 lint 规则强制） |
| 单元 | frontmatter 解析/序列化往返一致；checksum 计算稳定；ULID 单调 |
| 单元 | 原子写：kill -9 在 rename 前后各测一次，不留半写文件 |
| 单元 | 决策矩阵：ADD/UPDATE/INVALIDATE/NOOP 各 10 个用例（含"与用户显式条目冲突"必须让用户条目胜出） |
| 单元 | 预算裁剪：超限时裁谁、被裁候选是否写审计 |
| 单元 | 门控：`gate-drop` 是否写审计 |
| 集成 | `--patch` 起真实 dsh：注入生效、6 个工具可调用、3 个命令可执行、面板可打开、HTTP 路由同源守卫拒绝跨源 |
| 集成 | compaction 抢救：触发 compaction 后检查 episode 是否落盘 |
| 集成 | 多进程：起两个 dsh 实例，验证心跳选主只有一个跑 curator |
| 可移植 | [06 §6](06-portability.md#6-跨工具一致性验证) 的矩阵逐项跑通 |
| 恢复 | 快照 → 破坏 → doctor → 回滚，条目数与 checksum 全部一致 |
| 安全 | 路径穿越（`../../` id / path）被拒；跨源 fetch 403；`hard delete` 需要二次确认；PII 命中不进团队同步 |
| 性能 | 1000 条目全量重建索引 <2 s；面板首屏 <500 ms；召回 <100 ms（L1） |
| 兼容 | 对当前 rc 与上一个 stable 各跑一遍冒烟 |
