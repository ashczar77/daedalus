import type { LessonPack, RankInfo } from './types'

/** Base XP awarded on first completion by lesson level. */
export const XP_BY_LEVEL: Record<LessonPack['level'], number> = {
  intro: 10,
  core: 25,
  advanced: 40,
}

/** How much of base XP each revealed nudge costs (before floor). */
export const HINT_PENALTY_FRACTION = 0.2

/** Minimum fraction kept if the learner only used hints (no full reveal). */
export const HINT_FLOOR_FRACTION = 0.35

/** Fraction kept after revealing the full answer (heavy penalty). */
export const REVEAL_KEEP_FRACTION = 0.15

export const RANKS: RankInfo[] = [
  { id: 'cadet', title: 'Cadet', minScore: 0 },
  { id: 'operator', title: 'Operator', minScore: 50 },
  { id: 'shellwright', title: 'Shellwright', minScore: 150 },
  { id: 'adept', title: 'Terminal Adept', minScore: 300 },
  { id: 'master', title: 'Master Cadet', minScore: 500 },
]

export type AssistUsage = {
  /** Number of nudge hints revealed (not the full answer). */
  hintsUsed?: number
  /** True if the learner opened the full solution. */
  revealedSolution?: boolean
}

export function baseXp(lesson: LessonPack): number {
  return lesson.xp ?? XP_BY_LEVEL[lesson.level]
}

/** XP cost of revealing one more nudge at the current hint count. */
export function hintXpCost(lesson: LessonPack, hintsAlreadyShown: number): number {
  const before = xpForLesson(lesson, { hintsUsed: hintsAlreadyShown })
  const after = xpForLesson(lesson, { hintsUsed: hintsAlreadyShown + 1 })
  return Math.max(0, before - after)
}

/** XP that would remain after a full answer reveal. */
export function revealXpKept(lesson: LessonPack): number {
  return xpForLesson(lesson, { revealedSolution: true })
}

/**
 * First-clear XP. Nudges trim payout; revealing the full answer collapses it
 * to a small consolation amount so skipping the struggle is never optimal.
 */
export function xpForLesson(
  lesson: LessonPack,
  assist: AssistUsage | number = {},
): number {
  const usage: AssistUsage =
    typeof assist === 'number' ? { hintsUsed: assist } : assist
  const base = baseXp(lesson)
  if (usage.revealedSolution) {
    return Math.max(1, Math.round(base * REVEAL_KEEP_FRACTION))
  }
  const hintsUsed = usage.hintsUsed ?? 0
  const penalty = Math.round(base * HINT_PENALTY_FRACTION * hintsUsed)
  const floor = Math.round(base * HINT_FLOOR_FRACTION)
  return Math.max(floor, base - penalty)
}

export function rankForScore(score: number): RankInfo {
  let current = RANKS[0]!
  for (const rank of RANKS) {
    if (score >= rank.minScore) current = rank
  }
  return current
}

export function nextRank(score: number): RankInfo | null {
  const current = rankForScore(score)
  const idx = RANKS.findIndex((r) => r.id === current.id)
  return RANKS[idx + 1] ?? null
}
