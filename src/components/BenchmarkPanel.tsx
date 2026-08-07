import type { BenchmarkData, Complexity } from '../engine/types'
import './BenchmarkPanel.css'

type Props = {
  complexity: Complexity
  benchmark: BenchmarkData
}

/** Stable colors so Java / Kotlin / Python bars are recognizable across problems. */
const LANGUAGE_COLORS: Record<string, string> = {
  java: '#0f766e',
  kotlin: '#b45309',
  python: '#1d4ed8',
}

/**
 * Below-fold runtime charts + Big-O reminder.
 * Teaching prose (insight/invariant) lives in WalkthroughPanel.
 */
export function BenchmarkPanel({ complexity, benchmark }: Props) {
  const maxMs = Math.max(
    1,
    ...benchmark.series.flatMap((series) => series.points.map((point) => point.ms)),
  )

  return (
    <section className="benchmark">
      <div className="benchmark__grid">
        <article className="benchmark__card">
          <h3>Complexity</h3>
          <p>
            <strong>Time</strong> {complexity.time}
          </p>
          <p>
            <strong>Space</strong> {complexity.space}
          </p>
          {complexity.notes ? (
            <p className="benchmark__note">{complexity.notes}</p>
          ) : null}
        </article>

        <article className="benchmark__card benchmark__card--wide">
          <h3>Language runtime</h3>
          <p className="benchmark__note">
            Same algorithm, same input sizes. Shape matters more than language;
            language still shifts constant factors.
          </p>
          <div
            className="benchmark__chart"
            role="img"
            aria-label="Runtime by language"
          >
            {benchmark.series.map((series) => (
              <div key={series.language} className="benchmark__series">
                <div className="benchmark__series-label">{series.language}</div>
                <div className="benchmark__bars">
                  {series.points.map((point) => (
                    <div
                      key={point.n}
                      className="benchmark__bar-wrap"
                      title={`n=${point.n}: ${point.ms}ms`}
                    >
                      <div
                        className="benchmark__bar"
                        style={{
                          height: `${Math.max(8, (point.ms / maxMs) * 100)}%`,
                          background:
                            LANGUAGE_COLORS[series.language] ?? 'var(--accent)',
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
          {benchmark.note ? (
            <p className="benchmark__note">{benchmark.note}</p>
          ) : null}
        </article>
      </div>
    </section>
  )
}
