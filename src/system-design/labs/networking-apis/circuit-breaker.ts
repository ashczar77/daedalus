import type { SystemDesignLab } from '../../types'

export const circuitBreakerLab: SystemDesignLab = {
  id: 'net-circuit-breaker',
  kind: 'network',
  title: 'Circuit Breaker',
  pathId: 'networking-apis',
  order: 10,
  summary:
    'After enough failures, stop calling the dependency (open). Probe later (half-open); success closes the circuit.',
  insight:
    'Open means fail fast on purpose. You protect your own resources while the dependency is clearly down.',
  teachingSteps: [
    {
      narrative:
        'Closed is the normal state: calls go through. Each failure bumps a streak counter.',
      why: 'You still want real attempts while the dependency might be fine.',
    },
    {
      narrative:
        'When failures hit the threshold (here: 3), the breaker opens. New calls are rejected without hitting the dependency.',
      why: 'You stop paying timeout cost on a known-bad path and give the dependency room to recover.',
    },
    {
      narrative:
        'After a cool-down, half-open lets a probe call through. One probe tests the water.',
      why: 'You need a controlled try; opening forever would never learn that the dependency healed.',
    },
    {
      narrative:
        'A successful probe closes the breaker again. Calls resume as normal.',
      why: 'Closed → open → half-open → closed is the full cycle this lab teaches.',
    },
    {
      narrative:
        'Press Play: three fails trip open, a reject while open, a probe, then success that closes the circuit.',
      why: 'Watch the breaker state labels move closed → open → half-open → closed.',
    },
  ],
  simDefaults: {
    algo: 'circuit-breaker',
    failureThreshold: 3,
  },
  tradeoffs: [
    'Pros: fail fast under outage; protects caller thread pools; clear recovery path via probe.',
    'Cons: a bad threshold flaps or stays open too long; needs tuning and good failure signals.',
    'Use when: a dependency can fail hard and you would rather shed load than wait on timeouts.',
  ],
  walkthrough: {
    statement: 'Trip open after repeated failures, reject calls, probe, then close on success.',
    keyIdea: 'Closed allows calls; open rejects; half-open probes; success returns to closed.',
    approach: [
      'Fail three times until the breaker opens.',
      'Reject the next call while open.',
      'Probe in half-open, then succeed and close.',
    ],
  },
}
