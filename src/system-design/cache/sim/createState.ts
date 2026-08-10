import type { CacheSimDefaults } from '../../types'
import type { CacheScriptOp, CacheSimState } from './types'
import { DEFAULT_CACHE_MAX_ARRIVALS } from './types'

const DB_SEED: Record<string, string> = {
  A: '1',
  B: '2',
  C: '3',
  D: '4',
  E: '5',
  F: '6',
}

/** Scripted ops tuned so each strategy shows its decision rule. */
export function buildScript(algo: CacheSimDefaults['algo']): CacheScriptOp[] {
  switch (algo) {
    case 'cache-aside':
      return [
        { op: 'read', key: 'A' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'B' },
        { op: 'write', key: 'B', value: '20' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'C' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'C' },
        { op: 'write', key: 'D', value: '40' },
        { op: 'read', key: 'D' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'E' },
      ]
    case 'read-through':
      return [
        { op: 'read', key: 'A' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'C' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'D' },
        { op: 'read', key: 'C' },
        { op: 'read', key: 'E' },
        { op: 'read', key: 'D' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'B' },
      ]
    case 'write-through':
      return [
        { op: 'write', key: 'A', value: '10' },
        { op: 'read', key: 'A' },
        { op: 'write', key: 'B', value: '20' },
        { op: 'write', key: 'C', value: '30' },
        { op: 'read', key: 'B' },
        { op: 'write', key: 'A', value: '11' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'C' },
        { op: 'write', key: 'D', value: '40' },
        { op: 'read', key: 'D' },
        { op: 'write', key: 'B', value: '21' },
        { op: 'read', key: 'B' },
      ]
    case 'write-behind':
      return [
        { op: 'write', key: 'A', value: '10' },
        { op: 'write', key: 'B', value: '20' },
        { op: 'read', key: 'A' },
        { op: 'write', key: 'C', value: '30' },
        { op: 'read', key: 'B' },
        { op: 'write', key: 'A', value: '11' },
        { op: 'read', key: 'C' },
        { op: 'write', key: 'D', value: '40' },
        { op: 'read', key: 'A' },
        { op: 'write', key: 'E', value: '50' },
        { op: 'read', key: 'D' },
        { op: 'read', key: 'E' },
      ]
    case 'lru':
      return [
        { op: 'read', key: 'A' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'C' },
        { op: 'read', key: 'A' }, // A becomes newest
        { op: 'read', key: 'D' }, // should evict B (coldest)
        { op: 'read', key: 'B' }, // miss, may evict C
        { op: 'read', key: 'C' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'E' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'D' },
        { op: 'read', key: 'B' },
      ]
    case 'lfu':
      return [
        { op: 'read', key: 'A' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'C' },
        { op: 'read', key: 'A' }, // A freq high
        { op: 'read', key: 'D' }, // evict lowest freq (B or C)
        { op: 'read', key: 'B' },
        { op: 'read', key: 'C' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'E' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'D' },
      ]
    case 'fifo':
      return [
        { op: 'read', key: 'A' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'C' },
        { op: 'read', key: 'A' }, // does not protect A from FIFO
        { op: 'read', key: 'D' }, // evict A (oldest insert)
        { op: 'read', key: 'E' }, // evict B
        { op: 'read', key: 'A' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'C' },
        { op: 'read', key: 'F' },
        { op: 'read', key: 'D' },
        { op: 'read', key: 'E' },
      ]
    case 'ttl':
      return [
        { op: 'read', key: 'A' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'C' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'A' }, // may expire mid-burst
        { op: 'read', key: 'D' },
        { op: 'read', key: 'A' },
        { op: 'read', key: 'B' },
        { op: 'read', key: 'C' },
        { op: 'read', key: 'E' },
        { op: 'read', key: 'A' },
      ]
    default: {
      const _exhaustive: never = algo
      return _exhaustive
    }
  }
}

export function createCacheState(defaults: CacheSimDefaults): CacheSimState {
  const script = buildScript(defaults.algo)
  const maxArrivals = Math.min(
    defaults.maxArrivals ?? DEFAULT_CACHE_MAX_ARRIVALS,
    script.length,
  )
  return {
    algo: defaults.algo,
    capacity: defaults.capacity,
    ttlTicks: defaults.ttlTicks ?? 4,
    writeBehindFlushEvery: defaults.writeBehindFlushEvery ?? 3,
    db: { ...DB_SEED },
    entries: [],
    pendingWrites: [],
    flight: null,
    tick: 0,
    nextOpIndex: 0,
    arrivalsCount: 0,
    maxArrivals,
    hits: 0,
    misses: 0,
    finished: false,
    script: script.slice(0, maxArrivals),
  }
}
