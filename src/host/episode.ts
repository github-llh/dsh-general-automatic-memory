import path from 'node:path'
import { appendLine, readTextFile, resolveInRoot, writeFileAtomic } from './files.js'
import { isoNow, ulid } from './model.js'
import { DIRS } from './paths.js'

/**
 * 情景层（episode）。
 *
 * 它是唯一允许 `tool-output` / `web-content` 直接落地的层 —— 也是防记忆投毒的最后一道
 * 缓冲：不可信来源先落这里，要变成长期记忆必须经过用户批准或热度晋升。
 *
 * 格式对标 ChatGPT 的 Recent Conversation Content：**只留用户消息 + 一行结论，丢掉助手长回复**。
 * 助手输出可以重新推导，用户输入才携带偏好信号。
 */
export interface Episode {
  v: 1
  id: string
  sid: string
  turn: number
  ts: string
  topic: string
  user: string
  outcome: string
  src: 'user' | 'tool-output' | 'web-content' | 'model-inferred'
  promoted: string | null
}

export const EPISODE_DAILY_CAP = 256
export const EPISODE_USER_CHARS = 200
export const EPISODE_OUTCOME_CHARS = 120

export class EpisodeStore {
  constructor(private readonly root: string) {}

  private rel(slug: string, date: string): string {
    return path.posix.join(DIRS.projects, slug, 'episodes', `${date}.jsonl`)
  }

  async append(
    slug: string,
    input: Omit<Episode, 'v' | 'id' | 'ts' | 'promoted'> & { ts?: string },
  ): Promise<Episode> {
    const ts = input.ts ?? isoNow()
    const episode: Episode = {
      v: 1,
      id: `e_${ulid().slice(2)}`,
      sid: input.sid,
      turn: input.turn,
      ts,
      topic: clip(input.topic, 80),
      user: clip(input.user, EPISODE_USER_CHARS),
      outcome: clip(input.outcome, EPISODE_OUTCOME_CHARS),
      src: input.src,
      promoted: null,
    }
    const rel = this.rel(slug, ts.slice(0, 10))
    const abs = resolveInRoot(this.root, rel)
    const existing = (await readTextFile(abs)) ?? ''
    const lines = existing.split('\n').filter((line) => line.trim().length > 0)
    // 单日上限：FIFO 淘汰最旧的，而不是拒绝写入（今天的上下文比昨天的更有价值）
    const kept = lines.length >= EPISODE_DAILY_CAP ? lines.slice(lines.length - EPISODE_DAILY_CAP + 1) : lines
    const next = `${[...kept, JSON.stringify(episode)].join('\n')}\n`
    if (lines.length >= EPISODE_DAILY_CAP) await writeFileAtomic(abs, next)
    else await appendLine(abs, JSON.stringify(episode))
    return episode
  }

  async listDay(slug: string, date: string): Promise<Episode[]> {
    const text = await readTextFile(resolveInRoot(this.root, this.rel(slug, date)))
    return parseLines(text)
  }

  /** 最近 N 天（含今天），按时间正序 */
  async recent(slug: string, days: number, now: Date = new Date()): Promise<Episode[]> {
    const out: Episode[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 86_400_000).toISOString().slice(0, 10)
      out.push(...(await this.listDay(slug, date)))
    }
    return out.sort((a, b) => (a.ts < b.ts ? -1 : 1))
  }

  /** 过期行移到 archive/episodes/<yyyy-mm>.jsonl，退出默认召回面但可检索 */
  async expire(slug: string, beforeDate: string): Promise<number> {
    let moved = 0
    const dir = path.posix.join(DIRS.projects, slug, 'episodes')
    const abs = resolveInRoot(this.root, dir)
    let names: string[] = []
    try {
      const { readdir } = await import('node:fs/promises')
      names = (await readdir(abs)).filter((n) => n.endsWith('.jsonl')).sort()
    } catch {
      return 0
    }
    for (const name of names) {
      const date = name.replace(/\.jsonl$/, '')
      if (date >= beforeDate) continue
      const episodes = await this.listDay(slug, date)
      if (episodes.length === 0) continue
      const archiveRel = path.posix.join(DIRS.archive, 'episodes', `${slug}-${date}.jsonl`)
      const archiveAbs = resolveInRoot(this.root, archiveRel)
      const existing = (await readTextFile(archiveAbs)) ?? ''
      const merged = [existing.trimEnd(), ...episodes.map((e) => JSON.stringify(e))].filter(Boolean).join('\n')
      await writeFileAtomic(archiveAbs, `${merged}\n`)
      const { rm } = await import('node:fs/promises')
      await rm(resolveInRoot(this.root, this.rel(slug, date)), { force: true })
      moved += episodes.length
    }
    return moved
  }
}

function parseLines(text: string | null): Episode[] {
  if (!text) return []
  const out: Episode[] = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    try {
      const parsed = JSON.parse(line) as Episode
      if (parsed && parsed.v === 1) out.push(parsed)
    } catch {
      // 坏行跳过：episode 是辅助层，不值得为一行坏数据让整个召回失败
    }
  }
  return out
}

function clip(text: string, max: number): string {
  const single = text.replace(/\s+/g, ' ').trim()
  return single.length > max ? `${single.slice(0, max - 1)}…` : single
}
