/**
 * LeetCode #217 — Contains Duplicate.
 * Steps generated from validated nums (Phase 4).
 */
import javaSrc from '../../algorithms/0217-contains-duplicate/Solution.java?raw'
import kotlinSrc from '../../algorithms/0217-contains-duplicate/Solution.kt?raw'
import pythonSrc from '../../algorithms/0217-contains-duplicate/solution.py?raw'
import { defineInput, formatIntList, parseIntList } from '../engine/input'
import type { ArrayHighlight, ProblemPack, Step } from '../engine/types'

const nums = [1, 2, 3, 1]

const L = {
  set: { java: 9, kotlin: 6, python: 6 },
  add: { java: 11, kotlin: 8, python: 10 },
  hit: { java: 12, kotlin: 9, python: 9 },
  retFalse: { java: 15, kotlin: 12, python: 12 },
} as const

function generateSteps(arr: number[]): Step[] {
  const steps: Step[] = []
  let id = 1
  const seen = new Set<number>()

  steps.push({
    id: id++,
    narrative: 'Create an empty set. We only need presence, not counts or indices.',
    why: 'HashSet membership is the right tool for “seen before?”.',
    codeFocus: L.set,
    callStack: [
      {
        name: 'containsDuplicate',
        active: true,
        locals: { nums: { ref: 'nums' }, seen: { ref: 'seen' } },
      },
    ],
    heap: [
      { id: 'nums', kind: 'array', label: 'nums', values: arr, focused: true },
      {
        id: 'seen',
        kind: 'hashmap',
        label: 'seen (set)',
        entries: [],
        focused: true,
      },
    ],
  })

  for (let i = 0; i < arr.length; i++) {
    const num = arr[i]!
    const isDup = seen.has(num)
    const highlights: ArrayHighlight[] = []
    for (let j = 0; j < i; j++) highlights.push({ index: j, role: 'visited' })
    highlights.push({ index: i, role: isDup ? 'found' : 'current' })
    if (isDup) {
      const first = arr.indexOf(num)
      if (first !== i) highlights[first] = { index: first, role: 'found' }
    }

    if (isDup) {
      steps.push({
        id: id++,
        narrative: `Read ${num} again. Set already contains it — duplicate found → true.`,
        why: 'add would return false / membership hit means a prior occurrence.',
        codeFocus: L.hit,
        callStack: [
          {
            name: 'containsDuplicate',
            active: true,
            locals: {
              nums: { ref: 'nums' },
              seen: { ref: 'seen' },
              num,
              result: true,
            },
          },
        ],
        heap: [
          {
            id: 'nums',
            kind: 'array',
            label: 'nums',
            values: arr,
            pointers: { i },
            highlights,
            focused: true,
          },
          {
            id: 'seen',
            kind: 'hashmap',
            label: 'seen (set)',
            entries: [...seen].map((v) => [v, '✓'] as [number, string]),
            focusKeys: [num],
            focused: true,
          },
        ],
      })
      return steps
    }

    seen.add(num)
    steps.push({
      id: id++,
      narrative: `Read ${num}. Not in the set — add it.`,
      why: 'Unique so far; remember it for later comparisons.',
      codeFocus: L.add,
      callStack: [
        {
          name: 'containsDuplicate',
          active: true,
          locals: { nums: { ref: 'nums' }, seen: { ref: 'seen' }, num },
        },
      ],
      heap: [
        {
          id: 'nums',
          kind: 'array',
          label: 'nums',
          values: arr,
          pointers: { i },
          highlights,
          focused: true,
        },
        {
          id: 'seen',
          kind: 'hashmap',
          label: 'seen (set)',
          entries: [...seen].map((v) => [v, '✓'] as [number, string]),
          focusKeys: [num],
          focused: true,
        },
      ],
    })
  }

  steps.push({
    id: id++,
    narrative: 'Loop finished with no membership hit → return false.',
    why: 'Every value was unique.',
    codeFocus: L.retFalse,
    callStack: [
      {
        name: 'containsDuplicate',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          seen: { ref: 'seen' },
          result: false,
        },
      },
    ],
    heap: [
      { id: 'nums', kind: 'array', label: 'nums', values: arr },
      {
        id: 'seen',
        kind: 'hashmap',
        label: 'seen (set)',
        entries: [...seen].map((v) => [v, '✓'] as [number, string]),
      },
    ],
  })

  return steps
}

const input = defineInput<number[]>({
  kind: 'intArray',
  fields: [
    {
      key: 'nums',
      label: 'nums',
      widget: 'text',
      placeholder: '1, 2, 3, 1',
      hint: 'Up to 16 integers from -99–99',
    },
  ],
  defaultRaw: { nums: formatIntList(nums) },
  parse: (raw) =>
    parseIntList(raw.nums ?? '', {
      name: 'nums',
      minLen: 0,
      maxLen: 16,
      minVal: -99,
      maxVal: 99,
    }),
  formatLabel: (value) => `nums = [${value.join(', ')}]`,
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { nums: '' } },
    { name: 'unique', raw: { nums: '1, 2, 3' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const containsDuplicate: ProblemPack = {
  id: '0217-contains-duplicate',
  lcNumber: 217,
  title: 'Contains Duplicate',
  pattern: 'Hash Set',
  difficulty: 'Easy',
  insight: 'Only presence matters — HashSet is the right tool, not a map of counts.',
  invariant:
    'The set holds every value seen so far; a duplicate is found if the current value is already present before insert.',
  complexity: { time: 'O(n)', space: 'O(n)' },
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
          { n: 1_000, ms: 0.06 },
          { n: 10_000, ms: 0.35 },
          { n: 100_000, ms: 3.4 },
        ],
      },
      {
        language: 'kotlin',
        points: [
          { n: 1_000, ms: 0.07 },
          { n: 10_000, ms: 0.39 },
          { n: 100_000, ms: 3.8 },
        ],
      },
      {
        language: 'python',
        points: [
          { n: 1_000, ms: 0.12 },
          { n: 10_000, ms: 1.1 },
          { n: 100_000, ms: 12.2 },
        ],
      },
    ],
    note: 'Set membership is amortized O(1); Python stays slower in absolute time.',
  },
  walkthrough: {
    statement: 'Return true if any value appears at least twice; otherwise false.',
    keyIdea: 'A hash set remembers values already seen — duplicate means membership hit.',
    approach: [
      'Create an empty set.',
      'For each number, if already in the set return true; else insert.',
      'If the loop finishes, return false.',
    ],
  },
}
