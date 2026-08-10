import { useEffect, useMemo, useRef, useState } from 'react'
import { CLIENT_NAMES } from '../sim/clients'
import { RING_SIZE, type LoadBalancerSimState, type SimFlight } from '../sim/types'
import './LoadBalancerViz.css'

type Props = {
  state: LoadBalancerSimState
  /** Full client → server travel time (ms). */
  travelMs: number
}

const CLIENT_X = 80
const LB_X = 300
const SERVER_X = 530
const TOP = 48
const ROW = 54
const NODE_R = 17
const VIEW_PAD = 28

function clientsColumnY(index: number): number {
  return TOP + index * ROW
}

function lbY(): number {
  return TOP + ((CLIENT_NAMES.length - 1) * ROW) / 2
}

function serversColumnY(index: number, count: number): number {
  if (count <= 1) return lbY()
  const span = (count - 1) * ROW
  const start = lbY() - span / 2
  return start + index * ROW
}

/** Smooth cubic route client → LB → server. */
function routePathD(
  clientIndex: number,
  serverIndex: number,
  serverCount: number,
): string {
  const x1 = CLIENT_X
  const y1 = clientsColumnY(clientIndex)
  const x2 = LB_X
  const y2 = lbY()
  const x3 = SERVER_X
  const y3 = serversColumnY(serverIndex, serverCount)
  const c1x = x1 + (x2 - x1) * 0.55
  const c2x = x2 + (x3 - x2) * 0.45
  return `M ${x1} ${y1} C ${c1x} ${y1}, ${c1x} ${y2}, ${x2} ${y2} C ${c2x} ${y2}, ${c2x} ${y3}, ${x3} ${y3}`
}

function serverIndexFor(state: LoadBalancerSimState, serverId: string): number {
  return Math.max(0, state.servers.findIndex((s) => s.id === serverId))
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

/**
 * Load-balancer scene with Tron-style flow:
 * a request moves along a route; the lit trail grows behind it.
 */
export function LoadBalancerViz({ state, travelMs }: Props) {
  const showRing = state.algo === 'consistent-hash'
  const serverCount = state.servers.length
  const height = TOP + (CLIENT_NAMES.length - 1) * ROW + VIEW_PAD + 20
  const width = SERVER_X + VIEW_PAD + 70
  const balancerY = lbY()
  const flight = state.flight

  const pathD = useMemo(() => {
    if (!flight) return null
    return routePathD(
      flight.clientIndex,
      serverIndexFor(state, flight.serverId),
      serverCount,
    )
  }, [flight, state, serverCount])

  const progress = useTrailProgress(flight?.id ?? null, travelMs)
  const serverLabel = flight
    ? (state.servers.find((s) => s.id === flight.serverId)?.label ?? flight.serverId)
    : null

  return (
    <div className="lb-viz">
      <div className="lb-viz__scene">
        <svg
          className="lb-viz__svg"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label="request flowing along a route from client to server"
        >
          {/* Resting topology (dim), clipped to the board */}
          {CLIENT_NAMES.map((_, index) => (
            <line
              key={`wire-c-${index}`}
              x1={CLIENT_X}
              y1={clientsColumnY(index)}
              x2={LB_X}
              y2={balancerY}
              className="lb-viz__wire"
            />
          ))}
          {state.servers.map((server, index) => (
            <line
              key={`wire-s-${server.id}`}
              x1={LB_X}
              y1={balancerY}
              x2={SERVER_X}
              y2={serversColumnY(index, serverCount)}
              className="lb-viz__wire"
            />
          ))}

          {flight && pathD ? (
            <TronFlow
              pathD={pathD}
              progress={progress}
              requestId={flight.id}
            />
          ) : null}

          {CLIENT_NAMES.map((name, index) => {
            const y = clientsColumnY(index)
            const active = flight?.clientKey === name
            return (
              <g key={name} transform={`translate(${CLIENT_X}, ${y})`}>
                <circle
                  r={NODE_R}
                  className={`lb-viz__node lb-viz__node--client${active ? ' is-active' : ''}`}
                />
                <text className="lb-viz__node-label" textAnchor="middle" dy="0.35em">
                  {name.slice(0, 1).toUpperCase()}
                </text>
                <text className="lb-viz__caption" textAnchor="middle" y={NODE_R + 13}>
                  {name}
                </text>
              </g>
            )
          })}

          <g transform={`translate(${LB_X}, ${balancerY})`}>
            <rect
              x={-44}
              y={-26}
              width={88}
              height={52}
              rx={8}
              className={`lb-viz__lb${flight && progress > 0.2 && progress < 0.85 ? ' is-active' : ''}`}
            />
            <text className="lb-viz__lb-title" textAnchor="middle" y={-2}>
              LB
            </text>
            <text className="lb-viz__lb-sub" textAnchor="middle" y={14}>
              {algoShort(state.algo)}
            </text>
          </g>

          {state.servers.map((server, index) => {
            const y = serversColumnY(index, serverCount)
            const active = flight?.serverId === server.id && progress > 0.85
            return (
              <g key={server.id} transform={`translate(${SERVER_X}, ${y})`}>
                <rect
                  x={-34}
                  y={-22}
                  width={68}
                  height={44}
                  rx={8}
                  className={`lb-viz__server${active ? ' is-active' : ''}`}
                />
                <text className="lb-viz__server-name" textAnchor="middle" y={-2}>
                  {server.label}
                </text>
                <text className="lb-viz__server-meta" textAnchor="middle" y={14}>
                  {state.algo === 'weighted-round-robin'
                    ? `w${server.weight} · Σ${server.totalHandled}`
                    : `n=${server.activeConnections} · Σ${server.totalHandled}`}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <p className="lb-viz__story" aria-live="polite">
        {state.finished ? (
          <>
            Burst complete: {state.arrivalsCount} requests routed. Hit Replay to watch again.
          </>
        ) : flight && serverLabel ? (
          <>
            <strong>{flight.clientKey}</strong> flowing to <strong>{serverLabel}</strong>
            <span className="lb-viz__story-muted"> · {flight.id}</span>
          </>
        ) : state.arrivalsCount === 0 ? (
          <>Press Play. A request will leave a client and trail light to its server.</>
        ) : (
          <>
            Routed {state.arrivalsCount}/{state.maxArrivals}. Next request coming up…
          </>
        )}
      </p>

      {showRing ? <HashRing state={state} flight={flight} /> : null}
    </div>
  )
}

/**
 * Tron trail: path draws from 0 → progress while the request rides the tip.
 */
function TronFlow({
  pathD,
  progress,
  requestId,
}: {
  pathD: string
  progress: number
  requestId: string
}) {
  const measureRef = useRef<SVGPathElement | null>(null)
  const [tip, setTip] = useState({ x: CLIENT_X, y: lbY() })

  const revealed = easeInOut(Math.min(1, Math.max(0, progress)))

  useEffect(() => {
    const path = measureRef.current
    if (!path) return
    const length = path.getTotalLength()
    const point = path.getPointAtLength(length * revealed)
    setTip({ x: point.x, y: point.y })
  }, [revealed, pathD])

  return (
    <g className="lb-viz__flow">
      {/* Invisible geometry path for getPointAtLength */}
      <path ref={measureRef} d={pathD} className="lb-viz__measure" />

      {/* Faint full route hint */}
      <path d={pathD} className="lb-viz__route-ghost" />

      {/* Lit trail grows from client toward the rider (Tron style) */}
      <path
        d={pathD}
        pathLength={1}
        className="lb-viz__route-trail"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: 1 - revealed,
        }}
      />

      {/* Request entity rides the tip of the trail */}
      <g className="lb-viz__rider" transform={`translate(${tip.x}, ${tip.y})`}>
        <circle r={12} className="lb-viz__rider-glow" />
        <circle r={8} className="lb-viz__rider-core" />
        <text className="lb-viz__rider-label" textAnchor="middle" dy="0.35em">
          {requestId.replace('r', '')}
        </text>
      </g>
    </g>
  )
}

/** Drive 0→1 over travelMs whenever a new flight id appears. */
function useTrailProgress(flightId: string | null, travelMs: number): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!flightId) {
      setProgress(0)
      return
    }
    let raf = 0
    const started = performance.now()
    setProgress(0)
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / Math.max(1, travelMs))
      setProgress(t)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [flightId, travelMs])

  return progress
}

function HashRing({
  state,
  flight,
}: {
  state: LoadBalancerSimState
  flight: SimFlight | null
}) {
  return (
    <div className="lb-viz__ring" aria-label="consistent hash ring">
      <p className="lb-viz__label">Hash ring</p>
      <svg
        className="lb-viz__ring-svg"
        viewBox="0 0 220 220"
        width={200}
        height={200}
        role="img"
      >
        <circle cx="110" cy="110" r="78" className="lb-viz__ring-circle" />
        {state.servers.map((server) => {
          const angle =
            (server.ringPosition / RING_SIZE) * Math.PI * 2 - Math.PI / 2
          const x = 110 + Math.cos(angle) * 78
          const y = 110 + Math.sin(angle) * 78
          const focused = flight?.serverId === server.id
          return (
            <g key={server.id}>
              <circle
                cx={x}
                cy={y}
                r={focused ? 11 : 9}
                className={`lb-viz__ring-node${focused ? ' is-focus' : ''}`}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dy="0.35em"
                className="lb-viz__ring-text"
              >
                {server.label.replace('S', '')}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="lb-viz__ring-caption">
        Same client name hashes to the same angle; ownership is the next clockwise server.
      </p>
    </div>
  )
}

function algoShort(algo: LoadBalancerSimState['algo']): string {
  switch (algo) {
    case 'round-robin':
      return 'round robin'
    case 'weighted-round-robin':
      return 'weighted RR'
    case 'least-connections':
      return 'least conn'
    case 'consistent-hash':
      return 'hash ring'
    default:
      return algo
  }
}
