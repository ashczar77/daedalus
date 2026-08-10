import type { LoadBalancerAlgo } from '../types'

export type SimServer = {
  id: string
  label: string
  weight: number
  activeConnections: number
  totalHandled: number
  ringPosition: number
}

export type SimRequest = {
  id: string
  clientKey: string
  clientIndex: number
  serverId: string
  remainingTicks: number
}

/** One request currently traveling to its chosen server. */
export type SimFlight = {
  id: string
  clientKey: string
  clientIndex: number
  serverId: string
  /** Short callout of why this server was chosen. */
  reason: string
  /** Round-robin cursor index used for this pick. */
  cursorIndex?: number
  /** Weighted-RR slot index used for this pick. */
  slotIndex?: number
  /** Client key position on the hash ring (0..RING_SIZE). */
  keyRingPos?: number
  /** Active connections on the chosen server at pick time (least-conn). */
  chosenActive?: number
}

export type LoadBalancerSimState = {
  algo: LoadBalancerAlgo
  servers: SimServer[]
  requests: SimRequest[]
  /** At most one active visual flight. */
  flight: SimFlight | null
  rrIndex: number
  wrrCurrentWeight: number
  tick: number
  nextRequestId: number
  nextClientIndex: number
  requestDurationTicks: number
  maxArrivals: number
  arrivalsCount: number
  allowServerChurn: boolean
  /** Upper bound for add-server (Infinity when unset). */
  maxServers: number
  finished: boolean
}

export const RING_SIZE = 360
export const DEFAULT_MAX_ARRIVALS = 12
export const DEFAULT_MAX_SERVERS = 5
