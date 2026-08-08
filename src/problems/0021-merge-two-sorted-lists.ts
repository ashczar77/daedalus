/**
 * LeetCode #21 — Merge Two Sorted Lists (dummy head splice).
 * Demo: list1=[1,3], list2=[2,4] → [1,2,3,4].
 * Each branch of the if/else is a separate step with matching codeFocus.
 */
import javaSrc from '../../algorithms/0021-merge-two-sorted-lists/Solution.java?raw'
import kotlinSrc from '../../algorithms/0021-merge-two-sorted-lists/Solution.kt?raw'
import pythonSrc from '../../algorithms/0021-merge-two-sorted-lists/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

/** Line maps kept next to the sources so if/else focus cannot drift silently. */
const L = {
  dummy: { java: 13, kotlin: 8, python: 11 },
  whileHead: { java: 15, kotlin: 12, python: 13 },
  /** if (list1.val <= list2.val) — take from list1 */
  take1: { java: 17, kotlin: 14, python: 15 },
  /** else — take from list2 */
  take2: { java: 20, kotlin: 17, python: 18 },
  advanceRunner: { java: 23, kotlin: 20, python: 20 },
  attachTail: { java: 25, kotlin: 22, python: 21 },
  ret: { java: 26, kotlin: 23, python: 22 },
} as const

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Create dummy and set runner = dummy. Both input lists still intact.',
    why: 'Dummy avoids a special case for the first splice.',
    codeFocus: L.dummy,
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: {
          list1: 'a1',
          list2: 'b1',
          dummy: 'dummy',
          runner: 'dummy',
        },
      },
    ],
    heap: [
      {
        id: 'list1',
        kind: 'linkedList',
        label: 'list1',
        nodes: [
          { id: 'a1', value: 1, next: 'a2' },
          { id: 'a2', value: 3, next: null },
        ],
        pointers: { list1: 'a1' },
        focused: true,
      },
      {
        id: 'list2',
        kind: 'linkedList',
        label: 'list2',
        nodes: [
          { id: 'b1', value: 2, next: 'b2' },
          { id: 'b2', value: 4, next: null },
        ],
        pointers: { list2: 'b1' },
        focused: true,
      },
      {
        id: 'merged',
        kind: 'linkedList',
        label: 'dummy / merged',
        nodes: [{ id: 'dummy', value: 0, next: null }],
        pointers: { runner: 'dummy' },
        caption: 'dummy · runner here',
      },
    ],
  },
  {
    id: 2,
    narrative: 'Both lists nonempty. Compare heads: 1 ≤ 2 → take list1 (if branch).',
    why: 'The if branch runs when list1’s head is smaller or equal.',
    codeFocus: L.take1,
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: { list1: 'a1', list2: 'b1', runner: 'dummy', cmp: '1 <= 2' },
      },
    ],
    heap: [
      {
        id: 'merged',
        kind: 'linkedList',
        label: 'dummy / merged',
        nodes: [
          { id: 'dummy', value: 0, next: 'a1' },
          { id: 'a1', value: 1, next: 'a2' },
        ],
        pointers: { runner: 'dummy' },
        focusIds: ['a1'],
        focused: true,
        caption: 'if: runner.next = list1 (1)',
      },
      {
        id: 'list1',
        kind: 'linkedList',
        label: 'list1',
        nodes: [
          { id: 'a1', value: 1, next: 'a2' },
          { id: 'a2', value: 3, next: null },
        ],
        pointers: { list1: 'a1' },
      },
      {
        id: 'list2',
        kind: 'linkedList',
        label: 'list2',
        nodes: [
          { id: 'b1', value: 2, next: 'b2' },
          { id: 'b2', value: 4, next: null },
        ],
        pointers: { list2: 'b1' },
      },
    ],
  },
  {
    id: 3,
    narrative: 'Advance list1 to 3 and runner to the spliced node 1.',
    why: 'runner always sits at the tail of the merged prefix.',
    codeFocus: L.advanceRunner,
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: { list1: 'a2', list2: 'b1', runner: 'a1' },
      },
    ],
    heap: [
      {
        id: 'merged',
        kind: 'linkedList',
        label: 'dummy / merged',
        nodes: [
          { id: 'dummy', value: 0, next: 'a1' },
          { id: 'a1', value: 1, next: null },
        ],
        pointers: { runner: 'a1' },
        focusIds: ['a1'],
        focused: true,
        caption: 'runner = runner.next',
      },
      {
        id: 'list1',
        kind: 'linkedList',
        label: 'list1 remaining',
        nodes: [{ id: 'a2', value: 3, next: null }],
        pointers: { list1: 'a2' },
      },
      {
        id: 'list2',
        kind: 'linkedList',
        label: 'list2',
        nodes: [
          { id: 'b1', value: 2, next: 'b2' },
          { id: 'b2', value: 4, next: null },
        ],
        pointers: { list2: 'b1' },
      },
    ],
  },
  {
    id: 4,
    narrative: 'Compare again: 3 ≤ 2 is false → else branch takes list2’s 2.',
    why: 'When list2’s head is smaller, the else block runs — not the if.',
    codeFocus: L.take2,
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: { list1: 'a2', list2: 'b1', runner: 'a1', cmp: '3 > 2' },
      },
    ],
    heap: [
      {
        id: 'merged',
        kind: 'linkedList',
        label: 'dummy / merged',
        nodes: [
          { id: 'dummy', value: 0, next: 'a1' },
          { id: 'a1', value: 1, next: 'b1' },
          { id: 'b1', value: 2, next: 'b2' },
        ],
        pointers: { runner: 'a1' },
        focusIds: ['b1'],
        focused: true,
        caption: 'else: runner.next = list2 (2)',
      },
      {
        id: 'list1',
        kind: 'linkedList',
        label: 'list1 remaining',
        nodes: [{ id: 'a2', value: 3, next: null }],
        pointers: { list1: 'a2' },
      },
      {
        id: 'list2',
        kind: 'linkedList',
        label: 'list2',
        nodes: [
          { id: 'b1', value: 2, next: 'b2' },
          { id: 'b2', value: 4, next: null },
        ],
        pointers: { list2: 'b1' },
      },
    ],
  },
  {
    id: 5,
    narrative: 'Advance list2 to 4 and runner onto node 2.',
    why: 'Same runner advance after either branch.',
    codeFocus: L.advanceRunner,
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: { list1: 'a2', list2: 'b2', runner: 'b1' },
      },
    ],
    heap: [
      {
        id: 'merged',
        kind: 'linkedList',
        label: 'dummy / merged',
        nodes: [
          { id: 'dummy', value: 0, next: 'a1' },
          { id: 'a1', value: 1, next: 'b1' },
          { id: 'b1', value: 2, next: null },
        ],
        pointers: { runner: 'b1' },
        focusIds: ['b1'],
        focused: true,
        caption: 'runner = runner.next',
      },
      {
        id: 'list1',
        kind: 'linkedList',
        label: 'list1 remaining',
        nodes: [{ id: 'a2', value: 3, next: null }],
        pointers: { list1: 'a2' },
      },
      {
        id: 'list2',
        kind: 'linkedList',
        label: 'list2 remaining',
        nodes: [{ id: 'b2', value: 4, next: null }],
        pointers: { list2: 'b2' },
      },
    ],
  },
  {
    id: 6,
    narrative: 'Compare 3 ≤ 4 → if branch takes list1’s 3.',
    why: 'Back on the if path when list1 is smaller again.',
    codeFocus: L.take1,
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: { list1: 'a2', list2: 'b2', runner: 'b1', cmp: '3 <= 4' },
      },
    ],
    heap: [
      {
        id: 'merged',
        kind: 'linkedList',
        label: 'dummy / merged',
        nodes: [
          { id: 'dummy', value: 0, next: 'a1' },
          { id: 'a1', value: 1, next: 'b1' },
          { id: 'b1', value: 2, next: 'a2' },
          { id: 'a2', value: 3, next: null },
        ],
        pointers: { runner: 'b1' },
        focusIds: ['a2'],
        focused: true,
        caption: 'if: runner.next = list1 (3)',
      },
      {
        id: 'list1',
        kind: 'linkedList',
        label: 'list1 remaining',
        nodes: [{ id: 'a2', value: 3, next: null }],
        pointers: { list1: 'a2' },
      },
      {
        id: 'list2',
        kind: 'linkedList',
        label: 'list2 remaining',
        nodes: [{ id: 'b2', value: 4, next: null }],
        pointers: { list2: 'b2' },
      },
    ],
  },
  {
    id: 7,
    narrative: 'list1 is now null. Attach leftover list2 (4) and return dummy.next.',
    why: 'When one list empties, the other is already sorted — one pointer assign finishes.',
    codeFocus: L.attachTail,
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: { list1: null, list2: 'b2', runner: 'a2', result: 'a1' },
      },
    ],
    heap: [
      {
        id: 'merged',
        kind: 'linkedList',
        label: 'merged result',
        nodes: [
          { id: 'a1', value: 1, next: 'b1' },
          { id: 'b1', value: 2, next: 'a2' },
          { id: 'a2', value: 3, next: 'b2' },
          { id: 'b2', value: 4, next: null },
        ],
        pointers: { head: 'a1' },
        focusIds: ['a1', 'b1', 'a2', 'b2'],
        focused: true,
        caption: 'attach tail · return dummy.next',
      },
    ],
  },
]

export const mergeTwoSortedLists: ProblemPack = {
  id: '0021-merge-two-sorted-lists',
  lcNumber: 21,
  title: 'Merge Two Sorted Lists',
  pattern: 'Linked List',
  difficulty: 'Easy',
  insight: 'Dummy head + splice existing nodes — avoid new ListNode(val) for each value.',
  invariant: 'Merged portion behind runner is sorted; list1/list2 point at remaining sorted tails.',
  complexity: {
    time: 'O(n + m)',
    space: 'O(1)',
    notes: 'Creating new nodes works but wastes O(n+m) heap allocations.',
  },
  inputLabel: 'list1 = [1,3], list2 = [2,4]',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark(
    'Pointer splicing dominates — language gaps are small at interview sizes.',
  ),
  walkthrough: {
    statement:
      'Merge two sorted linked lists and return the head of the merged sorted list.',
    keyIdea:
      'Dummy head + runner: always splice the smaller current head from list1 or list2.',
    approach: [
      'Create dummy; runner = dummy.',
      'While both lists nonempty: if list1.val <= list2.val take list1, else take list2.',
      'Attach the nonempty leftover.',
      'Return dummy.next.',
    ],
  },
}
