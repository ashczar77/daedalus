import type { SystemDesignLab } from '../types'

export const weightedRoundRobinLab: SystemDesignLab = {
  kind: 'load-balancer',
  id: 'lb-weighted-round-robin',
  title: 'Weighted Round Robin',
  pathId: 'load-balancing',
  order: 2,
  summary: 'Give stronger servers more turns in the rotation.',
  insight: 'Weights encode capacity: a server with weight 2 gets about twice the traffic of weight 1.',
  teachingSteps: [
    {
      narrative: 'Not every machine is equal. Some have more CPU or larger pods.',
      why: 'Plain round robin would under-use the big node and overload the small one.',
    },
    {
      narrative: 'Assign each server a weight (capacity units).',
      why: 'Weight 3 means "take three slots for every one slot a weight-1 server takes."',
    },
    {
      narrative: 'Build a slot list from weights, then round-robin the slots.',
      why: 'Example weights 2,1 → slots [S1, S1, S2], then cycle that list.',
    },
    {
      narrative: 'Long-run share matches weight / sum(weights).',
      why: 'S1 with weight 2 of total 3 should land near two-thirds of requests.',
    },
    {
      narrative: 'Tweak weights in the sim and watch the totals rebalance.',
      why: 'Still ignores live connection count; it only encodes static capacity.',
    },
  ],
  simDefaults: {
    algo: 'weighted-round-robin',
    serverCount: 3,
    weights: [3, 1, 1],
    requestDurationTicks: 10,
    arrivalEveryTicks: 3,
    maxArrivals: 12,
  },
  tradeoffs: [
    'Pros: respects static capacity without tracking connections.',
    'Cons: still blind to queue depth; bad weights hurt more than plain RR.',
    'Use when: known size differences (canary vs full, large vs small instances).',
  ],
  walkthrough: {
    statement: 'Bias round robin so higher-capacity backends receive more requests.',
    keyIdea: 'Expand each server into weight slots, then cycle the slot list.',
    approach: [
      'Set weights on each healthy server.',
      'Build slots: repeat each server id `weight` times.',
      'Round-robin the slots; adjust weights live and compare totals.',
    ],
  },
}
