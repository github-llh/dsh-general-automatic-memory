import type { Entry } from '../model.js'
import type { SearchHit } from '../api.js'
import type { Candidate } from './extract.js'

/**
 * 写入决策 ADD / UPDATE / INVALIDATE(/ADD) / NOOP。
 *
 * 抄 mem0 的两阶段管线：先检索相似旧记忆，再让决策把"重复"和"矛盾"消掉。
 * 这里用确定性规则而不是 LLM——可测试、零成本、可解释。LLM 版本的接入点留在最后。
 */
export type DecisionKind = 'ADD' | 'UPDATE' | 'INVALIDATE' | 'NOOP'

export interface Decision {
  kind: DecisionKind
  targetId?: string
  reason: string
  /** INVALIDATE 时一并写入的新条目（取代关系） */
  supersede?: boolean
}

/** 相似到这个程度基本是同一件事 */
const DUPLICATE_THRESHOLD = 0.9
/** 低于这个程度就不算"同一条记忆"，照常新增 */
const RELATED_THRESHOLD = 0.5

const CONTRADICTION = /(现在|改成|改为|不再是|已经(?:改|换|用)|换成|不再使用|废弃|instead|no longer|now (?:use|using|it'?s)|switched to)/i

const USER_AUTHORED = new Set(['user-stated', 'manual'])

export function decide(candidate: Candidate, similar: SearchHit[]): Decision {
  const best = similar[0]

  if (!best || best.parts.relevance < RELATED_THRESHOLD) {
    return { kind: 'ADD', reason: '没有相近的既有记忆' }
  }

  const target = best.entry
  const relevance = best.parts.relevance

  // 铁律：自动推断的条目永远不得覆盖用户显式写入或手工编辑过的条目
  if (USER_AUTHORED.has(target.meta.provenance.source) && !USER_AUTHORED.has(candidate.source)) {
    return {
      kind: 'NOOP',
      targetId: target.meta.id,
      reason: '既有条目由用户显式写入，自动推断不得覆盖（用户条目胜出）',
    }
  }

  if (relevance >= DUPLICATE_THRESHOLD) {
    if (sameBody(candidate.body, target.body)) {
      return { kind: 'NOOP', targetId: target.meta.id, reason: '已有等价条目，无需重复写入' }
    }
    return { kind: 'UPDATE', targetId: target.meta.id, reason: '同一事实的更完整版本，就地更新而不是并存' }
  }

  if (CONTRADICTION.test(`${candidate.title}\n${candidate.body}`)) {
    return {
      kind: 'INVALIDATE',
      targetId: target.meta.id,
      reason: '新表述与既有条目矛盾：旧条目标失效（可回溯），新条目另行写入',
      supersede: true,
    }
  }

  // 相近但不等价（例如同一实体的另一条事实）→ 并存，靠 links.relates 建关联
  return { kind: 'ADD', reason: '与既有条目相关但不等价，新增并建立关联', targetId: target.meta.id }
}

function sameBody(a: string, b: string): boolean {
  return normalize(a) === normalize(b)
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase()
}

/** 供面板/审计展示：把决策翻成人话 */
export function explainDecision(decision: Decision, target?: Entry): string {
  if (!target) return decision.reason
  return `${decision.reason}（目标：${target.meta.id}「${target.meta.title}」）`
}
