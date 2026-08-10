import type { SystemDesignLab } from '../types'

export const consistentHashLab: SystemDesignLab = {
  id: 'lb-consistent-hash',
  title: 'Consistent Hashing',
  pathId: 'load-balancing',
  order: 4,
  summary: 'Map clients onto a hash ring so most stick when the fleet changes.',
  insight:
    'Only clients near the change move. Everyone else keeps the same server.',
  teachingSteps: [
    {
      narrative:
        'Sometimes you want the same client to keep talking to the same server.',
      why: 'That helps caches stay warm, and keeps session or shard-local data on one machine.',
    },
    {
      narrative:
        'A common trick is hash(client) % serverCount. It looks fine until the fleet changes.',
      why: 'Add or remove one server and almost every client gets a new server. Caches go cold all at once.',
    },
    {
      narrative:
        'Consistent hashing pretends the hash range wraps into a ring. The circle you see is a diagram of that idea, not a real network shape.',
      why: 'Hash values are still plain numbers. Drawing them on a ring just makes "next server forward" easy to follow.',
    },
    {
      narrative:
        'Each server claims a spot on that ring. Each client name hashes to a spot too. From the client spot, move forward (clockwise here) to the next server.',
      why: 'Same client name lands on the same spot, so it keeps the same server while the ring stays unchanged.',
    },
    {
      narrative:
        'Add a server and only the clients in its new slice move over. Everyone else stays put.',
      why: 'That is the whole point: small fleet changes should not reshuffle the whole world. Try Add server in the sim and watch who moves.',
    },
  ],
  simDefaults: {
    algo: 'consistent-hash',
    serverCount: 3,
    requestDurationTicks: 8,
    arrivalEveryTicks: 3,
    maxArrivals: 12,
    allowServerChurn: true,
    maxServers: 5,
  },
  tradeoffs: [
    'Pros: sticky routing with only a small remapping when servers change; great when cache locality matters.',
    'Cons: uneven key popularity can overload one server; production systems often add virtual nodes for smoother balance.',
    'Use when: you care about client-to-server stickiness, and fleet changes should not flush everything.',
  ],
  walkthrough: {
    statement: 'Route each client by hashing them onto a ring of servers.',
    keyIdea:
      'Own the arc clockwise to the next server. When the fleet changes, only a slice of clients move.',
    approach: [
      'Place each server on the ring (evenly spaced here so the picture stays clear).',
      'Hash the client key to a point, then walk clockwise to the next server.',
      'Add or remove a server and check that most clients stay sticky.',
    ],
  },
}
