import type { LanguageProgress } from './types'

const STORAGE_KEY = 'daedalus.languages.progress.v1'

export function loadLanguageProgress(): LanguageProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completed: [] }
    const parsed = JSON.parse(raw) as Partial<LanguageProgress>
    const completed = Array.isArray(parsed.completed)
      ? parsed.completed.filter((id): id is string => typeof id === 'string')
      : []
    return { completed: [...new Set(completed)] }
  } catch {
    return { completed: [] }
  }
}

export function saveLanguageProgress(progress: LanguageProgress): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completed: [...new Set(progress.completed)] }),
    )
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function markLessonComplete(
  progress: LanguageProgress,
  lessonId: string,
): LanguageProgress {
  if (progress.completed.includes(lessonId)) return progress
  const next = { completed: [...progress.completed, lessonId] }
  saveLanguageProgress(next)
  return next
}

export function isLessonComplete(
  progress: LanguageProgress,
  lessonId: string,
): boolean {
  return progress.completed.includes(lessonId)
}
