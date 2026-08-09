/**
 * Integration: each lesson's official solution clears Check,
 * and free hints must not be copy-paste answers.
 */
import { describe, expect, it } from 'vitest'
import { runChecks } from '../check/runChecks'
import { executeLine } from '../shell/execute'
import { createShellState } from '../shell/state'
import { getLesson, lessons } from './registry'

describe('lesson solutions (integration)', () => {
  it('attaches an official solution for every lesson', () => {
    for (const lesson of lessons) {
      expect(
        lesson.solution?.length,
        `missing solution for ${lesson.id}`,
      ).toBeGreaterThan(0)
    }
  })

  it('keeps free hints as nudges, not full solution lines', () => {
    for (const lesson of lessons) {
      const solutionLines = new Set(lesson.solution ?? [])
      for (const hint of lesson.hints ?? []) {
        expect(
          solutionLines.has(hint),
          `${lesson.id} hint leaks official solution: ${hint}`,
        ).toBe(false)
        // Hints should not look like a full shell pipeline answer.
        expect(hint.includes('|') && hint.trim().startsWith('cat ')).toBe(false)
      }
    }
  })

  for (const lesson of lessons) {
    it(`clears ${lesson.id}`, () => {
      const state = createShellState(lesson.setup)
      for (const cmd of lesson.solution!) {
        executeLine(state, cmd)
      }
      const result = runChecks(state, lesson)
      expect(result, result.message).toMatchObject({ ok: true })
    })
  }

  it('rejects an empty shell against fund-pwd', () => {
    const lesson = getLesson('fund-pwd')!
    const state = createShellState(lesson.setup)
    expect(runChecks(state, lesson).ok).toBe(false)
  })
})
