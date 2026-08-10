import type { HeapObject } from '../engine/types'
import { ArrayViz } from '../visualizers/ArrayViz'
import { GridViz } from '../visualizers/GridViz'
import { HashMapViz } from '../visualizers/HashMapViz'
import { LinkedListViz } from '../visualizers/LinkedListViz'
import { HeapViz } from '../visualizers/HeapViz'
import { QueueViz } from '../visualizers/QueueViz'
import { StackViz } from '../visualizers/StackViz'
import { TreeViz } from '../visualizers/TreeViz'
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
          display: object.display,
          metrics: object.metrics,
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

  if (object.kind === 'stack') {
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

  if (object.kind === 'queue') {
    return (
      <QueueViz
        scene={{
          type: 'queue',
          items: object.items,
          frontAction: object.frontAction,
        }}
      />
    )
  }

  if (object.kind === 'heap') {
    return (
      <HeapViz
        scene={{
          type: 'heap',
          items: object.items,
          order: object.order,
          rootAction: object.rootAction,
          focusIndex: object.focusIndex,
          capacity: object.capacity,
          caption: object.caption,
          label: object.label,
        }}
      />
    )
  }

  if (object.kind === 'linkedList') {
    return (
      <LinkedListViz
        scene={{
          type: 'linkedList',
          nodes: object.nodes,
          pointers: object.pointers,
          cycleTo: object.cycleTo,
          focusIds: object.focusIds,
          dangerIds: object.dangerIds,
          discardIds: object.discardIds,
          linkFocus: object.linkFocus,
          caption: object.caption,
        }}
      />
    )
  }

  if (object.kind === 'grid') {
    return (
      <GridViz
        scene={{
          type: 'grid',
          cells: object.cells,
          highlights: object.highlights,
          pointers: object.pointers,
          caption: object.caption,
        }}
      />
    )
  }

  return (
    <TreeViz
      scene={{
        type: 'tree',
        nodes: object.nodes,
        rootId: object.rootId,
        focusIds: object.focusIds,
        viz: object.viz,
      }}
    />
  )
}
