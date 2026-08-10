import type { GridScene } from '../engine/types'
import './GridViz.css'

type Props = {
  scene: GridScene
}

/**
 * Renders a 2D grid with optional cell roles and named cursors (scan / dfs).
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

  return (
    <div className="grid-viz">
      {scene.label ? <p className="grid-viz__label">{scene.label}</p> : null}
      <div
        className="grid-viz__board"
        role="grid"
        aria-label={scene.label ?? 'grid'}
        style={{
          gridTemplateColumns: `repeat(${scene.cells[0]?.length ?? 0}, minmax(1.8rem, 2.4rem))`,
        }}
      >
        {scene.cells.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`
            const role = roleAt.get(key)
            const ptrs = pointersAt.get(key) ?? []
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
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {ptrs.length > 0 ? (
                  <span className="grid-viz__ptrs">{ptrs.join(' · ')}</span>
                ) : null}
                <span className="grid-viz__val">{String(cell)}</span>
              </div>
            )
          }),
        )}
      </div>
      {scene.caption ? <p className="grid-viz__caption">{scene.caption}</p> : null}
    </div>
  )
}
