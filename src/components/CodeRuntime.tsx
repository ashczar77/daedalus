import { useEffect, useRef, useState } from 'react'
import type { BenchmarkData, Language } from '../engine/types'
import './CodeRuntime.css'

type Props = {
  language: Language
  benchmark: BenchmarkData
  playing: boolean
  atEnd: boolean
  /** Bumps on reset / problem change to clear the in-flight timer. */
  runEpoch: number
}

const LABELS: Record<Language, string> = {
  java: 'Java',
  kotlin: 'Kotlin',
  python: 'Python',
}

/**
 * Per-language runtime under the code panel.
 * Hidden results until Play completes; only the selected language's offline
 * estimates appear (we do not execute JVM/Python in-browser yet).
 */
export function CodeRuntime({
  language,
  benchmark,
  playing,
  atEnd,
  runEpoch,
}: Props) {
  const [liveMs, setLiveMs] = useState(0)
  const [results, setResults] = useState<Partial<Record<Language, number>>>({})
  const runStart = useRef<number | null>(null)

  useEffect(() => {
    runStart.current = null
    setLiveMs(0)
  }, [runEpoch])

  useEffect(() => {
    runStart.current = null
    setLiveMs(0)
  }, [language])

  useEffect(() => {
    if (playing) {
      if (runStart.current == null) {
        runStart.current = performance.now()
      }
      const tick = window.setInterval(() => {
        if (runStart.current != null) {
          setLiveMs(performance.now() - runStart.current)
        }
      }, 50)
      return () => window.clearInterval(tick)
    }

    // Play stopped: record only if we finished the walkthrough.
    if (atEnd && runStart.current != null) {
      const elapsed = performance.now() - runStart.current
      setResults((prev) => ({ ...prev, [language]: elapsed }))
      setLiveMs(elapsed)
    }
    runStart.current = null
  }, [playing, atEnd, language])

  const series = benchmark.series.find((entry) => entry.language === language)
  const completedMs = results[language]
  const hasResult = completedMs != null
  const showPanel = playing || hasResult
  const displayMs = playing ? liveMs : (completedMs ?? 0)

  return (
    <section className="code-runtime" aria-label={`${LABELS[language]} runtime`}>
      <header className="code-runtime__head">
        <h3>{LABELS[language]} runtime</h3>
      </header>

      {!showPanel ? (
        <p className="code-runtime__idle">
          Press <strong>Play</strong> to time this {LABELS[language]} walkthrough.
          Switch language and run again to compare.
        </p>
      ) : (
        <div className="code-runtime__body">
          <p className="code-runtime__timing">
            <span className="code-runtime__label">
              {playing ? 'Walkthrough running' : 'Walkthrough time'}
            </span>
            <strong>{formatMs(displayMs)}</strong>
          </p>

          {hasResult && series ? (
            <div className="code-runtime__estimate">
              <p className="code-runtime__label">
                Estimated {LABELS[language]} algorithm cost (offline)
              </p>
              <ul className="code-runtime__points">
                {series.points.map((point) => (
                  <li key={point.n}>
                    <span>n={point.n.toLocaleString()}</span>
                    <strong>{formatMs(point.ms)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {Object.keys(results).length > 1 ? (
            <ul className="code-runtime__compare" aria-label="Walkthrough times by language">
              {(Object.keys(results) as Language[]).map((lang) => (
                <li key={lang} className={lang === language ? 'is-current' : ''}>
                  <span>{LABELS[lang]}</span>
                  <strong>{formatMs(results[lang] ?? 0)}</strong>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  )
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}
