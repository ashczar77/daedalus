/**
 * LeetCode #543 — Diameter of Binary Tree.
 * Methodical height DFS with h= badges and through-path formulas.
 */
import javaSrc from '../../algorithms/0543-diameter-of-binary-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0543-diameter-of-binary-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0543-diameter-of-binary-tree/solution.py?raw'
import type {
  CallFrame,
  HeapObject,
  ProblemPack,
  Step,
  TreeVizState,
} from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const tree = [
  { id: 'n1', value: 1, left: 'n2', right: 'n3' },
  { id: 'n2', value: 2, left: 'n4', right: 'n5' },
  { id: 'n3', value: 3, left: null, right: null },
  { id: 'n4', value: 4, left: null, right: null },
  { id: 'n5', value: 5, left: null, right: null },
]

function heap(focusIds: string[], viz?: TreeVizState): HeapObject[] {
  return [
    {
      id: 'tree',
      kind: 'tree',
      label: 'TreeNode',
      nodes: tree,
      rootId: 'n1',
      focusIds,
      focused: true,
      viz,
    },
  ]
}

const L = {
  start: { java: 16, kotlin: 11, python: 22 },
  height: { java: 21, kotlin: 15, python: 14 },
  nulls: { java: 22, kotlin: 16, python: 15 },
  combine: { java: 26, kotlin: 19, python: 19 },
  retBest: { java: 17, kotlin: 12, python: 23 },
} as const

function frames(...items: CallFrame[]): CallFrame[] {
  return items
}

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Reset best=0 and start height(root=1). Diameter is tracked globally.',
    why: 'Diameter is not the same as the height of the root.',
    codeFocus: L.start,
    callStack: frames(
      { name: 'diameterOfBinaryTree', locals: { best: 0 } },
      { name: 'height', active: true, locals: { node: 'n1' } },
    ),
    heap: heap(['n1']),
  },
  {
    id: 2,
    narrative: 'Go left into height(2).',
    why: 'Post-order: child heights first.',
    codeFocus: L.height,
    callStack: frames(
      { name: 'diameterOfBinaryTree', locals: { best: 0 } },
      { name: 'height', locals: { node: 'n1' } },
      { name: 'height', active: true, locals: { node: 'n2' } },
    ),
    heap: heap(['n2']),
  },
  {
    id: 3,
    narrative: 'At leaf 4: both children null → height 0, so h(4)=1.',
    why: 'Base case grounds the recursion.',
    codeFocus: L.combine,
    callStack: frames(
      { name: 'diameterOfBinaryTree', locals: { best: 0 } },
      { name: 'height', locals: { node: 'n1' } },
      { name: 'height', locals: { node: 'n2' } },
      {
        name: 'height',
        active: true,
        locals: { node: 'n4', left: 0, right: 0, returnHeight: 1 },
      },
    ),
    heap: heap(['n4'], {
      marks: { n4: 'h=1' },
      formula: { nodeId: 'n4', text: '1+max(0,0)=1' },
      nullCall: { parentId: 'n4', side: 'left', text: 'return 0' },
    }),
  },
  {
    id: 4,
    narrative: 'Leaf 5 likewise returns h=1.',
    why: 'Symmetric right child of node 2.',
    codeFocus: L.combine,
    callStack: frames(
      { name: 'diameterOfBinaryTree', locals: { best: 0 } },
      { name: 'height', locals: { node: 'n1' } },
      { name: 'height', locals: { node: 'n2' } },
      {
        name: 'height',
        active: true,
        locals: { node: 'n5', left: 0, right: 0, returnHeight: 1 },
      },
    ),
    heap: heap(['n5'], {
      marks: { n4: 'h=1', n5: 'h=1' },
      formula: { nodeId: 'n5', text: '1+max(0,0)=1' },
    }),
  },
  {
    id: 5,
    narrative: 'At node 2: through-path left+right = 1+1 = 2 updates best. Return h=2.',
    why: 'Helper returns height; best tracks the longest through-node path.',
    codeFocus: L.combine,
    callStack: frames(
      { name: 'diameterOfBinaryTree', locals: { best: 2 } },
      { name: 'height', locals: { node: 'n1' } },
      {
        name: 'height',
        active: true,
        locals: {
          node: 'n2',
          left: 1,
          right: 1,
          through: 2,
          returnHeight: 2,
        },
      },
    ),
    heap: heap(['n2', 'n4', 'n5'], {
      marks: { n4: 'h=1', n5: 'h=1', n2: 'h=2' },
      formula: { nodeId: 'n2', text: 'best←1+1=2' },
    }),
  },
  {
    id: 6,
    narrative: 'Right of root: height(3) → leaf → h=1.',
    why: 'Finish the other subtree before combining at the root.',
    codeFocus: L.combine,
    callStack: frames(
      { name: 'diameterOfBinaryTree', locals: { best: 2 } },
      { name: 'height', locals: { node: 'n1' } },
      {
        name: 'height',
        active: true,
        locals: { node: 'n3', left: 0, right: 0, returnHeight: 1 },
      },
    ),
    heap: heap(['n3'], {
      marks: { n4: 'h=1', n5: 'h=1', n2: 'h=2', n3: 'h=1' },
      formula: { nodeId: 'n3', text: '1+max(0,0)=1' },
    }),
  },
  {
    id: 7,
    narrative: 'At root: through-path 2+1 = 3 beats best. Return best=3.',
    why: 'Answer is max through-node path seen anywhere — not height(root).',
    codeFocus: L.retBest,
    callStack: frames({
      name: 'diameterOfBinaryTree',
      active: true,
      locals: { best: 3, result: 3 },
    }),
    heap: heap(['n1', 'n2', 'n4', 'n3'], {
      marks: { n4: 'h=1', n5: 'h=1', n2: 'h=2', n3: 'h=1', n1: 'h=3' },
      formula: { nodeId: 'n1', text: 'best←2+1=3' },
    }),
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
