import type { HeapScene } from '../engine/types'
import './HeapViz.css'

type Props = {
  scene: HeapScene
}

const NODE_R = 18
const Y_GAP = 58
const X_UNIT = 46
const PAD = 22

type LaidOut = { index: number; x: number; y: number }

/**
 * Layout a complete binary heap as a tree from array indices.
 * Level L has 2^L slots; each node centers over its leaf span.
 */
function layoutHeap(n: number): LaidOut[] {
  if (n === 0) return []
  const maxLevel = Math.floor(Math.log2(n))
  const leafSlots = 1 << maxLevel
  const out: LaidOut[] = []
  for (let i = 0; i < n; i++) {
    const level = Math.floor(Math.log2(i + 1))
    const levelCount = 1 << level
    const indexInLevel = i - ((1 << level) - 1)
    const span = leafSlots / levelCount
    out.push({
      index: i,
      x: (indexInLevel + 0.5) * span * X_UNIT,
      y: level * Y_GAP,
    })
  }
  return out
}

/**
 * Binary-heap visualizer (complete tree from array order).
 * Root is peek(); used for PriorityQueue top-k walks.
 */
export function HeapViz({ scene }: Props) {
  const items = scene.items
  const order = scene.order ?? 'min'
  const action = scene.rootAction
  const laidOut = layoutHeap(items.length)
  const byIndex = new Map(laidOut.map((node) => [node.index, node]))

  if (items.length === 0) {
    return (
      <div className="heap-viz">
        {scene.label ? <p className="heap-viz__label">{scene.label}</p> : null}
        <p className="heap-viz__empty">empty</p>
        {scene.capacity != null ? (
          <p className="heap-viz__meta">size 0 / {scene.capacity}</p>
        ) : null}
      </div>
    )
  }

  const xs = laidOut.map((n) => n.x)
  const ys = laidOut.map((n) => n.y)
  const minX = Math.min(...xs) - NODE_R - PAD
  const maxX = Math.max(...xs) + NODE_R + PAD
  const minY = Math.min(...ys) - NODE_R - PAD - 10
  const maxY = Math.max(...ys) + NODE_R + PAD
  const width = maxX - minX
  const height = maxY - minY

  const edges: Array<{ key: string; x1: number; y1: number; x2: number; y2: number }> = []
  for (let i = 0; i < items.length; i++) {
    const parent = byIndex.get(i)!
    for (const childIndex of [2 * i + 1, 2 * i + 2]) {
      const child = byIndex.get(childIndex)
      if (!child) continue
      edges.push({
        key: `${i}->${childIndex}`,
        x1: parent.x,
        y1: parent.y + NODE_R - 2,
        x2: child.x,
        y2: child.y - NODE_R + 2,
      })
    }
  }

  return (
    <div className="heap-viz">
      {scene.label ? <p className="heap-viz__label">{scene.label}</p> : null}
      <div className="heap-viz__frame">
        <svg
          className="heap-viz__svg"
          viewBox={`${minX} ${minY} ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label={`${order}-heap`}
        >
          {edges.map((edge) => (
            <line
              key={edge.key}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              className="heap-viz__edge"
            />
          ))}
          {laidOut.map((node) => {
            const isRoot = node.index === 0
            const isFocus = scene.focusIndex === node.index
            const classes = ['heap-viz__node']
            if (isFocus && action === 'offer') classes.push('is-offer')
            else if (isRoot && action === 'poll') classes.push('is-poll')
            else if (isRoot && action === 'peek') classes.push('is-peek')
            else if (isFocus || (isRoot && action)) classes.push('is-focus')

            return (
              <g key={node.index} transform={`translate(${node.x}, ${node.y})`}>
                {isRoot ? (
                  <text className="heap-viz__root-tag" textAnchor="middle" y={-NODE_R - 6}>
                    {order === 'min' ? 'min' : 'max'}
                  </text>
                ) : null}
                <circle r={NODE_R} className={classes.join(' ')} />
                <text className="heap-viz__value" textAnchor="middle" dy="0.35em">
                  {String(items[node.index])}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="heap-viz__meta">
        size {items.length}
        {scene.capacity != null ? ` / ${scene.capacity}` : ''} · {order}-heap
      </p>
      {action ? <p className="heap-viz__action">last action: {action}</p> : null}
      {scene.caption ? <p className="heap-viz__caption">{scene.caption}</p> : null}
    </div>
  )
}
