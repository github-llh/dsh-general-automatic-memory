import {
  CONFIDENCE_WEIGHT,
  SOURCE_TRUST,
  computeHeat,
  type Entry,
} from './model.js'

const CJK_RANGE = /[\u3000-\u9fff\u3040-\u30ff\uac00-\ud7af]/
const LATIN_TOKEN = /[a-z0-9_]+/g

/**
 * 分词：拉丁按词，CJK 按「单字 + 相邻双字」。
 * 双字组是中文检索的关键——单字召回太宽（"记"命中一切），双字才有区分度。
 * 这与 dsh 官方 plugin-market 的 CJK 分词策略一致（重叠字符对 + 末字符，无词典）。
 */
export function tokenize(text: string): string[] {
  const lower = text.toLowerCase()
  const out: string[] = []
  for (const match of lower.matchAll(LATIN_TOKEN)) out.push(match[0])
  const cjkChars = [...lower].filter((ch) => CJK_RANGE.test(ch))
  let previous: string | undefined
  for (const ch of cjkChars) {
    out.push(ch)
    if (previous !== undefined) out.push(previous + ch)
    previous = ch
  }
  return out
}

export interface Corpus {
  /** id → token 集合 */
  docs: Map<string, Set<string>>
  /** token → 文档数 */
  df: Map<string, number>
  size: number
}

export function buildCorpus(entries: Entry[]): Corpus {
  const docs = new Map<string, Set<string>>()
  const df = new Map<string, number>()
  for (const entry of entries) {
    const tokens = tokenize(indexableText(entry))
    const set = new Set(tokens)
    docs.set(entry.meta.id, set)
    for (const token of set) df.set(token, (df.get(token) ?? 0) + 1)
  }
  return { docs, df, size: entries.length }
}

/** 参与检索的字段。正文权重最低——title/summary/tags/entities 才是召回的抓手。 */
function indexableText(entry: Entry): string {
  const m = entry.meta
  return [
    m.title,
    m.title,
    m.summary,
    m.summary,
    m.tags.join(' '),
    m.entities.join(' '),
    m.project ?? '',
    entry.body.slice(0, 400),
  ].join(' ')
}

/** BM25 的简化版：tf 饱和 + idf。零依赖、可解释、对小规模记忆足够。 */
export function lexicalScore(query: string, entryId: string, corpus: Corpus): number {
  const doc = corpus.docs.get(entryId)
  if (!doc || doc.size === 0 || corpus.size === 0) return 0
  const qTokens = new Set(tokenize(query))
  if (qTokens.size === 0) return 0
  let score = 0
  for (const token of qTokens) {
    if (!doc.has(token)) continue
    const n = corpus.df.get(token) ?? 1
    const idf = Math.log(1 + (corpus.size - n + 0.5) / (n + 0.5))
    score += idf
  }
  // 归一化到 0..1：除以「查询里所有 token 都命中且 idf 最大」的理论上限
  let max = 0
  for (const token of qTokens) {
    const n = corpus.df.get(token) ?? 0
    max += Math.log(1 + (corpus.size - n + 0.5) / (n + 0.5))
  }
  return max > 0 ? Math.min(1, score / max) : 0
}

export interface RankWeights {
  relevance?: number
  heat?: number
  confidence?: number
  sourceTrust?: number
  recency?: number
}

const DEFAULT_WEIGHTS: Required<RankWeights> = {
  relevance: 0.5,
  heat: 0.15,
  confidence: 0.15,
  sourceTrust: 0.15,
  recency: 0.05,
}

export interface Ranked {
  entry: Entry
  score: number
  parts: { relevance: number; heat: number; confidence: number; sourceTrust: number; recency: number }
  why: string
}

/**
 * 最终排序（docs/04 §7）。冲突条目降权但不隐藏——矛盾要能被看见才能被裁决。
 * 来源可信度是显式因子：web-content 只拿 0.2 的权重，这是防投毒的检索侧防线。
 */
export function rank(
  entries: Entry[],
  query: string,
  corpus: Corpus,
  weights: RankWeights = {},
  now: number = Date.now(),
): Ranked[] {
  const w = { ...DEFAULT_WEIGHTS, ...weights }
  const ranked: Ranked[] = []
  for (const entry of entries) {
    const m = entry.meta
    const relevance = query.trim() ? lexicalScore(query, m.id, corpus) : 0
    const heat = computeHeat({ hits: m.stats.hits, lastUsedAt: m.stats.lastUsedAt, now })
    const confidence = CONFIDENCE_WEIGHT[m.confidence]
    const sourceTrust = SOURCE_TRUST[m.provenance.source]
    const days = m.stats.lastUsedAt ? Math.max(0, (now - Date.parse(m.stats.lastUsedAt)) / 86_400_000) : 365
    const recency = Math.exp(-days / 90)
    const conflictPenalty = m.links.conflictsWith.length > 0 ? 0.1 : 0
    const score = Math.max(
      0,
      Math.min(
        1,
        w.relevance * relevance +
          w.heat * heat +
          w.confidence * confidence +
          w.sourceTrust * sourceTrust +
          w.recency * recency -
          conflictPenalty,
      ),
    )
    ranked.push({
      entry,
      score: Number(score.toFixed(4)),
      parts: {
        relevance: Number(relevance.toFixed(3)),
        heat: Number(heat.toFixed(3)),
        confidence,
        sourceTrust,
        recency: Number(recency.toFixed(3)),
      },
      why: explain(m, relevance, heat),
    })
  }
  // 确定性排序：分数 → id（原则 P4 要求同输入同输出）
  return ranked.sort((a, b) => (b.score !== a.score ? b.score - a.score : a.entry.meta.id < b.entry.meta.id ? -1 : 1))
}

function explain(m: Entry['meta'], relevance: number, heat: number): string {
  const bits: string[] = []
  if (relevance > 0) bits.push(`词法 ${relevance.toFixed(2)}`)
  if (heat > 0) bits.push(`热度 ${heat.toFixed(2)}`)
  bits.push(`来源 ${m.provenance.source}`)
  bits.push(`可信 ${m.confidence}`)
  return bits.join(' · ')
}
