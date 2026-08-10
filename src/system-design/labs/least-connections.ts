import type { SystemDesignLab } from '../types'

export const leastConnectionsLab: SystemDesignLab = {
  id: 'lb-least-connections',
  title: 'Least Connections',
  pathId: 'load-balancing',
  order: 3,
  summary: 'Send each new request to the server with the fewest active connections.',
  insight: 'Tracks live load, so long requests naturally pull less new traffic.',
  teachingSteps: [
    {
      narrative: 'Round robin assumes every request costs the same. Often they do not.',
      why: 'A long download keeps a connection open while short API calls finish fast.',
    },
    {
      narrative: 'Least connections picks the server with the smallest active count.',
      why: 'Busy nodes stop receiving new work until they catch up.',
    },
    {
      narrative: 'Ties break deterministically (here: lower server id).',
      why: 'Without a stable tie-break, two empty servers would flap randomly.',
    },
    {
      narrative: 'Watch a slow backlog form, then see new requests avoid that server.',
      why: 'Active connection bars should stay closer than under plain RR with uneven work.',
    },
    {
      narrative: 'Still not magic: all servers can saturate together under overload.',
      why: 'You need capacity planning and shedding; LB only chooses among the living.',
    },
  ],
  simDefaults: {
    algo: 'least-connections',
    serverCount: 3,
    requestDurationTicks: 14,
    arrivalEveryTicks: 3,
    maxArrivals: 12,
  },
  tradeoffs: [
    'Pros: adapts to uneven request duration; good default for HTTP/TCP L7/L4.',
    'Cons: needs accurate connection accounting; can stampede a fresh empty node.',
    'Use when: request cost varies and you can count in-flight work per backend.',
  ],
  walkthrough: {
    statement: 'Route each arrival to the backend currently doing the least work.',
    keyIdea: 'Minimize activeConnections; update counts on assign and complete.',
    approach: [
      'Track active connections per server.',
      'On arrival, pick the minimum (stable tie-break).',
      'Increment on assign, decrement when the request finishes in the sim.',
    ],
  },
}
