import { useEffect, useState, type ReactNode } from 'react'
import type { NetworkAlgo } from '../../types'
import type { NetworkFlight, NetworkSimState } from '../sim/types'
import './NetworkViz.css'

const SCALE_MIN = 0.7
const SCALE_MAX = 1.6
const SCALE_STEP = 0.15
const SCALE_DEFAULT = 1

const VIEW_W = 920
const VIEW_H = 420

function roundScale(value: number): number {
  return Math.round(value * 100) / 100
}

type Props = {
  state: NetworkSimState
  travelMs: number
}

export function NetworkViz({ state, travelMs }: Props) {
  switch (state.algo) {
    case 'http-basics':
    case 'rest-design':
      return <HttpRestStage state={state} travelMs={travelMs} />
    case 'http2':
      return <Http2Stage state={state} travelMs={travelMs} />
    case 'grpc':
      return <GrpcStage state={state} travelMs={travelMs} />
    case 'realtime':
      return <RealtimeStage state={state} travelMs={travelMs} />
    case 'gateway':
      return <GatewayStage state={state} travelMs={travelMs} />
    case 'rate-limit':
      return <RateLimitStage state={state} travelMs={travelMs} />
    case 'retries':
      return <RetriesStage state={state} travelMs={travelMs} />
    case 'circuit-breaker':
      return <BreakerStage state={state} travelMs={travelMs} />
    case 'bulkhead':
      return <BulkheadStage state={state} travelMs={travelMs} />
    default: {
      const _exhaustive: never = state.algo
      return _exhaustive
    }
  }
}

function NetworkShell({
  state,
  badge,
  idle,
  focusHint,
  status,
  children,
}: {
  state: NetworkSimState
  badge: string
  idle: string
  focusHint: string
  status: ReactNode
  children: ReactNode
}) {
  const [scale, setScale] = useState(SCALE_DEFAULT)
  const flight = state.flight

  return (
    <div
      className={`network-viz is-${state.algo}`}
      style={{ ['--viz-scale' as string]: String(scale) }}
    >
      <div className="network-viz__toolbar">
        <div className="network-viz__meta">
          <span className="network-viz__badge">{badge}</span>
          <span className="network-viz__focus-hint">{focusHint}</span>
        </div>
        <div className="network-viz__zoom" role="group" aria-label="Visualization size">
          <button
            type="button"
            className="network-viz__zoom-btn"
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
            className="network-viz__zoom-btn"
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
      <p className="network-viz__hint">{flight ? flight.reason : idle}</p>
      <div className="network-viz__status" aria-label="Network status">
        {status}
      </div>
      {children}
      <p className="network-viz__caption">{state.caption}</p>
    </div>
  )
}

function ActorCard({
  x,
  y,
  w,
  h,
  title,
  sub,
  value,
  focus,
  warn,
}: {
  x: number
  y: number
  w: number
  h: number
  title: string
  sub?: string
  value?: string
  focus?: boolean
  warn?: boolean
}) {
  return (
    <foreignObject x={x - w / 2} y={y - h / 2} width={w} height={h}>
      <div
        className={`network-viz__card${focus ? ' is-focus' : ''}${warn ? ' is-warn' : ''}`}
      >
        <span className="network-viz__card-label">{title}</span>
        {sub ? <span className="network-viz__card-sub">{sub}</span> : null}
        {value ? <span className="network-viz__card-value">{value}</span> : null}
      </div>
    </foreignObject>
  )
}

function FlightOrb({
  flight,
  travelMs,
  from,
  to,
}: {
  flight: NetworkFlight | null
  travelMs: number
  from: { x: number; y: number }
  to: { x: number; y: number }
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!flight) {
      setProgress(0)
      return
    }
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
  }, [flight?.id, travelMs, flight])

  if (!flight) return null
  const x = from.x + (to.x - from.x) * progress
  const y = from.y + (to.y - from.y) * progress
  const warn = flight.outcome === 'error'
  const reply = flight.kind === 'response' || flight.kind === 'refuse'
  const toneClass = warn
    ? ' is-warn'
    : reply
      ? ' is-reply'
      : flight.outcome === 'info'
        ? ' is-info'
        : flight.kind === 'request'
          ? ' is-request'
          : ''
  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        className={`network-viz__trail${toneClass}`}
      />
      <circle cx={x} cy={y} r={7} className={`network-viz__orb${toneClass}`} />
    </g>
  )
}

function chip(text: string, tone: 'ok' | 'warn' | 'neutral' = 'neutral') {
  return (
    <span className={`network-viz__chip${tone === 'neutral' ? '' : ` is-${tone}`}`}>
      {text}
    </span>
  )
}

function HttpRestStage({ state, travelMs }: Props) {
  const rest = state.algo === 'rest-design'
  const clientPoint = { x: 260, y: 200 }
  const apiPoint = { x: 650, y: 200 }
  const reply =
    state.flight?.kind === 'response' || state.flight?.kind === 'refuse'
  const flightFrom = reply ? apiPoint : clientPoint
  const flightTo = reply ? clientPoint : apiPoint
  const phaseLabel =
    state.flight == null
      ? 'idle'
      : reply
        ? 'response → client'
        : 'request → server'

  return (
    <NetworkShell
      state={state}
      badge={rest ? 'REST' : 'HTTP'}
      idle={
        rest
          ? 'Watch idempotent retries, pagination cursors, and versioned paths.'
          : 'Watch the request go out (teal), then the response come back (blue).'
      }
      focusHint={rest ? 'Contracts' : 'Request out, response back'}
      status={
        <>
          {chip(phaseLabel, reply ? 'ok' : 'neutral')}
          {chip(state.lastMethod ?? 'method')}
          {chip(state.lastPath ?? 'path')}
          {chip(
            state.lastStatus != null ? String(state.lastStatus) : '…',
            state.lastStatus != null && state.lastStatus >= 400 ? 'warn' : 'ok',
          )}
          {rest ? chip(`ids: ${state.createdIds.join(', ') || '—'}`) : null}
          {rest ? chip(`cursor: ${state.cursor ?? 'none'}`) : null}
          {rest ? chip(`api ${state.apiVersion}`) : null}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${state.algo} visualization`}
        >
          <rect x={40} y={40} width={840} height={340} rx={12} className="network-viz__zone" />
          <text x={460} y={68} textAnchor="middle" className="network-viz__title">
            {rest ? 'REST contract demo' : 'HTTP request / response'}
          </text>
          <ActorCard
            x={180}
            y={210}
            w={140}
            h={88}
            title="Client"
            sub="your app"
            value={
              reply && state.lastStatus != null
                ? String(state.lastStatus)
                : state.lastMethod ?? '—'
            }
            focus={state.flight?.to === 'Client' || state.flight?.from === 'Client'}
            warn={reply && state.lastStatus != null && state.lastStatus >= 400}
          />
          <ActorCard
            x={740}
            y={210}
            w={150}
            h={100}
            title="Server"
            sub={rest ? `version ${state.apiVersion}` : 'API'}
            value={
              state.flight?.kind === 'request'
                ? state.lastPath ?? '…'
                : state.lastStatus != null
                  ? String(state.lastStatus)
                  : '—'
            }
            focus={state.flight?.to === 'API' || state.flight?.from === 'API'}
            warn={state.lastStatus != null && state.lastStatus >= 400 && reply}
          />
          <line
            x1={260}
            y1={188}
            x2={650}
            y2={188}
            className="network-viz__pipe network-viz__pipe--request"
          />
          <line
            x1={260}
            y1={222}
            x2={650}
            y2={222}
            className="network-viz__pipe network-viz__pipe--reply"
          />
          <text x={460} y={178} textAnchor="middle" className="network-viz__lane is-request">
            request →
          </text>
          <text x={460} y={248} textAnchor="middle" className="network-viz__lane is-reply">
            ← response
          </text>
          <FlightOrb
            flight={state.flight}
            travelMs={travelMs}
            from={{ x: flightFrom.x, y: reply ? 222 : 188 }}
            to={{ x: flightTo.x, y: reply ? 222 : 188 }}
          />
          {rest ? (
            <text x={460} y={320} textAnchor="middle" className="network-viz__list-text">
              resources: {state.createdIds.length ? state.createdIds.join(', ') : '(none yet)'}
            </text>
          ) : null}
        </svg>
      </div>
    </NetworkShell>
  )
}

function Http2Stage({ state, travelMs }: Props) {
  return (
    <NetworkShell
      state={state}
      badge={state.protocol === 'http1' ? 'HTTP/1.1' : 'HTTP/2'}
      idle="HTTP/1.1 queues on one connection. HTTP/2 multiplexes streams."
      focusHint="Head-of-line vs multiplex"
      status={
        <>
          {chip(state.protocol === 'http1' ? 'serial' : 'multiplex', 'ok')}
          {chip(`queue: ${state.queued.join(',') || '—'}`)}
          {chip(`active: ${state.activeStreams.join(',') || '—'}`)}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="HTTP version visualization"
        >
          <rect x={40} y={40} width={840} height={340} rx={12} className="network-viz__zone" />
          <text x={460} y={68} textAnchor="middle" className="network-viz__title">
            One TCP connection
          </text>
          <ActorCard x={150} y={200} w={120} h={80} title="Client" />
          <ActorCard x={770} y={200} w={120} h={80} title="Server" />
          <line
            x1={220}
            y1={200}
            x2={700}
            y2={200}
            className={`network-viz__pipe${state.protocol === 'http2' ? ' is-live' : ''}`}
          />
          {state.protocol === 'http2'
            ? state.activeStreams.map((label, index) => {
                const y = 150 + index * 36
                return (
                  <g key={label}>
                    <path
                      d={`M 230 ${y} C 400 ${y - 20}, 520 ${y + 20}, 690 ${y}`}
                      className="network-viz__stream"
                    />
                    <text x={460} y={y - 8} textAnchor="middle" className="network-viz__list-text">
                      stream {label}
                    </text>
                  </g>
                )
              })
            : state.activeStreams[0]
              ? (
                  <text x={460} y={180} textAnchor="middle" className="network-viz__list-text">
                    sending {state.activeStreams[0]}
                  </text>
                )
              : (
                  <text x={460} y={180} textAnchor="middle" className="network-viz__list-text">
                    waiting…
                  </text>
                )}
          <text x={460} y={330} textAnchor="middle" className="network-viz__list-text">
            queued: {state.queued.join(', ') || '(empty)'}
          </text>
          <FlightOrb
            flight={state.flight}
            travelMs={travelMs}
            from={{ x: 220, y: 200 }}
            to={{ x: 700, y: 200 }}
          />
        </svg>
      </div>
    </NetworkShell>
  )
}

function GrpcStage({ state, travelMs }: Props) {
  const rpc = state.flight?.to === 'gRPC stub'
  return (
    <NetworkShell
      state={state}
      badge="gRPC"
      idle="Compare a verbose REST call with a typed gRPC stub call."
      focusHint="REST JSON vs RPC frame"
      status={
        <>
          {chip(rpc ? 'binary RPC' : 'JSON HTTP', rpc ? 'ok' : 'neutral')}
          {chip(state.lastPath ?? 'call')}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="gRPC visualization"
        >
          <rect x={40} y={40} width={840} height={340} rx={12} className="network-viz__zone" />
          <ActorCard x={160} y={210} w={130} h={88} title="Client" sub="app code" />
          <ActorCard
            x={460}
            y={140}
            w={180}
            h={90}
            title="REST"
            sub="text JSON"
            value={state.flight?.kind === 'request' && !rpc ? state.flight.label : '—'}
            focus={!rpc && !!state.flight}
          />
          <ActorCard
            x={460}
            y={280}
            w={180}
            h={90}
            title="gRPC stub"
            sub="compact frame"
            value={rpc ? state.flight?.label ?? '—' : '—'}
            focus={rpc}
          />
          <ActorCard x={760} y={210} w={130} h={88} title="Service" sub="handler" />
          <FlightOrb
            flight={state.flight}
            travelMs={travelMs}
            from={{ x: 230, y: 210 }}
            to={{ x: 680, y: 210 }}
          />
        </svg>
      </div>
    </NetworkShell>
  )
}

function RealtimeStage({ state, travelMs }: Props) {
  return (
    <NetworkShell
      state={state}
      badge={state.channel === 'websocket' ? 'WebSocket' : 'Long poll'}
      idle="Long poll holds a request. WebSocket keeps a duplex channel."
      focusHint="Hold-and-reply vs push"
      status={
        <>
          {chip(state.channel)}
          {chip(state.heldRequest ? 'holding' : 'idle', state.heldRequest ? 'warn' : 'neutral')}
          {chip(`events: ${state.pushEvents.join(', ') || '—'}`)}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Realtime visualization"
        >
          <rect x={40} y={40} width={840} height={340} rx={12} className="network-viz__zone" />
          <ActorCard
            x={180}
            y={210}
            w={140}
            h={90}
            title="Client"
            value={state.heldRequest ? 'waiting…' : 'ready'}
            focus={state.heldRequest}
          />
          <ActorCard
            x={740}
            y={210}
            w={140}
            h={90}
            title="API"
            sub={state.channel}
            value={state.pushEvents[state.pushEvents.length - 1] ?? '—'}
            focus={state.flight?.from === 'API'}
          />
          <line
            x1={260}
            y1={210}
            x2={660}
            y2={210}
            className={`network-viz__pipe${state.channel !== 'idle' ? ' is-live' : ''}`}
          />
          <FlightOrb
            flight={state.flight}
            travelMs={travelMs}
            from={
              state.flight?.from === 'API'
                ? { x: 660, y: 210 }
                : { x: 260, y: 210 }
            }
            to={
              state.flight?.from === 'API'
                ? { x: 260, y: 210 }
                : { x: 660, y: 210 }
            }
          />
        </svg>
      </div>
    </NetworkShell>
  )
}

function GatewayStage({ state, travelMs }: Props) {
  return (
    <NetworkShell
      state={state}
      badge="Gateway"
      idle="Auth at the edge, then route by path to the right service."
      focusHint="Auth + routing"
      status={
        <>
          {chip(state.authOk ? 'auth ok' : 'auth deny', state.authOk ? 'ok' : 'warn')}
          {chip(state.routeTarget ? `→ ${state.routeTarget}` : 'no route')}
          {chip(state.lastPath ?? 'path')}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="API gateway visualization"
        >
          <rect x={40} y={40} width={840} height={340} rx={12} className="network-viz__zone" />
          <ActorCard x={140} y={210} w={120} h={80} title="Client" />
          <ActorCard
            x={400}
            y={210}
            w={150}
            h={100}
            title="API Gateway"
            sub="auth + route"
            value={state.lastStatus === 401 ? '401' : state.routeTarget ?? '…'}
            focus={!!state.flight}
            warn={!state.authOk}
          />
          <ActorCard
            x={720}
            y={140}
            w={130}
            h={80}
            title="Orders"
            focus={state.routeTarget === 'Orders'}
          />
          <ActorCard
            x={720}
            y={280}
            w={130}
            h={80}
            title="Users"
            focus={state.routeTarget === 'Users'}
          />
          <FlightOrb
            flight={state.flight}
            travelMs={travelMs}
            from={{ x: 210, y: 210 }}
            to={
              state.flight?.kind === 'route'
                ? state.routeTarget === 'Users'
                  ? { x: 650, y: 280 }
                  : { x: 650, y: 140 }
                : { x: 320, y: 210 }
            }
          />
        </svg>
      </div>
    </NetworkShell>
  )
}

function RateLimitStage({ state, travelMs }: Props) {
  const fillH = (state.tokens / Math.max(1, state.tokenCapacity)) * 100
  return (
    <NetworkShell
      state={state}
      badge="Rate limit"
      idle="Spend tokens on each request. Empty bucket returns 429."
      focusHint="Token bucket"
      status={
        <>
          {chip(`tokens ${state.tokens}/${state.tokenCapacity}`, state.tokens === 0 ? 'warn' : 'ok')}
          {chip(state.lastStatus === 429 ? '429' : 'allow', state.lastStatus === 429 ? 'warn' : 'ok')}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Rate limit visualization"
        >
          <rect x={40} y={40} width={840} height={340} rx={12} className="network-viz__zone" />
          <ActorCard x={160} y={210} w={120} h={80} title="Client" />
          <rect x={400} y={120} width={120} height={180} rx={10} className="network-viz__bucket" />
          <rect
            x={410}
            y={120 + (180 - 20) - fillH * 1.4}
            width={100}
            height={Math.max(4, fillH * 1.4)}
            rx={6}
            className="network-viz__bucket-fill"
          />
          <text x={460} y={330} textAnchor="middle" className="network-viz__meter-label">
            bucket {state.tokens}/{state.tokenCapacity}
          </text>
          <ActorCard
            x={740}
            y={210}
            w={120}
            h={80}
            title="API"
            value={state.lastStatus === 429 ? '429' : '200'}
            warn={state.lastStatus === 429}
          />
          <FlightOrb
            flight={state.flight}
            travelMs={travelMs}
            from={{ x: 230, y: 210 }}
            to={{ x: 670, y: 210 }}
          />
        </svg>
      </div>
    </NetworkShell>
  )
}

function RetriesStage({ state, travelMs }: Props) {
  return (
    <NetworkShell
      state={state}
      badge="Retries"
      idle="Timeouts stop slow calls. Backoff spaces retries before success."
      focusHint="Timeout + backoff"
      status={
        <>
          {chip(`attempt ${state.attempt}/${state.maxAttempts}`)}
          {chip(state.backoffLabel ? `backoff ${state.backoffLabel}` : 'no wait')}
          {chip(`${state.okCount} ok / ${state.errorCount} fail`)}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Retries visualization"
        >
          <rect x={40} y={40} width={840} height={340} rx={12} className="network-viz__zone" />
          <ActorCard x={180} y={200} w={130} h={88} title="Client" value={`try ${state.attempt || '—'}`} />
          <ActorCard
            x={740}
            y={200}
            w={140}
            h={88}
            title="Dependency"
            sub="sometimes slow"
            warn={state.flight?.outcome === 'error'}
          />
          {[1, 2, 3].map((n) => (
            <circle
              key={n}
              cx={300 + n * 90}
              cy={320}
              r={10}
              className={`network-viz__orb${state.attempt >= n ? '' : ' is-info'}`}
              opacity={state.attempt >= n ? 1 : 0.35}
            />
          ))}
          <text x={460} y={355} textAnchor="middle" className="network-viz__list-text">
            attempts on a timeline
          </text>
          <FlightOrb
            flight={state.flight}
            travelMs={travelMs}
            from={{ x: 260, y: 200 }}
            to={{ x: 660, y: 200 }}
          />
        </svg>
      </div>
    </NetworkShell>
  )
}

function BreakerStage({ state, travelMs }: Props) {
  return (
    <NetworkShell
      state={state}
      badge="Circuit breaker"
      idle="Trip open after failures, fail fast, probe, then close."
      focusHint="Closed / Open / Half-open"
      status={
        <>
          {chip(
            state.breaker,
            state.breaker === 'open'
              ? 'warn'
              : state.breaker === 'closed'
                ? 'ok'
                : 'neutral',
          )}
          {chip(`streak ${state.failureStreak}/${state.failureThreshold}`)}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Circuit breaker visualization"
        >
          <rect x={40} y={40} width={840} height={340} rx={12} className="network-viz__zone" />
          <ActorCard x={160} y={210} w={120} h={80} title="Client" />
          <ActorCard
            x={460}
            y={210}
            w={160}
            h={110}
            title="Breaker"
            sub={state.breaker}
            value={`${state.failureStreak}/${state.failureThreshold}`}
            focus
            warn={state.breaker === 'open'}
          />
          <ActorCard
            x={760}
            y={210}
            w={120}
            h={80}
            title="Dependency"
            warn={state.breaker !== 'closed'}
          />
          <FlightOrb
            flight={state.flight}
            travelMs={travelMs}
            from={{ x: 230, y: 210 }}
            to={
              state.flight?.kind === 'refuse' && state.breaker === 'open'
                ? { x: 460, y: 210 }
                : { x: 690, y: 210 }
            }
          />
        </svg>
      </div>
    </NetworkShell>
  )
}

function BulkheadStage({ state, travelMs }: Props) {
  return (
    <NetworkShell
      state={state}
      badge="Bulkhead"
      idle="Separate pools so a busy dependency cannot starve the other."
      focusHint="Isolated pools"
      status={
        <>
          {chip(`pool A ${state.poolAInUse}/${state.poolACap}`, state.poolAInUse >= state.poolACap ? 'warn' : 'ok')}
          {chip(`pool B ${state.poolBInUse}/${state.poolBCap}`, state.poolBInUse >= state.poolBCap ? 'warn' : 'ok')}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Bulkhead visualization"
        >
          <rect x={40} y={40} width={840} height={340} rx={12} className="network-viz__zone" />
          <ActorCard x={150} y={210} w={120} h={80} title="Client" />
          <ActorCard
            x={450}
            y={140}
            w={160}
            h={100}
            title="Pool A"
            sub="hot dependency"
            value={`${state.poolAInUse}/${state.poolACap}`}
            warn={state.poolAInUse >= state.poolACap}
            focus={state.flight?.to === 'Pool A' || state.flight?.from === 'Pool A'}
          />
          <ActorCard
            x={450}
            y={290}
            w={160}
            h={100}
            title="Pool B"
            sub="other dependency"
            value={`${state.poolBInUse}/${state.poolBCap}`}
            warn={state.poolBInUse >= state.poolBCap}
            focus={state.flight?.to === 'Pool B' || state.flight?.from === 'Pool B'}
          />
          <ActorCard x={760} y={140} w={120} h={80} title="Svc A" />
          <ActorCard x={760} y={290} w={120} h={80} title="Svc B" />
          <FlightOrb
            flight={state.flight}
            travelMs={travelMs}
            from={{ x: 220, y: 210 }}
            to={
              state.flight?.to === 'Pool B' || state.flight?.from === 'Pool B'
                ? { x: 370, y: 290 }
                : { x: 370, y: 140 }
            }
          />
        </svg>
      </div>
    </NetworkShell>
  )
}

/** Keep algo type imported for exhaustive switches in consumers. */
export type NetworkVizAlgo = NetworkAlgo
