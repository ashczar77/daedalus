import type { SystemDesignLab } from '../../types'

export const cacheAsideLab: SystemDesignLab = {
  id: 'cache-aside',
  kind: 'cache',
  title: 'Cache-Aside',
  pathId: 'caching',
  order: 1,
  summary: 'The app checks the cache, and on a miss loads the database then fills the cache.',
  insight: 'Simple and common: the application owns both reads and cache population.',
  teachingSteps: [
    {
      narrative: 'A cache sits beside the database to answer repeated reads faster.',
      why: 'Hitting memory (or a nearby cache service) is cheaper than hitting disk or a remote DB every time.',
    },
    {
      narrative: 'On a read, the app looks in the cache first.',
      why: 'If the key is there, return it immediately. That is a hit.',
    },
    {
      narrative: 'On a miss, the app reads the database, then writes the value into the cache.',
      why: 'The next reader of that key should hit. The app, not the cache, drives the fill.',
    },
    {
      narrative: 'On a write, the app updates the database and usually invalidates the cache entry.',
      why: 'Leaving a stale value in cache would serve the wrong answer until something else overwrites it.',
    },
    {
      narrative: 'Run the sim: watch hits bounce off the cache, and misses take the longer trip through the database.',
      why: 'You should see the cache fill after misses, and clears on writes.',
    },
  ],
  simDefaults: {
    algo: 'cache-aside',
    capacity: 4,
    maxArrivals: 12,
  },
  tradeoffs: [
    'Pros: easy to reason about; app controls what is cached; works with many storage backends.',
    'Cons: every miss pays a full DB round trip in the app path; easy to forget invalidation on writes.',
    'Use when: you want a simple default and can manage fill + invalidate in application code.',
  ],
  walkthrough: {
    statement: 'Speed up reads with a cache the application checks and fills itself.',
    keyIdea: 'Read: cache first, else DB then fill. Write: DB first, then drop the stale cache entry.',
    approach: [
      'Look up the key in the cache.',
      'On miss, load from the database and put the result in the cache.',
      'On write, update the database and invalidate the cache key.',
    ],
  },
}
