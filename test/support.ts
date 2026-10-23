import { rm } from 'node:fs/promises'

/**
 * Windows 上删除临时目录经常撞上 EBUSY / ENOTEMPTY / EPERM：SQLite 句柄、
 * 杀毒软件刚扫过的新文件、资源管理器残留句柄都会让 `rm -rf` 当场失败。
 * 一次清理失败会连带把后面两个用例也判红，所以这里按指数退避重试。
 */
export async function removeDir(dir: string, attempts = 6): Promise<void> {
  for (let i = 0; ; i++) {
    try {
      await rm(dir, { recursive: true, force: true })
      return
    } catch (cause) {
      const code = (cause as NodeJS.ErrnoException).code
      const retryable = code === 'EBUSY' || code === 'ENOTEMPTY' || code === 'EPERM'
      if (!retryable || i >= attempts - 1) return
      await new Promise((resolve) => setTimeout(resolve, 25 * 2 ** i))
    }
  }
}

/**
 * 插件激活等待。旧实现只给 1s（200 × 5ms）——Windows CI 上冷启动 +
 * SQLite/FTS 初始化经常超过 1s，于是报 "plugin did not activate"。
 * 这不是产品缺陷，是脚手架的硬编码假设，放到 30s。
 */
export async function waitForService<T>(probe: () => T | undefined, timeoutMs = 30_000): Promise<T> {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const value = probe()
    if (value !== undefined) return value
    if (Date.now() >= deadline) throw new Error('service did not appear in time')
    await new Promise((resolve) => setTimeout(resolve, 20))
  }
}
