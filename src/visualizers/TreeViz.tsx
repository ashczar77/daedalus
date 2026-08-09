import type { TreeScene, TreeVizState } from '../engine/types'
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

const NODE_R = 20
const X_GAP = 78
const Y_GAP = 86
const PAD = 40
const NULL_OFFSET_X = 36
const NULL_OFFSET_Y = 52

/** Tight chip width for Space Mono labels (approx. 0.62em + horizontal pad). */
function chipWidth(text: string, fontPx: number, min = 28): number {
  return Math.max(min, Math.ceil(text.length * fontPx * 0.62) + 10)
}

function FormulaChip({ x, y, text }: { x: number; y: number; text: string }) {
  const w = chipWidth(text, 10, 40)
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-w / 2}
        y={-7.5}
        width={w}
        height={15}
        rx={3}
        className="tree-viz__formula-bg"
      />
      <text className="tree-viz__formula" textAnchor="middle" dy="0.35em">
        {text}
      </text>
    </g>
  )
}

/**
 * Binary-tree visualizer with inorder layout.
 * Optional viz overlays show returned depths, null→0, and 1+max formulas.
 */
export function TreeViz({ scene }: Props) {
  const focus = new Set(scene.focusIds ?? [])
  const byId = new Map(scene.nodes.map((node) => [node.id, node]))
  const positioned = layoutTree(scene.rootId, byId)
  const viz: TreeVizState = scene.viz ?? {}

  if (scene.rootId == null || positioned.length === 0) {
    return (
      <div className="tree-viz">
        {scene.label ? <p className="tree-viz__label">{scene.label}</p> : null}
        <p className="tree-viz__empty">null → 0</p>
      </div>
    )
  }

  const posById = new Map(positioned.map((node) => [node.id, node]))
  const edges: Array<{ from: Positioned; to: Positioned; side: 'L' | 'R' }> = []
  for (const node of scene.nodes) {
    const from = posById.get(node.id)
    if (!from) continue
    if (node.left) {
      const to = posById.get(node.left)
      if (to) edges.push({ from, to, side: 'L' })
    }
    if (node.right) {
      const to = posById.get(node.right)
      if (to) edges.push({ from, to, side: 'R' })
    }
  }

  // Force a remount when pointers change so swaps can't look like a no-op paint.
  const structureKey = scene.nodes
    .map((node) => `${node.id}:${node.left ?? ''}:${node.right ?? ''}`)
    .join('|')

  const nullGhost = placeNullCall(viz.nullCall, posById)
  const formula = viz.formula
    ? {
        ...viz.formula,
        at: posById.get(viz.formula.nodeId),
      }
    : null

  const xs = [
    ...positioned.map((node) => node.x),
    ...(nullGhost ? [nullGhost.x] : []),
    ...(formula?.at ? [formula.at.x + 70] : []),
  ]
  const ys = [
    ...positioned.map((node) => node.y),
    ...(nullGhost ? [nullGhost.y] : []),
    ...(formula?.at ? [formula.at.y - 28] : []),
  ]
  const minX = Math.min(...xs) - PAD
  const maxX = Math.max(...xs) + PAD
  const minY = Math.min(...ys) - PAD
  const maxY = Math.max(...ys) + PAD + 12
  const width = Math.max(maxX - minX, PAD * 2)
  const height = Math.max(maxY - minY, PAD * 2)

  return (
    <div className="tree-viz" data-structure={structureKey}>
      {scene.label ? <p className="tree-viz__label">{scene.label}</p> : null}
      <div className="tree-viz__frame">
        <svg
          key={structureKey}
          className="tree-viz__svg"
          viewBox={`${minX} ${minY} ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="binary tree"
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          {edges.map(({ from, to, side }) => {
            const x1 = from.x
            const y1 = from.y + NODE_R * 0.55
            const x2 = to.x
            const y2 = to.y - NODE_R * 0.55
            const mx = (x1 + x2) / 2
            const my = (y1 + y2) / 2
            return (
              <g key={`${from.id}-${side}-${to.id}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} className="tree-viz__edge" />
                <text
                  x={mx}
                  y={my}
                  className={`tree-viz__edge-side is-${side === 'L' ? 'left' : 'right'}`}
                  textAnchor="middle"
                  dy="0.35em"
                >
                  {side}
                </text>
              </g>
            )
          })}

          {nullGhost ? (
            <g transform={`translate(${nullGhost.x}, ${nullGhost.y})`}>
              <line
                x1={nullGhost.fromX - nullGhost.x}
                y1={nullGhost.fromY - nullGhost.y}
                x2={0}
                y2={-NODE_R * 0.4}
                className="tree-viz__edge tree-viz__edge--null"
              />
              <circle r={NODE_R * 0.85} className="tree-viz__null" />
              <text className="tree-viz__null-text" textAnchor="middle" dy="0.35em">
                ∅
              </text>
              <text
                className="tree-viz__null-return"
                textAnchor="middle"
                y={NODE_R + 14}
              >
                {nullGhost.text}
              </text>
            </g>
          ) : null}

          {positioned.map((node) => {
            const mark =
              viz.marks?.[node.id] ??
              (viz.depths?.[node.id] != null ? `d=${viz.depths[node.id]}` : undefined)
            const focused = focus.has(node.id)
            const markW = mark != null ? chipWidth(mark, 9) : 0
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r={NODE_R}
                  className={`tree-viz__node${focused ? ' is-focus' : ''}${
                    mark != null ? ' has-depth' : ''
                  }`}
                />
                <text className="tree-viz__value" textAnchor="middle" dy="0.35em">
                  {String(node.value)}
                </text>
                {mark != null ? (
                  <g className="tree-viz__depth" transform={`translate(0, ${NODE_R + 12})`}>
                    <rect
                      x={-markW / 2}
                      y={-6.5}
                      width={markW}
                      height={13}
                      rx={3}
                      className="tree-viz__depth-bg"
                    />
                    <text textAnchor="middle" dy="0.35em" className="tree-viz__depth-text">
                      {mark}
                    </text>
                  </g>
                ) : null}
              </g>
            )
          })}

          {formula?.at ? (
            <FormulaChip x={formula.at.x} y={formula.at.y - NODE_R - 16} text={formula.text} />
          ) : null}
        </svg>
      </div>
    </div>
  )
}

function placeNullCall(
  nullCall: TreeVizState['nullCall'],
  posById: Map<string, Positioned>,
): {
  x: number
  y: number
  fromX: number
  fromY: number
  text: string
} | null {
  if (!nullCall) return null
  const parent = posById.get(nullCall.parentId)
  if (!parent) return null
  const dir = nullCall.side === 'left' ? -1 : 1
  return {
    x: parent.x + dir * NULL_OFFSET_X,
    y: parent.y + NULL_OFFSET_Y,
    fromX: parent.x,
    fromY: parent.y + NODE_R * 0.55,
    text: nullCall.text,
  }
}

function layoutTree(
  rootId: string | null,
  byId: Map<string, TreeScene['nodes'][number]>,
): Positioned[] {
  if (!rootId || !byId.has(rootId)) return []

  const positioned: Positioned[] = []
  let column = 0

  function walk(id: string | null, depth: number) {
    if (!id) return
    const node = byId.get(id)
    if (!node) return

    walk(node.left, depth + 1)
    positioned.push({
      id,
      value: node.value,
      x: column * X_GAP,
      y: depth * Y_GAP,
    })
    column += 1
    walk(node.right, depth + 1)
  }

  walk(rootId, 0)
  return positioned
}
