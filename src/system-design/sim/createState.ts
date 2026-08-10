import type { LoadBalancerSimDefaults } from '../types'
import {
  DEFAULT_MAX_ARRIVALS,
  DEFAULT_MAX_SERVERS,
  RING_SIZE,
  type LoadBalancerSimState,
  type SimServer,
} from './types'

export function serverLabel(index: number): string {
  return `S${index + 1}`
}

/**
 * Place servers evenly around the ring so the teaching visual stays readable.
 * Offset keeps early client hashes from landing on top of a server (which made
 * the first trail look like a blink with no motion).
 * (Production systems hash node ids; clustering then needs virtual nodes.)
 */
export function buildServers(count: number, weights?: number[]): SimServer[] {
  const n = Math.max(0, count)
  const servers: SimServer[] = []
  const offset = 90
  for (let i = 0; i < n; i++) {
    const id = `server-${i + 1}`
    servers.push({
      id,
      label: serverLabel(i),
      weight: weights?.[i] ?? 1,
      activeConnections: 0,
      totalHandled: 0,
      ringPosition:
        n === 0 ? 0 : Math.round((i * RING_SIZE) / n + offset) % RING_SIZE,
    })
  }
  return servers
}

/** Midpoint of the largest empty arc (clockwise) between existing servers. */
export function placeInLargestGap(servers: SimServer[]): number {
  if (servers.length === 0) return 0
  const ordered = [...servers].sort((a, b) => a.ringPosition - b.ringPosition)
  let bestStart = ordered[0]!.ringPosition
  let bestGap = 0
  for (let i = 0; i < ordered.length; i++) {
    const a = ordered[i]!.ringPosition
    const b =
      i + 1 < ordered.length
        ? ordered[i + 1]!.ringPosition
        : ordered[0]!.ringPosition + RING_SIZE
    const gap = b - a
    if (gap > bestGap) {
      bestGap = gap
      bestStart = a
    }
  }
  return Math.round(bestStart + bestGap / 2) % RING_SIZE
}

export function createSimState(defaults: LoadBalancerSimDefaults): LoadBalancerSimState {
  return {
    algo: defaults.algo,
    servers: buildServers(defaults.serverCount, defaults.weights),
    requests: [],
    flight: null,
    rrIndex: 0,
    wrrCurrentWeight: 0,
    tick: 0,
    nextRequestId: 1,
    nextClientIndex: 0,
    requestDurationTicks: defaults.requestDurationTicks,
    maxArrivals: defaults.maxArrivals ?? DEFAULT_MAX_ARRIVALS,
    arrivalsCount: 0,
    allowServerChurn: Boolean(defaults.allowServerChurn),
    maxServers: defaults.maxServers ?? DEFAULT_MAX_SERVERS,
    finished: false,
  }
}
