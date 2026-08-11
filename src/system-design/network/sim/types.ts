import type { NetworkAlgo } from '../../types'

export type BreakerState = 'closed' | 'open' | 'half-open'
export type ProtocolMode = 'http1' | 'http2'
export type RealtimeMode = 'idle' | 'long-poll' | 'websocket'

export type NetworkFlightOutcome = 'ok' | 'error' | 'info' | 'pending'

export type NetworkFlightKind =
  | 'request'
  | 'response'
  | 'refuse'
  | 'stream'
  | 'push'
  | 'auth'
  | 'route'
  | 'token'
  | 'retry'
  | 'breaker'
  | 'pool'
  | 'info'

export type NetworkFlight = {
  id: string
  kind: NetworkFlightKind
  label: string
  from: string
  to: string
  reason: string
  outcome: NetworkFlightOutcome
  method?: string
  path?: string
  status?: number
  attempt?: number
  streamId?: number
}

export type NetworkScriptOp =
  | {
      type: 'http'
      /** Outbound call vs reply traveling back to the client. */
      phase: 'request' | 'response'
      method: string
      path: string
      status: number
      note?: string
    }
  | {
      type: 'rest'
      phase: 'request' | 'response'
      action: 'post' | 'put-retry' | 'post-retry' | 'page' | 'version'
      note?: string
    }
  | {
      type: 'tcp'
      action: 'syn' | 'syn-ack' | 'ack' | 'send' | 'deliver' | 'loss' | 'retransmit' | 'close'
      label?: string
      note?: string
    }
  | {
      type: 'protocol'
      mode: ProtocolMode
      action: 'tcp-open' | 'enqueue' | 'start' | 'finish' | 'switch'
      streamId?: number
      label?: string
    }
  | {
      type: 'grpc'
      action: 'rpc-call' | 'rpc-return'
      label: string
      note?: string
    }
  | {
      type: 'realtime'
      mode: RealtimeMode
      action: 'hold' | 'reply' | 'open' | 'push' | 'close'
      event?: string
    }
  | {
      type: 'gateway'
      action: 'auth-ok' | 'auth-deny' | 'route'
      path: string
      target?: string
    }
  | {
      type: 'rate'
      action: 'allow' | 'deny' | 'refill'
      label?: string
    }
  | {
      type: 'retry'
      action: 'attempt' | 'timeout' | 'backoff' | 'success'
      attempt: number
    }
  | {
      type: 'breaker'
      action: 'fail' | 'open' | 'probe' | 'success' | 'reject'
    }
  | {
      type: 'bulkhead'
      pool: 'A' | 'B'
      action: 'acquire' | 'reject' | 'release'
      label?: string
    }

export type NetworkSimState = {
  algo: NetworkAlgo
  flight: NetworkFlight | null
  tick: number
  nextOpIndex: number
  arrivalsCount: number
  maxArrivals: number
  finished: boolean
  script: NetworkScriptOp[]
  caption: string
  okCount: number
  errorCount: number

  lastMethod: string | null
  lastPath: string | null
  lastStatus: number | null

  /** REST: created resource ids (POST duplicates show up here). */
  createdIds: string[]
  cursor: string | null
  apiVersion: string

  protocol: ProtocolMode
  /** True after the three-way handshake finishes (ACK). */
  tcpOpen: boolean
  /** Handshake steps completed so far (TCP lab sequence diagram). */
  tcpHandshake: Array<'syn' | 'syn-ack' | 'ack'>
  /** Bytes/segments delivered in order so far (TCP lab). */
  tcpDelivered: string[]
  /** Segment currently missing / being fixed (TCP lab). */
  tcpGap: string | null
  /** In-flight HTTP/2 stream labels. */
  activeStreams: string[]
  /** HTTP/1.1 waiting queue. */
  queued: string[]

  channel: RealtimeMode
  heldRequest: boolean
  pushEvents: string[]

  authOk: boolean
  routeTarget: string | null

  tokens: number
  tokenCapacity: number

  attempt: number
  maxAttempts: number
  backoffLabel: string | null

  breaker: BreakerState
  failureStreak: number
  failureThreshold: number

  poolAInUse: number
  poolBInUse: number
  poolACap: number
  poolBCap: number
}

export const DEFAULT_NETWORK_MAX_ARRIVALS = 24
