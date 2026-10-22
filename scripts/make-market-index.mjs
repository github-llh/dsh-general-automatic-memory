// 生成 dsh 插件市场索引（format:1）。
//
// 为什么需要这个：官方 market index 的 git 源必须钉 40 位 commit，
// 手写容易过期或写错；发版时跑一次即可。
//
//   node scripts/make-market-index.mjs            # 用当前 HEAD 生成 market/index.json
//   node scripts/make-market-index.mjs --verify   # 只校验已有文件（CI 用）
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const outFile = resolve(root, 'market/index.json')
const verifyOnly = process.argv.includes('--verify')

const repo = (pkg.repository?.url ?? '').replace(/^git\+/, '').replace(/\.git$/, '')
if (!repo.startsWith('https://')) {
  console.error('[market] package.json repository.url must be an https git URL')
  process.exit(1)
}

const index = {
  format: 1,
  title: { en: pkg.name, zh: '通用自动记忆' },
  description: {
    en: pkg.description,
    zh: '专属 dsh 的记忆中枢：收编各 agent 的记忆与会话，自索引、预算恒定。',
  },
  metadata: {
    categories: { memory: { title: { en: 'Memory', zh: '记忆' } } },
    labels: { 'file-based': { title: { en: 'File-based', zh: '文件式' } } },
  },
  plugins: [
    {
      name: pkg.name,
      title: { en: 'General Automatic Memory', zh: '通用自动记忆' },
      description: {
        en: pkg.description,
        zh: '专属 dsh 的记忆中枢：收编各 agent 的记忆与会话，自索引、预算恒定。',
      },
      author: pkg.author ?? 'github-llh',
      homepage: pkg.homepage,
      repository: { url: repo },
      metadata: { category: 'memory', keywords: pkg.keywords ?? [], labels: ['file-based'] },
      versions: [
        {
          version: pkg.version,
          publishTimestamp: Math.floor(Date.now() / 1000),
          source: { type: 'git', url: repo, commit: '0'.repeat(40) },
          engines: { dsh: pkg.engines?.dsh ?? '>=0.2.1-rc.2 <0.3.0' },
        },
      ],
    },
  ],
}

if (verifyOnly) {
  if (!existsSync(outFile)) {
    console.log('[market] no market/index.json yet (skipped)')
    process.exit(0)
  }
  const existing = JSON.parse(readFileSync(outFile, 'utf8'))
  const problems = []
  if (existing.format !== 1) problems.push('format must be 1')
  const version = existing.plugins?.[0]?.versions?.[0]
  if (!version) problems.push('missing plugins[0].versions[0]')
  else {
    if (!/^[0-9a-f]{40}$/.test(version.source?.commit ?? '')) problems.push('source.commit must be a 40-hex SHA')
    if (typeof version.publishTimestamp !== 'number') problems.push('publishTimestamp must be a number')
  }
  if (problems.length > 0) {
    console.error('[market] invalid index:\n  - ' + problems.join('\n  - '))
    process.exit(1)
  }
  console.log('[market] index shape OK')
  process.exit(0)
}

let commit = '0'.repeat(40)
try {
  commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
} catch {
  console.warn('[market] not a git checkout; using a placeholder commit')
}
index.plugins[0].versions[0].source.commit = commit
mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, `${JSON.stringify(index, null, 2)}\n`)
console.log(`[market] wrote ${outFile} @ ${commit.slice(0, 8)}`)
