import type { SystemDesignLab } from '../../types'

export const writeBehindLab: SystemDesignLab = {
  id: 'cache-write-behind',
  kind: 'cache',
  title: 'Write-Behind',
  pathId: 'caching',
  order: 4,
  summary: 'Writes hit the cache immediately; the database is updated later from a pending queue.',
  insight: 'Faster writes, but the database can lag and you must plan for flush and failure.',
  teachingSteps: [
    {
      narrative: 'Sometimes write latency matters more than immediate database durability.',
      why: 'Games, counters, and high-churn feeds often accept a short delay before the DB catches up.',
    },
    {
      narrative: 'Write-behind (also called write-back) stores the new value in the cache right away.',
      why: 'The client gets a fast ack. The write is queued for the database.',
    },
    {
      narrative: 'A later flush pushes pending keys to the database.',
      why: 'Watch the pending queue fill, then a flush trail run cache → database.',
    },
    {
      narrative: 'If the cache crashes before a flush, those writes can be lost unless you add durability.',
      why: 'That is the main risk: speed in exchange for a consistency and durability window.',
    },
    {
      narrative: 'Run the sim and wait for a flush beat after a few writes.',
      why: 'You should see DB values catch up only when the queue drains.',
    },
  ],
  simDefaults: {
    algo: 'write-behind',
    capacity: 4,
    maxArrivals: 12,
    writeBehindFlushEvery: 3,
  },
  tradeoffs: [
    'Pros: write path feels fast; can batch many DB updates into one flush.',
    'Cons: database lags; crash before flush can lose data; harder to reason about freshness.',
    'Use when: write latency dominates and you can tolerate delayed durability (or add a durable queue).',
  ],
  walkthrough: {
    statement: 'Accept writes in the cache first, and sync the database asynchronously.',
    keyIdea: 'Pending queue holds dirty keys until a flush writes them through.',
    approach: [
      'On write, update the cache and enqueue the key.',
      'Acknowledge the client without waiting on the database.',
      'Later, flush pending keys to the database and clear the queue.',
    ],
  },
}
