import type { PlaybackSpeed } from '../engine/usePlayback'
import './PlayerControls.css'

type Props = {
  index: number
  total: number
  playing: boolean
  speed: PlaybackSpeed
  atStart: boolean
  atEnd: boolean
  /** One-line current beat shown in the control strip */
  beat?: string
  onToggle: () => void
  onBack: () => void
  onForward: () => void
  onReset: () => void
  onScrub: (index: number) => void
  onCycleSpeed: () => void
}

/**
 * Compact transport bar above the main body.
 * Beat line replaces the old large narrative card.
 */
export function PlayerControls({
  index,
  total,
  playing,
  speed,
  atStart,
  atEnd,
  beat,
  onToggle,
  onBack,
  onForward,
  onReset,
  onScrub,
  onCycleSpeed,
}: Props) {
  return (
    <div className="player">
      <div className="player__row">
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
          <span className="player__step">
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

      {beat ? <p className="player__beat">{beat}</p> : null}
    </div>
  )
}
