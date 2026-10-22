import path from 'node:path'
import { readTextFile, resolveInRoot, writeFileAtomic } from '../files.js'
import { isoNow, type MemoryConfig } from '../model.js'
import { DIRS } from '../paths.js'

interface PersistedState {
  date: string
  llmCalls: number
  lastRunByProject: Record<string, number>
  writeTimestamps: number[]
}

function emptyState(): PersistedState {
  // 每次都要新对象：浅拷贝会让 lastRunByProject 在多个实例间共享，
  // 多进程/多测试场景下直接串状态（冷却窗口会被别的实例写进去）。
  return { date: '', llmCalls: 0, lastRunByProject: {}, writeTimestamps: [] }
}

/**
 * 节流与预算。
 *
 * 三件事必须持久化（进程重启不能重置）：
 * 1. 同项目的冷却窗口（避免每轮都跑抽取）
 * 2. 每日 LLM 抽取调用数（钱）
 * 3. 最近一小时的写入时间戳（突增熔断 = 投毒信号）
 */
export class IngestQueue {
  private state: PersistedState = emptyState()
  private loaded = false

  constructor(
    private readonly root: string,
    private readonly config: MemoryConfig,
  ) {}

  private get file(): string {
    return resolveInRoot(this.root, path.posix.join(DIRS.cache, 'ingest.json'))
  }

  private async load(): Promise<void> {
    if (this.loaded) return
    this.loaded = true
    const text = await readTextFile(this.file)
    if (!text) return
    try {
      const parsed = JSON.parse(text) as Partial<PersistedState>
      this.state = {
        date: parsed.date ?? '',
        llmCalls: parsed.llmCalls ?? 0,
        lastRunByProject: parsed.lastRunByProject ?? {},
        writeTimestamps: parsed.writeTimestamps ?? [],
      }
    } catch {
      this.state = emptyState()
    }
  }

  private async save(): Promise<void> {
    const day = isoNow().slice(0, 10)
    if (this.state.date !== day) {
      this.state = { date: day, llmCalls: 0, lastRunByProject: this.state.lastRunByProject, writeTimestamps: this.state.writeTimestamps }
    }
    await writeFileAtomic(this.file, `${JSON.stringify(this.state, null, 2)}\n`)
  }

  /** 冷却窗口：同项目 `ingest.cooldownMinutes` 内只跑一次长记忆抽取（episode 不受限） */
  async canRun(project: string, cooldownMinutes = 30, now = Date.now()): Promise<{ ok: boolean; reason?: string }> {
    await this.load()
    const last = this.state.lastRunByProject[project] ?? 0
    if (now - last < cooldownMinutes * 60_000) return { ok: false, reason: 'cooldown' }
    return { ok: true }
  }

  async noteRun(project: string, now = Date.now()): Promise<void> {
    await this.load()
    this.state.lastRunByProject[project] = now
    await this.save()
  }

  async writesLastHour(now = Date.now()): Promise<number> {
    await this.load()
    return this.state.writeTimestamps.filter((ts) => now - ts < 3_600_000).length
  }

  async noteWrite(now = Date.now()): Promise<void> {
    await this.load()
    this.state.writeTimestamps = [...this.state.writeTimestamps.filter((ts) => now - ts < 3_600_000), now]
    await this.save()
  }

  /** 每日 LLM 预算；返回 false 表示今天不能再调 */
  async consumeLlm(now = Date.now()): Promise<boolean> {
    await this.load()
    const day = new Date(now).toISOString().slice(0, 10)
    if (this.state.date !== day) {
      this.state.date = day
      this.state.llmCalls = 0
    }
    if (this.state.llmCalls >= this.config.ingest.dailyLlmCalls) return false
    this.state.llmCalls++
    await this.save()
    return true
  }

  async llmUsage(): Promise<{ used: number; cap: number }> {
    await this.load()
    const day = isoNow().slice(0, 10)
    return { used: this.state.date === day ? this.state.llmCalls : 0, cap: this.config.ingest.dailyLlmCalls }
  }
}
