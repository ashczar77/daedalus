/**
 * LeetCode #100 - Same Tree (simultaneous DFS).
 * Phase 4: two level-order fields + lockstep compare generator.
 */
import javaSrc from '../../algorithms/0100-same-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0100-same-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0100-same-tree/solution.py?raw'
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

type SameTreeInput = {
  p: ParsedTree
  q: ParsedTree
}

const L = {
  enter: { java: 12, kotlin: 7, python: 11 },
  nulls: { java: 13, kotlin: 8, python: 12 },
  vals: { java: 16, kotlin: 9, python: 14 },
  recurse: { java: 19, kotlin: 10, python: 16 },
} as const

const TREE_LIMITS = { maxNodes: 12, minVal: -99, maxVal: 99 }

function prefixTree(tree: ParsedTree, prefix: 'p' | 'q'): ParsedTree {
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
  pNodes: TreeNode[],
  pRoot: string | null,
  qNodes: TreeNode[],
  qRoot: string | null,
  pFocus: string[],
  qFocus: string[],
  pViz?: TreeVizState,
  qViz?: TreeVizState,
): HeapObject[] {
  return [
    {
      id: 'p',
      kind: 'tree',
      label: 'tree p',
      nodes: pNodes,
      rootId: pRoot,
      focusIds: pFocus,
      focused: true,
      viz: pViz,
    },
    {
      id: 'q',
      kind: 'tree',
      label: 'tree q',
      nodes: qNodes,
      rootId: qRoot,
      focusIds: qFocus,
      focused: true,
      viz: qViz,
    },
  ]
}

type StackFrame = {
  p: string | null
  q: string | null
  result?: boolean
}

function locals(f: StackFrame): CallFrame['locals'] {
  const out: CallFrame['locals'] = { p: f.p, q: f.q }
  if (f.result !== undefined) out.result = f.result
  return out
}

function callStack(frames: StackFrame[], activeIndex: number): CallFrame[] {
  return frames.map((f, i) => ({
    name: 'isSameTree',
    active: i === activeIndex,
    locals: locals(f),
  }))
}

function generateSameTreeSteps(input: SameTreeInput): Step[] {
  const p = prefixTree(input.p, 'p')
  const q = prefixTree(input.q, 'q')
  const pById = new Map(p.nodes.map((n) => [n.id, n]))
  const qById = new Map(q.nodes.map((n) => [n.id, n]))
  const pMarks: Record<string, string> = {}
  const qMarks: Record<string, string> = {}
  const steps: Step[] = []
  let stepId = 1
  const stack: StackFrame[] = []
  const dense = p.nodes.length + q.nodes.length > 10

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function pViz(extra?: Partial<TreeVizState>): TreeVizState {
    return { marks: { ...pMarks }, ...extra }
  }
  function qViz(extra?: Partial<TreeVizState>): TreeVizState {
    return { marks: { ...qMarks }, ...extra }
  }

  function dfs(pId: string | null, qId: string | null): boolean {
    if (pId === null || qId === null) {
      const result = pId === qId
      stack.push({ p: pId, q: qId, result })
      push({
        narrative: result
          ? 'One or both nodes null, and both are null → true.'
          : 'Null mismatch: one side missing a node → false.',
        why: 'p == null && q == null is the matching base case.',
        codeFocus: L.nulls,
        callStack: callStack(stack, stack.length - 1),
        heap: trees(
          p.nodes,
          p.rootId,
          q.nodes,
          q.rootId,
          pId ? [pId] : [],
          qId ? [qId] : [],
          pId
            ? { nullCall: { parentId: pId, side: 'left', text: result ? 'null→true' : 'null→false' } }
            : undefined,
          qId
            ? { nullCall: { parentId: qId, side: 'left', text: result ? 'null→true' : 'null→false' } }
            : undefined,
        ),
      })
      stack.pop()
      return result
    }

    const pNode = pById.get(pId)!
    const qNode = qById.get(qId)!

    if (pNode.value !== qNode.value) {
      stack.push({ p: pId, q: qId, result: false })
      push({
        narrative: `Values differ: p=${pNode.value}, q=${qNode.value} → return false.`,
        why: 'Structure can match but values must too.',
        codeFocus: L.vals,
        callStack: callStack(stack, stack.length - 1),
        heap: trees(
          p.nodes,
          p.rootId,
          q.nodes,
          q.rootId,
          [pId],
          [qId],
          { formula: { nodeId: pId, text: `${pNode.value} != ${qNode.value}` } },
          { formula: { nodeId: qId, text: 'mismatch' } },
        ),
      })
      stack.pop()
      return false
    }

    stack.push({ p: pId, q: qId })
    if (!dense || stack.length === 1) {
      push({
        narrative:
          stack.length === 1
            ? `Compare roots p=${pNode.value} and q=${qNode.value}. Values match - recurse both subtrees.`
            : `At nodes ${pNode.value} and ${qNode.value}: values match.`,
        why: 'Check structure (null) before comparing values.',
        codeFocus: L.vals,
        callStack: callStack(stack, stack.length - 1),
        heap: trees(
          p.nodes,
          p.rootId,
          q.nodes,
          q.rootId,
          [pId],
          [qId],
          { formula: { nodeId: pId, text: `${pNode.value} == ${qNode.value}` } },
        ),
      })
    }

    if (!dense) {
      push({
        narrative: 'Recurse left: isSameTree(p.left, q.left).',
        why: 'Both left AND right subtrees must match.',
        codeFocus: L.recurse,
        callStack: callStack(stack, stack.length - 1),
        heap: trees(
          p.nodes,
          p.rootId,
          q.nodes,
          q.rootId,
          pNode.left ? [pNode.left] : [pId],
          qNode.left ? [qNode.left] : [qId],
          pViz(),
          qViz(),
        ),
      })
    }

    const leftOk = dfs(pNode.left, qNode.left)
    if (!leftOk) {
      stack.pop()
      return false
    }

    if (!dense) {
      push({
        narrative: 'Recurse right: isSameTree(p.right, q.right).',
        why: 'Still need the right subtrees to agree.',
        codeFocus: L.recurse,
        callStack: callStack(stack, stack.length - 1),
        heap: trees(p.nodes, p.rootId, q.nodes, q.rootId, [pId], [qId], pViz(), qViz()),
      })
    }

    const rightOk = dfs(pNode.right, qNode.right)
    const result = leftOk && rightOk
    if (result) {
      pMarks[pId] = '✓'
      qMarks[qId] = '✓'
    }

    const top = stack[stack.length - 1]!
    top.result = result
    push({
      narrative: result
        ? stack.length === 1
          ? 'Root combines left∧right → true. Trees are identical.'
          : `Nodes ${pNode.value}/${qNode.value}: left∧right → true.`
        : `Subtree at ${pNode.value}/${qNode.value} fails → false.`,
      why: result
        ? 'Same values and same shape at every corresponding node.'
        : 'Early false propagates up the call stack.',
      codeFocus: L.recurse,
      callStack: callStack(stack, stack.length - 1),
      heap: trees(
        p.nodes,
        p.rootId,
        q.nodes,
        q.rootId,
        [pId],
        [qId],
        {
          ...pViz(),
          marks: result ? { ...pMarks, [pId]: '✓' } : pViz().marks,
          formula: result
            ? { nodeId: pId, text: `${leftOk} ∧ ${rightOk}` }
            : undefined,
        },
        {
          ...qViz(),
          marks: result ? { ...qMarks, [qId]: '✓' } : qViz().marks,
        },
      ),
    })
    stack.pop()
    return result
  }

  if (!p.rootId && !q.rootId) {
    return [
      {
        id: 1,
        narrative: 'Both trees empty: isSameTree(null, null) → true.',
        why: 'Two missing roots still match in structure.',
        codeFocus: L.nulls,
        callStack: callStack([{ p: null, q: null, result: true }], 0),
        heap: trees([], null, [], null, [], []),
      },
    ]
  }

  if (!p.rootId || !q.rootId) {
    return [
      {
        id: 1,
        narrative: 'One tree empty, the other not → false immediately.',
        why: 'Different structure at the roots.',
        codeFocus: L.nulls,
        callStack: callStack([{ p: p.rootId, q: q.rootId, result: false }], 0),
        heap: trees(
          p.nodes,
          p.rootId,
          q.nodes,
          q.rootId,
          p.rootId ? [p.rootId] : [],
          q.rootId ? [q.rootId] : [],
        ),
      },
    ]
  }

  dfs(p.rootId, q.rootId)
  return steps
}

const defaultValues: Array<number | null> = [1, 2, 3]

const input = defineInput<SameTreeInput>({
  kind: 'twoLevelOrderTrees',
  fields: [
    {
      key: 'p',
      label: 'p (level-order)',
      widget: 'text',
      placeholder: '1, 2, 3',
      hint: 'Up to 12 nodes each',
    },
    {
      key: 'q',
      label: 'q (level-order)',
      widget: 'text',
      placeholder: '1, 2, 3',
      hint: 'Up to 12 nodes each',
    },
  ],
  defaultRaw: {
    p: formatLevelOrder(defaultValues),
    q: formatLevelOrder(defaultValues),
  },
  parse: (raw) => {
    const pResult = parseLevelOrder(raw.p ?? '', { name: 'p', ...TREE_LIMITS })
    if (!pResult.ok) return pResult
    const qResult = parseLevelOrder(raw.q ?? '', { name: 'q', ...TREE_LIMITS })
    if (!qResult.ok) return qResult
    return { ok: true, value: { p: pResult.value, q: qResult.value } }
  },
  formatLabel: (value) =>
    `p = [${formatLevelOrder(value.p.values)}], q = [${formatLevelOrder(value.q.values)}]`,
  generateSteps: generateSameTreeSteps,
  fixtures: [
    { name: 'both-empty', raw: { p: '', q: '' } },
    { name: 'mismatch', raw: { p: '1,2', q: '1,null,2' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(`Same Tree default input invalid: ${defaultParsed.errors.join('; ')}`)
}

export const sameTree: ProblemPack = {
  id: '0100-same-tree',
  lcNumber: 100,
  title: 'Same Tree',
  pattern: 'Tree DFS',
  difficulty: 'Easy',
  insight: 'Handle null mismatch first; then values; then left AND right.',
  invariant: 'Return whether subtrees rooted at p and q are identical.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Two heap trees walked in lockstep; stack frames mirror recursion.',
  ),
  walkthrough: {
    statement:
      'Given the roots of two binary trees p and q, write a function to check whether they are the same - same structure and same node values.',
    keyIdea:
      'DFS both trees together: null mismatch → false; value mismatch → false; else left AND right.',
    approach: [
      'If either node is null, return whether both are null.',
      'If values differ, return false.',
      'Return isSameTree(left) && isSameTree(right).',
    ],
  },
}
