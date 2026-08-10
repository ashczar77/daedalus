import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ModeSwitch } from '../components/ModeSwitch'
import { getSystemDesignLab, labsForPath, pathTitle } from '../system-design/registry'
import { useLoadBalancerSim } from '../system-design/sim/useLoadBalancerSim'
import type { LoadBalancerSimDefaults } from '../system-design/types'
import { LoadBalancerViz } from '../system-design/viz/LoadBalancerViz'
import './SystemDesignLabPage.css'

const FALLBACK_SIM: LoadBalancerSimDefaults = {
  algo: 'round-robin',
  serverCount: 3,
  requestDurationTicks: 8,
  arrivalEveryTicks: 2,
}

/**
 * System Design lab: teaching beats, then a live load-balancer simulation.
 */
export function SystemDesignLabPage() {
  const { labId = '' } = useParams()
  const lab = getSystemDesignLab(labId)
  const [beatIndex, setBeatIndex] = useState(0)
  const simDefaults = lab?.simDefaults ?? FALLBACK_SIM
  const sim = useLoadBalancerSim(simDefaults)

  useEffect(() => {
    setBeatIndex(0)
  }, [lab?.id])

  const pathLabs = useMemo(
    () => (lab ? labsForPath(lab.pathId) : []),
    [lab],
  )

  if (!lab) {
    return (
      <div className="sd-lab sd-lab--missing">
        <p>Lab not found.</p>
        <Link to="/system-design">Back to System Design</Link>
      </div>
    )
  }

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
          <p>Watch requests land; tweak knobs and compare server totals.</p>
        </div>

        <div className="sd-lab__controls">
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
              <button type="button" className="sd-lab__btn" onClick={sim.addServer}>
                Add server
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
        </div>

        <div className="sd-lab__stage">
          <LoadBalancerViz state={sim.state} travelMs={sim.travelMs} />
        </div>
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
