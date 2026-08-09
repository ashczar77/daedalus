import type { ShellState } from './shell/state'
import type { CheckSpec } from './check/types'

export type AcademyTrack = 'fundamentals' | 'mastery' | 'jq'

export type LessonGoal = {
  id: string
  label: string
}

/**
 * One gated Terminal Academy lesson.
 * setup is applied when the lesson opens or the learner hits Reset.
 */
export type LessonPack = {
  id: string
  title: string
  track: AcademyTrack
  order: number
  /** Short status-line difficulty */
  level: 'intro' | 'core' | 'advanced'
  summary: string
  prose: string[]
  goals: LessonGoal[]
  hints?: string[]
  /** Override default XP for this lesson (else derived from level). */
  xp?: number
  /** Paths unlocked after this lesson is completed (ids). */
  unlocks: string[]
  /** First lesson in a track sets this so it starts unlocked. */
  startUnlocked?: boolean
  setup: {
    cwd?: string
    files: VfsSpec
    processes?: Array<{ pid: number; name: string; status: 'running' | 'stopped' }>
  }
  checks: CheckSpec[]
}

/** Declarative filesystem tree for lesson fixtures. */
export type VfsSpec = {
  [name: string]: string | VfsSpec
}

export type LessonProgress = {
  completed: string[]
  unlocked: string[]
  /** Lifetime XP from first-time lesson clears. */
  score: number
  /** Hints used on the attempt that first completed each lesson. */
  hintUses: Record<string, number>
}

export type RankInfo = {
  id: string
  title: string
  minScore: number
}

export type CheckResult = {
  ok: boolean
  message: string
  failedGoal?: string
  /** Present when a lesson was newly completed. */
  reward?: {
    xp: number
    score: number
    rank: string
  }
}

export type RunLessonCheck = (state: ShellState, lesson: LessonPack) => CheckResult
