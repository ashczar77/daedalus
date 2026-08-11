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

  it('registers the CAP theorem path with four labs in order', () => {
    expect(systemDesignPaths.map((p) => p.id)).toContain('cap-theorem')
    const labs = labsForPath('cap-theorem')
    expect(labs).toHaveLength(4)
    expect(labs.map((l) => l.order)).toEqual([1, 2, 3, 4])
    expect(labs.map((l) => l.id)).toEqual([
      'cap-overview',
      'cap-consistency',
      'cap-availability',
      'cap-partition',
    ])
    expect(labs.every((l) => l.teachingSteps.length >= 4)).toBe(true)
    expect(labs.every((l) => l.kind === 'cap')).toBe(true)
  })

  it('registers the Networking & APIs path with ten labs in order', () => {
    expect(systemDesignPaths.map((p) => p.id)).toContain('networking-apis')
    const labs = labsForPath('networking-apis')
    expect(labs).toHaveLength(10)
    expect(labs.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(labs.map((l) => l.id)).toEqual([
      'net-http-basics',
      'net-rest-design',
      'net-http2',
      'net-grpc',
      'net-realtime',
      'net-gateway',
      'net-rate-limit',
      'net-retries',
      'net-circuit-breaker',
      'net-bulkhead',
    ])
    expect(labs.every((l) => l.teachingSteps.length >= 4)).toBe(true)
    expect(labs.every((l) => l.kind === 'network')).toBe(true)
  })

  it('looks up labs by id', () => {
    expect(getSystemDesignLab('lb-round-robin')?.title).toBe('Round Robin')
    expect(getSystemDesignLab('cache-aside')?.title).toBe('Cache-Aside')
    expect(getSystemDesignLab('cap-overview')?.title).toBe('CAP Theorem')
    expect(getSystemDesignLab('net-http-basics')?.title).toBe('HTTP Request & Response')
    expect(getSystemDesignLab('missing')).toBeUndefined()
  })
})
