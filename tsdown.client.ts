import { defineConfig } from 'tsdown'

// 浏览器半侧：先打成 CJS 到临时目录，再由 scripts/wrap-client.mjs 套上
// dsh client module system 要求的 lazy-CJS factory 外壳，产出 client/client.js。
// 官方 preset（packages/client/tsdown.client.ts）未发布成包，这条链是自己复刻的。
export default defineConfig({
  entry: ['src/client/client.ts'],
  outDir: '.tmp-client',
  format: ['cjs'],
  platform: 'browser',
  target: 'es2022',
  dts: false,
  clean: true,
  sourcemap: false,
  minify: false,
  // 浏览器基线里真实存在、可安全 require 的模块（其余一律打进 bundle）。
  // 少一个外部依赖就少一次 combo 路由 404 的机会 —— 见风险 R17。
  deps: { neverBundle: ['react', 'react/jsx-runtime', '@deepseek-ai/cordis'] },
})
