import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { CacheAlgo } from '../../types'
import { pickVictim } from '../sim/strategies'
import type { CacheEntry, CacheFlight, CacheSimState } from '../sim/types'
import './CacheViz.css'

const SCALE_MIN = 0.7
const SCALE_MAX = 1.6
const SCALE_STEP = 0.15
const SCALE_DEFAULT = 1

function roundScale(value: number): number {
  return Math.round(value * 100) / 100
}

type Props = {
  state: CacheSimState
  travelMs: number
}

const CLIENT_X = 70
const CACHE_X = 280
const QUEUE_X = 400
const QUEUE_Y = 220
const DB_X = 520
const MID_Y = 130

/**
 * Algorithm-specific cache stages.
 * Each lab makes its decision rule visible (hit/miss path or eviction cue).
 */
export function CacheViz({ state, travelMs }: Props) {
  if (
    state.algo === 'lru' ||
    state.algo === 'lfu' ||
    state.algo === 'fifo' ||
    state.algo === 'ttl'
  ) {
    return <EvictionStage state={state} travelMs={travelMs} />
  }
  return <PatternStage state={state} travelMs={travelMs} />
}

function patternMeta(algo: CacheAlgo): { badge: string; hint: string; idle: string } {
  switch (algo) {
    case 'cache-aside':
      return {
        badge: 'Cache-aside',
        hint: 'App checks the cache. On a miss, the app reads the database, then fills the cache.',
        idle: 'Press Play. Watch hits bounce off the cache; misses go to the database first.',
      }
    case 'read-through':
      return {
        badge: 'Read-through',
        hint: 'The client only talks to the cache. On a miss, the cache loads the database itself.',
        idle: 'Press Play. Misses stop at the cache, then the cache talks to the database.',
      }
    case 'write-through':
      return {
        badge: 'Write-through',
        hint: 'Every write updates the cache and the database before the client gets an ack. This is a write path, not a read miss.',
        idle: 'Press Play. Watch each write land in the cache, push through to the DB, then ack the app.',
      }
    case 'write-behind':
      return {
        badge: 'Write-behind',
        hint: 'Writes land in the cache right away. Dirty keys wait in the pending queue, then flush to the database.',
        idle: 'Press Play. Watch keys pile into the pending queue, then flush to the database.',
      }
    default:
      return {
        badge: 'Cache',
        hint: 'Watch how reads and writes move between client, cache, and database.',
        idle: 'Press Play to start.',
      }
  }
}

function evictionMeta(algo: CacheAlgo): { badge: string; hint: string; idle: string } {
  switch (algo) {
    case 'lru':
      return {
        badge: 'LRU eviction',
        hint: 'When full, remove the entry used least recently (the cold end).',
        idle: 'Press Play. Re-reading a key keeps it; cold keys leave first.',
      }
    case 'lfu':
      return {
        badge: 'LFU eviction',
        hint: 'When full, remove the entry with the lowest access count.',
        idle: 'Press Play. Watch frequency counters decide who leaves.',
      }
    case 'fifo':
      return {
        badge: 'FIFO eviction',
        hint: 'When full, remove the oldest inserted entry. Re-reads do not change insert order.',
        idle: 'Press Play. The first key in is the first key out when capacity fills.',
      }
    case 'ttl':
      return {
        badge: 'TTL expiry',
        hint: 'Each entry has a lifetime. When the timer hits zero, it leaves even without a new insert.',
        idle: 'Press Play. Watch countdowns; expired keys miss on the next read.',
      }
    default:
      return {
        badge: 'Eviction',
        hint: 'Watch how the cache chooses who leaves.',
        idle: 'Press Play to start.',
      }
  }
}

function PatternStage({
  state,
  travelMs,
}: {
  state: CacheSimState
  travelMs: number
}) {
  return (
    <GuidedCacheStage
      state={state}
      travelMs={travelMs}
      meta={patternMeta(state.algo)}
      showPendingQueue={state.algo === 'write-behind'}
    />
  )
}

function EvictionStage({
  state,
  travelMs,
}: {
  state: CacheSimState
  travelMs: number
}) {
  return (
    <GuidedCacheStage
      state={state}
      travelMs={travelMs}
      meta={evictionMeta(state.algo)}
      showEvictionCues
    />
  )
}

/** Shared guided stage: discrete hops, speaker colors, HTML steps. */
function GuidedCacheStage({
  state,
  travelMs,
  meta,
  showEvictionCues = false,
  showPendingQueue = false,
}: {
  state: CacheSimState
  travelMs: number
  meta: { badge: string; hint: string; idle: string }
  showEvictionCues?: boolean
  showPendingQueue?: boolean
}) {
  const flight = state.flight
  const progress = useTrailProgress(flight?.id ?? null, travelMs)
  const beats = flight ? beatsForFlight(flight) : []
  const phase = beats.length > 0 ? phaseFromBeats(beats, progress) : null
  const steps = stepsForFlight(flight, state.algo)
  const victim =
    flight?.evictedKey ??
    (showEvictionCues && state.entries.length >= state.capacity
      ? pickVictim(state.algo, state.entries)?.key ?? null
      : null)

  return (
    <AlgoShell
      state={state}
      flight={flight}
      {...meta}
      footer={
        <>
          <SpeakerLegend />
          <StepsFooter flight={flight} steps={steps} phase={phase} />
        </>
      }
    >
      <svg
        className="cache-viz__svg"
        viewBox="0 0 600 300"
        role="img"
        aria-label={`${meta.badge} caching`}
      >
        <TopologyWires showQueueLane={showPendingQueue} />
        {flight && beats.length > 0 ? (
          <SegmentedFlow beats={beats} progress={progress} label={flight.key} />
        ) : null}
        <ClientNode
          active={phase?.hot === 'client'}
          speaking={phase?.speaker === 'client'}
        />
        <CachePanel
          state={state}
          victimKey={victim}
          showEvictionCues={showEvictionCues}
          resultBadge={phase?.cacheBadge ?? null}
          emphasize={phase?.hot === 'cache'}
          speaking={phase?.speaker === 'cache'}
        />
        {showPendingQueue ? (
          <PendingQueueStage
            keys={
              flight?.pathKind === 'write-behind-flush'
                ? flight.pendingFlushKeys
                : state.pendingWrites
            }
            highlightKey={
              flight?.pathKind === 'write-behind'
                ? flight.key
                : flight?.pathKind === 'write-behind-flush'
                  ? flight.pendingFlushKeys[0] ?? null
                  : null
            }
            flushing={flight?.pathKind === 'write-behind-flush'}
            active={phase?.hot === 'queue'}
          />
        ) : null}
        <DbNode
          state={state}
          active={phase?.hot === 'db'}
          speaking={phase?.speaker === 'db'}
          focusKey={flight?.key ?? null}
          focusValue={flight?.value ?? null}
        />
      </svg>
    </AlgoShell>
  )
}

function StepsFooter({
  flight,
  steps,
  phase,
}: {
  flight: CacheFlight | null
  steps: string[]
  phase: FlowPhase | null
}) {
  return (
    <div className="cache-viz__steps" aria-label="What to watch">
      <p className="cache-viz__steps-title">
        {flight
          ? flight.pathKind === 'write-behind-flush'
            ? 'Flush path'
            : flight.op === 'write'
              ? 'Write path'
              : flight.hit
                ? 'Hit path'
                : 'Miss path'
          : 'What to watch'}
      </p>
      <ol className="cache-viz__steps-list">
        {steps.map((step, index) => {
          const active = phase?.stepIndex === index
          const done = phase != null && phase.stepIndex > index
          return (
            <li
              key={`${index}-${step}`}
              className={`cache-viz__step${active ? ' is-active' : ''}${
                done ? ' is-done' : ''
              }${active && phase ? ` is-speaker-${phase.speaker}` : ''}`}
            >
              <span className="cache-viz__step-num">{index + 1}</span>
              <span className="cache-viz__step-label">{step}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

type NodeId = 'client' | 'cache' | 'db' | 'queue'
type Speaker = 'client' | 'cache' | 'db'

type FlowPhase = {
  stepIndex: number
  hot: NodeId
  speaker: Speaker
  cacheBadge: 'HIT' | 'MISS' | 'FILL' | 'DROP' | 'EVICT' | 'WRITE' | 'ACK' | null
}

type FlowBeat =
  | {
      kind: 'hop'
      from: NodeId
      to: NodeId
      bump: number
      speaker: Speaker
      stepIndex: number
      hot: NodeId
      cacheBadge: FlowPhase['cacheBadge']
    }
  | {
      kind: 'dwell'
      at: NodeId
      speaker: Speaker
      stepIndex: number
      hot: NodeId
      cacheBadge: FlowPhase['cacheBadge']
    }

function stepsForFlight(
  flight: CacheFlight | null,
  algo: CacheAlgo,
): string[] {
  if (!flight) {
    return idleStepsForAlgo(algo)
  }

  if (flight.pathKind === 'read-hit') {
    return [
      `Ask the cache for ${flight.key}`,
      `HIT: cache returns ${flight.key}=${flight.value} to the app`,
    ]
  }

  if (flight.pathKind === 'aside-write') {
    return [
      `App writes ${flight.key}=${flight.value} to the database`,
      'App removes any stale copy from the cache',
    ]
  }

  if (flight.pathKind === 'aside-miss') {
    return [
      `Ask the cache for ${flight.key}`,
      `MISS: ${flight.key} is not in the cache`,
      `App queries the database for ${flight.key}`,
      `Database sends ${flight.key}=${flight.value} back to the app`,
      flight.evictedKey
        ? `App stores it in the cache (evicts ${flight.evictedKey} to make room)`
        : 'App stores that value in the cache for next time',
    ]
  }

  if (flight.pathKind === 'read-through-miss') {
    const storeStep = flight.evictedKey
      ? `Cache stores ${flight.key} (evicts ${flight.evictedKey} to make room)`
      : `Cache stores ${flight.key}=${flight.value}`
    return [
      `App asks the cache for ${flight.key}`,
      `MISS: flow stops at the cache (app does not talk to the DB)`,
      `Cache queries the database for ${flight.key}`,
      `Database sends ${flight.key}=${flight.value} back to the cache`,
      storeStep,
      `Cache returns ${flight.key}=${flight.value} to the app`,
    ]
  }

  if (flight.pathKind === 'write-through') {
    return [
      `App sends WRITE ${flight.key}=${flight.value}`,
      `Cache stores ${flight.key}=${flight.value} (WRITE)`,
      `Write-through: push the same value to the database`,
      `DB now has ${flight.key}=${flight.value}`,
      'Ack returns to the app (only after both stores are updated)',
    ]
  }

  if (flight.pathKind === 'write-behind') {
    return [
      `App writes ${flight.key}=${flight.value} into the cache`,
      `${flight.key} joins the pending queue (DB waits)`,
    ]
  }

  if (flight.pathKind === 'write-behind-flush') {
    return [
      `Flush the pending queue: ${flight.pendingFlushKeys.join(', ') || flight.key}`,
      'Send those keys to the database and clear the queue',
    ]
  }

  return ['Follow the trail']
}

function idleStepsForAlgo(algo: CacheAlgo): string[] {
  switch (algo) {
    case 'cache-aside':
      return [
        'Ask the cache for the key',
        'MISS: key is not in the cache',
        'App queries the database for that key',
        'Database sends the value back to the app',
        'App stores the value in the cache',
      ]
    case 'read-through':
      return [
        'App asks the cache for the key',
        'MISS: flow stops at the cache',
        'Cache queries the database',
        'Database answers the cache',
        'Cache stores the value',
        'Cache returns the value to the app',
      ]
    case 'write-through':
      return [
        'App sends a WRITE (not a read)',
        'Cache stores the new value',
        'The write is pushed through to the database',
        'DB shows the new value',
        'Only then ack the app',
      ]
    case 'write-behind':
      return [
        'App writes into the cache right away',
        'The key joins the pending queue under the stage',
        'A later flush drains the queue into the database',
      ]
    case 'lru':
      return [
        'Fill the small cache with reads',
        'Re-read a key to keep it hot',
        'Insert a new key when full',
        'The coldest (least recently used) key is evicted',
      ]
    case 'lfu':
      return [
        'Fill the small cache with reads',
        'Re-read a key to raise its frequency',
        'Insert a new key when full',
        'The lowest-frequency key is evicted',
      ]
    case 'fifo':
      return [
        'Fill the small cache with reads',
        'Re-reads do not change insert order',
        'Insert a new key when full',
        'The oldest inserted key is evicted',
      ]
    case 'ttl':
      return [
        'Each cached key gets a lifetime countdown',
        'When ttl hits zero, the key expires',
        'The next read misses and reloads from the database',
      ]
    default:
      return ['Follow the trail']
  }
}

function beatsForFlight(flight: CacheFlight): FlowBeat[] {
  const fill: FlowPhase['cacheBadge'] = flight.evictedKey ? 'EVICT' : 'FILL'

  switch (flight.pathKind) {
    case 'read-hit':
      return [
        {
          kind: 'hop',
          from: 'client',
          to: 'cache',
          bump: -40,
          speaker: 'client',
          stepIndex: 0,
          hot: 'cache',
          cacheBadge: 'HIT',
        },
        {
          kind: 'hop',
          from: 'cache',
          to: 'client',
          bump: 40,
          speaker: 'cache',
          stepIndex: 1,
          hot: 'client',
          cacheBadge: 'HIT',
        },
      ]

    case 'aside-miss':
      return [
        {
          kind: 'hop',
          from: 'client',
          to: 'cache',
          bump: -44,
          speaker: 'client',
          stepIndex: 0,
          hot: 'cache',
          cacheBadge: 'MISS',
        },
        {
          kind: 'hop',
          from: 'cache',
          to: 'client',
          bump: 44,
          speaker: 'cache',
          stepIndex: 1,
          hot: 'client',
          cacheBadge: 'MISS',
        },
        {
          kind: 'hop',
          from: 'client',
          to: 'db',
          bump: -52,
          speaker: 'client',
          stepIndex: 2,
          hot: 'db',
          cacheBadge: null,
        },
        {
          kind: 'hop',
          from: 'db',
          to: 'client',
          bump: 52,
          speaker: 'db',
          stepIndex: 3,
          hot: 'client',
          cacheBadge: null,
        },
        {
          kind: 'hop',
          from: 'client',
          to: 'cache',
          bump: -36,
          speaker: 'client',
          stepIndex: 4,
          hot: 'cache',
          cacheBadge: fill,
        },
      ]

    case 'aside-write':
      return [
        {
          kind: 'hop',
          from: 'client',
          to: 'db',
          bump: 48,
          speaker: 'client',
          stepIndex: 0,
          hot: 'db',
          cacheBadge: null,
        },
        {
          kind: 'hop',
          from: 'db',
          to: 'client',
          bump: -48,
          speaker: 'db',
          stepIndex: 0,
          hot: 'client',
          cacheBadge: null,
        },
        {
          kind: 'hop',
          from: 'client',
          to: 'cache',
          bump: 36,
          speaker: 'client',
          stepIndex: 1,
          hot: 'cache',
          cacheBadge: 'DROP',
        },
      ]

    case 'read-through-miss':
      // Break at the cache: app stops, then cache owns the DB round trip.
      return [
        {
          kind: 'hop',
          from: 'client',
          to: 'cache',
          bump: -40,
          speaker: 'client',
          stepIndex: 0,
          hot: 'cache',
          cacheBadge: 'MISS',
        },
        {
          kind: 'dwell',
          at: 'cache',
          speaker: 'cache',
          stepIndex: 1,
          hot: 'cache',
          cacheBadge: 'MISS',
        },
        {
          kind: 'hop',
          from: 'cache',
          to: 'db',
          bump: 46,
          speaker: 'cache',
          stepIndex: 2,
          hot: 'db',
          cacheBadge: 'MISS',
        },
        {
          kind: 'hop',
          from: 'db',
          to: 'cache',
          bump: -46,
          speaker: 'db',
          stepIndex: 3,
          hot: 'cache',
          cacheBadge: null,
        },
        {
          kind: 'dwell',
          at: 'cache',
          speaker: 'cache',
          stepIndex: 4,
          hot: 'cache',
          cacheBadge: fill,
        },
        {
          kind: 'hop',
          from: 'cache',
          to: 'client',
          bump: 40,
          speaker: 'cache',
          stepIndex: 5,
          hot: 'client',
          cacheBadge: null,
        },
      ]

    case 'write-through':
      // Write path: push to cache, push to DB, then ack. Not a read-miss load.
      return [
        {
          kind: 'hop',
          from: 'client',
          to: 'cache',
          bump: 36,
          speaker: 'client',
          stepIndex: 0,
          hot: 'cache',
          cacheBadge: 'WRITE',
        },
        {
          kind: 'dwell',
          at: 'cache',
          speaker: 'cache',
          stepIndex: 1,
          hot: 'cache',
          cacheBadge: flight.evictedKey ? 'EVICT' : 'WRITE',
        },
        {
          kind: 'hop',
          from: 'cache',
          to: 'db',
          bump: -40,
          speaker: 'cache',
          stepIndex: 2,
          hot: 'db',
          cacheBadge: 'WRITE',
        },
        {
          kind: 'dwell',
          at: 'db',
          speaker: 'db',
          stepIndex: 3,
          hot: 'db',
          cacheBadge: null,
        },
        {
          kind: 'hop',
          from: 'db',
          to: 'client',
          bump: 48,
          speaker: 'db',
          stepIndex: 4,
          hot: 'client',
          cacheBadge: 'ACK',
        },
      ]

    case 'write-behind':
      return [
        {
          kind: 'hop',
          from: 'client',
          to: 'cache',
          bump: -30,
          speaker: 'client',
          stepIndex: 0,
          hot: 'cache',
          cacheBadge: fill,
        },
        {
          kind: 'hop',
          from: 'cache',
          to: 'queue',
          bump: 20,
          speaker: 'cache',
          stepIndex: 1,
          hot: 'queue',
          cacheBadge: 'FILL',
        },
      ]

    case 'write-behind-flush':
      return [
        {
          kind: 'dwell',
          at: 'queue',
          speaker: 'cache',
          stepIndex: 0,
          hot: 'queue',
          cacheBadge: null,
        },
        {
          kind: 'hop',
          from: 'queue',
          to: 'db',
          bump: -24,
          speaker: 'cache',
          stepIndex: 1,
          hot: 'db',
          cacheBadge: null,
        },
      ]

    default:
      return [
        {
          kind: 'hop',
          from: 'client',
          to: 'cache',
          bump: -30,
          speaker: 'client',
          stepIndex: 0,
          hot: 'cache',
          cacheBadge: null,
        },
      ]
  }
}

function phaseFromBeats(beats: FlowBeat[], progress: number): FlowPhase {
  if (beats.length === 0) {
    return { stepIndex: 0, hot: 'client', speaker: 'client', cacheBadge: null }
  }
  const t = Math.min(1, Math.max(0, progress))
  const raw = t * beats.length
  const index = Math.min(beats.length - 1, Math.floor(raw))
  const beat = beats[index]!
  return {
    stepIndex: beat.stepIndex,
    hot: beat.hot,
    speaker: beat.speaker,
    cacheBadge: beat.cacheBadge,
  }
}

function SpeakerLegend() {
  return (
    <div className="cache-viz__legend" aria-label="Who is talking">
      <span className="cache-viz__legend-title">Who is talking</span>
      <span className="cache-viz__legend-chip is-client">App</span>
      <span className="cache-viz__legend-chip is-cache">Cache</span>
      <span className="cache-viz__legend-chip is-db">DB</span>
    </div>
  )
}

function AlgoShell({
  state,
  flight,
  badge,
  hint,
  idle,
  children,
  footer = null,
}: {
  state: CacheSimState
  flight: CacheFlight | null
  badge: string
  hint: string
  idle: string
  children: ReactNode
  footer?: ReactNode
}) {
  const [scale, setScale] = useState(SCALE_DEFAULT)

  return (
    <div
      className="cache-viz"
      style={{ ['--viz-scale' as string]: String(scale) }}
    >
      <div className="cache-viz__algo-banner">
        <div className="cache-viz__algo-head">
          <span className="cache-viz__algo-badge">{badge}</span>
          <div className="cache-viz__zoom" role="group" aria-label="Visualization size">
            <button
              type="button"
              className="cache-viz__zoom-btn"
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
              className="cache-viz__zoom-btn"
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
        <p className="cache-viz__algo-hint">{hint}</p>
      </div>
      <div className="cache-viz__scene">
        <div className="cache-viz__viewport">
          <div className="cache-viz__canvas">{children}</div>
        </div>
      </div>
      {footer}
      <p className="cache-viz__story" aria-live="polite">
        {state.finished ? (
          <>
            Burst complete:{' '}
            <span className="cache-viz__stat-hit">{state.hits} hits</span>,{' '}
            <span className="cache-viz__stat-miss">{state.misses} misses</span>.
            Hit Replay to watch again.
          </>
        ) : flight ? (
          <>{flight.reason}</>
        ) : state.arrivalsCount === 0 ? (
          <>{idle}</>
        ) : (
          <>
            Ops {state.arrivalsCount}/{state.maxArrivals}.{' '}
            <span className="cache-viz__stat-hit">{state.hits} hits</span>,{' '}
            <span className="cache-viz__stat-miss">{state.misses} misses</span>.
          </>
        )}
      </p>
    </div>
  )
}

function TopologyWires({ showQueueLane = false }: { showQueueLane?: boolean }) {
  return (
    <g className="cache-viz__wires">
      <line
        x1={CLIENT_X}
        y1={MID_Y}
        x2={CACHE_X - 70}
        y2={MID_Y}
        className="cache-viz__wire"
      />
      {showQueueLane ? (
        <>
          <line
            x1={CACHE_X + 70}
            y1={MID_Y}
            x2={QUEUE_X - 54}
            y2={QUEUE_Y}
            className="cache-viz__wire"
          />
          <line
            x1={QUEUE_X + 54}
            y1={QUEUE_Y}
            x2={DB_X}
            y2={MID_Y}
            className="cache-viz__wire"
          />
        </>
      ) : (
        <line
          x1={CACHE_X + 70}
          y1={MID_Y}
          x2={DB_X}
          y2={MID_Y}
          className="cache-viz__wire"
        />
      )}
    </g>
  )
}

function ClientNode({
  active,
  speaking,
}: {
  active: boolean
  speaking: boolean
}) {
  return (
    <g transform={`translate(${CLIENT_X}, ${MID_Y})`}>
      <circle
        r={22}
        className={`cache-viz__node is-client${active ? ' is-active' : ''}${
          speaking ? ' is-speaking' : ''
        }`}
      />
      <text className="cache-viz__node-label" textAnchor="middle" dy="0.35em">
        App
      </text>
      <text className="cache-viz__caption" textAnchor="middle" y={36}>
        client
      </text>
    </g>
  )
}

function DbNode({
  state,
  active,
  speaking,
  focusKey = null,
  focusValue = null,
}: {
  state: CacheSimState
  active: boolean
  speaking: boolean
  focusKey?: string | null
  focusValue?: string | null
}) {
  void state
  return (
    <g transform={`translate(${DB_X}, ${MID_Y})`}>
      <rect
        x={-48}
        y={-40}
        width={96}
        height={80}
        rx={8}
        className={`cache-viz__db${active ? ' is-active' : ''}${
          speaking ? ' is-speaking' : ''
        }`}
      />
      <text className="cache-viz__db-title" textAnchor="middle" y={-16}>
        DB
      </text>
      {focusKey ? (
        <>
          <text className="cache-viz__db-focus-key" textAnchor="middle" y={8}>
            {focusKey}
          </text>
          <text className="cache-viz__db-focus-val" textAnchor="middle" y={26}>
            = {focusValue ?? '?'}
          </text>
        </>
      ) : (
        <text className="cache-viz__db-idle" textAnchor="middle" y={14}>
          durable store
        </text>
      )}
    </g>
  )
}

function CachePanel({
  state,
  victimKey = null,
  showEvictionCues = false,
  resultBadge = null,
  emphasize = false,
  speaking = false,
}: {
  state: CacheSimState
  victimKey?: string | null
  showEvictionCues?: boolean
  resultBadge?: 'HIT' | 'MISS' | 'FILL' | 'DROP' | 'EVICT' | 'WRITE' | 'ACK' | null
  emphasize?: boolean
  speaking?: boolean
}) {
  const slots = Array.from({ length: state.capacity }, (_, i) => state.entries[i] ?? null)
  const slotW = 52
  const gap = 8
  const totalW = state.capacity * slotW + (state.capacity - 1) * gap
  const startX = -totalW / 2
  const focusKey = state.flight?.key ?? null

  return (
    <g
      transform={`translate(${CACHE_X}, ${MID_Y})`}
      className={`cache-viz__cache-panel${emphasize ? ' is-hot' : ''}${
        speaking ? ' is-speaking' : ''
      }`}
    >
      <text className="cache-viz__cache-title" textAnchor="middle" y={-72}>
        cache ({state.entries.length}/{state.capacity})
      </text>
      {resultBadge ? (
        <text
          className={`cache-viz__result-badge cache-viz__result-badge--${resultBadge.toLowerCase()}`}
          textAnchor="middle"
          y={-56}
        >
          {resultBadge}
        </text>
      ) : null}
      {slots.map((entry, index) => {
        const x = startX + index * (slotW + gap)
        const focused = entry?.key === focusKey
        const hitMissClass =
          focused && resultBadge === 'HIT'
            ? ' is-hit'
            : focused && resultBadge === 'MISS'
              ? ' is-miss'
              : focused && (resultBadge === 'WRITE' || resultBadge === 'ACK')
                ? ' is-write'
                : focused
                  ? ' is-active'
                  : ''
        return (
          <CacheSlot
            key={`slot-${index}`}
            x={x}
            width={slotW}
            entry={entry}
            algo={state.algo}
            tick={state.tick}
            focusClass={hitMissClass}
            victim={entry != null && entry.key === victimKey}
            showEvictionCues={showEvictionCues}
          />
        )
      })}
    </g>
  )
}

function CacheSlot({
  x,
  width,
  entry,
  algo,
  tick,
  focusClass,
  victim,
  showEvictionCues,
}: {
  x: number
  width: number
  entry: CacheEntry | null
  algo: CacheAlgo
  tick: number
  focusClass: string
  victim: boolean
  showEvictionCues: boolean
}) {
  const h = 56
  return (
    <g transform={`translate(${x}, ${-h / 2})`}>
      <rect
        x={0}
        y={0}
        width={width}
        height={h}
        rx={6}
        className={`cache-viz__slot${focusClass}${
          victim ? ' is-victim' : ''
        }${!entry ? ' is-empty' : ''}`}
      />
      {entry ? (
        <>
          <text className="cache-viz__slot-key" textAnchor="middle" x={width / 2} y={18}>
            {entry.key}
          </text>
          <text className="cache-viz__slot-val" textAnchor="middle" x={width / 2} y={34}>
            {entry.value}
          </text>
          {showEvictionCues && algo === 'lfu' ? (
            <text className="cache-viz__slot-meta" textAnchor="middle" x={width / 2} y={48}>
              f={entry.freq}
            </text>
          ) : null}
          {showEvictionCues && algo === 'lru' ? (
            <text className="cache-viz__slot-meta" textAnchor="middle" x={width / 2} y={48}>
              t={entry.lastUsed}
            </text>
          ) : null}
          {showEvictionCues && algo === 'fifo' ? (
            <text className="cache-viz__slot-meta" textAnchor="middle" x={width / 2} y={48}>
              in={entry.insertedAt}
            </text>
          ) : null}
          {showEvictionCues && algo === 'ttl' && entry.expiresAt != null ? (
            <text className="cache-viz__slot-meta" textAnchor="middle" x={width / 2} y={48}>
              ttl {Math.max(0, entry.expiresAt - tick)}
            </text>
          ) : null}
        </>
      ) : (
        <text className="cache-viz__slot-empty" textAnchor="middle" x={width / 2} y={32}>
          ·
        </text>
      )}
    </g>
  )
}

function PendingQueueStage({
  keys,
  highlightKey,
  flushing,
  active,
}: {
  keys: string[]
  highlightKey: string | null
  flushing: boolean
  active: boolean
}) {
  const slotW = 28
  const gap = 6
  const maxSlots = 5
  const shown = keys.slice(0, maxSlots)
  const overflow = keys.length - shown.length
  const totalW = Math.max(1, maxSlots) * slotW + (maxSlots - 1) * gap
  const startX = -totalW / 2
  const boxW = totalW + 24
  const boxH = 58

  return (
    <g
      transform={`translate(${QUEUE_X}, ${QUEUE_Y})`}
      className={`cache-viz__queue-panel${active ? ' is-active' : ''}${
        flushing ? ' is-flushing' : ''
      }`}
    >
      <rect
        x={-boxW / 2}
        y={-boxH / 2}
        width={boxW}
        height={boxH}
        rx={8}
        className="cache-viz__queue-box"
      />
      <text className="cache-viz__queue-title" textAnchor="middle" y={-38}>
        pending queue
      </text>
      <text className="cache-viz__queue-caption" textAnchor="middle" y={42}>
        {flushing
          ? 'flushing → DB'
          : keys.length === 0
            ? 'empty · waits for writes'
            : `${keys.length} waiting for DB`}
      </text>
      {shown.length === 0 ? (
        <text className="cache-viz__queue-empty-label" textAnchor="middle" y={5}>
          (empty)
        </text>
      ) : (
        shown.map((key, index) => {
          const x = startX + index * (slotW + gap)
          const isNew = key === highlightKey && index === shown.length - 1
          const isHead = index === 0 && flushing
          return (
            <g key={`${key}-${index}`} transform={`translate(${x}, ${-14})`}>
              <rect
                width={slotW}
                height={28}
                rx={5}
                className={`cache-viz__queue-slot${isNew ? ' is-new' : ''}${
                  isHead ? ' is-head' : ''
                }`}
              />
              <text
                className="cache-viz__queue-slot-text"
                textAnchor="middle"
                x={slotW / 2}
                y={18}
              >
                {key}
              </text>
            </g>
          )
        })
      )}
      {overflow > 0 ? (
        <text className="cache-viz__queue-overflow" textAnchor="middle" y={5} x={boxW / 2 - 8}>
          +{overflow}
        </text>
      ) : null}
    </g>
  )
}

function nodePoint(id: NodeId): { x: number; y: number } {
  switch (id) {
    case 'client':
      return { x: CLIENT_X, y: MID_Y }
    case 'cache':
      return { x: CACHE_X, y: MID_Y }
    case 'queue':
      return { x: QUEUE_X, y: QUEUE_Y }
    case 'db':
      return { x: DB_X, y: MID_Y }
  }
}

/** One discrete hop path (never chained into a continuous multi-leg path). */
function hopPath(from: NodeId, to: NodeId, bump: number): string {
  const a = nodePoint(from)
  const b = nodePoint(to)
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2 + bump
  return `M ${a.x} ${a.y} Q ${mx} ${my}, ${b.x} ${b.y}`
}

/**
 * Animate one beat at a time so miss paths visibly break at the cache
 * instead of drawing one continuous App→Cache→DB trail.
 */
function SegmentedFlow({
  beats,
  progress,
  label,
}: {
  beats: FlowBeat[]
  progress: number
  label: string
}) {
  const measureRef = useRef<SVGPathElement | null>(null)
  const t = Math.min(1, Math.max(0, progress))
  const raw = t * Math.max(1, beats.length)
  const index = Math.min(beats.length - 1, Math.floor(raw))
  const local = Math.min(1, Math.max(0, raw - index))
  const beat = beats[index]!
  const revealed = beat.kind === 'hop' ? easeInOut(local) : 1

  const currentPath =
    beat.kind === 'hop' ? hopPath(beat.from, beat.to, beat.bump) : null
  const tipDefault = nodePoint(beat.kind === 'hop' ? beat.from : beat.at)
  const [tip, setTip] = useState(tipDefault)

  useLayoutEffect(() => {
    if (beat.kind === 'dwell') {
      setTip(nodePoint(beat.at))
      return
    }
    const path = measureRef.current
    if (!path || !currentPath) {
      setTip(nodePoint(beat.to))
      return
    }
    const length = path.getTotalLength()
    if (length <= 0) return
    const point = path.getPointAtLength(length * revealed)
    setTip({ x: point.x, y: point.y })
  }, [beat, currentPath, revealed])

  return (
    <g className="cache-viz__flow">
      {beats.map((past, i) => {
        if (i >= index || past.kind !== 'hop') return null
        return (
          <path
            key={`done-${i}`}
            d={hopPath(past.from, past.to, past.bump)}
            className={`cache-viz__route-done is-${past.speaker}`}
          />
        )
      })}
      {currentPath ? (
        <>
          <path ref={measureRef} d={currentPath} className="cache-viz__measure" />
          <path
            d={currentPath}
            className={`cache-viz__route-ghost is-${beat.speaker}`}
          />
          <path
            d={currentPath}
            pathLength={1}
            className={`cache-viz__route-trail is-${beat.speaker}`}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: 1 - revealed,
            }}
          />
        </>
      ) : null}
      <g
        className={`cache-viz__rider is-${beat.speaker}${
          beat.kind === 'dwell' ? ' is-dwell' : ''
        }`}
        transform={`translate(${tip.x}, ${tip.y})`}
      >
        <circle r={12} className="cache-viz__rider-glow" />
        <circle r={8} className="cache-viz__rider-core" />
        <text className="cache-viz__rider-label" textAnchor="middle" dy="0.35em">
          {label.slice(0, 2)}
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
      const next = Math.min(1, (now - started) / Math.max(1, travelMs))
      setProgress(next)
      if (next < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [flightId, travelMs])

  return progress
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}
