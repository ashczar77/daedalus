/**
 * LeetCode #102 - Binary Tree Level Order Traversal (size-based BFS).
 * Phase 4: level-order input + queue + result levels on the heap.
 */
import javaSrc from '../../algorithms/0102-binary-tree-level-order-traversal/Solution.java?raw'
import kotlinSrc from '../../algorithms/0102-binary-tree-level-order-traversal/Solution.kt?raw'
import pythonSrc from '../../algorithms/0102-binary-tree-level-order-traversal/solution.py?raw'
import {
  defineInput,
  formatLevelOrder,
  parseLevelOrder,
  type TreeNode,
} from '../engine/input'
import type { HeapObject, ProblemPack, Step, TreeVizState } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type TreeInput = {
  nodes: TreeNode[]
  rootId: string | null
  values: Array<number | null>
}

/** Classic LC demo: [[3],[9,20],[15,7]]. */
const defaultValues: Array<number | null> = [3, 9, 20, null, null, 15, 7]

const L = {
  enter: { java: 18, kotlin: 11, python: 16 },
  nullRet: { java: 20, kotlin: 12, python: 18 },
  offerRoot: { java: 23, kotlin: 14, python: 19 },
  size: { java: 25, kotlin: 16, python: 21 },
  poll: { java: 28, kotlin: 19, python: 24 },
  offerLeft: { java: 31, kotlin: 21, python: 27 },
  offerRight: { java: 34, kotlin: 22, python: 29 },
  addLevel: { java: 37, kotlin: 24, python: 30 },
  ret: { java: 39, kotlin: 26, python: 31 },
} as const

const TREE_LIMITS = { maxNodes: 12, minVal: -99, maxVal: 99 }

function cloneNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((n) => ({ ...n }))
}

function formatLevels(levels: number[][]): string[] {
  return levels.map((level) => `[${level.join(', ')}]`)
}

function heap(
  nodes: TreeNode[],
  rootId: string | null,
  focusIds: string[],
  queueVals: number[],
  frontAction: 'offer' | 'poll' | 'peek' | undefined,
  levels: number[][],
  currentLevel: number[] | null,
  viz?: TreeVizState,
): HeapObject[] {
  const objects: HeapObject[] = [
    {
      id: 'tree',
      kind: 'tree',
      label: 'TreeNode root',
      nodes: cloneNodes(nodes),
      rootId,
      focusIds: [...focusIds],
      focused: true,
      viz,
    },
    {
      id: 'queue',
      kind: 'queue',
      label: 'Queue<TreeNode>',
      items: [...queueVals],
      ...(frontAction ? { frontAction } : {}),
      focused: true,
    },
  ]
  if (currentLevel) {
    objects.push({
      id: 'level',
      kind: 'array',
      label: 'level (building)',
      values: [...currentLevel],
      focused: true,
    })
  }
  objects.push({
    id: 'result',
    kind: 'array',
    label: 'result (levels)',
    values: formatLevels(levels),
    focused: true,
  })
  return objects
}

function generateLevelOrderSteps(input: TreeInput): Step[] {
  const { rootId, nodes: inputNodes } = input
  const steps: Step[] = []
  let id = 1

  if (!rootId) {
    return [
      {
        id: 1,
        narrative: 'root is null → return empty result.',
        why: 'No levels to visit when the tree is empty.',
        codeFocus: L.nullRet,
        callStack: [
          {
            name: 'levelOrder',
            active: true,
            locals: { root: null, result: { ref: 'result' } },
          },
        ],
        heap: heap([], null, [], [], undefined, [], null),
      },
    ]
  }

  const nodes = cloneNodes(inputNodes)
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const queue: string[] = []
  const result: number[][] = []
  const marks: Record<string, string> = {}

  const queueVals = () => queue.map((nid) => byId.get(nid)!.value)

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: id++ })
  }

  push({
    narrative: 'Enter levelOrder. Allocate an empty result list.',
    why: 'BFS walks the tree one horizontal level at a time.',
    codeFocus: L.enter,
    callStack: [
      {
        name: 'levelOrder',
        active: true,
        locals: {
          root: rootId,
          result: { ref: 'result' },
          queue: { ref: 'queue' },
        },
      },
    ],
    heap: heap(nodes, rootId, [rootId], [], undefined, [], null),
  })

  queue.push(rootId)
  marks[rootId] = 'L0'
  push({
    narrative: `Offer root ${byId.get(rootId)!.value} into the queue.`,
    why: 'The first level starts with a single node.',
    codeFocus: L.offerRoot,
    callStack: [
      {
        name: 'levelOrder',
        active: true,
        locals: {
          root: rootId,
          result: { ref: 'result' },
          queue: { ref: 'queue' },
        },
      },
    ],
    heap: heap(nodes, rootId, [rootId], queueVals(), 'offer', [], null, {
      marks: { ...marks },
    }),
  })

  let depth = 0
  while (queue.length > 0) {
    const size = queue.length
    const level: number[] = []
    push({
      narrative: `Level ${depth}: freeze size=${size} (nodes currently in the queue).`,
      why: 'size captures this level before children from the next level are offered.',
      codeFocus: L.size,
      callStack: [
        {
          name: 'levelOrder',
          active: true,
          locals: {
            root: rootId,
            result: { ref: 'result' },
            queue: { ref: 'queue' },
            size,
            depth,
          },
        },
      ],
      heap: heap(nodes, rootId, [...queue], queueVals(), 'peek', result, level, {
        marks: { ...marks },
      }),
    })

    for (let i = 0; i < size; i++) {
      const nodeId = queue.shift()!
      const node = byId.get(nodeId)!
      level.push(node.value)
      push({
        narrative: `Poll ${node.value}; append to level → [${level.join(', ')}].`,
        why: 'Process the front of the queue; that node belongs to the current level.',
        codeFocus: L.poll,
        callStack: [
          {
            name: 'levelOrder',
            active: true,
            locals: {
              root: rootId,
              result: { ref: 'result' },
              queue: { ref: 'queue' },
              node: nodeId,
              size,
              i,
            },
          },
        ],
        heap: heap(
          nodes,
          rootId,
          [nodeId],
          queueVals(),
          'poll',
          result,
          level,
          { marks: { ...marks } },
        ),
      })

      if (node.left) {
        queue.push(node.left)
        marks[node.left] = `L${depth + 1}`
        push({
          narrative: `Offer left child ${byId.get(node.left)!.value}.`,
          why: 'Children belong to the next level; they wait behind the current size window.',
          codeFocus: L.offerLeft,
          callStack: [
            {
              name: 'levelOrder',
              active: true,
              locals: {
                root: rootId,
                result: { ref: 'result' },
                queue: { ref: 'queue' },
                node: nodeId,
              },
            },
          ],
          heap: heap(
            nodes,
            rootId,
            [nodeId, node.left],
            queueVals(),
            'offer',
            result,
            level,
            { marks: { ...marks } },
          ),
        })
      }

      if (node.right) {
        queue.push(node.right)
        marks[node.right] = `L${depth + 1}`
        push({
          narrative: `Offer right child ${byId.get(node.right)!.value}.`,
          why: 'Same for the right child - still next level, after the frozen size.',
          codeFocus: L.offerRight,
          callStack: [
            {
              name: 'levelOrder',
              active: true,
              locals: {
                root: rootId,
                result: { ref: 'result' },
                queue: { ref: 'queue' },
                node: nodeId,
              },
            },
          ],
          heap: heap(
            nodes,
            rootId,
            [nodeId, node.right],
            queueVals(),
            'offer',
            result,
            level,
            { marks: { ...marks } },
          ),
        })
      }
    }

    result.push([...level])
    push({
      narrative: `Finish level ${depth}: add [${level.join(', ')}] to result.`,
      why: 'One outer-loop iteration = one horizontal cut of the tree.',
      codeFocus: L.addLevel,
      callStack: [
        {
          name: 'levelOrder',
          active: true,
          locals: {
            root: rootId,
            result: { ref: 'result' },
            queue: { ref: 'queue' },
            depth,
          },
        },
      ],
      heap: heap(nodes, rootId, [], queueVals(), undefined, result, null, {
        marks: { ...marks },
      }),
    })
    depth += 1
  }

  push({
    narrative: `Queue empty. Return result = [${formatLevels(result).join(', ')}].`,
    why: 'Every node was enqueued and dequeued exactly once → O(n).',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'levelOrder',
        active: true,
        locals: {
          root: rootId,
          result: { ref: 'result' },
          queue: { ref: 'queue' },
        },
      },
    ],
    heap: heap(nodes, rootId, [], [], undefined, result, null, {
      marks: { ...marks },
    }),
  })

  return steps
}

const input = defineInput<TreeInput>({
  kind: 'levelOrderTree',
  fields: [
    {
      key: 'root',
      label: 'root (level-order)',
      widget: 'text',
      placeholder: '3, 9, 20, null, null, 15, 7',
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
  generateSteps: generateLevelOrderSteps,
  fixtures: [
    { name: 'empty', raw: { root: '' } },
    { name: 'single', raw: { root: '1' } },
    { name: 'skewed-left', raw: { root: '1, 2, null, 3' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Level Order default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const binaryTreeLevelOrderTraversal: ProblemPack = {
  id: '0102-binary-tree-level-order-traversal',
  lcNumber: 102,
  title: 'Binary Tree Level Order Traversal',
  pattern: 'Tree BFS',
  difficulty: 'Medium',
  insight:
    'Use a Queue of nodes and freeze size = q.size() each outer loop so children land in the next level.',
  invariant:
    'At the start of each outer iteration, the queue holds exactly the nodes on the current level.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: defaultValues.filter((v) => v != null).length },
  benchmark: placeholderBenchmark(
    'Size-based BFS is linear; recursive DFS collecting by depth also works but the queue story is the standard interview form.',
  ),
  walkthrough: {
    statement: 'Return the values of the nodes level by level, left to right.',
    keyIdea:
      'BFS with a queue; capture the queue length before processing so each outer loop is one level.',
    approach: [
      'If root is null, return [].',
      'Offer root. While queue not empty: size = q.size(), drain that many nodes into a level list, offering children.',
      'Append each level list to result.',
    ],
  },
}
