import { describe, expect, it } from 'vitest'
import { SPEEDS, type PlaybackSpeed } from './usePlayback'

describe('playback SPEEDS', () => {
  it('includes slow and fast multipliers', () => {
    expect(SPEEDS).toEqual([0.25, 0.5, 1, 1.5, 2, 3, 4, 8])
  })

  it('cycles wrap from last back to first', () => {
    const current: PlaybackSpeed = SPEEDS[SPEEDS.length - 1]!
    const idx = SPEEDS.indexOf(current)
    const next = SPEEDS[(idx + 1) % SPEEDS.length]
    expect(next).toBe(0.25)
  })
})
