/**
 * LeetCode #543 — Diameter of Binary Tree.
 * Demo: root 1 with left 2 (children 4,5) and right 3 → diameter 3 (4-2-5 or 4-2-1-3).
 */
import javaSrc from '../../algorithms/0543-diameter-of-binary-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0543-diameter-of-binary-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0543-diameter-of-binary-tree/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const tree = [
  { id: 'n1', value: 1, left: 'n2', right: 'n3' },
  { id: 'n2', value: 2, left: 'n4', right: 'n5' },
  { id: 'n3', value: 3, left: null, right: null },
  { id: 'n4', value: 4, left: null, right: null },
  { id: 'n5', value: 5, left: null, right: null },
]

const steps: Step[] = [
  {
    id: 1,
    narrative: 'diameterOfBinaryTree resets best=0 and starts height(root).',
    why: 'Diameter is a global — not the same as root height.',
    codeFocus: { java: 16, kotlin: 11, python: 22 },
    callStack: [
      {
        name: 'diameterOfBinaryTree',
        active: true,
        locals: { root: { ref: 'tree' }, best: 0 },
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
    narrative: 'At node 2: left height=1, right height=1 → candidate path 1+1=2 updates best.',
    why: 'Through-node path uses both child heights; returned value is still just height.',
    codeFocus: { java: 26, kotlin: 19, python: 19 },
    callStack: [
      { name: 'diameterOfBinaryTree', locals: { best: 0 } },
      { name: 'height', locals: { node: 'n1' } },
      {
        name: 'height',
        active: true,
        locals: { node: 'n2', left: 1, right: 1, best: 2, returnHeight: 2 },
      },
    ],
    heap: [
      {
        id: 'tree',
        kind: 'tree',
        label: 'TreeNode',
        nodes: tree,
        rootId: 'n1',
        focusIds: ['n2', 'n4', 'n5'],
        focused: true,
      },
    ],
  },
  {
    id: 3,
    narrative: 'At root: left height=2, right height=1 → path 3 beats best. Return best=3.',
    why: 'Answer is the max through-node path seen anywhere, not depth(root).',
    codeFocus: { java: 17, kotlin: 12, python: 23 },
    callStack: [
      {
        name: 'diameterOfBinaryTree',
        active: true,
        locals: { best: 3, result: 3 },
      },
    ],
    heap: [
      {
        id: 'tree',
        kind: 'tree',
        label: 'TreeNode',
        nodes: tree,
        rootId: 'n1',
        focusIds: ['n4', 'n2', 'n1', 'n3'],
        focused: true,
      },
    ],
  },
]

export const diameterOfBinaryTree: ProblemPack = {
  id: '0543-diameter-of-binary-tree',
  lcNumber: 543,
  title: 'Diameter of Binary Tree',
  pattern: 'Tree DFS',
  difficulty: 'Easy',
  insight: 'Helper returns height; global tracks left+right at each node for the diameter.',
  invariant: 'dfs(node) returns subtree height; best is max path edges seen through any node.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  inputLabel: 'root = [1,2,3,4,5]',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark('One DFS pass computes heights and diameter together.'),
}
