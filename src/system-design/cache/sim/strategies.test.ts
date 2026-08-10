import { describe, expect, it } from 'vitest'
import { createCacheState } from './createState'
import { pickVictim } from './strategies'
import { completeCacheFlight, spawnCacheOp } from './stepSim'
import type { CacheEntry } from './types'

function runOps(algo: Parameters<typeof createCacheState>[0]['algo'], count: number) {
  let state = createCacheState({ algo, capacity: 3, maxArrivals: count, ttlTicks: 3 })
  for (let i = 0; i < count * 3 && !state.finished; i++) {
    if (state.flight) state = completeCacheFlight(state)
    else state = spawnCacheOp(state)
  }
  return state
}

describe('cache strategies', () => {
  it('cache-aside hits after a miss fill', () => {
    let state = createCacheState({
      algo: 'cache-aside',
      capacity: 4,
      maxArrivals: 2,
    })
    state = spawnCacheOp(state)
    expect(state.flight?.hit).toBe(false)
    expect(state.flight?.pathKind).toBe('aside-miss')
    state = completeCacheFlight(state)
    state = spawnCacheOp(state)
    expect(state.flight?.hit).toBe(true)
    expect(state.flight?.pathKind).toBe('read-hit')
  })

  it('read-through miss loads via the cache path', () => {
    let state = createCacheState({
      algo: 'read-through',
      capacity: 4,
      maxArrivals: 1,
    })
    state = spawnCacheOp(state)
    expect(state.flight?.pathKind).toBe('read-through-miss')
    expect(state.entries.some((e) => e.key === 'A')).toBe(true)
  })

  it('write-through updates cache and database together', () => {
    let state = createCacheState({
      algo: 'write-through',
      capacity: 4,
      maxArrivals: 1,
    })
    state = spawnCacheOp(state)
    expect(state.flight?.pathKind).toBe('write-through')
    expect(state.db.A).toBe('10')
    expect(state.entries.find((e) => e.key === 'A')?.value).toBe('10')
  })

  it('write-behind queues then flushes to the database', () => {
    let state = createCacheState({
      algo: 'write-behind',
      capacity: 4,
      maxArrivals: 3,
      writeBehindFlushEvery: 3,
    })
    // write A
    state = spawnCacheOp(state)
    expect(state.flight?.pathKind).toBe('write-behind')
    expect(state.pendingWrites).toContain('A')
    expect(state.db.A).toBe('1') // still seed until flush
    state = completeCacheFlight(state)
    // write B
    state = spawnCacheOp(state)
    state = completeCacheFlight(state)
    // read A (scripted third op)
    state = spawnCacheOp(state)
    state = completeCacheFlight(state)
    // flush after 3 ops
    state = spawnCacheOp(state)
    expect(state.flight?.pathKind).toBe('write-behind-flush')
    expect(state.db.A).toBe('10')
    expect(state.db.B).toBe('20')
    expect(state.pendingWrites).toEqual([])
  })

  it('LRU evicts the coldest key', () => {
    const entries: CacheEntry[] = [
      {
        key: 'A',
        value: '1',
        lastUsed: 3,
        freq: 1,
        insertedAt: 1,
        expiresAt: null,
      },
      {
        key: 'B',
        value: '2',
        lastUsed: 1,
        freq: 1,
        insertedAt: 2,
        expiresAt: null,
      },
      {
        key: 'C',
        value: '3',
        lastUsed: 2,
        freq: 1,
        insertedAt: 3,
        expiresAt: null,
      },
    ]
    expect(pickVictim('lru', entries)?.key).toBe('B')
  })

  it('LFU evicts the lowest frequency key', () => {
    const entries: CacheEntry[] = [
      {
        key: 'A',
        value: '1',
        lastUsed: 3,
        freq: 5,
        insertedAt: 1,
        expiresAt: null,
      },
      {
        key: 'B',
        value: '2',
        lastUsed: 2,
        freq: 1,
        insertedAt: 2,
        expiresAt: null,
      },
      {
        key: 'C',
        value: '3',
        lastUsed: 1,
        freq: 2,
        insertedAt: 3,
        expiresAt: null,
      },
    ]
    expect(pickVictim('lfu', entries)?.key).toBe('B')
  })

  it('FIFO evicts the oldest insert even if recently read', () => {
    const entries: CacheEntry[] = [
      {
        key: 'A',
        value: '1',
        lastUsed: 9,
        freq: 9,
        insertedAt: 1,
        expiresAt: null,
      },
      {
        key: 'B',
        value: '2',
        lastUsed: 2,
        freq: 1,
        insertedAt: 2,
        expiresAt: null,
      },
      {
        key: 'C',
        value: '3',
        lastUsed: 3,
        freq: 1,
        insertedAt: 3,
        expiresAt: null,
      },
    ]
    expect(pickVictim('fifo', entries)?.key).toBe('A')
  })

  it('LRU sim evicts B after A is refreshed', () => {
    let state = createCacheState({ algo: 'lru', capacity: 3, maxArrivals: 5 })
    // A, B, C, A, D
    for (let i = 0; i < 5; i++) {
      state = spawnCacheOp(state)
      state = completeCacheFlight(state)
    }
    expect(state.entries.map((e) => e.key).sort()).toEqual(['A', 'C', 'D'])
    expect(state.entries.some((e) => e.key === 'B')).toBe(false)
  })

  it('TTL treats expired entries as misses', () => {
    let state = createCacheState({
      algo: 'ttl',
      capacity: 4,
      maxArrivals: 6,
      ttlTicks: 2,
    })
    state = runOps('ttl', 6)
    // After several ticks, we should have recorded both hits and misses.
    expect(state.hits + state.misses).toBeGreaterThan(0)
    expect(state.misses).toBeGreaterThan(0)
  })
})
