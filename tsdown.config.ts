import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  // 包是 type:module，所以 ESM 产物就该是 .js（官方 @deepseek-ai/dsh-* 也是 lib/index.js）
  fixedExtension: false,
  dts: { entry: ['src/index.ts'] },
  clean: true,
  sourcemap: false,
  minify: false,
  deps: { neverBundle: [/^@deepseek-ai\//, /^node:/, 'js-yaml'] },
})
