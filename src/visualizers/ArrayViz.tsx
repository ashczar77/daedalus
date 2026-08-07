import type { ArrayScene } from '../engine/types'
import './ArrayViz.css'

type Props = {
  scene: ArrayScene
}

/**
 * Renders an array as cells with optional highlight roles and named pointers.
 * Highlight roles (current, found, window, …) come from the step's scene data.
 */
export function ArrayViz({ scene }: Props) {
  // Index → role lookup so each cell can pick the right CSS state in O(1).
  const highlightMap = new Map(
    (scene.highlights ?? []).map((highlight) => [highlight.index, highlight.role]),
  )
  const pointerEntries = Object.entries(scene.pointers ?? {})

  return (
    <div className="array-viz">
      {scene.label ? <p className="array-viz__label">{scene.label}</p> : null}
      <div className="array-viz__row" role="list">
        {scene.values.map((value, index) => {
          const role = highlightMap.get(index)
          return (
            <div
              key={`${index}-${value}`}
              className={`array-viz__cell${role ? ` is-${role}` : ''}`}
              role="listitem"
            >
              <span className="array-viz__value">{String(value)}</span>
              <span className="array-viz__index">{index}</span>
            </div>
          )
        })}
      </div>
      {pointerEntries.length > 0 ? (
        <div className="array-viz__pointers">
          {pointerEntries.map(([name, index]) => (
            <span key={name} className="array-viz__pointer">
              <strong>{name}</strong> → {index}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
