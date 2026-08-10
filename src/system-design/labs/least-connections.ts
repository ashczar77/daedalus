import type { SystemDesignLab } from '../types'

export const leastConnectionsLab: SystemDesignLab = {
  kind: 'load-balancer',
  id: 'lb-least-connections',
  title: 'Least Connections',
  pathId: 'load-balancing',
  order: 3,
  summary: 'Send each new request to the server with the fewest active connections.',
  insight: 'Tracks live load, so long requests naturally pull less new traffic.',
  teachingSteps: [
    {
      narrative: 'Round robin assumes every request costs the same. Often they do not.',
      why: 'A long download can keep a connection open while short API calls finish quickly.',
    },
    {
      narrative: 'Least connections picks the server with the smallest active count right now.',
      why: 'Busy servers stop getting new work until some of their current requests finish.',
    },
    {
      narrative: 'When two servers are tied, we always break the tie the same way (here: lower server id).',
      why: 'If the pick were random, two empty servers could keep trading traffic back and forth for no real reason. A fixed rule keeps the choice steady and easy to follow.',
    },
    {
      narrative: 'Watch a slow backlog build on one server, then watch new requests avoid it.',
      why: 'The active-connection bars should stay closer together than under plain round robin when some requests take longer than others.',
    },
    {
      narrative: 'This still cannot invent capacity. If every server is overloaded, every server stays overloaded.',
      why: 'The load balancer only chooses among servers that are still up. You still need enough machines, and a plan for rejecting or shedding work when the fleet is full.',
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
    'Pros: adapts when requests take different amounts of time; a strong default for many HTTP services.',
    'Cons: needs accurate connection counts; a brand-new empty server can suddenly get a flood of traffic.',
    'Use when: request cost varies and you can count in-flight work per backend.',
  ],
  walkthrough: {
    statement: 'Route each arrival to the backend currently doing the least work.',
    keyIdea: 'Keep a live count of active connections. Always send the next request to the quietest server.',
    approach: [
      'Track how many active connections each server has.',
      'On each arrival, pick the server with the smallest count (break ties with a fixed rule).',
      'Add one when a request is assigned; subtract one when that request finishes.',
    ],
  },
}
