import { xpForLesson, type AssistUsage } from './scoring'
import type { LessonPack, LessonProgress } from './types'

const STORAGE_KEY = 'daedalus.academy.progress.v2'
const LEGACY_KEY = 'daedalus.academy.progress.v1'

function emptyProgress(lessons: LessonPack[]): LessonProgress {
  return {
    completed: [],
    unlocked: lessons.filter((l) => l.startUnlocked).map((l) => l.id),
    score: 0,
    hintUses: {},
    revealed: [],
  }
}

function sanitize(progress: LessonProgress, lessons: LessonPack[]): LessonProgress {
  const byId = new Map(lessons.map((l) => [l.id, l]))
  const ids = new Set(byId.keys())
  const starter = lessons.filter((l) => l.startUnlocked).map((l) => l.id)
  const completed = progress.completed.filter((id) => ids.has(id))
  const unlocked = new Set([
    ...starter,
    ...progress.unlocked.filter((id) => ids.has(id)),
  ])
  for (const id of completed) {
    unlocked.add(id)
    const lesson = byId.get(id)
    for (const nextId of lesson?.unlocks ?? []) unlocked.add(nextId)
  }
  const hintUses: Record<string, number> = {}
  for (const [id, n] of Object.entries(progress.hintUses ?? {})) {
    if (ids.has(id)) hintUses[id] = n
  }
  const revealed = (progress.revealed ?? []).filter((id) => ids.has(id))
  let score = Math.max(0, Number(progress.score) || 0)
  if (score === 0 && completed.length > 0 && !(progress.score > 0)) {
    score = completed.reduce((sum, id) => {
      const lesson = byId.get(id)
      return lesson ? sum + xpForLesson(lesson, {}) : sum
    }, 0)
  }
  return {
    completed,
    unlocked: [...unlocked],
    score,
    hintUses,
    revealed,
  }
}

export function loadProgress(lessons: LessonPack[]): LessonProgress {
  const fallback = emptyProgress(lessons)
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<LessonProgress>
    if (!Array.isArray(parsed.completed) || !Array.isArray(parsed.unlocked)) {
      return fallback
    }
    return sanitize(
      {
        completed: parsed.completed,
        unlocked: parsed.unlocked,
        score: parsed.score ?? 0,
        hintUses: parsed.hintUses ?? {},
        revealed: parsed.revealed ?? [],
      },
      lessons,
    )
  } catch {
    return fallback
  }
}

export function saveProgress(progress: LessonProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export type CompleteResult = {
  progress: LessonProgress
  xpGained: number
  alreadyComplete: boolean
}

export function markComplete(
  progress: LessonProgress,
  lesson: LessonPack,
  assist: AssistUsage = {},
): CompleteResult {
  const alreadyComplete = progress.completed.includes(lesson.id)
  if (alreadyComplete) {
    const unlocked = new Set([...progress.unlocked, ...lesson.unlocks, lesson.id])
    const next = { ...progress, unlocked: [...unlocked] }
    saveProgress(next)
    return { progress: next, xpGained: 0, alreadyComplete: true }
  }

  const xpGained = xpForLesson(lesson, assist)
  const completed = [...progress.completed, lesson.id]
  const unlocked = new Set([...progress.unlocked, ...lesson.unlocks, lesson.id])
  const hintUses = {
    ...progress.hintUses,
    [lesson.id]: assist.hintsUsed ?? 0,
  }
  const revealed = assist.revealedSolution
    ? [...new Set([...progress.revealed, lesson.id])]
    : progress.revealed
  const next: LessonProgress = {
    completed,
    unlocked: [...unlocked],
    score: progress.score + xpGained,
    hintUses,
    revealed,
  }
  saveProgress(next)
  return { progress: next, xpGained, alreadyComplete: false }
}

export function isUnlocked(progress: LessonProgress, lessonId: string): boolean {
  return progress.unlocked.includes(lessonId)
}

export function resetAllProgress(lessons: LessonPack[]): LessonProgress {
  const next = emptyProgress(lessons)
  saveProgress(next)
  localStorage.removeItem(LEGACY_KEY)
  return next
}
