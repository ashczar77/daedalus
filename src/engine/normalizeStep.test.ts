import { describe, expect, it } from 'vitest'
import { normalizeStep } from './normalizeStep'
import type { Step } from './types'

describe('normalizeStep', () => {
  it('passes through rich storytelling steps', () => {
    const step: Step = {
      id: 1,
      narrative: 'Enter DFS',
      why: 'Root case',
      codeFocus: { java: 10, kotlin: 8, python: 12 },
      callStack: [{ name: 'dfs', locals: { node: 't0' }, active: true }],
      heap: [
        {
          id: 'tree',
          kind: 'tree',
          label: 'root',
          nodes: [{ id: 't0', value: 1, left: null, right: null }],
          rootId: 't0',
        },
      ],
    }
    const normalized = normalizeStep(step)
    expect(normalized.narrative).toBe('Enter DFS')
    expect(normalized.callStack[0]?.name).toBe('dfs')
    expect(normalized.heap[0]?.kind).toBe('tree')
  })

  it('adapts legacy scene + variables packs', () => {
    const step: Step = {
      id: 2,
      message: 'Compare',
      codeFocus: { java: 1, kotlin: 1, python: 1 },
      scene: {
        type: 'array',
        values: [1, 2, 3],
        highlights: [{ index: 1, role: 'compare' }],
      },
      variables: { i: 1 },
    }
    const normalized = normalizeStep(step)
    expect(normalized.narrative).toBe('Compare')
    expect(normalized.heap[0]).toMatchObject({
      kind: 'array',
      values: [1, 2, 3],
    })
    expect(normalized.callStack[0]?.locals).toEqual({ i: 1 })
    expect(normalized.callStack.some((f) => f.active)).toBe(true)
  })
})
