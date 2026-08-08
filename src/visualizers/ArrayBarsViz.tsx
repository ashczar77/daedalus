import type { ArrayScene } from '../engine/types'
import './ArrayBarsViz.css'

type Props = {
  scene: ArrayScene
}

/** Color bucket for pointer badges (matches ArrayViz). */
function pointerTone(name: string): string {
  const key = name.toLowerCase()
  if (key === 'left' || key === 'lo' || key === 'l') return 'left'
  if (key === 'right' || key === 'hi' || key === 'r') return 'right'
  if (key === 'mid' || key === 'm') return 'mid'
  if (key === 'i' || key === 'j' || key === 'k') return key
  return 'default'
}

type WaterRect = {
  left: number
  right: number
  height: number
  area: number
  kind: 'current' | 'best'
}

/**
 * Histogram view for height arrays: vertical bars + water rectangle between
 * left/right pointers (Container With Most Water teaching surface).
 */
export function ArrayBarsViz({ scene }: Props) {
  const heights = scene.values.map((value) =>
    typeof value === 'number' ? value : Number(value),
  )
  const maxHeight = Math.max(...heights, 1)
  const n = heights.length

  const highlightMap = new Map(
    (scene.highlights ?? []).map((highlight) => [highlight.index, highlight.role]),
  )
  const pointerEntries = Object.entries(scene.pointers ?? {})
  const pointersByIndex = new Map<number, string[]>()
  for (const [name, index] of pointerEntries) {
    const list = pointersByIndex.get(index) ?? []
    list.push(name)
    pointersByIndex.set(index, list)
  }

  const left = scene.pointers?.left
  const right = scene.pointers?.right
  const waters: WaterRect[] = []

  // Live container while left < right.
  if (
    left != null &&
    right != null &&
    left < right &&
    Number.isFinite(heights[left]) &&
    Number.isFinite(heights[right])
  ) {
    const h = Math.min(heights[left], heights[right])
    const area = scene.metrics?.area ?? h * (right - left)
    waters.push({ left, right, height: h, area, kind: 'current' })
  }

  // Winning container once the scan ends (left >= right) and found pair is marked.
  const found = (scene.highlights ?? [])
    .filter((h) => h.role === 'found')
    .map((h) => h.index)
    .sort((a, b) => a - b)
  if (
    scene.metrics?.best != null &&
    found.length >= 2 &&
    (left == null || right == null || left >= right)
  ) {
    const bl = found[0]
    const br = found[found.length - 1]
    const h = Math.min(heights[bl], heights[br])
    waters.push({
      left: bl,
      right: br,
      height: h,
      area: scene.metrics.best,
      kind: 'best',
    })
  }

  const dense = n >= 16
  const showAxisValues = n <= 28

  return (
    <div className={`array-bars${dense ? ' is-dense' : ''}`}>
      {scene.label ? <p className="array-bars__label">{scene.label}</p> : null}

      {!dense ? (
        <div className="array-bars__ptr-row" aria-hidden="true">
          {heights.map((_, index) => {
            const ptrs = pointersByIndex.get(index) ?? []
            return (
              <div key={index} className="array-bars__ptr-cell" style={{ width: `${100 / n}%` }}>
                {ptrs.map((name) => (
                  <span
                    key={name}
                    className={`array-bars__ptr-badge is-${pointerTone(name)}`}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )
          })}
        </div>
      ) : null}

      <div className="array-bars__chart" role="list" aria-label="height bars">
        {waters.map((water) => {
          const leftPct = ((water.left + 0.5) / n) * 100
          const rightPct = ((water.right + 0.5) / n) * 100
          const widthPct = Math.max(rightPct - leftPct, 0)
          const heightPct = (water.height / maxHeight) * 100
          return (
            <div
              key={`${water.kind}-${water.left}-${water.right}`}
              className={`array-bars__water is-${water.kind}`}
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
              }}
              title={`area = ${water.area}`}
            >
              <span className="array-bars__water-label">
                {water.kind === 'best' ? 'best ' : ''}
                {water.area}
              </span>
            </div>
          )
        })}

        {heights.map((height, index) => {
          const role = highlightMap.get(index)
          const ptrs = pointersByIndex.get(index) ?? []
          const tones = [...new Set(ptrs.map(pointerTone))]
          const heightPct = (height / maxHeight) * 100
          const colClass = [
            'array-bars__col',
            role ? `is-${role}` : '',
            tones.length > 0 ? 'has-ptr' : '',
            ...tones.map((tone) => `has-ptr--${tone}`),
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div
              key={index}
              className={colClass}
              role="listitem"
              style={{ width: `${100 / n}%` }}
            >
              <div
                className="array-bars__bar"
                style={{ height: `${heightPct}%` }}
              />
            </div>
          )
        })}
      </div>

      {showAxisValues ? (
        <div className="array-bars__axis">
          {heights.map((height, index) => (
            <div key={index} className="array-bars__axis-cell" style={{ width: `${100 / n}%` }}>
              <span className="array-bars__value">{height}</span>
              {!dense ? <span className="array-bars__index">{index}</span> : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="array-bars__dense-note">{n} bars — colors mark compares, swaps, and sorted regions</p>
      )}

      <div className="array-bars__footer">
        {pointerEntries.length > 0 ? (
          <div className="array-bars__pointers">
            {pointerEntries.map(([name, index]) => (
              <span
                key={name}
                className={`array-bars__pointer is-${pointerTone(name)}`}
              >
                <strong>{name}</strong> → {index}
              </span>
            ))}
          </div>
        ) : null}
        {scene.metrics?.area != null || scene.metrics?.best != null ? (
          <div className="array-bars__metrics">
            {scene.metrics.area != null ? (
              <span>
                area = <strong>{scene.metrics.area}</strong>
              </span>
            ) : null}
            {scene.metrics.best != null ? (
              <span>
                best = <strong>{scene.metrics.best}</strong>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
