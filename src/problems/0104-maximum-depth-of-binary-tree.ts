/**
 * LeetCode #104 — Maximum Depth of Binary Tree.
 * Gold-standard pack: methodical DFS with depth/null/formula overlays on the tree.
 */
import javaSrc from '../../algorithms/0104-maximum-depth-of-binary-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0104-maximum-depth-of-binary-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0104-maximum-depth-of-binary-tree/solution.py?raw'
import type {
  CallFrame,
  HeapObject,
  ProblemPack,
  Step,
  TreeVizState,
} from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const treeNodes = [
  { id: 'n1', value: 1, left: 'n2', right: 'n3' },
  { id: 'n2', value: 2, left: 'n4', right: null },
  { id: 'n3', value: 3, left: null, right: null },
  { id: 'n4', value: 4, left: null, right: null },
]

function heap(focusIds: string[], viz?: TreeVizState): HeapObject[] {
  return [
    {
      id: 'tree',
      kind: 'tree',
      label: 'TreeNode root',
      nodes: treeNodes,
      rootId: 'n1',
      focusIds,
      focused: true,
      viz,
    },
  ]
}

const L = {
  enter: { java: 12, kotlin: 7, python: 11 },
  nullCheck: { java: 13, kotlin: 8, python: 12 },
  retZero: { java: 14, kotlin: 8, python: 13 },
  left: { java: 16, kotlin: 9, python: 14 },
  right: { java: 17, kotlin: 10, python: 15 },
  retDepth: { java: 18, kotlin: 11, python: 16 },
} as const

function frames(...items: CallFrame[]): CallFrame[] {
  return items
}

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Enter maxDepth at root node 1. Root is not null — we will measure both subtrees.',
    why: 'Depth is defined only after children return.',
    codeFocus: L.enter,
    callStack: frames({
      name: 'maxDepth',
      active: true,
      locals: { root: 'n1' },
    }),
    heap: heap(['n1']),
  },
  {
    id: 2,
    narrative: 'Recurse into the left child of 1 → call maxDepth(2).',
    why: 'Post-order: left depth must finish before right.',
    codeFocus: L.left,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1' } },
      { name: 'maxDepth', active: true, locals: { root: 'n2' } },
    ),
    heap: heap(['n2']),
  },
  {
    id: 3,
    narrative: 'At node 2: not null. Recurse left again → maxDepth(4).',
    why: 'Keep going down the left spine until we hit null.',
    codeFocus: L.left,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1' } },
      { name: 'maxDepth', locals: { root: 'n2' } },
      { name: 'maxDepth', active: true, locals: { root: 'n4' } },
    ),
    heap: heap(['n4']),
  },
  {
    id: 4,
    narrative: 'At leaf 4: recurse left → maxDepth(null). Null returns 0.',
    why: 'Every missing child is a base-case call.',
    codeFocus: L.left,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1' } },
      { name: 'maxDepth', locals: { root: 'n2' } },
      { name: 'maxDepth', locals: { root: 'n4' } },
      { name: 'maxDepth', active: true, locals: { root: null } },
    ),
    heap: heap(['n4'], {
      nullCall: { parentId: 'n4', side: 'left', text: 'return 0' },
    }),
  },
  {
    id: 5,
    narrative: 'Left of 4 is 0. Now take the right child — also null.',
    why: 'Null contributes depth 0 so a leaf becomes 1 + max(0, 0).',
    codeFocus: L.retZero,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1' } },
      { name: 'maxDepth', locals: { root: 'n2' } },
      { name: 'maxDepth', active: true, locals: { root: 'n4', left: 0 } },
    ),
    heap: heap(['n4'], {
      nullCall: { parentId: 'n4', side: 'left', text: '0' },
    }),
  },
  {
    id: 6,
    narrative: 'Right of 4 is null → return 0.',
    why: 'Same base case on the other side.',
    codeFocus: L.right,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1' } },
      { name: 'maxDepth', locals: { root: 'n2' } },
      { name: 'maxDepth', locals: { root: 'n4', left: 0 } },
      { name: 'maxDepth', active: true, locals: { root: null } },
    ),
    heap: heap(['n4'], {
      nullCall: { parentId: 'n4', side: 'right', text: 'return 0' },
    }),
  },
  {
    id: 7,
    narrative: 'Node 4 combines both sides: 1 + max(0, 0) = 1.',
    why: 'A leaf has depth 1.',
    codeFocus: L.retDepth,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1' } },
      { name: 'maxDepth', locals: { root: 'n2' } },
      {
        name: 'maxDepth',
        active: true,
        locals: { root: 'n4', left: 0, right: 0, result: 1 },
      },
    ),
    heap: heap(['n4'], {
      depths: { n4: 1 },
      formula: { nodeId: 'n4', text: '1+max(0,0)=1' },
    }),
  },
  {
    id: 8,
    narrative: 'Back at node 2 with left=1. Right child is null → return 0.',
    why: 'Node 2 has no right child.',
    codeFocus: L.right,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1' } },
      { name: 'maxDepth', locals: { root: 'n2', left: 1 } },
      { name: 'maxDepth', active: true, locals: { root: null } },
    ),
    heap: heap(['n2'], {
      depths: { n4: 1 },
      nullCall: { parentId: 'n2', side: 'right', text: 'return 0' },
    }),
  },
  {
    id: 9,
    narrative: 'Node 2 returns 1 + max(1, 0) = 2.',
    why: 'Longer path through the left child wins.',
    codeFocus: L.retDepth,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1' } },
      {
        name: 'maxDepth',
        active: true,
        locals: { root: 'n2', left: 1, right: 0, result: 2 },
      },
    ),
    heap: heap(['n2', 'n4'], {
      depths: { n4: 1, n2: 2 },
      formula: { nodeId: 'n2', text: '1+max(1,0)=2' },
    }),
  },
  {
    id: 10,
    narrative: 'Back at root 1 with left=2. Recurse right → maxDepth(3).',
    why: 'Now measure the right subtree the same way.',
    codeFocus: L.right,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1', left: 2 } },
      { name: 'maxDepth', active: true, locals: { root: 'n3' } },
    ),
    heap: heap(['n3'], {
      depths: { n4: 1, n2: 2 },
    }),
  },
  {
    id: 11,
    narrative: 'At node 3: left child is null → return 0.',
    why: 'Leaf path on the right side.',
    codeFocus: L.left,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1', left: 2 } },
      { name: 'maxDepth', locals: { root: 'n3' } },
      { name: 'maxDepth', active: true, locals: { root: null } },
    ),
    heap: heap(['n3'], {
      depths: { n4: 1, n2: 2 },
      nullCall: { parentId: 'n3', side: 'left', text: 'return 0' },
    }),
  },
  {
    id: 12,
    narrative: 'Right of 3 is also null → return 0.',
    why: 'Both children of 3 are missing.',
    codeFocus: L.right,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1', left: 2 } },
      { name: 'maxDepth', locals: { root: 'n3', left: 0 } },
      { name: 'maxDepth', active: true, locals: { root: null } },
    ),
    heap: heap(['n3'], {
      depths: { n4: 1, n2: 2 },
      nullCall: { parentId: 'n3', side: 'right', text: 'return 0' },
    }),
  },
  {
    id: 13,
    narrative: 'Node 3 returns 1 + max(0, 0) = 1.',
    why: 'Right subtree depth is 1.',
    codeFocus: L.retDepth,
    callStack: frames(
      { name: 'maxDepth', locals: { root: 'n1', left: 2 } },
      {
        name: 'maxDepth',
        active: true,
        locals: { root: 'n3', left: 0, right: 0, result: 1 },
      },
    ),
    heap: heap(['n3'], {
      depths: { n4: 1, n2: 2, n3: 1 },
      formula: { nodeId: 'n3', text: '1+max(0,0)=1' },
    }),
  },
  {
    id: 14,
    narrative: 'Root combines: 1 + max(2, 1) = 3. Maximum depth is 3.',
    why: 'Answer is the longest root-to-leaf path in nodes (1→2→4).',
    codeFocus: L.retDepth,
    callStack: frames({
      name: 'maxDepth',
      active: true,
      locals: { root: 'n1', left: 2, right: 1, result: 3 },
    }),
    heap: heap(['n1', 'n2', 'n4'], {
      depths: { n4: 1, n2: 2, n3: 1, n1: 3 },
      formula: { nodeId: 'n1', text: '1+max(2,1)=3' },
    }),
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
  inputLabel: 'root = [1,2,3,4]  (1 → left 2 → left 4; right 3)',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark(
    'Call-stack depth tracks tree height; heap holds the shared tree object.',
  ),
  walkthrough: {
    statement:
      'Given the root of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to the farthest leaf.',
    keyIdea:
      'Depth of a node is 1 plus the larger of its left and right subtree depths. Null nodes have depth 0.',
    approach: [
      'Base case: if the node is null, return 0.',
      'Recursively compute left and right depths.',
      'Return 1 + max(left, right).',
    ],
  },
}
