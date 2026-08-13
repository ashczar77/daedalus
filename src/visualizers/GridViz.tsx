import type { GridScene } from '../engine/types'
import './GridViz.css'

type Props = {
  scene: GridScene
}

/** Color bucket for common grid cursors (matches ArrayViz tones). */
function pointerTone(name: string): string {
  const key = name.toLowerCase()
  if (key === 'left' || key === 'lo' || key === 'l') return 'left'
  if (key === 'right' || key === 'hi' || key === 'r') return 'right'
  if (key === 'mid' || key === 'm') return 'mid'
  if (key === 'tip' || key === 'cur' || key === 'i' || key === 'j') return 'tip'
  return 'default'
}

/**
 * Renders a 2D grid with optional cell roles and named cursors.
 * Pointers are stacked badges above the cell so they do not cover the value.
 */
export function GridViz({ scene }: Props) {
  const roleAt = new Map<string, string>()
  for (const h of scene.highlights ?? []) {
    roleAt.set(`${h.row},${h.col}`, h.role)
  }

  const pointersAt = new Map<string, string[]>()
  for (const [name, [row, col]] of Object.entries(scene.pointers ?? {})) {
    const key = `${row},${col}`
    const list = pointersAt.get(key) ?? []
    list.push(name)
    pointersAt.set(key, list)
  }

  const cols = scene.cells[0]?.length ?? 0
  const pointerEntries = Object.entries(scene.pointers ?? {})

  return (
    <div className="grid-viz">
      {scene.label ? <p className="grid-viz__label">{scene.label}</p> : null}
      <div
        className="grid-viz__board"
        role="grid"
        aria-label={scene.label ?? 'grid'}
        style={{
          gridTemplateColumns:
            cols > 0
              ? `repeat(${cols}, minmax(clamp(1.55rem, 7vw, 2.35rem), 1fr))`
              : undefined,
        }}
      >
        {scene.cells.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`
            const role = roleAt.get(key)
            const ptrs = pointersAt.get(key) ?? []
            const tones = [...new Set(ptrs.map(pointerTone))]
            const isLand = String(cell) === '1'
            const isWater = String(cell) === '0'
            return (
              <div
                key={key}
                role="gridcell"
                className={[
                  'grid-viz__cell',
                  isLand ? 'is-land' : '',
                  isWater ? 'is-water' : '',
                  role ? `is-${role}` : '',
                  ptrs.length ? 'has-ptr' : '',
                  ...tones.map((tone) => `has-ptr--${tone}`),
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {ptrs.length > 0 ? (
                  <div className="grid-viz__ptr-stack" aria-hidden="true">
                    {ptrs.map((name) => (
                      <span
                        key={name}
                        className={`grid-viz__ptr-badge is-${pointerTone(name)}`}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : null}
                <span className="grid-viz__val">{String(cell)}</span>
              </div>
            )
          }),
        )}
      </div>
      {pointerEntries.length > 0 ? (
        <div className="grid-viz__pointers">
          {pointerEntries.map(([name, [row, col]]) => (
            <span
              key={name}
              className={`grid-viz__pointer is-${pointerTone(name)}`}
            >
              <strong>{name}</strong> → ({row},{col})
            </span>
          ))}
        </div>
      ) : null}
      {scene.caption ? <p className="grid-viz__caption">{scene.caption}</p> : null}
    </div>
  )
}
