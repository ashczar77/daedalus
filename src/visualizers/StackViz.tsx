import type { StackScene } from '../engine/types'
import './StackViz.css'

type Props = {
  scene: StackScene
}

/**
 * Vertical stack visualizer (bottom at the floor, top nearest the label).
 * Used for parentheses matching and RPN evaluation.
 */
export function StackViz({ scene }: Props) {
  const items = scene.items
  const action = scene.topAction

  return (
    <div className="stack-viz">
      {scene.label ? <p className="stack-viz__label">{scene.label}</p> : null}
      <div className="stack-viz__frame" aria-label="stack from bottom to top">
        {items.length === 0 ? (
          <p className="stack-viz__empty">empty</p>
        ) : (
          [...items].reverse().map((item, reversedIndex) => {
            const indexFromBottom = items.length - 1 - reversedIndex
            const isTop = indexFromBottom === items.length - 1
            return (
              <div
                key={`${indexFromBottom}-${String(item)}`}
                className={`stack-viz__item${isTop && action ? ` is-${action}` : ''}`}
              >
                <span className="stack-viz__value">{String(item)}</span>
                {isTop ? (
                  <span className="stack-viz__top-tag">
                    {action === 'push' ? 'add' : action === 'pop' ? 'remove' : 'top'}
                  </span>
                ) : null}
              </div>
            )
          })
        )}
      </div>
      {action ? (
        <p className={`stack-viz__action is-${action}`}>
          {action === 'push'
            ? 'ADD · push onto top'
            : action === 'pop'
              ? 'REMOVE · pop from top'
              : `last action: ${action}`}
        </p>
      ) : null}
    </div>
  )
}
