// 把 tsdown 产出的 CJS bundle 套上 dsh client module system 要求的 lazy-CJS 外壳。
// 目标格式与本机已验证可用的第三方 UI 插件（dsh-plugin@2.0.5 client/client.js）逐字对齐：
//   window.__ModuleLoader__.load({ id: "<包名>", factory: (require) => {
//       var module = { exports: {} };
//       var exports = module.exports;
//       Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//       …bundle…
//       return module.exports;
//     }
//   });
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const outFile = resolve(root, 'client/client.js')

// tsdown 的 cjs 产物扩展名随版本变化（0.22 是 .cjs），两个都认
const candidates = ['.tmp-client/client.cjs', '.tmp-client/client.js']
const inFile = candidates.map((rel) => resolve(root, rel)).find((abs) => existsSync(abs))
if (!inFile) {
  console.error(`[wrap-client] no build output found; looked for:\n  ${candidates.join('\n  ')}`)
  process.exit(1)
}

let body = readFileSync(inFile, 'utf8')
body = body
  .replace(/^\s*['"]use strict['"];?\s*$/m, '')
  .replace(/^\/\/# sourceMappingURL=.*$/gm, '')
  .trim()

const indented = body
  .split('\n')
  .map((line) => (line.length > 0 ? `\t${line}` : line))
  .join('\n')

const out = `window.__ModuleLoader__.load({ id: ${JSON.stringify(pkg.name)}, factory: (require) => {
\tvar module = { exports: {} };
\tvar exports = module.exports;
\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${indented}
\treturn module.exports;
\t}
});
`

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, out)
console.log(`[wrap-client] ${outFile} (${Buffer.byteLength(out)} bytes)`)
