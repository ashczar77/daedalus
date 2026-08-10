import { describe, expect, it } from 'vitest'
import { formatCharGrid, parseCharGrid } from './parseCharGrid'

describe('parseCharGrid', () => {
  it('parses JSON grids', () => {
    expect(parseCharGrid('[["1","1"],["0","1"]]')).toEqual({
      ok: true,
      value: [
        ['1', '1'],
        ['0', '1'],
      ],
    })
  })

  it('parses semicolon and compact rows', () => {
    expect(parseCharGrid('1 1 0; 0 1 0')).toEqual({
      ok: true,
      value: [
        ['1', '1', '0'],
        ['0', '1', '0'],
      ],
    })
    expect(parseCharGrid('110\n010')).toEqual({
      ok: true,
      value: [
        ['1', '1', '0'],
        ['0', '1', '0'],
      ],
    })
  })

  it('rejects jagged or oversized grids', () => {
    expect(parseCharGrid('10; 101').ok).toBe(false)
    expect(parseCharGrid('11111').ok).toBe(false)
  })

  it('formats a compact label', () => {
    expect(formatCharGrid([['1', '0'], ['0', '1']])).toBe('10 / 01')
  })
})
