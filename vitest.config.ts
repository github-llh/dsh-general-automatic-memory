import { defineConfig } from 'vitest/config'

/**
 * 这些用例是 I/O 密集的（建临时记忆库、写条目、跑 SQLite FTS）。macOS 上几百毫秒
 * 的量，在 Windows CI 的实时扫描盘上会放大一个数量级——5s 默认超时曾经把 5 个用例
 * 判红，而它们本身没有逻辑错误。真正的原因是每次写入的磁盘放大（已修：增量扫描 +
 * 派生文件免 fsync + FTS 单事务），这里给的是慢文件系统上的安全余量。
 */
export default defineConfig({
  test: {
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
