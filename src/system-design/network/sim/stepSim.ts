import { captionForIdle } from './createState'
import {
  canAllowRequest,
  nextBreakerState,
  poolHasCapacity,
  postRetryCreatesDuplicate,
  putRetryKeepsSingle,
  refillTokens,
  takeToken,
} from './strategies'
import type {
  NetworkFlight,
  NetworkScriptOp,
  NetworkSimState,
} from './types'

let flightSeq = 0

function nextFlightId(): string {
  flightSeq += 1
  return `net-flight-${flightSeq}`
}

function withFlight(
  state: NetworkSimState,
  flight: NetworkFlight,
  patch: Partial<NetworkSimState> = {},
): NetworkSimState {
  return {
    ...state,
    ...patch,
    flight,
    caption: flight.reason,
    tick: state.tick + 1,
  }
}

function applyHttp(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'http' }>,
): NetworkSimState {
  if (op.phase === 'request') {
    const flight: NetworkFlight = {
      id: nextFlightId(),
      kind: 'request',
      label: `${op.method} ${op.path}`,
      from: 'Client',
      to: 'API',
      method: op.method,
      path: op.path,
      reason: op.note ?? `Client sends ${op.method} ${op.path}.`,
      outcome: 'pending',
    }
    return withFlight(state, flight, {
      lastMethod: op.method,
      lastPath: op.path,
      lastStatus: null,
    })
  }

  const ok = op.status < 400
  const flight: NetworkFlight = {
    id: nextFlightId(),
    kind: ok ? 'response' : 'refuse',
    label: `${op.status} ← ${op.method} ${op.path}`,
    from: 'API',
    to: 'Client',
    method: op.method,
    path: op.path,
    status: op.status,
    reason: op.note ?? `Server replies ${op.status}.`,
    outcome: ok ? 'ok' : 'error',
  }
  return withFlight(state, flight, {
    lastMethod: op.method,
    lastPath: op.path,
    lastStatus: op.status,
    okCount: ok ? state.okCount + 1 : state.okCount,
    errorCount: ok ? state.errorCount : state.errorCount + 1,
  })
}

function applyRest(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'rest' }>,
): NetworkSimState {
  const meta = restActionMeta(op.action, state)

  if (op.phase === 'request') {
    const flight: NetworkFlight = {
      id: nextFlightId(),
      kind: 'request',
      label: `${meta.method} ${meta.path}`,
      from: 'Client',
      to: 'API',
      method: meta.method,
      path: meta.path,
      reason: op.note ?? `Client sends ${meta.method} ${meta.path}.`,
      outcome: 'pending',
    }
    return withFlight(state, flight, {
      lastMethod: meta.method,
      lastPath: meta.path,
      lastStatus: null,
    })
  }

  // Response phase: apply resource-side effects, then fly API → Client.
  switch (op.action) {
    case 'post': {
      const ids = [...state.createdIds, 'order-1']
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'response',
        label: '201 ← POST /orders (order-1)',
        from: 'API',
        to: 'Client',
        method: 'POST',
        path: '/orders',
        status: 201,
        reason: op.note ?? 'Server replies 201 and creates order-1.',
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        createdIds: ids,
        lastMethod: 'POST',
        lastPath: '/orders',
        lastStatus: 201,
        okCount: state.okCount + 1,
      })
    }
    case 'post-retry': {
      const ids = postRetryCreatesDuplicate(state.createdIds, 'order-2')
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'refuse',
        label: '201 ← POST retry (order-2 duplicate)',
        from: 'API',
        to: 'Client',
        method: 'POST',
        path: '/orders',
        status: 201,
        reason:
          op.note ??
          'Blind POST retry is not safe. The server creates a second order.',
        outcome: 'error',
      }
      return withFlight(state, flight, {
        createdIds: ids,
        lastMethod: 'POST',
        lastPath: '/orders',
        lastStatus: 201,
        errorCount: state.errorCount + 1,
      })
    }
    case 'put-retry': {
      const ids = putRetryKeepsSingle(state.createdIds, 'order-9')
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'response',
        label: '200 ← PUT /orders/9',
        from: 'API',
        to: 'Client',
        method: 'PUT',
        path: '/orders/9',
        status: 200,
        reason:
          op.note ??
          'PUT with the same id is idempotent. Retry keeps a single order-9.',
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        createdIds: ids,
        lastMethod: 'PUT',
        lastPath: '/orders/9',
        lastStatus: 200,
        okCount: state.okCount + 1,
      })
    }
    case 'page': {
      const nextCursor = state.cursor == null ? 'cur-2' : null
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'response',
        label:
          state.cursor == null
            ? '200 ← page 1 + cursor'
            : '200 ← page 2 (end)',
        from: 'API',
        to: 'Client',
        method: 'GET',
        path: '/items',
        status: 200,
        reason: op.note ?? 'Pagination returns a cursor for the next page.',
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        cursor: nextCursor,
        lastMethod: 'GET',
        lastPath: '/items',
        lastStatus: 200,
        okCount: state.okCount + 1,
      })
    }
    case 'version': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'response',
        label: '200 ← GET /v2/users',
        from: 'API',
        to: 'Client',
        method: 'GET',
        path: '/v2/users',
        status: 200,
        reason:
          op.note ??
          'Versioning keeps old clients on /v1 while /v2 ships changes.',
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        apiVersion: 'v2',
        lastMethod: 'GET',
        lastPath: '/v2/users',
        lastStatus: 200,
        okCount: state.okCount + 1,
      })
    }
    default: {
      const _exhaustive: never = op.action
      return _exhaustive
    }
  }
}

function restActionMeta(
  action: Extract<NetworkScriptOp, { type: 'rest' }>['action'],
  state: NetworkSimState,
): { method: string; path: string } {
  switch (action) {
    case 'post':
    case 'post-retry':
      return { method: 'POST', path: '/orders' }
    case 'put-retry':
      return { method: 'PUT', path: '/orders/9' }
    case 'page':
      return {
        method: 'GET',
        path: state.cursor == null ? '/items?limit=2' : '/items?cursor=cur-2',
      }
    case 'version':
      return { method: 'GET', path: '/v2/users' }
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}

function applyTcp(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'tcp' }>,
): NetworkSimState {
  const label = op.label ?? 'seg'
  switch (op.action) {
    case 'syn': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'request',
        label: 'SYN',
        from: 'Client',
        to: 'Server',
        reason:
          op.note ??
          'Client starts the handshake: SYN with SEQ. Client (its starting sequence number).',
        outcome: 'pending',
      }
      return withFlight(state, flight, {
        tcpOpen: false,
        tcpHandshake: ['syn'],
        tcpDelivered: [],
        tcpGap: null,
      })
    }
    case 'syn-ack': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'response',
        label: 'SYN-ACK',
        from: 'Server',
        to: 'Client',
        reason:
          op.note ??
          'Server answers SYN-ACK: ACK = Client+1, plus SEQ. Server for its own stream.',
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        tcpOpen: false,
        tcpHandshake: ['syn', 'syn-ack'],
      })
    }
    case 'ack': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'request',
        label: 'ACK',
        from: 'Client',
        to: 'Server',
        reason:
          op.note ??
          'Client finishes with ACK = Server+1. Both sides agree: the connection is open.',
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        tcpOpen: true,
        tcpHandshake: ['syn', 'syn-ack', 'ack'],
        okCount: state.okCount + 1,
      })
    }
    case 'send': {
      const delivered =
        label === 'data' && !state.tcpDelivered.includes(label)
          ? [...state.tcpDelivered, label]
          : state.tcpDelivered
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'request',
        label: `Send ${label}`,
        from: 'Client',
        to: 'Server',
        reason: op.note ?? `Client puts ${label} on the TCP pipe.`,
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        tcpOpen: true,
        tcpDelivered: delivered,
        okCount: state.okCount + 1,
      })
    }
    case 'deliver': {
      const delivered = state.tcpDelivered.includes(label)
        ? state.tcpDelivered
        : [...state.tcpDelivered, label]
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'response',
        label: `Deliver ${label}`,
        from: 'Server',
        to: 'Client',
        reason: op.note ?? `Server accepts ${label} in order.`,
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        tcpDelivered: delivered,
        tcpGap: state.tcpGap === label ? null : state.tcpGap,
        okCount: state.okCount + 1,
      })
    }
    case 'loss': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'refuse',
        label: `Lost ${label}`,
        from: 'Client',
        to: 'Server',
        reason: op.note ?? `${label} never arrives. TCP will need to recover.`,
        outcome: 'error',
      }
      return withFlight(state, flight, {
        tcpGap: label,
        errorCount: state.errorCount + 1,
      })
    }
    case 'retransmit': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'retry',
        label: `Resend ${label}`,
        from: 'Client',
        to: 'Server',
        reason: op.note ?? `TCP resends ${label} to fill the gap.`,
        outcome: 'pending',
      }
      return withFlight(state, flight, { tcpGap: label })
    }
    case 'close': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'info',
        label: 'TCP close',
        from: 'Client',
        to: 'Server',
        reason:
          op.note ??
          'Connection closes. While it was open, higher protocols like HTTP could ride this pipe.',
        outcome: 'info',
      }
      return withFlight(state, flight, { tcpOpen: false })
    }
    default: {
      const _exhaustive: never = op.action
      return _exhaustive
    }
  }
}

function applyProtocol(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'protocol' }>,
): NetworkSimState {
  const label = op.label ?? `S${op.streamId ?? '?'}`
  switch (op.action) {
    case 'tcp-open': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'info',
        label: 'TCP open',
        from: 'Client',
        to: 'Server',
        reason:
          'TCP opens first: one reliable, ordered byte pipe. HTTP rides on top of this connection.',
        outcome: 'info',
      }
      return withFlight(state, flight, {
        tcpOpen: true,
        protocol: 'http1',
      })
    }
    case 'switch': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'info',
        label: 'Switch to HTTP/2',
        from: 'Client',
        to: 'Server',
        reason:
          'Same TCP connection, new HTTP rules: many streams share the pipe at once (multiplexing).',
        outcome: 'info',
      }
      return withFlight(state, flight, {
        protocol: 'http2',
        queued: [],
        activeStreams: [],
        tcpOpen: true,
      })
    }
    case 'enqueue': {
      const queued = [...state.queued, label]
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'info',
        label: `Queue ${label}`,
        from: 'Client',
        to: 'Queue',
        reason: `HTTP/1.1: ${label} joins the wait list on this TCP connection.`,
        outcome: 'pending',
      }
      return withFlight(state, flight, { queued, protocol: 'http1', tcpOpen: true })
    }
    case 'start': {
      if (op.mode === 'http1') {
        const queued = state.queued.filter((q) => q !== label)
        const flight: NetworkFlight = {
          id: nextFlightId(),
          kind: 'stream',
          label: `Send ${label}`,
          from: 'Client',
          to: 'Server',
          streamId: op.streamId,
          reason: `HTTP/1.1 sends ${label} alone on the TCP pipe. Others stay queued (head-of-line).`,
          outcome: 'pending',
        }
        return withFlight(state, flight, {
          queued,
          activeStreams: [label],
          protocol: 'http1',
          tcpOpen: true,
        })
      }
      const activeStreams = state.activeStreams.includes(label)
        ? state.activeStreams
        : [...state.activeStreams, label]
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'stream',
        label: `Stream ${label}`,
        from: 'Client',
        to: 'Server',
        streamId: op.streamId,
        reason: `HTTP/2 opens stream ${label} on its own lane inside the same TCP connection.`,
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        activeStreams,
        protocol: 'http2',
        tcpOpen: true,
        okCount: state.okCount + 1,
      })
    }
    case 'finish': {
      const activeStreams = state.activeStreams.filter((s) => s !== label)
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'response',
        label: `Done ${label}`,
        from: 'Server',
        to: 'Client',
        streamId: op.streamId,
        reason:
          state.protocol === 'http1'
            ? `HTTP/1.1 finished ${label}. The next queued request may use the TCP pipe.`
            : `HTTP/2 finished stream ${label}. Other streams keep their own lanes.`,
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        activeStreams,
        okCount: state.okCount + 1,
      })
    }
    default: {
      const _exhaustive: never = op.action
      return _exhaustive
    }
  }
}

function applyGrpc(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'grpc' }>,
): NetworkSimState {
  const isReturn = op.action === 'rpc-return'
  const flight: NetworkFlight = {
    id: nextFlightId(),
    kind: isReturn ? 'response' : 'request',
    label: op.label,
    from: isReturn ? 'Server' : 'Client',
    to: isReturn ? 'Client' : 'Server',
    reason:
      op.note ??
      (isReturn
        ? 'Return value comes back to the caller.'
        : 'Arguments go to the other machine to run the function.'),
    outcome: 'ok',
  }
  return withFlight(state, flight, {
    lastPath: op.label,
    lastMethod: isReturn ? 'return' : 'call',
    okCount: state.okCount + 1,
  })
}

function applyRealtime(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'realtime' }>,
): NetworkSimState {
  switch (op.action) {
    case 'hold': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'request',
        label: 'Ask & wait',
        from: 'Client',
        to: 'API',
        reason:
          op.note ??
          'Long poll: client sends a request and waits. The server holds it until there is news.',
        outcome: 'pending',
      }
      return withFlight(state, flight, {
        channel: 'long-poll',
        heldRequest: true,
      })
    }
    case 'reply': {
      const events = op.event ? [...state.lpEvents, op.event] : state.lpEvents
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'response',
        label: op.event ? `Reply ${op.event}` : 'Reply',
        from: 'API',
        to: 'Client',
        reason:
          op.note ??
          'Server answers with the news. This HTTP request is done. Client must ask again for the next update.',
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        channel: 'long-poll',
        heldRequest: false,
        lpEvents: events,
        okCount: state.okCount + 1,
      })
    }
    case 'open': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'info',
        label: 'Open socket',
        from: 'Client',
        to: 'API',
        reason: op.note ?? 'WebSocket: open one connection and keep it open.',
        outcome: 'info',
      }
      return withFlight(state, flight, {
        channel: 'websocket',
        wsOpen: true,
      })
    }
    case 'push': {
      const events = op.event ? [...state.wsEvents, op.event] : state.wsEvents
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'push',
        label: op.event ? `Push ${op.event}` : 'Push',
        from: 'API',
        to: 'Client',
        reason:
          op.note ??
          'Server sends an update on the open WebSocket. No new HTTP request needed.',
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        channel: 'websocket',
        wsOpen: true,
        wsEvents: events,
        okCount: state.okCount + 1,
      })
    }
    case 'close': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'info',
        label: 'Close socket',
        from: 'Client',
        to: 'API',
        reason:
          op.note ??
          'WebSocket closed. Later updates need a new open (or a reconnect plan).',
        outcome: 'info',
      }
      return withFlight(state, flight, {
        channel: 'websocket',
        wsOpen: false,
      })
    }
    default: {
      const _exhaustive: never = op.action
      return _exhaustive
    }
  }
}

function applyGateway(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'gateway' }>,
): NetworkSimState {
  switch (op.action) {
    case 'auth-ok': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'auth',
        label: `Auth OK ${op.path}`,
        from: 'Client',
        to: 'Gateway',
        path: op.path,
        reason: `Gateway checks the token for ${op.path}. Auth passes.`,
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        authOk: true,
        lastPath: op.path,
        okCount: state.okCount + 1,
      })
    }
    case 'auth-deny': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'refuse',
        label: `401 ${op.path}`,
        from: 'Gateway',
        to: 'Client',
        path: op.path,
        status: 401,
        reason: `Gateway rejects ${op.path}. Request never reaches a service.`,
        outcome: 'error',
      }
      return withFlight(state, flight, {
        authOk: false,
        routeTarget: null,
        lastPath: op.path,
        lastStatus: 401,
        errorCount: state.errorCount + 1,
      })
    }
    case 'route': {
      const target = op.target ?? 'Service'
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'route',
        label: `${op.path} → ${target}`,
        from: 'Gateway',
        to: target,
        path: op.path,
        reason: `Gateway routes ${op.path} to the ${target} service.`,
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        routeTarget: target,
        lastPath: op.path,
        okCount: state.okCount + 1,
      })
    }
    default: {
      const _exhaustive: never = op.action
      return _exhaustive
    }
  }
}

function applyRate(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'rate' }>,
): NetworkSimState {
  switch (op.action) {
    case 'allow': {
      if (!canAllowRequest(state.tokens)) {
        return applyRate(state, { type: 'rate', action: 'deny', label: op.label })
      }
      const next = takeToken(state)
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'token',
        label: `${op.label ?? 'request'} allowed`,
        from: 'Client',
        to: 'API',
        status: 200,
        reason: `Token spent. Bucket now ${next.tokens}/${next.tokenCapacity}.`,
        outcome: 'ok',
      }
      return withFlight(next, flight, { okCount: state.okCount + 1 })
    }
    case 'deny': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'refuse',
        label: `${op.label ?? 'request'} → 429`,
        from: 'API',
        to: 'Client',
        status: 429,
        reason: 'Bucket empty. API returns 429 Too Many Requests.',
        outcome: 'error',
      }
      return withFlight(state, flight, {
        lastStatus: 429,
        errorCount: state.errorCount + 1,
      })
    }
    case 'refill': {
      const next = refillTokens(state, 1)
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'token',
        label: 'Refill +1',
        from: 'Limiter',
        to: 'Bucket',
        reason: `Tokens refill over time. Bucket now ${next.tokens}/${next.tokenCapacity}.`,
        outcome: 'info',
      }
      return withFlight(next, flight)
    }
    default: {
      const _exhaustive: never = op.action
      return _exhaustive
    }
  }
}

function applyRetry(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'retry' }>,
): NetworkSimState {
  switch (op.action) {
    case 'attempt': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'retry',
        label: `Attempt ${op.attempt}`,
        from: 'Client',
        to: 'Dependency',
        attempt: op.attempt,
        reason: `Call attempt ${op.attempt} of ${state.maxAttempts}.`,
        outcome: 'pending',
      }
      return withFlight(state, flight, {
        attempt: op.attempt,
        backoffLabel: null,
      })
    }
    case 'timeout': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'refuse',
        label: `Timeout attempt ${op.attempt}`,
        from: 'Dependency',
        to: 'Client',
        attempt: op.attempt,
        reason: 'Deadline hit. Client stops waiting and prepares a retry.',
        outcome: 'error',
      }
      return withFlight(state, flight, {
        errorCount: state.errorCount + 1,
      })
    }
    case 'backoff': {
      const ms = op.attempt === 1 ? 200 : op.attempt === 2 ? 400 : 800
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'info',
        label: `Backoff ~${ms}ms`,
        from: 'Client',
        to: 'Client',
        attempt: op.attempt,
        reason: `Exponential backoff (~${ms}ms + jitter) before the next attempt.`,
        outcome: 'info',
      }
      return withFlight(state, flight, {
        backoffLabel: `~${ms}ms`,
      })
    }
    case 'success': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'response',
        label: `Success attempt ${op.attempt}`,
        from: 'Dependency',
        to: 'Client',
        attempt: op.attempt,
        status: 200,
        reason: 'Dependency answered. Retries stop.',
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        attempt: op.attempt,
        backoffLabel: null,
        okCount: state.okCount + 1,
      })
    }
    default: {
      const _exhaustive: never = op.action
      return _exhaustive
    }
  }
}

function applyBreaker(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'breaker' }>,
): NetworkSimState {
  const { breaker, failureStreak } = nextBreakerState(
    state.breaker,
    op.action,
    state.failureStreak,
    state.failureThreshold,
  )

  switch (op.action) {
    case 'fail': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'refuse',
        label: `Failure ${failureStreak}/${state.failureThreshold}`,
        from: 'Dependency',
        to: 'Client',
        reason: `Call failed. Failure streak ${failureStreak}/${state.failureThreshold}.`,
        outcome: 'error',
      }
      return withFlight(state, flight, {
        breaker,
        failureStreak,
        errorCount: state.errorCount + 1,
      })
    }
    case 'open': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'breaker',
        label: 'Breaker OPEN',
        from: 'Breaker',
        to: 'Client',
        reason: 'Threshold hit. Breaker opens and fails fast instead of waiting on a dead dependency.',
        outcome: 'info',
      }
      return withFlight(state, flight, { breaker: 'open', failureStreak })
    }
    case 'reject': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'refuse',
        label: 'Fail fast',
        from: 'Breaker',
        to: 'Client',
        reason: 'Breaker is open. Request is rejected locally without calling the dependency.',
        outcome: 'error',
      }
      return withFlight(state, flight, {
        breaker: 'open',
        errorCount: state.errorCount + 1,
      })
    }
    case 'probe': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'breaker',
        label: 'Half-open probe',
        from: 'Client',
        to: 'Dependency',
        reason: 'Half-open: one probe call checks whether the dependency recovered.',
        outcome: 'pending',
      }
      return withFlight(state, flight, { breaker: 'half-open', failureStreak })
    }
    case 'success': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'response',
        label: 'Breaker CLOSED',
        from: 'Dependency',
        to: 'Client',
        reason: 'Probe succeeded. Breaker closes and normal traffic resumes.',
        outcome: 'ok',
      }
      return withFlight(state, flight, {
        breaker: 'closed',
        failureStreak: 0,
        okCount: state.okCount + 1,
      })
    }
    default: {
      const _exhaustive: never = op.action
      return _exhaustive
    }
  }
}

function applyBulkhead(
  state: NetworkSimState,
  op: Extract<NetworkScriptOp, { type: 'bulkhead' }>,
): NetworkSimState {
  const isA = op.pool === 'A'
  const inUse = isA ? state.poolAInUse : state.poolBInUse
  const cap = isA ? state.poolACap : state.poolBCap

  switch (op.action) {
    case 'acquire': {
      if (!poolHasCapacity(inUse, cap)) {
        return applyBulkhead(state, { ...op, action: 'reject' })
      }
      const patch = isA
        ? { poolAInUse: inUse + 1 }
        : { poolBInUse: inUse + 1 }
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'pool',
        label: `Pool ${op.pool} + ${op.label ?? 'call'}`,
        from: 'Client',
        to: `Pool ${op.pool}`,
        reason: `Pool ${op.pool} accepts the call (${inUse + 1}/${cap} in flight).`,
        outcome: 'ok',
      }
      return withFlight(state, flight, { ...patch, okCount: state.okCount + 1 })
    }
    case 'reject': {
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'refuse',
        label: `Pool ${op.pool} full`,
        from: `Pool ${op.pool}`,
        to: 'Client',
        reason: `Pool ${op.pool} is at capacity (${inUse}/${cap}). Other pools stay available.`,
        outcome: 'error',
      }
      return withFlight(state, flight, { errorCount: state.errorCount + 1 })
    }
    case 'release': {
      const nextInUse = Math.max(0, inUse - 1)
      const patch = isA
        ? { poolAInUse: nextInUse }
        : { poolBInUse: nextInUse }
      const flight: NetworkFlight = {
        id: nextFlightId(),
        kind: 'pool',
        label: `Pool ${op.pool} release`,
        from: `Pool ${op.pool}`,
        to: 'Client',
        reason: `Call finished. Pool ${op.pool} now ${nextInUse}/${cap}.`,
        outcome: 'info',
      }
      return withFlight(state, flight, patch)
    }
    default: {
      const _exhaustive: never = op.action
      return _exhaustive
    }
  }
}

function applyOp(state: NetworkSimState, op: NetworkScriptOp): NetworkSimState {
  switch (op.type) {
    case 'http':
      return applyHttp(state, op)
    case 'rest':
      return applyRest(state, op)
    case 'tcp':
      return applyTcp(state, op)
    case 'protocol':
      return applyProtocol(state, op)
    case 'grpc':
      return applyGrpc(state, op)
    case 'realtime':
      return applyRealtime(state, op)
    case 'gateway':
      return applyGateway(state, op)
    case 'rate':
      return applyRate(state, op)
    case 'retry':
      return applyRetry(state, op)
    case 'breaker':
      return applyBreaker(state, op)
    case 'bulkhead':
      return applyBulkhead(state, op)
    default: {
      const _exhaustive: never = op
      return _exhaustive
    }
  }
}

/** Spawn the next scripted networking beat as an in-flight animation. */
export function spawnNetworkOp(state: NetworkSimState): NetworkSimState {
  if (state.flight || state.finished) return state
  if (state.nextOpIndex >= state.maxArrivals) {
    return {
      ...state,
      finished: true,
      caption: 'Demo complete. Press Replay to watch again.',
      tick: state.tick + 1,
    }
  }
  const op = state.script[state.nextOpIndex]
  if (!op) {
    return {
      ...state,
      finished: true,
      caption: 'Demo complete. Press Replay to watch again.',
      tick: state.tick + 1,
    }
  }
  const next = applyOp(state, op)
  return {
    ...next,
    nextOpIndex: state.nextOpIndex + 1,
    arrivalsCount: state.arrivalsCount + 1,
  }
}

/** Clear the flight after travel; mark finished when the script is done. */
export function completeNetworkFlight(state: NetworkSimState): NetworkSimState {
  if (!state.flight) return state
  const done = state.nextOpIndex >= state.maxArrivals
  return {
    ...state,
    flight: null,
    finished: done,
    caption: done
      ? 'Demo complete. Press Replay to watch again.'
      : state.caption,
    tick: state.tick + 1,
  }
}

export function idleNetworkTick(state: NetworkSimState): NetworkSimState {
  if (state.flight) return state
  if (state.arrivalsCount >= state.maxArrivals) {
    return {
      ...state,
      finished: true,
      caption: 'Demo complete. Press Replay to watch again.',
      tick: state.tick + 1,
    }
  }
  return {
    ...state,
    caption: captionForIdle(state.algo),
    tick: state.tick + 1,
  }
}
