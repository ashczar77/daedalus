/**
 * LeetCode #141 — Linked List Cycle (Floyd fast/slow).
 * Demo: 1→2→3→4→2 (cycle into n2).
 */
import javaSrc from '../../algorithms/0141-linked-list-cycle/Solution.java?raw'
import kotlinSrc from '../../algorithms/0141-linked-list-cycle/Solution.kt?raw'
import pythonSrc from '../../algorithms/0141-linked-list-cycle/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const nodes = [
  { id: 'n1', value: 1, next: 'n2' },
  { id: 'n2', value: 2, next: 'n3' },
  { id: 'n3', value: 3, next: 'n4' },
  { id: 'n4', value: 4, next: 'n2' },
]

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Place slow and fast at head. Fast will move twice as quickly.',
    why: 'If a cycle exists, fast laps slow inside it; otherwise fast hits null.',
    codeFocus: { java: 13, kotlin: 9, python: 12 },
    callStack: [
      {
        name: 'hasCycle',
        active: true,
        locals: { head: { ref: 'list' }, slow: 'n1', fast: 'n1' },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain (with cycle)',
        nodes,
        pointers: { slow: 'n1', fast: 'n1' },
        cycleTo: ['n4', 'n2'],
        focusIds: ['n1'],
        focused: true,
      },
    ],
  },
  {
    id: 2,
    narrative: 'Advance slow→n2, fast→n3.',
    why: 'Still not meeting — keep walking.',
    codeFocus: { java: 16, kotlin: 12, python: 15 },
    callStack: [
      {
        name: 'hasCycle',
        active: true,
        locals: { slow: 'n2', fast: 'n3' },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain (with cycle)',
        nodes,
        pointers: { slow: 'n2', fast: 'n3' },
        cycleTo: ['n4', 'n2'],
        focusIds: ['n2', 'n3'],
        focused: true,
      },
    ],
  },
  {
    id: 3,
    narrative: 'Next move: slow→n3, fast→n2 (via n4→n2).',
    why: 'Fast has entered the cycle and is closing the gap.',
    codeFocus: { java: 16, kotlin: 12, python: 15 },
    callStack: [
      {
        name: 'hasCycle',
        active: true,
        locals: { slow: 'n3', fast: 'n2' },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain (with cycle)',
        nodes,
        pointers: { slow: 'n3', fast: 'n2' },
        cycleTo: ['n4', 'n2'],
        focusIds: ['n3', 'n2'],
        focused: true,
      },
    ],
  },
  {
    id: 4,
    narrative: 'slow→n4, fast→n4. Pointers meet — return true.',
    why: 'Meeting inside the loop proves a cycle without storing visited nodes.',
    codeFocus: { java: 18, kotlin: 13, python: 17 },
    callStack: [
      {
        name: 'hasCycle',
        active: true,
        locals: { slow: 'n4', fast: 'n4', result: true },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain (with cycle)',
        nodes,
        pointers: { slow: 'n4', fast: 'n4' },
        cycleTo: ['n4', 'n2'],
        focusIds: ['n4'],
        focused: true,
      },
    ],
  },
]

export const linkedListCycle: ProblemPack = {
  id: '0141-linked-list-cycle',
  lcNumber: 141,
  title: 'Linked List Cycle',
  pattern: 'Fast & Slow',
  difficulty: 'Easy',
  insight: 'Move slow 1 and fast 2; a meeting means a cycle. Guard fast and fast.next before advancing.',
  invariant: 'If a cycle exists, fast eventually enters it and laps slow; else fast reaches null.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: 'head = [1,2,3,4] with cycle 4→2',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark('O(1) extra memory vs a HashSet of visited node identities.'),
}
