import type { Complexity, PerfData } from '../engine/types'
import './PerfPanel.css'

type Props = {
  complexity: Complexity
  perf: PerfData
  insight: string
  invariant: string
}

const LANG_COLOR: Record<string, string> = {
  java: '#0f766e',
  kotlin: '#b45309',
  python: '#1d4ed8',
}

export function PerfPanel({ complexity, perf, insight, invariant }: Props) {
  const maxMs = Math.max(
    1,
    ...perf.series.flatMap((series) => series.points.map((p) => p.ms)),
  )

  return (
    <section className="perf">
      <div className="perf__grid">
        <article className="perf__card">
          <h3>Complexity</h3>
          <p>
            <strong>Time</strong> {complexity.time}
          </p>
          <p>
            <strong>Space</strong> {complexity.space}
          </p>
          {complexity.notes ? <p className="perf__note">{complexity.notes}</p> : null}
        </article>

        <article className="perf__card">
          <h3>Why it works</h3>
          <p>
            <strong>Invariant.</strong> {invariant}
          </p>
          <p>
            <strong>Insight.</strong> {insight}
          </p>
        </article>
      </div>

      <article className="perf__card perf__card--wide">
        <h3>Language runtime (precomputed)</h3>
        <p className="perf__note">
          Same algorithm, same input sizes. Charts show approximate wall-clock
          cost — asymptotic shape matters more than language, but language still
          shifts the constant factors.
        </p>
        <div className="perf__chart" role="img" aria-label="Runtime by language">
          {perf.series.map((series) => (
            <div key={series.language} className="perf__series">
              <div className="perf__series-label">{series.language}</div>
              <div className="perf__bars">
                {series.points.map((point) => (
                  <div key={point.n} className="perf__bar-wrap" title={`n=${point.n}: ${point.ms}ms`}>
                    <div
                      className="perf__bar"
                      style={{
                        height: `${Math.max(8, (point.ms / maxMs) * 100)}%`,
                        background: LANG_COLOR[series.language] ?? 'var(--accent)',
                      }}
                    />
                    <span>n={point.n}</span>
                    <span>{point.ms}ms</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {perf.note ? <p className="perf__note">{perf.note}</p> : null}
      </article>
    </section>
  )
}
