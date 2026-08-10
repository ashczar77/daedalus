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

/** One request currently traveling client → LB → server. */
export type SimFlight = {
  id: string
  clientKey: string
  clientIndex: number
  serverId: string
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
  finished: boolean
}

export const RING_SIZE = 360
export const DEFAULT_MAX_ARRIVALS = 12
