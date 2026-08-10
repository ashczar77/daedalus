import type { CacheAlgo } from '../../types'
import type { CacheEntry, CacheSimState } from './types'

export function findEntry(
  entries: CacheEntry[],
  key: string,
): CacheEntry | undefined {
  return entries.find((e) => e.key === key)
}

/** Pick eviction victim for capacity overflow (not TTL). */
export function pickVictim(
  algo: CacheAlgo,
  entries: CacheEntry[],
): CacheEntry | null {
  if (entries.length === 0) return null
  switch (algo) {
    case 'lru':
      return entries.reduce((best, e) =>
        e.lastUsed < best.lastUsed ? e : best,
      )
    case 'lfu':
      return entries.reduce((best, e) => {
        if (e.freq < best.freq) return e
        if (e.freq === best.freq && e.insertedAt < best.insertedAt) return e
        return best
      })
    case 'fifo':
      return entries.reduce((best, e) =>
        e.insertedAt < best.insertedAt ? e : best,
      )
    default:
      // Pattern labs + TTL: fall back to FIFO when capacity is full.
      return entries.reduce((best, e) =>
        e.insertedAt < best.insertedAt ? e : best,
      )
  }
}

export function isExpired(entry: CacheEntry, tick: number): boolean {
  return entry.expiresAt != null && entry.expiresAt <= tick
}

export function touchEntry(
  entry: CacheEntry,
  tick: number,
  opts?: { bumpFreq?: boolean },
): CacheEntry {
  return {
    ...entry,
    lastUsed: tick,
    freq: opts?.bumpFreq === false ? entry.freq : entry.freq + 1,
  }
}

export function cloneEntries(entries: CacheEntry[]): CacheEntry[] {
  return entries.map((e) => ({ ...e }))
}

export function cloneDb(db: Record<string, string>): Record<string, string> {
  return { ...db }
}

export function summaryHits(state: CacheSimState): string {
  return `${state.hits} hit / ${state.misses} miss`
}
