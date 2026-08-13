/**
 * LeetCode #153 - Find Minimum in Rotated Sorted Array.
 * Binary search with right = mid (not mid - 1).
 */
import javaSrc from '../../algorithms/0153-find-minimum-in-rotated-sorted-array/Solution.java?raw'
import kotlinSrc from '../../algorithms/0153-find-minimum-in-rotated-sorted-array/Solution.kt?raw'
import pythonSrc from '../../algorithms/0153-find-minimum-in-rotated-sorted-array/solution.py?raw'
import { defineInput, formatIntList, parseIntList } from '../engine/input'
import type { ArrayHighlight, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { nums: number[] }

const nums = [3, 4, 5, 1, 2]

const L = {
  init: { java: 6, kotlin: 6, python: 6 },
  while: { java: 8, kotlin: 8, python: 8 },
  mid: { java: 10, kotlin: 10, python: 10 },
  leftInc: { java: 11, kotlin: 11, python: 11 },
  rightSet: { java: 13, kotlin: 13, python: 13 },
  ret: { java: 16, kotlin: 16, python: 14 },
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

function generateSteps({ nums: arr }: Input): Step[] {
  const steps: Step[] = []
  let id = 1

  if (arr.length === 0) {
    steps.push({
      id: id++,
      narrative: 'Empty array. No minimum to return.',
      why: 'Constraints expect at least one element; demo stops here.',
      codeFocus: L.ret,
      callStack: [
        {
          name: 'findMin',
          active: true,
          locals: { nums: { ref: 'nums' }, result: null },
        },
      ],
      heap: [heapArray(arr)],
    })
    return steps
  }

  let left = 0
  let right = arr.length - 1

  steps.push({
    id: id++,
    narrative: `Enter findMin. left=${left}, right=${right} on the rotated array.`,
    why: 'Invariant: the minimum always lies inside [left, right] inclusive.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'findMin',
        active: true,
        locals: { nums: { ref: 'nums' }, left, right },
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

  while (left < right) {
    steps.push({
      id: id++,
      narrative: `While left (${left}) < right (${right}) - enter loop body.`,
      why: 'Use strict < so the loop stops when left and right meet on the answer.',
      codeFocus: L.while,
      callStack: [
        {
          name: 'findMin',
          active: true,
          locals: { nums: { ref: 'nums' }, left, right },
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
    const rightVal = arr[right]!
    const minOnRight = midVal > rightVal

    steps.push({
      id: id++,
      narrative: `mid=${mid}. nums[mid]=${midVal}, nums[right]=${rightVal} - ${
        minOnRight
          ? 'mid is in the left (larger) run, so the min is to the right of mid.'
          : 'mid is on the side that still contains the min (including mid).'
      }`,
      why: minOnRight
        ? 'Rotation put the break in (mid, right]; drop [left, mid].'
        : 'nums[mid] ≤ nums[right], so the min is in [left, mid]. Keep mid.',
      codeFocus: L.mid,
      callStack: [
        {
          name: 'findMin',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            left,
            right,
            mid,
            'nums[mid]': midVal,
            'nums[right]': rightVal,
          },
        },
      ],
      heap: [
        heapArray(arr, {
          left,
          mid,
          right,
          highlights: windowHighlights(
            arr.length,
            left,
            right,
            mid,
            'compare',
          ),
        }),
      ],
    })

    if (minOnRight) {
      left = mid + 1
      steps.push({
        id: id++,
        narrative: `Update left = mid + 1 → ${left}. Window shrinks to [${left}, ${right}].`,
        why: 'mid cannot be the minimum when it is greater than nums[right].',
        codeFocus: L.leftInc,
        callStack: [
          {
            name: 'findMin',
            active: true,
            locals: { nums: { ref: 'nums' }, left, right },
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
      right = mid
      steps.push({
        id: id++,
        narrative: `Update right = mid → ${right} (not mid - 1). Window shrinks to [${left}, ${right}].`,
        why: 'mid might still be the minimum, so do not drop it.',
        codeFocus: L.rightSet,
        callStack: [
          {
            name: 'findMin',
            active: true,
            locals: { nums: { ref: 'nums' }, left, right },
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

  const answer = arr[left]!
  steps.push({
    id: id++,
    narrative: `left == right == ${left}. Return nums[${left}] = ${answer}.`,
    why: 'The inclusive window collapsed onto the unique minimum.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'findMin',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          left,
          right,
          result: answer,
        },
      },
    ],
    heap: [
      heapArray(arr, {
        left,
        highlights: [{ index: left, role: 'found' }],
      }),
    ],
  })

  return steps
}

const input = defineInput<Input>({
  kind: 'rotatedSortedArray',
  fields: [
    {
      key: 'nums',
      label: 'nums',
      widget: 'text',
      placeholder: '3, 4, 5, 1, 2',
      hint: 'Distinct values; a rotated sorted array (max 16)',
    },
  ],
  defaultRaw: { nums: formatIntList(nums) },
  parse: (raw) => {
    const numsResult = parseIntList(raw.nums ?? '', {
      name: 'nums',
      minLen: 1,
      maxLen: 16,
      minVal: -99,
      maxVal: 99,
    })
    if (!numsResult.ok) return numsResult
    return { ok: true, value: { nums: numsResult.value } }
  },
  formatLabel: (value) => `nums = [${value.nums.join(', ')}]`,
  generateSteps,
  fixtures: [
    { name: 'no-rotation', raw: { nums: '1, 2, 3, 4' } },
    { name: 'single', raw: { nums: '7' } },
    { name: 'pivot-at-end', raw: { nums: '2, 3, 4, 5, 1' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const findMinimumInRotatedSortedArray: ProblemPack = {
  id: '0153-find-minimum-in-rotated-sorted-array',
  lcNumber: 153,
  title: 'Find Minimum in Rotated Sorted Array',
  pattern: 'Binary Search',
  difficulty: 'Medium',
  insight:
    'If nums[mid] > nums[right], the min is in (mid, right]; else it is in [left, mid]. Set right = mid, not mid - 1.',
  invariant:
    'The minimum of the rotated array always stays inside [left, right] until left == right.',
  complexity: {
    time: 'O(log n)',
    space: 'O(1)',
    notes: 'Requires distinct values so the mid vs right compare is decisive.',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: {
    java: javaSrc,
    kotlin: kotlinSrc,
    python: pythonSrc,
  },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Rotated minimum search is logarithmic; a linear scan always reads every element.',
  ),
  walkthrough: {
    statement:
      'Given a rotated sorted array of distinct integers, return the minimum element.',
    keyIdea:
      'Compare mid to the right end to learn which side still holds the rotation break.',
    approach: [
      'left = 0, right = n - 1.',
      'While left < right: mid = (left+right)/2.',
      'If nums[mid] > nums[right], left = mid + 1; else right = mid.',
      'Return nums[left].',
    ],
  },
}
