import { isHeapRef, type CallFrame, type LocalValue } from '../engine/types'
import './CallStackPanel.css'

type Props = {
  frames: CallFrame[]
}

/**
 * Abstract call stack (Python-Tutor style).
 * Frames grow downward; the active frame is the deepest (bottom-most).
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

  return (
    <section className="call-stack" aria-label="Call stack">
      <h3 className="call-stack__title">Call stack</h3>
      <ol className="call-stack__frames">
        {frames.map((frame, depth) => (
          <li
            key={`${frame.name}-${depth}`}
            className={`call-stack__frame${frame.active ? ' is-active' : ''}`}
          >
            <header>
              <div className="call-stack__heading">
                <span className="call-stack__depth">#{depth}</span>
                <span className="call-stack__fname">{frame.name}()</span>
              </div>
              {frame.active ? (
                <span className="call-stack__badge">active</span>
              ) : null}
            </header>
            {Object.keys(frame.locals).length === 0 ? (
              <p className="call-stack__no-locals">no locals</p>
            ) : (
              <dl className="call-stack__locals">
                {Object.entries(frame.locals).map(([name, value]) => (
                  <div key={name} className="call-stack__local">
                    <dt>{name}</dt>
                    <dd>{formatLocal(value)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function formatLocal(value: LocalValue): string {
  if (isHeapRef(value)) return `→ ${value.ref}`
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  // Pack node ids are plain strings — render as heap pointers.
  if (typeof value === 'string') {
    if (/^[a-zA-Z_][\w-]*$/.test(value)) return `→ ${value}`
    return value
  }
  if (Array.isArray(value)) return `[${value.join(', ')}]`
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
