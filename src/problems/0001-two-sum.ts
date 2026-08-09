/**
 * LeetCode #1 - Two Sum (hash map / complement lookup).
 * Steps generated from validated nums + target (Phase 4).
 */
import javaSrc from '../../algorithms/0001-two-sum/Solution.java?raw'
import kotlinSrc from '../../algorithms/0001-two-sum/Solution.kt?raw'
import pythonSrc from '../../algorithms/0001-two-sum/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
  parseIntValue,
} from '../engine/input'
import type { ProblemPack, Step } from '../engine/types'

type TwoSumInput = { nums: number[]; target: number }

const nums = [2, 7, 11, 15]
const target = 9

const L = {
  map: { java: 9, kotlin: 6, python: 6 },
  loop: { java: 11, kotlin: 8, python: 8 },
  hit: { java: 12, kotlin: 10, python: 9 },
  retHit: { java: 13, kotlin: 11, python: 10 },
  put: { java: 15, kotlin: 13, python: 11 },
  retEmpty: { java: 17, kotlin: 15, python: 12 },
} as const

function generateTwoSumSteps({ nums: arr, target: t }: TwoSumInput): Step[] {
  const steps: Step[] = []
  let id = 1
  const seen = new Map<number, number>()

  steps.push({
    id: id++,
    narrative: 'Enter twoSum. Allocate an empty HashMap on the heap and bind it to local `seen`.',
    why: 'The map remembers every value already scanned so complements are O(1) lookups.',
    codeFocus: L.map,
    callStack: [
      {
        name: 'twoSum',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target: t,
          seen: { ref: 'seen' },
          i: null,
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums (argument)',
        values: arr,
        focused: true,
      },
      {
        id: 'seen',
        kind: 'hashmap',
        label: 'Map<Integer,Integer> seen',
        entries: [],
        focused: true,
      },
    ],
  })

  if (arr.length === 0) {
    steps.push({
      id: id++,
      narrative: 'nums is empty. Loop never runs → return [].',
      why: 'No pair exists without elements.',
      codeFocus: L.retEmpty,
      callStack: [
        {
          name: 'twoSum',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            target: t,
            seen: { ref: 'seen' },
            result: { ref: 'result' },
          },
        },
      ],
      heap: [
        { id: 'nums', kind: 'array', label: 'int[] nums', values: arr },
        { id: 'seen', kind: 'hashmap', label: 'Map seen', entries: [] },
        {
          id: 'result',
          kind: 'array',
          label: 'int[] result',
          values: [],
          focused: true,
        },
      ],
    })
    return steps
  }

  for (let i = 0; i < arr.length; i++) {
    const num = arr[i]!
    const complement = t - num
    const hit = seen.get(complement)

    steps.push({
      id: id++,
      narrative: `i = ${i}. Read nums[${i}] = ${num}. Compute complement = ${t} - ${num} = ${complement}.`,
      why:
        hit != null
          ? `Map hit: ${complement} was stored at index ${hit}.`
          : hit === undefined && seen.size === 0
            ? 'Map is empty - store this value and continue.'
            : `${complement} is not in seen yet - we will store ${num} → ${i}.`,
      codeFocus: hit != null ? L.hit : L.loop,
      callStack: [
        {
          name: 'twoSum',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            target: t,
            seen: { ref: 'seen' },
            i,
            num,
            complement,
            ...(hit != null ? { [`seen[${complement}]`]: hit } : {}),
          },
        },
      ],
      heap: [
        {
          id: 'nums',
          kind: 'array',
          label: 'int[] nums',
          values: arr,
          highlights:
            hit != null
              ? [
                  { index: hit, role: 'found' },
                  { index: i, role: 'current' },
                ]
              : [{ index: i, role: 'current' }],
          pointers: { i },
          focused: true,
        },
        {
          id: 'seen',
          kind: 'hashmap',
          label: 'Map seen',
          entries: [...seen.entries()],
          focusKeys: hit != null ? [complement] : [complement],
          focused: true,
        },
      ],
    })

    if (hit != null) {
      steps.push({
        id: id++,
        narrative: `Return new int[]{${hit}, ${i}}. Frame exits with the answer.`,
        why: 'One pass, O(n) time - each element paid for a single hash lookup.',
        codeFocus: L.retHit,
        callStack: [
          {
            name: 'twoSum',
            active: true,
            locals: {
              nums: { ref: 'nums' },
              target: t,
              seen: { ref: 'seen' },
              result: { ref: 'result' },
            },
          },
        ],
        heap: [
          {
            id: 'nums',
            kind: 'array',
            label: 'int[] nums',
            values: arr,
            highlights: [
              { index: hit, role: 'found' },
              { index: i, role: 'found' },
            ],
          },
          {
            id: 'seen',
            kind: 'hashmap',
            label: 'Map seen',
            entries: [...seen.entries()],
          },
          {
            id: 'result',
            kind: 'array',
            label: 'int[] result',
            values: [hit, i],
            highlights: [
              { index: 0, role: 'found' },
              { index: 1, role: 'found' },
            ],
            focused: true,
          },
        ],
      })
      return steps
    }

    seen.set(num, i)
    steps.push({
      id: id++,
      narrative: `Miss on the map. Write heap entry ${num} → ${i} into \`seen\`, then advance.`,
      why: 'Future elements can discover this value as their complement in constant time.',
      codeFocus: L.put,
      callStack: [
        {
          name: 'twoSum',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            target: t,
            seen: { ref: 'seen' },
            i,
            num,
            complement,
          },
        },
      ],
      heap: [
        {
          id: 'nums',
          kind: 'array',
          label: 'int[] nums',
          values: arr,
          highlights: [{ index: i, role: 'visited' }],
          pointers: { i },
        },
        {
          id: 'seen',
          kind: 'hashmap',
          label: 'Map seen',
          entries: [...seen.entries()],
          focusKeys: [num],
          focused: true,
        },
      ],
    })
  }

  steps.push({
    id: id++,
    narrative: 'Scan finished with no complement hit → return [].',
    why: 'Graceful outcome when no pair sums to target (still a valid walkthrough).',
    codeFocus: L.retEmpty,
    callStack: [
      {
        name: 'twoSum',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target: t,
          seen: { ref: 'seen' },
          result: { ref: 'result' },
        },
      },
    ],
    heap: [
      { id: 'nums', kind: 'array', label: 'int[] nums', values: arr },
      {
        id: 'seen',
        kind: 'hashmap',
        label: 'Map seen',
        entries: [...seen.entries()],
      },
      {
        id: 'result',
        kind: 'array',
        label: 'int[] result',
        values: [],
        focused: true,
      },
    ],
  })

  return steps
}

const input = defineInput<TwoSumInput>({
  kind: 'intArrayTarget',
  fields: [
    {
      key: 'nums',
      label: 'nums',
      widget: 'text',
      placeholder: '2, 7, 11, 15',
      hint: 'Up to 16 integers from -99-99',
    },
    {
      key: 'target',
      label: 'target',
      widget: 'text',
      placeholder: '9',
    },
  ],
  defaultRaw: { nums: formatIntList(nums), target: String(target) },
  parse: (raw) => {
    const numsResult = parseIntList(raw.nums ?? '', {
      name: 'nums',
      minLen: 0,
      maxLen: 16,
      minVal: -99,
      maxVal: 99,
    })
    if (!numsResult.ok) return numsResult
    const targetResult = parseIntValue(raw.target ?? '', {
      name: 'target',
      minVal: -999,
      maxVal: 999,
    })
    if (!targetResult.ok) return targetResult
    return { ok: true, value: { nums: numsResult.value, target: targetResult.value } }
  },
  formatLabel: (value) =>
    `nums = [${value.nums.join(', ')}], target = ${value.target}`,
  generateSteps: generateTwoSumSteps,
  fixtures: [
    { name: 'empty', raw: { nums: '', target: '9' } },
    { name: 'no-pair', raw: { nums: '1, 2, 3', target: '100' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(`Two Sum default input invalid: ${defaultParsed.errors.join('; ')}`)
}

export const twoSum: ProblemPack = {
  id: '0001-two-sum',
  lcNumber: 1,
  title: 'Two Sum',
  pattern: 'Hash Map',
  difficulty: 'Easy',
  insight:
    'Single pass - complement lookup is O(1) per element instead of O(n²) nested loops.',
  invariant:
    'Map stores each value seen so far with its index; before inserting nums[i], check if target - nums[i] is already present.',
  complexity: {
    time: 'O(n)',
    space: 'O(n)',
    notes: 'Hash map trades linear extra heap memory for one-pass lookups.',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: {
    java: javaSrc,
    kotlin: kotlinSrc,
    python: pythonSrc,
  },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: {
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
    note: 'Placeholder timings for the hash-map approach. Asymptotics dominate language constants.',
  },
  walkthrough: {
    statement:
      'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
    keyIdea: 'Hash map of seen value→index; at each i look up target-nums[i].',
    approach: [
      'Scan left to right with an empty map.',
      'For each value, if complement is in the map, return both indices.',
      'Otherwise store value→index and continue.',
    ],
  },
}
