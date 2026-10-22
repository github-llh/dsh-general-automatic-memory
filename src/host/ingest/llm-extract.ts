import type { HostContext } from '../types.js'
import type { Candidate } from './extract.js'

/**
 * LLM 兜底抽取。
 *
 * ⚠️ **契约未在真机验证**：`ctx.llm.stream()` 的入参形状来自 `dsh-llm` README 的散文描述，
 * 不是类型定义（dsh 的业务包不随包附带 .d.ts）。因此这里：
 *  - 只在规则层一个都没抽到时才调用（省钱、少踩坑）
 *  - 8 秒硬超时，超时即放弃
 *  - 任何异常都吞掉并只记一次日志，绝不打断会话
 *  - 强制 evidence：没有原文引用的候选一律丢弃（防幻觉记忆）
 * 首次真机冒烟时必须优先复核这条路径；在那之前它只是"尽力而为的增强"。
 */
export async function extractWithLlm(ctx: HostContext, transcript: string, canSpend: () => Promise<boolean>): Promise<Candidate[]> {
  const llm = ctx.get('llm') as
    | { stream?: (request: unknown) => AsyncIterable<{ type?: string; text?: string }> | Promise<AsyncIterable<{ type?: string; text?: string }>> }
    | undefined
  if (!llm?.stream) return []
  if (transcript.trim().length < 80) return []
  if (!(await canSpend())) return []

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const request = {
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM },
        { role: 'user', content: transcript.slice(0, 6000) },
      ],
      signal: controller.signal,
      maxTokens: 800,
    }
    const stream = await llm.stream(request)
    const chunks: string[] = []
    for await (const chunk of stream) {
      if (chunk?.type === 'text' && typeof chunk.text === 'string') chunks.push(chunk.text)
      if (chunks.join('').length > 8000) break
    }
    return parseCandidates(chunks.join(''))
  } catch (cause) {
    ctx.logger?.warn?.(`[general-memory] llm extraction skipped: ${(cause as Error).message}`)
    return []
  } finally {
    clearTimeout(timer)
  }
}

const EXTRACTION_SYSTEM = `You extract long-term memory candidates from an agent conversation.
Output ONLY a JSON array (no prose, no code fence). Each item:
{"kind":"persona|preference|feedback|relations|project|reference","title":"<=40 chars","summary":"<=120 chars, this is the only text shown in a catalog","body":"markdown","entities":["..."],"evidence":"exact quote from the user message, <=80 chars","confidence":"high|medium|low"}
Rules:
- Only facts that will still matter weeks later. No transient state.
- feedback must be a rule for how the agent should work, with a Why when the user gave one.
- relations require exactly two entities (from, to).
- Drop anything without a verbatim evidence quote.
- Return [] when nothing qualifies.`

function parseCandidates(raw: string): Candidate[] {
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start < 0 || end <= start) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw.slice(start, end + 1))
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  const out: Candidate[] = []
  for (const item of parsed.slice(0, 8)) {
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const kind = String(record.kind ?? '')
    const title = String(record.title ?? '').trim()
    const summary = String(record.summary ?? '').trim()
    const body = String(record.body ?? '').trim()
    const evidence = String(record.evidence ?? '').trim()
    if (!['persona', 'preference', 'feedback', 'relations', 'project', 'reference'].includes(kind)) continue
    if (!title || !summary || !body || !evidence) continue
    const entities = Array.isArray(record.entities) ? record.entities.map(String) : []
    if (kind === 'relations' && entities.length < 2) continue
    out.push({
      kind: kind as Candidate['kind'],
      title: title.slice(0, 40),
      summary: summary.slice(0, 120),
      body,
      entities,
      source: 'model-inferred',
      confidence: record.confidence === 'high' ? 'medium' : 'low',
      evidence: evidence.slice(0, 80),
      reason: 'LLM 抽取（带原文引用）',
    })
  }
  return out
}
