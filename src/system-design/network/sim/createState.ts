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
    case 'tcp':
      return [
        {
          type: 'tcp',
          action: 'syn',
          note: 'Step 1: client sends SYN with its starting sequence number (SEQ. Client).',
        },
        {
          type: 'tcp',
          action: 'syn-ack',
          note: 'Step 2: server replies SYN-ACK (ACK = Client+1) and its own SEQ. Server.',
        },
        {
          type: 'tcp',
          action: 'ack',
          note: 'Step 3: client sends ACK (ACK = Server+1). The connection is now open.',
        },
        {
          type: 'tcp',
          action: 'send',
          label: 'data',
          note: 'Optional: the final ACK can already carry the first application bytes.',
        },
        {
          type: 'tcp',
          action: 'close',
          note: 'Connection closes. Later labs put HTTP on this same kind of pipe.',
        },
      ]
    case 'http2':
      return [
        { type: 'protocol', mode: 'http1', action: 'tcp-open' },
        { type: 'protocol', mode: 'http1', action: 'enqueue', label: 'A' },
        { type: 'protocol', mode: 'http1', action: 'enqueue', label: 'B' },
        { type: 'protocol', mode: 'http1', action: 'enqueue', label: 'C' },
        { type: 'protocol', mode: 'http1', action: 'start', streamId: 1, label: 'A' },
        { type: 'protocol', mode: 'http1', action: 'finish', streamId: 1, label: 'A' },
        { type: 'protocol', mode: 'http1', action: 'start', streamId: 2, label: 'B' },
        { type: 'protocol', mode: 'http1', action: 'finish', streamId: 2, label: 'B' },
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
          action: 'rpc-call',
          label: 'GetUser(42)',
          note: 'Your code calls GetUser(42). Arguments leave this machine for the server.',
        },
        {
          type: 'grpc',
          action: 'rpc-return',
          label: 'User { id: 42 }',
          note: 'The server ran GetUser and sends the return value back. That is the "procedure call" finishing.',
        },
        {
          type: 'grpc',
          action: 'rpc-call',
          label: 'GetUser(7)',
          note: 'Another call. Same idea: run this function over there with a new argument.',
        },
        {
          type: 'grpc',
          action: 'rpc-return',
          label: 'User { id: 7 }',
          note: 'Return value comes home. Your code keeps going as if GetUser were local.',
        },
      ]
    case 'realtime':
      return [
        {
          type: 'realtime',
          mode: 'long-poll',
          action: 'hold',
          note: 'Long poll: client asks and waits. The server holds the request until there is news.',
        },
        {
          type: 'realtime',
          mode: 'websocket',
          action: 'open',
          note: 'WebSocket: open one connection and keep it open.',
        },
        {
          type: 'realtime',
          mode: 'long-poll',
          action: 'reply',
          event: 'news-1',
          note: 'News arrives. Long poll finally answers. That HTTP request is now done.',
        },
        {
          type: 'realtime',
          mode: 'websocket',
          action: 'push',
          event: 'news-1',
          note: 'Same news on the WebSocket. The connection stays open.',
        },
        {
          type: 'realtime',
          mode: 'long-poll',
          action: 'hold',
          note: 'Long poll must ask again to wait for the next update.',
        },
        {
          type: 'realtime',
          mode: 'websocket',
          action: 'push',
          event: 'news-2',
          note: 'Second update on the same WebSocket. No new open needed.',
        },
        {
          type: 'realtime',
          mode: 'long-poll',
          action: 'reply',
          event: 'news-2',
          note: 'Long poll answers news-2. Request ends again; client will need another hold.',
        },
        {
          type: 'realtime',
          mode: 'long-poll',
          action: 'hold',
          note: 'Long poll starts waiting a third time. WebSocket is still open on the right.',
        },
        {
          type: 'realtime',
          mode: 'websocket',
          action: 'close',
          note: 'WebSocket closes when you are done. Later news would need a new open.',
        },
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
    case 'tcp':
      return 'Idle. Press Play to walk the three-way handshake: SYN, SYN-ACK, then ACK.'
    case 'http2':
      return 'Idle. Press Play: reuse one TCP pipe, see HTTP/1.1 queue on one lane, then HTTP/2 streams on parallel lanes.'
    case 'grpc':
      return 'Idle. Press Play: call a function on another machine, then watch the return value come back.'
    case 'realtime':
      return 'Idle. Press Play to compare long polling and WebSockets side by side.'
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
    tcpOpen: false,
    tcpHandshake: [],
    tcpDelivered: [],
    tcpGap: null,
    activeStreams: [],
    queued: [],
    channel: 'idle',
    heldRequest: false,
    lpEvents: [],
    wsOpen: false,
    wsEvents: [],
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
