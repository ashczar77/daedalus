import type { HashMapScene } from '../engine/types'
import './HashMapViz.css'

type Props = {
  scene: HashMapScene
}

export function HashMapViz({ scene }: Props) {
  const focus = new Set((scene.focusKeys ?? []).map(String))

  return (
    <div className="hash-viz">
      {scene.label ? <p className="hash-viz__label">{scene.label}</p> : null}
      {scene.entries.length === 0 ? (
        <p className="hash-viz__empty">empty</p>
      ) : (
        <div className="hash-viz__grid" role="list">
          {scene.entries.map(([key, value]) => {
            const focused = focus.has(String(key))
            return (
              <div
                key={String(key)}
                className={`hash-viz__entry${focused ? ' is-focus' : ''}`}
                role="listitem"
              >
                <span className="hash-viz__key">{String(key)}</span>
                <span className="hash-viz__arrow">→</span>
                <span className="hash-viz__val">{formatValue(value)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return String(value)
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
