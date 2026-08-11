import type { BreakerState, NetworkSimState } from './types'

export function takeToken(state: NetworkSimState): NetworkSimState {
  if (state.tokens <= 0) return state
  return { ...state, tokens: state.tokens - 1 }
}

export function refillTokens(
  state: NetworkSimState,
  amount = 1,
): NetworkSimState {
  return {
    ...state,
    tokens: Math.min(state.tokenCapacity, state.tokens + amount),
  }
}

export function canAllowRequest(tokens: number): boolean {
  return tokens > 0
}

export function nextBreakerState(
  current: BreakerState,
  event: 'fail' | 'success' | 'probe' | 'open' | 'reject',
  failureStreak: number,
  threshold: number,
): { breaker: BreakerState; failureStreak: number } {
  switch (event) {
    case 'fail': {
      const streak = failureStreak + 1
      if (streak >= threshold) {
        return { breaker: 'open', failureStreak: streak }
      }
      return { breaker: current === 'half-open' ? 'open' : current, failureStreak: streak }
    }
    case 'open':
      return { breaker: 'open', failureStreak }
    case 'probe':
      return { breaker: 'half-open', failureStreak }
    case 'success':
      return { breaker: 'closed', failureStreak: 0 }
    case 'reject':
      return { breaker: current, failureStreak }
    default: {
      const _exhaustive: never = event
      return _exhaustive
    }
  }
}

export function poolHasCapacity(
  inUse: number,
  capacity: number,
): boolean {
  return inUse < capacity
}

/** POST is not idempotent: a blind retry can create a second resource. */
export function postRetryCreatesDuplicate(
  createdIds: string[],
  retryId: string,
): string[] {
  return [...createdIds, retryId]
}

/** PUT with the same body is idempotent: retry keeps one resource. */
export function putRetryKeepsSingle(
  createdIds: string[],
  id: string,
): string[] {
  return createdIds.includes(id) ? [...createdIds] : [...createdIds, id]
}
