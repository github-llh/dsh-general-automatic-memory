import type { MemoryConfig, Source } from '../model.js'
import type { Candidate } from './extract.js'

/**
 * 写入门控（docs/09 §3–4）。五层防护里最硬的一道，作用在**数据模型入口**而不是事后清理。
 *
 * 顺序很重要：先拦密钥（硬拒绝）→ 再判敏感话题（不记）→ 再标 PII（记但不可共享）
 * → 最后判来源层级（不可信来源只能进 episode）。
 */
export interface GateVerdict {
  allow: boolean
  reason?: string
  pii: boolean
  sensitive: boolean
  shareable: 'team' | 'none'
  /** 被降级的来源：tool-output / web-content 只能留在 episode 层 */
  longTermAllowed: boolean
}

const SECRET_PATTERNS: RegExp[] = [
  /\bsk-[A-Za-z0-9]{16,}\b/, // OpenAI / Anthropic 风格
  /\bghp_[A-Za-z0-9]{20,}\b/, // GitHub PAT
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/, // AWS
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, // Slack
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/, // JWT
  /\b(?:password|passwd|api[_-]?key|secret|token)\s*[=:]\s*\S{6,}/i,
]

const PII_PATTERNS: RegExp[] = [
  /\b1[3-9]\d{9}\b/, // 中国手机号
  /\b\d{17}[\dXx]\b/, // 身份证
  /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/, // 邮箱
  /\b(?:\d[ -]?){13,19}\b/, // 银行卡
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/, // IP
]

const SENSITIVE_PATTERNS: RegExp[] = [
  /(抑郁症|焦虑症|双相|精神|心理疾病|病史|诊断|用药|怀孕|流产|性取向|性生活|宗教|信仰|洗礼|政治立场|党派|选举|诉讼|判决|犯罪记录|未成年)/,
  /(depress|anxiety|bipolar|diagnos|medication|pregnan|sexual|religio|political|law ?suit|conviction)/i,
]

/** 密钥是硬拒绝：连审计里都不记内容，只记"拦了一次密钥写入" */
export function scanSecrets(text: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(text))
}

export function scanPii(text: string): boolean {
  return PII_PATTERNS.some((pattern) => pattern.test(text))
}

export function isSensitiveTopic(text: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text))
}

/** 不可信来源只能进 episode 层（晋升需用户批准或热度，见 docs/05 §3） */
export const LONG_TERM_SOURCES: ReadonlySet<Source> = new Set<Source>([
  'user-stated',
  'manual',
  'imported',
  'model-inferred',
  'team',
])

export function gateCandidate(
  candidate: Candidate,
  config: MemoryConfig,
  counters: { writesLastHour: number },
): GateVerdict {
  const text = `${candidate.title}\n${candidate.summary}\n${candidate.body}\n${candidate.evidence}`

  if (scanSecrets(text)) {
    return { allow: false, reason: 'secret-detected', pii: false, sensitive: false, shareable: 'none', longTermAllowed: false }
  }
  if (config.privacy.sensitiveTopics && isSensitiveTopic(text)) {
    return { allow: false, reason: 'sensitive-topic', pii: false, sensitive: true, shareable: 'none', longTermAllowed: false }
  }
  if (candidate.evidence.trim().length === 0 && config.ingest.requireEvidence) {
    return { allow: false, reason: 'missing-evidence', pii: false, sensitive: false, shareable: 'none', longTermAllowed: false }
  }
  if (counters.writesLastHour >= config.ingest.burstThreshold) {
    return { allow: false, reason: 'burst-circuit-breaker', pii: false, sensitive: false, shareable: 'none', longTermAllowed: false }
  }

  const pii = config.privacy.piiScan && scanPii(text)
  return {
    allow: true,
    pii,
    sensitive: false,
    // PII 条目永不进团队同步与仓库投影（默认 sharePii=false）
    shareable: pii ? 'none' : 'team',
    longTermAllowed: LONG_TERM_SOURCES.has(candidate.source),
  }
}
