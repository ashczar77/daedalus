import type { HeapObject } from '../engine/types'
import { ArrayViz } from '../visualizers/ArrayViz'
import { HashMapViz } from '../visualizers/HashMapViz'
import { StackViz } from '../visualizers/StackViz'
import './HeapPanel.css'

type Props = {
  objects: HeapObject[]
}

/**
 * Abstract heap: live data structures the algorithm owns.
 * Reuses existing animated visualizers so choreography stays intact.
 */
export function HeapPanel({ objects }: Props) {
  return (
    <section className="heap" aria-label="Heap">
      <h3 className="heap__title">Heap</h3>
      {objects.length === 0 ? (
        <p className="heap__empty">No heap objects yet</p>
      ) : (
        <div className="heap__objects">
          {objects.map((object) => (
            <article
              key={object.id}
              className={`heap__object${object.focused ? ' is-focused' : ''}`}
            >
              <header className="heap__object-head">
                <span className="heap__id">{object.id}</span>
                {object.label ? (
                  <span className="heap__label">{object.label}</span>
                ) : null}
              </header>
              <HeapObjectView object={object} />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function HeapObjectView({ object }: { object: HeapObject }) {
  if (object.kind === 'array') {
    return (
      <ArrayViz
        scene={{
          type: 'array',
          values: object.values,
          highlights: object.highlights,
          pointers: object.pointers,
        }}
      />
    )
  }

  if (object.kind === 'hashmap') {
    return (
      <HashMapViz
        scene={{
          type: 'hashmap',
          entries: object.entries,
          focusKeys: object.focusKeys,
        }}
      />
    )
  }

  return (
    <StackViz
      scene={{
        type: 'stack',
        items: object.items,
        topAction: object.topAction,
      }}
    />
  )
}
