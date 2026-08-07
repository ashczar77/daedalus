import type { Complexity } from '../engine/types'
import './AlgoMetrics.css'

type Props = {
  complexity: Complexity
  pattern: string
}

/** Right-rail Complexity card (pattern + Big-O). */
export function AlgoMetrics({ complexity, pattern }: Props) {
  return (
    <section className="algo-metrics" aria-label="Complexity">
      <h3 className="algo-metrics__title">Complexity</h3>
      <dl className="algo-metrics__list">
        <div>
          <dt>Pattern</dt>
          <dd>{pattern}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{complexity.time}</dd>
        </div>
        <div>
          <dt>Space</dt>
          <dd>{complexity.space}</dd>
        </div>
        {complexity.notes ? (
          <div className="algo-metrics__notes">
            <dt>Note</dt>
            <dd>{complexity.notes}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}
