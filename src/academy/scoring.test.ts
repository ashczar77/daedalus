import { describe, expect, it } from 'vitest'
import { nextRank, rankForScore, xpForLesson } from './scoring'
import type { LessonPack } from './types'

const sampleLesson = {
  id: 'mast-globs',
  title: 'Globs',
  track: 'mastery',
  order: 16,
  level: 'core',
  summary: '',
  prose: [],
  goals: [],
  unlocks: [],
  setup: { files: {} },
  checks: [],
} satisfies LessonPack

describe('xpForLesson', () => {
  it('uses level defaults and trims for hints', () => {
    expect(xpForLesson(sampleLesson, 0)).toBe(25)
    expect(xpForLesson(sampleLesson, 2)).toBe(25 - 6)
    expect(xpForLesson({ ...sampleLesson, xp: 60 }, 0)).toBe(60)
    expect(xpForLesson(sampleLesson, 100)).toBeGreaterThanOrEqual(5)
  })
})

describe('ranks', () => {
  it('maps score thresholds', () => {
    expect(rankForScore(0).title).toBe('Cadet')
    expect(rankForScore(50).title).toBe('Operator')
    expect(rankForScore(150).title).toBe('Shellwright')
    expect(rankForScore(300).title).toBe('Terminal Adept')
    expect(rankForScore(500).title).toBe('Master Cadet')
    expect(nextRank(40)?.title).toBe('Operator')
    expect(nextRank(500)).toBeNull()
  })
})
