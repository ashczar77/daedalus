import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { CLIENT_NAMES } from '../sim/clients'
import { hashToRing, weightedSlots } from '../sim/strategies'
import {
  RING_SIZE,
  type LoadBalancerSimState,
  type SimFlight,
  type SimServer,
} from '../sim/types'
import './LoadBalancerViz.css'

const SCALE_MIN = 0.7
const SCALE_MAX = 1.6
const SCALE_STEP = 0.15
const SCALE_DEFAULT = 1

function roundScale(value: number): number {
  return Math.round(value * 100) / 100
}

type Props = {
  state: LoadBalancerSimState
  travelMs: number
}

const CLIENT_X = 80
const LB_X = 290
const SERVER_X = 520
const TOP = 48
const ROW = 54
const NODE_R = 16

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function clientsColumnY(index: number): number {
  return TOP + index * ROW
}

function lbY(): number {
  return TOP + ((CLIENT_NAMES.length - 1) * ROW) / 2
}

function serversColumnY(index: number, count: number, row = ROW): number {
  if (count <= 1) return lbY()
  const span = (count - 1) * row
  return lbY() - span / 2 + index * row
}

function serverIndexFor(servers: SimServer[], serverId: string): number {
  return Math.max(0, servers.findIndex((s) => s.id === serverId))
}

function linearRouteD(
  clientIndex: number,
  serverIndex: number,
  serverCount: number,
  serverRow = ROW,
): string {
  const x1 = CLIENT_X
  const y1 = clientsColumnY(clientIndex)
  const x2 = LB_X
  const y2 = lbY()
  const x3 = SERVER_X
  const y3 = serversColumnY(serverIndex, serverCount, serverRow)
  const c1x = x1 + (x2 - x1) * 0.55
  const c2x = x2 + (x3 - x2) * 0.45
  return `M ${x1} ${y1} C ${c1x} ${y1}, ${c1x} ${y2}, ${x2} ${y2} C ${c2x} ${y2}, ${c2x} ${y3}, ${x3} ${y3}`
}

/**
 * Algorithm-specific load balancer stages.
 * Each lab makes its decision rule visible, not just "request goes somewhere."
 */
export function LoadBalancerViz({ state, travelMs }: Props) {
  if (state.algo === 'consistent-hash') {
    return <ConsistentHashStage state={state} travelMs={travelMs} />
  }
  if (state.algo === 'weighted-round-robin') {
    return <WeightedRoundRobinStage state={state} travelMs={travelMs} />
  }
  if (state.algo === 'least-connections') {
    return <LeastConnectionsStage state={state} travelMs={travelMs} />
  }
  return <RoundRobinStage state={state} travelMs={travelMs} />
}

function RoundRobinStage({
  state,
  travelMs,
}: {
  state: LoadBalancerSimState
  travelMs: number
}) {
  const flight = state.flight
  const progress = useTrailProgress(flight?.id ?? null, travelMs)
  const n = state.servers.length
  const nextCursor =
    flight?.cursorIndex ?? (n ? state.rrIndex % n : 0)
  const pathD = flight
    ? linearRouteD(
        flight.clientIndex,
        serverIndexFor(state.servers, flight.serverId),
        n,
      )
    : null

  return (
    <AlgoShell
      state={state}
      flight={flight}
      badge="Round robin"
      hint="Cursor walks S1 → S2 → S3 → S1. Equal turns, ignore load."
      idlePrompt="Press Play. Watch the highlighted cursor step around the backends."
    >
      <svg
        className="lb-viz__svg"
        viewBox={`0 0 640 ${TOP + (CLIENT_NAMES.length - 1) * ROW + 40}`}
        role="img"
        aria-label="round robin load balancing"
      >
        <FanTopology state={state} />
        {flight && pathD ? (
          <TronFlow pathD={pathD} progress={progress} requestId={flight.id} />
        ) : null}
        <ClientColumn state={state} flight={flight} />
        <LbBadge label="LB" sub="cursor" active={Boolean(flight)} />
        {state.servers.map((server, index) => {
          const y = serversColumnY(index, n)
          const isTarget = flight?.serverId === server.id
          const isNext = !flight && index === nextCursor
          return (
            <g key={server.id} transform={`translate(${SERVER_X}, ${y})`}>
              <rect
                x={-36}
                y={-24}
                width={72}
                height={48}
                rx={8}
                className={`lb-viz__server${isTarget || isNext ? ' is-active' : ''}`}
              />
              <text className="lb-viz__server-name" textAnchor="middle" y={-4}>
                {server.label}
              </text>
              <text className="lb-viz__server-meta" textAnchor="middle" y={12}>
                Σ{server.totalHandled}
              </text>
            </g>
          )
        })}
      </svg>
    </AlgoShell>
  )
}

function WeightedRoundRobinStage({
  state,
  travelMs,
}: {
  state: LoadBalancerSimState
  travelMs: number
}) {
  const flight = state.flight
  const progress = useTrailProgress(flight?.id ?? null, travelMs)
  const slots = weightedSlots(state.servers)
  const n = state.servers.length
  const activeSlot =
    flight?.slotIndex ?? (slots.length ? state.rrIndex % slots.length : 0)
  const pathD = flight
    ? linearRouteD(
        flight.clientIndex,
        serverIndexFor(state.servers, flight.serverId),
        n,
      )
    : null
  const maxW = Math.max(1, ...state.servers.map((s) => s.weight))
  const topologyBottom = TOP + (CLIENT_NAMES.length - 1) * ROW
  // Leave room under client captions before the weight-slot strip.
  const slotStripY = topologyBottom + 72
  const viewHeight = slotStripY + 48

  return (
    <AlgoShell
      state={state}
      flight={flight}
      badge="Weighted round robin"
      hint="Higher weight = more slots in the rotation. Bigger box = more capacity."
      idlePrompt="Press Play. Follow which weight slot fires, then where the request goes."
    >
      <svg
        className="lb-viz__svg"
        viewBox={`0 0 640 ${viewHeight}`}
        role="img"
        aria-label="weighted round robin load balancing"
      >
        <FanTopology state={state} />
        {flight && pathD ? (
          <TronFlow pathD={pathD} progress={progress} requestId={flight.id} />
        ) : null}
        <ClientColumn state={state} flight={flight} />
        <LbBadge label="LB" sub="weights" active={Boolean(flight)} />
        {state.servers.map((server, index) => {
          const y = serversColumnY(index, n)
          const isTarget = flight?.serverId === server.id
          const w = 56 + (server.weight / maxW) * 36
          const h = 40 + server.weight * 4
          return (
            <g key={server.id} transform={`translate(${SERVER_X}, ${y})`}>
              <rect
                x={-w / 2}
                y={-h / 2}
                width={w}
                height={h}
                rx={8}
                className={`lb-viz__server${isTarget ? ' is-active' : ''}`}
              />
              <text className="lb-viz__server-name" textAnchor="middle" y={-2}>
                {server.label}
              </text>
              <text className="lb-viz__server-meta" textAnchor="middle" y={14}>
                w={server.weight} · Σ{server.totalHandled}
              </text>
            </g>
          )
        })}

        {/* Slot strip: the actual WRR rotation */}
        <g transform={`translate(80, ${slotStripY})`}>
          <text className="lb-viz__strip-label" x={0} y={-8}>
            weight slots (cycle)
          </text>
          {slots.map((serverId, index) => {
            const label =
              state.servers.find((s) => s.id === serverId)?.label ?? '?'
            const active = index === activeSlot
            return (
              <g key={`${serverId}-${index}`} transform={`translate(${index * 46}, 0)`}>
                <rect
                  x={0}
                  y={0}
                  width={40}
                  height={28}
                  rx={4}
                  className={`lb-viz__slot${active ? ' is-active' : ''}`}
                />
                <text
                  className="lb-viz__slot-text"
                  textAnchor="middle"
                  x={20}
                  y={18}
                >
                  {label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </AlgoShell>
  )
}

function LeastConnectionsStage({
  state,
  travelMs,
}: {
  state: LoadBalancerSimState
  travelMs: number
}) {
  const flight = state.flight
  const progress = useTrailProgress(flight?.id ?? null, travelMs)
  const n = state.servers.length
  // Taller rows so server cards, bars, and labels never stack on each other.
  const serverRow = 92
  const maxActive = Math.max(1, ...state.servers.map((s) => s.activeConnections))
  const quietestId = state.servers.reduce((best, s) => {
    if (!best) return s.id
    const b = state.servers.find((x) => x.id === best)!
    if (s.activeConnections < b.activeConnections) return s.id
    if (s.activeConnections === b.activeConnections && s.id < best) return s.id
    return best
  }, state.servers[0]?.id ?? '')
  const pathD = flight
    ? linearRouteD(
        flight.clientIndex,
        serverIndexFor(state.servers, flight.serverId),
        n,
        serverRow,
      )
    : null
  const topPad = 40
  const bottomPad = 48
  const stackSpan = n <= 1 ? 0 : (n - 1) * serverRow
  const viewHeight = Math.max(
    TOP + (CLIENT_NAMES.length - 1) * ROW + 40,
    lbY() + stackSpan / 2 + bottomPad + topPad,
  )

  return (
    <AlgoShell
      state={state}
      flight={flight}
      badge="Least connections"
      hint="Each request picks the server with the fewest active connections right now."
      idlePrompt="Press Play. Watch the quietest server (shortest bar) get the next request."
    >
      <svg
        className="lb-viz__svg"
        viewBox={`0 0 640 ${viewHeight}`}
        role="img"
        aria-label="least connections load balancing"
      >
        <FanTopology state={state} serverRow={serverRow} />
        {flight && pathD ? (
          <TronFlow pathD={pathD} progress={progress} requestId={flight.id} />
        ) : null}
        <ClientColumn state={state} flight={flight} />
        <LbBadge label="LB" sub="fewest" active={Boolean(flight)} />
        {state.servers.map((server, index) => {
          const y = serversColumnY(index, n, serverRow)
          const isTarget = flight?.serverId === server.id
          const isQuiet = server.id === quietestId
          const barW = 10 + (server.activeConnections / maxActive) * 70
          return (
            <g key={server.id} transform={`translate(${SERVER_X}, ${y})`}>
              <rect
                x={-34}
                y={-22}
                width={68}
                height={44}
                rx={8}
                className={`lb-viz__server${isTarget || (!flight && isQuiet) ? ' is-active' : ''}`}
              />
              <text className="lb-viz__server-name" textAnchor="middle" y={4}>
                {server.label}
              </text>
              {/* Load bar + count sit below the box so nothing stacks inside it. */}
              <rect
                x={-40}
                y={34}
                width={80}
                height={8}
                rx={2}
                className="lb-viz__load-track"
              />
              <rect
                x={-40}
                y={34}
                width={barW}
                height={8}
                rx={2}
                className={`lb-viz__load-fill${isQuiet ? ' is-best' : ''}`}
              />
              <text className="lb-viz__server-meta" textAnchor="middle" y={56}>
                {server.activeConnections} active
              </text>
            </g>
          )
        })}
      </svg>
    </AlgoShell>
  )
}

function ConsistentHashStage({
  state,
  travelMs,
}: {
  state: LoadBalancerSimState
  travelMs: number
}) {
  const flight = state.flight
  const progress = useTrailProgress(flight?.id ?? null, travelMs)
  const cx = 280
  const cy = 270
  const r = 168
  const labelR = r + 42
  const keyPos = flight?.keyRingPos ?? (flight ? hashToRing(flight.clientKey) : 0)
  const target = flight
    ? state.servers.find((s) => s.id === flight.serverId)
    : null
  const pathD =
    flight && target
      ? clockwiseArcPath(
          cx,
          cy,
          r,
          // Keep a readable trail even when the key lands right next to its server.
          visualTrailStart(keyPos, target.ringPosition),
          target.ringPosition,
        )
      : null
  const keyMarkerPos = keyPos
  // Draw the client key slightly inside the ring so it stays distinct from the server node.
  const keyPoint = ringPoint(cx, cy, r - 28, keyMarkerPos)
  const ordered = [...state.servers].sort(
    (a, b) => a.ringPosition - b.ringPosition,
  )

  return (
    <AlgoShell
      state={state}
      flight={flight}
      badge="Consistent hashing"
      hint="The ring is a diagram of hash values. A client lands, then walks clockwise to the next server."
      idlePrompt="Press Play to watch stickiness. Then add a server and see who moves."
    >
      <svg
        className="lb-viz__svg lb-viz__svg--ring"
        viewBox="0 0 560 540"
        role="img"
        aria-label="consistent hash ring"
      >
        <circle cx={cx} cy={cy} r={r} className="lb-viz__ring-track" />

        {ordered.map((server, index, arr) => {
          const prev = arr[(index - 1 + arr.length) % arr.length]!
          const d = clockwiseArcPath(
            cx,
            cy,
            r - 22,
            prev.ringPosition,
            server.ringPosition,
          )
          return (
            <path
              key={`own-${server.id}`}
              d={d}
              className={`lb-viz__ring-owned${
                flight?.serverId === server.id ? ' is-active' : ''
              }`}
            />
          )
        })}

        {flight && pathD ? (
          <TronFlow pathD={pathD} progress={progress} requestId={flight.id} />
        ) : null}

        {flight ? (
          <g transform={`translate(${keyPoint.x}, ${keyPoint.y})`}>
            <circle r={7} className="lb-viz__key-dot" />
            <text className="lb-viz__key-label" textAnchor="middle" y={-14}>
              {flight.clientKey}
            </text>
          </g>
        ) : null}

        {state.servers.map((server) => {
          const p = ringPoint(cx, cy, r, server.ringPosition)
          const label = ringPoint(cx, cy, labelR, server.ringPosition)
          const active = flight?.serverId === server.id
          const anchor = ringTextAnchor(server.ringPosition)
          return (
            <g key={server.id}>
              <g transform={`translate(${p.x}, ${p.y})`}>
                <circle
                  r={active ? 24 : 20}
                  className={`lb-viz__ring-server${active ? ' is-active' : ''}`}
                />
                <text
                  className="lb-viz__ring-server-label"
                  textAnchor="middle"
                  dy="0.35em"
                >
                  {server.label}
                </text>
              </g>
              <text
                className="lb-viz__ring-server-meta"
                textAnchor={anchor}
                x={label.x}
                y={label.y}
              >
                {server.totalHandled} routed
              </text>
            </g>
          )
        })}

        <text className="lb-viz__ring-center" textAnchor="middle" x={cx} y={cy - 6}>
          hash ring
        </text>
        <text className="lb-viz__ring-center-sub" textAnchor="middle" x={cx} y={cy + 14}>
          walk clockwise
        </text>
      </svg>
    </AlgoShell>
  )
}

function ringTextAnchor(pos: number): 'start' | 'middle' | 'end' {
  const angle = (pos / RING_SIZE) * Math.PI * 2 - Math.PI / 2
  const cos = Math.cos(angle)
  if (cos > 0.35) return 'start'
  if (cos < -0.35) return 'end'
  return 'middle'
}

function AlgoShell({
  state,
  flight,
  badge,
  hint,
  idlePrompt,
  children,
}: {
  state: LoadBalancerSimState
  flight: SimFlight | null
  badge: string
  hint: string
  idlePrompt: string
  children: ReactNode
}) {
  const [scale, setScale] = useState(SCALE_DEFAULT)

  return (
    <div
      className="lb-viz"
      style={{ ['--viz-scale' as string]: String(scale) }}
    >
      <div className="lb-viz__algo-banner">
        <div className="lb-viz__algo-head">
          <span className="lb-viz__algo-badge">{badge}</span>
          <div className="lb-viz__zoom" role="group" aria-label="Visualization size">
            <button
              type="button"
              className="lb-viz__zoom-btn"
              aria-label="Decrease visualization size"
              disabled={scale <= SCALE_MIN + 0.001}
              onClick={() =>
                setScale((value) => Math.max(SCALE_MIN, roundScale(value - SCALE_STEP)))
              }
            >
              -
            </button>
            <button
              type="button"
              className="lb-viz__zoom-btn"
              aria-label="Increase visualization size"
              disabled={scale >= SCALE_MAX - 0.001}
              onClick={() =>
                setScale((value) => Math.min(SCALE_MAX, roundScale(value + SCALE_STEP)))
              }
            >
              +
            </button>
          </div>
        </div>
        <p className="lb-viz__algo-hint">{hint}</p>
      </div>
      <div className="lb-viz__scene">
        <div className="lb-viz__viewport">
          <div className="lb-viz__canvas">{children}</div>
        </div>
      </div>
      <p className="lb-viz__story" aria-live="polite">
        {state.finished ? (
          <>
            Burst complete: {state.arrivalsCount} requests routed. Hit Replay to watch again.
          </>
        ) : flight ? (
          <>{flight.reason}</>
        ) : state.arrivalsCount === 0 ? (
          <>{idlePrompt}</>
        ) : (
          <>
            Routed {state.arrivalsCount}/{state.maxArrivals}. Next decision coming up…
          </>
        )}
      </p>
    </div>
  )
}

function FanTopology({
  state,
  serverRow = ROW,
}: {
  state: LoadBalancerSimState
  serverRow?: number
}) {
  const n = state.servers.length
  const balancerY = lbY()
  return (
    <g className="lb-viz__wires">
      {CLIENT_NAMES.map((_, index) => (
        <line
          key={`c-${index}`}
          x1={CLIENT_X}
          y1={clientsColumnY(index)}
          x2={LB_X}
          y2={balancerY}
          className="lb-viz__wire"
        />
      ))}
      {state.servers.map((server, index) => (
        <line
          key={`s-${server.id}`}
          x1={LB_X}
          y1={balancerY}
          x2={SERVER_X}
          y2={serversColumnY(index, n, serverRow)}
          className="lb-viz__wire"
        />
      ))}
    </g>
  )
}

function ClientColumn({
  state,
  flight,
}: {
  state: LoadBalancerSimState
  flight: SimFlight | null
}) {
  void state
  return (
    <g>
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
            <text className="lb-viz__caption" textAnchor="middle" y={NODE_R + 12}>
              {name}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function LbBadge({
  label,
  sub,
  active,
}: {
  label: string
  sub: string
  active: boolean
}) {
  return (
    <g transform={`translate(${LB_X}, ${lbY()})`}>
      <rect
        x={-42}
        y={-26}
        width={84}
        height={52}
        rx={8}
        className={`lb-viz__lb${active ? ' is-active' : ''}`}
      />
      <text className="lb-viz__lb-title" textAnchor="middle" y={-2}>
        {label}
      </text>
      <text className="lb-viz__lb-sub" textAnchor="middle" y={14}>
        {sub}
      </text>
    </g>
  )
}

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
  const [tip, setTip] = useState({ x: 0, y: 0 })
  const revealed = easeInOut(Math.min(1, Math.max(0, progress)))

  useLayoutEffect(() => {
    const path = measureRef.current
    if (!path) return
    const length = path.getTotalLength()
    if (length <= 0) return
    const point = path.getPointAtLength(length * revealed)
    setTip({ x: point.x, y: point.y })
  }, [revealed, pathD])

  return (
    <g className="lb-viz__flow">
      <path ref={measureRef} d={pathD} className="lb-viz__measure" />
      <path d={pathD} className="lb-viz__route-ghost" />
      <path
        d={pathD}
        pathLength={1}
        className="lb-viz__route-trail"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: 1 - revealed,
        }}
      />
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

/** Minimum clockwise degrees so a near-hit still shows a visible trail. */
const MIN_TRAIL_DEGREES = 32

function visualTrailStart(keyPos: number, serverPos: number): number {
  const start = ((keyPos % RING_SIZE) + RING_SIZE) % RING_SIZE
  const end = ((serverPos % RING_SIZE) + RING_SIZE) % RING_SIZE
  let delta = (end - start + RING_SIZE) % RING_SIZE
  if (delta === 0) delta = RING_SIZE
  if (delta >= MIN_TRAIL_DEGREES) return start
  return (end - MIN_TRAIL_DEGREES + RING_SIZE) % RING_SIZE
}

function ringPoint(cx: number, cy: number, radius: number, pos: number) {
  const angle = (pos / RING_SIZE) * Math.PI * 2 - Math.PI / 2
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }
}

/** Clockwise arc along the hash ring from fromPos → toPos. */
function clockwiseArcPath(
  cx: number,
  cy: number,
  radius: number,
  fromPos: number,
  toPos: number,
): string {
  const start = ((fromPos % RING_SIZE) + RING_SIZE) % RING_SIZE
  const end = ((toPos % RING_SIZE) + RING_SIZE) % RING_SIZE
  let delta = (end - start + RING_SIZE) % RING_SIZE
  if (delta === 0) {
    // Same-point full-circle arcs have zero length in SVG; nudge the start.
    const nudged = (end - MIN_TRAIL_DEGREES + RING_SIZE) % RING_SIZE
    return clockwiseArcPath(cx, cy, radius, nudged, end)
  }
  const a = ringPoint(cx, cy, radius, start)
  const b = ringPoint(cx, cy, radius, end)
  const large = delta > RING_SIZE / 2 ? 1 : 0
  // sweep-flag 1 = clockwise in SVG's y-down coordinates
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${large} 1 ${b.x} ${b.y}`
}
