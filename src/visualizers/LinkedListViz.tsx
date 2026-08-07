import type { LinkedListScene } from '../engine/types'
import './LinkedListViz.css'

type Props = {
  scene: LinkedListScene
}

/**
 * Horizontal linked-list visualizer with named pointers and optional cycle edge.
 */
export function LinkedListViz({ scene }: Props) {
  const focus = new Set(scene.focusIds ?? [])
  const byId = new Map(scene.nodes.map((node) => [node.id, node]))

  // Walk from heads implied by pointers, else from nodes with no inbound next.
  const order = orderNodes(scene)

  return (
    <div className="ll-viz">
      {scene.label ? <p className="ll-viz__label">{scene.label}</p> : null}
      <div className="ll-viz__row">
        {order.map((id, index) => {
          const node = byId.get(id)
          if (!node) return null
          const pointersHere = Object.entries(scene.pointers ?? {})
            .filter(([, target]) => target === id)
            .map(([name]) => name)
          return (
            <div key={id} className="ll-viz__slot">
              {pointersHere.length > 0 ? (
                <div className="ll-viz__pointers">
                  {pointersHere.map((name) => (
                    <span key={name}>{name}</span>
                  ))}
                </div>
              ) : (
                <div className="ll-viz__pointers ll-viz__pointers--spacer" />
              )}
              <div
                className={`ll-viz__node${focus.has(id) ? ' is-focus' : ''}`}
              >
                <span className="ll-viz__value">{String(node.value)}</span>
                <span className="ll-viz__id">{node.id}</span>
              </div>
              {index < order.length - 1 ? (
                <span className="ll-viz__arrow" aria-hidden>
                  →
                </span>
              ) : node.next == null && !scene.cycleTo ? (
                <span className="ll-viz__null">∅</span>
              ) : null}
            </div>
          )
        })}
      </div>
      {scene.cycleTo ? (
        <p className="ll-viz__cycle">
          cycle: {scene.cycleTo[0]} → {scene.cycleTo[1]}
        </p>
      ) : null}
      {Object.entries(scene.pointers ?? {})
        .filter(([, target]) => target == null)
        .map(([name]) => (
          <p key={name} className="ll-viz__null-ptr">
            {name} → null
          </p>
        ))}
    </div>
  )
}

/** Prefer walking from the earliest pointer target; fall back to listed order. */
function orderNodes(scene: LinkedListScene): string[] {
  const ids = scene.nodes.map((node) => node.id)
  if (ids.length === 0) return []

  const start =
    Object.values(scene.pointers ?? {}).find(
      (target): target is string => typeof target === 'string',
    ) ?? ids[0]!

  const seen = new Set<string>()
  const order: string[] = []
  let cur: string | null = start
  while (cur && !seen.has(cur)) {
    seen.add(cur)
    order.push(cur)
    const node = scene.nodes.find((entry) => entry.id === cur)
    cur = node?.next ?? null
    // Break intentional cycles after one loop for layout.
    if (cur && seen.has(cur)) break
  }

  for (const id of ids) {
    if (!seen.has(id)) order.push(id)
  }
  return order
}
