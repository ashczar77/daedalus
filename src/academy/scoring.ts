import type { LessonPack, RankInfo } from './types'

/** Base XP awarded on first completion by lesson level. */
export const XP_BY_LEVEL: Record<LessonPack['level'], number> = {
  intro: 10,
  core: 25,
  advanced: 40,
}

export const RANKS: RankInfo[] = [
  { id: 'cadet', title: 'Cadet', minScore: 0 },
  { id: 'operator', title: 'Operator', minScore: 50 },
  { id: 'shellwright', title: 'Shellwright', minScore: 150 },
  { id: 'adept', title: 'Terminal Adept', minScore: 300 },
  { id: 'master', title: 'Master Cadet', minScore: 500 },
]

export function xpForLesson(lesson: LessonPack, hintsUsed = 0): number {
  const base = lesson.xp ?? XP_BY_LEVEL[lesson.level]
  const penalty = Math.min(Math.floor(base / 2), hintsUsed * 3)
  return Math.max(5, base - penalty)
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
