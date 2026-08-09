import { describe, expect, it } from 'vitest'
import { formatIntList, parseIntList } from './parseIntList'

describe('parseIntList', () => {
  it('parses comma/space separated ints', () => {
    expect(parseIntList('1, 2 3')).toEqual({ ok: true, value: [1, 2, 3] })
    expect(formatIntList([1, 2, 3])).toBe('1, 2, 3')
  })

  it('rejects non-integers and out-of-range values', () => {
    expect(parseIntList('1, x').ok).toBe(false)
    expect(parseIntList('1000', { maxVal: 99 }).ok).toBe(false)
  })

  it('enforces length and sorted constraints', () => {
    expect(parseIntList('', { minLen: 1 }).ok).toBe(false)
    expect(parseIntList('1,2,3,4', { maxLen: 3 }).ok).toBe(false)
    expect(parseIntList('3,1,2', { requireSorted: true }).ok).toBe(false)
    expect(parseIntList('1,2,2', { requireSorted: true })).toEqual({
      ok: true,
      value: [1, 2, 2],
    })
  })
})
