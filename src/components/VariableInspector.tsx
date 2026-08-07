import './VariableInspector.css'

type Props = {
  variables: Record<string, unknown>
}

export function VariableInspector({ variables }: Props) {
  const entries = Object.entries(variables)

  return (
    <section className="vars">
      <h3 className="vars__title">Variables</h3>
      {entries.length === 0 ? (
        <p className="vars__empty">No locals yet</p>
      ) : (
        <dl className="vars__list">
          {entries.map(([name, value]) => (
            <div key={name} className="vars__row">
              <dt>{name}</dt>
              <dd>{formatValue(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.join(', ')}]`
  if (value !== null && typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
