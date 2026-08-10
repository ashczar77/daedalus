import type { SystemDesignLab } from '../../types'

export const writeThroughLab: SystemDesignLab = {
  id: 'cache-write-through',
  kind: 'cache',
  title: 'Write-Through',
  pathId: 'caching',
  order: 3,
  summary: 'Every write updates the cache and the database before acknowledging the client.',
  insight: 'Cache and database stay in sync on writes, at the cost of slower write latency.',
  teachingSteps: [
    {
      narrative: 'Writes are the hard part of caching: the cache can lie if it falls behind the database.',
      why: 'A write that only updates the cache (or only the DB) creates a window where they disagree.',
    },
    {
      narrative: 'Write-through updates both places before the client gets success.',
      why: 'This is a write path: App → Cache (WRITE) → DB, then ack. It is not a read miss loading the DB.',
    },
    {
      narrative: 'Reads can then trust the cache more often, because writes already refreshed it.',
      why: 'You still need eviction and capacity rules, but write skew is smaller.',
    },
    {
      narrative: 'The tradeoff is write latency: each write waits on the slower store (usually the database).',
      why: 'If writes are rare and reads dominate, that cost may be fine.',
    },
    {
      narrative: 'Run the sim: every write should land in both panels before the ack returns.',
      why: 'Compare with read-through (cache fetches on miss) and write-behind (DB waits in a queue).',
    },
  ],
  simDefaults: {
    algo: 'write-through',
    capacity: 4,
    maxArrivals: 12,
  },
  tradeoffs: [
    'Pros: strong cache/DB agreement on writes; simpler mental model than async flush.',
    'Cons: writes are as slow as the database; bursty write load hits both systems at once.',
    'Use when: you care about freshness on write and can afford the extra write latency.',
  ],
  walkthrough: {
    statement: 'Keep cache and database aligned by writing to both before ack.',
    keyIdea: 'Write path blocks until cache and DB both have the new value.',
    approach: [
      'Client sends a write.',
      'Update the cache entry and the database record.',
      'Only then acknowledge success to the client.',
    ],
  },
}
