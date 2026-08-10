import { describe, expect, it } from 'vitest'
import {
  getSystemDesignLab,
  labsForPath,
  systemDesignLabs,
  systemDesignPaths,
} from './registry'

describe('system design registry', () => {
  it('has unique lab ids', () => {
    const ids = systemDesignLabs.map((lab) => lab.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('registers the load-balancing path with four labs in order', () => {
    expect(systemDesignPaths.map((p) => p.id)).toContain('load-balancing')
    const labs = labsForPath('load-balancing')
    expect(labs).toHaveLength(4)
    expect(labs.map((l) => l.order)).toEqual([1, 2, 3, 4])
    expect(labs.every((l) => l.teachingSteps.length >= 4)).toBe(true)
    expect(labs.every((l) => l.kind === 'load-balancer')).toBe(true)
  })

  it('registers the caching path with eight labs in order', () => {
    expect(systemDesignPaths.map((p) => p.id)).toContain('caching')
    const labs = labsForPath('caching')
    expect(labs).toHaveLength(8)
    expect(labs.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(labs.every((l) => l.teachingSteps.length >= 4)).toBe(true)
    expect(labs.every((l) => l.kind === 'cache')).toBe(true)
  })

  it('looks up labs by id', () => {
    expect(getSystemDesignLab('lb-round-robin')?.title).toBe('Round Robin')
    expect(getSystemDesignLab('cache-aside')?.title).toBe('Cache-Aside')
    expect(getSystemDesignLab('missing')).toBeUndefined()
  })
})
