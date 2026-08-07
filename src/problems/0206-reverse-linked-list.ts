/**
 * LeetCode #206 — Reverse Linked List (iterative pointer flip).
 * Demo: 1 → 2 → 3 becomes 3 → 2 → 1. Captions show each flip.
 */
import javaSrc from '../../algorithms/0206-reverse-linked-list/Solution.java?raw'
import kotlinSrc from '../../algorithms/0206-reverse-linked-list/Solution.kt?raw'
import pythonSrc from '../../algorithms/0206-reverse-linked-list/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Start with prev=null and cur=head on the list 1→2→3.',
    why: 'Everything before cur becomes the reversed prefix; cur is next to flip.',
    codeFocus: { java: 13, kotlin: 9, python: 12 },
    callStack: [
      {
        name: 'reverseList',
        active: true,
        locals: { head: { ref: 'list' }, prev: null, cur: 'n1' },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain',
        nodes: [
          { id: 'n1', value: 1, next: 'n2' },
          { id: 'n2', value: 2, next: 'n3' },
          { id: 'n3', value: 3, next: null },
        ],
        pointers: { cur: 'n1', prev: null },
        focusIds: ['n1'],
        focused: true,
        caption: 'setup: prev=null · cur=head',
      },
    ],
  },
  {
    id: 2,
    narrative: 'Cache next=n2, then flip n1.next → prev (null).',
    why: 'Must save next before overwriting the pointer or the rest is lost.',
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
        caption: 'flip: n1.next → null',
      },
    ],
  },
  {
    id: 3,
    narrative: 'Advance prev=n1, cur=n2. Flip n2.next → n1.',
    why: 'Reversed prefix grows behind prev as cur walks forward.',
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
        caption: 'flip: n2.next → n1',
      },
    ],
  },
  {
    id: 4,
    narrative: 'Flip n3.next → n2, then cur becomes null.',
    why: 'Last node joins the reversed chain.',
    codeFocus: { java: 16, kotlin: 12, python: 15 },
    callStack: [
      {
        name: 'reverseList',
        active: true,
        locals: { prev: 'n2', cur: 'n3', next: null },
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
          { id: 'n3', value: 3, next: 'n2' },
        ],
        pointers: { prev: 'n2', cur: 'n3', next: null },
        focusIds: ['n3'],
        focused: true,
        caption: 'flip: n3.next → n2',
      },
    ],
  },
  {
    id: 5,
    narrative: 'cur is null. Return prev=n3 as the new head.',
    why: 'When cur hits null, prev is the tip of the fully reversed list.',
    codeFocus: { java: 20, kotlin: 16, python: 18 },
    callStack: [
      {
        name: 'reverseList',
        active: true,
        locals: { prev: 'n3', cur: null, result: 'n3' },
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
          { id: 'n3', value: 3, next: 'n2' },
        ],
        pointers: { prev: 'n3', cur: null },
        focusIds: ['n3', 'n2', 'n1'],
        focused: true,
        caption: 'done: return prev (new head)',
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
  benchmark: placeholderBenchmark(
    'In-place pointer rewrites — no extra heap nodes allocated.',
  ),
  walkthrough: {
    statement:
      'Given the head of a singly linked list, reverse the list and return the new head.',
    keyIdea:
      'Iteratively flip cur.next to prev while walking forward — three pointers: prev, cur, next.',
    approach: [
      'prev = null, cur = head.',
      'While cur: save next, set cur.next = prev, advance prev/cur.',
      'Return prev.',
    ],
  },
}
