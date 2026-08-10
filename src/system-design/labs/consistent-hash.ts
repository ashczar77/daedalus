import type { SystemDesignLab } from '../types'

export const consistentHashLab: SystemDesignLab = {
  id: 'lb-consistent-hash',
  title: 'Consistent Hashing',
  pathId: 'load-balancing',
  order: 4,
  summary: 'Map clients onto a hash ring so most stick when the fleet changes.',
  insight: 'Only keys near a removed (or added) node remapped; the rest keep their server.',
  teachingSteps: [
    {
      narrative: 'Sometimes you want the same client to keep hitting the same backend.',
      why: 'Caches, sessions, or shard-local state get warmer with sticky routing.',
    },
    {
      narrative: 'Place servers on a ring (0..360). Hash the client key to a point.',
      why: 'Walk clockwise to the first server at or after the key. That server owns it.',
    },
    {
      narrative: 'The same client key always lands on the same server while the ring is fixed.',
      why: 'Watch alice/bob/carol stick as requests keep arriving.',
    },
    {
      narrative: 'Add or remove a server: only nearby keys move.',
      why: 'Unlike mod-N hashing, you do not reshuffle the whole keyspace.',
    },
    {
      narrative: 'Use Add server / Remove server in the sim, then compare who remaps.',
      why: 'Most sticky clients should stay put; a minority jumps to the new neighbor.',
    },
  ],
  simDefaults: {
    algo: 'consistent-hash',
    serverCount: 3,
    requestDurationTicks: 8,
    arrivalEveryTicks: 3,
    maxArrivals: 12,
    allowServerChurn: true,
  },
  tradeoffs: [
    'Pros: sticky routing with small remap on churn; great for cache locality.',
    'Cons: can hotspot if key distribution is skewed; often needs virtual nodes in production.',
    'Use when: you care about affinity and fleet changes should not flush everything.',
  ],
  walkthrough: {
    statement: 'Route by hashing the client onto a ring of servers.',
    keyIdea: 'Ownership is the next clockwise server; churn only moves a slice of keys.',
    approach: [
      'Assign each server a ring position from its id.',
      'Hash the client key; pick the first server at or after that angle (wrap around).',
      'Add/remove a server and observe that most clients stay sticky.',
    ],
  },
}
