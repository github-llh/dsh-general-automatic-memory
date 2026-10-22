import type { HostContext } from '../types.js'
import type { Candidate } from './extract.js'

/** 与 dsh-llm 的 StreamChunk 子集对齐：文本增量是 text-delta */
interface LlmChunk {
  type?: string
  text?: string
  kind?: string
}

type ModelTarget = { provider: string; model: string }

interface LlmService {
  stream?: (request: unknown) => AsyncIterable<LlmChunk> | Promise<AsyncIterable<LlmChunk>>
}

interface DefaultModelService {
  currentSelection?: () => { provider?: unknown; model?: unknown } | undefined
}

/**
 * LLM 兜底抽取。
 *
 * `ctx.llm.stream()` 的真实契约（0.2.1-rc.2 核对）：
 *  - 必须显式给 provider/model；优先用本会话的 model/selection，其次 agentDefaultModel
 *  - 文本增量是 `{ type: 'text-delta', text }`
 *  - 结束块是 `{ type: 'finish', kind: 'error' | 'aborted' }` 或成功 finish
 *
 * 只在规则层一个都没抽到时才调用；8 秒硬超时；异常吞掉，不打断会话。
 */
export async function extractWithLlm(
  ctx: HostContext,
  transcript: string,
  canSpend: () => Promise<boolean>,
  sessionModel?: ModelTarget,
): Promise<Candidate[]> {
  const llm = ctx.get('llm') as LlmService | undefined
  if (!llm?.stream) return []
  const target = resolveTarget(ctx, sessionModel)
  if (!target) return []
  if (transcript.trim().length < 80) return []
  if (!(await canSpend())) return []

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const request = {
      provider: target.provider,
      model: target.model,
      // RequestUserInput 只能是 user 角色；system 指令与转录合并成一条 user 文本
      messages: [{
        role: 'user',
        content: [{ type: 'text', text: `${EXTRACTION_SYSTEM}\n\n---\n\nConversation:\n${transcript.slice(0, 6000)}` }],
      }],
      maxTokens: 800,
      signal: controller.signal,
    }
    const stream = await llm.stream(request)
    const chunks: string[] = []
    let failed = false
    for await (const chunk of stream) {
      if ((chunk?.type === 'text-delta' || chunk?.type === 'text') && typeof chunk.text === 'string') chunks.push(chunk.text)
      if (chunk?.type === 'finish' && (chunk.kind === 'error' || chunk.kind === 'aborted')) failed = true
      if (chunks.join('').length > 8000) break
    }
    return failed ? [] : parseCandidates(chunks.join(''))
  } catch (cause) {
    ctx.logger?.warn?.(`[general-memory] llm extraction skipped: ${(cause as Error).message}`)
    return []
  } finally {
    clearTimeout(timer)
  }
}

function resolveTarget(ctx: HostContext, sessionModel?: ModelTarget): ModelTarget | undefined {
  if (sessionModel?.provider && sessionModel.model) return sessionModel
  const selector = ctx.get('agentDefaultModel') as DefaultModelService | undefined
  const current = selector?.currentSelection?.()
  if (typeof current?.provider === 'string' && typeof current.model === 'string' && current.provider && current.model) {
    return { provider: current.provider, model: current.model }
  }
  return undefined
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
