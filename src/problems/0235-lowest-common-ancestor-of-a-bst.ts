/**
 * LeetCode #235 - Lowest Common Ancestor of a BST.
 * Iterative walk: both > go right, both < go left, else split = LCA.
 */
import javaSrc from '../../algorithms/0235-lowest-common-ancestor-of-a-bst/Solution.java?raw'
import kotlinSrc from '../../algorithms/0235-lowest-common-ancestor-of-a-bst/Solution.kt?raw'
import pythonSrc from '../../algorithms/0235-lowest-common-ancestor-of-a-bst/solution.py?raw'
import {
  defineInput,
  formatLevelOrder,
  parseIntValue,
  parseLevelOrder,
  type TreeNode,
} from '../engine/input'
import type {
  CallFrame,
  HeapObject,
  ProblemPack,
  Step,
  TreeVizState,
} from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type LcaInput = {
  nodes: TreeNode[]
  rootId: string | null
  values: Array<number | null>
  p: number
  q: number
  pId: string
  qId: string
}

const L = {
  enter: { java: 12, kotlin: 7, python: 13 },
  loop: { java: 14, kotlin: 9, python: 17 },
  goRight: { java: 16, kotlin: 13, python: 19 },
  goLeft: { java: 18, kotlin: 15, python: 21 },
  found: { java: 20, kotlin: 17, python: 23 },
} as const

const TREE_LIMITS = { maxNodes: 12, minVal: -99, maxVal: 99 }

function heap(
  nodes: TreeNode[],
  rootId: string | null,
  focusIds: string[],
  viz?: TreeVizState,
): HeapObject[] {
  return [
    {
      id: 'tree',
      kind: 'tree',
      label: 'TreeNode root',
      nodes,
      rootId,
      focusIds,
      focused: true,
      viz,
    },
  ]
}

function generateSteps(input: LcaInput): Step[] {
  const { nodes, rootId, p, q, pId, qId } = input
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const marks: Record<string, string> = {
    [pId]: 'p',
    [qId]: 'q',
  }
  const steps: Step[] = []
  let stepId = 1

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function viz(extra?: Partial<TreeVizState>): TreeVizState {
    return { marks: { ...marks }, ...extra }
  }

  function frame(activeId: string | null, active = true): CallFrame[] {
    const activeNode = activeId ? byId.get(activeId) : undefined
    return [
      {
        name: 'lowestCommonAncestor',
        active,
        locals: {
          root: rootId,
          p,
          q,
          cur: activeNode ? activeNode.value : null,
        },
      },
    ]
  }

  if (!rootId || nodes.length === 0) {
    return [
      {
        id: 1,
        narrative: 'Empty tree: nowhere to walk. Return null.',
        why: 'LCA needs a root to start the BST walk.',
        codeFocus: L.enter,
        callStack: frame(null),
        heap: heap([], null, []),
      },
    ]
  }

  push({
    narrative: `Enter lowestCommonAncestor. Find LCA of p=${p} and q=${q}. Start at root.`,
    why: 'In a BST, values tell you which way both targets live. No parent pointers needed.',
    codeFocus: L.enter,
    callStack: frame(rootId),
    heap: heap(nodes, rootId, [rootId, pId, qId], viz({
      formula: { nodeId: rootId, text: `p=${p}, q=${q}` },
    })),
  })

  let curId: string | null = rootId
  while (curId != null) {
    const node: TreeNode = byId.get(curId)!
    const bothRight = p > node.value && q > node.value
    const bothLeft = p < node.value && q < node.value

    push({
      narrative: `At ${node.value}. Compare p=${p}, q=${q} to cur.`,
      why: 'One compare decides: both right, both left, or this node is the split (LCA).',
      codeFocus: L.loop,
      callStack: frame(curId),
      heap: heap(nodes, rootId, [curId, pId, qId], viz({
        formula: {
          nodeId: curId,
          text: bothRight
            ? `${p},${q} > ${node.value}`
            : bothLeft
              ? `${p},${q} < ${node.value}`
              : 'split',
        },
      })),
    })

    if (bothRight) {
      const nextId: string | null = node.right
      marks[curId] = '->R'
      push({
        narrative: `Both ${p} and ${q} > ${node.value} -> go right.`,
        why: 'LCA cannot be in the left subtree or at cur; both targets sit on the right.',
        codeFocus: L.goRight,
        callStack: frame(curId),
        heap: heap(nodes, rootId, [curId, nextId ?? curId, pId, qId], viz({
          formula: { nodeId: curId, text: 'go right' },
        })),
      })
      curId = nextId
      continue
    }

    if (bothLeft) {
      const nextId: string | null = node.left
      marks[curId] = '->L'
      push({
        narrative: `Both ${p} and ${q} < ${node.value} -> go left.`,
        why: 'LCA cannot be in the right subtree or at cur; both targets sit on the left.',
        codeFocus: L.goLeft,
        callStack: frame(curId),
        heap: heap(nodes, rootId, [curId, nextId ?? curId, pId, qId], viz({
          formula: { nodeId: curId, text: 'go left' },
        })),
      })
      curId = nextId
      continue
    }

    marks[curId] = 'LCA'
    const reason =
      node.value === p || node.value === q
        ? `${node.value} is one of the targets (or the split). That node is the LCA.`
        : `p and q sit on different sides of ${node.value} (or equal). This is the split point.`
    push({
      narrative: `Return ${node.value} as the LCA.`,
      why: reason,
      codeFocus: L.found,
      callStack: [
        {
          name: 'lowestCommonAncestor',
          active: true,
          locals: {
            root: rootId,
            p,
            q,
            cur: node.value,
            result: node.value,
          },
        },
      ],
      heap: heap(nodes, rootId, [curId, pId, qId], viz({
        formula: { nodeId: curId, text: 'LCA' },
      })),
    })
    return steps
  }

  push({
    narrative: 'Walk fell off the tree. Return null.',
    why: 'Should not happen when p and q exist in the BST.',
    codeFocus: L.enter,
    callStack: frame(null),
    heap: heap(nodes, rootId, [pId, qId], viz()),
  })

  return steps
}

/** Classic LC demo: LCA of 2 and 8 is 6 (the split at the root). */
const defaultValues: Array<number | null> = [6, 2, 8, 0, 4, 7, 9]

const input = defineInput<LcaInput>({
  kind: 'bstLca',
  fields: [
    {
      key: 'root',
      label: 'root (level-order BST)',
      widget: 'text',
      placeholder: '6, 2, 8, 0, 4, 7, 9',
      hint: 'Up to 12 nodes, values -99-99. Must be a BST with distinct values.',
    },
    {
      key: 'p',
      label: 'p',
      widget: 'text',
      placeholder: '2',
    },
    {
      key: 'q',
      label: 'q',
      widget: 'text',
      placeholder: '8',
    },
  ],
  defaultRaw: {
    root: formatLevelOrder(defaultValues),
    p: '2',
    q: '8',
  },
  parse: (raw) => {
    const treeResult = parseLevelOrder(raw.root ?? '', {
      name: 'root',
      ...TREE_LIMITS,
    })
    if (!treeResult.ok) return treeResult

    const pResult = parseIntValue(raw.p ?? '', {
      name: 'p',
      minVal: -99,
      maxVal: 99,
    })
    if (!pResult.ok) return pResult

    const qResult = parseIntValue(raw.q ?? '', {
      name: 'q',
      minVal: -99,
      maxVal: 99,
    })
    if (!qResult.ok) return qResult

    const { nodes, rootId, values } = treeResult.value
    if (!rootId || nodes.length === 0) {
      return { ok: false, errors: ['root must be non-empty for LCA.'] }
    }

    const p = pResult.value
    const q = qResult.value
    if (p === q) {
      return { ok: false, errors: ['p and q must be different nodes.'] }
    }

    const seen = new Set<number>()
    for (const node of nodes) {
      if (seen.has(node.value)) {
        return {
          ok: false,
          errors: [
            'BST demo needs distinct node values so p/q can be located by value.',
          ],
        }
      }
      seen.add(node.value)
    }

    const pNode = nodes.find((n) => n.value === p)
    const qNode = nodes.find((n) => n.value === q)
    if (!pNode) {
      return { ok: false, errors: [`p=${p} is not in the tree.`] }
    }
    if (!qNode) {
      return { ok: false, errors: [`q=${q} is not in the tree.`] }
    }

    return {
      ok: true,
      value: {
        nodes,
        rootId,
        values,
        p,
        q,
        pId: pNode.id,
        qId: qNode.id,
      },
    }
  },
  formatLabel: (value) =>
    `root = [${formatLevelOrder(value.values)}], p = ${value.p}, q = ${value.q}`,
  generateSteps,
  fixtures: [
    {
      name: 'ancestor-case',
      raw: { root: '6, 2, 8, 0, 4', p: '2', q: '4' },
    },
    { name: 'small-split', raw: { root: '2, 1, 3', p: '1', q: '3' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `LCA of BST default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const lowestCommonAncestorOfABst: ProblemPack = {
  id: '0235-lowest-common-ancestor-of-a-bst',
  lcNumber: 235,
  title: 'Lowest Common Ancestor of a BST',
  pattern: 'Tree DFS',
  difficulty: 'Medium',
  insight:
    'Walk from the root: if both targets are greater, go right; both smaller, go left; otherwise the current node is the LCA.',
  invariant:
    'While both p and q lie strictly on one side of cur, the LCA is deeper on that side. The first node that is not on one side is the split.',
  complexity: {
    time: 'O(h)',
    space: 'O(1)',
    notes: 'Iterative walk. Height h; balanced BST ≈ O(log n).',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'BST order lets one walk find the split in O(h); a general binary-tree LCA needs more work.',
  ),
  walkthrough: {
    statement:
      'Given a BST and two nodes p and q, return their lowest common ancestor. The LCA is the deepest node that has both p and q as descendants (a node can be a descendant of itself).',
    keyIdea:
      'Use BST order. Keep walking until p and q are no longer on the same side of the current node.',
    approach: [
      'Start cur = root.',
      'While cur is not null: if both p and q > cur.val, cur = cur.right.',
      'Else if both p and q < cur.val, cur = cur.left.',
      'Else return cur (split, or cur equals p or q).',
    ],
  },
}
