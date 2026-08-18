import { describe, expect, it } from 'vitest'
import {
  getLanguageLesson,
  languageLessons,
  languagePaths,
  lessonsForPath,
} from './registry'

describe('languages registry', () => {
  it('registers four paths in order', () => {
    expect(languagePaths.map((p) => p.id)).toEqual([
      'java-spring-boot-map',
      'java-advanced',
      'spring-core',
      'spring-boot',
    ])
  })

  it('has unique lesson ids and every lesson quiz is non-empty', () => {
    const ids = languageLessons.map((lesson) => lesson.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(languageLessons.length).toBeGreaterThanOrEqual(24)
    for (const lesson of languageLessons) {
      expect(lesson.quiz.length).toBeGreaterThan(0)
      expect(lesson.teachingSteps.length).toBeGreaterThan(0)
      expect(languagePaths.some((p) => p.id === lesson.pathId)).toBe(true)
    }
  })

  it('looks up lessons and filters by path', () => {
    expect(getLanguageLesson('map-what-is-what')?.title).toMatch(/what is what/i)
    expect(lessonsForPath('spring-boot').length).toBe(8)
    expect(lessonsForPath('java-spring-boot-map').length).toBe(4)
    expect(lessonsForPath('java-advanced').length).toBe(8)
    expect(getLanguageLesson('java-gc-generations')?.order).toBe(2)
  })
})
