import {
  KINDS,
  ACTIVATIONS,
  SOURCES,
  CONFIDENCES,
  SCOPES,
  SHAREABLE,
  SYNC_TRANSPORTS,
  CONFLICT_POLICIES,
  TOOL_SURFACES,
  RETRIEVAL_BACKENDS,
  WRITE_MODES,
  type MemoryConfig,
} from './host/model.js'

/**
 * Cordis 靠「interface Config 与 const Config 同名」配对；导出普通对象无效
 * （不实现 StandardSchemaV1）。枚举用 Schema.union(['a','b']) 的简写形式，
 * schemastery 会把原始值转成 Schema.const（官方 README · Shorthand Syntax）。
 *
 * 键数上限是产品约束（见 docs/08 §4.1）：前作 @a9i5k4/dsh-auto-memory 有 159 键，
 * 结果是用户一个都不改。这里 38 键。
 */
export const DEFAULT_CONFIG: MemoryConfig = {
  memoryRoot: '',
  budget: {
    alwaysChars: 2000,
    catalogChars: 1600,
    recallChars: 1600,
    globChars: 1200,
    maxShareOfRequest: 0.03,
    whiteboardChars: 1200,
  },
  inject: {
    enabled: true,
    fullEvery: 20,
    slimEvery: 8,
    showTurnTail: false,
  },
  ingest: {
    writeMode: 'suggest',
    autoKinds: ['episode', 'project'],
    suggestTimeoutSec: 15,
    llmExtract: true,
    dailyLlmCalls: 8,
    burstThreshold: 10,
    requireEvidence: true,
  },
  retrieval: {
    backend: 'auto',
    vectorEnabled: false,
    gateThreshold: 0.35,
    recallLimit: 5,
  },
  curator: {
    enabled: true,
    scheduleTime: '09:30',
    consolidateEverySessions: 20,
    promoteMinHits: 2,
    episodeTtlDays: 14,
    archiveAfterDays: 90,
  },
  portability: {
    projections: { agentsMdPointer: true, skills: true },
    importOnFirstRun: true,
    syncTransport: 'none',
    syncConflictPolicy: 'ask',
  },
  privacy: {
    sensitiveTopics: true,
    piiScan: true,
    sharePii: false,
    auditKeepDays: 90,
  },
  toolSurface: 'standard',
  advanced: {
    snapshotKeep: 10,
    indexRebuildOnStart: false,
    shadowRetrieval: false,
  },
}

export interface Config extends MemoryConfig {}

// eslint-disable-next-line @typescript-eslint/no-require-imports
import Schema from '@deepseek-ai/schemastery'

const kindList = Schema.array(Schema.string()).default([...KINDS])

export const Config: Schema<MemoryConfig> = Schema.object({
  memoryRoot: Schema.string().default('').description('Empty = <dshHome>/memory (~/.dsh/memory). Point it at ~/.agents/memory only if you want other tools to read the raw files.'),

  budget: Schema.object({
    alwaysChars: Schema.number().default(DEFAULT_CONFIG.budget.alwaysChars).description('Hard cap of the always-on layer, in characters'),
    catalogChars: Schema.number().default(DEFAULT_CONFIG.budget.catalogChars).description('Hard cap of the L0 catalog layer, in characters'),
    recallChars: Schema.number().default(DEFAULT_CONFIG.budget.recallChars).description('Cap of a single memory_recall result'),
    globChars: Schema.number().default(DEFAULT_CONFIG.budget.globChars).description('Cap of glob-triggered dynamic injection'),
    maxShareOfRequest: Schema.number().default(DEFAULT_CONFIG.budget.maxShareOfRequest).description('Memory injection share of the whole request'),
    whiteboardChars: Schema.number().default(DEFAULT_CONFIG.budget.whiteboardChars),
  }).default({ ...DEFAULT_CONFIG.budget }),

  inject: Schema.object({
    enabled: Schema.boolean().default(true),
    fullEvery: Schema.number().default(20).description('Give the full catalog every N model requests'),
    slimEvery: Schema.number().default(8).description('Minimum gap between two slim snapshots'),
    showTurnTail: Schema.boolean().default(false).description('Show what was injected at the end of each turn'),
  }).default({ ...DEFAULT_CONFIG.inject }),

  ingest: Schema.object({
    writeMode: Schema.union(WRITE_MODES).default('suggest').description('suggest = ask before writing persona/feedback/preference'),
    autoKinds: kindList,
    suggestTimeoutSec: Schema.number().default(15),
    llmExtract: Schema.boolean().default(true),
    dailyLlmCalls: Schema.number().default(8),
    burstThreshold: Schema.number().default(10).description('Writes per hour before auto-ingest is paused (poisoning guard)'),
    requireEvidence: Schema.boolean().default(true).description('Drop LLM candidates without a quoted evidence span'),
  }).default({ ...DEFAULT_CONFIG.ingest, autoKinds: [...DEFAULT_CONFIG.ingest.autoKinds] }),

  retrieval: Schema.object({
    backend: Schema.union(RETRIEVAL_BACKENDS).default('auto'),
    vectorEnabled: Schema.boolean().default(false),
    gateThreshold: Schema.number().default(0.35).description('Below this score nothing is injected; dropped candidates are audited'),
    recallLimit: Schema.number().default(5),
  }).default({ ...DEFAULT_CONFIG.retrieval }),

  curator: Schema.object({
    enabled: Schema.boolean().default(true),
    scheduleTime: Schema.string().default('09:30'),
    consolidateEverySessions: Schema.number().default(20),
    promoteMinHits: Schema.number().default(2),
    episodeTtlDays: Schema.number().default(14),
    archiveAfterDays: Schema.number().default(90),
  }).default({ ...DEFAULT_CONFIG.curator }),

  portability: Schema.object({
    projections: Schema.dict(Schema.boolean()).default({ ...DEFAULT_CONFIG.portability.projections }),
    importOnFirstRun: Schema.boolean().default(true),
    syncTransport: Schema.union(SYNC_TRANSPORTS).default('none'),
    syncConflictPolicy: Schema.union(CONFLICT_POLICIES).default('ask'),
  }).default({
    projections: { ...DEFAULT_CONFIG.portability.projections },
    importOnFirstRun: true,
    syncTransport: 'none',
    syncConflictPolicy: 'ask',
  }),

  privacy: Schema.object({
    sensitiveTopics: Schema.boolean().default(true).description('true = never write sensitive-topic memories'),
    piiScan: Schema.boolean().default(true),
    sharePii: Schema.boolean().default(false),
    auditKeepDays: Schema.number().default(90),
  }).default({ ...DEFAULT_CONFIG.privacy }),

  toolSurface: Schema.union(TOOL_SURFACES).default('standard').description('minimal = 3 tools, standard = 6'),

  advanced: Schema.object({
    snapshotKeep: Schema.number().default(10),
    indexRebuildOnStart: Schema.boolean().default(false),
    shadowRetrieval: Schema.boolean().default(false),
  }).default({ ...DEFAULT_CONFIG.advanced }),
})

/** 供测试与 doctor 使用：确认默认值本身能通过 schema 校验 */
export const CONFIG_ENUMS = { KINDS, ACTIVATIONS, SOURCES, CONFIDENCES, SCOPES, SHAREABLE }
