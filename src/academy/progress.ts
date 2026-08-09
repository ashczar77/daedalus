import type { LessonPack, LessonProgress } from './types'

const STORAGE_KEY = 'daedalus.academy.progress.v1'

export function loadProgress(lessons: LessonPack[]): LessonProgress {
  const starter = lessons.filter((l) => l.startUnlocked).map((l) => l.id)
  const fallback: LessonProgress = {
    completed: [],
    unlocked: [...new Set(starter)],
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as LessonProgress
    if (!Array.isArray(parsed.completed) || !Array.isArray(parsed.unlocked)) {
      return fallback
    }
    const unlocked = new Set([...fallback.unlocked, ...parsed.unlocked])
    return {
      completed: parsed.completed.filter((id) => lessons.some((l) => l.id === id)),
      unlocked: [...unlocked].filter((id) => lessons.some((l) => l.id === id)),
    }
  } catch {
    return fallback
  }
}

export function saveProgress(progress: LessonProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function markComplete(
  progress: LessonProgress,
  lesson: LessonPack,
): LessonProgress {
  const completed = progress.completed.includes(lesson.id)
    ? progress.completed
    : [...progress.completed, lesson.id]
  const unlocked = new Set([...progress.unlocked, ...lesson.unlocks, lesson.id])
  const next = { completed, unlocked: [...unlocked] }
  saveProgress(next)
  return next
}

export function isUnlocked(progress: LessonProgress, lessonId: string): boolean {
  return progress.unlocked.includes(lessonId)
}

export function resetAllProgress(lessons: LessonPack[]): LessonProgress {
  const next = {
    completed: [] as string[],
    unlocked: lessons.filter((l) => l.startUnlocked).map((l) => l.id),
  }
  saveProgress(next)
  return next
}
