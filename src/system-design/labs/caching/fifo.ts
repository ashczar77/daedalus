import type { SystemDesignLab } from '../../types'

export const fifoLab: SystemDesignLab = {
  id: 'cache-fifo',
  kind: 'cache',
  title: 'FIFO Eviction',
  pathId: 'caching',
  order: 7,
  summary: 'When the cache is full, remove the oldest inserted entry, ignoring re-reads.',
  insight: 'Simple queue order: first in, first out. Popularity does not protect a key.',
  teachingSteps: [
    {
      narrative: 'FIFO treats the cache like a queue of arrivals.',
      why: 'The key that entered earliest is the first to leave when you need space.',
    },
    {
      narrative: 'Re-reading a key does not move it in line.',
      why: 'That is the contrast with LRU. In FIFO, touching A still leaves A as the oldest insert.',
    },
    {
      narrative: 'Fill A, B, C, re-read A, then insert D. A still leaves.',
      why: 'Watch the in= insert timestamps. Lowest insert time is the victim.',
    },
    {
      narrative: 'FIFO is easy to implement and explain, but it can drop hot keys that arrived early.',
      why: 'Use it for teaching, demos, or when insert order is truly what you want.',
    },
    {
      narrative: 'Run the sim and compare the victim to what LRU would have chosen.',
      why: 'Same capacity, different rule, different survivor.',
    },
  ],
  simDefaults: {
    algo: 'fifo',
    capacity: 3,
    maxArrivals: 12,
  },
  tradeoffs: [
    'Pros: tiny state; easy to reason about; predictable.',
    'Cons: ignores popularity and recency after insert; can evict hot early keys.',
    'Use when: simplicity matters more than hit rate, or insert order is the real policy.',
  ],
  walkthrough: {
    statement: 'Evict the oldest inserted entry when the cache is full.',
    keyIdea: 'Track insertedAt; on overflow remove the minimum. Hits do not update insert time.',
    approach: [
      'On first insert, record insertedAt.',
      'On hit, leave insertedAt alone.',
      'When full, evict the smallest insertedAt, then insert the new key.',
    ],
  },
}
