/**
 * LeetCode #704 — Binary Search.
 * Storytelling pack: locals left/right/mid + heap array window choreography.
 * Demo: nums = [-1,0,3,5,9,12], target = 9.
 */
import javaSrc from '../../algorithms/0704-binary-search/Solution.java?raw'
import kotlinSrc from '../../algorithms/0704-binary-search/Solution.kt?raw'
import pythonSrc from '../../algorithms/0704-binary-search/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'

const nums = [-1, 0, 3, 5, 9, 12]
const target = 9

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Enter search. Locals left=0 and right=5 bound the live search window on the heap array.',
    why: 'Invariant: if the target exists, it is always inside [left, right] inclusive.',
    codeFocus: { java: 7, kotlin: 7, python: 7 },
    callStack: [
      {
        name: 'search',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target,
          left: 0,
          right: 5,
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums',
        values: nums,
        pointers: { left: 0, right: 5 },
        highlights: [
          { index: 0, role: 'window' },
          { index: 1, role: 'window' },
          { index: 2, role: 'window' },
          { index: 3, role: 'window' },
          { index: 4, role: 'window' },
          { index: 5, role: 'window' },
        ],
        focused: true,
      },
    ],
  },
  {
    id: 2,
    narrative: 'Compute mid = 2 on the stack frame. Read nums[2] = 3 from the heap — too small.',
    why: 'Discard mid and the entire left half: nothing there can be ≥ 9.',
    codeFocus: { java: 14, kotlin: 12, python: 13 },
    callStack: [
      {
        name: 'search',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target,
          left: 0,
          right: 5,
          mid: 2,
          'nums[mid]': 3,
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums',
        values: nums,
        pointers: { left: 0, mid: 2, right: 5 },
        highlights: [
          { index: 0, role: 'discard' },
          { index: 1, role: 'discard' },
          { index: 2, role: 'compare' },
          { index: 3, role: 'window' },
          { index: 4, role: 'window' },
          { index: 5, role: 'window' },
        ],
        focused: true,
      },
    ],
  },
  {
    id: 3,
    narrative: 'Update local left = mid + 1 → 3. The heap window shrinks to [3, 5].',
    why: 'Critical: mid ± 1 (not left++). Halving each step keeps O(log n).',
    codeFocus: { java: 8, kotlin: 8, python: 8 },
    callStack: [
      {
        name: 'search',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target,
          left: 3,
          right: 5,
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums',
        values: nums,
        pointers: { left: 3, right: 5 },
        highlights: [
          { index: 0, role: 'discard' },
          { index: 1, role: 'discard' },
          { index: 2, role: 'discard' },
          { index: 3, role: 'window' },
          { index: 4, role: 'window' },
          { index: 5, role: 'window' },
        ],
        focused: true,
      },
    ],
  },
  {
    id: 4,
    narrative: 'mid = 4. Heap read nums[4] = 9 — equals target.',
    why: 'The search window collapsed onto the answer without scanning every index.',
    codeFocus: { java: 10, kotlin: 11, python: 10 },
    callStack: [
      {
        name: 'search',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target,
          left: 3,
          right: 5,
          mid: 4,
          'nums[mid]': 9,
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums',
        values: nums,
        pointers: { left: 3, mid: 4, right: 5 },
        highlights: [
          { index: 3, role: 'window' },
          { index: 4, role: 'found' },
          { index: 5, role: 'window' },
        ],
        focused: true,
      },
    ],
  },
  {
    id: 5,
    narrative: 'Return mid = 4 from the active frame.',
    why: 'Logarithmic comparisons beat a linear scan — locals did the bookkeeping, the heap held the data.',
    codeFocus: { java: 11, kotlin: 11, python: 11 },
    callStack: [
      {
        name: 'search',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target,
          result: 4,
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums',
        values: nums,
        pointers: { mid: 4 },
        highlights: [{ index: 4, role: 'found' }],
        focused: true,
      },
    ],
  },
]

export const binarySearch: ProblemPack = {
  id: '0704-binary-search',
  lcNumber: 704,
  title: 'Binary Search',
  pattern: 'Binary Search',
  difficulty: 'Easy',
  insight:
    'Each step halves the search space. When nums[mid] is too small, set left = mid + 1; when too large, set right = mid − 1.',
  invariant:
    'If the target exists, it is always inside [left, right]; each iteration shrinks that inclusive window.',
  complexity: {
    time: 'O(log n)',
    space: 'O(1)',
    notes: 'Using left++ / right-- instead of mid ± 1 degrades to O(n).',
  },
  inputLabel: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
  languages: {
    java: javaSrc,
    kotlin: kotlinSrc,
    python: pythonSrc,
  },
  steps,
  benchmark: {
    sizes: [1_000, 10_000, 100_000],
    series: [
      {
        language: 'java',
        points: [
          { n: 1_000, ms: 0.002 },
          { n: 10_000, ms: 0.003 },
          { n: 100_000, ms: 0.004 },
        ],
      },
      {
        language: 'kotlin',
        points: [
          { n: 1_000, ms: 0.002 },
          { n: 10_000, ms: 0.003 },
          { n: 100_000, ms: 0.004 },
        ],
      },
      {
        language: 'python',
        points: [
          { n: 1_000, ms: 0.004 },
          { n: 10_000, ms: 0.005 },
          { n: 100_000, ms: 0.006 },
        ],
      },
    ],
    note: 'Logarithmic growth stays nearly flat. Locals are scalars — almost no heap pressure.',
  },
}
