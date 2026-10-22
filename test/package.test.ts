import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * git 安装契约：dsh profile 的 pnpm 供应链策略会拒绝 git 依赖的安装期构建脚本
 * （ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED），所以包必须「装即所得」。
 */
const ROOT = path.resolve(import.meta.dirname, '..')
const PKG = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
  scripts?: Record<string, string>
  files?: string[]
}

describe('git 安装契约', () => {
  it('不声明任何安装期生命周期脚本', () => {
    const forbidden = ['preinstall', 'install', 'postinstall', 'prepare', 'prepack']
    expect(Object.keys(PKG.scripts ?? {}).filter((name) => forbidden.includes(name))).toEqual([])
  })

  it('预构建产物存在且被打进发布包', () => {
    for (const artifact of ['lib/index.js', 'lib/index.d.ts', 'client/client.js']) {
      expect(existsSync(path.join(ROOT, artifact)), artifact).toBe(true)
    }
    expect(PKG.files).toEqual(expect.arrayContaining(['lib', 'client']))
  })
})
