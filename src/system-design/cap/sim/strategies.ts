import type { CapMode } from '../../types'
import type { CapReplica, CapSide, CapSimState } from './types'

/** Majority is left (2 nodes); minority is right (1 node) for a clear CP story. */
export function majoritySide(): CapSide {
  return 'left'
}

export function isMajority(side: CapSide): boolean {
  return side === majoritySide()
}

export function sacrificedFor(
  partitioned: boolean,
  mode: CapMode,
): CapSimState['sacrificed'] {
  if (!partitioned) return null
  return mode === 'cp' ? 'A' : 'C'
}

export function withAcceptingFlags(
  replicas: CapReplica[],
  partitioned: boolean,
  mode: CapMode,
): CapReplica[] {
  return replicas.map((replica) => {
    if (!partitioned) {
      return { ...replica, accepting: true }
    }
    if (mode === 'ap') {
      return { ...replica, accepting: true }
    }
    // CP: only majority side accepts.
    return { ...replica, accepting: isMajority(replica.side) }
  })
}

export function replicasOnSide(
  replicas: CapReplica[],
  side: CapSide,
): CapReplica[] {
  return replicas.filter((replica) => replica.side === side)
}

export function valuesAgree(replicas: CapReplica[]): boolean {
  if (replicas.length === 0) return true
  const first = replicas[0]!.value
  return replicas.every((replica) => replica.value === first)
}

/** Side may serve under current partition + mode. */
export function sideAccepts(
  side: CapSide,
  partitioned: boolean,
  mode: CapMode,
): boolean {
  if (!partitioned) return true
  if (mode === 'ap') return true
  return isMajority(side)
}
