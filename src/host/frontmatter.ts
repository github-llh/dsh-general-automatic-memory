import yaml from 'js-yaml'
import {
  ACTIVATIONS,
  CONFIDENCES,
  KINDS,
  SCOPES,
  SHAREABLE,
  SOURCES,
  checksumOf,
  normalizeBody,
  type Entry,
  type Frontmatter,
  type Kind,
} from './model.js'

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export class FrontmatterError extends Error {
  constructor(
    message: string,
    readonly field?: string,
  ) {
    super(message)
    this.name = 'FrontmatterError'
  }
}

export function splitDocument(text: string): { raw: string; body: string } {
  const match = FENCE.exec(text)
  if (!match) throw new FrontmatterError('missing YAML frontmatter (expected a leading --- block)')
  return { raw: (match[1] as string) ?? '', body: text.slice(match[0].length) }
}

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], field: string): T => {
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T
  throw new FrontmatterError(`${field} must be one of ${allowed.join('|')}, got ${JSON.stringify(value)}`, field)
}

const str = (value: unknown, field: string): string => {
  if (typeof value !== 'string') throw new FrontmatterError(`${field} must be a string`, field)
  return value
}

const strList = (value: unknown, field: string): string[] => {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw new FrontmatterError(`${field} must be an array`, field)
  return value.map((v, i) => {
    if (typeof v !== 'string') throw new FrontmatterError(`${field}[${i}] must be a string`, field)
    return v
  })
}

const nullableStr = (value: unknown, field: string): string | null => {
  if (value === undefined || value === null || value === '') return null
  return str(value, field)
}

const num = (value: unknown, field: string, fallback = 0): number => {
  if (value === undefined || value === null) return fallback
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new FrontmatterError(`${field} must be a finite number`, field)
  return value
}

const bool = (value: unknown, field: string, fallback = false): boolean => {
  if (value === undefined || value === null) return fallback
  if (typeof value !== 'boolean') throw new FrontmatterError(`${field} must be a boolean`, field)
  return value
}

const obj = (value: unknown, field: string): Record<string, unknown> => {
  if (value === undefined || value === null) return {}
  if (typeof value !== 'object' || Array.isArray(value)) throw new FrontmatterError(`${field} must be a mapping`, field)
  return value as Record<string, unknown>
}

/**
 * CORE_SCHEMA 只有 str/seq/map/bool/int/float/null：
 * ① 不会构造任意应用对象（用户可编辑文件必须按不可信输入处理）；
 * ② 裸日期保持字符串而不是被解析成 Date，序列化才不会漂移（原则 P4 的前提）。
 */
const YAML_SCHEMA = yaml.CORE_SCHEMA

/** js-yaml 在 CORE_SCHEMA 下只产出 string/number，number 分支是给导入数据里的 epoch 毫秒兜底。 */
function asIsoString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return new Date(value).toISOString()
  return ''
}

function asIsoDateOnly(value: unknown): string {
  return asIsoString(value).slice(0, 10)
}

export function parseFrontmatter(text: string, rel: string): Entry {
  const { raw, body } = splitDocument(text)
  let data: unknown
  try {
    data = yaml.load(raw, { schema: YAML_SCHEMA })
  } catch (cause) {
    throw new FrontmatterError(`invalid YAML in ${rel}: ${(cause as Error).message}`)
  }
  const f = obj(data, 'frontmatter')

  const id = str(f.id, 'id')
  if (!/^m_[0-9A-HJKMNP-TV-Z]{26}$/.test(id)) throw new FrontmatterError(`id must match m_<ULID>, got ${id}`, 'id')

  const kind = oneOf(f.kind, KINDS, 'kind') as Kind
  const scope = oneOf(f.scope, SCOPES, 'scope')
  const title = str(f.title, 'title')
  const summary = str(f.summary, 'summary')
  if (!title) throw new FrontmatterError('title must not be empty', 'title')
  if (!summary) throw new FrontmatterError('summary must not be empty (it is the only thing the catalog layer shows)', 'summary')
  if (title.includes('\n')) throw new FrontmatterError('title must be a single line', 'title')

  const provenance = obj(f.provenance, 'provenance')
  const temporal = obj(f.temporal, 'temporal')
  const stats = obj(f.stats, 'stats')
  const links = obj(f.links, 'links')
  const privacy = obj(f.privacy, 'privacy')

  const normalizedBody = normalizeBody(body)
  const meta: Frontmatter = {
    id,
    kind,
    title,
    summary,
    scope,
    ...(scope === 'project' ? { project: str(f.project, 'project') } : {}),
    tags: strList(f.tags, 'tags'),
    entities: strList(f.entities, 'entities'),
    activation: oneOf(f.activation, ACTIVATIONS, 'activation'),
    globs: strList(f.globs, 'globs'),
    confidence: oneOf(f.confidence, CONFIDENCES, 'confidence'),
    provenance: {
      source: oneOf(provenance.source, SOURCES, 'provenance.source'),
      createdAt: asIsoString(provenance.createdAt),
      createdBy: str(provenance.createdBy ?? 'dsh', 'provenance.createdBy'),
      ...(provenance.sessionId ? { sessionId: str(provenance.sessionId, 'provenance.sessionId') } : {}),
      ...(provenance.eventSeq !== undefined ? { eventSeq: num(provenance.eventSeq, 'provenance.eventSeq') } : {}),
      ...(provenance.origin ? { origin: str(provenance.origin, 'provenance.origin') } : {}),
      ...(provenance.importedFrom ? { importedFrom: str(provenance.importedFrom, 'provenance.importedFrom') } : {}),
    },
    temporal: {
      observedAt: asIsoDateOnly(temporal.observedAt),
      validFrom: asIsoDateOnly(temporal.validFrom),
      invalidatedAt: nullableStr(temporal.invalidatedAt, 'temporal.invalidatedAt'),
      supersededBy: nullableStr(temporal.supersededBy, 'temporal.supersededBy'),
      expiresAt: temporal.expiresAt ? asIsoDateOnly(temporal.expiresAt) : null,
    },
    stats: {
      revisions: num(stats.revisions, 'stats.revisions', 1),
      hits: num(stats.hits, 'stats.hits', 0),
      lastUsedAt: stats.lastUsedAt ? asIsoString(stats.lastUsedAt) : null,
      heat: num(stats.heat, 'stats.heat', 0),
    },
    links: {
      relates: strList(links.relates, 'links.relates'),
      derivedFrom: strList(links.derivedFrom, 'links.derivedFrom'),
      conflictsWith: strList(links.conflictsWith, 'links.conflictsWith'),
    },
    privacy: {
      pii: bool(privacy.pii, 'privacy.pii'),
      sensitive: bool(privacy.sensitive, 'privacy.sensitive'),
      shareable: oneOf(privacy.shareable ?? 'none', SHAREABLE, 'privacy.shareable'),
    },
    // checksum 以正文重算为准：解析时不信任文件里的值，交给 doctor 报告不一致
    checksum: checksumOf(normalizedBody),
  }

  if (meta.activation === 'glob' && meta.globs.length === 0) {
    throw new FrontmatterError('activation=glob requires at least one glob', 'globs')
  }
  if (meta.scope === 'project' && !meta.project) {
    throw new FrontmatterError('scope=project requires a project slug', 'project')
  }

  return { meta, body: normalizedBody, rel }
}
/**
 * 序列化。**键序固定**：注入文本与派生文件的逐字节幂等（原则 P4）依赖它。
 * 同一 entry 序列化两次必须得到完全相同的字节。
 */
export function serializeEntry(meta: Frontmatter, body: string): string {
  // 先规范化正文：checksum 与写出的字节必须覆盖**同一份**文本，否则每次往返都漂移
  const normalizedBody = normalizeBody(body)
  const doc: Record<string, unknown> = {
    id: meta.id,
    kind: meta.kind,
    title: meta.title,
    summary: meta.summary,
    scope: meta.scope,
  }
  if (meta.scope === 'project') doc.project = meta.project ?? ''
  doc.tags = meta.tags
  doc.entities = meta.entities
  doc.activation = meta.activation
  doc.globs = meta.globs
  doc.confidence = meta.confidence
  doc.provenance = {
    source: meta.provenance.source,
    createdAt: meta.provenance.createdAt,
    createdBy: meta.provenance.createdBy,
    ...(meta.provenance.sessionId ? { sessionId: meta.provenance.sessionId } : {}),
    ...(meta.provenance.eventSeq !== undefined ? { eventSeq: meta.provenance.eventSeq } : {}),
    ...(meta.provenance.origin ? { origin: meta.provenance.origin } : {}),
    ...(meta.provenance.importedFrom ? { importedFrom: meta.provenance.importedFrom } : {}),
  }
  doc.temporal = {
    observedAt: meta.temporal.observedAt,
    validFrom: meta.temporal.validFrom,
    invalidatedAt: meta.temporal.invalidatedAt,
    supersededBy: meta.temporal.supersededBy,
    expiresAt: meta.temporal.expiresAt,
  }
  doc.stats = {
    revisions: meta.stats.revisions,
    hits: meta.stats.hits,
    lastUsedAt: meta.stats.lastUsedAt,
    heat: meta.stats.heat,
  }
  doc.links = {
    relates: meta.links.relates,
    derivedFrom: meta.links.derivedFrom,
    conflictsWith: meta.links.conflictsWith,
  }
  doc.privacy = {
    pii: meta.privacy.pii,
    sensitive: meta.privacy.sensitive,
    shareable: meta.privacy.shareable,
  }
  doc.checksum = checksumOf(normalizedBody)

  const dumped = yaml.dump(doc, {
    schema: YAML_SCHEMA,
    sortKeys: false,
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
    noCompatMode: true,
  })
  return `---\n${dumped}---\n\n${normalizedBody}`
}
