import type { ParseResult } from './types'

export type TreeNode = {
  id: string
  value: number
  left: string | null
  right: string | null
}

export type LevelOrderLimits = {
  name?: string
  maxNodes?: number
  minVal?: number
  maxVal?: number
}

/**
 * Parse level-order tree text: `1,2,3,null,4` or `[]`.
 * Returns nodes + rootId (null if empty tree).
 */
export function parseLevelOrder(
  raw: string,
  limits: LevelOrderLimits = {},
): ParseResult<{ nodes: TreeNode[]; rootId: string | null; values: Array<number | null> }> {
  const name = limits.name ?? 'tree'
  const maxNodes = limits.maxNodes ?? 12
  const minVal = limits.minVal ?? -99
  const maxVal = limits.maxVal ?? 99

  let text = raw.trim()
  if (text.startsWith('[') && text.endsWith(']')) {
    text = text.slice(1, -1).trim()
  }
  if (text === '') {
    return { ok: true, value: { nodes: [], rootId: null, values: [] } }
  }

  const parts = text.split(/[\s,]+/).filter(Boolean)
  const values: Array<number | null> = []
  for (const part of parts) {
    if (part === 'null' || part === 'None' || part === '_') {
      values.push(null)
      continue
    }
    if (!/^-?\d+$/.test(part)) {
      return {
        ok: false,
        errors: [`“${part}” is not an integer or null in ${name}.`],
      }
    }
    const n = Number(part)
    if (n < minVal || n > maxVal) {
      return {
        ok: false,
        errors: [`${name} values must be between ${minVal} and ${maxVal} (got ${n}).`],
      }
    }
    values.push(n)
  }

  if (values[0] == null) {
    return { ok: true, value: { nodes: [], rootId: null, values: [] } }
  }

  const nodeCount = values.filter((v) => v != null).length
  if (nodeCount > maxNodes) {
    return {
      ok: false,
      errors: [`${name} supports at most ${maxNodes} nodes (got ${nodeCount}).`],
    }
  }

  type Draft = { id: string; value: number; left: string | null; right: string | null }
  const nodes: Draft[] = []
  const queue: Draft[] = []
  const root: Draft = { id: 't0', value: values[0], left: null, right: null }
  nodes.push(root)
  queue.push(root)
  let i = 1
  let nextId = 1

  while (queue.length > 0 && i < values.length) {
    const parent = queue.shift()!
    if (i < values.length) {
      const leftVal = values[i++]
      if (leftVal != null) {
        const child: Draft = {
          id: `t${nextId++}`,
          value: leftVal,
          left: null,
          right: null,
        }
        parent.left = child.id
        nodes.push(child)
        queue.push(child)
      }
    }
    if (i < values.length) {
      const rightVal = values[i++]
      if (rightVal != null) {
        const child: Draft = {
          id: `t${nextId++}`,
          value: rightVal,
          left: null,
          right: null,
        }
        parent.right = child.id
        nodes.push(child)
        queue.push(child)
      }
    }
  }

  return {
    ok: true,
    value: { nodes, rootId: root.id, values },
  }
}

export function formatLevelOrder(values: Array<number | null>): string {
  if (values.length === 0) return ''
  return values.map((v) => (v == null ? 'null' : String(v))).join(', ')
}
