/**
 * LeetCode #21 — Merge Two Sorted Lists (dummy head splice).
 * Demo: list1=[1,3], list2=[2,4] → [1,2,3,4].
 */
import javaSrc from '../../algorithms/0021-merge-two-sorted-lists/Solution.java?raw'
import kotlinSrc from '../../algorithms/0021-merge-two-sorted-lists/Solution.kt?raw'
import pythonSrc from '../../algorithms/0021-merge-two-sorted-lists/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Allocate a dummy heap node. runner starts there so the first splice needs no special case.',
    why: 'Splicing existing nodes keeps extra space O(1) versus allocating a fresh list.',
    codeFocus: { java: 14, kotlin: 9, python: 12 },
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: {
          list1: { ref: 'list1' },
          list2: { ref: 'list2' },
          dummy: { ref: 'merged' },
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
        caption: 'dummy head · runner starts here',
      },
    ],
  },
  {
    id: 2,
    narrative: '1 ≤ 2 — splice a1 onto runner, advance list1.',
    why: 'Always take the smaller head so the merged prefix stays sorted.',
    codeFocus: { java: 17, kotlin: 14, python: 15 },
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
        caption: 'splice 1 (list1 smaller)',
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
    narrative: '2 ≤ 3 — splice b1 from list2.',
    why: 'Keep comparing heads until one list empties.',
    codeFocus: { java: 17, kotlin: 14, python: 15 },
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
        caption: 'splice 2 (list2 smaller)',
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
    id: 4,
    narrative: 'Finish splicing, attach leftover tail, return dummy.next.',
    why: 'One leftover attach finishes the merge in constant time.',
    codeFocus: { java: 25, kotlin: 22, python: 21 },
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: { result: { ref: 'merged' } },
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
        caption: 'result = dummy.next → [1,2,3,4]',
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
      'While both lists nonempty, attach the smaller head and advance that list.',
      'Attach the nonempty leftover.',
      'Return dummy.next.',
    ],
  },
}
