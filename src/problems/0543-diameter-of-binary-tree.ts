/**
 * LeetCode #543 - Diameter of Binary Tree.
 * Phase 4: level-order input + height DFS with global best and h= overlays.
 */
import javaSrc from '../../algorithms/0543-diameter-of-binary-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0543-diameter-of-binary-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0543-diameter-of-binary-tree/solution.py?raw'
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
  start: { java: 14, kotlin: 9, python: 11 },
  height: { java: 20, kotlin: 15, python: 14 },
  nulls: { java: 21, kotlin: 16, python: 15 },
  combine: { java: 26, kotlin: 19, python: 19 },
  retBest: { java: 17, kotlin: 12, python: 23 },
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
      label: 'TreeNode',
      nodes,
      rootId,
      focusIds,
      focused: true,
      viz,
    },
  ]
}

type HeightFrame = {
  nodeId: string
  left?: number
  right?: number
  through?: number
  returnHeight?: number
}

function heightLocals(f: HeightFrame): CallFrame['locals'] {
  const out: CallFrame['locals'] = { node: f.nodeId }
  if (f.left !== undefined) out.left = f.left
  if (f.right !== undefined) out.right = f.right
  if (f.through !== undefined) out.through = f.through
  if (f.returnHeight !== undefined) out.returnHeight = f.returnHeight
  return out
}

function generateDiameterSteps(input: TreeInput): Step[] {
  const { nodes, rootId } = input
  if (!rootId || nodes.length === 0) {
    return [
      {
        id: 1,
        narrative: 'Empty tree: height(null) never runs; diameter stays 0.',
        why: 'No edges exist between nodes.',
        codeFocus: L.retBest,
        callStack: [
          {
            name: 'diameterOfBinaryTree',
            active: true,
            locals: { best: 0, result: 0 },
          },
        ],
        heap: heap([], null, []),
      },
    ]
  }

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const marks: Record<string, string> = {}
  let best = 0
  const steps: Step[] = []
  let stepId = 1
  const heightStack: HeightFrame[] = []
  const dense = nodes.length > 7

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function viz(extra?: Partial<TreeVizState>): TreeVizState {
    return { marks: { ...marks }, ...extra }
  }

  function outerFrames(activeHeightIdx: number | null): CallFrame[] {
    const outer: CallFrame = {
      name: 'diameterOfBinaryTree',
      active: activeHeightIdx === null,
      locals: { best },
    }
    const inner = heightStack.map((f, i) => ({
      name: 'height',
      active: activeHeightIdx === i,
      locals: heightLocals(f),
    }))
    return [outer, ...inner]
  }

  function height(nodeId: string | null): number {
    if (nodeId === null) return 0

    const node = byId.get(nodeId)!
    heightStack.push({ nodeId })

    if (heightStack.length === 1) {
      push({
        narrative: `Reset best=0 and start height(root=${node.value}). Diameter is tracked globally.`,
        why: 'Diameter is not the same as the height of the root.',
        codeFocus: L.start,
        callStack: outerFrames(0),
        heap: heap(nodes, rootId, [nodeId]),
      })
    } else if (!dense) {
      push({
        narrative: `Go left/right into height(${node.value}).`,
        why: 'Post-order: child heights first.',
        codeFocus: L.height,
        callStack: outerFrames(heightStack.length - 1),
        heap: heap(nodes, rootId, [nodeId], viz()),
      })
    }

    const left = height(node.left)
    const right = height(node.right)
    const through = left + right
    const prevBest = best
    best = Math.max(best, through)
    const returnHeight = 1 + Math.max(left, right)
    marks[nodeId] = `h=${returnHeight}`

    const frame = heightStack[heightStack.length - 1]!
    frame.left = left
    frame.right = right
    frame.through = through
    frame.returnHeight = returnHeight

    const bestUpdated = best > prevBest
    push({
      narrative: bestUpdated
        ? `At node ${node.value}: through-path ${left}+${right}=${through} updates best to ${best}. Return h=${returnHeight}.`
        : `At node ${node.value}: return height ${returnHeight} (1+max(${left},${right})).`,
      why: 'Helper returns height; best tracks the longest through-node path.',
      codeFocus: L.combine,
      callStack: outerFrames(heightStack.length - 1),
      heap: heap(nodes, rootId, [nodeId], {
        ...viz(),
        formula: bestUpdated
          ? { nodeId, text: `best←${left}+${right}=${through}` }
          : { nodeId, text: `1+max(${left},${right})=${returnHeight}` },
      }),
    })

    heightStack.pop()
    return returnHeight
  }

  height(rootId)

  push({
    narrative: `DFS finished. Return best=${best} as the diameter (edges).`,
    why: 'Answer is max through-node path seen anywhere - not height(root).',
    codeFocus: L.retBest,
    callStack: [
      {
        name: 'diameterOfBinaryTree',
        active: true,
        locals: { best, result: best },
      },
    ],
    heap: heap(nodes, rootId, [rootId], viz()),
  })

  return steps
}

const defaultValues: Array<number | null> = [1, 2, 3, 4, 5]

const input = defineInput<TreeInput>({
  kind: 'levelOrderTree',
  fields: [
    {
      key: 'root',
      label: 'root (level-order)',
      widget: 'text',
      placeholder: '1, 2, 3, 4, 5',
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
  generateSteps: generateDiameterSteps,
  fixtures: [{ name: 'empty', raw: { root: '' } }],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Diameter default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const diameterOfBinaryTree: ProblemPack = {
  id: '0543-diameter-of-binary-tree',
  lcNumber: 543,
  title: 'Diameter of Binary Tree',
  pattern: 'Tree DFS',
  difficulty: 'Easy',
  insight: 'Helper returns height; global tracks left+right at each node for the diameter.',
  invariant: 'dfs(node) returns subtree height; best is max path edges seen through any node.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'One DFS pass computes heights and diameter together.',
  ),
  walkthrough: {
    statement:
      'The diameter of a binary tree is the length of the longest path between any two nodes (edges). That path may or may not pass through the root.',
    keyIdea:
      'DFS returns height. At each node, candidate diameter = leftHeight + rightHeight; track the max.',
    approach: [
      'Keep a global best.',
      'height(null) → 0.',
      'At each node: compute left/right heights, update best with left+right, return 1+max(left,right).',
      'Answer is best after the DFS.',
    ],
  },
}
