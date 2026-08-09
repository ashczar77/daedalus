/**
 * LeetCode #104 - Maximum Depth of Binary Tree.
 * Phase 4: level-order input + DFS generator with depth/null/formula overlays.
 */
import javaSrc from '../../algorithms/0104-maximum-depth-of-binary-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0104-maximum-depth-of-binary-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0104-maximum-depth-of-binary-tree/solution.py?raw'
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

const L = {
  enter: { java: 12, kotlin: 7, python: 11 },
  nullCheck: { java: 13, kotlin: 8, python: 12 },
  retZero: { java: 14, kotlin: 8, python: 13 },
  left: { java: 16, kotlin: 9, python: 14 },
  right: { java: 17, kotlin: 10, python: 15 },
  retDepth: { java: 18, kotlin: 11, python: 16 },
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

type StackFrame = {
  nodeId: string | null
  left?: number
  right?: number
  result?: number
}

function locals(f: StackFrame): CallFrame['locals'] {
  const out: CallFrame['locals'] = { root: f.nodeId }
  if (f.left !== undefined) out.left = f.left
  if (f.right !== undefined) out.right = f.right
  if (f.result !== undefined) out.result = f.result
  return out
}

function callStack(frames: StackFrame[], activeIndex: number): CallFrame[] {
  return frames.map((f, i) => ({
    name: 'maxDepth',
    active: i === activeIndex,
    locals: locals(f),
  }))
}

function generateMaxDepthSteps(input: TreeInput): Step[] {
  const { nodes, rootId } = input
  if (!rootId || nodes.length === 0) {
    return [
      {
        id: 1,
        narrative: 'Empty tree: maxDepth(null) hits the base case immediately.',
        why: 'Null nodes contribute depth 0.',
        codeFocus: L.retZero,
        callStack: callStack([{ nodeId: null, result: 0 }], 0),
        heap: heap([], null, []),
      },
    ]
  }

  const dense = nodes.length > 7
  return dense ? generateMaxDepthStepsDense(input) : generateMaxDepthStepsVerbose(input)
}

function generateMaxDepthStepsVerbose(input: TreeInput): Step[] {
  const { nodes, rootId } = input
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const depths: Record<string, number> = {}
  const steps: Step[] = []
  let stepId = 1
  const stack: StackFrame[] = []

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function viz(extra?: Partial<TreeVizState>): TreeVizState {
    return { depths: { ...depths }, ...extra }
  }

  function dfs(nodeId: string | null, parentId: string | null, side: 'left' | 'right' | null): number {
    if (nodeId === null) {
      if (parentId && side) {
        stack.push({ nodeId: null })
        push({
          narrative: `Recurse ${side} → maxDepth(null). Null returns 0.`,
          why: 'Every missing child is a base-case call.',
          codeFocus: side === 'left' ? L.left : L.right,
          callStack: callStack(stack, stack.length - 1),
          heap: heap(nodes, rootId!, [parentId], {
            ...viz(),
            nullCall: { parentId, side, text: 'return 0' },
          }),
        })
        stack.pop()
      }
      return 0
    }

    const node = byId.get(nodeId)!
    stack.push({ nodeId })
    push({
      narrative:
        stack.length === 1
          ? `Enter maxDepth at root node ${node.value}. Root is not null - we will measure both subtrees.`
          : `At node ${node.value}: not null. Recurse into children.`,
      why: 'Depth is defined only after children return.',
      codeFocus: stack.length === 1 ? L.enter : L.left,
      callStack: callStack(stack, stack.length - 1),
      heap: heap(nodes, rootId!, [nodeId], viz()),
    })

    if (node.left !== null) {
      push({
        narrative: `Recurse into the left child of ${node.value} → maxDepth(${byId.get(node.left)!.value}).`,
        why: 'Post-order: left depth must finish before right.',
        codeFocus: L.left,
        callStack: callStack(stack, stack.length - 1),
        heap: heap(nodes, rootId!, [node.left], viz()),
      })
    }

    const leftDepth = dfs(node.left, nodeId, 'left')
    stack[stack.length - 1]!.left = leftDepth

    if (node.left === null) {
      push({
        narrative: `Left of ${node.value} is null → treated as depth 0.`,
        why: 'Null contributes depth 0 so a leaf becomes 1 + max(0, 0).',
        codeFocus: L.retZero,
        callStack: callStack(stack, stack.length - 1),
        heap: heap(nodes, rootId!, [nodeId], {
          ...viz(),
          nullCall: { parentId: nodeId, side: 'left', text: '0' },
        }),
      })
    }

    if (node.right !== null) {
      push({
        narrative: `Recurse into the right child of ${node.value}.`,
        why: 'Now measure the other side.',
        codeFocus: L.right,
        callStack: callStack(stack, stack.length - 1),
        heap: heap(nodes, rootId!, [node.right], viz()),
      })
    }

    const rightDepth = dfs(node.right, nodeId, 'right')
    stack[stack.length - 1]!.right = rightDepth

    if (node.right === null) {
      push({
        narrative: `Right of ${node.value} is null → return 0.`,
        why: 'Same base case on the other side.',
        codeFocus: L.right,
        callStack: callStack(stack, stack.length - 1),
        heap: heap(nodes, rootId!, [nodeId], {
          ...viz(),
          nullCall: { parentId: nodeId, side: 'right', text: '0' },
        }),
      })
    }

    const result = 1 + Math.max(leftDepth, rightDepth)
    stack[stack.length - 1]!.result = result
    depths[nodeId] = result

    push({
      narrative:
        stack.length === 1
          ? `Root combines: 1 + max(${leftDepth}, ${rightDepth}) = ${result}. Maximum depth is ${result}.`
          : `Node ${node.value} returns 1 + max(${leftDepth}, ${rightDepth}) = ${result}.`,
      why:
        stack.length === 1
          ? 'Answer is the longest root-to-leaf path in nodes.'
          : 'Returned value = max depth of this subtree.',
      codeFocus: L.retDepth,
      callStack: callStack(stack, stack.length - 1),
      heap: heap(nodes, rootId!, [nodeId], {
        ...viz(),
        formula: {
          nodeId,
          text: `1+max(${leftDepth},${rightDepth})=${result}`,
        },
      }),
    })

    stack.pop()
    return result
  }

  dfs(rootId!, null, null)
  return steps
}

/** Enter/return pair per visited node when verbose mode would exceed ~40 steps. */
function generateMaxDepthStepsDense(input: TreeInput): Step[] {
  const { nodes, rootId } = input
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const depths: Record<string, number> = {}
  const steps: Step[] = []
  let stepId = 1
  const stack: StackFrame[] = []

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function viz(extra?: Partial<TreeVizState>): TreeVizState {
    return { depths: { ...depths }, ...extra }
  }

  function dfs(nodeId: string | null): number {
    if (nodeId === null) return 0
    const node = byId.get(nodeId)!
    stack.push({ nodeId })
    push({
      narrative: `Enter maxDepth(${node.value}).`,
      why: 'DFS post-order: children first, then combine.',
      codeFocus: L.enter,
      callStack: callStack(stack, stack.length - 1),
      heap: heap(nodes, rootId!, [nodeId], viz()),
    })

    const leftDepth = dfs(node.left)
    const rightDepth = dfs(node.right)
    const result = 1 + Math.max(leftDepth, rightDepth)
    const top = stack[stack.length - 1]!
    top.left = leftDepth
    top.right = rightDepth
    top.result = result
    depths[nodeId] = result

    push({
      narrative: `Return from ${node.value}: 1 + max(${leftDepth}, ${rightDepth}) = ${result}.`,
      why: 'Null children counted as 0 without extra frames.',
      codeFocus: L.retDepth,
      callStack: callStack(stack, stack.length - 1),
      heap: heap(nodes, rootId!, [nodeId], {
        ...viz(),
        formula: {
          nodeId,
          text: `1+max(${leftDepth},${rightDepth})=${result}`,
        },
      }),
    })
    stack.pop()
    return result
  }

  dfs(rootId!)
  return steps
}

const defaultValues: Array<number | null> = [1, 2, 3, 4]

const input = defineInput<TreeInput>({
  kind: 'levelOrderTree',
  fields: [
    {
      key: 'root',
      label: 'root (level-order)',
      widget: 'text',
      placeholder: '1, 2, 3, 4',
      hint: 'Up to 12 nodes, values -99-99; use null for missing children',
    },
  ],
  defaultRaw: { root: formatLevelOrder(defaultValues) },
  parse: (raw) =>
    parseLevelOrder(raw.root ?? '', { name: 'root', ...TREE_LIMITS }),
  formatLabel: (value) =>
    value.rootId
      ? `root = [${formatLevelOrder(value.values)}]`
      : 'root = [] (empty)',
  generateSteps: generateMaxDepthSteps,
  fixtures: [{ name: 'empty', raw: { root: '' } }],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Max Depth default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const maximumDepthOfBinaryTree: ProblemPack = {
  id: '0104-maximum-depth-of-binary-tree',
  lcNumber: 104,
  title: 'Maximum Depth of Binary Tree',
  pattern: 'Tree DFS',
  difficulty: 'Easy',
  insight: '1 + max(leftDepth, rightDepth); null → 0.',
  invariant: 'Return value = max depth of the subtree rooted at this node.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Call-stack depth tracks tree height; heap holds the shared tree object.',
  ),
  walkthrough: {
    statement:
      'Given the root of a binary tree, return its maximum depth - the number of nodes along the longest path from the root down to the farthest leaf.',
    keyIdea:
      'Depth of a node is 1 plus the larger of its left and right subtree depths. Null nodes have depth 0.',
    approach: [
      'Base case: if the node is null, return 0.',
      'Recursively compute left and right depths.',
      'Return 1 + max(left, right).',
    ],
  },
}
