/**
 * LeetCode #572 - Subtree of Another Tree.
 * Search every node in root; at each candidate run exact Same Tree vs subRoot.
 */
import javaSrc from '../../algorithms/0572-subtree-of-another-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0572-subtree-of-another-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0572-subtree-of-another-tree/solution.py?raw'
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

type ParsedTree = {
  nodes: TreeNode[]
  rootId: string | null
  values: Array<number | null>
}

type SubtreeInput = {
  root: ParsedTree
  subRoot: ParsedTree
}

const L = {
  subNull: { java: 14, kotlin: 8, python: 14 },
  rootNull: { java: 17, kotlin: 9, python: 16 },
  trySame: { java: 19, kotlin: 10, python: 17 },
  search: { java: 22, kotlin: 11, python: 19 },
  sameNulls: { java: 27, kotlin: 15, python: 25 },
  sameVals: { java: 30, kotlin: 16, python: 27 },
  sameRecurse: { java: 32, kotlin: 17, python: 28 },
} as const

const TREE_LIMITS = { maxNodes: 12, minVal: -99, maxVal: 99 }

function prefixTree(tree: ParsedTree, prefix: 'r' | 's'): ParsedTree {
  if (!tree.rootId) {
    return { nodes: [], rootId: null, values: tree.values }
  }
  const idMap = new Map<string, string>()
  for (const n of tree.nodes) {
    idMap.set(n.id, `${prefix}${n.id}`)
  }
  const nodes = tree.nodes.map((n) => ({
    id: idMap.get(n.id)!,
    value: n.value,
    left: n.left ? idMap.get(n.left)! : null,
    right: n.right ? idMap.get(n.right)! : null,
  }))
  return {
    nodes,
    rootId: idMap.get(tree.rootId)!,
    values: tree.values,
  }
}

function trees(
  rNodes: TreeNode[],
  rRoot: string | null,
  sNodes: TreeNode[],
  sRoot: string | null,
  rFocus: string[],
  sFocus: string[],
  rViz?: TreeVizState,
  sViz?: TreeVizState,
): HeapObject[] {
  return [
    {
      id: 'root',
      kind: 'tree',
      label: 'tree root',
      nodes: rNodes,
      rootId: rRoot,
      focusIds: rFocus,
      focused: true,
      viz: rViz,
    },
    {
      id: 'subRoot',
      kind: 'tree',
      label: 'tree subRoot',
      nodes: sNodes,
      rootId: sRoot,
      focusIds: sFocus,
      focused: true,
      viz: sViz,
    },
  ]
}

type Frame = {
  name: 'isSubtree' | 'isSameTree'
  root: string | null
  sub: string | null
  result?: boolean
}

function callStack(frames: Frame[], activeIndex: number): CallFrame[] {
  return frames.map((f, i) => ({
    name: f.name,
    active: i === activeIndex,
    locals: {
      root: f.root,
      subRoot: f.sub,
      ...(f.result !== undefined ? { result: f.result } : {}),
    },
  }))
}

function generateSubtreeSteps(input: SubtreeInput): Step[] {
  const root = prefixTree(input.root, 'r')
  const sub = prefixTree(input.subRoot, 's')
  const rById = new Map(root.nodes.map((n) => [n.id, n]))
  const sById = new Map(sub.nodes.map((n) => [n.id, n]))
  const rMarks: Record<string, string> = {}
  const sMarks: Record<string, string> = {}
  const steps: Step[] = []
  let stepId = 1
  const stack: Frame[] = []
  const dense = root.nodes.length + sub.nodes.length > 10

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function rViz(extra?: Partial<TreeVizState>): TreeVizState {
    return { marks: { ...rMarks }, ...extra }
  }
  function sViz(extra?: Partial<TreeVizState>): TreeVizState {
    return { marks: { ...sMarks }, ...extra }
  }

  function heapFor(
    rFocus: string[],
    sFocus: string[],
    rExtra?: Partial<TreeVizState>,
    sExtra?: Partial<TreeVizState>,
  ): HeapObject[] {
    return trees(
      root.nodes,
      root.rootId,
      sub.nodes,
      sub.rootId,
      rFocus,
      sFocus,
      rViz(rExtra),
      sViz(sExtra),
    )
  }

  /** Condensed same-tree: one beat for mismatch, success marks leaves. */
  function sameTree(pId: string | null, qId: string | null): boolean {
    if (pId === null || qId === null) {
      const result = pId === qId
      stack.push({ name: 'isSameTree', root: pId, sub: qId, result })
      if (!dense) {
        push({
          narrative: result
            ? 'isSameTree: both null -> true.'
            : 'isSameTree: null mismatch -> false.',
          why: 'Same structure required at every corresponding node.',
          codeFocus: L.sameNulls,
          callStack: callStack(stack, stack.length - 1),
          heap: heapFor(pId ? [pId] : [], qId ? [qId] : []),
        })
      }
      stack.pop()
      return result
    }

    const pNode = rById.get(pId)!
    const qNode = sById.get(qId)!
    stack.push({ name: 'isSameTree', root: pId, sub: qId })

    if (pNode.value !== qNode.value) {
      const top = stack[stack.length - 1]!
      top.result = false
      push({
        narrative: `isSameTree: values ${pNode.value} vs ${qNode.value} differ -> false.`,
        why: 'Candidate root looked promising until values diverged.',
        codeFocus: L.sameVals,
        callStack: callStack(stack, stack.length - 1),
        heap: heapFor(
          [pId],
          [qId],
          { formula: { nodeId: pId, text: `${pNode.value}!=${qNode.value}` } },
          { formula: { nodeId: qId, text: 'mismatch' } },
        ),
      })
      stack.pop()
      return false
    }

    if (!dense) {
      push({
        narrative: `isSameTree at ${pNode.value}/${qNode.value}: values match - check both children.`,
        why: 'Exact match means same shape and values everywhere under this pair.',
        codeFocus: L.sameVals,
        callStack: callStack(stack, stack.length - 1),
        heap: heapFor(
          [pId],
          [qId],
          { formula: { nodeId: pId, text: `${pNode.value}==${qNode.value}` } },
        ),
      })
    }

    const leftOk = sameTree(pNode.left, qNode.left)
    if (!leftOk) {
      stack.pop()
      return false
    }
    const rightOk = sameTree(pNode.right, qNode.right)
    const result = leftOk && rightOk
    if (result) {
      rMarks[pId] = '✓'
      sMarks[qId] = '✓'
    }
    const top = stack[stack.length - 1]!
    top.result = result
    if (result || !dense) {
      push({
        narrative: result
          ? `isSameTree(${pNode.value}): left∧right -> true.`
          : `isSameTree(${pNode.value}): child mismatch -> false.`,
        why: result
          ? 'This candidate equals subRoot exactly.'
          : 'Keep searching other candidates in root.',
        codeFocus: L.sameRecurse,
        callStack: callStack(stack, stack.length - 1),
        heap: heapFor([pId], [qId]),
      })
    }
    stack.pop()
    return result
  }

  function isSubtree(rootId: string | null, subId: string | null): boolean {
    if (subId === null) {
      stack.push({ name: 'isSubtree', root: rootId, sub: subId, result: true })
      push({
        narrative: 'subRoot is null -> true (empty tree is a subtree of anything).',
        why: 'Vacuous match on an empty pattern.',
        codeFocus: L.subNull,
        callStack: callStack(stack, stack.length - 1),
        heap: heapFor(rootId ? [rootId] : [], []),
      })
      stack.pop()
      return true
    }
    if (rootId === null) {
      stack.push({ name: 'isSubtree', root: rootId, sub: subId, result: false })
      push({
        narrative: 'root is null but subRoot is not -> false.',
        why: 'Nothing left to match against.',
        codeFocus: L.rootNull,
        callStack: callStack(stack, stack.length - 1),
        heap: heapFor([], subId ? [subId] : []),
      })
      stack.pop()
      return false
    }

    const node = rById.get(rootId)!
    stack.push({ name: 'isSubtree', root: rootId, sub: subId })
    push({
      narrative: `Try candidate root=${node.value}: call isSameTree against full subRoot.`,
      why: 'Never shrink subRoot when searching - pass the whole pattern each time.',
      codeFocus: L.trySame,
      callStack: callStack(stack, stack.length - 1),
      heap: heapFor(
        [rootId],
        sub.rootId ? [sub.rootId] : [],
        { formula: { nodeId: rootId, text: 'try same?' } },
      ),
    })

    if (sameTree(rootId, subId)) {
      const top = stack[stack.length - 1]!
      top.result = true
      rMarks[rootId] = 'match'
      push({
        narrative: `Match at node ${node.value}. isSubtree -> true.`,
        why: 'isSameTree succeeded on this candidate.',
        codeFocus: L.trySame,
        callStack: callStack(stack, stack.length - 1),
        heap: heapFor([rootId], sub.rootId ? [sub.rootId] : []),
      })
      stack.pop()
      return true
    }

    push({
      narrative: `No match at ${node.value}. Search left, then right, still with full subRoot.`,
      why: 'Common bug: recursing with subRoot.left/right shrinks the target.',
      codeFocus: L.search,
      callStack: callStack(stack, stack.length - 1),
      heap: heapFor(
        node.left ? [node.left] : [rootId],
        sub.rootId ? [sub.rootId] : [],
      ),
    })

    const found =
      isSubtree(node.left, subId) || isSubtree(node.right, subId)
    const top = stack[stack.length - 1]!
    top.result = found
    push({
      narrative: found
        ? `Subtree found under ${node.value} -> true.`
        : `No subtree under ${node.value} -> false.`,
      why: 'OR of left and right searches.',
      codeFocus: L.search,
      callStack: callStack(stack, stack.length - 1),
      heap: heapFor([rootId], sub.rootId ? [sub.rootId] : []),
    })
    stack.pop()
    return found
  }

  if (!sub.rootId) {
    return [
      {
        id: 1,
        narrative: 'subRoot empty -> true immediately.',
        why: 'Empty pattern matches any root tree.',
        codeFocus: L.subNull,
        callStack: callStack(
          [{ name: 'isSubtree', root: root.rootId, sub: null, result: true }],
          0,
        ),
        heap: heapFor(root.rootId ? [root.rootId] : [], []),
      },
    ]
  }

  if (!root.rootId) {
    return [
      {
        id: 1,
        narrative: 'root empty, subRoot non-empty -> false.',
        why: 'No candidate nodes to compare.',
        codeFocus: L.rootNull,
        callStack: callStack(
          [{ name: 'isSubtree', root: null, sub: sub.rootId, result: false }],
          0,
        ),
        heap: heapFor([], [sub.rootId]),
      },
    ]
  }

  isSubtree(root.rootId, sub.rootId)
  return steps
}

const defaultRoot: Array<number | null> = [3, 4, 5, 1, 2]
const defaultSub: Array<number | null> = [4, 1, 2]

const input = defineInput<SubtreeInput>({
  kind: 'twoLevelOrderTrees',
  fields: [
    {
      key: 'root',
      label: 'root (level-order)',
      widget: 'text',
      placeholder: '3, 4, 5, 1, 2',
      hint: 'Up to 12 nodes each',
    },
    {
      key: 'subRoot',
      label: 'subRoot (level-order)',
      widget: 'text',
      placeholder: '4, 1, 2',
      hint: 'Up to 12 nodes each',
    },
  ],
  defaultRaw: {
    root: formatLevelOrder(defaultRoot),
    subRoot: formatLevelOrder(defaultSub),
  },
  parse: (raw) => {
    const rootResult = parseLevelOrder(raw.root ?? '', {
      name: 'root',
      ...TREE_LIMITS,
    })
    if (!rootResult.ok) return rootResult
    const subResult = parseLevelOrder(raw.subRoot ?? '', {
      name: 'subRoot',
      ...TREE_LIMITS,
    })
    if (!subResult.ok) return subResult
    return {
      ok: true,
      value: { root: rootResult.value, subRoot: subResult.value },
    }
  },
  formatLabel: (value) =>
    `root = [${formatLevelOrder(value.root.values)}], subRoot = [${formatLevelOrder(value.subRoot.values)}]`,
  generateSteps: generateSubtreeSteps,
  fixtures: [
    { name: 'empty-sub', raw: { root: '1,2', subRoot: '' } },
    { name: 'no-match', raw: { root: '3,4,5,1,2', subRoot: '4,1' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Subtree default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const subtreeOfAnotherTree: ProblemPack = {
  id: '0572-subtree-of-another-tree',
  lcNumber: 572,
  title: 'Subtree of Another Tree',
  pattern: 'Tree DFS',
  difficulty: 'Easy',
  insight:
    'Walk every node in root; at each candidate run exact sameTree. Always pass the full subRoot when searching children.',
  invariant:
    'isSubtree is true if some node in root roots a tree identical to subRoot.',
  complexity: { time: 'O(m·n)', space: 'O(h)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Search over root times Same Tree verifies each candidate.',
  ),
  walkthrough: {
    statement:
      'Given roots of two binary trees root and subRoot, check whether root contains a subtree that has the same structure and values as subRoot.',
    keyIdea:
      'Two helpers: search candidates with isSubtree; verify with isSameTree. Do not recurse search with subRoot.left/right.',
    approach: [
      'If subRoot is null, return true.',
      'If root is null, return false.',
      'If isSameTree(root, subRoot), return true.',
      'Else return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot).',
    ],
  },
}
