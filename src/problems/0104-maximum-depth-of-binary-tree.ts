/**
 * LeetCode #104 — Maximum Depth of Binary Tree.
 * Demo: depth-3 skewed-ish tree [1,2,3] with 2 having child 4 → depth 3.
 */
import javaSrc from '../../algorithms/0104-maximum-depth-of-binary-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0104-maximum-depth-of-binary-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0104-maximum-depth-of-binary-tree/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const tree = [
  { id: 'n1', value: 1, left: 'n2', right: 'n3' },
  { id: 'n2', value: 2, left: 'n4', right: null },
  { id: 'n3', value: 3, left: null, right: null },
  { id: 'n4', value: 4, left: null, right: null },
]

const steps: Step[] = [
  {
    id: 1,
    narrative: 'DFS into maxDepth(1). Push a frame; recurse left before combining.',
    why: 'Post-order: children depths must be known before this frame can return.',
    codeFocus: { java: 16, kotlin: 9, python: 14 },
    callStack: [
      {
        name: 'maxDepth',
        active: true,
        locals: { root: 'n1' },
      },
    ],
    heap: [
      {
        id: 'tree',
        kind: 'tree',
        label: 'TreeNode',
        nodes: tree,
        rootId: 'n1',
        focusIds: ['n1'],
        focused: true,
      },
    ],
  },
  {
    id: 2,
    narrative: 'Deepest call maxDepth(4) hits a leaf path — left/right null return 0, so height=1.',
    why: 'Base case null → 0 is what grounds the recursion.',
    codeFocus: { java: 18, kotlin: 11, python: 16 },
    callStack: [
      { name: 'maxDepth', locals: { root: 'n1' } },
      { name: 'maxDepth', locals: { root: 'n2' } },
      { name: 'maxDepth', active: true, locals: { root: 'n4', left: 0, right: 0, result: 1 } },
    ],
    heap: [
      {
        id: 'tree',
        kind: 'tree',
        label: 'TreeNode',
        nodes: tree,
        rootId: 'n1',
        focusIds: ['n4'],
        focused: true,
      },
    ],
  },
  {
    id: 3,
    narrative: 'Frames unwind: depth(2)=2, depth(3)=1, root returns 1+max(2,1)=3.',
    why: 'Answer is the longest root-to-leaf path length in nodes.',
    codeFocus: { java: 18, kotlin: 11, python: 16 },
    callStack: [
      {
        name: 'maxDepth',
        active: true,
        locals: { root: 'n1', left: 2, right: 1, result: 3 },
      },
    ],
    heap: [
      {
        id: 'tree',
        kind: 'tree',
        label: 'TreeNode',
        nodes: tree,
        rootId: 'n1',
        focusIds: ['n1', 'n2', 'n4'],
        focused: true,
      },
    ],
  },
]

export const maximumDepthOfBinaryTree: ProblemPack = {
  id: '0104-maximum-depth-of-binary-tree',
  lcNumber: 104,
  title: 'Maximum Depth of Binary Tree',
  pattern: 'Tree DFS',
  difficulty: 'Easy',
  insight: '1 + max(leftDepth, rightDepth); null → 0.',
  invariant: 'Return value = max depth of the subtree rooted at this node.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  inputLabel: 'root = [1,2,3,4]',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark('Call stack is the only extra memory beyond the heap tree.'),
}
