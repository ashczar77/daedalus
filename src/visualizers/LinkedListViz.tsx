import { useId } from 'react'
import type { LinkedListScene } from '../engine/types'
import './LinkedListViz.css'

type Props = {
  scene: LinkedListScene
}

const NODE_W = 56
const NODE_H = 44
const GAP = 36
const PAD_X = 20
const PAD_Y = 36
const POINTER_H = 22

/**
 * Linked-list visualizer with stable node slots and SVG next-pointers.
 * Nodes keep declaration order so reverse/cycle steps animate edges, not chaos.
 */
export function LinkedListViz({ scene }: Props) {
  const markerId = useId().replace(/:/g, '')
  const focus = new Set(scene.focusIds ?? [])
  const nodes = scene.nodes
  const indexById = new Map(nodes.map((node, index) => [node.id, index]))

  if (nodes.length === 0) {
    return (
      <div className="ll-viz">
        {scene.label ? <p className="ll-viz__label">{scene.label}</p> : null}
        <p className="ll-viz__empty">empty</p>
      </div>
    )
  }

  const width = PAD_X * 2 + nodes.length * NODE_W + Math.max(0, nodes.length - 1) * GAP + 28
  const height = PAD_Y * 2 + POINTER_H + NODE_H + (scene.cycleTo ? 36 : 8)

  const centerOf = (index: number) => ({
    x: PAD_X + index * (NODE_W + GAP) + NODE_W / 2,
    y: PAD_Y + POINTER_H + NODE_H / 2,
  })

  const edges: Array<{ key: string; x1: number; y1: number; x2: number; y2: number }> = []
  for (const node of nodes) {
    if (!node.next) continue
    const from = indexById.get(node.id)
    const to = indexById.get(node.next)
    if (from == null || to == null) continue
    const a = centerOf(from)
    const b = centerOf(to)
    const dir = Math.sign(b.x - a.x) || 1
    edges.push({
      key: `${node.id}->${node.next}`,
      x1: a.x + dir * (NODE_W / 2 - 2),
      y1: a.y,
      x2: b.x - dir * (NODE_W / 2 - 2),
      y2: b.y,
    })
  }

  let cyclePath: string | null = null
  if (scene.cycleTo) {
    const [fromId, toId] = scene.cycleTo
    const from = indexById.get(fromId)
    const to = indexById.get(toId)
    if (from != null && to != null) {
      const a = centerOf(from)
      const b = centerOf(to)
      const midY = a.y + NODE_H / 2 + 22
      cyclePath = `M ${a.x} ${a.y + NODE_H / 2 - 2} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y + NODE_H / 2 - 2}`
    }
  }

  return (
    <div className="ll-viz">
      {scene.label ? <p className="ll-viz__label">{scene.label}</p> : null}
      <div className="ll-viz__scroller">
        <svg
          className="ll-viz__svg"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label="linked list"
        >
          <defs>
            <marker
              id={`ll-arrow-${markerId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="ll-viz__marker" />
            </marker>
          </defs>

          {edges.map((edge) => (
            <line
              key={edge.key}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              className="ll-viz__edge"
              markerEnd={`url(#ll-arrow-${markerId})`}
            />
          ))}

          {cyclePath ? (
            <path
              d={cyclePath}
              className="ll-viz__cycle-edge"
              markerEnd={`url(#ll-arrow-${markerId})`}
            />
          ) : null}

          {nodes.map((node, index) => {
            const { x, y } = centerOf(index)
            const pointersHere = Object.entries(scene.pointers ?? {})
              .filter(([, target]) => target === node.id)
              .map(([name]) => name)

            return (
              <g key={node.id} transform={`translate(${x}, ${y})`}>
                {pointersHere.map((name, ptrIndex) => (
                  <text
                    key={name}
                    className="ll-viz__ptr"
                    textAnchor="middle"
                    y={-NODE_H / 2 - 10 - ptrIndex * 12}
                  >
                    {name}
                  </text>
                ))}
                <rect
                  x={-NODE_W / 2}
                  y={-NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx={8}
                  className={`ll-viz__node${focus.has(node.id) ? ' is-focus' : ''}`}
                />
                <text className="ll-viz__value" textAnchor="middle" dy="0.1em">
                  {String(node.value)}
                </text>
                <text className="ll-viz__id" textAnchor="middle" y={NODE_H / 2 - 8}>
                  {node.id}
                </text>
                {node.next == null && !scene.cycleTo?.includes(node.id) ? (
                  <text className="ll-viz__null" x={NODE_W / 2 + 14} dy="0.35em">
                    ∅
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      </div>
      {scene.caption ? <p className="ll-viz__caption">{scene.caption}</p> : null}
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
