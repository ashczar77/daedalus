/**
 * LeetCode #100 — Same Tree (simultaneous DFS).
 * Demo: identical trees [1,2,3] vs [1,2,3] → true.
 */
import javaSrc from '../../algorithms/0100-same-tree/Solution.java?raw'
import kotlinSrc from '../../algorithms/0100-same-tree/Solution.kt?raw'
import pythonSrc from '../../algorithms/0100-same-tree/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
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

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Compare roots p=1 and q=1 on two heap trees. Values match — recurse both sides.',
    why: 'Structural mismatch (null vs non-null) must be checked before value compare.',
    codeFocus: { java: 19, kotlin: 10, python: 16 },
    callStack: [
      {
        name: 'isSameTree',
        active: true,
        locals: { p: { ref: 'p' }, q: { ref: 'q' } },
      },
    ],
    heap: [
      {
        id: 'p',
        kind: 'tree',
        label: 'tree p',
        nodes: pTree,
        rootId: 'p1',
        focusIds: ['p1'],
        focused: true,
      },
      {
        id: 'q',
        kind: 'tree',
        label: 'tree q',
        nodes: qTree,
        rootId: 'q1',
        focusIds: ['q1'],
        focused: true,
      },
    ],
  },
  {
    id: 2,
    narrative: 'Left children both 2 — match. Right children both 3 — match.',
    why: 'Conjunction of left AND right subtree equality is required.',
    codeFocus: { java: 19, kotlin: 10, python: 16 },
    callStack: [
      { name: 'isSameTree', locals: { p: 'p1', q: 'q1' } },
      {
        name: 'isSameTree',
        active: true,
        locals: { p: 'p2', q: 'q2', result: true },
      },
    ],
    heap: [
      {
        id: 'p',
        kind: 'tree',
        label: 'tree p',
        nodes: pTree,
        rootId: 'p1',
        focusIds: ['p2'],
        focused: true,
      },
      {
        id: 'q',
        kind: 'tree',
        label: 'tree q',
        nodes: qTree,
        rootId: 'q1',
        focusIds: ['q2'],
        focused: true,
      },
    ],
  },
  {
    id: 3,
    narrative: 'All recursive calls return true — trees are identical.',
    why: 'Same values and same shape at every corresponding node.',
    codeFocus: { java: 19, kotlin: 10, python: 16 },
    callStack: [
      {
        name: 'isSameTree',
        active: true,
        locals: { result: true },
      },
    ],
    heap: [
      {
        id: 'p',
        kind: 'tree',
        label: 'tree p',
        nodes: pTree,
        rootId: 'p1',
        focusIds: ['p1', 'p2', 'p3'],
      },
      {
        id: 'q',
        kind: 'tree',
        label: 'tree q',
        nodes: qTree,
        rootId: 'q1',
        focusIds: ['q1', 'q2', 'q3'],
        focused: true,
      },
    ],
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
  benchmark: placeholderBenchmark('Two heap trees walked in lockstep; stack frames mirror recursion.'),
}
