/**
 * LeetCode #704 - Binary Search.
 * Steps generated from validated sorted nums + target (Phase 4).
 */
import javaSrc from '../../algorithms/0704-binary-search/Solution.java?raw'
import kotlinSrc from '../../algorithms/0704-binary-search/Solution.kt?raw'
import pythonSrc from '../../algorithms/0704-binary-search/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
  parseIntValue,
} from '../engine/input'
import type { ArrayHighlight, ProblemPack, Step } from '../engine/types'

type Input = { nums: number[]; target: number }

const nums = [-1, 0, 3, 5, 9, 12]
const target = 9

const L = {
  init: { java: 7, kotlin: 7, python: 7 },
  while: { java: 8, kotlin: 8, python: 8 },
  mid: { java: 9, kotlin: 9, python: 9 },
  found: { java: 11, kotlin: 11, python: 11 },
  leftInc: { java: 14, kotlin: 12, python: 13 },
  rightDec: { java: 16, kotlin: 13, python: 15 },
  retMiss: { java: 19, kotlin: 16, python: 16 },
} as const

function windowHighlights(
  n: number,
  left: number,
  right: number,
  mid?: number,
  midRole?: 'compare' | 'found',
): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let i = 0; i < n; i++) {
    if (i < left || i > right) out.push({ index: i, role: 'discard' })
    else if (mid !== undefined && i === mid)
      out.push({ index: i, role: midRole ?? 'compare' })
    else out.push({ index: i, role: 'window' })
  }
  return out
}

function heapArray(
  arr: number[],
  opts: {
    left?: number
    mid?: number
    right?: number
    highlights?: ArrayHighlight[]
    focused?: boolean
  } = {},
) {
  return {
    id: 'nums',
    kind: 'array' as const,
    label: 'int[] nums',
    values: arr,
    ...(opts.left !== undefined ||
    opts.mid !== undefined ||
    opts.right !== undefined
      ? {
          pointers: {
            ...(opts.left !== undefined ? { left: opts.left } : {}),
            ...(opts.mid !== undefined ? { mid: opts.mid } : {}),
            ...(opts.right !== undefined ? { right: opts.right } : {}),
          },
        }
      : {}),
    ...(opts.highlights ? { highlights: opts.highlights } : {}),
    focused: opts.focused ?? true,
  }
}

function generateSteps({ nums: arr, target: t }: Input): Step[] {
  const steps: Step[] = []
  let id = 1

  let left = 0
  let right = arr.length - 1

  steps.push({
    id: id++,
    narrative:
      arr.length === 0
        ? 'Enter search. left=0, right=-1 on an empty array.'
        : `Enter search. Locals left=${left} and right=${right} bound the live search window on the heap array.`,
    why: 'Invariant: if the target exists, it is always inside [left, right] inclusive.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'search',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target: t,
          left,
          right,
        },
      },
    ],
    heap: [
      heapArray(arr, {
        left,
        right,
        highlights:
          arr.length === 0
            ? []
            : windowHighlights(arr.length, left, right),
      }),
    ],
  })

  if (arr.length === 0) {
    steps.push({
      id: id++,
      narrative: 'left > right immediately. Loop never runs → return -1.',
      why: 'Empty input has no index to return.',
      codeFocus: L.retMiss,
      callStack: [
        {
          name: 'search',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            target: t,
            left,
            right,
            result: -1,
          },
        },
      ],
      heap: [heapArray(arr)],
    })
    return steps
  }

  while (left <= right) {
    steps.push({
      id: id++,
      narrative: `While left (${left}) ≤ right (${right}) - enter loop body.`,
      why: 'Stop when the inclusive window is empty.',
      codeFocus: L.while,
      callStack: [
        {
          name: 'search',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            target: t,
            left,
            right,
          },
        },
      ],
      heap: [
        heapArray(arr, {
          left,
          right,
          highlights: windowHighlights(arr.length, left, right),
        }),
      ],
    })

    const mid = left + Math.floor((right - left) / 2)
    const midVal = arr[mid]!

    if (midVal === t) {
      steps.push({
        id: id++,
        narrative: `mid = ${mid}. Heap read nums[${mid}] = ${midVal} - equals target.`,
        why: 'The search window collapsed onto the answer without scanning every index.',
        codeFocus: L.found,
        callStack: [
          {
            name: 'search',
            active: true,
            locals: {
              nums: { ref: 'nums' },
              target: t,
              left,
              right,
              mid,
              'nums[mid]': midVal,
            },
          },
        ],
        heap: [
          heapArray(arr, {
            left,
            mid,
            right,
            highlights: windowHighlights(arr.length, left, right, mid, 'found'),
          }),
        ],
      })

      steps.push({
        id: id++,
        narrative: `Return mid = ${mid} from the active frame.`,
        why: 'Logarithmic comparisons beat a linear scan - locals did the bookkeeping, the heap held the data.',
        codeFocus: L.found,
        callStack: [
          {
            name: 'search',
            active: true,
            locals: {
              nums: { ref: 'nums' },
              target: t,
              result: mid,
            },
          },
        ],
        heap: [
          heapArray(arr, {
            mid,
            highlights: [{ index: mid, role: 'found' }],
          }),
        ],
      })
      return steps
    }

    const tooSmall = midVal < t
    steps.push({
      id: id++,
      narrative: `mid = ${mid}. Read nums[${mid}] = ${midVal} - ${
        tooSmall ? `too small (< ${t}).` : `too large (> ${t}).`
      }`,
      why: tooSmall
        ? 'Discard mid and the entire left half: nothing there can be ≥ target.'
        : 'Discard mid and the entire right half: nothing there can be ≤ target.',
      codeFocus: L.mid,
      callStack: [
        {
          name: 'search',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            target: t,
            left,
            right,
            mid,
            'nums[mid]': midVal,
          },
        },
      ],
      heap: [
        heapArray(arr, {
          left,
          mid,
          right,
          highlights: windowHighlights(arr.length, left, right, mid, 'compare'),
        }),
      ],
    })

    if (tooSmall) {
      left = mid + 1
      steps.push({
        id: id++,
        narrative: `Update local left = mid + 1 → ${left}. The heap window shrinks to [${left}, ${right}].`,
        why: 'Critical: mid + 1 (not left++). Halving each step keeps O(log n).',
        codeFocus: L.leftInc,
        callStack: [
          {
            name: 'search',
            active: true,
            locals: {
              nums: { ref: 'nums' },
              target: t,
              left,
              right,
            },
          },
        ],
        heap: [
          heapArray(arr, {
            left,
            right,
            highlights: windowHighlights(arr.length, left, right),
          }),
        ],
      })
    } else {
      right = mid - 1
      steps.push({
        id: id++,
        narrative: `Update local right = mid - 1 → ${right}. The heap window shrinks to [${left}, ${right}].`,
        why: 'Critical: mid - 1 (not right--). Each iteration removes half the remaining indices.',
        codeFocus: L.rightDec,
        callStack: [
          {
            name: 'search',
            active: true,
            locals: {
              nums: { ref: 'nums' },
              target: t,
              left,
              right,
            },
          },
        ],
        heap: [
          heapArray(arr, {
            left,
            right,
            highlights: windowHighlights(arr.length, left, right),
          }),
        ],
      })
    }
  }

  steps.push({
    id: id++,
    narrative: 'Window empty (left > right) with no match → return -1.',
    why: 'Target is absent from the sorted array.',
    codeFocus: L.retMiss,
    callStack: [
      {
        name: 'search',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target: t,
          left,
          right,
          result: -1,
        },
      },
    ],
    heap: [
      heapArray(arr, {
        highlights: windowHighlights(arr.length, left, right),
      }),
    ],
  })

  return steps
}

const input = defineInput<Input>({
  kind: 'sortedIntArrayTarget',
  fields: [
    {
      key: 'nums',
      label: 'nums',
      widget: 'text',
      placeholder: '-1, 0, 3, 5, 9, 12',
      hint: 'Must be sorted non-decreasing',
      sortable: true,
    },
    { key: 'target', label: 'target', widget: 'text', placeholder: '9' },
  ],
  defaultRaw: { nums: formatIntList(nums), target: String(target) },
  parse: (raw) => {
    const numsResult = parseIntList(raw.nums ?? '', {
      name: 'nums',
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
      value: { nums: numsResult.value, target: targetResult.value },
    }
  },
  formatLabel: (value) =>
    `nums = [${value.nums.join(', ')}], target = ${value.target}`,
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { nums: '', target: '9' } },
    { name: 'not-found', raw: { nums: '-1, 0, 3, 5, 9, 12', target: '2' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const binarySearch: ProblemPack = {
  id: '0704-binary-search',
  lcNumber: 704,
  title: 'Binary Search',
  pattern: 'Binary Search',
  difficulty: 'Easy',
  insight:
    'Each step halves the search space. When nums[mid] is too small, set left = mid + 1; when too large, set right = mid - 1.',
  invariant:
    'If the target exists, it is always inside [left, right]; each iteration shrinks that inclusive window.',
  complexity: {
    time: 'O(log n)',
    space: 'O(1)',
    notes: 'Using left++ / right-- instead of mid ± 1 degrades to O(n).',
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
    note: 'Logarithmic growth stays nearly flat. Locals are scalars - almost no heap pressure.',
  },
  walkthrough: {
    statement:
      'Given a sorted array of distinct integers and a target, return its index or -1.',
    keyIdea:
      'Repeatedly test the middle; discard half the search space each step.',
    approach: [
      'left=0, right=n-1.',
      'While left≤right: mid=(left+right)/2; compare nums[mid] to target.',
      'Move left or right accordingly; return -1 if empty.',
    ],
  },
}
