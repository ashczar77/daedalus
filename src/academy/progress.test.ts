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
    expect(progress.revealed).toEqual([])
    expect(isUnlocked(progress, 'fund-pwd')).toBe(true)
  })

  it('awards full XP without assist and reduced XP after reveal', () => {
    let progress = loadProgress(lessons)
    const pwd = getLesson('fund-pwd')!
    const clean = markComplete(progress, pwd, {})
    expect(clean.xpGained).toBe(10)
    expect(clean.progress.revealed).toEqual([])

    progress = resetAllProgress(lessons)
    const spoiled = markComplete(progress, pwd, { revealedSolution: true })
    expect(spoiled.xpGained).toBe(2)
    expect(spoiled.progress.revealed).toContain('fund-pwd')
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
  })
})
