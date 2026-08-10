import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { CapSimDefaults } from '../../types'
import { createCapState } from './createState'
import { completeCapFlight, idleCapTick, spawnCapOp } from './stepSim'
import type { CapFlight, CapSimState } from './types'

type Action =
  | { type: 'reset'; defaults: CapSimDefaults }
  | { type: 'spawn' }
  | { type: 'complete-flight' }
  | { type: 'idle' }

function reducer(state: CapSimState, action: Action): CapSimState {
  switch (action.type) {
    case 'reset':
      return createCapState(action.defaults)
    case 'spawn':
      return spawnCapOp(state)
    case 'complete-flight':
      return completeCapFlight(state)
    case 'idle':
      return idleCapTick(state)
    default:
      return state
  }
}

const SPEEDS = [0.5, 1, 2, 4] as const

export function capTravelMsForSpeed(
  speed: number,
  kind?: CapFlight['kind'] | null,
): number {
  const units = travelUnitsForKind(kind)
  return Math.max(900, Math.round((1100 * units) / speed))
}

function travelUnitsForKind(kind: CapFlight['kind'] | null | undefined): number {
  switch (kind) {
    case 'partition-cut':
    case 'heal':
    case 'mode-switch':
      return 2
    case 'write-ok':
      return 3
    case 'write-refuse':
    case 'read-refuse':
      return 2
    case 'read-ok':
      return 2
    default:
      return 2.5
  }
}

function gapMsForSpeed(speed: number): number {
  return Math.max(400, Math.round(700 / speed))
}

/** One-op-at-a-time CAP cluster sim with travel animations. */
export function useCapSim(defaults: CapSimDefaults) {
  const [state, dispatch] = useReducer(reducer, defaults, createCapState)
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
      }, capTravelMsForSpeed(speed, state.flight.kind))
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
      const preview = spawnCapOp(state)
      dispatch({ type: 'spawn' })
      stepTimerRef.current = window.setTimeout(() => {
        dispatch({ type: 'complete-flight' })
        stepTimerRef.current = null
      }, capTravelMsForSpeed(speed, preview.flight?.kind))
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
    travelMs: capTravelMsForSpeed(speed, state.flight?.kind),
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
