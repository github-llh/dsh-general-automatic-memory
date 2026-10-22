import { ulid, type MemoryConfig } from '../model.js'
import type { MemoryService } from '../api.js'
import type { Ingestor } from '../ingest/index.js'
import type { Candidate } from '../ingest/extract.js'
import { createSnapshot } from '../snapshot.js'
import { CONVERSATION_SOURCES } from './conversation.js'
import { MEMORY_SOURCES } from './memory.js'
import type { ImportItem, ImportSourceId, ScanReport, SourceDescriptor } from './types.js'

export const ALL_SOURCES: SourceDescriptor[] = [...MEMORY_SOURCES, ...CONVERSATION_SOURCES]

export interface SourceStatus {
  id: ImportSourceId
  label: string
  kind: 'memory' | 'conversation'
  detected: string[]
}

export interface ApplyReport {
  scanId: string
  source: ImportSourceId
  added: number
  updated: number
  invalidated: number
  noop: number
  rejected: number
  snapshot: string
  details: Array<{ key: string; title: string; outcome: string; reason?: string }>
}

/**
 * 导入服务：扫描 → dry-run 预检 → 用户勾选 → 落盘。
 *
 * 两条铁律：
 * 1. **绝不"一键导入然后祈祷"** —— 必须给出可核对的预检报告（新增/合并/已有/PII/预算影响）
 * 2. 落盘前**先做快照**（导入是批量操作，必须可回滚）
 */
export class ImportService {
  private scans = new Map<string, { source: ImportSourceId; items: ImportItem[] }>()

  constructor(
    private readonly api: MemoryService,
    private readonly ingestor: Ingestor,
    private readonly config: MemoryConfig,
  ) {}

  /** 列出全部来源与检测结果（面板的来源卡片） */
  async sources(cwd = process.cwd()): Promise<SourceStatus[]> {
    const out: SourceStatus[] = []
    for (const source of ALL_SOURCES) {
      let detected: string[] = []
      try {
        detected = await source.detect(cwd)
      } catch {
        detected = []
      }
      out.push({ id: source.id, label: source.label, kind: source.kind, detected })
    }
    return out
  }

  async scan(
    sourceId: ImportSourceId,
    opts: { cwd?: string; path?: string; limit?: number; maxTurns?: number } = {},
  ): Promise<ScanReport> {
    const source = ALL_SOURCES.find((candidate) => candidate.id === sourceId)
    if (!source) throw new Error(`unknown import source: ${sourceId}`)
    const limit = Math.min(Math.max(opts.limit ?? 200, 1), 500)
    const { items, skipped } = await source.scan(opts.cwd ?? process.cwd(), {
      limit,
      ...(opts.path ? { path: opts.path } : {}),
      ...(opts.maxTurns ? { maxTurns: opts.maxTurns } : {}),
      excludeRoot: this.api.root,
    })

    let added = 0
    let merged = 0
    let duplicate = 0
    let alreadyImported = 0
    let pii = 0
    const fresh: ImportItem[] = []
    const normalizeTitle = (title: string): string => title.trim().toLowerCase()
    for (const scanned of items) {
      if (scanned.pii) pii++
      const hits = this.api.search(`${scanned.title} ${scanned.summary}`, { kind: scanned.kind, limit: 5, scope: 'all' })
      // 同一来源文件导入过的条目直接跳过：重复导入只会制造冗余与混乱。
      // 判定 = 同源 +（标题一致或高度相似）。标题一致是主信号，相关性只兜底
      // （会话抽取的标题会随相对日期漂移），阈值放到 0.85 防止误杀同文件的新章节。
      const sameOrigin = hits.find((hit) => {
        if (hit.entry.meta.provenance.importedFrom !== scanned.origin) return false
        if (normalizeTitle(hit.entry.meta.title) === normalizeTitle(scanned.title)) return true
        return hit.parts.relevance >= 0.85
      })
      if (sameOrigin) {
        alreadyImported++
        skipped.push({ origin: scanned.origin, reason: 'already-imported' })
        continue
      }
      fresh.push(scanned)
      const best = hits[0]
      if (best && best.parts.relevance >= 0.5) {
        scanned.duplicateOf = best.entry.meta.id
        if (best.parts.relevance >= 0.9) duplicate++
        else merged++
      } else {
        added++
      }
    }

    const scanId = `s_${ulid().slice(2)}`
    this.scans.set(scanId, { source: sourceId, items: fresh })
    // 只保留最近 10 次扫描，避免旧扫描占内存
    while (this.scans.size > 10) {
      const oldest = this.scans.keys().next().value
      if (oldest === undefined) break
      this.scans.delete(oldest)
    }

    return {
      scanId,
      source: sourceId,
      label: source.label,
      detected: fresh.length > 0 || skipped.length > 0,
      scannedPaths: [...new Set(fresh.map((item) => item.origin))],
      items: fresh,
      skipped,
      estimate: { added, merged, duplicate, alreadyImported, pii },
    }
  }

  async apply(scanId: string, keys: string[], project?: string): Promise<ApplyReport> {
    const scan = this.scans.get(scanId)
    if (!scan) throw new Error('scan expired — please scan again')
    const selected = scan.items.filter((item) => keys.includes(item.key))
    if (selected.length === 0) throw new Error('nothing selected')

    const snapshot = await createSnapshot(this.api.root, 'import')
    const report: ApplyReport = {
      scanId,
      source: scan.source,
      added: 0,
      updated: 0,
      invalidated: 0,
      noop: 0,
      rejected: 0,
      snapshot: snapshot.label,
      details: [],
    }

    for (const item of selected) {
      const candidate = toCandidate(item)
      const result = await this.ingestor.applyCandidate(candidate, project, { mode: 'import', approved: true })
      if (result.outcome === 'added') report.added++
      else if (result.outcome === 'updated') report.updated++
      else if (result.outcome === 'invalidated') report.invalidated++
      else if (result.outcome === 'noop') report.noop++
      else if (result.outcome === 'pending') report.added++
      else report.rejected++
      report.details.push({ key: item.key, title: item.title, outcome: result.outcome, ...(result.reason ? { reason: result.reason } : {}) })
    }

    await this.api.writeAudit('import', {
      source: scan.source,
      added: report.added,
      updated: report.updated,
      invalidated: report.invalidated,
      noop: report.noop,
      rejected: report.rejected,
      snapshot: snapshot.label,
    })
    this.scans.delete(scanId)
    return report
  }

  /** 供面板展示：一次导入会影响常驻层的多少字符 */
  budgetImpact(items: ImportItem[], alwaysChars: number): { alwaysEntries: number; alwaysChars: number; overBudget: boolean } {
    let used = 0
    let count = 0
    for (const item of items) {
      if (item.activation !== 'always') continue
      count++
      used += item.title.length + item.summary.length + 4
    }
    return { alwaysEntries: count, alwaysChars: used, overBudget: used > alwaysChars }
  }

  get configSnapshot(): MemoryConfig {
    return this.config
  }
}

function toCandidate(item: ImportItem): Candidate {
  return {
    kind: item.kind,
    title: item.title,
    summary: item.summary,
    body: item.body,
    entities: item.entities,
    tags: item.tags,
    activation: item.activation,
    source: 'imported',
    confidence: item.confidence,
    // 导入的"证据"就是原文片段；没有正文的条目在扫描阶段已经被跳过
    evidence: item.body.slice(0, 80),
    reason: `imported from ${item.source}`,
    importedFrom: item.origin,
  }
}
