import type { LoadBalancerSimDefaults } from '../types'
import { hashToRing } from './strategies'
import {
  DEFAULT_MAX_ARRIVALS,
  RING_SIZE,
  type LoadBalancerSimState,
  type SimServer,
} from './types'

export function serverLabel(index: number): string {
  return `S${index + 1}`
}

export function buildServers(count: number, weights?: number[]): SimServer[] {
  const servers: SimServer[] = []
  for (let i = 0; i < count; i++) {
    const id = `server-${i + 1}`
    const weight = weights?.[i] ?? 1
    servers.push({
      id,
      label: serverLabel(i),
      weight,
      activeConnections: 0,
      totalHandled: 0,
      ringPosition: hashToRing(id),
    })
  }
  const used = new Set<number>()
  for (const server of servers) {
    let pos = server.ringPosition
    while (used.has(pos)) pos = (pos + 37) % RING_SIZE
    used.add(pos)
    server.ringPosition = pos
  }
  return servers
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
    finished: false,
  }
}
