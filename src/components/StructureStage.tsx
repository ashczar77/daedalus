import type { HeapObject } from '../engine/types'
import { ArrayViz } from '../visualizers/ArrayViz'
import { HashMapViz } from '../visualizers/HashMapViz'
import { LinkedListViz } from '../visualizers/LinkedListViz'
import { StackViz } from '../visualizers/StackViz'
import { TreeViz } from '../visualizers/TreeViz'
import './StructureStage.css'

type Props = {
  objects: HeapObject[]
}

/**
 * Primary teaching surface: large structure drawings from the step's heap objects.
 * Heap inspector (right rail) lists the same objects without re-drawing them.
 */
export function StructureStage({ objects }: Props) {
  if (objects.length === 0) {
    return (
      <section className="structure-stage" aria-label="Visualization">
        <h3 className="structure-stage__title">Visualization</h3>
        <p className="structure-stage__empty">No structures on this step</p>
      </section>
    )
  }

  return (
    <section className="structure-stage" aria-label="Visualization">
      <h3 className="structure-stage__title">Visualization</h3>
      <div className="structure-stage__canvas">
        {objects.map((object) => (
          <div
            key={object.id}
            className={`structure-stage__item${object.focused ? ' is-focused' : ''}`}
          >
            <StructureView object={object} />
          </div>
        ))}
      </div>
    </section>
  )
}

function StructureView({ object }: { object: HeapObject }) {
  if (object.kind === 'array') {
    return (
      <ArrayViz
        scene={{
          type: 'array',
          values: object.values,
          highlights: object.highlights,
          pointers: object.pointers,
          label: object.label,
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
          label: object.label,
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
          label: object.label,
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
        label: object.label,
        viz: object.viz,
      }}
    />
  )
}
