/**
 * LeetCode #98 - Validate Binary Search Tree.
 * Tree DFS with open interval bounds (low, high).
 */
import javaSrc from '../../algorithms/0098-validate-binary-search-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0098-validate-binary-search-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0098-validate-binary-search-tree/solution.py?raw'
import {
  defineInput,
  formatLevelOrder,
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

type TreeInput = {
  nodes: TreeNode[]
  rootId: string | null
  values: Array<number | null>
}

const NEG_INF = Number.NEGATIVE_INFINITY
const POS_INF = Number.POSITIVE_INFINITY

const L = {
  wrapper: { java: 13, kotlin: 8, python: 14 },
  dfs: { java: 16, kotlin: 11, python: 16 },
  nulls: { java: 18, kotlin: 12, python: 18 },
  /** The bounds `if` itself (check before recurse / return false). */
  check: { java: 20, kotlin: 13, python: 19 },
  fail: { java: 21, kotlin: 13, python: 20 },
  recurse: { java: 23, kotlin: 14, python: 21 },
} as const

const TREE_LIMITS = { maxNodes: 12, minVal: -99, maxVal: 99 }

function fmtBound(n: number): string {
  if (n === NEG_INF) return '-∞'
  if (n === POS_INF) return '+∞'
  return String(n)
}

function fmtRange(low: number, high: number): string {
  return `(${fmtBound(low)}, ${fmtBound(high)})`
}

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

type DfsFrame = {
  nodeId: string | null
  low: number
  high: number
  result?: boolean
}

function dfsLocals(f: DfsFrame): CallFrame['locals'] {
  const out: CallFrame['locals'] = {
    node: f.nodeId,
    low: fmtBound(f.low),
    high: fmtBound(f.high),
  }
  if (f.result !== undefined) out.result = f.result
  return out
}

function generateSteps(input: TreeInput): Step[] {
  const { nodes, rootId } = input
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const marks: Record<string, string> = {}
  const steps: Step[] = []
  let stepId = 1
  const stack: DfsFrame[] = []
  const dense = nodes.length > 8

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function viz(extra?: Partial<TreeVizState>): TreeVizState {
    return { marks: { ...marks }, ...extra }
  }

  function frames(activeIdx: number | null, wrapperActive = false): CallFrame[] {
    const outer: CallFrame = {
      name: 'isValidBST',
      active: wrapperActive || activeIdx === null,
      locals: {},
    }
    const inner = stack.map((f, i) => ({
      name: 'dfs',
      active: !wrapperActive && activeIdx === i,
      locals: dfsLocals(f),
    }))
    return [outer, ...inner]
  }

  if (!rootId || nodes.length === 0) {
    return [
      {
        id: 1,
        narrative: 'Empty tree: dfs(null) → true. An empty tree is a valid BST.',
        why: 'No node can violate the BST ordering.',
        codeFocus: L.wrapper,
        callStack: [
          {
            name: 'isValidBST',
            active: true,
            locals: { result: true },
          },
        ],
        heap: heap([], null, []),
      },
    ]
  }

  function dfs(nodeId: string | null, low: number, high: number): boolean {
    if (nodeId === null) {
      return true
    }

    const node = byId.get(nodeId)!
    stack.push({ nodeId, low, high })
    marks[nodeId] = fmtRange(low, high)

    if (stack.length === 1 || !dense) {
      push({
        narrative:
          stack.length === 1
            ? `isValidBST → dfs(root=${node.value}, ${fmtRange(low, high)}).`
            : `Enter dfs at ${node.value} with bounds ${fmtRange(low, high)}.`,
        why: 'Every node must stay strictly inside its open interval.',
        codeFocus: stack.length === 1 ? L.wrapper : L.dfs,
        callStack: frames(stack.length - 1),
        heap: heap(nodes, rootId, [nodeId], viz({
          formula: { nodeId, text: fmtRange(low, high) },
        })),
      })
    }

    const outOfBounds = node.value <= low || node.value >= high

    // Always land on the bounds `if` so the player sees the check before recurse/fail.
    if (stack.length === 1 || !dense || outOfBounds) {
      push({
        narrative: outOfBounds
          ? `Check: ${node.value} <= ${fmtBound(low)} || ${node.value} >= ${fmtBound(high)} → true (out of bounds).`
          : `Check: ${node.value} <= ${fmtBound(low)} || ${node.value} >= ${fmtBound(high)} → false (still inside ${fmtRange(low, high)}).`,
        why: 'This is the BST gate: fail fast if val is outside the open interval.',
        codeFocus: L.check,
        callStack: frames(stack.length - 1),
        heap: heap(nodes, rootId, [nodeId], viz({
          formula: {
            nodeId,
            text: outOfBounds
              ? `${node.value}∉${fmtRange(low, high)}`
              : `${node.value}∈${fmtRange(low, high)}`,
          },
        })),
      })
    }

    if (outOfBounds) {
      const frame = stack[stack.length - 1]!
      frame.result = false
      marks[nodeId] = 'bad'
      push({
        narrative: `Return false at ${node.value}.`,
        why: 'Local parent checks are not enough; ancestors tighten the interval.',
        codeFocus: L.fail,
        callStack: frames(stack.length - 1),
        heap: heap(nodes, rootId, [nodeId], {
          ...viz(),
          formula: {
            nodeId,
            text: `${node.value}∉${fmtRange(low, high)}`,
          },
        }),
      })
      stack.pop()
      return false
    }

    if (!dense) {
      push({
        narrative: `Bounds OK. Check left (${fmtBound(low)}, ${node.value}), then right (${node.value}, ${fmtBound(high)}).`,
        why: 'Left subtree must be < val; right subtree must be > val (and still respect ancestors).',
        codeFocus: L.recurse,
        callStack: frames(stack.length - 1),
        heap: heap(nodes, rootId, [nodeId], viz({
          formula: { nodeId, text: 'ok → L then R' },
        })),
      })
    }

    if (node.left === null && !dense) {
      push({
        narrative: `Left of ${node.value} is null → true.`,
        why: 'Missing children never break BST order.',
        codeFocus: L.nulls,
        callStack: frames(stack.length - 1),
        heap: heap(nodes, rootId, [nodeId], {
          ...viz(),
          nullCall: { parentId: nodeId, side: 'left', text: 'true' },
        }),
      })
    }

    const leftOk = dfs(node.left, low, node.value)
    if (!leftOk) {
      const frame = stack[stack.length - 1]!
      frame.result = false
      marks[nodeId] = 'bad'
      push({
        narrative: `Left of ${node.value} failed → propagate false.`,
        why: 'One bad node makes the whole tree invalid.',
        codeFocus: L.recurse,
        callStack: frames(stack.length - 1),
        heap: heap(nodes, rootId, [nodeId], viz()),
      })
      stack.pop()
      return false
    }

    if (node.right === null && !dense) {
      push({
        narrative: `Right of ${node.value} is null → true.`,
        why: 'Same base case on the other side.',
        codeFocus: L.nulls,
        callStack: frames(stack.length - 1),
        heap: heap(nodes, rootId, [nodeId], {
          ...viz(),
          nullCall: { parentId: nodeId, side: 'right', text: 'true' },
        }),
      })
    }

    const rightOk = dfs(node.right, node.value, high)
    const frame = stack[stack.length - 1]!
    frame.result = rightOk
    if (rightOk) {
      marks[nodeId] = '✓'
      push({
        narrative: `Subtree at ${node.value} is a valid BST.`,
        why: 'Node and both sides satisfied the inherited bounds.',
        codeFocus: L.recurse,
        callStack: frames(stack.length - 1),
        heap: heap(nodes, rootId, [nodeId], viz({
          formula: { nodeId, text: 'true' },
        })),
      })
    } else {
      marks[nodeId] = 'bad'
      push({
        narrative: `Right of ${node.value} failed → propagate false.`,
        why: 'Failure bubbles up the call stack.',
        codeFocus: L.recurse,
        callStack: frames(stack.length - 1),
        heap: heap(nodes, rootId, [nodeId], viz()),
      })
    }
    stack.pop()
    return rightOk
  }

  const ok = dfs(rootId, NEG_INF, POS_INF)
  push({
    narrative: ok
      ? 'dfs(root) → true. Return true.'
      : 'dfs(root) → false. Return false.',
    why: 'Wrapper only forwards the bounds DFS result.',
    codeFocus: L.wrapper,
    callStack: [
      {
        name: 'isValidBST',
        active: true,
        locals: { result: ok },
      },
    ],
    heap: heap(nodes, rootId, [rootId], viz()),
  })

  return steps
}

/**
 * Classic teaching case: 3 is left of 6 (ok locally) but sits under right of 5,
 * so bounds (5, 6) catch it.
 */
const defaultValues: Array<number | null> = [5, 4, 6, null, null, 3, 7]

const input = defineInput<TreeInput>({
  kind: 'levelOrderTree',
  fields: [
    {
      key: 'root',
      label: 'root (level-order)',
      widget: 'text',
      placeholder: '5, 4, 6, null, null, 3, 7',
      hint: 'Up to 12 nodes, values -99-99',
    },
  ],
  defaultRaw: { root: formatLevelOrder(defaultValues) },
  parse: (raw) =>
    parseLevelOrder(raw.root ?? '', { name: 'root', ...TREE_LIMITS }),
  formatLabel: (value) =>
    value.rootId
      ? `root = [${formatLevelOrder(value.values)}]`
      : 'root = [] (empty)',
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { root: '' } },
    { name: 'valid', raw: { root: '2, 1, 3' } },
    { name: 'invalid-local', raw: { root: '5, 1, 4, null, null, 3, 6' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Validate BST default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const validateBinarySearchTree: ProblemPack = {
  id: '0098-validate-binary-search-tree',
  lcNumber: 98,
  title: 'Validate Binary Search Tree',
  pattern: 'Tree DFS',
  difficulty: 'Medium',
  insight:
    'Carry an open interval (low, high); left gets (low, val), right gets (val, high). Parent-only checks miss deep violations.',
  invariant:
    'At every node, low < val < high. Bounds come from all ancestors, not just the parent.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'One DFS with bounds; naively checking every ancestor pair per node is slower.',
  ),
  walkthrough: {
    statement:
      'Given a binary tree, determine if it is a valid BST: every node’s left subtree values are strictly less, and right subtree values are strictly greater.',
    keyIdea:
      'Propagate open interval bounds down the tree instead of comparing only to the parent.',
    approach: [
      'dfs(node, low, high): null → true.',
      'If val ≤ low or val ≥ high → false.',
      'Return dfs(left, low, val) and dfs(right, val, high).',
      'Start with dfs(root, -∞, +∞); use a wider numeric type so Int min/max stay valid values.',
    ],
  },
}
