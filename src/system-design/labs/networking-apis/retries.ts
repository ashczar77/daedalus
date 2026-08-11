import type { SystemDesignLab } from '../../types'

export const retriesLab: SystemDesignLab = {
  id: 'net-retries',
  kind: 'network',
  title: 'Timeouts & Retries',
  pathId: 'networking-apis',
  order: 8,
  summary:
    'A slow dependency can hang a caller. Bound the wait with a timeout, then retry with backoff and jitter.',
  insight:
    'Retries without delay amplify load. Exponential backoff spaces attempts; jitter spreads them so clients do not retry in lockstep.',
  teachingSteps: [
    {
      narrative:
        'You call a dependency. If it is slow, your thread or request slot stays busy until something gives up.',
      why: 'Unbounded waits turn one slow service into a pile-up of waiting callers.',
    },
    {
      narrative:
        'A timeout cuts the attempt: after N ticks (or ms), treat it as failed and free the caller.',
      why: 'Failing fast is better than waiting forever when the dependency is stuck.',
    },
    {
      narrative:
        'Retry the call, but wait first. Exponential backoff grows the gap: short, then longer, then longer again.',
      why: 'Immediate retries hammer a struggling service. Spacing gives it room to recover.',
    },
    {
      narrative:
        'Jitter adds a small random skew to the wait so many clients do not wake up on the same beat.',
      why: 'Without jitter, synchronized retries create a thundering herd right after an outage.',
    },
    {
      narrative:
        'Press Play: attempt 1 times out, backoff, attempt 2 times out, longer backoff, attempt 3 succeeds.',
      why: 'Watch the timeout markers and the growing backoff gaps before the final success.',
    },
  ],
  simDefaults: {
    algo: 'retries',
  },
  tradeoffs: [
    'Pros: timeouts free callers; backoff + jitter reduce retry storms on a recovering dependency.',
    'Cons: retries multiply traffic; retrying non-idempotent writes can duplicate side effects.',
    'Use when: transient failures and slow deps; cap attempts and only retry safe operations.',
  ],
  walkthrough: {
    statement: 'Time out a slow call, back off with growing delays, then succeed on a later attempt.',
    keyIdea: 'Bound each attempt; space retries with exponential backoff (and jitter) so load stays sane.',
    approach: [
      'Attempt 1, hit timeout, back off.',
      'Attempt 2, timeout again, longer back off.',
      'Attempt 3 succeeds.',
    ],
  },
}
