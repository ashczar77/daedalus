import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { NetworkSimDefaults } from '../../types'
import { createNetworkState } from './createState'
import {
  completeNetworkFlight,
  idleNetworkTick,
  spawnNetworkOp,
} from './stepSim'
import type { NetworkFlight, NetworkSimState } from './types'

type Action =
  | { type: 'reset'; defaults: NetworkSimDefaults }
  | { type: 'spawn' }
  | { type: 'complete-flight' }
  | { type: 'idle' }

function reducer(state: NetworkSimState, action: Action): NetworkSimState {
  switch (action.type) {
    case 'reset':
      return createNetworkState(action.defaults)
    case 'spawn':
      return spawnNetworkOp(state)
    case 'complete-flight':
      return completeNetworkFlight(state)
    case 'idle':
      return idleNetworkTick(state)
    default:
      return state
  }
}

const SPEEDS = [0.5, 1, 2, 4] as const

export function networkTravelMsForSpeed(
  speed: number,
  kind?: NetworkFlight['kind'] | null,
): number {
  const units =
    kind === 'info' || kind === 'token' || kind === 'breaker' ? 1.6 : 2.2
  return Math.max(800, Math.round((1000 * units) / speed))
}

function gapMsForSpeed(speed: number): number {
  return Math.max(350, Math.round(650 / speed))
}

/** One-op-at-a-time networking sim with travel animations. */
export function useNetworkSim(defaults: NetworkSimDefaults) {
  const [state, dispatch] = useReducer(reducer, defaults, createNetworkState)
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
      }, networkTravelMsForSpeed(speed, state.flight.kind))
      return () => window.clearTimeout(id)
    }

    if (state.arrivalsCount < state.maxArrivals) {
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
    if (state.arrivalsCount < state.maxArrivals) {
      const preview = spawnNetworkOp(state)
      dispatch({ type: 'spawn' })
      stepTimerRef.current = window.setTimeout(() => {
        dispatch({ type: 'complete-flight' })
        stepTimerRef.current = null
      }, networkTravelMsForSpeed(speed, preview.flight?.kind))
      return
    }
    dispatch({ type: 'idle' })
  }, [state, speed])

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
    travelMs: networkTravelMsForSpeed(speed, state.flight?.kind),
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
