import { useEffect, useState, type ReactNode } from 'react'
import type { CapAlgo } from '../../types'
import type { CapFlight, CapReplica, CapSimState } from '../sim/types'
import './CapViz.css'

const SCALE_MIN = 0.7
const SCALE_MAX = 1.6
const SCALE_STEP = 0.15
const SCALE_DEFAULT = 1

function roundScale(value: number): number {
  return Math.round(value * 100) / 100
}

type Props = {
  state: CapSimState
  travelMs: number
}

const VIEW_W = 960
const VIEW_H = 480
/** Horizontal sync channel between zones, above the server row. */
const SYNC_Y = 210
const SERVER_Y = 340
const CLIENT_Y = 118
const CORRIDOR_LEFT = 400
const CORRIDOR_RIGHT = 560
const BARRIER_X = 480

const ZONE_A = { x: 40, w: 360 } as const
const ZONE_B = { x: 560, w: 360 } as const
/** Keep cards inset from zone edges so they never clip the outer frame. */
const ZONE_INSET = 20

/** Compact card sizes; padding/wrapping live in CSS via foreignObject. */
const SERVER_W = 128
const SERVER_H = 98
const SERVER_HALF_W = SERVER_W / 2
const SERVER_HALF_H = SERVER_H / 2

const CLIENT_W = 136
const CLIENT_H = 54
const CLIENT_HALF_W = CLIENT_W / 2
const CLIENT_HALF_H = CLIENT_H / 2

type Point = { id: string; x: number; y: number; side: 'left' | 'right' }

/** Evenly place card centers inside a zone so boxes stay within inset bounds. */
function centersInZone(count: number, zoneX: number, zoneW: number, boxW: number): number[] {
  if (count <= 0) return []
  const left = zoneX + ZONE_INSET + boxW / 2
  const right = zoneX + zoneW - ZONE_INSET - boxW / 2
  if (count === 1 || right <= left) {
    return Array.from({ length: count }, () => (zoneX + zoneX + zoneW) / 2)
  }
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1)
    return left + (right - left) * t
  })
}

function syncActivityNote(
  state: CapSimState,
  algo: CapAlgo,
): string | null {
  const flight = state.flight
  if (!flight) return null
  if (flight.kind === 'heal') return 'Copying across zones'
  if (flight.kind !== 'write-ok' || flight.value == null) return null
  if (state.partitioned) {
    if (algo === 'partition' || algo === 'overview') return 'Copy blocked at the break'
    return null
  }
  if (algo === 'partition' || algo === 'overview' || algo === 'consistency') {
    return 'Copying to the other zone'
  }
  return null
}

function userCardDetail(
  state: CapSimState,
  clientId: string,
  variant: CapAlgo,
  showResultChip: boolean,
): { text: string; tone: 'ok' | 'warn' | 'neutral' } {
  const flight = state.flight
  const idle =
    variant === 'availability' ? 'waiting for a reply' : 'sends reads / writes'
  if (!flight || flight.clientId !== clientId) {
    return { text: idle, tone: 'neutral' }
  }
  if (flight.kind === 'write-refuse' || flight.kind === 'read-refuse') {
    return { text: 'Error', tone: 'warn' }
  }
  if (
    showResultChip &&
    (flight.kind === 'write-ok' || flight.kind === 'read-ok')
  ) {
    return { text: 'Answered', tone: 'ok' }
  }
  if (variant === 'consistency' && flight.kind.startsWith('read')) {
    return { text: `saw ${flight.value ?? '?'}`, tone: 'ok' }
  }
  if (flight.kind === 'write-ok') return { text: 'writing…', tone: 'ok' }
  if (flight.kind === 'read-ok') return { text: 'reading…', tone: 'ok' }
  return { text: idle, tone: 'neutral' }
}

/**
 * CAP labs share one sim engine but each algo gets its own stage composition
 * so Consistency, Availability, Partition, and Overview teach different visuals.
 */
export function CapViz({ state, travelMs }: Props) {
  switch (state.algo) {
    case 'consistency':
      return <ConsistencyStage state={state} travelMs={travelMs} />
    case 'availability':
      return <AvailabilityStage state={state} travelMs={travelMs} />
    case 'partition':
      return <PartitionStage state={state} travelMs={travelMs} />
    case 'overview':
    default:
      return <OverviewStage state={state} travelMs={travelMs} />
  }
}

function CapShell({
  state,
  badge,
  idle,
  focusHint,
  status,
  children,
}: {
  state: CapSimState
  badge: string
  idle: string
  focusHint: string
  status: ReactNode
  children: ReactNode
}) {
  const [scale, setScale] = useState(SCALE_DEFAULT)
  const flight = state.flight
  const syncNote = syncActivityNote(state, state.algo)

  return (
    <div
      className={`cap-viz is-${state.algo}`}
      style={{ ['--viz-scale' as string]: String(scale) }}
    >
      <div className="cap-viz__toolbar">
        <div className="cap-viz__meta">
          <span className="cap-viz__badge">{badge}</span>
          <span className="cap-viz__focus-hint">{focusHint}</span>
        </div>
        <div className="cap-viz__zoom" role="group" aria-label="Visualization size">
          <button
            type="button"
            className="cap-viz__zoom-btn"
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
            className="cap-viz__zoom-btn"
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

      <p className="cap-viz__hint">{flight ? flight.reason : idle}</p>
      <div className="cap-viz__status" aria-label="Cluster status">
        {status}
      </div>
      <p
        className={`cap-viz__sync-note${
          !syncNote
            ? ' is-placeholder'
            : syncNote.includes('blocked')
              ? ' is-warn'
              : ' is-ok'
        }`}
        aria-hidden={!syncNote}
      >
        {syncNote ?? '\u00a0'}
      </p>
      {children}
      <p className="cap-viz__caption">{state.caption}</p>
    </div>
  )
}

function layoutPoints(state: CapSimState): {
  replicaPoints: Point[]
  clientPoints: Point[]
} {
  const zoneA = state.replicas.filter((r) => r.side === 'left')
  const zoneB = state.replicas.filter((r) => r.side === 'right')
  const leftXs = centersInZone(zoneA.length, ZONE_A.x, ZONE_A.w, SERVER_W)
  const rightXs = centersInZone(zoneB.length, ZONE_B.x, ZONE_B.w, SERVER_W)
  return {
    replicaPoints: [
      ...zoneA.map((replica, index) => ({
        id: replica.id,
        side: 'left' as const,
        x: leftXs[index] ?? ZONE_A.x + ZONE_A.w / 2,
        y: SERVER_Y,
      })),
      ...zoneB.map((replica, index) => ({
        id: replica.id,
        side: 'right' as const,
        x: rightXs[index] ?? ZONE_B.x + ZONE_B.w / 2,
        y: SERVER_Y,
      })),
    ],
    clientPoints: state.clients.map((client) => ({
      id: client.id,
      side: client.side,
      x:
        client.side === 'left'
          ? ZONE_A.x + ZONE_A.w / 2
          : ZONE_B.x + ZONE_B.w / 2,
      y: CLIENT_Y,
    })),
  }
}

function zoneValue(replicas: CapReplica[], side: 'left' | 'right'): string {
  return replicas.find((r) => r.side === side)?.value ?? '?'
}

/** Full tradeoff tour: policy flip, both zones, all three properties. */
function OverviewStage({ state, travelMs }: Props) {
  const { replicaPoints, clientPoints } = layoutPoints(state)
  const policy =
    state.mode === 'cp' ? 'Prefer Consistency' : 'Prefer Availability'

  return (
    <CapShell
      state={state}
      badge="CAP overview"
      focusHint="Watch the full tradeoff when the network breaks"
      idle="Press Play. Healthy write, broken link, Prefer Consistency, then Prefer Availability, then heal."
      status={
        <>
          <span className={`cap-viz__pill${state.partitioned ? ' is-warn' : ' is-ok'}`}>
            {state.partitioned ? 'Network broken' : 'Network healthy'}
          </span>
          <span className="cap-viz__pill is-neutral">{policy}</span>
          <span className="cap-viz__pill is-neutral">
            {state.sacrificed === 'A'
              ? 'Tradeoff: Availability paused on Zone B'
              : state.sacrificed === 'C'
                ? 'Tradeoff: Consistency paused across zones'
                : 'No tradeoff yet'}
          </span>
        </>
      }
    >
      <ul className="cap-viz__properties" aria-label="CAP properties">
        <li className={`cap-viz__property${state.sacrificed === 'C' ? ' is-dim' : ' is-live'}`}>
          <strong>Consistency</strong>
          <span>one shared latest value</span>
        </li>
        <li className={`cap-viz__property${state.sacrificed === 'A' ? ' is-dim' : ' is-live'}`}>
          <strong>Availability</strong>
          <span>every working server answers</span>
        </li>
        <li className="cap-viz__property is-live">
          <strong>Partition tolerance</strong>
          <span>defined behavior when the link breaks</span>
        </li>
      </ul>
      <ClusterSvg
        state={state}
        travelMs={travelMs}
        replicaPoints={replicaPoints}
        clientPoints={clientPoints}
        variant="overview"
      />
    </CapShell>
  )
}

/** Value-first stage: match / mismatch billboard is the hero. */
function ConsistencyStage({ state, travelMs }: Props) {
  const { replicaPoints, clientPoints } = layoutPoints(state)
  const left = zoneValue(state.replicas, 'left')
  const right = zoneValue(state.replicas, 'right')
  const match = left === right

  return (
    <CapShell
      state={state}
      badge="Consistency"
      focusHint="Compare stored values across zones"
      idle="Press Play. Watch Zone A and Zone B stay on one value, then drift under Prefer Availability."
      status={
        <>
          <span className={`cap-viz__pill${match ? ' is-ok' : ' is-warn'}`}>
            {match ? 'Values agree' : 'Values disagree'}
          </span>
          <span className="cap-viz__pill is-neutral">Zone A = {left}</span>
          <span className="cap-viz__pill is-neutral">Zone B = {right}</span>
          <span className="cap-viz__pill is-neutral">
            {state.mode === 'cp' ? 'Prefer Consistency' : 'Prefer Availability'}
          </span>
        </>
      }
    >
      <div className={`cap-viz__compare${match ? ' is-match' : ' is-mismatch'}`}>
        <div className="cap-viz__compare-side">
          <span className="cap-viz__compare-label">Zone A reads</span>
          <strong className="cap-viz__compare-value">{left}</strong>
        </div>
        <div className="cap-viz__compare-verdict">{match ? 'same' : 'different'}</div>
        <div className="cap-viz__compare-side">
          <span className="cap-viz__compare-label">Zone B reads</span>
          <strong className="cap-viz__compare-value">{right}</strong>
        </div>
      </div>
      <ClusterSvg
        state={state}
        travelMs={travelMs}
        replicaPoints={replicaPoints}
        clientPoints={clientPoints}
        variant="consistency"
      />
    </CapShell>
  )
}

/** Outcome-first stage: answered vs error scoreboard is the hero. */
function AvailabilityStage({ state, travelMs }: Props) {
  const { replicaPoints, clientPoints } = layoutPoints(state)
  const total = state.okCount + state.refuseCount

  return (
    <CapShell
      state={state}
      badge="Availability"
      focusHint="Count whether users get an answer"
      idle="Press Play. After the cut, Prefer Consistency returns errors on Zone B; Prefer Availability keeps answering."
      status={
        <>
          <span className="cap-viz__pill is-ok">Answered {state.okCount}</span>
          <span className="cap-viz__pill is-warn">Errors {state.refuseCount}</span>
          <span className="cap-viz__pill is-neutral">
            {state.partitioned ? 'Network broken' : 'Network healthy'}
          </span>
          <span className="cap-viz__pill is-neutral">
            {state.mode === 'cp' ? 'Prefer Consistency' : 'Prefer Availability'}
          </span>
        </>
      }
    >
      <div className="cap-viz__scoreboard" aria-label="Request outcomes">
        <div className="cap-viz__score is-ok">
          <strong>{state.okCount}</strong>
          <span>Answered</span>
        </div>
        <div className="cap-viz__score is-warn">
          <strong>{state.refuseCount}</strong>
          <span>Errors</span>
        </div>
        <div className="cap-viz__score is-neutral">
          <strong>{total}</strong>
          <span>Requests so far</span>
        </div>
      </div>
      <ClusterSvg
        state={state}
        travelMs={travelMs}
        replicaPoints={replicaPoints}
        clientPoints={clientPoints}
        variant="availability"
      />
    </CapShell>
  )
}

/** Link-first stage: sync corridor and failed cross-zone copy are the hero. */
function PartitionStage({ state, travelMs }: Props) {
  const { replicaPoints, clientPoints } = layoutPoints(state)

  return (
    <CapShell
      state={state}
      badge="Partition tolerance"
      focusHint="Watch the sync link between zones"
      idle="Press Play. The story is the broken sync path: writes stay local until heal reconnects the zones."
      status={
        <>
          <span className={`cap-viz__pill${state.partitioned ? ' is-warn' : ' is-ok'}`}>
            {state.partitioned ? 'Sync link broken' : 'Sync link open'}
          </span>
          <span className="cap-viz__pill is-neutral">
            {state.partitioned
              ? 'Cross-zone copy blocked'
              : 'Cross-zone copy allowed'}
          </span>
          <span className="cap-viz__pill is-neutral">
            {state.mode === 'cp' ? 'Prefer Consistency' : 'Prefer Availability'}
          </span>
        </>
      }
    >
      <ClusterSvg
        state={state}
        travelMs={travelMs}
        replicaPoints={replicaPoints}
        clientPoints={clientPoints}
        variant="partition"
      />
    </CapShell>
  )
}

function ClusterSvg({
  state,
  travelMs,
  replicaPoints,
  clientPoints,
  variant,
}: {
  state: CapSimState
  travelMs: number
  replicaPoints: Point[]
  clientPoints: Point[]
  variant: CapAlgo
}) {
  const flight = state.flight
  const quietUsers = variant === 'consistency' || variant === 'partition'
  const loudValues = variant === 'consistency'
  const quietServers = variant === 'availability'
  const loudCorridor = variant === 'partition'
  const showResultChip = variant === 'availability' || variant === 'overview'

  return (
    <div className="cap-viz__viewport">
      <svg
        className="cap-viz__canvas"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${variant} visualization`}
      >
        <defs>
          <marker
            id={`cap-arrow-${variant}`}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" className="cap-viz__arrow-head" />
          </marker>
        </defs>

        <rect
          x={ZONE_A.x}
          y={36}
          width={ZONE_A.w}
          height={408}
          rx={12}
          className={`cap-viz__zone${quietServers ? ' is-quiet' : ''}`}
        />
        <rect
          x={ZONE_B.x}
          y={36}
          width={ZONE_B.w}
          height={408}
          rx={12}
          className={`cap-viz__zone${quietServers ? ' is-quiet' : ''}`}
        />

        <text
          x={ZONE_A.x + ZONE_A.w / 2}
          y={62}
          textAnchor="middle"
          className="cap-viz__zone-title"
        >
          Zone A · 2 servers
        </text>
        <text
          x={ZONE_B.x + ZONE_B.w / 2}
          y={62}
          textAnchor="middle"
          className="cap-viz__zone-title"
        >
          Zone B · 1 server
        </text>

        <rect
          x={420}
          y={36}
          width={120}
          height={408}
          className={`cap-viz__corridor${state.partitioned ? ' is-cut' : ''}${loudCorridor ? ' is-loud' : ''}`}
        />

        {state.partitioned ? (
          <line
            x1={BARRIER_X}
            y1={160}
            x2={BARRIER_X}
            y2={260}
            className={`cap-viz__barrier-line${loudCorridor ? ' is-loud' : ''}`}
          />
        ) : (
          <line
            x1={CORRIDOR_LEFT}
            y1={SYNC_Y}
            x2={CORRIDOR_RIGHT}
            y2={SYNC_Y}
            className={`cap-viz__sync-line${loudCorridor ? ' is-loud' : ''}`}
          />
        )}

        {clientPoints.map((client) => {
          const label =
            state.clients.find((c) => c.id === client.id)?.label ?? client.id
          const detail = userCardDetail(
            state,
            client.id,
            variant,
            showResultChip,
          )
          return (
            <g
              key={client.id}
              transform={`translate(${client.x}, ${client.y})`}
              className={quietUsers ? 'cap-viz__actor is-quiet' : undefined}
            >
              <foreignObject
                x={-CLIENT_HALF_W}
                y={-CLIENT_HALF_H}
                width={CLIENT_W}
                height={CLIENT_H}
              >
                <div
                  className={`cap-viz__card cap-viz__card--user${
                    detail.tone !== 'neutral' ? ` is-${detail.tone}` : ''
                  }`}
                >
                  <span className="cap-viz__card-label">{label}</span>
                  <span className={`cap-viz__card-sub is-${detail.tone}`}>
                    {detail.text}
                  </span>
                </div>
              </foreignObject>
            </g>
          )
        })}

        {state.replicas.map((replica) => {
          const point = replicaPoints.find((p) => p.id === replica.id)
          if (!point) return null
          const focused = flight?.replicaIds.includes(replica.id) ?? false
          const closed = !replica.accepting && variant !== 'partition'
          return (
            <g
              key={replica.id}
              transform={`translate(${point.x}, ${point.y})`}
              className={quietServers ? 'cap-viz__actor is-quiet' : undefined}
            >
              <foreignObject
                x={-SERVER_HALF_W}
                y={-SERVER_HALF_H}
                width={SERVER_W}
                height={SERVER_H}
              >
                <div
                  className={[
                    'cap-viz__card',
                    'cap-viz__card--server',
                    replica.accepting ? 'is-accepting' : 'is-refusing',
                    focused ? 'is-focus' : '',
                    loudValues ? 'is-value-loud' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="cap-viz__card-label">{replica.label}</span>
                  <span className="cap-viz__card-kicker">stored data</span>
                  <span
                    className={`cap-viz__card-value${loudValues ? ' is-loud' : ''}`}
                  >
                    {replica.value}
                  </span>
                  {closed ? (
                    <span className="cap-viz__card-tag">closed</span>
                  ) : null}
                </div>
              </foreignObject>
            </g>
          )
        })}

        {clientPoints.map((client) =>
          replicaPoints
            .filter((r) => r.side === client.side)
            .map((replica) => (
              <line
                key={`${client.id}-${replica.id}`}
                x1={client.x}
                y1={client.y + CLIENT_HALF_H}
                x2={replica.x}
                y2={replica.y - SERVER_HALF_H}
                className={`cap-viz__link${quietUsers ? ' is-quiet' : ''}`}
              />
            )),
        )}

        {flight ? (
          <FlightTrail
            state={state}
            flight={flight}
            clientPoints={clientPoints}
            replicaPoints={replicaPoints}
            travelMs={travelMs}
            variant={variant}
            markerId={`cap-arrow-${variant}`}
          />
        ) : null}
      </svg>
    </div>
  )
}

/** Geometry + orbs only. Callouts and sync notes live in CapShell HTML slots. */
function FlightTrail({
  state,
  flight,
  clientPoints,
  replicaPoints,
  travelMs,
  variant,
  markerId,
}: {
  state: CapSimState
  flight: CapFlight
  clientPoints: Point[]
  replicaPoints: Point[]
  travelMs: number
  variant: CapAlgo
  markerId: string
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(0)
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / Math.max(1, travelMs))
      setProgress(t)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [flight.id, travelMs])

  if (
    flight.kind === 'partition-cut' ||
    flight.kind === 'heal' ||
    flight.kind === 'mode-switch'
  ) {
    if (flight.kind !== 'heal') return null
    const healOrbX =
      CORRIDOR_LEFT + (CORRIDOR_RIGHT - CORRIDOR_LEFT) * progress
    return (
      <g className="cap-viz__sync-layer">
        <line
          x1={CORRIDOR_LEFT}
          y1={SYNC_Y}
          x2={CORRIDOR_RIGHT}
          y2={SYNC_Y}
          className="cap-viz__trail is-ok"
        />
        <circle cx={healOrbX} cy={SYNC_Y} r={8} className="cap-viz__orb is-ok" />
      </g>
    )
  }

  const client = clientPoints.find((c) => c.id === flight.clientId)
  const target =
    replicaPoints.find((r) => r.id === flight.replicaIds[0]) ?? replicaPoints[0]
  if (!client || !target) return null

  const refused = flight.outcome === 'refused'
  const x1 = client.x
  const y1 = client.y + CLIENT_HALF_H
  const x2 = target.x
  const y2 = target.y - SERVER_HALF_H
  const x = x1 + (x2 - x1) * progress
  const y = y1 + (y2 - y1) * progress

  const syncFromX = client.side === 'left' ? CORRIDOR_LEFT : CORRIDOR_RIGHT
  const syncToX = client.side === 'left' ? CORRIDOR_RIGHT : CORRIDOR_LEFT

  const showBlockedSync =
    (variant === 'partition' || variant === 'overview') &&
    state.partitioned &&
    flight.kind === 'write-ok' &&
    flight.value != null

  const showHealthySync =
    !state.partitioned &&
    flight.kind === 'write-ok' &&
    flight.value != null &&
    (variant === 'partition' || variant === 'overview' || variant === 'consistency')

  const blockedT = Math.min(progress, 0.58)
  const blockedOrbX = syncFromX + (BARRIER_X - syncFromX) * blockedT
  const healthyOrbX = syncFromX + (syncToX - syncFromX) * progress

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={`cap-viz__trail${refused ? ' is-refuse' : ' is-ok'}`}
        markerEnd={`url(#${markerId})`}
      />
      <circle
        cx={x}
        cy={y}
        r={9}
        className={`cap-viz__orb${refused ? ' is-refuse' : ' is-ok'}`}
      />

      {showBlockedSync ? (
        <g className="cap-viz__sync-layer">
          <line
            x1={syncFromX}
            y1={SYNC_Y}
            x2={BARRIER_X}
            y2={SYNC_Y}
            className="cap-viz__trail is-blocked"
          />
          <circle
            cx={blockedOrbX}
            cy={SYNC_Y}
            r={7}
            className="cap-viz__orb is-refuse"
          />
        </g>
      ) : null}

      {showHealthySync ? (
        <g className="cap-viz__sync-layer">
          <line
            x1={CORRIDOR_LEFT}
            y1={SYNC_Y}
            x2={CORRIDOR_RIGHT}
            y2={SYNC_Y}
            className="cap-viz__trail is-ok"
          />
          <circle
            cx={healthyOrbX}
            cy={SYNC_Y}
            r={8}
            className="cap-viz__orb is-ok"
          />
        </g>
      ) : null}
    </g>
  )
}
