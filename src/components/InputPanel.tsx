import { useMemo, useState } from 'react'
import type { ProblemInputSpec } from '../engine/input'
import './InputPanel.css'

type Props = {
  spec: ProblemInputSpec
  /** Called with generated steps + label after a successful Apply. */
  onApply: (next: { steps: ReturnType<ProblemInputSpec['generateSteps']>; label: string }) => void
}

/**
 * Schema-driven custom input strip.
 * Renders only `spec.fields` - never branches on problem id.
 */
export function InputPanel({ spec, onApply }: Props) {
  const [raw, setRaw] = useState<Record<string, string>>(() => ({ ...spec.defaultRaw }))

  const parsed = useMemo(() => spec.parse(raw), [spec, raw])

  const setField = (key: string, value: string) => {
    setRaw((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    if (!parsed.ok) return
    const steps = spec.generateSteps(parsed.value)
    const label = spec.formatLabel(parsed.value)
    onApply({ steps, label })
  }

  const handleReset = () => {
    setRaw({ ...spec.defaultRaw })
    const again = spec.parse(spec.defaultRaw)
    if (!again.ok) return
    onApply({
      steps: spec.generateSteps(again.value),
      label: spec.formatLabel(again.value),
    })
  }

  return (
    <section className="input-panel" aria-label="Custom input">
      <div className="input-panel__fields">
        {spec.fields.map((field) => (
          <label key={field.key} className="input-panel__field">
            <span className="input-panel__label">{field.label}</span>
            {field.widget === 'text' ? (
              <div className="input-panel__text-row">
                <input
                  type="text"
                  className="input-panel__control"
                  value={raw[field.key] ?? ''}
                  placeholder={field.placeholder}
                  spellCheck={false}
                  onChange={(event) => setField(field.key, event.target.value)}
                />
                {field.sortable ? (
                  <button
                    type="button"
                    className="input-panel__btn"
                    onClick={() => {
                      const parts = (raw[field.key] ?? '')
                        .split(/[\s,]+/)
                        .filter(Boolean)
                      const nums = parts.map(Number)
                      if (nums.some((n) => Number.isNaN(n))) return
                      setField(field.key, nums.slice().sort((a, b) => a - b).join(', '))
                    }}
                  >
                    Sort for me
                  </button>
                ) : null}
                {field.randomize ? (
                  <button
                    type="button"
                    className="input-panel__btn"
                    onClick={() => {
                      const count = 28
                      const values = Array.from({ length: count }, (_, i) => i + 1)
                      for (let i = values.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1))
                        ;[values[i], values[j]] = [values[j]!, values[i]!]
                      }
                      setField(field.key, values.join(', '))
                    }}
                  >
                    Randomize
                  </button>
                ) : null}
              </div>
            ) : (
              <select
                className="input-panel__control"
                value={raw[field.key] ?? ''}
                onChange={(event) => setField(field.key, event.target.value)}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {field.hint ? <span className="input-panel__hint">{field.hint}</span> : null}
          </label>
        ))}
      </div>

      <div className="input-panel__actions">
        <button
          type="button"
          className="input-panel__btn input-panel__btn--primary"
          disabled={!parsed.ok}
          onClick={handleApply}
        >
          Apply
        </button>
        <button type="button" className="input-panel__btn" onClick={handleReset}>
          Reset example
        </button>
      </div>

      {!parsed.ok ? (
        <ul className="input-panel__errors">
          {parsed.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : (
        <p className="input-panel__ok">Ready - Apply to rebuild the walkthrough.</p>
      )}
    </section>
  )
}
