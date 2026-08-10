import type { LoadBalancerAlgo } from '../types'
import { RING_SIZE, type SimRequest, type SimServer } from './types'

export type PickContext = {
  algo: LoadBalancerAlgo
  servers: SimServer[]
  /** Mutable RR / WRR cursor. */
  rrIndex: number
  /** Reserved for future smooth-WRR state. */
  wrrCurrentWeight: number
  request: Pick<SimRequest, 'clientKey'>
}

export type PickResult = {
  serverId: string
  rrIndex: number
  wrrCurrentWeight: number
}

/** Simple string hash → ring position. */
export function hashToRing(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % RING_SIZE + RING_SIZE) % RING_SIZE
}

function alive(servers: SimServer[]): SimServer[] {
  return servers.filter((s) => s.weight > 0)
}

/** Expand weighted servers into RR slots (A,A,B for weights 2,1). */
export function weightedSlots(servers: SimServer[]): string[] {
  const slots: string[] = []
  for (const server of alive(servers)) {
    for (let i = 0; i < server.weight; i++) slots.push(server.id)
  }
  return slots
}

/**
 * Choose a backend for the next request.
 * RR/WRR advance `rrIndex` via the returned value.
 */
export function pickServer(ctx: PickContext): PickResult {
  const servers = alive(ctx.servers)
  if (servers.length === 0) {
    throw new Error('No servers available')
  }

  switch (ctx.algo) {
    case 'round-robin': {
      const index = ctx.rrIndex % servers.length
      return {
        serverId: servers[index]!.id,
        rrIndex: (index + 1) % servers.length,
        wrrCurrentWeight: ctx.wrrCurrentWeight,
      }
    }
    case 'weighted-round-robin': {
      const slots = weightedSlots(servers)
      if (slots.length === 0) {
        return {
          serverId: servers[0]!.id,
          rrIndex: 0,
          wrrCurrentWeight: 0,
        }
      }
      const index = ctx.rrIndex % slots.length
      return {
        serverId: slots[index]!,
        rrIndex: (index + 1) % slots.length,
        wrrCurrentWeight: ctx.wrrCurrentWeight,
      }
    }
    case 'least-connections': {
      let best = servers[0]!
      for (const server of servers) {
        if (server.activeConnections < best.activeConnections) best = server
        else if (
          server.activeConnections === best.activeConnections &&
          server.id.localeCompare(best.id) < 0
        ) {
          best = server
        }
      }
      return {
        serverId: best.id,
        rrIndex: ctx.rrIndex,
        wrrCurrentWeight: ctx.wrrCurrentWeight,
      }
    }
    case 'consistent-hash': {
      const keyPos = hashToRing(ctx.request.clientKey)
      const ordered = [...servers].sort((a, b) => a.ringPosition - b.ringPosition)
      const chosen =
        ordered.find((s) => s.ringPosition >= keyPos) ?? ordered[0]!
      return {
        serverId: chosen.id,
        rrIndex: ctx.rrIndex,
        wrrCurrentWeight: ctx.wrrCurrentWeight,
      }
    }
    default: {
      const _exhaustive: never = ctx.algo
      return _exhaustive
    }
  }
}
