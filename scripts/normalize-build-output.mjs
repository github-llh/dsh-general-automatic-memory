import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/**
 * 构建产物换行归一化。
 *
 * `lib/`、`client/` 是**随源码提交**的零安装契约产物，CI 会断言它们 fresh。
 * tsdown/TypeScript 在 Windows 上可能吐 CRLF，macOS 吐 LF，直接提交就会三端 diff。
 * 这里在 build 结束后把文本产物统一成 LF，保证「同一份源码 → 同一份字节」。
 */
const ROOTS = ['lib', 'client']
const TEXT_EXTENSIONS = new Set(['.js', '.cjs', '.mjs', '.d.ts', '.map'])

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(abs)
      continue
    }
    if (!TEXT_EXTENSIONS.has(path.extname(entry.name))) continue
    normalize(abs)
  }
}

function normalize(file) {
  const before = readFileSync(file, 'utf8')
  if (!before.includes('\r')) return
  const after = before.replace(/\r\n/g, '\n')
  writeFileSync(file, after)
}

for (const root of ROOTS) {
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) continue
  walk(root)
}
