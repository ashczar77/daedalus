/**
 * LeetCode #704 — Binary Search.
 * Demo input: nums = [-1,0,3,5,9,12], target = 9.
 * Highlights the mid ± 1 window rule that keeps the search O(log n).
 */
import javaSrc from '../../algorithms/0704-binary-search/Solution.java?raw'
import kotlinSrc from '../../algorithms/0704-binary-search/Solution.kt?raw'
import pythonSrc from '../../algorithms/0704-binary-search/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'

const nums = [-1, 0, 3, 5, 9, 12]
const target = 9

/** Shrink the [left, right] window until mid lands on the target. */
const steps: Step[] = [
  {
    id: 1,
    message: 'Initialize the search window to the full array: left = 0, right = 5.',
    codeFocus: { java: 7, kotlin: 7, python: 7 },
    variables: { target, left: 0, right: 5 },
    scene: {
      type: 'array',
      label: 'nums',
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
    },
  },
  {
    id: 2,
    message: 'mid = 0 + (5 − 0) / 2 = 2. nums[2] = 3, which is less than 9 — discard the left half including mid.',
    codeFocus: { java: 14, kotlin: 12, python: 13 },
    variables: { target, left: 0, right: 5, mid: 2, 'nums[mid]': 3 },
    scene: {
      type: 'array',
      label: 'nums',
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
    },
  },
  {
    id: 3,
    message: 'Move left to mid + 1 → left = 3. Window is now [3, 5].',
    codeFocus: { java: 8, kotlin: 8, python: 8 },
    variables: { target, left: 3, right: 5 },
    scene: {
      type: 'array',
      label: 'nums',
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
    },
  },
  {
    id: 4,
    message: 'mid = 3 + (5 − 3) / 2 = 4. nums[4] = 9 — exact match.',
    codeFocus: { java: 10, kotlin: 11, python: 10 },
    variables: { target, left: 3, right: 5, mid: 4, 'nums[mid]': 9 },
    scene: {
      type: 'array',
      label: 'nums',
      values: nums,
      pointers: { left: 3, mid: 4, right: 5 },
      highlights: [
        { index: 3, role: 'window' },
        { index: 4, role: 'found' },
        { index: 5, role: 'window' },
      ],
    },
  },
  {
    id: 5,
    message: 'Return mid = 4. Critical detail: update with mid ± 1, never left++ / right-- (that would be O(n)).',
    codeFocus: { java: 11, kotlin: 11, python: 11 },
    variables: { target, result: 4 },
    scene: {
      type: 'array',
      label: 'nums',
      values: nums,
      pointers: { mid: 4 },
      highlights: [{ index: 4, role: 'found' }],
    },
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
    note: 'Logarithmic growth stays nearly flat across these sizes. Language differences are tiny compared with a mistaken linear scan.',
  },
}
