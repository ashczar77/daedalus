import type { SystemDesignLab } from '../../types'

export const readThroughLab: SystemDesignLab = {
  id: 'cache-read-through',
  kind: 'cache',
  title: 'Read-Through',
  pathId: 'caching',
  order: 2,
  summary: 'The client only talks to the cache; on a miss the cache loads the database.',
  insight: 'Miss handling lives inside the cache layer, so app code stays thinner on reads.',
  teachingSteps: [
    {
      narrative: 'With read-through, the application always asks the cache for data.',
      why: 'The app does not branch on "hit vs miss" for loading. That logic sits behind the cache API.',
    },
    {
      narrative: 'On a hit, the cache returns the value. Same as cache-aside from the outside.',
      why: 'Fast path is unchanged: serve from the cache.',
    },
    {
      narrative: 'On a miss, the cache itself fetches the database, stores the value, then answers the client.',
      why: 'Watch the break: App → Cache (stop). Then Cache → DB → Cache → App. The app never talks to the DB on this read.',
    },
    {
      narrative: 'The cache becomes responsible for loading policy and failure handling on misses.',
      why: 'That can be nicer for many services, but you must trust the cache library or service to do the right thing.',
    },
    {
      narrative: 'Run the sim and compare the miss path to cache-aside.',
      why: 'Same end result (value in cache), different who talks to the database. Colors mark App, Cache, and DB turns.',
    },
  ],
  simDefaults: {
    algo: 'read-through',
    capacity: 4,
    maxArrivals: 12,
  },
  tradeoffs: [
    'Pros: app read path stays simple; fill logic is centralized in the cache layer.',
    'Cons: less flexible if different callers want different load rules; cache must speak to the DB.',
    'Use when: you want a shared cache API that hides miss loading from application code.',
  ],
  walkthrough: {
    statement: 'Serve reads through a cache that loads the database on misses.',
    keyIdea: 'Client only calls the cache. The cache owns the miss → DB → store path.',
    approach: [
      'Client requests a key from the cache.',
      'On miss, cache reads the database and stores the value.',
      'Cache returns the value to the client.',
    ],
  },
}
