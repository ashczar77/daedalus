/**
 * LeetCode #226 — Invert Binary Tree (DFS swap).
 * Demo tree: 2 / \ 1 3 → 2 / \ 3 1
 */
import javaSrc from '../../algorithms/0226-invert-binary-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0226-invert-binary-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0226-invert-binary-tree/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
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

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Enter invertTree(root=2). Call-stack frame holds root → heap tree.',
    why: 'Recursion depth will mirror tree height — that is the O(h) stack space.',
    codeFocus: { java: 13, kotlin: 8, python: 12 },
    callStack: [
      {
        name: 'invertTree',
        active: true,
        locals: { root: { ref: 'tree' } },
      },
    ],
    heap: [
      {
        id: 'tree',
        kind: 'tree',
        label: 'TreeNode root',
        nodes: before,
        rootId: 'r',
        focusIds: ['r'],
        focused: true,
      },
    ],
  },
  {
    id: 2,
    narrative: 'Swap root.left and root.right on the heap object itself.',
    why: 'Must mutate the node fields — swapping local references alone does nothing.',
    codeFocus: { java: 18, kotlin: 11, python: 14 },
    callStack: [
      {
        name: 'invertTree',
        active: true,
        locals: { root: { ref: 'tree' }, tmp: 'l' },
      },
    ],
    heap: [
      {
        id: 'tree',
        kind: 'tree',
        label: 'TreeNode root (swapped)',
        nodes: after,
        rootId: 'r',
        focusIds: ['r', 'l', 'ri'],
        focused: true,
      },
    ],
  },
  {
    id: 3,
    narrative: 'Recurse into both children (leaves). Frames return; tree is fully inverted.',
    why: 'Post-order style: fix this node, then ensure subtrees are inverted.',
    codeFocus: { java: 21, kotlin: 14, python: 17 },
    callStack: [
      {
        name: 'invertTree',
        active: true,
        locals: { root: { ref: 'tree' }, result: { ref: 'tree' } },
      },
    ],
    heap: [
      {
        id: 'tree',
        kind: 'tree',
        label: 'TreeNode root',
        nodes: after,
        rootId: 'r',
        focusIds: ['r', 'l', 'ri'],
        focused: true,
      },
    ],
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
  benchmark: placeholderBenchmark('Call-stack depth tracks tree height; heap nodes are mutated in place.'),
}
