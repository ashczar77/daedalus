import type { PlaybackSpeed } from '../engine/usePlayback'
import './PlayerControls.css'

type Props = {
  index: number
  total: number
  playing: boolean
  speed: PlaybackSpeed
  atStart: boolean
  atEnd: boolean
  onToggle: () => void
  onBack: () => void
  onForward: () => void
  onReset: () => void
  onScrub: (index: number) => void
  onCycleSpeed: () => void
}

export function PlayerControls({
  index,
  total,
  playing,
  speed,
  atStart,
  atEnd,
  onToggle,
  onBack,
  onForward,
  onReset,
  onScrub,
  onCycleSpeed,
}: Props) {
  return (
    <div className="player">
      <div className="player__buttons">
        <button type="button" onClick={onReset} disabled={atStart && !playing}>
          Reset
        </button>
        <button type="button" onClick={onBack} disabled={atStart}>
          Prev
        </button>
        <button type="button" className="player__primary" onClick={onToggle}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={onForward} disabled={atEnd}>
          Next
        </button>
        <button type="button" onClick={onCycleSpeed} aria-label="Cycle speed">
          {speed}x
        </button>
      </div>
      <label className="player__scrub">
        <span>
          Step {total === 0 ? 0 : index + 1} / {total}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          value={index}
          onChange={(event) => onScrub(Number(event.target.value))}
          disabled={total === 0}
        />
      </label>
    </div>
  )
}
