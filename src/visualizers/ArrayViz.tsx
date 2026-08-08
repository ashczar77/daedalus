import type { ArrayScene } from '../engine/types'
import { ArrayBarsViz } from './ArrayBarsViz'
import './ArrayViz.css'

type Props = {
  scene: ArrayScene
}

/** Stable color bucket for common pointer names (left/right/mid/i…). */
function pointerTone(name: string): string {
  const key = name.toLowerCase()
  if (key === 'left' || key === 'lo' || key === 'l') return 'left'
  if (key === 'right' || key === 'hi' || key === 'r') return 'right'
  if (key === 'mid' || key === 'm') return 'mid'
  if (key === 'i' || key === 'j' || key === 'k') return key
  return 'default'
}

/**
 * Renders an array as cells with optional highlight roles and named pointers.
 * Pointers appear as colored badges on the cells they index (not only a legend).
 * Use `display: 'bars'` for histogram + water overlays (container problems).
 */
export function ArrayViz({ scene }: Props) {
  if (scene.display === 'bars') {
    return <ArrayBarsViz scene={scene} />
  }

  // Index → role lookup so each cell can pick the right CSS state in O(1).
  const highlightMap = new Map(
    (scene.highlights ?? []).map((highlight) => [highlight.index, highlight.role]),
  )
  const pointerEntries = Object.entries(scene.pointers ?? {})

  // Index → pointer names sitting on that cell (left & right may share an index).
  const pointersByIndex = new Map<number, string[]>()
  for (const [name, index] of pointerEntries) {
    const list = pointersByIndex.get(index) ?? []
    list.push(name)
    pointersByIndex.set(index, list)
  }

  return (
    <div className="array-viz">
      {scene.label ? <p className="array-viz__label">{scene.label}</p> : null}
      <div className="array-viz__row" role="list">
        {scene.values.map((value, index) => {
          const role = highlightMap.get(index)
          const ptrs = pointersByIndex.get(index) ?? []
          const tones = [...new Set(ptrs.map(pointerTone))]
          const cellClass = [
            'array-viz__cell',
            role ? `is-${role}` : '',
            tones.length > 0 ? 'has-ptr' : '',
            ...tones.map((tone) => `has-ptr--${tone}`),
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div key={`${index}-${value}`} className={cellClass} role="listitem">
              {ptrs.length > 0 ? (
                <div className="array-viz__ptr-stack" aria-hidden="true">
                  {ptrs.map((name) => (
                    <span
                      key={name}
                      className={`array-viz__ptr-badge is-${pointerTone(name)}`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              ) : null}
              <span className="array-viz__value">{String(value)}</span>
              <span className="array-viz__index">{index}</span>
            </div>
          )
        })}
      </div>
      {pointerEntries.length > 0 ? (
        <div className="array-viz__pointers">
          {pointerEntries.map(([name, index]) => (
            <span
              key={name}
              className={`array-viz__pointer is-${pointerTone(name)}`}
            >
              <strong>{name}</strong> → {index}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
