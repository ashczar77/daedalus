/**
 * LeetCode #226 — Invert Binary Tree (DFS swap).
 * Methodical step-into with swap formulas on the tree viz.
 */
import javaSrc from '../../algorithms/0226-invert-binary-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0226-invert-binary-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0226-invert-binary-tree/solution.py?raw'
import type {
  CallFrame,
  HeapObject,
  ProblemPack,
  Step,
  TreeVizState,
} from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const before = [
  { id: 'r', value: 2, left: 'l', right: 'ri' },
  { id: 'l', value: 1, left: null, right: null },
  { id: 'ri', value: 3, left: null, right: null },
]

const after = [
  { id: 'r', value: 2, left: 'ri', right: 'l' },
  { id: 'l', value: 1, left: null, right: null },
  { id: 'ri', value: 3, left: null, right: null },
]

function heap(
  nodes: typeof before,
  focusIds: string[],
  viz?: TreeVizState,
): HeapObject[] {
  return [
    {
      id: 'tree',
      kind: 'tree',
      label: 'TreeNode root',
      nodes,
      rootId: 'r',
      focusIds,
      focused: true,
      viz,
    },
  ]
}

const L = {
  enter: { java: 13, kotlin: 8, python: 12 },
  nullCheck: { java: 14, kotlin: 9, python: 13 },
  swap: { java: 18, kotlin: 11, python: 14 },
  recurse: { java: 19, kotlin: 12, python: 16 },
  ret: { java: 21, kotlin: 14, python: 17 },
} as const

function frames(...items: CallFrame[]): CallFrame[] {
  return items
}

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Enter invertTree at root 2. Node is not null — we will swap its children.',
    why: 'Recursion depth mirrors tree height (O(h) stack space).',
    codeFocus: L.enter,
    callStack: frames({
      name: 'invertTree',
      active: true,
      locals: { root: 'r' },
    }),
    heap: heap(before, ['r']),
  },
  {
    id: 2,
    narrative: 'Swap on the heap object: left↔right. Tree becomes 2 / \\ 3 1.',
    why: 'Must mutate node fields — swapping local copies does nothing.',
    codeFocus: L.swap,
    callStack: frames({
      name: 'invertTree',
      active: true,
      locals: { root: 'r', tmp: 'l' },
    }),
    heap: heap(after, ['r', 'l', 'ri'], {
      formula: { nodeId: 'r', text: 'swap L ↔ R' },
      marks: { r: 'swapped' },
    }),
  },
  {
    id: 3,
    narrative: 'Recurse into the new left child (3).',
    why: 'After swapping this node, both subtrees must be inverted too.',
    codeFocus: L.recurse,
    callStack: frames(
      { name: 'invertTree', locals: { root: 'r' } },
      { name: 'invertTree', active: true, locals: { root: 'ri' } },
    ),
    heap: heap(after, ['ri'], { marks: { r: 'swapped' } }),
  },
  {
    id: 4,
    narrative: 'Node 3 is a leaf: left is null → return null (base case).',
    why: 'Null children need no swap.',
    codeFocus: L.nullCheck,
    callStack: frames(
      { name: 'invertTree', locals: { root: 'r' } },
      { name: 'invertTree', locals: { root: 'ri' } },
      { name: 'invertTree', active: true, locals: { root: null } },
    ),
    heap: heap(after, ['ri'], {
      marks: { r: 'swapped' },
      nullCall: { parentId: 'ri', side: 'left', text: 'return null' },
    }),
  },
  {
    id: 5,
    narrative: 'Right of 3 is also null. Leaf returns; frame for 3 pops.',
    why: 'A leaf is already “inverted.”',
    codeFocus: L.ret,
    callStack: frames(
      { name: 'invertTree', locals: { root: 'r' } },
      {
        name: 'invertTree',
        active: true,
        locals: { root: 'ri', result: 'ri' },
      },
    ),
    heap: heap(after, ['ri'], {
      marks: { r: 'swapped', ri: 'done' },
    }),
  },
  {
    id: 6,
    narrative: 'Recurse into the new right child (1) — same leaf story.',
    why: 'Symmetric call on the other swapped child.',
    codeFocus: L.recurse,
    callStack: frames(
      { name: 'invertTree', locals: { root: 'r' } },
      { name: 'invertTree', active: true, locals: { root: 'l' } },
    ),
    heap: heap(after, ['l'], {
      marks: { r: 'swapped', ri: 'done' },
      nullCall: { parentId: 'l', side: 'left', text: 'return null' },
    }),
  },
  {
    id: 7,
    narrative: 'Both children inverted. Return root — tree is fully inverted.',
    why: 'Post-order: fix node, then ensure both subtrees are done.',
    codeFocus: L.ret,
    callStack: frames({
      name: 'invertTree',
      active: true,
      locals: { root: 'r', result: 'r' },
    }),
    heap: heap(after, ['r', 'l', 'ri'], {
      marks: { r: 'done', l: 'done', ri: 'done' },
      formula: { nodeId: 'r', text: 'return root' },
    }),
  },
]

export const invertBinaryTree: ProblemPack = {
  id: '0226-invert-binary-tree',
  lcNumber: 226,
  title: 'Invert Binary Tree',
  pattern: 'Tree DFS',
  difficulty: 'Easy',
  insight: 'Swap children on the node object, then recurse — never swap copied references.',
  invariant: 'After processing a node, both subtrees are swapped and fully inverted.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  inputLabel: 'root = [2,1,3]',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
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
