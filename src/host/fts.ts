import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import type { Entry } from './model.js'
import { tokenize } from './search.js'

/**
 * L1 词法索引（SQLite FTS5）。
 *
 * 用 Node 内置的 `node:sqlite`，不引原生依赖 —— dsh 的 pnpm 会拦构建脚本，
 * 少一个原生模块就少一次"Allow these scripts"的安装摩擦。
 *
 * **它只是缓存**：`.cache/fts.sqlite` 随时可删，删了下次 refresh 自动重建。
 * CJK 的关键在于"先分词再入库"：FTS5 自带的 unicode61 不切中文，
 * 所以写入的是我们分词后的空格分隔 token，而不是原文。
 */
export class FtsIndex {
  private constructor(private readonly db: DatabaseSync) {}

  static open(root: string): FtsIndex | null {
    try {
      const dir = path.join(root, '.cache')
      mkdirSync(dir, { recursive: true })
      const db = new DatabaseSync(path.join(dir, 'fts.sqlite'))
      db.exec('PRAGMA journal_mode = WAL')
      db.exec('CREATE TABLE IF NOT EXISTS entry_meta (id TEXT PRIMARY KEY, kind TEXT NOT NULL, hash TEXT NOT NULL)')
      db.exec('CREATE VIRTUAL TABLE IF NOT EXISTS entry_fts USING fts5(id UNINDEXED, tokens)')
      return new FtsIndex(db)
    } catch {
      return null
    }
  }

  /** 增量同步：只重算 hash 变化的条目 */
  sync(entries: Entry[]): void {
    const known = new Map<string, string>()
    for (const row of this.db.prepare('SELECT id, hash FROM entry_meta').all() as Array<{ id: string; hash: string }>) {
      known.set(row.id, row.hash)
    }
    const insertMeta = this.db.prepare('INSERT INTO entry_meta (id, kind, hash) VALUES (?, ?, ?)')
    const insertFts = this.db.prepare('INSERT INTO entry_fts (id, tokens) VALUES (?, ?)')
    const deleteMeta = this.db.prepare('DELETE FROM entry_meta WHERE id = ?')
    const deleteFts = this.db.prepare('DELETE FROM entry_fts WHERE id = ?')

    const seen = new Set<string>()
    for (const entry of entries) {
      const id = entry.meta.id
      seen.add(id)
      const hash = hashOf(entry)
      if (known.get(id) === hash) continue
      const tokens = [...new Set(tokenize(indexable(entry)))].join(' ')
      this.db.exec('BEGIN')
      try {
        deleteFts.run(id)
        deleteMeta.run(id)
        insertMeta.run(id, entry.meta.kind, hash)
        insertFts.run(id, tokens)
        this.db.exec('COMMIT')
      } catch {
        this.db.exec('ROLLBACK')
      }
    }
    // 删除已经不存在的条目
    for (const id of known.keys()) {
      if (seen.has(id)) continue
      this.db.exec('BEGIN')
      try {
        deleteFts.run(id)
        deleteMeta.run(id)
        this.db.exec('COMMIT')
      } catch {
        this.db.exec('ROLLBACK')
      }
    }
  }

  /** 返回候选 id（按 bm25 排序）。只做粗筛，最终排序仍走我们的 rank()。 */
  candidates(query: string, limit: number): string[] {
    const tokens = [...new Set(tokenize(query))].slice(0, 32).map((token) => token.replace(/["']/g, ''))
    if (tokens.length === 0) return []
    const expression = tokens.map((token) => `"${token}"`).join(' OR ')
    try {
      const rows = this.db
        .prepare('SELECT id FROM entry_fts WHERE entry_fts MATCH ? ORDER BY bm25(entry_fts) LIMIT ?')
        .all(expression, Math.max(1, Math.min(limit, 500))) as Array<{ id: string }>
      return rows.map((row) => row.id)
    } catch {
      return []
    }
  }

  close(): void {
    try {
      this.db.close()
    } catch {
      // 已经关过
    }
  }
}

function indexable(entry: Entry): string {
  const meta = entry.meta
  return [meta.title, meta.title, meta.summary, meta.summary, meta.tags.join(' '), meta.entities.join(' '), meta.project ?? '', entry.body.slice(0, 400)].join(' ')
}

function hashOf(entry: Entry): string {
  return `${entry.meta.kind}:${entry.meta.title.length}:${entry.meta.summary.length}:${entry.meta.checksum}:${entry.body.length}`
}
