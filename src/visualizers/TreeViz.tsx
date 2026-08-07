import type { TreeScene } from '../engine/types'
import './TreeViz.css'

type Props = {
  scene: TreeScene
}

type Positioned = {
  id: string
  value: unknown
  x: number
  y: number
}

/**
 * Simple layered binary-tree layout with focus highlighting.
 * Good enough for interview-sized demos; positions are deterministic.
 */
export function TreeViz({ scene }: Props) {
  const focus = new Set(scene.focusIds ?? [])
  const byId = new Map(scene.nodes.map((node) => [node.id, node]))
  const positioned = layoutTree(scene.rootId, byId)
  const width = Math.max(320, ...positioned.map((node) => node.x + 40))
  const height = Math.max(160, ...positioned.map((node) => node.y + 60))

  const edges: Array<{ from: Positioned; to: Positioned }> = []
  for (const node of scene.nodes) {
    const from = positioned.find((entry) => entry.id === node.id)
    if (!from) continue
    for (const childId of [node.left, node.right]) {
      if (!childId) continue
      const to = positioned.find((entry) => entry.id === childId)
      if (to) edges.push({ from, to })
    }
  }

  return (
    <div className="tree-viz">
      {scene.label ? <p className="tree-viz__label">{scene.label}</p> : null}
      {scene.rootId == null ? (
        <p className="tree-viz__empty">null</p>
      ) : (
        <svg
          className="tree-viz__svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="binary tree"
        >
          {edges.map(({ from, to }) => (
            <line
              key={`${from.id}-${to.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="tree-viz__edge"
            />
          ))}
          {positioned.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle
                r={18}
                className={`tree-viz__node${focus.has(node.id) ? ' is-focus' : ''}`}
              />
              <text className="tree-viz__value" textAnchor="middle" dy="0.35em">
                {String(node.value)}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}

function layoutTree(
  rootId: string | null,
  byId: Map<string, TreeScene['nodes'][number]>,
): Positioned[] {
  if (!rootId || !byId.has(rootId)) return []

  const positioned: Positioned[] = []
  let nextX = 0

  function walk(id: string | null, depth: number): number | null {
    if (!id) return null
    const node = byId.get(id)
    if (!node) return null

    const leftX = walk(node.left, depth + 1)
    const myX = leftX == null && node.right == null ? nextX++ : null
    const rightX = walk(node.right, depth + 1)

    let x: number
    if (leftX != null && rightX != null) x = (leftX + rightX) / 2
    else if (leftX != null) x = leftX + 0.6
    else if (rightX != null) x = rightX - 0.6
    else x = myX ?? nextX++

    positioned.push({
      id,
      value: node.value,
      x: 40 + x * 70,
      y: 30 + depth * 70,
    })
    return x
  }

  walk(rootId, 0)
  return positioned
}
