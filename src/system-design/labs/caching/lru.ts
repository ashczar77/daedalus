import type { SystemDesignLab } from '../../types'

export const lruLab: SystemDesignLab = {
  id: 'cache-lru',
  kind: 'cache',
  title: 'LRU Eviction',
  pathId: 'caching',
  order: 5,
  summary: 'When the cache is full, remove the entry that was used least recently.',
  insight: 'Recency is a simple proxy for "still useful." Re-reading a key keeps it alive.',
  teachingSteps: [
    {
      narrative: 'Caches are finite. When they fill, something must leave to make room.',
      why: 'An eviction policy is the rule for choosing the victim.',
    },
    {
      narrative: 'LRU means Least Recently Used: drop the key that has gone longest without a touch.',
      why: 'A fresh read moves a key to the "hot" end. Idle keys drift toward the cold end.',
    },
    {
      narrative: 'In the sim, capacity is small so you will see overflows quickly.',
      why: 'Fill A, B, C, then re-read A, then insert D. B should leave if it stayed cold.',
    },
    {
      narrative: 'LRU fails when a one-time scan touches many keys and pushes out the truly hot set.',
      why: 'That "scan resistance" problem is why some systems prefer LFU or hybrid policies.',
    },
    {
      narrative: 'Run the sim and watch COLD / HOT labels, then the VICTIM when a new key needs a slot.',
      why: 'Slots are ordered cold → hot. The coldest lastUsed timestamp should be the one that disappears.',
    },
  ],
  simDefaults: {
    algo: 'lru',
    capacity: 3,
    maxArrivals: 12,
  },
  tradeoffs: [
    'Pros: intuitive; good default for many workloads; cheap to approximate.',
    'Cons: vulnerable to scans that touch once and pollute the cache.',
    'Use when: recent access is a decent signal and you want a familiar policy.',
  ],
  walkthrough: {
    statement: 'Evict the least recently used entry when the cache is full.',
    keyIdea: 'Track lastUsed; on overflow remove the minimum.',
    approach: [
      'On hit or fill, update lastUsed for that key.',
      'When inserting into a full cache, pick the smallest lastUsed.',
      'Remove that victim, then insert the new key.',
    ],
  },
}
