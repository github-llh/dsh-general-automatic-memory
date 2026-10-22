import type { Activation, Confidence, Kind, Source } from '../model.js'

/**
 * 规则层抽取（零 token、高精度、宁可漏不可错）。
 *
 * 只从**用户消息**里抽：助手输出可以重新推导，用户输入才携带偏好信号。
 * 唯一的例外是"确认句式"——用户对某个非常规做法的肯定同样是重要信号。
 *
 * LLM 兜底在 llm-extract.ts，两层结果合流后走同一套门控与决策。
 */
export interface Candidate {
  kind: Kind
  title: string
  summary: string
  body: string
  entities?: string[]
  tags?: string[]
  activation?: Activation
  /** 作用域由调用方决定（知道当前项目 slug），抽取层不猜 */
  scope?: 'global' | 'project'
  source: Source
  confidence: Confidence
  /** 原文引用（≤80 字）。没有 evidence 的候选一律丢弃 —— 防幻觉记忆 */
  evidence: string
  reason: string
  /** 导入来源的原始路径（写进 provenance.importedFrom） */
  importedFrom?: string
}

const MAX_TITLE = 40
const MAX_SUMMARY = 120
const MAX_EVIDENCE = 80

interface Rule {
  kind: Kind
  pattern: RegExp
  reason: string
  source?: Source
  confidence?: Confidence
  activation?: Activation
  entities?: (text: string, match: RegExpMatchArray) => string[]
}

const RULES: Rule[] = [
  {
    kind: 'feedback',
    // 显式记忆指令 + 纠正句式
    pattern: /(记住|记一下|记下|以后都|以后不要|以后别|别再|不要再|不要总|我说过|不是这样|不应该|remember (?:that )?|keep in mind|from now on|stop doing|don'?t )/i,
    reason: '显式记忆/纠正指令',
    source: 'user-stated',
    confidence: 'high',
    activation: 'always',
  },
  {
    kind: 'feedback',
    // 正向确认：用户接受了某个非常规做法（这类信号最容易被忽略）
    pattern: /(对[，,]?\s*就这样|完全正确|没错就是这样|perfect[,!.]?\s*(keep|continue)|exactly|keep doing that|就这么办)/i,
    reason: '用户确认了某种做法',
    source: 'user-stated',
    confidence: 'medium',
  },
  {
    kind: 'persona',
    pattern: /(我是|我负责|我主要|我做.{0,6}年|我的角色|i'?m a |i am a |my role is)/i,
    reason: '身份陈述',
    source: 'user-stated',
    confidence: 'medium',
  },
  {
    kind: 'project',
    pattern: /(决定用|决定采用|我们选|定了|改用|换成|用.{1,24}(?:而不是|不用|替代)|we (?:decided|chose|went with))/i,
    reason: '技术/产品决策',
    source: 'user-stated',
    confidence: 'medium',
    activation: 'on_demand',
  },
  {
    kind: 'reference',
    pattern: /https?:\/\/\S+/i,
    reason: '外部系统地址',
    source: 'user-stated',
    confidence: 'medium',
  },
]

const RELATION_RULES: Array<{ rel: string; pattern: RegExp }> = [
  { rel: '负责', pattern: /([\u4e00-\u9fa5A-Za-z0-9_.-]{1,12})\s*负责(?:着)?\s*([\u4e00-\u9fa5A-Za-z0-9_.-]{1,20})/ },
  { rel: '依赖', pattern: /([\u4e00-\u9fa5A-Za-z0-9_.-]{1,20})\s*依赖(?:于)?\s*([\u4e00-\u9fa5A-Za-z0-9_.-]{1,20})/ },
  { rel: '属于', pattern: /([\u4e00-\u9fa5A-Za-z0-9_.-]{1,20})\s*属于\s*([\u4e00-\u9fa5A-Za-z0-9_.-]{1,20})/ },
  { rel: '汇报给', pattern: /([\u4e00-\u9fa5]{2,4})\s*向\s*([\u4e00-\u9fa5]{2,4})\s*汇报/ },
]

/** 从消息内容数组里取纯文本（跳过 reasoning 块） */
export function collectText(message: unknown): string {
  if (typeof message === 'string') return message.trim()
  if (!message || typeof message !== 'object') return ''
  const content = (message as { content?: unknown }).content
  if (typeof content === 'string') return content.trim()
  if (!Array.isArray(content)) return ''
  const parts: string[] = []
  for (const block of content) {
    if (block && typeof block === 'object' && (block as { type?: string }).type === 'text') {
      const text = (block as { text?: unknown }).text
      if (typeof text === 'string') parts.push(text)
    }
  }
  return parts.join('\n').trim()
}

/** 结论行：助手回复的最后一段纯文本的第一句，≤200 字 */
export function conclusionOf(message: unknown): string {
  const text = collectText(message)
  if (!text) return ''
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const last = paragraphs[paragraphs.length - 1] ?? ''
  const firstSentence = last.split(/(?<=[。！？.!?])\s*/)[0] ?? last
  return firstSentence.trim().slice(0, 200)
}

export function extractFromTurn(input: { userMessages: string[]; now?: Date }): Candidate[] {
  const out: Candidate[] = []
  const seen = new Set<string>()
  for (const raw of input.userMessages) {
    const text = normalizeDates(raw, input.now ?? new Date()).trim()
    if (text.length < 4) continue

    for (const rule of RULES) {
      const match = text.match(rule.pattern)
      if (!match) continue
      // reference 规则要求地址 + 语境词，否则任何带链接的闲聊都会被记下来
      if (rule.kind === 'reference' && !/(看板|文档|仪表盘|dashboard|oncall|wiki|文档站|监控|日志)/i.test(text)) continue
      const title = deriveTitle(text)
      const key = `${rule.kind}:${title}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({
        kind: rule.kind,
        title,
        summary: clip(text, MAX_SUMMARY),
        body: buildBody(text, rule.kind),
        tags: deriveTags(text),
        activation: rule.activation,
        source: rule.source ?? 'user-stated',
        confidence: rule.confidence ?? 'medium',
        evidence: clip(match[0], MAX_EVIDENCE),
        reason: rule.reason,
      })
      break
    }

    // 关系三元组独立于单值规则：一句话可以既是决策又是关系
    for (const relation of RELATION_RULES) {
      const match = text.match(relation.pattern)
      if (!match) continue
      const [, from, to] = match
      if (!from || !to) continue
      const title = `${from} ${relation.rel} ${to}`
      if (seen.has(`relations:${title}`)) continue
      seen.add(`relations:${title}`)
      out.push({
        kind: 'relations',
        title: clip(title, MAX_TITLE),
        summary: clip(text, MAX_SUMMARY),
        body: `- ${from} ${relation.rel} ${to}\n\n依据：${clip(text, 240)}`,
        entities: [from, to],
        tags: ['relation', relation.rel],
        activation: 'on_demand',
        source: 'user-stated',
        confidence: 'medium',
        evidence: clip(match[0], MAX_EVIDENCE),
        reason: `关系陈述（${relation.rel}）`,
      })
    }
  }
  return out
}

/** feedback 强制三段式：规则 / Why / How to apply（docs/03 §2） */
function buildBody(text: string, kind: Kind): string {
  if (kind !== 'feedback') return text
  const hasReason = /因为|由于|原因是|否则|because/i.test(text)
  const why = hasReason ? '' : '**Why:** （用户未说明；之后补充时请更新本条）'
  return [text, why, '**How to apply:** 该场景出现时先按本条执行；与后续用户指令冲突时以最新指令为准。']
    .filter((part) => part.length > 0)
    .join('\n\n')
}

function deriveTitle(text: string): string {
  const firstLine = text.split('\n')[0] ?? text
  const sentence = firstLine.split(/(?<=[。！？.!?])\s*/)[0] ?? firstLine
  const cleaned = sentence.replace(/^(请|麻烦|帮我|能不能|可以)?\s*(记住|记一下|记下)[：:，,\s]*/i, '').trim()
  return clip(cleaned.length > 0 ? cleaned : sentence, MAX_TITLE)
}

function deriveTags(text: string): string[] {
  const tags: string[] = []
  if (/(代码|code|提交|commit|pr|diff)/i.test(text)) tags.push('code')
  if (/(测试|test|spec)/i.test(text)) tags.push('testing')
  if (/(部署|deploy|上线|release)/i.test(text)) tags.push('deploy')
  if (/(安全|security|权限|auth|鉴权)/i.test(text)) tags.push('security')
  if (/(文档|doc|readme)/i.test(text)) tags.push('docs')
  return tags
}

/** 相对日期必须转绝对，否则记忆过期后无法解释（docs/05 §2.1） */
export function normalizeDates(text: string, now: Date): string {
  const weekday = ['日', '一', '二', '三', '四', '五', '六']
  const day = 86_400_000
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  let out = text
  out = out.replace(/今天/g, fmt(now))
  out = out.replace(/明天/g, fmt(new Date(now.getTime() + day)))
  out = out.replace(/后天/g, fmt(new Date(now.getTime() + 2 * day)))
  out = out.replace(/昨天/g, fmt(new Date(now.getTime() - day)))
  out = out.replace(/下周([一二三四五六日天])/g, (_, d: string) => {
    const target = d === '天' ? 0 : weekday.indexOf(d)
    // "下周一" = 下一个周一（周三说"下周一"指的是 5 天后，不是 12 天后）
    const delta = ((target - now.getDay() + 7) % 7) || 7
    return fmt(new Date(now.getTime() + delta * day))
  })
  out = out.replace(/(?:本周|这周|周)([一二三四五六日天])/g, (_, d: string) => {
    const target = d === '天' ? 0 : weekday.indexOf(d)
    const delta = (target - now.getDay() + 7) % 7
    return fmt(new Date(now.getTime() + delta * day))
  })
  return out
}

function clip(text: string, max: number): string {
  const single = text.replace(/\s+/g, ' ').trim()
  return single.length > max ? `${single.slice(0, max - 1)}…` : single
}
