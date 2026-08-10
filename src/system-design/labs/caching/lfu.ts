import type { SystemDesignLab } from '../../types'

export const lfuLab: SystemDesignLab = {
  id: 'cache-lfu',
  kind: 'cache',
  title: 'LFU Eviction',
  pathId: 'caching',
  order: 6,
  summary: 'When the cache is full, remove the entry with the lowest access count.',
  insight: 'Frequency favors keys that keep getting hit, not just the most recent touch.',
  teachingSteps: [
    {
      narrative: 'LFU means Least Frequently Used: each access bumps a counter.',
      why: 'When space is tight, the key with the smallest count leaves.',
    },
    {
      narrative: 'A key you keep reading builds a high score and survives longer.',
      why: 'In the sim, hammer A a few times, then fill other keys. A should stick around.',
    },
    {
      narrative: 'Ties break by older insert time here, so the choice stays deterministic.',
      why: 'Without a fixed tie-break, two equal counts could flap for no good reason.',
    },
    {
      narrative: 'Pure LFU can cling to old popular keys that are no longer relevant.',
      why: 'Production systems often age counters or mix in recency (LRU-ish hybrids).',
    },
    {
      narrative: 'Run the sim and watch the f= counters on each slot.',
      why: 'The lowest frequency should be the victim when D arrives into a full cache.',
    },
  ],
  simDefaults: {
    algo: 'lfu',
    capacity: 3,
    maxArrivals: 12,
  },
  tradeoffs: [
    'Pros: protects repeatedly hot keys better than plain LRU under some patterns.',
    'Cons: counters need storage; stale "formerly hot" keys can stick; tuning is harder.',
    'Use when: a small set of keys is hit much more often than the rest.',
  ],
  walkthrough: {
    statement: 'Evict the least frequently accessed entry when the cache is full.',
    keyIdea: 'Increment frequency on access; on overflow remove the minimum frequency.',
    approach: [
      'On hit or fill, bump freq for that key.',
      'When full, pick the entry with smallest freq (stable tie-break).',
      'Evict it, then insert the new key at freq 1.',
    ],
  },
}
