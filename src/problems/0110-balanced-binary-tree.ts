/**
 * LeetCode #110 - Balanced Binary Tree.
 * Single DFS returns height or -1 sentinel when a subtree is unbalanced.
 */
import javaSrc from '../../algorithms/0110-balanced-binary-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0110-balanced-binary-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0110-balanced-binary-tree/solution.py?raw'
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
  wrapper: { java: 13, kotlin: 8, python: 13 },
  height: { java: 16, kotlin: 11, python: 15 },
  nulls: { java: 18, kotlin: 12, python: 17 },
  leftBad: { java: 22, kotlin: 14, python: 20 },
  rightBad: { java: 26, kotlin: 16, python: 23 },
  imbalance: { java: 29, kotlin: 17, python: 25 },
  retHeight: { java: 31, kotlin: 18, python: 26 },
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

type HeightFrame = {
  nodeId: string | null
  left?: number
  right?: number
  result?: number
}

function heightLocals(f: HeightFrame): CallFrame['locals'] {
  const out: CallFrame['locals'] = { node: f.nodeId }
  if (f.left !== undefined) out.left = f.left
  if (f.right !== undefined) out.right = f.right
  if (f.result !== undefined) out.result = f.result
  return out
}

function generateBalancedSteps(input: TreeInput): Step[] {
  const { nodes, rootId } = input
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const marks: Record<string, string> = {}
  const steps: Step[] = []
  let stepId = 1
  const heightStack: HeightFrame[] = []
  const dense = nodes.length > 8

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function viz(extra?: Partial<TreeVizState>): TreeVizState {
    return { marks: { ...marks }, ...extra }
  }

  function frames(activeHeightIdx: number | null, wrapperActive = false): CallFrame[] {
    const outer: CallFrame = {
      name: 'isBalanced',
      active: wrapperActive || activeHeightIdx === null,
      locals: {},
    }
    const inner = heightStack.map((f, i) => ({
      name: 'height',
      active: !wrapperActive && activeHeightIdx === i,
      locals: heightLocals(f),
    }))
    return [outer, ...inner]
  }

  if (!rootId || nodes.length === 0) {
    return [
      {
        id: 1,
        narrative: 'Empty tree: height(null) → 0, so isBalanced → true.',
        why: 'A missing root has no unbalanced node.',
        codeFocus: L.wrapper,
        callStack: [
          {
            name: 'isBalanced',
            active: true,
            locals: { result: true },
          },
        ],
        heap: heap([], null, []),
      },
    ]
  }

  function height(nodeId: string | null): number {
    if (nodeId === null) {
      return 0
    }

    const node = byId.get(nodeId)!
    heightStack.push({ nodeId })

    if (heightStack.length === 1 || !dense) {
      push({
        narrative:
          heightStack.length === 1
            ? `isBalanced asks height(root=${node.value}). We need every node |L-R| <= 1.`
            : `Enter height at node ${node.value}.`,
        why: 'Post-order: finish both children before deciding this node.',
        codeFocus: heightStack.length === 1 ? L.wrapper : L.height,
        callStack: frames(heightStack.length - 1),
        heap: heap(nodes, rootId, [nodeId], viz()),
      })
    }

    const left = height(node.left)
    const frame = heightStack[heightStack.length - 1]!
    frame.left = left

    if (left === -1) {
      frame.result = -1
      marks[nodeId] = 'bad'
      push({
        narrative: `Left of ${node.value} already returned -1 -> propagate imbalance.`,
        why: 'Once any subtree fails, the whole tree is unbalanced.',
        codeFocus: L.leftBad,
        callStack: frames(heightStack.length - 1),
        heap: heap(nodes, rootId, [nodeId], {
          ...viz(),
          formula: { nodeId, text: 'left=-1 -> -1' },
        }),
      })
      heightStack.pop()
      return -1
    }

    const right = height(node.right)
    frame.right = right

    if (right === -1) {
      frame.result = -1
      marks[nodeId] = 'bad'
      push({
        narrative: `Right of ${node.value} returned -1 -> propagate imbalance.`,
        why: 'Same early exit on the other child.',
        codeFocus: L.rightBad,
        callStack: frames(heightStack.length - 1),
        heap: heap(nodes, rootId, [nodeId], {
          ...viz(),
          formula: { nodeId, text: 'right=-1 -> -1' },
        }),
      })
      heightStack.pop()
      return -1
    }

    const diff = Math.abs(left - right)
    if (diff > 1) {
      frame.result = -1
      marks[nodeId] = 'bad'
      push({
        narrative: `Node ${node.value}: |${left}-${right}|=${diff} > 1 -> return -1 (unbalanced here).`,
        why: 'Balance is a local height check at every node, not only the root.',
        codeFocus: L.imbalance,
        callStack: frames(heightStack.length - 1),
        heap: heap(nodes, rootId, [nodeId], {
          ...viz(),
          formula: { nodeId, text: `|${left}-${right}|=${diff}>1` },
        }),
      })
      heightStack.pop()
      return -1
    }

    const returnHeight = 1 + Math.max(left, right)
    frame.result = returnHeight
    marks[nodeId] = `h=${returnHeight}`
    push({
      narrative: `Node ${node.value}: balanced (|${left}-${right}|<=1). Return h=${returnHeight}.`,
      why: 'Helper returns height only when this subtree is fully balanced.',
      codeFocus: L.retHeight,
      callStack: frames(heightStack.length - 1),
      heap: heap(nodes, rootId, [nodeId], {
        ...viz(),
        formula: { nodeId, text: `1+max(${left},${right})=${returnHeight}` },
      }),
    })
    heightStack.pop()
    return returnHeight
  }

  const h = height(rootId)
  const balanced = h !== -1
  push({
    narrative: balanced
      ? `height(root)=${h} != -1 -> return true. Tree is balanced.`
      : 'height(root)=-1 -> return false. Some node failed the |L-R|<=1 check.',
    why: 'Wrapper only cares whether the sentinel appeared.',
    codeFocus: L.wrapper,
    callStack: [
      {
        name: 'isBalanced',
        active: true,
        locals: { result: balanced },
      },
    ],
    heap: heap(nodes, rootId, [rootId], viz()),
  })

  return steps
}

/** Classic LC unbalanced example: deep left under root, shallow right. */
const defaultValues: Array<number | null> = [1, 2, 2, 3, 3, null, null, 4, 4]

const input = defineInput<TreeInput>({
  kind: 'levelOrderTree',
  fields: [
    {
      key: 'root',
      label: 'root (level-order)',
      widget: 'text',
      placeholder: '1, 2, 2, 3, 3, null, null, 4, 4',
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
  generateSteps: generateBalancedSteps,
  fixtures: [
    { name: 'empty', raw: { root: '' } },
    { name: 'balanced', raw: { root: '3, 9, 20, null, null, 15, 7' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Balanced Tree default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const balancedBinaryTree: ProblemPack = {
  id: '0110-balanced-binary-tree',
  lcNumber: 110,
  title: 'Balanced Binary Tree',
  pattern: 'Tree DFS',
  difficulty: 'Easy',
  insight:
    'Combine height and balance in one post-order DFS; propagate -1 on imbalance.',
  invariant:
    'height(node) returns subtree height if balanced, else -1. Every node must satisfy |L-R| <= 1.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'One DFS pass; early -1 avoids recomputing heights.',
  ),
  walkthrough: {
    statement:
      'Given a binary tree, determine if it is height-balanced: for every node, the heights of the two subtrees differ by at most 1.',
    keyIdea:
      'DFS returns height, or -1 if that subtree (or anything below) is unbalanced.',
    approach: [
      'height(null) -> 0.',
      'Recurse left; if -1, return -1.',
      'Recurse right; if -1, return -1.',
      'If |left-right| > 1 return -1; else return 1+max(left,right).',
      'isBalanced is just height(root) != -1.',
    ],
  },
}
