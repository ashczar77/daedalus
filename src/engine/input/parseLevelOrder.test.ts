import { describe, expect, it } from 'vitest'
import { parseLevelOrder } from './parseLevelOrder'

describe('parseLevelOrder', () => {
  it('parses empty and bracketed trees', () => {
    expect(parseLevelOrder('')).toEqual({
      ok: true,
      value: { nodes: [], rootId: null, values: [] },
    })
    expect(parseLevelOrder('[]')).toEqual({
      ok: true,
      value: { nodes: [], rootId: null, values: [] },
    })
  })

  it('builds parent/child links from level order', () => {
    const result = parseLevelOrder('3,4,5,1,2')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.rootId).toBe('t0')
    expect(result.value.nodes).toHaveLength(5)
    const root = result.value.nodes.find((n) => n.id === result.value.rootId)
    expect(root?.value).toBe(3)
    const left = result.value.nodes.find((n) => n.id === root?.left)
    const right = result.value.nodes.find((n) => n.id === root?.right)
    expect(left?.value).toBe(4)
    expect(right?.value).toBe(5)
  })

  it('supports null children and rejects junk', () => {
    const withNull = parseLevelOrder('1,null,2')
    expect(withNull.ok).toBe(true)
    if (withNull.ok) {
      const root = withNull.value.nodes[0]!
      expect(root.left).toBeNull()
      expect(root.right).not.toBeNull()
    }
    expect(parseLevelOrder('1,nope').ok).toBe(false)
  })
})
