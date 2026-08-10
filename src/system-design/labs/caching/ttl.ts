import type { SystemDesignLab } from '../../types'

export const ttlLab: SystemDesignLab = {
  id: 'cache-ttl',
  kind: 'cache',
  title: 'TTL Expiry',
  pathId: 'caching',
  order: 8,
  summary: 'Each entry expires after a lifetime, even if the cache is not full.',
  insight: 'Time-to-live bounds staleness. Expiry is not the same as capacity eviction.',
  teachingSteps: [
    {
      narrative: 'TTL means time to live: every cached value gets a deadline.',
      why: 'After the deadline, the entry is treated as gone. The next read misses and reloads.',
    },
    {
      narrative: 'Unlike LRU or FIFO, expiry can free a slot without a new insert forcing it out.',
      why: 'Stale data leaves because the clock said so, not because capacity ran out.',
    },
    {
      narrative: 'In the sim, each slot shows a remaining ttl countdown.',
      why: 'When it hits zero, that key will miss on the next read even if you just used it recently.',
    },
    {
      narrative: 'Short TTLs mean fresher data and more misses. Long TTLs mean fewer misses and more staleness.',
      why: 'Picking TTL is a product decision as much as a systems one.',
    },
    {
      narrative: 'Run the sim and watch a key expire mid-burst, then reload from the database.',
      why: 'That miss is about time, not about capacity.',
    },
  ],
  simDefaults: {
    algo: 'ttl',
    capacity: 4,
    maxArrivals: 12,
    ttlTicks: 4,
  },
  tradeoffs: [
    'Pros: caps how long stale data can live; simple to explain to product teams.',
    'Cons: fixed TTL is blunt; popular keys still reload on a schedule; needs clock discipline.',
    'Use when: you can name an acceptable staleness window and want automatic expiry.',
  ],
  walkthrough: {
    statement: 'Expire cache entries after a fixed lifetime.',
    keyIdea: 'Store expiresAt; on read, treat expired entries as misses and reload.',
    approach: [
      'On insert, set expiresAt = now + ttl.',
      'Before serving a hit, check the deadline.',
      'If expired, remove it and load fresh from the database.',
    ],
  },
}
