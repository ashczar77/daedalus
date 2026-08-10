import type { CacheAlgo } from '../../types'

export type CacheEntry = {
  key: string
  value: string
  lastUsed: number
  freq: number
  insertedAt: number
  expiresAt: number | null
}

export type CacheOpKind = 'read' | 'write'

export type CacheFlight = {
  id: string
  op: CacheOpKind
  key: string
  value: string
  hit: boolean
  reason: string
  /** SVG path kind for the viz. */
  pathKind:
    | 'read-hit'
    | 'aside-miss'
    | 'aside-write'
    | 'read-through-miss'
    | 'write-through'
    | 'write-behind'
    | 'write-behind-flush'
    | 'ttl-expire'
  evictedKey: string | null
  pendingFlushKeys: string[]
}

export type CacheSimState = {
  algo: CacheAlgo
  capacity: number
  ttlTicks: number
  writeBehindFlushEvery: number
  /** Authoritative store. */
  db: Record<string, string>
  entries: CacheEntry[]
  /** Write-behind queue of keys waiting for DB. */
  pendingWrites: string[]
  flight: CacheFlight | null
  tick: number
  nextOpIndex: number
  arrivalsCount: number
  maxArrivals: number
  hits: number
  misses: number
  finished: boolean
  /** Scripted ops for this lab. */
  script: CacheScriptOp[]
}

export type CacheScriptOp = {
  op: CacheOpKind
  key: string
  value?: string
}

export const DEFAULT_CACHE_MAX_ARRIVALS = 12
export const CACHE_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'] as const
