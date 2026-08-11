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
    case 'tcp':
      return <TcpStage state={state} travelMs={travelMs} />
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
  toneClass: toneClassOverride,
}: {
  flight: NetworkFlight | null
  travelMs: number
  from: { x: number; y: number }
  to: { x: number; y: number }
  toneClass?: string
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
  const toneClass =
    toneClassOverride ??
    (warn
      ? ' is-warn'
      : reply
        ? ' is-reply'
        : flight.outcome === 'info'
          ? ' is-info'
          : flight.kind === 'request'
            ? ' is-request'
            : '')
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
  const fromApi = state.flight?.from === 'API'
  const reply =
    fromApi ||
    state.flight?.kind === 'response' ||
    state.flight?.kind === 'refuse'
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
          ? 'Watch each request go out (teal), then the response come back (blue).'
          : 'Watch the request go out (teal), then the response come back (blue).'
      }
      focusHint={rest ? 'Resources + safe retries' : 'Request out, response back'}
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

function streamLaneY(
  protocol: 'http1' | 'http2',
  streamId?: number,
  label?: string,
): number {
  if (protocol === 'http1') return 200
  const id =
    streamId ??
    (label?.includes('A') ? 1 : label?.includes('B') ? 2 : label?.includes('C') ? 3 : 2)
  if (id === 1) return 155
  if (id === 3) return 245
  return 200
}

function streamTone(streamId?: number, label?: string): 'a' | 'b' | 'c' | 'http1' {
  const id =
    streamId ??
    (label?.includes('A') ? 1 : label?.includes('B') ? 2 : label?.includes('C') ? 3 : 0)
  if (id === 1) return 'a'
  if (id === 2) return 'b'
  if (id === 3) return 'c'
  return 'http1'
}

function TcpStage({ state, travelMs }: Props) {
  const clientX = 220
  const serverX = 700
  const lifeTop = 88
  const lifeBottom = 360
  const flight = state.flight
  const done = state.tcpHandshake
  const activeLabel = flight?.label ?? null

  const rows: Array<{
    id: 'syn' | 'syn-ack' | 'ack' | 'data' | 'close'
    y: number
    fromClient: boolean
    title: string
    detail: string
    done: boolean
    active: boolean
  }> = [
    {
      id: 'syn',
      y: 130,
      fromClient: true,
      title: 'SYN',
      detail: 'SEQ. Client',
      done: done.includes('syn'),
      active: activeLabel === 'SYN',
    },
    {
      id: 'syn-ack',
      y: 190,
      fromClient: false,
      title: 'SYN-ACK',
      detail: 'SEQ. Client + 1 · SEQ. Server',
      done: done.includes('syn-ack'),
      active: activeLabel === 'SYN-ACK',
    },
    {
      id: 'ack',
      y: 250,
      fromClient: true,
      title: 'ACK',
      detail: 'SEQ. Server + 1 · SEQ. Client + 1',
      done: done.includes('ack'),
      active: activeLabel === 'ACK',
    },
  ]

  const dataActive = activeLabel === 'Send data'
  const closeActive = activeLabel === 'TCP close'
  const showData = state.tcpDelivered.includes('data') || dataActive
  const showClose =
    closeActive || (!state.tcpOpen && done.includes('ack') && state.tcpDelivered.includes('data'))

  const phaseLabel = !done.length
    ? 'not started'
    : !done.includes('ack')
      ? `handshake ${done.length}/3`
      : state.tcpOpen
        ? 'established'
        : 'closed'

  const footer = !done.length
    ? 'Three packets must agree before either side treats the connection as open.'
    : !done.includes('syn-ack')
      ? 'SYN is out. The server has not answered yet.'
      : !done.includes('ack')
        ? 'Server offered its sequence number. Client must ACK it.'
        : state.tcpOpen
          ? showData
            ? 'Connection open. First application bytes can ride with or after the final ACK.'
            : 'Three-way handshake complete. Both sides share one reliable ordered pipe.'
          : 'Connection closed. A later call starts a new handshake.'

  return (
    <NetworkShell
      state={state}
      badge="TCP"
      idle="Three-way handshake: SYN, then SYN-ACK, then ACK. Only after that is the connection open."
      focusHint="sequence · SYN → SYN-ACK → ACK"
      status={
        <>
          {chip(phaseLabel, done.includes('ack') && state.tcpOpen ? 'ok' : 'warn')}
          {chip(done.includes('syn') ? 'SYN ✓' : 'SYN', done.includes('syn') ? 'ok' : 'neutral')}
          {chip(
            done.includes('syn-ack') ? 'SYN-ACK ✓' : 'SYN-ACK',
            done.includes('syn-ack') ? 'ok' : 'neutral',
          )}
          {chip(done.includes('ack') ? 'ACK ✓' : 'ACK', done.includes('ack') ? 'ok' : 'neutral')}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="TCP three-way handshake sequence"
        >
          <rect x={40} y={36} width={840} height={350} rx={12} className="network-viz__zone" />

          <text x={460} y={62} textAnchor="middle" className="network-viz__hs-title">
            TCP connection establishment (three-way handshake)
          </text>

          <ActorCard
            x={clientX}
            y={lifeTop}
            w={120}
            h={56}
            title="Client"
            sub="initiator"
            focus={flight?.from === 'Client' || flight?.to === 'Client'}
          />
          <ActorCard
            x={serverX}
            y={lifeTop}
            w={120}
            h={56}
            title="Server"
            sub="listener"
            focus={flight?.from === 'Server' || flight?.to === 'Server'}
          />

          <line
            x1={clientX}
            y1={lifeTop + 32}
            x2={clientX}
            y2={lifeBottom}
            className="network-viz__lifeline"
          />
          <line
            x1={serverX}
            y1={lifeTop + 32}
            x2={serverX}
            y2={lifeBottom}
            className="network-viz__lifeline"
          />

          {rows.map((row) => {
            const visible = row.done || row.active
            if (!visible) {
              return (
                <g key={row.id} className="network-viz__hs-row is-pending">
                  <text
                    x={460}
                    y={row.y}
                    textAnchor="middle"
                    className="network-viz__hs-placeholder"
                  >
                    {row.id === 'syn'
                      ? '1 · waiting for SYN'
                      : row.id === 'syn-ack'
                        ? '2 · waiting for SYN-ACK'
                        : '3 · waiting for ACK'}
                  </text>
                </g>
              )
            }
            const x1 = row.fromClient ? clientX : serverX
            const x2 = row.fromClient ? serverX : clientX
            const y1 = row.fromClient ? row.y - 10 : row.y + 10
            const y2 = row.fromClient ? row.y + 10 : row.y - 10
            return (
              <g
                key={row.id}
                className={`network-viz__hs-row${row.active ? ' is-active' : ''}${
                  row.done && !row.active ? ' is-done' : ''
                }`}
              >
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={`network-viz__hs-arrow${row.fromClient ? ' is-out' : ' is-back'}`}
                  markerEnd={
                    row.fromClient ? 'url(#tcp-arrowhead-out)' : 'url(#tcp-arrowhead-back)'
                  }
                />
                <text
                  x={460}
                  y={(y1 + y2) / 2 - 8}
                  textAnchor="middle"
                  className="network-viz__hs-label"
                >
                  {row.title} | {row.detail}
                </text>
                <text
                  x={row.fromClient ? clientX - 18 : serverX + 18}
                  y={(y1 + y2) / 2 + 4}
                  textAnchor={row.fromClient ? 'end' : 'start'}
                  className="network-viz__hs-step"
                >
                  {row.id === 'syn' ? '1' : row.id === 'syn-ack' ? '2' : '3'}
                </text>
              </g>
            )
          })}

          {done.includes('ack') ? (
            <text x={460} y={286} textAnchor="middle" className="network-viz__hs-established">
              {state.tcpOpen ? 'connection established' : 'was established · now closing'}
            </text>
          ) : null}

          {showData ? (
            <g className={`network-viz__hs-row${dataActive ? ' is-active' : ' is-done'}`}>
              <line
                x1={clientX}
                y1={302}
                x2={serverX}
                y2={322}
                className="network-viz__hs-arrow is-out is-data"
                markerEnd="url(#tcp-arrowhead-out)"
              />
              <text x={460} y={300} textAnchor="middle" className="network-viz__hs-label">
                optional: first data
              </text>
            </g>
          ) : null}

          {showClose ? (
            <g className={`network-viz__hs-row${closeActive ? ' is-active' : ' is-done'}`}>
              <line
                x1={clientX}
                y1={338}
                x2={serverX}
                y2={354}
                className="network-viz__hs-arrow is-out is-close"
                markerEnd="url(#tcp-arrowhead-out)"
              />
              <text x={460} y={336} textAnchor="middle" className="network-viz__hs-label">
                close
              </text>
            </g>
          ) : null}

          <text x={460} y={378} textAnchor="middle" className="network-viz__list-text">
            {footer}
          </text>
          <text x={780} y={378} textAnchor="end" className="network-viz__hs-legend">
            SEQ. = sequence number
          </text>

          <defs>
            <marker
              id="tcp-arrowhead-out"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" className="network-viz__hs-marker is-out" />
            </marker>
            <marker
              id="tcp-arrowhead-back"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" className="network-viz__hs-marker is-back" />
            </marker>
          </defs>

          {flight != null &&
          (activeLabel === 'SYN' ||
            activeLabel === 'SYN-ACK' ||
            activeLabel === 'ACK' ||
            dataActive ||
            closeActive) ? (
            <FlightOrb
              flight={flight}
              travelMs={travelMs}
              from={{
                x: flight.from === 'Server' ? serverX : clientX,
                y:
                  activeLabel === 'SYN'
                    ? 120
                    : activeLabel === 'SYN-ACK'
                      ? 200
                      : activeLabel === 'ACK'
                        ? 240
                        : dataActive
                          ? 302
                          : 338,
              }}
              to={{
                x: flight.to === 'Server' ? serverX : clientX,
                y:
                  activeLabel === 'SYN'
                    ? 140
                    : activeLabel === 'SYN-ACK'
                      ? 180
                      : activeLabel === 'ACK'
                        ? 260
                        : dataActive
                          ? 322
                          : 354,
              }}
              toneClass={
                flight.outcome === 'error'
                  ? ' is-warn'
                  : flight.kind === 'response'
                    ? ' is-reply'
                    : flight.outcome === 'info'
                      ? ' is-info'
                      : ' is-request'
              }
            />
          ) : null}
        </svg>
      </div>
    </NetworkShell>
  )
}

function Http2Stage({ state, travelMs }: Props) {
  const http2 = state.protocol === 'http2'
  const clientX = 130
  const serverX = 790
  const pipeLeft = 220
  const pipeRight = 700
  const flight = state.flight
  const crossing =
    flight != null &&
    flight.to !== 'Queue' &&
    (flight.to === 'Server' ||
      flight.from === 'Server' ||
      flight.label === 'TCP open' ||
      flight.label === 'Switch to HTTP/2')
  const laneY = streamLaneY(state.protocol, flight?.streamId, flight?.label)
  const fromServer = flight?.from === 'Server'
  const tone = http2
    ? streamTone(flight?.streamId, flight?.label)
    : 'http1'

  return (
    <NetworkShell
      state={state}
      badge={http2 ? 'HTTP/2' : state.tcpOpen ? 'HTTP/1.1' : 'TCP'}
      idle="TCP is the pipe. HTTP/1.1 uses one lane. HTTP/2 runs parallel stream lanes inside the same pipe."
      focusHint="TCP pipe · serial vs multiplex"
      status={
        <>
          {chip(state.tcpOpen ? 'TCP open' : 'TCP closed', state.tcpOpen ? 'ok' : 'warn')}
          {chip(http2 ? 'multiplex' : 'serial', 'ok')}
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
          <rect x={40} y={36} width={840} height={350} rx={12} className="network-viz__zone" />

          <ActorCard
            x={clientX}
            y={200}
            w={120}
            h={88}
            title="Client"
            sub="your app"
            focus={flight?.from === 'Client' || flight?.to === 'Client'}
          />
          <ActorCard
            x={serverX}
            y={200}
            w={120}
            h={88}
            title="Server"
            sub="origin"
            focus={flight?.from === 'Server' || flight?.to === 'Server'}
          />

          {/* TCP foundation: the shared reliable pipe both HTTP versions ride. */}
          <rect
            x={250}
            y={118}
            width={420}
            height={164}
            rx={14}
            className={`network-viz__tcp${state.tcpOpen ? ' is-open' : ''}`}
          />
          <foreignObject x={320} y={58} width={280} height={56}>
            <div
              className={`network-viz__card network-viz__card--tcp${state.tcpOpen ? ' is-focus' : ''}`}
            >
              <span className="network-viz__card-label">TCP connection</span>
              <span className="network-viz__card-sub">
                {state.tcpOpen
                  ? 'reliable ordered byte pipe (open)'
                  : 'not open yet'}
              </span>
            </div>
          </foreignObject>

          {http2 ? (
            <>
              {(['A', 'B', 'C'] as const).map((label, index) => {
                const y = 155 + index * 45
                const active = state.activeStreams.includes(label)
                const toneClass = ` is-stream-${label.toLowerCase()}`
                return (
                  <g key={label}>
                    <line
                      x1={pipeLeft}
                      y1={y}
                      x2={pipeRight}
                      y2={y}
                      className={`network-viz__stream-lane${toneClass}${active ? ' is-active' : ''}`}
                    />
                    <text
                      x={460}
                      y={y - 8}
                      textAnchor="middle"
                      className={`network-viz__stream-label${toneClass}`}
                    >
                      stream {label}
                      {active ? ' · live' : ''}
                    </text>
                  </g>
                )
              })}
            </>
          ) : (
            <>
              <line
                x1={pipeLeft}
                y1={200}
                x2={pipeRight}
                y2={200}
                className={`network-viz__stream-lane is-http1${
                  state.activeStreams.length ? ' is-active' : ''
                }`}
              />
              <text x={460} y={188} textAnchor="middle" className="network-viz__stream-label is-http1">
                {state.tcpOpen
                  ? state.activeStreams[0]
                    ? `HTTP/1.1 lane · sending ${state.activeStreams[0]}`
                    : 'HTTP/1.1 lane · one request at a time'
                  : 'HTTP waits for TCP'}
              </text>
            </>
          )}

          <text x={460} y={330} textAnchor="middle" className="network-viz__list-text">
            HTTP/1.1 queue: {state.queued.join(', ') || '(empty)'}
          </text>
          <text x={460} y={352} textAnchor="middle" className="network-viz__list-text">
            {http2
              ? 'HTTP/2: each letter rides its own colored lane inside the same TCP pipe'
              : 'HTTP/1.1: everyone shares one lane (head-of-line wait)'}
          </text>

          {crossing ? (
            <FlightOrb
              flight={flight}
              travelMs={travelMs}
              from={{
                x: fromServer ? pipeRight : pipeLeft,
                y: flight?.label === 'TCP open' || flight?.label === 'Switch to HTTP/2' ? 200 : laneY,
              }}
              to={{
                x: fromServer ? pipeLeft : pipeRight,
                y: flight?.label === 'TCP open' || flight?.label === 'Switch to HTTP/2' ? 200 : laneY,
              }}
              toneClass={
                flight?.outcome === 'error'
                  ? ' is-warn'
                  : tone === 'http1'
                    ? ' is-request'
                    : ` is-stream-${tone}`
              }
            />
          ) : null}
        </svg>
      </div>
    </NetworkShell>
  )
}

function GrpcStage({ state, travelMs }: Props) {
  const flight = state.flight
  const isReturn = flight?.kind === 'response' || flight?.from === 'Server'
  const calling = flight != null && !isReturn
  const returning = flight != null && isReturn
  const clientX = 180
  const serverX = 740
  const midY = 210
  const phaseChip = returning ? 'return value' : calling ? 'arguments out' : 'ready'
  const footer = returning
    ? 'Return value comes home. Your code continues as if the function were local.'
    : calling
      ? 'Arguments cross the network. The server will run the function.'
      : 'Remote Procedure Call: run this function on another machine and give me the return value.'

  return (
    <NetworkShell
      state={state}
      badge="gRPC"
      idle="Remote Procedure Call: run this function on another machine and give me the return value."
      focusHint="call out · run there · return back"
      status={
        <>
          {chip(phaseChip, returning || calling ? 'ok' : 'neutral')}
          {chip(flight?.label ?? 'GetUser(id)')}
        </>
      }
    >
      <div className="network-viz__viewport">
        <svg
          className="network-viz__canvas"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="gRPC remote procedure call visualization"
        >
          <rect x={40} y={36} width={840} height={350} rx={12} className="network-viz__zone" />

          <text x={460} y={62} textAnchor="middle" className="network-viz__hs-title">
            Remote Procedure Call
          </text>
          <text x={460} y={84} textAnchor="middle" className="network-viz__list-text">
            run this function on another machine and give me the return value
          </text>

          <text x={clientX} y={118} textAnchor="middle" className="network-viz__machine-label">
            your machine
          </text>
          <text x={serverX} y={118} textAnchor="middle" className="network-viz__machine-label">
            other machine
          </text>

          <ActorCard
            x={clientX}
            y={midY}
            w={160}
            h={110}
            title="Client code"
            sub="looks like a local call"
            value={calling ? `call ${flight.label}` : returning ? 'got result' : 'stub.GetUser(id)'}
            focus={flight?.from === 'Client' || flight?.to === 'Client'}
          />
          <ActorCard
            x={serverX}
            y={midY}
            w={160}
            h={110}
            title="Server"
            sub="runs the function"
            value={
              calling
                ? `running ${flight.label}`
                : returning
                  ? `return ${flight.label}`
                  : 'function GetUser(id)'
            }
            focus={flight?.from === 'Server' || flight?.to === 'Server'}
          />

          <line
            x1={clientX + 90}
            y1={midY - 28}
            x2={serverX - 90}
            y2={midY - 28}
            className={`network-viz__rpc-lane is-out${calling ? ' is-active' : ''}`}
          />
          <text
            x={460}
            y={midY - 38}
            textAnchor="middle"
            className={`network-viz__rpc-lane-label${calling ? ' is-active' : ''}`}
          >
            1 · send arguments{calling ? ` · ${flight.label}` : ''}
          </text>

          <line
            x1={serverX - 90}
            y1={midY + 36}
            x2={clientX + 90}
            y2={midY + 36}
            className={`network-viz__rpc-lane is-back${returning ? ' is-active' : ''}`}
          />
          <text
            x={460}
            y={midY + 56}
            textAnchor="middle"
            className={`network-viz__rpc-lane-label is-back${returning ? ' is-active' : ''}`}
          >
            2 · return value{returning ? ` · ${flight.label}` : ''}
          </text>

          <text x={460} y={320} textAnchor="middle" className="network-viz__list-text">
            {calling
              ? 'Server side: execute GetUser with the args you sent.'
              : returning
                ? 'Client side: receive the return value and keep going.'
                : 'gRPC packages this call/return pattern (often over HTTP/2).'}
          </text>
          <text x={460} y={348} textAnchor="middle" className="network-viz__list-text">
            {footer}
          </text>

          {flight ? (
            <FlightOrb
              flight={flight}
              travelMs={travelMs}
              from={
                isReturn
                  ? { x: serverX - 90, y: midY + 36 }
                  : { x: clientX + 90, y: midY - 28 }
              }
              to={
                isReturn
                  ? { x: clientX + 90, y: midY + 36 }
                  : { x: serverX - 90, y: midY - 28 }
              }
              toneClass={isReturn ? ' is-reply' : ' is-request'}
            />
          ) : null}
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
