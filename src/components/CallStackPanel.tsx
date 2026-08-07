import { isHeapRef, type CallFrame, type LocalValue } from '../engine/types'
import './CallStackPanel.css'

type Props = {
  frames: CallFrame[]
}

/**
 * Abstract call stack (Python-Tutor style).
 * The active frame is the current execution context; locals may be heap refs.
 */
export function CallStackPanel({ frames }: Props) {
  if (frames.length === 0) {
    return (
      <section className="call-stack">
        <h3 className="call-stack__title">Call stack</h3>
        <p className="call-stack__empty">No frames</p>
      </section>
    )
  }

  // Display top-of-stack at the top of the panel (active frame first visually).
  const ordered = [...frames].reverse()

  return (
    <section className="call-stack" aria-label="Call stack">
      <h3 className="call-stack__title">Call stack</h3>
      <div className="call-stack__frames">
        {ordered.map((frame, index) => (
          <article
            key={`${frame.name}-${index}`}
            className={`call-stack__frame${frame.active ? ' is-active' : ''}`}
          >
            <header>
              <span className="call-stack__fname">{frame.name}()</span>
              {frame.active ? (
                <span className="call-stack__badge">active</span>
              ) : null}
            </header>
            <dl className="call-stack__locals">
              {Object.entries(frame.locals).map(([name, value]) => (
                <div key={name} className="call-stack__local">
                  <dt>{name}</dt>
                  <dd>{formatLocal(value)}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}

function formatLocal(value: LocalValue): string {
  if (isHeapRef(value)) return `→ heap:${value.ref}`
  if (typeof value === 'string') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.join(', ')}]`
  if (value !== null && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
