/**
 * LeetCode #167 — Two Sum II (sorted array, opposite-end two pointers).
 * Steps generated from validated numbers + target (Phase 4).
 */
import javaSrc from '../../algorithms/0167-two-sum-ii/Solution.java?raw'
import kotlinSrc from '../../algorithms/0167-two-sum-ii/Solution.kt?raw'
import pythonSrc from '../../algorithms/0167-two-sum-ii/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
  parseIntValue,
} from '../engine/input'
import type { ArrayHighlight, ProblemPack, Step } from '../engine/types'

type Input = { numbers: number[]; target: number }

const numbers = [2, 7, 11, 15]
const target = 9

const L = {
  init: { java: 7, kotlin: 7, python: 7 },
  eq: { java: 11, kotlin: 11, python: 11 },
  left: { java: 14, kotlin: 12, python: 13 },
  right: { java: 16, kotlin: 13, python: 15 },
  miss: { java: 19, kotlin: 16, python: 16 },
} as const

function windowHighlights(
  n: number,
  left: number,
  right: number,
  roles: { left: ArrayHighlight['role']; right: ArrayHighlight['role'] },
): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let i = 0; i < n; i++) {
    if (i < left || i > right) out.push({ index: i, role: 'discard' })
  }
  out.push({ index: left, role: roles.left })
  if (right !== left) out.push({ index: right, role: roles.right })
  return out
}

function generateSteps({ numbers: arr, target: t }: Input): Step[] {
  const steps: Step[] = []
  let id = 1

  if (arr.length < 2) {
    return [
      {
        id: 1,
        narrative: 'Need at least two numbers. Return [].',
        why: 'No pair exists.',
        codeFocus: L.miss,
        callStack: [
          {
            name: 'twoSum',
            active: true,
            locals: { numbers: { ref: 'numbers' }, target: t, result: [] },
          },
        ],
        heap: [
          {
            id: 'numbers',
            kind: 'array',
            label: 'numbers',
            values: arr,
            focused: true,
          },
        ],
      },
    ]
  }

  let left = 0
  let right = arr.length - 1

  steps.push({
    id: id++,
    narrative: `Array is sorted. Place left=${left} and right=${right}.`,
    why: 'Invariant: if a pair exists, it lies between left and right.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'twoSum',
        active: true,
        locals: { numbers: { ref: 'numbers' }, target: t, left, right },
      },
    ],
    heap: [
      {
        id: 'numbers',
        kind: 'array',
        label: 'numbers',
        values: arr,
        pointers: { left, right },
        highlights: windowHighlights(arr.length, left, right, {
          left: 'current',
          right: 'current',
        }),
        focused: true,
      },
    ],
  })

  while (left < right) {
    const sum = arr[left]! + arr[right]!
    if (sum === t) {
      steps.push({
        id: id++,
        narrative: `sum = ${arr[left]} + ${arr[right]} = ${sum} — exact match.`,
        why: 'Return 1-indexed positions.',
        codeFocus: L.eq,
        callStack: [
          {
            name: 'twoSum',
            active: true,
            locals: {
              numbers: { ref: 'numbers' },
              target: t,
              left,
              right,
              sum,
              result: [left + 1, right + 1],
            },
          },
        ],
        heap: [
          {
            id: 'numbers',
            kind: 'array',
            label: 'numbers',
            values: arr,
            pointers: { left, right },
            highlights: windowHighlights(arr.length, left, right, {
              left: 'found',
              right: 'found',
            }),
            focused: true,
          },
        ],
      })
      return steps
    }

    const moveLeft = sum < t
    steps.push({
      id: id++,
      narrative: `sum = ${arr[left]} + ${arr[right]} = ${sum} ${
        moveLeft ? `< ${t} — left++` : `> ${t} — right--`
      }.`,
      why: moveLeft
        ? 'Need a larger sum; advance the left pointer.'
        : 'Need a smaller sum; pull the right pointer inward.',
      codeFocus: moveLeft ? L.left : L.right,
      callStack: [
        {
          name: 'twoSum',
          active: true,
          locals: { numbers: { ref: 'numbers' }, target: t, left, right, sum },
        },
      ],
      heap: [
        {
          id: 'numbers',
          kind: 'array',
          label: 'numbers',
          values: arr,
          pointers: { left, right },
          highlights: windowHighlights(arr.length, left, right, {
            left: 'compare',
            right: 'compare',
          }),
          focused: true,
        },
      ],
    })

    if (moveLeft) left += 1
    else right -= 1
  }

  steps.push({
    id: id++,
    narrative: 'Pointers met with no match → return [].',
    why: 'Graceful miss when no pair sums to target.',
    codeFocus: L.miss,
    callStack: [
      {
        name: 'twoSum',
        active: true,
        locals: { numbers: { ref: 'numbers' }, target: t, result: [] },
      },
    ],
    heap: [
      {
        id: 'numbers',
        kind: 'array',
        label: 'numbers',
        values: arr,
        focused: true,
      },
    ],
  })

  return steps
}

const input = defineInput<Input>({
  kind: 'sortedIntArrayTarget',
  fields: [
    {
      key: 'numbers',
      label: 'numbers',
      widget: 'text',
      placeholder: '2, 7, 11, 15',
      hint: 'Must be sorted non-decreasing',
      sortable: true,
    },
    { key: 'target', label: 'target', widget: 'text', placeholder: '9' },
  ],
  defaultRaw: { numbers: formatIntList(numbers), target: String(target) },
  parse: (raw) => {
    const numsResult = parseIntList(raw.numbers ?? '', {
      name: 'numbers',
      minLen: 0,
      maxLen: 16,
      minVal: -99,
      maxVal: 99,
      requireSorted: true,
    })
    if (!numsResult.ok) return numsResult
    const targetResult = parseIntValue(raw.target ?? '', {
      name: 'target',
      minVal: -999,
      maxVal: 999,
    })
    if (!targetResult.ok) return targetResult
    return {
      ok: true,
      value: { numbers: numsResult.value, target: targetResult.value },
    }
  },
  formatLabel: (value) =>
    `numbers = [${value.numbers.join(', ')}], target = ${value.target}`,
  generateSteps,
  fixtures: [
    { name: 'no-pair', raw: { numbers: '1, 2, 3', target: '100' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

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
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: {
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
    note: 'O(1) extra memory vs Two Sum’s hash map.',
  },
  walkthrough: {
    statement:
      'Numbers are sorted. Return 1-indexed indices of two numbers that add to target.',
    keyIdea: 'Two pointers: move the side that fixes the sum toward target.',
    approach: [
      'left at start, right at end.',
      'If sum too small, left++; too big, right--; equal → return.',
    ],
  },
}
