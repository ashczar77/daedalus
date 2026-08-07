/**
 * LeetCode #100 — Same Tree (simultaneous DFS).
 * Methodical lockstep walk with ✓ / null→true overlays.
 */
import javaSrc from '../../algorithms/0100-same-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0100-same-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0100-same-tree/solution.py?raw'
import type {
  CallFrame,
  HeapObject,
  ProblemPack,
  Step,
  TreeVizState,
} from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const pTree = [
  { id: 'p1', value: 1, left: 'p2', right: 'p3' },
  { id: 'p2', value: 2, left: null, right: null },
  { id: 'p3', value: 3, left: null, right: null },
]
const qTree = [
  { id: 'q1', value: 1, left: 'q2', right: 'q3' },
  { id: 'q2', value: 2, left: null, right: null },
  { id: 'q3', value: 3, left: null, right: null },
]

function trees(
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
      nodes: pTree,
      rootId: 'p1',
      focusIds: pFocus,
      focused: true,
      viz: pViz,
    },
    {
      id: 'q',
      kind: 'tree',
      label: 'tree q',
      nodes: qTree,
      rootId: 'q1',
      focusIds: qFocus,
      focused: true,
      viz: qViz,
    },
  ]
}

const L = {
  enter: { java: 13, kotlin: 7, python: 12 },
  nulls: { java: 14, kotlin: 8, python: 13 },
  vals: { java: 17, kotlin: 9, python: 15 },
  recurse: { java: 19, kotlin: 10, python: 16 },
} as const

function frames(...items: CallFrame[]): CallFrame[] {
  return items
}

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Compare roots p=1 and q=1. Neither null; values match.',
    why: 'Check structure (null) before comparing values.',
    codeFocus: L.vals,
    callStack: frames({
      name: 'isSameTree',
      active: true,
      locals: { p: 'p1', q: 'q1' },
    }),
    heap: trees(['p1'], ['q1'], {
      formula: { nodeId: 'p1', text: '1 == 1' },
    }),
  },
  {
    id: 2,
    narrative: 'Recurse left: isSameTree(p2, q2).',
    why: 'Both left AND right subtrees must match.',
    codeFocus: L.recurse,
    callStack: frames(
      { name: 'isSameTree', locals: { p: 'p1', q: 'q1' } },
      { name: 'isSameTree', active: true, locals: { p: 'p2', q: 'q2' } },
    ),
    heap: trees(['p2'], ['q2']),
  },
  {
    id: 3,
    narrative: 'At leaves 2 and 2: values match. Left children are both null → true.',
    why: 'p==null && q==null is the matching base case.',
    codeFocus: L.nulls,
    callStack: frames(
      { name: 'isSameTree', locals: { p: 'p1', q: 'q1' } },
      { name: 'isSameTree', locals: { p: 'p2', q: 'q2' } },
      {
        name: 'isSameTree',
        active: true,
        locals: { p: null, q: null, result: true },
      },
    ),
    heap: trees(
      ['p2'],
      ['q2'],
      { nullCall: { parentId: 'p2', side: 'left', text: 'null→true' } },
      { nullCall: { parentId: 'q2', side: 'left', text: 'null→true' } },
    ),
  },
  {
    id: 4,
    narrative: 'Right children of the 2-nodes are also null → true. Leaf pair returns true.',
    why: 'Conjunction of left and right null-matches.',
    codeFocus: L.recurse,
    callStack: frames(
      { name: 'isSameTree', locals: { p: 'p1', q: 'q1' } },
      {
        name: 'isSameTree',
        active: true,
        locals: { p: 'p2', q: 'q2', result: true },
      },
    ),
    heap: trees(
      ['p2'],
      ['q2'],
      { marks: { p2: '✓' }, formula: { nodeId: 'p2', text: 'left∧right' } },
      { marks: { q2: '✓' } },
    ),
  },
  {
    id: 5,
    narrative: 'Recurse right of roots: isSameTree(p3, q3).',
    why: 'Still need the right subtrees to agree.',
    codeFocus: L.recurse,
    callStack: frames(
      { name: 'isSameTree', locals: { p: 'p1', q: 'q1' } },
      { name: 'isSameTree', active: true, locals: { p: 'p3', q: 'q3' } },
    ),
    heap: trees(
      ['p3'],
      ['q3'],
      { marks: { p2: '✓' } },
      { marks: { q2: '✓' } },
    ),
  },
  {
    id: 6,
    narrative: 'Nodes 3 and 3 match; both sides null → true.',
    why: 'Same leaf pattern as on the left.',
    codeFocus: L.recurse,
    callStack: frames(
      { name: 'isSameTree', locals: { p: 'p1', q: 'q1' } },
      {
        name: 'isSameTree',
        active: true,
        locals: { p: 'p3', q: 'q3', result: true },
      },
    ),
    heap: trees(
      ['p3'],
      ['q3'],
      { marks: { p2: '✓', p3: '✓' }, formula: { nodeId: 'p3', text: '3 == 3' } },
      { marks: { q2: '✓', q3: '✓' } },
    ),
  },
  {
    id: 7,
    narrative: 'Root combines left∧right → true. Trees are identical.',
    why: 'Same values and same shape at every corresponding node.',
    codeFocus: L.recurse,
    callStack: frames({
      name: 'isSameTree',
      active: true,
      locals: { p: 'p1', q: 'q1', result: true },
    }),
    heap: trees(
      ['p1', 'p2', 'p3'],
      ['q1', 'q2', 'q3'],
      {
        marks: { p1: '✓', p2: '✓', p3: '✓' },
        formula: { nodeId: 'p1', text: 'true ∧ true' },
      },
      { marks: { q1: '✓', q2: '✓', q3: '✓' } },
    ),
  },
]

export const sameTree: ProblemPack = {
  id: '0100-same-tree',
  lcNumber: 100,
  title: 'Same Tree',
  pattern: 'Tree DFS',
  difficulty: 'Easy',
  insight: 'Handle null mismatch first; then values; then left AND right.',
  invariant: 'Return whether subtrees rooted at p and q are identical.',
  complexity: { time: 'O(n)', space: 'O(h)' },
  inputLabel: 'p = [1,2,3], q = [1,2,3]',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark(
    'Two heap trees walked in lockstep; stack frames mirror recursion.',
  ),
  walkthrough: {
    statement:
      'Given the roots of two binary trees p and q, write a function to check whether they are the same — same structure and same node values.',
    keyIdea:
      'DFS both trees together: null mismatch → false; value mismatch → false; else left AND right.',
    approach: [
      'If either node is null, return whether both are null.',
      'If values differ, return false.',
      'Return isSameTree(left) && isSameTree(right).',
    ],
  },
}
