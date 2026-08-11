import type { NetworkAlgo, NetworkSimDefaults } from '../../types'
import type { NetworkScriptOp, NetworkSimState } from './types'
import { DEFAULT_NETWORK_MAX_ARRIVALS } from './types'

export function buildNetworkScript(algo: NetworkAlgo): NetworkScriptOp[] {
  switch (algo) {
    case 'http-basics':
      return [
        {
          type: 'http',
          phase: 'request',
          method: 'GET',
          path: '/users/1',
          status: 200,
          note: 'Client sends GET /users/1.',
        },
        {
          type: 'http',
          phase: 'response',
          method: 'GET',
          path: '/users/1',
          status: 200,
          note: 'Server replies 200 OK with the user data.',
        },
        {
          type: 'http',
          phase: 'request',
          method: 'POST',
          path: '/users',
          status: 201,
          note: 'Client sends POST /users to create a user.',
        },
        {
          type: 'http',
          phase: 'response',
          method: 'POST',
          path: '/users',
          status: 201,
          note: 'Server replies 201 Created. The new user exists.',
        },
        {
          type: 'http',
          phase: 'request',
          method: 'GET',
          path: '/missing',
          status: 404,
          note: 'Client asks for a path that does not exist.',
        },
        {
          type: 'http',
          phase: 'response',
          method: 'GET',
          path: '/missing',
          status: 404,
          note: 'Server replies 404 Not Found. The client used a bad path.',
        },
        {
          type: 'http',
          phase: 'request',
          method: 'POST',
          path: '/users',
          status: 400,
          note: 'Client sends a POST with a bad body.',
        },
        {
          type: 'http',
          phase: 'response',
          method: 'POST',
          path: '/users',
          status: 400,
          note: 'Server replies 400 Bad Request. Fix the input, then try again.',
        },
        {
          type: 'http',
          phase: 'request',
          method: 'GET',
          path: '/users',
          status: 500,
          note: 'Client sends a normal GET.',
        },
        {
          type: 'http',
          phase: 'response',
          method: 'GET',
          path: '/users',
          status: 500,
          note: 'Server replies 500. Something broke on the server side.',
        },
        {
          type: 'http',
          phase: 'request',
          method: 'GET',
          path: '/users/1',
          status: 200,
          note: 'Client tries GET /users/1 again.',
        },
        {
          type: 'http',
          phase: 'response',
          method: 'GET',
          path: '/users/1',
          status: 200,
          note: 'Server is healthy again and replies 200 OK.',
        },
      ]
    case 'rest-design':
      return [
        {
          type: 'rest',
          phase: 'request',
          action: 'post',
          note: 'Client POSTs /orders to create a new order.',
        },
        {
          type: 'rest',
          phase: 'response',
          action: 'post',
          note: 'Server replies 201 and creates order-1.',
        },
        {
          type: 'rest',
          phase: 'request',
          action: 'post-retry',
          note: 'Client times out and POSTs the same create again (blind retry).',
        },
        {
          type: 'rest',
          phase: 'response',
          action: 'post-retry',
          note: 'Server treats it as a new create: order-2 appears (duplicate).',
        },
        {
          type: 'rest',
          phase: 'request',
          action: 'put-retry',
          note: 'Client PUTs /orders/9 (same id) after a timeout.',
        },
        {
          type: 'rest',
          phase: 'response',
          action: 'put-retry',
          note: 'Server keeps a single order-9. Same PUT again is safe.',
        },
        {
          type: 'rest',
          phase: 'request',
          action: 'page',
          note: 'Client asks for the first page of /items.',
        },
        {
          type: 'rest',
          phase: 'response',
          action: 'page',
          note: 'Server returns items plus a cursor for the next page.',
        },
        {
          type: 'rest',
          phase: 'request',
          action: 'page',
          note: 'Client sends the cursor back to get the next page.',
        },
        {
          type: 'rest',
          phase: 'response',
          action: 'page',
          note: 'Server returns the next page (no more cursor = end).',
        },
        {
          type: 'rest',
          phase: 'request',
          action: 'version',
          note: 'A newer client calls /v2/users after the API shape changed.',
        },
        {
          type: 'rest',
          phase: 'response',
          action: 'version',
          note: 'Server answers on /v2. Old clients can stay on /v1.',
        },
      ]
    case 'http2':
      return [
        { type: 'protocol', mode: 'http1', action: 'enqueue', label: 'A' },
        { type: 'protocol', mode: 'http1', action: 'enqueue', label: 'B' },
        { type: 'protocol', mode: 'http1', action: 'enqueue', label: 'C' },
        { type: 'protocol', mode: 'http1', action: 'start', streamId: 1, label: 'A' },
        { type: 'protocol', mode: 'http1', action: 'finish', streamId: 1, label: 'A' },
        { type: 'protocol', mode: 'http1', action: 'start', streamId: 2, label: 'B' },
        { type: 'protocol', mode: 'http2', action: 'switch' },
        { type: 'protocol', mode: 'http2', action: 'start', streamId: 1, label: 'A' },
        { type: 'protocol', mode: 'http2', action: 'start', streamId: 2, label: 'B' },
        { type: 'protocol', mode: 'http2', action: 'start', streamId: 3, label: 'C' },
        { type: 'protocol', mode: 'http2', action: 'finish', streamId: 2, label: 'B' },
        { type: 'protocol', mode: 'http2', action: 'finish', streamId: 1, label: 'A' },
        { type: 'protocol', mode: 'http2', action: 'finish', streamId: 3, label: 'C' },
      ]
    case 'grpc':
      return [
        {
          type: 'grpc',
          action: 'rest-call',
          label: 'GET /api/users/42',
          note: 'REST: text JSON over HTTP.',
        },
        {
          type: 'grpc',
          action: 'rpc-call',
          label: 'UserService.GetUser(42)',
          note: 'gRPC: typed stub + compact binary frame.',
        },
        {
          type: 'grpc',
          action: 'rpc-call',
          label: 'UserService.GetUser(7)',
          note: 'Same stub, second call.',
        },
      ]
    case 'realtime':
      return [
        { type: 'realtime', mode: 'long-poll', action: 'hold' },
        { type: 'realtime', mode: 'long-poll', action: 'reply', event: 'msg-1' },
        { type: 'realtime', mode: 'long-poll', action: 'hold' },
        { type: 'realtime', mode: 'websocket', action: 'open' },
        { type: 'realtime', mode: 'websocket', action: 'push', event: 'msg-2' },
        { type: 'realtime', mode: 'websocket', action: 'push', event: 'msg-3' },
        { type: 'realtime', mode: 'websocket', action: 'close' },
      ]
    case 'gateway':
      return [
        { type: 'gateway', action: 'auth-ok', path: '/orders' },
        { type: 'gateway', action: 'route', path: '/orders', target: 'Orders' },
        { type: 'gateway', action: 'auth-ok', path: '/users/me' },
        { type: 'gateway', action: 'route', path: '/users/me', target: 'Users' },
        { type: 'gateway', action: 'auth-deny', path: '/admin' },
        { type: 'gateway', action: 'auth-ok', path: '/orders/9' },
        { type: 'gateway', action: 'route', path: '/orders/9', target: 'Orders' },
      ]
    case 'rate-limit':
      return [
        { type: 'rate', action: 'allow', label: 'req-1' },
        { type: 'rate', action: 'allow', label: 'req-2' },
        { type: 'rate', action: 'allow', label: 'req-3' },
        { type: 'rate', action: 'deny', label: 'req-4' },
        { type: 'rate', action: 'refill' },
        { type: 'rate', action: 'allow', label: 'req-5' },
        { type: 'rate', action: 'deny', label: 'req-6' },
      ]
    case 'retries':
      return [
        { type: 'retry', action: 'attempt', attempt: 1 },
        { type: 'retry', action: 'timeout', attempt: 1 },
        { type: 'retry', action: 'backoff', attempt: 1 },
        { type: 'retry', action: 'attempt', attempt: 2 },
        { type: 'retry', action: 'timeout', attempt: 2 },
        { type: 'retry', action: 'backoff', attempt: 2 },
        { type: 'retry', action: 'attempt', attempt: 3 },
        { type: 'retry', action: 'success', attempt: 3 },
      ]
    case 'circuit-breaker':
      return [
        { type: 'breaker', action: 'fail' },
        { type: 'breaker', action: 'fail' },
        { type: 'breaker', action: 'fail' },
        { type: 'breaker', action: 'open' },
        { type: 'breaker', action: 'reject' },
        { type: 'breaker', action: 'probe' },
        { type: 'breaker', action: 'success' },
      ]
    case 'bulkhead':
      return [
        { type: 'bulkhead', pool: 'A', action: 'acquire', label: 'A1' },
        { type: 'bulkhead', pool: 'A', action: 'acquire', label: 'A2' },
        { type: 'bulkhead', pool: 'A', action: 'reject', label: 'A3' },
        { type: 'bulkhead', pool: 'B', action: 'acquire', label: 'B1' },
        { type: 'bulkhead', pool: 'B', action: 'acquire', label: 'B2' },
        { type: 'bulkhead', pool: 'A', action: 'release', label: 'A1' },
        { type: 'bulkhead', pool: 'A', action: 'acquire', label: 'A3' },
        { type: 'bulkhead', pool: 'B', action: 'release', label: 'B1' },
      ]
    default: {
      const _exhaustive: never = algo
      return _exhaustive
    }
  }
}

export function captionForIdle(algo: NetworkAlgo): string {
  switch (algo) {
    case 'http-basics':
      return 'Idle. Press Play to walk HTTP methods and status families.'
    case 'rest-design':
      return 'Idle. Press Play to see REST request/response pairs: POST vs PUT retries, then paging and /v2.'
    case 'http2':
      return 'Idle. Press Play to contrast HTTP/1.1 queuing with HTTP/2 multiplexed streams.'
    case 'grpc':
      return 'Idle. Press Play to compare a REST JSON call with a gRPC stub call.'
    case 'realtime':
      return 'Idle. Press Play to compare long polling with a WebSocket push channel.'
    case 'gateway':
      return 'Idle. Press Play to watch auth checks and path-based routing.'
    case 'rate-limit':
      return 'Idle. Press Play to drain a token bucket, hit 429, then refill.'
    case 'retries':
      return 'Idle. Press Play to watch timeouts, backoff gaps, then a success.'
    case 'circuit-breaker':
      return 'Idle. Press Play to trip the breaker, reject calls, probe, then close.'
    case 'bulkhead':
      return 'Idle. Press Play to fill pool A while pool B keeps serving.'
    default: {
      const _exhaustive: never = algo
      return _exhaustive
    }
  }
}

export function createNetworkState(defaults: NetworkSimDefaults): NetworkSimState {
  const algo = defaults.algo
  const script = buildNetworkScript(algo)
  const maxArrivals = Math.min(
    defaults.maxArrivals ?? DEFAULT_NETWORK_MAX_ARRIVALS,
    script.length,
  )
  const tokenCapacity = defaults.tokenCapacity ?? 3
  const failureThreshold = defaults.failureThreshold ?? 3
  const poolCap = defaults.poolCapacity ?? 2

  return {
    algo,
    flight: null,
    tick: 0,
    nextOpIndex: 0,
    arrivalsCount: 0,
    maxArrivals,
    finished: false,
    script,
    caption: captionForIdle(algo),
    okCount: 0,
    errorCount: 0,
    lastMethod: null,
    lastPath: null,
    lastStatus: null,
    createdIds: [],
    cursor: null,
    apiVersion: 'v1',
    protocol: algo === 'http2' ? 'http1' : 'http2',
    activeStreams: [],
    queued: [],
    channel: 'idle',
    heldRequest: false,
    pushEvents: [],
    authOk: true,
    routeTarget: null,
    tokens: tokenCapacity,
    tokenCapacity,
    attempt: 0,
    maxAttempts: 3,
    backoffLabel: null,
    breaker: 'closed',
    failureStreak: 0,
    failureThreshold,
    poolAInUse: 0,
    poolBInUse: 0,
    poolACap: poolCap,
    poolBCap: poolCap,
  }
}
