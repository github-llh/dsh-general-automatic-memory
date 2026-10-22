import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../src/config.js'
import { MemoryService } from '../src/host/api.js'
import { Ingestor } from '../src/host/ingest/index.js'
import { ImportService } from '../src/host/importers/index.js'
import { cherryMemoryItems, oneviumItems, parseOpenCodeRows } from '../src/host/importers/databases.js'
import { mineTurns, parseGeminiSession, parseMarkdownConversation } from '../src/host/importers/conversation.js'
import { ALL_SOURCES } from '../src/host/importers/index.js'

let root: string
const services: MemoryService[] = []

async function createService(): Promise<MemoryService> {
  const service = await MemoryService.create(DEFAULT_CONFIG, root)
  services.push(service)
  return service
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'gam-src-'))
})
afterEach(async () => {
  for (const service of services.splice(0)) service.dispose()
  await rm(root, { recursive: true, force: true })
})

describe('来源注册表', () => {
  it('covers every vendor with a unique id and a label', () => {
    const ids = ALL_SOURCES.map((source) => source.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const source of ALL_SOURCES) {
      expect(source.label.length).toBeGreaterThan(0)
      expect(['memory', 'conversation']).toContain(source.kind)
    }
    // 覆盖面：终端 CLI、桌面端、IDE 规则、前代插件
    for (const id of [
      'claude-code-memory', 'claude-md', 'agents-md', 'cursor-rules', 'windsurf-rules',
      'cline-memory-bank', 'clinerules', 'copilot-instructions', 'gemini-md', 'qwen-md', 'iflow-md',
      'augment-rules', 'kiro-steering', 'specstory-history', 'continue-rules', 'junie-guidelines',
      'qoder-memory', 'dsh-auto-memory', 'opencode-sessions', 'cherry-memory', 'onevium',
      'aider-history', 'codex-sessions', 'qoder-sessions', 'gemini-sessions', 'qwen-sessions',
      'dsh-sessions', 'claude-code-sessions',
      'generic-dir', 'generic-jsonl', 'generic-markdown',
    ]) {
      expect(ids).toContain(id)
    }
  })
})

describe('项目级规则来源', () => {
  async function makeWorkspace(): Promise<string> {
    const cwd = await mkdtemp(path.join(tmpdir(), 'gam-ws-'))
    await writeFile(path.join(cwd, '.clinerules'), '提交前必须跑测试，不要跳过。\n', 'utf8')
    await mkdir(path.join(cwd, '.roo', 'rules'), { recursive: true })
    await writeFile(path.join(cwd, '.roo', 'rules', 'style.md'), '## 命名\n\n后端接口用蛇形，前端用驼峰。\n', 'utf8')
    await mkdir(path.join(cwd, '.kiro', 'steering'), { recursive: true })
    await writeFile(path.join(cwd, '.kiro', 'steering', 'product.md'), '## 产品原则\n\n先保证数据正确，再谈性能。\n', 'utf8')
    await mkdir(path.join(cwd, '.specstory', 'history'), { recursive: true })
    await writeFile(path.join(cwd, '.specstory', 'history', '2026-10-01.md'), '## 决定\n\n会话记录落盘用 jsonl，不用 sqlite。\n', 'utf8')
    await mkdir(path.join(cwd, '.continue', 'rules'), { recursive: true })
    await writeFile(path.join(cwd, '.continue', 'rules', 'team.md'), '## 协作\n\n不要在回复末尾加总结。\n', 'utf8')
    await mkdir(path.join(cwd, '.junie'), { recursive: true })
    await writeFile(path.join(cwd, '.junie', 'guidelines.md'), '## 指南\n\n回答用简体中文。\n', 'utf8')
    await mkdir(path.join(cwd, '.augment', 'rules'), { recursive: true })
    await writeFile(path.join(cwd, '.augment', 'rules', 'safety.md'), '## 安全\n\n不要提交密钥。\n', 'utf8')
    await writeFile(path.join(cwd, '.cursorrules'), 'Legacy cursor rule: 用 pnpm 管理依赖。\n', 'utf8')
    return cwd
  }

  it('detects and scans every project-level rule source', async () => {
    const api = await createService()
    const importer = new ImportService(api, new Ingestor(api, DEFAULT_CONFIG), DEFAULT_CONFIG)
    const cwd = await makeWorkspace()
    try {
      const expected: Record<string, string> = {
        clinerules: '提交前必须跑测试',
        'cursor-rules': 'pnpm',
        'kiro-steering': '产品原则',
        'specstory-history': '决定',
        'continue-rules': '协作',
        'junie-guidelines': '指南',
        'augment-rules': '安全',
      }
      const sources = await importer.sources(cwd)
      for (const [id, needle] of Object.entries(expected)) {
        const status = sources.find((source) => source.id === id)
        expect(status?.detected.length, `${id} should be detected`).toBeGreaterThan(0)
        const report = await importer.scan(id as never, { cwd, limit: 50 })
        const titles = report.items.map((item) => `${item.title} ${item.body}`).join('\n')
        expect(titles, `${id} should contain its rule`).toContain(needle)
      }
      // .roo/rules 目录也归 clinerules 来源扫
      const cline = await importer.scan('clinerules', { cwd, limit: 50 })
      expect(cline.items.some((item) => item.body.includes('蛇形'))).toBe(true)
    } finally {
      await rm(cwd, { recursive: true, force: true })
    }
  })
})

describe('sqlite 来源解析', () => {
  it('parses opencode session rows into minable turns', () => {
    const sessions = [
      { id: 'ses_1', title: '规范讨论' },
      { id: 'ses_2', title: '闲聊' },
    ]
    const messages = [
      { session_id: 'ses_1', type: 'user', data: JSON.stringify({ text: '以后不要在回复末尾加总结' }) },
      { session_id: 'ses_1', type: 'assistant', data: JSON.stringify({ content: [{ type: 'text', text: '好的。' }] }) },
      { session_id: 'ses_2', type: 'user', data: JSON.stringify({ text: '你是什么模型' }) },
      { session_id: 'ses_1', type: 'idle', data: JSON.stringify({ outcome: 'succeeded' }) },
      { session_id: 'ses_ghost', type: 'user', data: JSON.stringify({ text: '孤儿消息' }) },
    ]
    const turns = parseOpenCodeRows(sessions, messages, '/db/opencode.db')
    expect(turns).toHaveLength(2)
    expect(turns[0]!.origin).toBe('/db/opencode.db#ses_1')
    const items = mineTurns(turns, { limit: 50 })
    expect(items).toHaveLength(1)
    expect(items[0]!.origin).toBe('/db/opencode.db#ses_1')
  })

  it('imports cherrystudio memories and unwraps json payloads', () => {
    const items = cherryMemoryItems(
      [
        { id: 'm1', memory: '张三负责 data-platform-server' },
        { id: 'm2', memory: JSON.stringify({ message: { content: '李四负责 fire-fighting-client' } }) },
        { id: 'm3', memory: '   ' },
      ],
      '/db/memories.db',
      50,
    )
    expect(items).toHaveLength(2)
    expect(items[0]!.body).toContain('张三')
    expect(items[1]!.body).toContain('李四')
    expect(items[0]!.origin).toBe('/db/memories.db#m1')
  })

  it('imports onevium memories and mines its conversations', () => {
    const items = oneviumItems(
      [{ id: 's1', title: '会话' }],
      [
        { session_id: 's1', role: 'user', content: '以后别在末尾加总结' },
        { session_id: 's1', role: 'assistant', content: '{"message":{"content":[{"type":"text","text":"好的"}]}}' },
      ],
      [{ id: 'm1', content: '王五负责 api-gateway', category: 'project' }],
      '/db/onevium.db',
      { limit: 50 },
    )
    const bodies = items.map((item) => item.body).join('\n')
    expect(bodies).toContain('王五')
    expect(items.some((item) => item.body.includes('总结'))).toBe(true)
    expect(items.some((item) => item.origin === '/db/onevium.db#memory:m1')).toBe(true)
  })
})

describe('Aider 历史', () => {
  it('parses #### role headings', () => {
    const text = [
      '# aider chat started at 2026-10-01 10:00:00',
      '',
      '#### user',
      '以后不要在回复末尾加总结',
      '',
      '#### assistant',
      '好的。',
      '',
      '#### user',
      '张三负责 data-platform-server',
    ].join('\n')
    const turns = parseMarkdownConversation(text, '/home/.aider.chat.history.md')
    expect(turns).toHaveLength(2)
    const items = mineTurns(turns, { limit: 50 })
    expect(items.length).toBeGreaterThan(0)
    expect(items.map((item) => item.body).join('\n')).toContain('张三')
  })
})

describe('Gemini CLI / Qwen Code 会话', () => {
  it('parses the mixed-record jsonl transcript', () => {
    const jsonl = [
      { sessionId: 's1', projectHash: 'h1', startTime: 1, lastUpdated: 2, kind: 'main' },
      { id: 'm1', timestamp: 3, type: 'user', content: '以后不要在回复末尾加总结' },
      { $set: { title: '规范' } },
      { id: 'm2', timestamp: 4, type: 'gemini', content: '好的。', model: 'gemini-3' },
      { id: 'm3', timestamp: 5, type: 'info', content: 'system noise' },
      { id: 'm4', timestamp: 6, type: 'user', content: '张三负责 data-platform-server' },
      { id: 'm5', timestamp: 7, type: 'gemini', content: [{ parts: [{ text: '记下了。' }] }] },
    ]
      .map((record) => JSON.stringify(record))
      .join('\n')
    const turns = parseGeminiSession(jsonl, '/tmp/chats/session-1.jsonl')
    expect(turns).toHaveLength(2)
    expect(turns[0]!.userMessages).toEqual(['以后不要在回复末尾加总结'])
    expect(turns[0]!.assistantMessages).toEqual(['好的。'])
    const items = mineTurns(turns, { limit: 50 })
    expect(items.map((item) => item.body).join('\n')).toContain('张三')
    expect(items.map((item) => item.body).join('\n')).not.toContain('system noise')
  })

  it('detects and scans a GEMINI_CLI_HOME tree end to end', async () => {
    const home = await mkdtemp(path.join(tmpdir(), 'gam-gemini-'))
    const previous = process.env.GEMINI_CLI_HOME
    try {
      const chats = path.join(home, 'tmp', 'hash123', 'chats')
      await mkdir(chats, { recursive: true })
      await writeFile(
        path.join(chats, 'session-20261001-abcd.jsonl'),
        [
          JSON.stringify({ sessionId: 's1', projectHash: 'hash123', kind: 'main' }),
          JSON.stringify({ id: 'm1', type: 'user', content: '以后别在末尾加总结' }),
          JSON.stringify({ id: 'm2', type: 'gemini', content: '好的' }),
        ].join('\n'),
        'utf8',
      )
      process.env.GEMINI_CLI_HOME = home
      const api = await createService()
      const importer = new ImportService(api, new Ingestor(api, DEFAULT_CONFIG), DEFAULT_CONFIG)
      const sources = await importer.sources('/tmp')
      const status = sources.find((source) => source.id === 'gemini-sessions')
      expect(status?.detected.length).toBe(1)
      const report = await importer.scan('gemini-sessions' as never, { cwd: '/tmp', limit: 50 })
      expect(report.items.length).toBeGreaterThan(0)
      expect(report.items[0]!.origin).toContain('session-20261001-abcd.jsonl')
    } finally {
      if (previous === undefined) delete process.env.GEMINI_CLI_HOME
      else process.env.GEMINI_CLI_HOME = previous
      await rm(home, { recursive: true, force: true })
    }
  })
})
