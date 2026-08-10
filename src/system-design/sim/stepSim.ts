import { CLIENT_NAMES, clientNameFor } from './clients'
import { hashToRing, pickServer, weightedSlots } from './strategies'
import type { LoadBalancerSimState, SimFlight, SimRequest, SimServer } from './types'
import { placeInLargestGap, serverLabel } from './createState'

function ageRequests(state: LoadBalancerSimState): LoadBalancerSimState {
  const servers = state.servers.map((s) => ({ ...s }))
  const serverById = new Map(servers.map((s) => [s.id, s]))
  const requests: SimRequest[] = []
  for (const req of state.requests) {
    const remaining = req.remainingTicks - 1
    if (remaining <= 0) {
      const server = serverById.get(req.serverId)
      if (server) server.activeConnections = Math.max(0, server.activeConnections - 1)
      continue
    }
    requests.push({ ...req, remainingTicks: remaining })
  }
  return { ...state, servers, requests, tick: state.tick + 1 }
}

function maybeFinish(state: LoadBalancerSimState): LoadBalancerSimState {
  if (
    state.arrivalsCount >= state.maxArrivals &&
    state.requests.length === 0 &&
    state.flight == null
  ) {
    return { ...state, finished: true }
  }
  return state
}

/** Spawn the next request as a single in-flight packet (no spawn while one is traveling). */
export function spawnRequest(state: LoadBalancerSimState): LoadBalancerSimState {
  if (state.finished || state.flight != null) return state
  if (state.arrivalsCount >= state.maxArrivals) return maybeFinish(state)
  if (state.servers.length === 0) return state

  let next = ageRequests(state)
  const clientIndex = next.nextClientIndex % CLIENT_NAMES.length
  const clientKey = clientNameFor(next.nextClientIndex)
  next = { ...next, nextClientIndex: next.nextClientIndex + 1 }

  const cursorBefore = next.rrIndex
  const slots = weightedSlots(next.servers)
  const keyRingPos = hashToRing(clientKey)

  const pick = pickServer({
    algo: next.algo,
    servers: next.servers,
    rrIndex: next.rrIndex,
    wrrCurrentWeight: next.wrrCurrentWeight,
    request: { clientKey },
  })

  const server = next.servers.find((s) => s.id === pick.serverId)
  if (!server) return next

  const servers = next.servers.map((s) =>
    s.id === server.id
      ? {
          ...s,
          activeConnections: s.activeConnections + 1,
          totalHandled: s.totalHandled + 1,
        }
      : { ...s },
  )

  const request: SimRequest = {
    id: `r${next.nextRequestId}`,
    clientKey,
    clientIndex,
    serverId: server.id,
    remainingTicks: next.requestDurationTicks,
  }

  const flight: SimFlight = buildFlight({
    id: request.id,
    clientKey,
    clientIndex,
    server,
    serverCount: next.servers.length,
    algo: next.algo,
    cursorBefore,
    slots,
    keyRingPos,
  })

  return {
    ...next,
    servers,
    requests: [...next.requests, request],
    flight,
    rrIndex: pick.rrIndex,
    wrrCurrentWeight: pick.wrrCurrentWeight,
    nextRequestId: next.nextRequestId + 1,
    arrivalsCount: next.arrivalsCount + 1,
  }
}

function buildFlight(args: {
  id: string
  clientKey: string
  clientIndex: number
  server: { id: string; label: string; weight: number; activeConnections: number }
  serverCount: number
  algo: LoadBalancerSimState['algo']
  cursorBefore: number
  slots: string[]
  keyRingPos: number
}): SimFlight {
  const {
    id,
    clientKey,
    clientIndex,
    server,
    serverCount,
    algo,
    cursorBefore,
    slots,
    keyRingPos,
  } = args

  switch (algo) {
    case 'round-robin': {
      const cursorIndex = cursorBefore % Math.max(1, serverCount)
      return {
        id,
        clientKey,
        clientIndex,
        serverId: server.id,
        cursorIndex,
        reason: `Round-robin cursor → ${server.label}`,
      }
    }
    case 'weighted-round-robin': {
      const slotIndex = slots.length ? cursorBefore % slots.length : 0
      return {
        id,
        clientKey,
        clientIndex,
        serverId: server.id,
        slotIndex,
        reason: `Weight slot ${slotIndex + 1}/${slots.length || 1} → ${server.label} (w=${server.weight})`,
      }
    }
    case 'least-connections':
      return {
        id,
        clientKey,
        clientIndex,
        serverId: server.id,
        chosenActive: server.activeConnections,
        reason: `Fewest active connections (${server.activeConnections}) → ${server.label}`,
      }
    case 'consistent-hash':
      return {
        id,
        clientKey,
        clientIndex,
        serverId: server.id,
        keyRingPos,
        reason: `${clientKey} hashes onto the ring → clockwise to ${server.label}`,
      }
    default:
      return {
        id,
        clientKey,
        clientIndex,
        serverId: server.id,
        reason: `Routed to ${server.label}`,
      }
  }
}

/** Clear the traveling packet after its animation finishes. */
export function completeFlight(state: LoadBalancerSimState): LoadBalancerSimState {
  if (state.flight == null) return maybeFinish(state)
  return maybeFinish({
    ...state,
    flight: null,
    tick: state.tick + 1,
  })
}

/** Idle tick used between requests to age connections. */
export function idleTick(state: LoadBalancerSimState): LoadBalancerSimState {
  if (state.flight != null) return state
  return maybeFinish(ageRequests(state))
}

export function addServer(state: LoadBalancerSimState): LoadBalancerSimState {
  if (state.servers.length >= state.maxServers) return state
  const index = state.servers.length
  // Keep existing ring positions so stickiness teaching stays honest.
  const next: SimServer = {
    id: `server-${index + 1}`,
    label: serverLabel(index),
    weight: 1,
    activeConnections: 0,
    totalHandled: 0,
    ringPosition: placeInLargestGap(state.servers),
  }
  return {
    ...state,
    servers: [...state.servers.map((s) => ({ ...s })), next],
    rrIndex: 0,
    finished: false,
  }
}

export function removeServer(state: LoadBalancerSimState): LoadBalancerSimState {
  if (state.servers.length <= 1) return state
  const removed = state.servers[state.servers.length - 1]!
  const servers = state.servers.slice(0, -1).map((s) => ({ ...s }))
  const requests = state.requests
    .filter((r) => r.serverId !== removed.id)
    .map((r) => ({ ...r }))
  const flight =
    state.flight?.serverId === removed.id ? null : state.flight
  return {
    ...state,
    servers,
    requests,
    flight,
    rrIndex: 0,
  }
}

export function setServerWeight(
  state: LoadBalancerSimState,
  serverId: string,
  weight: number,
): LoadBalancerSimState {
  const clamped = Math.max(1, Math.min(5, Math.round(weight)))
  return {
    ...state,
    servers: state.servers.map((s) =>
      s.id === serverId ? { ...s, weight: clamped } : { ...s },
    ),
    rrIndex: 0,
  }
}
