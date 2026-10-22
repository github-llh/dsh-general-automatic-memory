import type { MemoryService } from './api.js'
import { isoDate, type Entry, type MemoryConfig } from './model.js'

/**
 * 固化（sleep-time）。
 *
 * 读写权限分离：对话热路径只允许"追加候选"，合并/重写/降级只发生在这里。
 * 这样即使会话被注入，攻击者也改不动长期记忆的结构。
 *
 * 全部规则化、确定性、零 LLM：可测试、可解释、不会被模型幻觉带偏。
 * LLM 版合并作为后续增强，不阻塞主线。
 */
export interface CurateResult {
  expiredEpisodes: number
  promoted: number
  merged: number
  summariesRewritten: number
  demoted: number
  durationMs: number
}

export async function curate(api: MemoryService, config: MemoryConfig, opts: { now?: Date } = {}): Promise<CurateResult> {
  const started = Date.now()
  const now = opts.now ?? new Date()
  const result: CurateResult = {
    expiredEpisodes: 0,
    promoted: 0,
    merged: 0,
    summariesRewritten: 0,
    demoted: 0,
    durationMs: 0,
  }

  const slugs = await api.episodes.listProjects()

  // 1) episode 过期 → 归档（退出默认召回面，仍可检索）
  const cutoff = isoDate(new Date(now.getTime() - config.curator.episodeTtlDays * 86_400_000))
  for (const slug of slugs) {
    result.expiredEpisodes += await api.episodes.expire(slug, cutoff)
  }

  // 2) 重复出现的主题 → 晋升为一条项目记忆
  for (const slug of slugs) {
    const recent = await api.episodes.recent(slug, config.curator.episodeTtlDays, now)
    const byTopic = new Map<string, typeof recent>()
    for (const episode of recent) {
      if (episode.promoted !== null) continue
      if (!episode.topic || episode.topic === '(compaction summary)') continue
      const list = byTopic.get(episode.topic) ?? []
      list.push(episode)
      byTopic.set(episode.topic, list)
    }
    for (const [topic, episodes] of byTopic) {
      if (episodes.length < 2) continue
      const outcomes = episodes.map((episode) => episode.outcome).filter((text) => text.length > 0)
      if (outcomes.length === 0) continue
      const created = await api.create({
        kind: 'project',
        title: topic.slice(0, 40),
        summary: outcomes[0]!.slice(0, 120),
        body: [`## 反复出现的主题`, '', topic, '', '## 每次的结论', ...outcomes.map((text) => `- ${text}`), '', `来源：${episodes.length} 次会话，已由固化任务晋升。`].join('\n'),
        scope: 'project',
        project: slug,
        source: 'model-inferred',
        confidence: 'medium',
        activation: 'on_demand',
        createdBy: 'curator',
      })
      await api.episodes.markPromoted(slug, episodes.map((episode) => episode.id), created.meta.id, now)
      result.promoted++
    }
  }

  // 3) 近义条目合并（保留较长正文的那条，另一条失效归档）
  const consumed = new Set<string>()
  for (const entry of api.list()) {
    if (consumed.has(entry.meta.id) || entry.meta.temporal.invalidatedAt !== null) continue
    const hits = api.search(`${entry.meta.title} ${entry.meta.summary}`, { kind: entry.meta.kind, limit: 3, scope: 'all' })
    const other = hits.find(
      (hit) =>
        hit.entry.meta.id !== entry.meta.id &&
        !consumed.has(hit.entry.meta.id) &&
        hit.entry.meta.temporal.invalidatedAt === null &&
        hit.entry.meta.scope === entry.meta.scope &&
        hit.entry.meta.project === entry.meta.project &&
        hit.parts.relevance >= 0.9,
    )
    if (!other) continue
    const keep = entry.body.length >= other.entry.body.length ? entry : other.entry
    const drop = keep.meta.id === entry.meta.id ? other.entry : entry
    consumed.add(keep.meta.id)
    consumed.add(drop.meta.id)
    await api.mergeInto(keep.meta.id, {
      title: keep.meta.title,
      summary: keep.meta.summary,
      body: `${keep.body.trimEnd()}\n\n---\n\n${drop.body.trim()}`,
      reason: 'curator:merge-duplicate',
    })
    await api.invalidate(drop.meta.id, { reason: 'curator:merged-duplicate', supersededBy: keep.meta.id })
    result.merged++
  }

  // 4) 重写低质量 summary（它决定目录层能否召回这条记忆）
  for (const entry of api.list()) {
    if (entry.meta.temporal.invalidatedAt !== null) continue
    const current = entry.meta.summary
    if (current.length <= 120 && !current.endsWith('…')) continue
    const next = firstSentence(entry.body).slice(0, 120)
    if (!next || next === current) continue
    await api.store.patchMeta(entry.meta.id, (meta) => ({ ...meta, summary: next }))
    result.summariesRewritten++
  }

  // 5) 冷条目降级归档（热度低 + 够老），控制索引膨胀
  for (const entry of api.list()) {
    if (entry.meta.temporal.invalidatedAt !== null) continue
    const reference = entry.meta.stats.lastUsedAt ?? entry.meta.provenance.createdAt
    const ageDays = (now.getTime() - Date.parse(reference)) / 86_400_000
    if (entry.meta.stats.heat < 0.1 && ageDays > config.curator.archiveAfterDays) {
      await api.store.archive(entry.meta.id, now.toISOString())
      result.demoted++
    }
  }

  await api.refresh()
  result.durationMs = Date.now() - started
  await api.writeAudit('consolidate', { ...result })
  return result
}

function firstSentence(body: string): string {
  const firstLine = body.replace(/^#+\s.*$/gm, '').trim().split('\n')[0] ?? ''
  const sentence = firstLine.split(/(?<=[。！？.!?])\s*/)[0] ?? firstLine
  return sentence.replace(/^[-*]\s*/, '').trim()
}

/** 供面板展示的衍生指标 */
export function summariseEntries(entries: Entry[]): { active: number; invalidated: number; withConflicts: number; cold: number } {
  let active = 0
  let invalidated = 0
  let withConflicts = 0
  let cold = 0
  for (const entry of entries) {
    if (entry.meta.temporal.invalidatedAt !== null) invalidated++
    else {
      active++
      if (entry.meta.stats.heat < 0.1) cold++
    }
    if (entry.meta.links.conflictsWith.length > 0) withConflicts++
  }
  return { active, invalidated, withConflicts, cold }
}
