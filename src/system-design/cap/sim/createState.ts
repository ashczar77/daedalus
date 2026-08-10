import type { CapAlgo, CapMode, CapSimDefaults } from '../../types'
import type { CapClient, CapReplica, CapScriptOp, CapSimState } from './types'
import { DEFAULT_CAP_MAX_ARRIVALS, INITIAL_VALUE } from './types'
import { sacrificedFor, withAcceptingFlags } from './strategies'

function buildReplicas(count: number): CapReplica[] {
  const n = Math.max(3, count)
  // First two in Zone A (majority), rest in Zone B (minority).
  const replicas: CapReplica[] = []
  for (let i = 0; i < n; i++) {
    const side = i < 2 ? 'left' : 'right'
    replicas.push({
      id: `r${i + 1}`,
      label: `Server ${i + 1}`,
      value: INITIAL_VALUE,
      side,
      accepting: true,
    })
  }
  return replicas
}

function buildClients(): CapClient[] {
  return [
    { id: 'client-l', label: 'User in Zone A', side: 'left' },
    { id: 'client-r', label: 'User in Zone B', side: 'right' },
  ]
}

/** Scripted beats tuned so each CAP lab shows its decision rule. */
export function buildCapScript(algo: CapAlgo): CapScriptOp[] {
  switch (algo) {
    case 'overview':
      return [
        { type: 'write', side: 'left', value: 'v1' },
        { type: 'read', side: 'right' },
        { type: 'partition' },
        { type: 'write', side: 'left', value: 'v2' },
        { type: 'write', side: 'right', value: 'v3' },
        { type: 'read', side: 'right' },
        { type: 'set-mode', mode: 'ap' },
        { type: 'write', side: 'right', value: 'v3' },
        { type: 'read', side: 'left' },
        { type: 'heal' },
        { type: 'read', side: 'right' },
      ]
    case 'consistency':
      return [
        { type: 'write', side: 'left', value: 'v1' },
        { type: 'read', side: 'right' },
        { type: 'partition' },
        { type: 'write', side: 'left', value: 'v2' },
        { type: 'read', side: 'left' },
        { type: 'read', side: 'right' },
        { type: 'set-mode', mode: 'ap' },
        { type: 'write', side: 'right', value: 'v9' },
        { type: 'read', side: 'left' },
        { type: 'read', side: 'right' },
        { type: 'heal' },
        { type: 'read', side: 'left' },
      ]
    case 'availability':
      return [
        { type: 'write', side: 'left', value: 'v1' },
        { type: 'read', side: 'right' },
        { type: 'partition' },
        { type: 'write', side: 'left', value: 'v2' },
        { type: 'write', side: 'right', value: 'v3' },
        { type: 'read', side: 'right' },
        { type: 'set-mode', mode: 'ap' },
        { type: 'write', side: 'right', value: 'v3' },
        { type: 'read', side: 'right' },
        { type: 'read', side: 'left' },
        { type: 'heal' },
      ]
    case 'partition':
      return [
        { type: 'write', side: 'left', value: 'v1' },
        { type: 'partition' },
        { type: 'write', side: 'left', value: 'v2' },
        { type: 'write', side: 'right', value: 'v3' },
        { type: 'set-mode', mode: 'ap' },
        { type: 'write', side: 'right', value: 'v3' },
        { type: 'write', side: 'left', value: 'v4' },
        { type: 'heal' },
        { type: 'read', side: 'left' },
        { type: 'read', side: 'right' },
      ]
    default: {
      const _exhaustive: never = algo
      return _exhaustive
    }
  }
}

export function createCapState(defaults: CapSimDefaults): CapSimState {
  const algo = defaults.algo
  const startMode = defaults.mode ?? 'cp'
  const script = buildCapScript(algo)
  const maxArrivals = Math.min(
    defaults.maxArrivals ?? DEFAULT_CAP_MAX_ARRIVALS,
    script.length,
  )
  const replicas = withAcceptingFlags(
    buildReplicas(defaults.replicaCount ?? 3),
    false,
    startMode,
  )

  return {
    algo,
    mode: startMode,
    replicas,
    clients: buildClients(),
    partitioned: false,
    writeClock: 0,
    lastWriteValue: INITIAL_VALUE,
    flight: null,
    tick: 0,
    nextOpIndex: 0,
    arrivalsCount: 0,
    maxArrivals,
    finished: false,
    script,
    okCount: 0,
    refuseCount: 0,
    caption: captionForIdle(algo, startMode, false),
    sacrificed: sacrificedFor(false, startMode),
  }
}

export function captionForIdle(
  algo: CapAlgo,
  mode: CapMode,
  partitioned: boolean,
): string {
  if (!partitioned) {
    return 'Network healthy: servers can sync. Press Play or Step.'
  }
  if (mode === 'cp') {
    return algo === 'availability'
      ? 'Network broken. Prefer Consistency: Zone A answers; Zone B returns errors to protect one shared value.'
      : 'Network broken. Prefer Consistency: Zone A can update; Zone B refuses. Availability is paused on Zone B.'
  }
  return algo === 'consistency'
    ? 'Network broken. Prefer Availability: both zones answer; stored values may disagree. Consistency is paused.'
    : 'Network broken. Prefer Availability: both zones keep answering. Consistency may wait until heal.'
}
