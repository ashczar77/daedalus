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
  /**
   * Progressive nudges only - never the full command sequence.
   * Full answers live in `solution` and cost most of the XP to reveal.
   */
  hints?: string[]
  /** Exact commands that clear the check; shown only via Reveal answer. */
  solution?: string[]
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
  /** Nudge hints used on the attempt that first completed each lesson. */
  hintUses: Record<string, number>
  /** Lessons where the learner revealed the full official solution. */
  revealed: string[]
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
