import type { SystemDesignLab } from '../../types'

export const rateLimitLab: SystemDesignLab = {
  id: 'net-rate-limit',
  kind: 'network',
  title: 'Rate Limiting',
  pathId: 'networking-apis',
  order: 8,
  summary:
    'A token bucket spends one token per allowed request. When empty, the next call gets 429.',
  insight:
    'Tokens refill over time. Bursts are fine until the bucket drains; then you wait for refill.',
  teachingSteps: [
    {
      narrative:
        'Rate limits protect a service from too many calls in a short window (one client or everyone).',
      why: 'Without a cap, a busy or buggy client can starve everyone else.',
    },
    {
      narrative:
        'A token bucket starts with a fixed capacity. Each allowed request takes one token.',
      why: 'Capacity 3 means three quick allows, then the bucket is empty.',
    },
    {
      narrative:
        'When tokens are gone, the next request is denied with HTTP 429 (Too Many Requests).',
      why: 'The client should back off. Burning an empty bucket helps no one.',
    },
    {
      narrative:
        'Refill adds tokens again. After refill, a new request can succeed until the bucket drains once more.',
      why: 'Steady refill is how the limit recovers without a full reset of the client.',
    },
    {
      narrative:
        'Press Play: allow three requests, hit 429 on the fourth, refill, allow once, then deny again.',
      why: 'Watch the token count drop to zero, the 429, then a partial recovery after refill.',
    },
  ],
  simDefaults: {
    algo: 'rate-limit',
    tokenCapacity: 3,
  },
  tradeoffs: [
    'Pros: simple mental model; smooths bursts; 429 gives clients a clear signal.',
    'Cons: one global bucket is blunt; fair limits often need per-user or per-key buckets.',
    'Use when: public APIs and shared backends that must stay up under uneven client load.',
  ],
  walkthrough: {
    statement: 'Spend tokens from a bucket; return 429 when empty; refill and continue.',
    keyIdea: 'Allow while tokens remain; deny at zero; refill restores capacity.',
    approach: [
      'Allow req-1, req-2, req-3 (bucket empties).',
      'Deny req-4 with 429.',
      'Refill, allow req-5, deny req-6 when empty again.',
    ],
  },
}
