// client bundle 格式契约校验。装不进 dsh 的 bundle 会「fail activation loudly」，
// 但那要等到运行时；这里在构建后立刻拦住。
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const src = readFileSync(resolve(root, 'client/client.js'), 'utf8')

const failures = []
const check = (ok, message) => {
  if (!ok) failures.push(message)
}

check(src.startsWith('window.__ModuleLoader__.load({'), '首行必须是 window.__ModuleLoader__.load({')
check(src.includes(`id: ${JSON.stringify(pkg.name)}`), `id 必须等于包名 ${pkg.name}`)
check(src.includes('factory: (require) => {'), '必须使用 factory(require) 形式')
check(src.includes('var module = { exports: {} };'), '缺少 CJS 互操作前导（module/exports 在 factory 内不存在，必须自己声明）')
check(/return module\.exports;\s*\}\s*\}\);?\s*$/.test(src), '结尾必须 return module.exports 并闭合 factory 与 load()')
check(!/^\s*(import|export)\s/m.test(src), '产物内不得残留顶层 ESM import/export')
check(!src.includes('sourceMappingURL'), '产物不应引用 sourcemap（宿主按 mtime/size 派生 rev，多余文件会 404）')

const exported = ['exports.apply', 'exports.inject', 'exports.name'].filter((k) => src.includes(k))
check(exported.length === 3, `client 半侧必须导出 name / inject / apply，实际只找到 ${exported.join(', ') || '无'}`)

// 只允许 require 浏览器基线里确认存在的模块
const requires = [...src.matchAll(/require\("([^"]+)"\)/g)].map((m) => m[1])
const allowed = new Set(['react', 'react/jsx-runtime', '@deepseek-ai/cordis'])
const bad = [...new Set(requires.filter((r) => !allowed.has(r)))]
check(bad.length === 0, `require 了基线之外的模块：${bad.join(', ')}（需打进 bundle 或声明 dsh.client.external）`)

// 不得 import 宿主 client 包（practices.md 明令禁止）。
// 只查真正的 require/import 语句——源码注释里提到这个包名是允许的（而且有用）。
const HOST_CLIENT_IMPORT = /(?:require\(\s*|from\s*)["']@deepseek-ai\/dsh-client-[^"']+["']/g
const hostImports = [...src.matchAll(HOST_CLIENT_IMPORT)].map((m) => m[0].trim())
const forbidden = hostImports.filter((h) => !h.includes('/dsh-client-locale'))
check(
  forbidden.length === 0,
  `禁止 import 宿主 client 包（要控件就自己写，类名换成 .gam- 前缀）：${forbidden.join(', ')}`,
)

// 硬编码颜色只允许出现在 artwork 里；这里粗查 style 属性与 CSS 文本
const literalColors = [...src.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0])
check(
  literalColors.length === 0,
  `发现 ${literalColors.length} 处硬编码颜色（${[...new Set(literalColors)].slice(0, 5).join(', ')}）；除 artwork 外必须用 --dsw-alias-* token`,
)

if (failures.length > 0) {
  console.error('[verify-bundle] FAILED:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
console.log(`[verify-bundle] OK · ${Buffer.byteLength(src)} bytes · requires: ${[...new Set(requires)].join(', ') || '(none)'}`)
