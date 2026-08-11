import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ModeSwitch } from '../components/ModeSwitch'
import { useCacheSim } from '../system-design/cache/sim/useCacheSim'
import { CacheViz } from '../system-design/cache/viz/CacheViz'
import { useCapSim } from '../system-design/cap/sim/useCapSim'
import { CapViz } from '../system-design/cap/viz/CapViz'
import { useNetworkSim } from '../system-design/network/sim/useNetworkSim'
import { NetworkViz } from '../system-design/network/viz/NetworkViz'
import { getSystemDesignLab, labsForPath, pathTitle } from '../system-design/registry'
import { useLoadBalancerSim } from '../system-design/sim/useLoadBalancerSim'
import type {
  CacheSimDefaults,
  CapSimDefaults,
  LoadBalancerSimDefaults,
  NetworkSimDefaults,
  SystemDesignLab,
} from '../system-design/types'
import { LoadBalancerViz } from '../system-design/viz/LoadBalancerViz'
import './SystemDesignLabPage.css'

const FALLBACK_LB: LoadBalancerSimDefaults = {
  algo: 'round-robin',
  serverCount: 3,
  requestDurationTicks: 8,
  arrivalEveryTicks: 2,
}

const FALLBACK_CACHE: CacheSimDefaults = {
  algo: 'cache-aside',
  capacity: 4,
  maxArrivals: 12,
}

const FALLBACK_CAP: CapSimDefaults = {
  algo: 'overview',
  mode: 'cp',
  replicaCount: 3,
}

const FALLBACK_NETWORK: NetworkSimDefaults = {
  algo: 'http-basics',
}

/**
 * System Design lab: teaching beats, then a live simulation for that path.
 */
export function SystemDesignLabPage() {
  const { labId = '' } = useParams()
  const lab = getSystemDesignLab(labId)

  if (!lab) {
    return (
      <div className="sd-lab sd-lab--missing">
        <p>Lab not found.</p>
        <Link to="/system-design">Back to System Design</Link>
      </div>
    )
  }

  if (lab.kind === 'cap') {
    return <CapLabView lab={lab} />
  }

  if (lab.kind === 'network') {
    return <NetworkLabView lab={lab} />
  }

  if (lab.kind === 'cache') {
    return <CacheLabView lab={lab} />
  }

  return <LoadBalancerLabView lab={lab} />
}

function LabChrome({
  lab,
  simControls,
  simStage,
  simBlurb,
}: {
  lab: SystemDesignLab
  simControls: ReactNode
  simStage: ReactNode
  simBlurb: string
}) {
  const [beatIndex, setBeatIndex] = useState(0)
  const pathLabs = useMemo(() => labsForPath(lab.pathId), [lab.pathId])

  useEffect(() => {
    setBeatIndex(0)
  }, [lab.id])

  const beat = lab.teachingSteps[beatIndex] ?? lab.teachingSteps[0]!
  const atStart = beatIndex <= 0
  const atEnd = beatIndex >= lab.teachingSteps.length - 1

  return (
    <div className="sd-lab">
      <header className="sd-lab__header">
        <div className="sd-lab__top">
          <Link to="/system-design" className="sd-lab__back">
            ← DAEDALUS // SYSTEM DESIGN
          </Link>
          <ModeSwitch mode="system-design" />
        </div>
        <div className="sd-lab__meta">
          <span>{pathTitle(lab.pathId)}</span>
          <span>
            Lab {lab.order} of {pathLabs.length}
          </span>
        </div>
        <h1>{lab.title}</h1>
        <p className="sd-lab__insight">{lab.insight}</p>
      </header>

      <section className="sd-lab__teach" aria-label="Teaching beats">
        <div className="sd-lab__teach-head">
          <h2>
            <span className="sd-lab__prompt">&gt;</span> How it works
          </h2>
          <p>
            Beat {beatIndex + 1} / {lab.teachingSteps.length}
          </p>
        </div>
        <p className="sd-lab__narrative">{beat.narrative}</p>
        <p className="sd-lab__why">{beat.why}</p>
        <div className="sd-lab__teach-controls">
          <button
            type="button"
            className="sd-lab__btn"
            disabled={atStart}
            onClick={() => setBeatIndex((i) => Math.max(0, i - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="sd-lab__btn"
            disabled={atEnd}
            onClick={() =>
              setBeatIndex((i) => Math.min(lab.teachingSteps.length - 1, i + 1))
            }
          >
            Next
          </button>
        </div>
      </section>

      <section className="sd-lab__sim" aria-label="Live simulation">
        <div className="sd-lab__sim-head">
          <h2>
            <span className="sd-lab__prompt">&gt;</span> Live simulation
          </h2>
          <p>{simBlurb}</p>
        </div>

        <div className="sd-lab__controls">{simControls}</div>

        <div className="sd-lab__stage">{simStage}</div>
      </section>

      <section className="sd-lab__tradeoffs" aria-label="Tradeoffs">
        <h2>
          <span className="sd-lab__prompt">&gt;</span> When to use
        </h2>
        <ul>
          {lab.tradeoffs.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="sd-lab__walk" aria-label="Walkthrough">
        <h2>
          <span className="sd-lab__prompt">&gt;</span> Recap
        </h2>
        <p>
          <strong>Problem.</strong> {lab.walkthrough.statement}
        </p>
        <p>
          <strong>Key idea.</strong> {lab.walkthrough.keyIdea}
        </p>
        <ol>
          {lab.walkthrough.approach.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function LoadBalancerLabView({
  lab,
}: {
  lab: Extract<SystemDesignLab, { kind: 'load-balancer' }>
}) {
  const sim = useLoadBalancerSim(lab.simDefaults ?? FALLBACK_LB)

  return (
    <LabChrome
      lab={lab}
      simBlurb="Each algorithm shows its decision rule. Watch the request trail follow that choice."
      simControls={
        <>
          <button type="button" className="sd-lab__btn is-accent" onClick={sim.toggle}>
            {sim.state.finished ? 'Replay' : sim.playing ? 'Pause' : 'Play'}
          </button>
          <button type="button" className="sd-lab__btn" onClick={sim.stepOnce}>
            Step
          </button>
          <button type="button" className="sd-lab__btn" onClick={sim.reset}>
            Reset
          </button>
          <button
            type="button"
            className="sd-lab__btn"
            onClick={sim.cycleSpeed}
            aria-label="Cycle speed"
          >
            {sim.speed}x
          </button>

          {lab.simDefaults.algo === 'weighted-round-robin'
            ? sim.state.servers.map((server) => (
                <label key={server.id} className="sd-lab__weight">
                  {server.label} weight
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={server.weight}
                    onChange={(e) =>
                      sim.setWeight(server.id, Number(e.target.value))
                    }
                  />
                </label>
              ))
            : null}

          {lab.simDefaults.allowServerChurn ? (
            <>
              <button
                type="button"
                className="sd-lab__btn"
                onClick={sim.addServer}
                disabled={sim.state.servers.length >= sim.state.maxServers}
              >
                Add server
                {sim.state.servers.length >= sim.state.maxServers
                  ? ` (max ${sim.state.maxServers})`
                  : ''}
              </button>
              <button
                type="button"
                className="sd-lab__btn"
                onClick={sim.removeServer}
                disabled={sim.state.servers.length <= 1}
              >
                Remove server
              </button>
            </>
          ) : null}
        </>
      }
      simStage={<LoadBalancerViz state={sim.state} travelMs={sim.travelMs} />}
    />
  )
}

function CacheLabView({
  lab,
}: {
  lab: Extract<SystemDesignLab, { kind: 'cache' }>
}) {
  const sim = useCacheSim(lab.simDefaults ?? FALLBACK_CACHE)

  return (
    <LabChrome
      lab={lab}
      simBlurb="Each strategy shows a different path or eviction rule. Watch the trail and the cache slots."
      simControls={
        <>
          <button type="button" className="sd-lab__btn is-accent" onClick={sim.toggle}>
            {sim.state.finished ? 'Replay' : sim.playing ? 'Pause' : 'Play'}
          </button>
          <button type="button" className="sd-lab__btn" onClick={sim.stepOnce}>
            Step
          </button>
          <button type="button" className="sd-lab__btn" onClick={sim.reset}>
            Reset
          </button>
          <button
            type="button"
            className="sd-lab__btn"
            onClick={sim.cycleSpeed}
            aria-label="Cycle speed"
          >
            {sim.speed}x
          </button>
          <span className="sd-lab__weight">
            capacity {sim.state.capacity}
          </span>
          <span className="sd-lab__weight">
            <span className="sd-lab__stat sd-lab__stat--hit">{sim.state.hits} hit</span>
            {' / '}
            <span className="sd-lab__stat sd-lab__stat--miss">{sim.state.misses} miss</span>
          </span>
        </>
      }
      simStage={<CacheViz state={sim.state} travelMs={sim.travelMs} />}
    />
  )
}

function CapLabView({
  lab,
}: {
  lab: Extract<SystemDesignLab, { kind: 'cap' }>
}) {
  const sim = useCapSim(lab.simDefaults ?? FALLBACK_CAP)
  const blurb = capSimBlurb(lab.simDefaults.algo)

  return (
    <LabChrome
      lab={lab}
      simBlurb={blurb}
      simControls={
        <>
          <button type="button" className="sd-lab__btn is-accent" onClick={sim.toggle}>
            {sim.state.finished ? 'Replay' : sim.playing ? 'Pause' : 'Play'}
          </button>
          <button type="button" className="sd-lab__btn" onClick={sim.stepOnce}>
            Step
          </button>
          <button type="button" className="sd-lab__btn" onClick={sim.reset}>
            Reset
          </button>
          <button
            type="button"
            className="sd-lab__btn"
            onClick={sim.cycleSpeed}
            aria-label="Cycle speed"
          >
            {sim.speed}x
          </button>
          <span className="sd-lab__weight">
            {sim.state.mode === 'cp' ? 'Prefer Consistency' : 'Prefer Availability'}
          </span>
          <span className="sd-lab__weight">
            <span className="sd-lab__stat sd-lab__stat--hit">{sim.state.okCount} answered</span>
            {' / '}
            <span className="sd-lab__stat sd-lab__stat--miss">
              {sim.state.refuseCount} errors
            </span>
          </span>
        </>
      }
      simStage={<CapViz state={sim.state} travelMs={sim.travelMs} />}
    />
  )
}

function NetworkLabView({
  lab,
}: {
  lab: Extract<SystemDesignLab, { kind: 'network' }>
}) {
  const sim = useNetworkSim(lab.simDefaults ?? FALLBACK_NETWORK)
  const blurb = networkSimBlurb(lab.simDefaults.algo)

  return (
    <LabChrome
      lab={lab}
      simBlurb={blurb}
      simControls={
        <>
          <button type="button" className="sd-lab__btn is-accent" onClick={sim.toggle}>
            {sim.state.finished ? 'Replay' : sim.playing ? 'Pause' : 'Play'}
          </button>
          <button type="button" className="sd-lab__btn" onClick={sim.stepOnce}>
            Step
          </button>
          <button type="button" className="sd-lab__btn" onClick={sim.reset}>
            Reset
          </button>
          <button
            type="button"
            className="sd-lab__btn"
            onClick={sim.cycleSpeed}
            aria-label="Cycle speed"
          >
            {sim.speed}x
          </button>
          <span className="sd-lab__weight">{networkStatusLabel(sim.state)}</span>
          <span className="sd-lab__weight">
            <span className="sd-lab__stat sd-lab__stat--hit">{sim.state.okCount} ok</span>
            {' / '}
            <span className="sd-lab__stat sd-lab__stat--miss">{sim.state.errorCount} err</span>
          </span>
        </>
      }
      simStage={<NetworkViz state={sim.state} travelMs={sim.travelMs} />}
    />
  )
}

function capSimBlurb(algo: CapSimDefaults['algo']): string {
  switch (algo) {
    case 'consistency':
      return 'This lab highlights stored values. Watch Zone A and Zone B agree, then disagree.'
    case 'availability':
      return 'This lab highlights replies. Watch Answered versus Error when Zone B is cut off.'
    case 'partition':
      return 'This lab highlights the sync link. Watch cross-zone copy fail, then heal reconnect the zones.'
    case 'overview':
    default:
      return 'This lab shows the full tradeoff: healthy sync, then Prefer Consistency versus Prefer Availability after the cut.'
  }
}

function networkSimBlurb(algo: NetworkSimDefaults['algo']): string {
  switch (algo) {
    case 'http-basics':
      return 'Watch methods and status codes: request goes out, then the response comes back.'
    case 'rest-design':
      return 'Compare POST vs PUT retries, paging, and versioning. Request goes out, then response returns.'
    case 'tcp':
      return 'Walk SYN → SYN-ACK → ACK. Connection opens only after the third packet.'
    case 'http2':
      return 'TCP opens first (brief). Then compare one HTTP/1.1 lane with parallel HTTP/2 stream lanes.'
    case 'grpc':
      return 'Compare a REST JSON call with a typed gRPC stub call.'
    case 'realtime':
      return 'Hold a long poll, then switch to WebSocket push on an open channel.'
    case 'gateway':
      return 'Auth at the edge, then route /orders and /users to different services.'
    case 'rate-limit':
      return 'Drain the token bucket until 429, refill, then allow again.'
    case 'retries':
      return 'Timeouts stop slow calls; backoff spaces retries until success.'
    case 'circuit-breaker':
      return 'Failures open the breaker, reject fast, probe, then close.'
    case 'bulkhead':
      return 'Fill pool A to capacity while pool B keeps accepting work.'
    default: {
      const _exhaustive: never = algo
      return _exhaustive
    }
  }
}

function networkStatusLabel(state: {
  algo: NetworkSimDefaults['algo']
  tokens: number
  tokenCapacity: number
  breaker: string
  attempt: number
  poolAInUse: number
  poolACap: number
  poolBInUse: number
  poolBCap: number
  protocol: string
  tcpOpen: boolean
  tcpHandshake: Array<'syn' | 'syn-ack' | 'ack'>
  tcpDelivered: string[]
  tcpGap: string | null
  channel: string
  apiVersion: string
}): string {
  switch (state.algo) {
    case 'rate-limit':
      return `tokens ${state.tokens}/${state.tokenCapacity}`
    case 'circuit-breaker':
      return `breaker ${state.breaker}`
    case 'retries':
      return `attempt ${state.attempt || 0}`
    case 'bulkhead':
      return `A ${state.poolAInUse}/${state.poolACap} · B ${state.poolBInUse}/${state.poolBCap}`
    case 'http2':
      return state.tcpOpen
        ? `${state.protocol === 'http2' ? 'HTTP/2' : 'HTTP/1.1'} on TCP`
        : 'TCP closed'
    case 'tcp':
      return state.tcpHandshake.includes('ack')
        ? state.tcpOpen
          ? 'established'
          : 'closed'
        : `handshake ${state.tcpHandshake.length}/3`
    case 'realtime':
      return state.channel
    case 'rest-design':
      return `api ${state.apiVersion}`
    default:
      return 'live demo'
  }
}
