import javaSrc from '../../algorithms/0001-two-sum/Solution.java?raw'
import kotlinSrc from '../../algorithms/0001-two-sum/Solution.kt?raw'
import pythonSrc from '../../algorithms/0001-two-sum/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'

const nums = [2, 7, 11, 15]
const target = 9

const steps: Step[] = [
  {
    id: 1,
    message: 'Start with an empty map. We will store each value we have seen with its index.',
    codeFocus: { java: 6, kotlin: 3, python: 3 },
    variables: { target, i: null, complement: null },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'nums',
          values: nums,
        },
        {
          type: 'hashmap',
          label: 'seen',
          entries: [],
        },
      ],
    },
  },
  {
    id: 2,
    message: 'i = 0, nums[0] = 2. Complement is 9 − 2 = 7. 7 is not in the map yet.',
    codeFocus: { java: 8, kotlin: 5, python: 5 },
    variables: { target, i: 0, num: 2, complement: 7 },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'nums',
          values: nums,
          highlights: [{ index: 0, role: 'current' }],
          pointers: { i: 0 },
        },
        {
          type: 'hashmap',
          label: 'seen',
          entries: [],
          focusKeys: [7],
        },
      ],
    },
  },
  {
    id: 3,
    message: 'Store 2 → 0 in the map and continue.',
    codeFocus: { java: 12, kotlin: 10, python: 8 },
    variables: { target, i: 0, num: 2, complement: 7 },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'nums',
          values: nums,
          highlights: [{ index: 0, role: 'visited' }],
          pointers: { i: 0 },
        },
        {
          type: 'hashmap',
          label: 'seen',
          entries: [[2, 0]],
          focusKeys: [2],
        },
      ],
    },
  },
  {
    id: 4,
    message: 'i = 1, nums[1] = 7. Complement is 9 − 7 = 2. 2 is already in the map at index 0.',
    codeFocus: { java: 9, kotlin: 7, python: 6 },
    variables: { target, i: 1, num: 7, complement: 2, 'seen[2]': 0 },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'nums',
          values: nums,
          highlights: [
            { index: 0, role: 'found' },
            { index: 1, role: 'current' },
          ],
          pointers: { i: 1 },
        },
        {
          type: 'hashmap',
          label: 'seen',
          entries: [[2, 0]],
          focusKeys: [2],
        },
      ],
    },
  },
  {
    id: 5,
    message: 'Return [0, 1] — the indices of values that sum to the target.',
    codeFocus: { java: 10, kotlin: 8, python: 7 },
    variables: { target, result: [0, 1] },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'nums',
          values: nums,
          highlights: [
            { index: 0, role: 'found' },
            { index: 1, role: 'found' },
          ],
        },
        {
          type: 'hashmap',
          label: 'seen',
          entries: [[2, 0]],
          focusKeys: [2],
        },
      ],
    },
  },
]

export const twoSum: ProblemPack = {
  id: '0001-two-sum',
  lcNumber: 1,
  title: 'Two Sum',
  pattern: 'Hash Map',
  difficulty: 'Easy',
  insight:
    'Single pass — complement lookup is O(1) per element instead of O(n²) nested loops.',
  invariant:
    'Map stores each value seen so far with its index; before inserting nums[i], check if target − nums[i] is already present.',
  complexity: {
    time: 'O(n)',
    space: 'O(n)',
    notes: 'Hash map trades linear extra memory for one-pass lookups.',
  },
  inputLabel: 'nums = [2, 7, 11, 15], target = 9',
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
          { n: 1_000, ms: 0.08 },
          { n: 10_000, ms: 0.42 },
          { n: 100_000, ms: 4.1 },
        ],
      },
      {
        language: 'kotlin',
        points: [
          { n: 1_000, ms: 0.09 },
          { n: 10_000, ms: 0.48 },
          { n: 100_000, ms: 4.6 },
        ],
      },
      {
        language: 'python',
        points: [
          { n: 1_000, ms: 0.18 },
          { n: 10_000, ms: 1.7 },
          { n: 100_000, ms: 18.5 },
        ],
      },
    ],
    note: 'Precomputed local timings for the hash-map approach. Python pays interpreter overhead; JVM languages share similar asymptotic behavior after warmup.',
  },
}
