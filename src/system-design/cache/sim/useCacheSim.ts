import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { CacheSimDefaults } from '../../types'
import { createCacheState } from './createState'
import {
  completeCacheFlight,
  idleCacheTick,
  spawnCacheOp,
} from './stepSim'
import type { CacheFlight, CacheSimState } from './types'

type Action =
  | { type: 'reset'; defaults: CacheSimDefaults }
  | { type: 'spawn' }
  | { type: 'complete-flight' }
  | { type: 'idle' }

function reducer(state: CacheSimState, action: Action): CacheSimState {
  switch (action.type) {
    case 'reset':
      return createCacheState(action.defaults)
    case 'spawn':
      return spawnCacheOp(state)
    case 'complete-flight':
      return completeCacheFlight(state)
    case 'idle':
      return idleCacheTick(state)
    default:
      return state
  }
}

const SPEEDS = [0.5, 1, 2, 4] as const

export function cacheTravelMsForSpeed(
  speed: number,
  pathKind?: CacheFlight['pathKind'] | null,
): number {
  // Scale duration by story beats so multi-hop misses stay readable.
  const units = travelUnitsForPath(pathKind)
  return Math.max(900, Math.round((1100 * units) / speed))
}

function travelUnitsForPath(
  pathKind: CacheFlight['pathKind'] | null | undefined,
): number {
  switch (pathKind) {
    case 'read-through-miss':
      return 6
    case 'aside-miss':
      return 5
    case 'aside-write':
      return 3
    case 'read-hit':
      return 2
    case 'write-through':
      return 5
    case 'write-behind':
      return 2
    case 'write-behind-flush':
      return 2
    default:
      return 4
  }
}

function gapMsForSpeed(speed: number): number {
  return Math.max(400, Math.round(700 / speed))
}

/** One-op-at-a-time cache sim with smooth travel animations. */
export function useCacheSim(defaults: CacheSimDefaults) {
  const [state, dispatch] = useReducer(reducer, defaults, createCacheState)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)
  const defaultsRef = useRef(defaults)
  defaultsRef.current = defaults

  useEffect(() => {
    dispatch({ type: 'reset', defaults })
    setPlaying(false)
  }, [defaults])

  useEffect(() => {
    if (state.finished && playing) setPlaying(false)
  }, [state.finished, playing])

  useEffect(() => {
    if (!playing || state.finished) return

    if (state.flight) {
      const id = window.setTimeout(() => {
        dispatch({ type: 'complete-flight' })
      }, cacheTravelMsForSpeed(speed, state.flight.pathKind))
      return () => window.clearTimeout(id)
    }

    if (
      state.arrivalsCount < state.maxArrivals ||
      (state.algo === 'write-behind' && state.pendingWrites.length > 0)
    ) {
      const id = window.setTimeout(() => {
        dispatch({ type: 'spawn' })
      }, gapMsForSpeed(speed))
      return () => window.clearTimeout(id)
    }

    const id = window.setTimeout(() => {
      dispatch({ type: 'idle' })
    }, gapMsForSpeed(speed))
    return () => window.clearTimeout(id)
  }, [
    playing,
    speed,
    state.finished,
    state.flight,
    state.arrivalsCount,
    state.maxArrivals,
    state.pendingWrites.length,
    state.algo,
    state.tick,
  ])

  const reset = useCallback(() => {
    dispatch({ type: 'reset', defaults: defaultsRef.current })
    setPlaying(false)
  }, [])

  const stepTimerRef = useRef<number | null>(null)

  const stepOnce = useCallback(() => {
    setPlaying(false)
    if (stepTimerRef.current != null) {
      window.clearTimeout(stepTimerRef.current)
      stepTimerRef.current = null
    }
    if (state.flight) {
      dispatch({ type: 'complete-flight' })
      return
    }
    if (
      state.arrivalsCount < state.maxArrivals ||
      (state.algo === 'write-behind' && state.pendingWrites.length > 0)
    ) {
      const preview = spawnCacheOp(state)
      dispatch({ type: 'spawn' })
      stepTimerRef.current = window.setTimeout(() => {
        dispatch({ type: 'complete-flight' })
        stepTimerRef.current = null
      }, cacheTravelMsForSpeed(speed, preview.flight?.pathKind))
      return
    }
    dispatch({ type: 'idle' })
  }, [
    state,
    speed,
  ])

  const cycleSpeed = useCallback(() => {
    setSpeed((current) => {
      const index = SPEEDS.indexOf(current)
      return SPEEDS[(index + 1) % SPEEDS.length]!
    })
  }, [])

  return {
    state,
    playing,
    speed,
    travelMs: cacheTravelMsForSpeed(speed, state.flight?.pathKind),
    speeds: SPEEDS,
    toggle: () => {
      if (state.finished) {
        dispatch({ type: 'reset', defaults: defaultsRef.current })
        setPlaying(true)
        return
      }
      setPlaying((p) => !p)
    },
    setSpeed,
    cycleSpeed,
    reset,
    stepOnce,
  }
}
