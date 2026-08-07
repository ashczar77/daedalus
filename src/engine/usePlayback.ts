import { useCallback, useEffect, useRef, useState } from 'react'
import type { Step } from './types'

const SPEEDS = [0.5, 1, 1.5, 2] as const
export type PlaybackSpeed = (typeof SPEEDS)[number]

type Options = {
  steps: Step[]
  /** Base delay between auto-play steps at 1x, in ms */
  baseDelayMs?: number
}

export function usePlayback({ steps, baseDelayMs = 900 }: Options) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const timerRef = useRef<number | null>(null)

  const maxIndex = Math.max(0, steps.length - 1)
  const step = steps[index] ?? null
  const atStart = index <= 0
  const atEnd = index >= maxIndex

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const pause = useCallback(() => {
    setPlaying(false)
    clearTimer()
  }, [clearTimer])

  const play = useCallback(() => {
    if (steps.length === 0) return
    if (index >= maxIndex) {
      setIndex(0)
    }
    setPlaying(true)
  }, [index, maxIndex, steps.length])

  const toggle = useCallback(() => {
    if (playing) pause()
    else play()
  }, [pause, play, playing])

  const stepForward = useCallback(() => {
    setIndex((i) => Math.min(maxIndex, i + 1))
  }, [maxIndex])

  const stepBack = useCallback(() => {
    pause()
    setIndex((i) => Math.max(0, i - 1))
  }, [pause])

  const scrub = useCallback(
    (next: number) => {
      pause()
      setIndex(Math.max(0, Math.min(maxIndex, next)))
    },
    [maxIndex, pause],
  )

  const reset = useCallback(() => {
    pause()
    setIndex(0)
  }, [pause])

  const cycleSpeed = useCallback(() => {
    setSpeed((current) => {
      const idx = SPEEDS.indexOf(current)
      return SPEEDS[(idx + 1) % SPEEDS.length]!
    })
  }, [])

  useEffect(() => {
    setIndex(0)
    setPlaying(false)
    clearTimer()
  }, [steps, clearTimer])

  useEffect(() => {
    clearTimer()
    if (!playing) return
    if (index >= maxIndex) {
      setPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setIndex((i) => Math.min(maxIndex, i + 1))
    }, baseDelayMs / speed)

    return clearTimer
  }, [playing, index, maxIndex, speed, baseDelayMs, clearTimer])

  return {
    index,
    step,
    playing,
    speed,
    atStart,
    atEnd,
    total: steps.length,
    play,
    pause,
    toggle,
    stepForward,
    stepBack,
    scrub,
    reset,
    cycleSpeed,
  }
}
