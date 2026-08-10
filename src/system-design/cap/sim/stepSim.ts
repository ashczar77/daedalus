import type { CapMode } from '../../types'
import { captionForIdle } from './createState'
import {
  replicasOnSide,
  sacrificedFor,
  sideAccepts,
  withAcceptingFlags,
} from './strategies'
import type {
  CapFlight,
  CapScriptOp,
  CapSide,
  CapSimState,
} from './types'

let flightSeq = 0

function nextFlightId(): string {
  flightSeq += 1
  return `cap-flight-${flightSeq}`
}

function clientForSide(state: CapSimState, side: CapSide) {
  return state.clients.find((client) => client.side === side) ?? state.clients[0]!
}

function zoneName(side: CapSide): string {
  return side === 'left' ? 'Zone A' : 'Zone B'
}

function applyWrite(
  state: CapSimState,
  side: CapSide,
  value: string,
): CapSimState {
  const client = clientForSide(state, side)
  const accepts = sideAccepts(side, state.partitioned, state.mode)
  const zone = zoneName(side)

  if (!accepts) {
    const flight: CapFlight = {
      id: nextFlightId(),
      kind: 'write-refuse',
      clientId: client.id,
      replicaIds: replicasOnSide(state.replicas, side).map((r) => r.id),
      value,
      reason: `${zone} returns an error on write ${value}. Prefer Consistency: this smaller side will not invent a second value while cut off.`,
      outcome: 'refused',
    }
    return {
      ...state,
      flight,
      caption: flight.reason,
      refuseCount: state.refuseCount + 1,
      tick: state.tick + 1,
    }
  }

  const reachSides: CapSide[] = state.partitioned ? [side] : ['left', 'right']
  const reachableIds = new Set(
    state.replicas
      .filter((replica) => reachSides.includes(replica.side))
      .map((replica) => replica.id),
  )

  const flight: CapFlight = {
    id: nextFlightId(),
    kind: 'write-ok',
    clientId: client.id,
    replicaIds: [...reachableIds],
    value,
    reason: state.partitioned
      ? `${zone} accepts write ${value}. The broken network blocks sync to the other zone.`
      : `Write ${value} copies to every server. Network is healthy.`,
    outcome: 'ok',
  }

  return {
    ...state,
    flight,
    caption: flight.reason,
    writeClock: state.writeClock + 1,
    lastWriteValue: value,
    okCount: state.okCount + 1,
    tick: state.tick + 1,
  }
}

function applyRead(state: CapSimState, side: CapSide): CapSimState {
  const client = clientForSide(state, side)
  const accepts = sideAccepts(side, state.partitioned, state.mode)
  const local = replicasOnSide(state.replicas, side)
  const value = local[0]?.value ?? '?'
  const zone = zoneName(side)

  if (!accepts) {
    const flight: CapFlight = {
      id: nextFlightId(),
      kind: 'read-refuse',
      clientId: client.id,
      replicaIds: local.map((r) => r.id),
      value,
      reason: `${zone} returns an error on read. Prefer Consistency: better no answer than a possibly stale island.`,
      outcome: 'refused',
    }
    return {
      ...state,
      flight,
      caption: flight.reason,
      refuseCount: state.refuseCount + 1,
      tick: state.tick + 1,
    }
  }

  const flight: CapFlight = {
    id: nextFlightId(),
    kind: 'read-ok',
    clientId: client.id,
    replicaIds: local.map((r) => r.id),
    value,
    reason: `${zone} answers the read with stored value ${value}.`,
    outcome: 'ok',
  }

  return {
    ...state,
    flight,
    caption: flight.reason,
    okCount: state.okCount + 1,
    tick: state.tick + 1,
  }
}

function applyPartition(state: CapSimState): CapSimState {
  const replicas = withAcceptingFlags(state.replicas, true, state.mode)
  const flight: CapFlight = {
    id: nextFlightId(),
    kind: 'partition-cut',
    clientId: null,
    replicaIds: state.replicas.map((r) => r.id),
    value: null,
    reason:
      'Network broken between Zone A and Zone B. Servers stay up, but they can no longer sync across the cut.',
    outcome: 'info',
  }
  return {
    ...state,
    partitioned: true,
    replicas,
    flight,
    caption: flight.reason,
    sacrificed: sacrificedFor(true, state.mode),
    tick: state.tick + 1,
  }
}

function applyHeal(state: CapSimState): CapSimState {
  const converged = state.lastWriteValue
  const replicas = withAcceptingFlags(
    state.replicas.map((replica) => ({ ...replica, value: converged })),
    false,
    state.mode,
  )
  const flight: CapFlight = {
    id: nextFlightId(),
    kind: 'heal',
    clientId: null,
    replicaIds: replicas.map((r) => r.id),
    value: converged,
    reason: `Network healed. Servers sync again and settle on ${converged} (last write wins in this demo).`,
    outcome: 'info',
  }
  return {
    ...state,
    partitioned: false,
    replicas,
    flight,
    caption: flight.reason,
    sacrificed: sacrificedFor(false, state.mode),
    tick: state.tick + 1,
  }
}

function applyModeSwitch(state: CapSimState, mode: CapMode): CapSimState {
  const replicas = withAcceptingFlags(
    state.replicas,
    state.partitioned,
    mode,
  )
  const flight: CapFlight = {
    id: nextFlightId(),
    kind: 'mode-switch',
    clientId: null,
    replicaIds: replicas.map((r) => r.id),
    value: null,
    reason:
      mode === 'cp'
        ? 'Policy: Prefer Consistency. Zone B may return errors so every answer stays aligned.'
        : 'Policy: Prefer Availability. Both zones keep answering; stored values may disagree until heal.',
    outcome: 'info',
  }
  return {
    ...state,
    mode,
    replicas,
    flight,
    caption: flight.reason,
    sacrificed: sacrificedFor(state.partitioned, mode),
    tick: state.tick + 1,
  }
}

function runOp(state: CapSimState, op: CapScriptOp): CapSimState {
  switch (op.type) {
    case 'write':
      return applyWrite(state, op.side, op.value)
    case 'read':
      return applyRead(state, op.side)
    case 'partition':
      return applyPartition(state)
    case 'heal':
      return applyHeal(state)
    case 'set-mode':
      return applyModeSwitch(state, op.mode)
    default: {
      const _exhaustive: never = op
      return _exhaustive
    }
  }
}

/** Spawn the next scripted CAP beat as an in-flight message. */
export function spawnCapOp(state: CapSimState): CapSimState {
  if (state.flight || state.finished) return state
  if (state.nextOpIndex >= state.maxArrivals) {
    return {
      ...state,
      finished: true,
      caption: 'Demo burst complete. Press Replay to watch again.',
    }
  }

  const op = state.script[state.nextOpIndex]
  if (!op) {
    return {
      ...state,
      finished: true,
      caption: 'Demo burst complete. Press Replay to watch again.',
    }
  }

  const next = runOp(state, op)
  return {
    ...next,
    nextOpIndex: state.nextOpIndex + 1,
    arrivalsCount: state.arrivalsCount + 1,
  }
}

/** Commit the in-flight effect (mutate replica values after travel). */
export function completeCapFlight(state: CapSimState): CapSimState {
  const flight = state.flight
  if (!flight) return state

  let replicas = state.replicas

  if (flight.kind === 'write-ok' && flight.value != null) {
    const targets = new Set(flight.replicaIds)
    replicas = replicas.map((replica) =>
      targets.has(replica.id)
        ? { ...replica, value: flight.value! }
        : replica,
    )
  }

  replicas = withAcceptingFlags(replicas, state.partitioned, state.mode)

  const finished = state.nextOpIndex >= state.maxArrivals

  return {
    ...state,
    replicas,
    flight: null,
    finished,
    caption: finished
      ? 'Demo burst complete. Press Replay to watch again.'
      : captionForIdle(state.algo, state.mode, state.partitioned),
    sacrificed: sacrificedFor(state.partitioned, state.mode),
    tick: state.tick + 1,
  }
}

export function idleCapTick(state: CapSimState): CapSimState {
  if (state.flight) return state
  if (state.nextOpIndex >= state.maxArrivals) {
    return {
      ...state,
      finished: true,
      caption: 'Demo burst complete. Press Replay to watch again.',
    }
  }
  return {
    ...state,
    tick: state.tick + 1,
  }
}
