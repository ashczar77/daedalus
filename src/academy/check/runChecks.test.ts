import { describe, expect, it } from 'vitest'
import type { LessonPack } from '../types'
import { createShellState } from '../shell/state'
import { executeLine } from '../shell/execute'
import { runChecks } from './runChecks'

const lesson = {
  id: 'test-lesson',
  title: 'Test',
  track: 'fundamentals',
  order: 1,
  level: 'intro',
  summary: '',
  prose: [],
  goals: [{ id: 'g1', label: 'do the thing' }],
  unlocks: [],
  setup: {
    cwd: '/home/cadet',
    files: { home: { cadet: { 'a.txt': 'hello\n' } } },
  },
  checks: [],
} satisfies LessonPack

describe('runChecks', () => {
  it('passes when all specs succeed', () => {
    const state = createShellState(lesson.setup)
    executeLine(state, 'pwd')
    const result = runChecks(state, {
      ...lesson,
      checks: [
        { type: 'lastCommandIs', command: 'pwd' },
        { type: 'stdoutEquals', text: '/home/cadet\n' },
        { type: 'cwdIs', path: '/home/cadet' },
        { type: 'fileExists', path: '/home/cadet/a.txt' },
        { type: 'fileEquals', path: '/home/cadet/a.txt', content: 'hello\n' },
        { type: 'lastExit', code: 0 },
      ],
    })
    expect(result.ok).toBe(true)
  })

  it('fails with a message on the first bad check', () => {
    const state = createShellState(lesson.setup)
    executeLine(state, 'ls')
    const result = runChecks(state, {
      ...lesson,
      checks: [
        { type: 'lastCommandIs', command: 'pwd', message: 'need pwd' },
        { type: 'stdoutContains', text: 'never' },
      ],
    })
    expect(result.ok).toBe(false)
    expect(result.message).toBe('need pwd')
    expect(result.failedGoal).toBe('do the thing')
  })

  it('checks modes and process status', () => {
    const state = createShellState({
      cwd: '/home/cadet',
      files: { home: { cadet: { 'tool.sh': '#!/bin/sh\n' } } },
      processes: [{ pid: 9, name: 'worker', status: 'running' }],
    })
    executeLine(state, 'chmod 755 tool.sh')
    executeLine(state, 'kill 9')
    const result = runChecks(state, {
      ...lesson,
      checks: [
        { type: 'modeIs', path: '/home/cadet/tool.sh', mode: '755' },
        { type: 'processStopped', pid: 9 },
        { type: 'fileMissing', path: '/home/cadet/missing.txt' },
      ],
    })
    expect(result.ok).toBe(true)
  })
})
