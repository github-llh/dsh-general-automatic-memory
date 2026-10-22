import { isoNow, ulid } from '../model.js'
import type { Candidate } from './extract.js'
import type { Decision } from './decide.js'

/**
 * `writeMode: suggest` 的待确认队列。
 *
 * 刻意**只放内存**：这些是"提议"而不是数据，插件重启后消失是正确语义——
 * 不能让一个三天前的提议在下次启动时突然弹出来写进记忆。
 */
export interface PendingWrite {
  id: string
  candidate: Candidate
  decision: Decision
  project?: string
  createdAt: string
  expiresAt: number
}

export class PendingStore {
  private items = new Map<string, PendingWrite>()

  constructor(private readonly timeoutSec: number) {}

  add(candidate: Candidate, decision: Decision, project?: string, now = Date.now()): PendingWrite {
    const item: PendingWrite = {
      id: `p_${ulid().slice(2)}`,
      candidate,
      decision,
      ...(project ? { project } : {}),
      createdAt: isoNow(new Date(now)),
      expiresAt: now + this.timeoutSec * 1000,
    }
    this.items.set(item.id, item)
    return item
  }

  list(now = Date.now()): PendingWrite[] {
    return [...this.items.values()].filter((item) => item.expiresAt > now).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }

  get(id: string): PendingWrite | undefined {
    return this.items.get(id)
  }

  take(id: string): PendingWrite | undefined {
    const item = this.items.get(id)
    if (item) this.items.delete(id)
    return item
  }

  /** 15 秒没操作自动收起为静默 NOOP —— 绝不因为用户没点就偷偷写 */
  sweep(now = Date.now()): PendingWrite[] {
    const expired: PendingWrite[] = []
    for (const [id, item] of this.items) {
      if (item.expiresAt <= now) {
        expired.push(item)
        this.items.delete(id)
      }
    }
    return expired
  }

  clear(): void {
    this.items.clear()
  }

  get size(): number {
    return this.items.size
  }
}
