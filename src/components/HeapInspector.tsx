import { isHeapRef, type CallFrame, type HeapObject } from '../engine/types'
import './HeapInspector.css'

type Props = {
  objects: HeapObject[]
  callStack: CallFrame[]
}

type HeapRow = {
  key: string
  id: string
  kind: string
  detail: string
  pointedBy: string[]
  active: boolean
}

/**
 * Python-Tutor-style heap tied to the call stack.
 * Locals that reference node/structure ids light up those rows (← root*).
 * Idle objects stay visible but dimmed - they still exist in memory.
 */
export function HeapInspector({ objects, callStack }: Props) {
  const rows = objects.flatMap(expandObject)
  if (rows.length === 0) return null

  const aliases = buildAliases(objects)
  const pointers = collectPointers(callStack, rows, aliases)

  const linked = rows.map((row) => {
    const pointedBy = pointers.get(row.id) ?? []
    return { ...row, pointedBy, active: pointedBy.length > 0 }
  })

  const anyLive = linked.some((row) => row.active)

  return (
    <section className="heap-inspector" aria-label="Heap">
      <h3 className="heap-inspector__title">Heap</h3>
      <p className="heap-inspector__hint">
        Memory objects. Stack locals point here
        {anyLive ? ' (← name, * = active frame)' : ''}.
      </p>
      <ul className="heap-inspector__list">
        {linked.map((row) => (
          <li
            key={row.key}
            className={`heap-inspector__row${row.active ? ' is-active' : ' is-idle'}`}
          >
            <div className="heap-inspector__main">
              <span className="heap-inspector__id">{row.id}</span>
              <span className="heap-inspector__kind">{row.kind}</span>
              <span className="heap-inspector__label">{row.detail}</span>
            </div>
            {row.pointedBy.length > 0 ? (
              <p className="heap-inspector__refs">← {row.pointedBy.join(', ')}</p>
            ) : (
              <p className="heap-inspector__refs is-muted">no live refs</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function expandObject(
  object: HeapObject,
): Array<Omit<HeapRow, 'pointedBy' | 'active'>> {
  if (object.kind === 'tree') {
    return object.nodes.map((node) => ({
      key: `${object.id}:${node.id}`,
      id: node.id,
      kind: 'TreeNode',
      detail: `val=${String(node.value)} · L=${node.left ?? 'null'} · R=${node.right ?? 'null'}`,
    }))
  }

  if (object.kind === 'linkedList') {
    return object.nodes.map((node) => ({
      key: `${object.id}:${node.id}`,
      id: node.id,
      kind: 'ListNode',
      detail: `val=${String(node.value)} · next=${node.next ?? 'null'}`,
    }))
  }

  if (object.kind === 'array') {
    return [
      {
        key: object.id,
        id: object.id,
        kind: 'array',
        detail: `${object.label ?? 'array'} [${object.values.join(', ')}]`,
      },
    ]
  }

  if (object.kind === 'hashmap') {
    const entries =
      object.entries.map(([key, value]) => `${key}→${String(value)}`).join(', ') ||
      'empty'
    return [
      {
        key: object.id,
        id: object.id,
        kind: 'map',
        detail: object.label ? `${object.label}: ${entries}` : entries,
      },
    ]
  }

  return [
    {
      key: object.id,
      id: object.id,
      kind: 'stack',
      detail: `${object.label ?? 'stack'} [${object.items.map(String).join(', ')}]`,
    },
  ]
}

/** Map structure id (e.g. "tree") → root / head node id for stack refs. */
function buildAliases(objects: HeapObject[]): Map<string, string> {
  const aliases = new Map<string, string>()
  for (const object of objects) {
    if (object.kind === 'tree' && object.rootId) {
      aliases.set(object.id, object.rootId)
    }
    if (object.kind === 'linkedList' && object.nodes[0]) {
      const head =
        object.pointers?.head ??
        object.pointers?.cur ??
        object.nodes[0].id
      aliases.set(object.id, head)
    }
    if (
      object.kind === 'array' ||
      object.kind === 'hashmap' ||
      object.kind === 'stack' ||
      object.kind === 'queue'
    ) {
      aliases.set(object.id, object.id)
    }
  }
  return aliases
}

function collectPointers(
  callStack: CallFrame[],
  rows: Array<{ id: string }>,
  aliases: Map<string, string>,
): Map<string, string[]> {
  const known = new Set(rows.map((row) => row.id))
  const map = new Map<string, string[]>()

  const resolve = (raw: string): string | null => {
    if (known.has(raw)) return raw
    const aliased = aliases.get(raw)
    if (aliased && known.has(aliased)) return aliased
    return null
  }

  for (const frame of callStack) {
    const mark = frame.active ? '*' : ''
    for (const [name, value] of Object.entries(frame.locals)) {
      for (const raw of targetsOf(value)) {
        const id = resolve(raw)
        if (!id) continue
        const label = `${name}${mark}`
        const list = map.get(id) ?? []
        if (!list.includes(label)) list.push(label)
        map.set(id, list)
      }
    }
  }

  return map
}

function targetsOf(value: unknown): string[] {
  if (value == null) return []
  if (isHeapRef(value)) return [value.ref]
  if (typeof value === 'string') return [value]
  return []
}
