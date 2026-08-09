/**
 * Integration: default inputs for generator-backed packs produce steps.
 */
import { describe, expect, it } from 'vitest'
import { problems } from './registry'

describe('problem pack generators', () => {
  it('registry has unique ids', () => {
    const ids = problems.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const problem of problems) {
    it(`${problem.id} default input generates a non-empty walk`, () => {
      expect(problem.languages.java.length).toBeGreaterThan(0)
      expect(problem.languages.kotlin.length).toBeGreaterThan(0)
      expect(problem.languages.python.length).toBeGreaterThan(0)

      let steps = problem.steps
      if (problem.input) {
        const parsed = problem.input.parse(problem.input.defaultRaw)
        expect(parsed.ok, `${problem.id} defaultRaw invalid`).toBe(true)
        if (parsed.ok) {
          steps = problem.input.generateSteps(parsed.value)
        }
      }
      expect(steps.length).toBeGreaterThan(0)
      expect(steps[0]?.narrative ?? steps[0]?.message).toBeTruthy()
      for (const step of steps) {
        expect(step.codeFocus.java).toBeGreaterThan(0)
        expect(step.codeFocus.kotlin).toBeGreaterThan(0)
        expect(step.codeFocus.python).toBeGreaterThan(0)
      }
    })
  }
})
