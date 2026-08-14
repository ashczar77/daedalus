import { Fragment } from 'react'
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
  if (key === 'cur' || key === 'i' || key === 'j') return 'cur'
  return 'default'
}

/**
 * Renders a 2D grid with row/col indices, cell roles, and named cursors.
 * Pointer badges sit inside the cell (above the value) so they never cover
 * the c0/c1 axis labels above the board.
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

  const rowCount = scene.cells.length
  const colCount = scene.cells[0]?.length ?? 0
  const pointerEntries = Object.entries(scene.pointers ?? {})
  const showAxes = rowCount > 0 && colCount > 0
  const cellTrack = `minmax(clamp(1.7rem, 7.5vw, 2.5rem), 1fr)`

  return (
    <div className="grid-viz">
      {scene.label ? <p className="grid-viz__label">{scene.label}</p> : null}
      <div
        className="grid-viz__board"
        role="grid"
        aria-label={scene.label ?? 'grid'}
        style={{
          gridTemplateColumns: showAxes
            ? `auto repeat(${colCount}, ${cellTrack})`
            : colCount > 0
              ? `repeat(${colCount}, ${cellTrack})`
              : undefined,
        }}
      >
        {showAxes ? (
          <>
            <span className="grid-viz__axis-corner" aria-hidden="true" />
            {Array.from({ length: colCount }, (_, c) => (
              <span key={`col-${c}`} className="grid-viz__axis-col">
                c{c}
              </span>
            ))}
          </>
        ) : null}

        {scene.cells.map((row, r) => (
          <Fragment key={`row-${r}`}>
            {showAxes ? (
              <span className="grid-viz__axis-row">r{r}</span>
            ) : null}
            {row.map((cell, c) => {
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
                    ptrs.length ? 'has-badge' : '',
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
            })}
          </Fragment>
        ))}
      </div>
      {pointerEntries.length > 0 ? (
        <div className="grid-viz__pointers">
          {pointerEntries.map(([name, [row, col]]) => (
            <span
              key={name}
              className={`grid-viz__pointer is-${pointerTone(name)}`}
            >
              <strong>{name}</strong> → (r{row}, c{col})
            </span>
          ))}
        </div>
      ) : null}
      {scene.caption ? <p className="grid-viz__caption">{scene.caption}</p> : null}
    </div>
  )
}
