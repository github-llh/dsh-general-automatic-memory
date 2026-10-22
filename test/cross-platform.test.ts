import { homedir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PathEscapeError, hasExtension, resolveInRoot } from '../src/host/files.js'
import { matchGlob } from '../src/host/adapters/inject.js'
import { expandUserPath, projectSlug } from '../src/host/paths.js'
import { utcDayFilesForLocalDate } from '../src/host/audit.js'

let root: string

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'gam-xplat-'))
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('跨平台路径处理', () => {
  it('expands ~, ~/ and ~\\ to the home directory', () => {
    expect(expandUserPath('~')).toBe(homedir())
    expect(expandUserPath('~/notes')).toBe(path.join(homedir(), 'notes'))
    expect(expandUserPath('~\\notes')).toBe(path.join(homedir(), 'notes'))
  })

  it('treats file extensions case-insensitively for Windows/macOS', () => {
    expect(hasExtension('MEMORY.MD', '.md')).toBe(true)
    expect(hasExtension('session.V4.JSONL.ZSTD', '.zstd')).toBe(true)
    expect(hasExtension('notes.txt', '.md')).toBe(false)
  })

  it('keeps the project slug stable for a trailing separator', () => {
    expect(projectSlug('/repo/demo')).toBe(projectSlug('/repo/demo/'))
  })

  it('keeps absolute paths inside the root and rejects escapes', () => {
    const inside = path.join(root, 'persona', 'mem_1.md')
    expect(resolveInRoot(root, 'persona/mem_1.md')).toBe(inside)
    expect(resolveInRoot(root, inside)).toBe(inside)
    expect(() => resolveInRoot(root, '../outside.md')).toThrow(PathEscapeError)
  })

  it('matches glob patterns relative to cwd', () => {
    expect(matchGlob('src/*.ts', '/repo/src/a.ts', '/repo')).toBe(true)
    expect(matchGlob('**/*.ts', '/repo/src/deep/a.ts', '/repo')).toBe(true)
    expect(matchGlob('src/*.ts', '/repo/src/deep/a.ts', '/repo')).toBe(false)
  })
})

describe('audit local-day mapping', () => {
  it('reads a single UTC file at offset 0', () => {
    const { files } = utcDayFilesForLocalDate('2026-10-22', 0)
    expect(files).toEqual(['2026-10-22'])
  })

  it('spans two UTC files east of UTC', () => {
    const { files } = utcDayFilesForLocalDate('2026-10-22', 480)
    expect(files).toEqual(['2026-10-21', '2026-10-22'])
  })

  it('spans two UTC files west of UTC', () => {
    const { files } = utcDayFilesForLocalDate('2026-10-22', -480)
    expect(files).toEqual(['2026-10-22', '2026-10-23'])
  })
})
