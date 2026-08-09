import { useState } from 'react'
import type { HeapObject } from '../engine/types'
import { ArrayViz } from '../visualizers/ArrayViz'
import { HashMapViz } from '../visualizers/HashMapViz'
import { LinkedListViz } from '../visualizers/LinkedListViz'
import { QueueViz } from '../visualizers/QueueViz'
import { StackViz } from '../visualizers/StackViz'
import { TreeViz } from '../visualizers/TreeViz'
import './StructureStage.css'

type Props = {
  objects: HeapObject[]
}

const SCALE_MIN = 0.7
const SCALE_MAX = 1.6
const SCALE_STEP = 0.15
const SCALE_DEFAULT = 1

/**
 * Primary teaching surface: large structure drawings from the step's heap objects.
 * Heap inspector (right rail) lists the same objects without re-drawing them.
 * Zoom controls scale every visualizer (arrays, bars, lists, trees).
 */
export function StructureStage({ objects }: Props) {
  const [scale, setScale] = useState(SCALE_DEFAULT)

  return (
    <section
      className="structure-stage"
      aria-label="Visualization"
      style={{ ['--viz-scale' as string]: String(scale) }}
    >
      <div className="structure-stage__header">
        <h3 className="structure-stage__title">Visualization</h3>
        <div className="structure-stage__zoom" role="group" aria-label="Visualization size">
          <button
            type="button"
            className="structure-stage__zoom-btn"
            aria-label="Decrease visualization size"
            disabled={scale <= SCALE_MIN + 0.001}
            onClick={() =>
              setScale((value) => Math.max(SCALE_MIN, roundScale(value - SCALE_STEP)))
            }
          >
            -
          </button>
          <button
            type="button"
            className="structure-stage__zoom-btn"
            aria-label="Increase visualization size"
            disabled={scale >= SCALE_MAX - 0.001}
            onClick={() =>
              setScale((value) => Math.min(SCALE_MAX, roundScale(value + SCALE_STEP)))
            }
          >
            +
          </button>
        </div>
      </div>

      {objects.length === 0 ? (
        <p className="structure-stage__empty">No structures on this step</p>
      ) : (
        <div className="structure-stage__viewport">
          <div
            className={`structure-stage__canvas${objects.length > 1 ? ' is-multi' : ''}`}
          >
            {objects.map((object) => (
              <div
                key={structureObjectKey(object)}
                className={`structure-stage__item${object.focused ? ' is-focused' : ''}`}
              >
                <StructureView object={object} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function roundScale(value: number): number {
  return Math.round(value * 100) / 100
}

/** Include pointer topology so tree/list swaps remount instead of silently reusing DOM. */
function structureObjectKey(object: HeapObject): string {
  if (object.kind === 'tree') {
    const links = object.nodes
      .map((node) => `${node.id}:${node.left ?? ''}:${node.right ?? ''}`)
      .join('|')
    return `${object.id}:${links}`
  }
  if (object.kind === 'linkedList') {
    const links = object.nodes
      .map((node) => `${node.id}>${node.next ?? ''}`)
      .join('|')
    return `${object.id}:${links}`
  }
  return object.id
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

  if (object.kind === 'queue') {
    return (
      <QueueViz
        scene={{
          type: 'queue',
          items: object.items,
          frontAction: object.frontAction,
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
