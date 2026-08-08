/**
 * LeetCode #226 — Invert Binary Tree (recursive DFS swap).
 * Phase 4: level-order input + generator matching Solution.java post-order swap.
 */
import javaSrc from '../../algorithms/0226-invert-binary-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0226-invert-binary-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0226-invert-binary-tree/solution.py?raw'
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
  swap: { java: 16, kotlin: 11, python: 14 },
  recurse: { java: 19, kotlin: 12, python: 15 },
  ret: { java: 21, kotlin: 14, python: 17 },
} as const

const TREE_LIMITS = { maxNodes: 12, minVal: -99, maxVal: 99 }

function cloneNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((n) => ({ ...n }))
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

type StackFrame = {
  nodeId: string | null
  tmp?: string | null
  result?: string | null
}

function locals(f: StackFrame): CallFrame['locals'] {
  const out: CallFrame['locals'] = { root: f.nodeId }
  if (f.tmp !== undefined) out.tmp = f.tmp
  if (f.result !== undefined) out.result = f.result
  return out
}

function callStack(frames: StackFrame[], activeIndex: number): CallFrame[] {
  return frames.map((f, i) => ({
    name: 'invertTree',
    active: i === activeIndex,
    locals: locals(f),
  }))
}

function generateInvertSteps(input: TreeInput): Step[] {
  const { rootId } = input
  if (!rootId) {
    return [
      {
        id: 1,
        narrative: 'Empty tree: invertTree(null) returns null immediately.',
        why: 'Nothing to swap when root is missing.',
        codeFocus: L.nullCheck,
        callStack: callStack([{ nodeId: null, result: null }], 0),
        heap: heap([], null, []),
      },
    ]
  }

  const nodes = cloneNodes(input.nodes)
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const marks: Record<string, string> = {}
  const steps: Step[] = []
  let stepId = 1
  const stack: StackFrame[] = []
  const dense = nodes.length > 8

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function viz(extra?: Partial<TreeVizState>): TreeVizState {
    return { marks: { ...marks }, ...extra }
  }

  function val(id: string): number {
    return byId.get(id)!.value
  }

  function dfs(nodeId: string | null, parentId: string | null, side: 'left' | 'right' | null): string | null {
    if (nodeId === null) {
      if (!dense && parentId && side) {
        stack.push({ nodeId: null })
        push({
          narrative: `Child ${side} is null → return null (no swap needed).`,
          why: 'Null children need no work.',
          codeFocus: L.nullCheck,
          callStack: callStack(stack, stack.length - 1),
          heap: heap(nodes, rootId, parentId ? [parentId] : [], {
            ...viz(),
            nullCall: { parentId, side, text: 'return null' },
          }),
        })
        stack.pop()
      }
      return null
    }

    const node = byId.get(nodeId)!
    stack.push({ nodeId })
    push({
      narrative:
        stack.length === 1
          ? `Enter invertTree at root ${node.value}. Node is not null — swap its children on the heap.`
          : `Enter invertTree at node ${node.value}.`,
      why: 'Recursion depth mirrors tree height (O(h) stack space).',
      codeFocus: L.enter,
      callStack: callStack(stack, stack.length - 1),
      heap: heap(nodes, rootId, [nodeId], viz()),
    })

    const tmp = node.left
    node.left = node.right
    node.right = tmp
    const top = stack[stack.length - 1]!
    top.tmp = tmp

    push({
      narrative: `Swap on the heap: left↔right at node ${node.value}.`,
      why: 'Must mutate node fields — swapping local copies does nothing.',
      codeFocus: L.swap,
      callStack: callStack(stack, stack.length - 1),
      heap: heap(nodes, rootId, [nodeId, node.left, node.right].filter(Boolean) as string[], {
        ...viz(),
        formula: { nodeId, text: 'swap L ↔ R' },
        marks: { ...marks, [nodeId]: 'swapped' },
      }),
    })
    marks[nodeId] = 'swapped'

    if (!dense) {
      push({
        narrative: `Recurse into the new left child${node.left ? ` (${val(node.left!)})` : ''}.`,
        why: 'After swapping, both subtrees must be inverted too.',
        codeFocus: L.recurse,
        callStack: callStack(stack, stack.length - 1),
        heap: heap(nodes, rootId, node.left ? [node.left] : [nodeId], viz()),
      })
    }

    dfs(node.left, nodeId, 'left')

    if (!dense) {
      push({
        narrative: `Recurse into the new right child${node.right ? ` (${val(node.right!)})` : ''}.`,
        why: 'Symmetric call on the other swapped child.',
        codeFocus: L.recurse,
        callStack: callStack(stack, stack.length - 1),
        heap: heap(nodes, rootId, node.right ? [node.right] : [nodeId], viz()),
      })
    }

    dfs(node.right, nodeId, 'right')

    top.result = nodeId
    marks[nodeId] = 'done'
    push({
      narrative:
        stack.length === 1
          ? 'Both subtrees inverted. Return root — tree is fully inverted.'
          : `Node ${node.value} done; return this subtree root.`,
      why: 'Post-order: fix node, then ensure both subtrees are done.',
      codeFocus: L.ret,
      callStack: callStack(stack, stack.length - 1),
      heap: heap(nodes, rootId, [nodeId], {
        ...viz(),
        formula: stack.length === 1 ? { nodeId, text: 'return root' } : undefined,
      }),
    })
    stack.pop()
    return nodeId
  }

  dfs(rootId, null, null)
  return steps
}

const defaultValues: Array<number | null> = [2, 1, 3]

const input = defineInput<TreeInput>({
  kind: 'levelOrderTree',
  fields: [
    {
      key: 'root',
      label: 'root (level-order)',
      widget: 'text',
      placeholder: '2, 1, 3',
      hint: 'Up to 12 nodes, values -99–99; use null for missing children',
    },
  ],
  defaultRaw: { root: formatLevelOrder(defaultValues) },
  parse: (raw) =>
    parseLevelOrder(raw.root ?? '', { name: 'root', ...TREE_LIMITS }),
  formatLabel: (value) =>
    value.rootId
      ? `root = [${formatLevelOrder(value.values)}]`
      : 'root = [] (empty)',
  generateSteps: generateInvertSteps,
  fixtures: [{ name: 'empty', raw: { root: '' } }],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Invert Tree default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const invertBinaryTree: ProblemPack = {
  id: '0226-invert-binary-tree',
  lcNumber: 226,
  title: 'Invert Binary Tree',
  pattern: 'Tree DFS',
  difficulty: 'Easy',
  insight: 'Swap children on the node object, then recurse — never swap copied references.',
  invariant: 'After processing a node, both subtrees are swapped and fully inverted.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Call-stack depth tracks tree height; heap nodes are mutated in place.',
  ),
  walkthrough: {
    statement:
      'Given the root of a binary tree, invert the tree and return its root (mirror left and right at every node).',
    keyIdea:
      'At each node, swap left and right child pointers on the heap object, then recurse into both sides.',
    approach: [
      'Base case: null → return null.',
      'Swap root.left and root.right.',
      'Recursively invert both children.',
      'Return the (same) root reference.',
    ],
  },
}
