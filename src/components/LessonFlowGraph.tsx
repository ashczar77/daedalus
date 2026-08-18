import type { DiagramNode, LessonDiagram } from '../languages/types'
import './LessonFlowGraph.css'

type Props = {
  diagram: LessonDiagram
}

type Point = { x: number; y: number }

function toneClass(tone: DiagramNode['tone']): string {
  return tone && tone !== 'default' ? `is-${tone}` : ''
}

function nodeCenter(
  node: DiagramNode,
  columns: number,
  rows: number,
): Point {
  const x = ((node.col - 0.5) / columns) * 100
  const y = ((node.row - 0.5) / rows) * 100
  return { x, y }
}

function edgePath(
  from: DiagramNode,
  to: DiagramNode,
  columns: number,
  rows: number,
): string {
  const a = nodeCenter(from, columns, rows)
  const b = nodeCenter(to, columns, rows)
  const dx = b.x - a.x
  const dy = b.y - a.y
  // Shorten so the arrowhead meets the node border, not the center.
  const len = Math.hypot(dx, dy) || 1
  const inset = 7
  const sx = a.x + (dx / len) * inset
  const sy = a.y + (dy / len) * inset
  const ex = b.x - (dx / len) * inset
  const ey = b.y - (dy / len) * inset

  if (Math.abs(dx) < 0.01 || Math.abs(dy) < 0.01) {
    return `M ${sx} ${sy} L ${ex} ${ey}`
  }
  const mx = (sx + ex) / 2
  const my = (sy + ey) / 2
  return `M ${sx} ${sy} Q ${mx} ${sy} ${mx} ${my} T ${ex} ${ey}`
}

function edgeLabelPoint(
  from: DiagramNode,
  to: DiagramNode,
  columns: number,
  rows: number,
): Point {
  const a = nodeCenter(from, columns, rows)
  const b = nodeCenter(to, columns, rows)
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 3 }
}

/**
 * Static styled flow graph for Languages lessons (algorithm-viz look, no motion).
 */
export function LessonFlowGraph({ diagram }: Props) {
  const byId = new Map(diagram.nodes.map((node) => [node.id, node]))
  const labeledEdges = diagram.edges.filter((edge) => edge.label)

  return (
    <figure className="flow-graph">
      <figcaption className="flow-graph__title">{diagram.title}</figcaption>
      <div
        className="flow-graph__stage"
        style={{
          ['--flow-cols' as string]: diagram.columns,
          ['--flow-rows' as string]: diagram.rows,
        }}
        role="img"
        aria-label={diagram.caption ?? diagram.title}
      >
        <svg
          className="flow-graph__edges"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={`arrow-${diagram.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="flow-graph__arrowhead" />
            </marker>
          </defs>
          {diagram.edges.map((edge) => {
            const from = byId.get(edge.from)
            const to = byId.get(edge.to)
            if (!from || !to) return null
            return (
              <path
                key={`${edge.from}-${edge.to}-${edge.label ?? ''}`}
                className="flow-graph__edge"
                d={edgePath(from, to, diagram.columns, diagram.rows)}
                markerEnd={`url(#arrow-${diagram.id})`}
              />
            )
          })}
        </svg>

        <div className="flow-graph__grid">
          {diagram.nodes.map((node) => (
            <div
              key={node.id}
              className={`flow-graph__node ${toneClass(node.tone)}`.trim()}
              style={{
                gridColumn: node.col,
                gridRow: node.row,
              }}
            >
              <span className="flow-graph__node-label">{node.label}</span>
              {node.detail ? (
                <span className="flow-graph__node-detail">{node.detail}</span>
              ) : null}
            </div>
          ))}
        </div>

        {labeledEdges.length > 0 ? (
          <div className="flow-graph__edge-labels" aria-hidden="true">
            {labeledEdges.map((edge) => {
              const from = byId.get(edge.from)
              const to = byId.get(edge.to)
              if (!from || !to || !edge.label) return null
              const point = edgeLabelPoint(
                from,
                to,
                diagram.columns,
                diagram.rows,
              )
              return (
                <span
                  key={`label-${edge.from}-${edge.to}`}
                  className="flow-graph__edge-label"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  {edge.label}
                </span>
              )
            })}
          </div>
        ) : null}
      </div>
      {diagram.caption ? (
        <p className="flow-graph__caption">{diagram.caption}</p>
      ) : null}
    </figure>
  )
}
