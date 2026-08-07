import javaSrc from '../../algorithms/0167-two-sum-ii/Solution.java?raw'
import kotlinSrc from '../../algorithms/0167-two-sum-ii/Solution.kt?raw'
import pythonSrc from '../../algorithms/0167-two-sum-ii/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'

const numbers = [2, 7, 11, 15]
const target = 9

const steps: Step[] = [
  {
    id: 1,
    message: 'Array is sorted. Place left at the start and right at the end.',
    codeFocus: { java: 4, kotlin: 4, python: 4 },
    variables: { target, left: 0, right: 3 },
    scene: {
      type: 'array',
      label: 'numbers',
      values: numbers,
      pointers: { left: 0, right: 3 },
      highlights: [
        { index: 0, role: 'current' },
        { index: 3, role: 'current' },
      ],
    },
  },
  {
    id: 2,
    message: 'sum = 2 + 15 = 17, which is greater than 9 — move right leftward.',
    codeFocus: { java: 13, kotlin: 10, python: 12 },
    variables: { target, left: 0, right: 3, sum: 17 },
    scene: {
      type: 'array',
      label: 'numbers',
      values: numbers,
      pointers: { left: 0, right: 3 },
      highlights: [
        { index: 0, role: 'compare' },
        { index: 3, role: 'compare' },
      ],
    },
  },
  {
    id: 3,
    message: 'right = 2. sum = 2 + 11 = 13, still too large — move right again.',
    codeFocus: { java: 13, kotlin: 10, python: 12 },
    variables: { target, left: 0, right: 2, sum: 13 },
    scene: {
      type: 'array',
      label: 'numbers',
      values: numbers,
      pointers: { left: 0, right: 2 },
      highlights: [
        { index: 0, role: 'compare' },
        { index: 2, role: 'compare' },
        { index: 3, role: 'discard' },
      ],
    },
  },
  {
    id: 4,
    message: 'right = 1. sum = 2 + 7 = 9 — exact match.',
    codeFocus: { java: 7, kotlin: 8, python: 7 },
    variables: { target, left: 0, right: 1, sum: 9 },
    scene: {
      type: 'array',
      label: 'numbers',
      values: numbers,
      pointers: { left: 0, right: 1 },
      highlights: [
        { index: 0, role: 'found' },
        { index: 1, role: 'found' },
      ],
    },
  },
  {
    id: 5,
    message: 'Return 1-indexed positions [1, 2]. Sorted order removes the need for a hash map.',
    codeFocus: { java: 8, kotlin: 8, python: 8 },
    variables: { target, result: [1, 2] },
    scene: {
      type: 'array',
      label: 'numbers',
      values: numbers,
      pointers: { left: 0, right: 1 },
      highlights: [
        { index: 0, role: 'found' },
        { index: 1, role: 'found' },
      ],
    },
  },
]

export const twoSumII: ProblemPack = {
  id: '0167-two-sum-ii',
  lcNumber: 167,
  title: 'Two Sum II — Input Array Is Sorted',
  pattern: 'Two Pointers',
  difficulty: 'Medium',
  insight:
    'Sorted order lets opposite-end pointers eliminate impossible pairs in O(1) space — no hash map required.',
  invariant:
    'If a pair exists, it lies between left and right. Too-small sums move left up; too-large sums move right down.',
  complexity: {
    time: 'O(n)',
    space: 'O(1)',
  },
  inputLabel: 'numbers = [2, 7, 11, 15], target = 9',
  languages: {
    java: javaSrc,
    kotlin: kotlinSrc,
    python: pythonSrc,
  },
  steps,
  perf: {
    sizes: [1_000, 10_000, 100_000],
    series: [
      {
        language: 'java',
        points: [
          { n: 1_000, ms: 0.03 },
          { n: 10_000, ms: 0.12 },
          { n: 100_000, ms: 0.9 },
        ],
      },
      {
        language: 'kotlin',
        points: [
          { n: 1_000, ms: 0.03 },
          { n: 10_000, ms: 0.14 },
          { n: 100_000, ms: 1.0 },
        ],
      },
      {
        language: 'python',
        points: [
          { n: 1_000, ms: 0.08 },
          { n: 10_000, ms: 0.55 },
          { n: 100_000, ms: 5.4 },
        ],
      },
    ],
    note: 'O(1) extra memory vs Two Sum’s hash map. Absolute times still favor the JVM, but the algorithmic win is the constant space.',
  },
}
