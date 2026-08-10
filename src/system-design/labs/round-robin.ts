import type { SystemDesignLab } from '../types'

export const roundRobinLab: SystemDesignLab = {
  id: 'lb-round-robin',
  title: 'Round Robin',
  pathId: 'load-balancing',
  order: 1,
  summary: 'Cycle through servers in order, one request each.',
  insight: 'Simple and fair when backends are identical and requests cost about the same.',
  teachingSteps: [
    {
      narrative: 'A load balancer sits in front of several identical servers.',
      why: 'Clients call one shared address (the load balancer). It picks which backend handles each request.',
    },
    {
      narrative: 'Round robin keeps a cursor and walks the server list in order.',
      why: 'Request 1 → S1, request 2 → S2, … then wrap back to S1.',
    },
    {
      narrative: 'Over many requests, each server gets roughly the same count.',
      why: 'That is the fairness promise: equal share of arrivals, not equal work.',
    },
    {
      narrative: 'It ignores how busy a server already is.',
      why: 'A slow request still advances the cursor, so load can skew under uneven work.',
    },
    {
      narrative: 'Run the sim: watch each request travel client → LB → S1, then S2, then S3.',
      why: 'Server totals should stay within one of each other if request durations are similar.',
    },
  ],
  simDefaults: {
    algo: 'round-robin',
    serverCount: 3,
    requestDurationTicks: 10,
    arrivalEveryTicks: 3,
    maxArrivals: 12,
  },
  tradeoffs: [
    'Pros: tiny state, easy to reason about, even arrival split on identical nodes.',
    'Cons: blind to connection count and capacity; uneven request cost breaks fairness.',
    'Use when: homogeneous fleet, similar request costs, you want something simple first.',
  ],
  walkthrough: {
    statement:
      'Spread incoming requests across a fixed list of backends by cycling through them.',
    keyIdea: 'A single cursor chooses the next server, then advances and wraps.',
    approach: [
      'Maintain an ordered list of healthy servers.',
      'On each request, pick servers[i], then i = (i + 1) % n.',
      'Compare totals in the live sim to see the even split.',
    ],
  },
}
