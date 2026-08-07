/**
 * LeetCode #206 — Reverse Linked List (iterative pointer flip).
 * Demo: 1 → 2 → 3 becomes 3 → 2 → 1.
 */
import javaSrc from '../../algorithms/0206-reverse-linked-list/Solution.java?raw'
import kotlinSrc from '../../algorithms/0206-reverse-linked-list/Solution.kt?raw'
import pythonSrc from '../../algorithms/0206-reverse-linked-list/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const n1 = { id: 'n1', value: 1, next: 'n2' as string | null }
const n2 = { id: 'n2', value: 2, next: 'n3' as string | null }
const n3 = { id: 'n3', value: 3, next: null as string | null }

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Start with prev=null and cur=head on the heap list 1→2→3.',
    why: 'Everything before cur will become the reversed prefix; cur is the next node to flip.',
    codeFocus: { java: 13, kotlin: 9, python: 12 },
    callStack: [
      {
        name: 'reverseList',
        active: true,
        locals: { head: { ref: 'list' }, prev: null, cur: { ref: 'list' } },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain',
        nodes: [n1, n2, n3],
        pointers: { cur: 'n1', prev: null },
        focusIds: ['n1'],
        focused: true,
      },
    ],
  },
  {
    id: 2,
    narrative: 'Save next=n2, then rewire n1.next → prev (null). Flip complete for n1.',
    why: 'Must cache next before overwriting the pointer or we lose the rest of the list.',
    codeFocus: { java: 16, kotlin: 12, python: 15 },
    callStack: [
      {
        name: 'reverseList',
        active: true,
        locals: { prev: null, cur: 'n1', next: 'n2' },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain',
        nodes: [
          { id: 'n1', value: 1, next: null },
          { id: 'n2', value: 2, next: 'n3' },
          { id: 'n3', value: 3, next: null },
        ],
        pointers: { prev: null, cur: 'n1', next: 'n2' },
        focusIds: ['n1'],
        focused: true,
      },
    ],
  },
  {
    id: 3,
    narrative: 'Advance: prev=n1, cur=n2. Repeat the flip for node 2.',
    why: 'The reversed prefix grows behind prev as cur walks forward.',
    codeFocus: { java: 16, kotlin: 12, python: 15 },
    callStack: [
      {
        name: 'reverseList',
        active: true,
        locals: { prev: 'n1', cur: 'n2', next: 'n3' },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain',
        nodes: [
          { id: 'n1', value: 1, next: null },
          { id: 'n2', value: 2, next: 'n1' },
          { id: 'n3', value: 3, next: null },
        ],
        pointers: { prev: 'n1', cur: 'n2', next: 'n3' },
        focusIds: ['n2'],
        focused: true,
      },
    ],
  },
  {
    id: 4,
    narrative: 'Flip n3 → n2, then cur becomes null. Return prev=n3 as the new head.',
    why: 'When cur hits null, prev is the tip of the fully reversed list.',
    codeFocus: { java: 20, kotlin: 16, python: 18 },
    callStack: [
      {
        name: 'reverseList',
        active: true,
        locals: { prev: 'n3', cur: null, result: { ref: 'list' } },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain',
        nodes: [
          { id: 'n3', value: 3, next: 'n2' },
          { id: 'n2', value: 2, next: 'n1' },
          { id: 'n1', value: 1, next: null },
        ],
        pointers: { prev: 'n3', cur: null },
        focusIds: ['n3', 'n2', 'n1'],
        focused: true,
      },
    ],
  },
]

export const reverseLinkedList: ProblemPack = {
  id: '0206-reverse-linked-list',
  lcNumber: 206,
  title: 'Reverse Linked List',
  pattern: 'Linked List',
  difficulty: 'Easy',
  insight: 'Save next before overwriting cur.next; return prev as the new head.',
  invariant: 'Nodes before cur are reversed and linked from prev; cur is the next flip target.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: 'head = [1,2,3]',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark('In-place pointer rewrites — no extra heap nodes allocated.'),
}
