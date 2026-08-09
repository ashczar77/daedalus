import type { QueueScene } from '../engine/types'
import './QueueViz.css'

type Props = {
  scene: QueueScene
}

/**
 * Horizontal queue visualizer (front on the left, back on the right).
 * Used for Tree BFS level-order demos.
 */
export function QueueViz({ scene }: Props) {
  const items = scene.items
  const action = scene.frontAction

  return (
    <div className="queue-viz">
      {scene.label ? <p className="queue-viz__label">{scene.label}</p> : null}
      <div className="queue-viz__rail" aria-label="queue from front to back">
        <span className="queue-viz__end">front</span>
        <div className="queue-viz__frame">
          {items.length === 0 ? (
            <p className="queue-viz__empty">empty</p>
          ) : (
            items.map((item, index) => {
              const isFront = index === 0
              const isBack = index === items.length - 1
              const active =
                (action === 'poll' || action === 'peek') && isFront
                  ? action
                  : action === 'offer' && isBack
                    ? 'offer'
                    : null
              return (
                <div
                  key={`${index}-${String(item)}`}
                  className={`queue-viz__item${active ? ` is-${active}` : ''}`}
                >
                  <span className="queue-viz__value">{String(item)}</span>
                  {isFront ? <span className="queue-viz__tag">F</span> : null}
                  {isBack && items.length > 1 ? (
                    <span className="queue-viz__tag is-back">B</span>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
        <span className="queue-viz__end">back</span>
      </div>
      {action ? (
        <p className="queue-viz__action">last action: {action}</p>
      ) : null}
    </div>
  )
}
