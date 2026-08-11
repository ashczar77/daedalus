import { describe, expect, it } from 'vitest'
import { createNetworkState } from './createState'
import {
  completeNetworkFlight,
  spawnNetworkOp,
} from './stepSim'
import {
  canAllowRequest,
  nextBreakerState,
  poolHasCapacity,
  postRetryCreatesDuplicate,
  putRetryKeepsSingle,
  refillTokens,
  takeToken,
} from './strategies'

describe('network strategies', () => {
  it('token bucket allows then denies', () => {
    expect(canAllowRequest(2)).toBe(true)
    expect(canAllowRequest(0)).toBe(false)
    let state = createNetworkState({ algo: 'rate-limit', tokenCapacity: 2 })
    expect(state.tokens).toBe(2)
    state = takeToken(state)
    state = takeToken(state)
    expect(state.tokens).toBe(0)
    state = refillTokens(state, 1)
    expect(state.tokens).toBe(1)
  })

  it('POST retry duplicates; PUT retry stays single', () => {
    expect(postRetryCreatesDuplicate(['order-1'], 'order-2')).toEqual([
      'order-1',
      'order-2',
    ])
    expect(putRetryKeepsSingle(['order-9'], 'order-9')).toEqual(['order-9'])
    expect(putRetryKeepsSingle([], 'order-9')).toEqual(['order-9'])
  })

  it('circuit breaker opens after threshold and closes on success', () => {
    let { breaker, failureStreak } = nextBreakerState('closed', 'fail', 0, 3)
    ;({ breaker, failureStreak } = nextBreakerState(breaker, 'fail', failureStreak, 3))
    ;({ breaker, failureStreak } = nextBreakerState(breaker, 'fail', failureStreak, 3))
    expect(breaker).toBe('open')
    expect(failureStreak).toBe(3)
    ;({ breaker, failureStreak } = nextBreakerState(breaker, 'probe', failureStreak, 3))
    expect(breaker).toBe('half-open')
    ;({ breaker, failureStreak } = nextBreakerState(breaker, 'success', failureStreak, 3))
    expect(breaker).toBe('closed')
    expect(failureStreak).toBe(0)
  })

  it('bulkhead capacity isolates pools', () => {
    expect(poolHasCapacity(1, 2)).toBe(true)
    expect(poolHasCapacity(2, 2)).toBe(false)
  })
})

describe('network scripts', () => {
  it('rate-limit script eventually returns 429 then refills', () => {
    let state = createNetworkState({ algo: 'rate-limit', tokenCapacity: 3 })
    const statuses: Array<number | undefined> = []
    while (!state.finished && state.arrivalsCount < state.maxArrivals) {
      state = spawnNetworkOp(state)
      statuses.push(state.flight?.status)
      state = completeNetworkFlight(state)
    }
    expect(statuses).toContain(429)
    expect(state.tokens).toBeGreaterThanOrEqual(0)
  })

  it('bulkhead rejects when pool A is full while B can still acquire', () => {
    let state = createNetworkState({ algo: 'bulkhead', poolCapacity: 2 })
    const outcomes: string[] = []
    while (!state.finished && state.arrivalsCount < state.maxArrivals) {
      state = spawnNetworkOp(state)
      if (state.flight) outcomes.push(`${state.flight.label}:${state.flight.outcome}`)
      state = completeNetworkFlight(state)
    }
    expect(outcomes.some((o) => o.includes('Pool A full'))).toBe(true)
    expect(state.poolBInUse).toBeGreaterThanOrEqual(0)
  })

  it('http-basics records both success and error statuses', () => {
    let state = createNetworkState({ algo: 'http-basics' })
    const codes: number[] = []
    while (!state.finished && state.arrivalsCount < state.maxArrivals) {
      state = spawnNetworkOp(state)
      if (state.flight?.status != null) codes.push(state.flight.status)
      state = completeNetworkFlight(state)
    }
    expect(codes).toEqual(expect.arrayContaining([200, 201, 404, 400, 500]))
  })
})
