import type { SystemDesignLab } from '../../types'

export const bulkheadLab: SystemDesignLab = {
  id: 'net-bulkhead',
  kind: 'network',
  title: 'Bulkhead',
  pathId: 'networking-apis',
  order: 11,
  summary:
    'Separate resource pools so overload in one area cannot consume every slot the other area needs.',
  insight:
    'Pool A at capacity rejects new A work. Pool B keeps its own slots and stays healthy.',
  teachingSteps: [
    {
      narrative:
        'A bulkhead is a partition: separate thread pools, connection pools, or queues per dependency or feature.',
      why: 'Shared pools let one hot path take every worker. Isolation draws a hard line.',
    },
    {
      narrative:
        'Each pool has a capacity (here: 2). Acquire fills a slot; reject means that pool is full.',
      why: 'A3 is rejected when A1 and A2 already hold pool A. That reject is local to A.',
    },
    {
      narrative:
        'Pool B still has free slots while A is saturated. B1 and B2 acquire normally.',
      why: 'Overload in A leaves B healthy. That is the isolation win.',
    },
    {
      narrative:
        'When A1 releases, A3 can acquire. B can release independently. Pools do not share a single counter.',
      why: 'Recovery is per pool. Freeing A does not depend on B finishing first.',
    },
    {
      narrative:
        'Press Play: fill pool A (reject A3), keep acquiring in B, then release A1 so A3 enters.',
      why: 'Watch A in-use hit the cap while B stays available, then A recover on release.',
    },
  ],
  simDefaults: {
    algo: 'bulkhead',
    poolCapacity: 2,
  },
  tradeoffs: [
    'Pros: failure or overload in one pool cannot starve another; blast radius stays local.',
    'Cons: more pools to size and monitor; unused capacity in B cannot help a starved A.',
    'Use when: multiple dependencies or features share one process and one must not take all workers.',
  ],
  walkthrough: {
    statement: 'Cap each pool separately so a full A does not block B.',
    keyIdea: 'Separate capacities: reject only in the full pool; the other pool keeps serving.',
    approach: [
      'Acquire A1 and A2; reject A3 when A is full.',
      'Acquire B1 and B2 while A is saturated.',
      'Release A1, then acquire A3; release B1 independently.',
    ],
  },
}
