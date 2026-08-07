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
  const edges: Array<{ from: Positioned; to: Positioned }> = []
  for (const node of scene.nodes) {
    const from = posById.get(node.id)
    if (!from) continue
    for (const childId of [node.left, node.right]) {
      if (!childId) continue
      const to = posById.get(childId)
      if (to) edges.push({ from, to })
    }
  }

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
    <div className="tree-viz">
      {scene.label ? <p className="tree-viz__label">{scene.label}</p> : null}
      <div className="tree-viz__frame">
        <svg
          className="tree-viz__svg"
          viewBox={`${minX} ${minY} ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="binary tree"
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          {edges.map(({ from, to }) => (
            <line
              key={`${from.id}-${to.id}`}
              x1={from.x}
              y1={from.y + NODE_R * 0.55}
              x2={to.x}
              y2={to.y - NODE_R * 0.55}
              className="tree-viz__edge"
            />
          ))}

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
                  <g className="tree-viz__depth" transform={`translate(0, ${NODE_R + 14})`}>
                    <rect
                      x={-Math.max(16, mark.length * 4.2)}
                      y={-9}
                      width={Math.max(32, mark.length * 8.4)}
                      height={16}
                      rx={4}
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
            <g
              transform={`translate(${formula.at.x}, ${formula.at.y - NODE_R - 18})`}
            >
              <rect
                x={-72}
                y={-12}
                width={144}
                height={22}
                rx={6}
                className="tree-viz__formula-bg"
              />
              <text className="tree-viz__formula" textAnchor="middle" dy="0.35em">
                {formula.text}
              </text>
            </g>
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
