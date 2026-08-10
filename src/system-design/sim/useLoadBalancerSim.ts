import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { LoadBalancerSimDefaults } from '../types'
import { createSimState } from './createState'
import {
  addServer,
  completeFlight,
  idleTick,
  removeServer,
  setServerWeight,
  spawnRequest,
} from './stepSim'
import type { LoadBalancerSimState } from './types'

type Action =
  | { type: 'reset'; defaults: LoadBalancerSimDefaults }
  | { type: 'spawn' }
  | { type: 'complete-flight' }
  | { type: 'idle' }
  | { type: 'add-server' }
  | { type: 'remove-server' }
  | { type: 'set-weight'; serverId: string; weight: number }

function reducer(state: LoadBalancerSimState, action: Action): LoadBalancerSimState {
  switch (action.type) {
    case 'reset':
      return createSimState(action.defaults)
    case 'spawn':
      return spawnRequest(state)
    case 'complete-flight':
      return completeFlight(state)
    case 'idle':
      return idleTick(state)
    case 'add-server':
      return addServer(state)
    case 'remove-server':
      return removeServer(state)
    case 'set-weight':
      return setServerWeight(state, action.serverId, action.weight)
    default:
      return state
  }
}

const SPEEDS = [0.5, 1, 2, 4] as const

/** Smooth packet travel time at 1x (ms). */
export function travelMsForSpeed(speed: number): number {
  return Math.max(400, Math.round(1200 / speed))
}

/** Pause between one arrival finishing and the next spawn (ms). */
function gapMsForSpeed(speed: number): number {
  return Math.max(180, Math.round(350 / speed))
}

/**
 * One-request-at-a-time load balancer sim.
 * Spawns → waits for smooth travel animation → completes → short gap → repeat.
 */
export function useLoadBalancerSim(defaults: LoadBalancerSimDefaults) {
  const [state, dispatch] = useReducer(reducer, defaults, createSimState)
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

    // Packet is mid-flight: let the SVG animation run, then clear it.
    if (state.flight) {
      const id = window.setTimeout(() => {
        dispatch({ type: 'complete-flight' })
      }, travelMsForSpeed(speed))
      return () => window.clearTimeout(id)
    }

    // Ready for next arrival, or drain remaining connections after the burst.
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
    state.requests.length,
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
      dispatch({ type: 'spawn' })
      // Let the packet finish its smooth hop, then clear the flight.
      stepTimerRef.current = window.setTimeout(() => {
        dispatch({ type: 'complete-flight' })
        stepTimerRef.current = null
      }, travelMsForSpeed(speed))
      return
    }
    dispatch({ type: 'idle' })
  }, [state.flight, state.arrivalsCount, state.maxArrivals, speed])

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
    travelMs: travelMsForSpeed(speed),
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
    addServer: () => dispatch({ type: 'add-server' }),
    removeServer: () => dispatch({ type: 'remove-server' }),
    setWeight: (serverId: string, weight: number) =>
      dispatch({ type: 'set-weight', serverId, weight }),
  }
}
