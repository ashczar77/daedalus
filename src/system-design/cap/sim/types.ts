import type { CapAlgo, CapMode } from '../../types'

export type CapSide = 'left' | 'right'

export type CapReplica = {
  id: string
  label: string
  value: string
  side: CapSide
  /** False when CP minority refuses work. */
  accepting: boolean
}

export type CapClient = {
  id: string
  label: string
  side: CapSide
}

export type CapFlightKind =
  | 'write-ok'
  | 'write-refuse'
  | 'read-ok'
  | 'read-refuse'
  | 'partition-cut'
  | 'heal'
  | 'mode-switch'

export type CapFlight = {
  id: string
  kind: CapFlightKind
  clientId: string | null
  replicaIds: string[]
  value: string | null
  reason: string
  outcome: 'ok' | 'refused' | 'info'
}

export type CapScriptOp =
  | { type: 'write'; side: CapSide; value: string }
  | { type: 'read'; side: CapSide }
  | { type: 'partition' }
  | { type: 'heal' }
  | { type: 'set-mode'; mode: CapMode }

export type CapSimState = {
  algo: CapAlgo
  mode: CapMode
  replicas: CapReplica[]
  clients: CapClient[]
  partitioned: boolean
  /** Monotonic write clock for last-write-wins on heal. */
  writeClock: number
  lastWriteValue: string
  flight: CapFlight | null
  tick: number
  nextOpIndex: number
  arrivalsCount: number
  maxArrivals: number
  finished: boolean
  script: CapScriptOp[]
  okCount: number
  refuseCount: number
  caption: string
  /** Which CAP letter is currently sacrificed (dimmed in the legend). */
  sacrificed: 'C' | 'A' | null
}

export const DEFAULT_CAP_MAX_ARRIVALS = 14
export const INITIAL_VALUE = 'v0'
