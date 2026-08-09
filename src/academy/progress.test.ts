import { beforeEach, describe, expect, it } from 'vitest'
import { installLocalStorageMock } from '../test/localStorageMock'
import { getLesson, lessons } from './lessons/registry'
import {
  isUnlocked,
  loadProgress,
  markComplete,
  resetAllProgress,
} from './progress'

describe('academy progress', () => {
  beforeEach(() => {
    installLocalStorageMock()
  })

  it('starts with only startUnlocked lessons', () => {
    const progress = loadProgress(lessons)
    expect(progress.unlocked).toEqual(['fund-pwd'])
    expect(progress.completed).toEqual([])
    expect(progress.score).toBe(0)
    expect(isUnlocked(progress, 'fund-pwd')).toBe(true)
    expect(isUnlocked(progress, 'mast-globs')).toBe(false)
  })

  it('awards XP once and unlocks the next lesson', () => {
    let progress = loadProgress(lessons)
    const pwd = getLesson('fund-pwd')!
    const first = markComplete(progress, pwd, 0)
    expect(first.alreadyComplete).toBe(false)
    expect(first.xpGained).toBe(10)
    expect(first.progress.score).toBe(10)
    expect(first.progress.completed).toContain('fund-pwd')
    expect(first.progress.unlocked).toContain('fund-ls')

    progress = first.progress
    const again = markComplete(progress, pwd, 0)
    expect(again.alreadyComplete).toBe(true)
    expect(again.xpGained).toBe(0)
    expect(again.progress.score).toBe(10)
  })

  it('re-derives unlocks when curriculum grows', () => {
    localStorage.setItem(
      'daedalus.academy.progress.v1',
      JSON.stringify({
        completed: ['fund-pwd', 'fund-ps-kill'],
        unlocked: ['fund-pwd', 'jq-identity'],
      }),
    )
    const progress = loadProgress(lessons)
    expect(progress.unlocked).toContain('mast-globs')
    expect(progress.score).toBeGreaterThan(0)
  })

  it('resets progress cleanly', () => {
    let progress = loadProgress(lessons)
    progress = markComplete(progress, getLesson('fund-pwd')!, 0).progress
    progress = resetAllProgress(lessons)
    expect(progress.completed).toEqual([])
    expect(progress.score).toBe(0)
    expect(progress.unlocked).toEqual(['fund-pwd'])
  })
})
