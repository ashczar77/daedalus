import type { AcademyTrack, LessonPack } from '../types'
import { fundamentalLessons } from './fundamentals'
import { jqLessons } from './jqTrack'
import { masteryLessons } from './mastery'
import { OFFICIAL_SOLUTIONS } from './officialSolutions'

/** Attach official solutions used by Reveal answer (heavy XP cost). */
function withSolutions(packs: LessonPack[]): LessonPack[] {
  return packs.map((lesson) => ({
    ...lesson,
    solution: lesson.solution ?? OFFICIAL_SOLUTIONS[lesson.id],
  }))
}

/** All Terminal Academy lessons in catalog order. */
export const lessons: LessonPack[] = withSolutions([
  ...fundamentalLessons,
  ...masteryLessons,
  ...jqLessons,
]).sort((a, b) => a.order - b.order)

export function getLesson(id: string): LessonPack | undefined {
  return lessons.find((lesson) => lesson.id === id)
}

export function lessonsForTrack(track: AcademyTrack): LessonPack[] {
  return lessons.filter((lesson) => lesson.track === track)
}

export const TRACK_META: Record<
  AcademyTrack,
  { title: string; blurb: string }
> = {
  fundamentals: {
    title: 'Unix fundamentals',
    blurb: 'Navigation, files, grep, pipes, permissions, and processes.',
  },
  mastery: {
    title: 'Shell mastery',
    blurb: 'Globs, find, cut, tee, quoting, and spaced-practice drills.',
  },
  jq: {
    title: 'jq workshop',
    blurb: 'Filter and reshape JSON from the command line.',
  },
}
