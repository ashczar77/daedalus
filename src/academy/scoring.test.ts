import { describe, expect, it } from 'vitest'
import {
  baseXp,
  nextRank,
  rankForScore,
  revealXpKept,
  xpForLesson,
} from './scoring'
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
  it('pays full base with no assist', () => {
    expect(xpForLesson(sampleLesson, {})).toBe(25)
    expect(baseXp(sampleLesson)).toBe(25)
  })

  it('trims for each nudge hint but keeps a floor', () => {
    expect(xpForLesson(sampleLesson, { hintsUsed: 1 })).toBe(20)
    expect(xpForLesson(sampleLesson, { hintsUsed: 2 })).toBe(15)
    // Floor at 35% of 25 ≈ 9
    expect(xpForLesson(sampleLesson, { hintsUsed: 10 })).toBe(9)
  })

  it('collapses payout after a full answer reveal', () => {
    expect(revealXpKept(sampleLesson)).toBe(4)
    expect(
      xpForLesson(sampleLesson, { hintsUsed: 0, revealedSolution: true }),
    ).toBe(4)
    // Reveal dominates even if hints were also used.
    expect(
      xpForLesson(sampleLesson, { hintsUsed: 3, revealedSolution: true }),
    ).toBe(4)
  })
})

describe('ranks', () => {
  it('maps score thresholds', () => {
    expect(rankForScore(0).title).toBe('Cadet')
    expect(rankForScore(50).title).toBe('Operator')
    expect(nextRank(40)?.title).toBe('Operator')
    expect(nextRank(500)).toBeNull()
  })
})
