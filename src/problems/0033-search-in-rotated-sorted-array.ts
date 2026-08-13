/**
 * LeetCode #33 - Search in Rotated Sorted Array.
 * Identify the sorted half, then binary-search or discard it.
 */
import javaSrc from '../../algorithms/0033-search-in-rotated-sorted-array/Solution.java?raw'
import kotlinSrc from '../../algorithms/0033-search-in-rotated-sorted-array/Solution.kt?raw'
import pythonSrc from '../../algorithms/0033-search-in-rotated-sorted-array/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
  parseIntValue,
} from '../engine/input'
import type { ArrayHighlight, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { nums: number[]; target: number }

const nums = [4, 5, 6, 7, 0, 1, 2]
const target = 0

const L = {
  init: { java: 6, kotlin: 6, python: 6 },
  while: { java: 8, kotlin: 8, python: 8 },
  mid: { java: 9, kotlin: 9, python: 9 },
  found: { java: 11, kotlin: 11, python: 11 },
  leftSorted: { java: 13, kotlin: 13, python: 12 },
  rightDec: { java: 15, kotlin: 15, python: 14 },
  leftInc: { java: 17, kotlin: 17, python: 16 },
  rightSortedGoLeft: { java: 21, kotlin: 21, python: 19 },
  rightSortedGoRight: { java: 23, kotlin: 23, python: 21 },
  retMiss: { java: 27, kotlin: 27, python: 22 },
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
        : `Enter search. left=${left}, right=${right} on the rotated array.`,
    why: 'Invariant: if the target exists, it is always inside [left, right].',
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
        left: arr.length === 0 ? undefined : left,
        right: arr.length === 0 ? undefined : right,
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
        narrative: `mid=${mid}. nums[${mid}]=${midVal} equals target.`,
        why: 'Found without scanning every index.',
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
            highlights: windowHighlights(
              arr.length,
              left,
              right,
              mid,
              'found',
            ),
          }),
        ],
      })

      steps.push({
        id: id++,
        narrative: `Return mid = ${mid}.`,
        why: 'The sorted-half test kept discarding impossible ranges until mid hit the target.',
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

    const leftSorted = arr[left]! <= midVal
    steps.push({
      id: id++,
      narrative: `mid=${mid}, nums[mid]=${midVal}. ${
        leftSorted
          ? `Left half [${left}, ${mid}] is sorted (nums[left]=${arr[left]} ≤ nums[mid]).`
          : `Right half [${mid}, ${right}] is sorted (nums[left]=${arr[left]} > nums[mid]).`
      }`,
      why: 'In a rotated array, at least one side of mid is contiguous sorted.',
      codeFocus: leftSorted ? L.leftSorted : L.mid,
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
            'nums[left]': arr[left]!,
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

    if (leftSorted) {
      if (arr[left]! <= t && t < midVal) {
        right = mid - 1
        steps.push({
          id: id++,
          narrative: `Target ${t} is inside the sorted left half → right = mid - 1 → ${right}.`,
          why: 'Everything to the right of mid is impossible once the left sorted range covers the target.',
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
      } else {
        left = mid + 1
        steps.push({
          id: id++,
          narrative: `Target ${t} is not in the sorted left half → left = mid + 1 → ${left}.`,
          why: 'Discard the sorted half that cannot contain the target.',
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
      }
    } else if (midVal < t && t <= arr[right]!) {
      left = mid + 1
      steps.push({
        id: id++,
        narrative: `Target ${t} is inside the sorted right half → left = mid + 1 → ${left}.`,
        why: 'Search only where the sorted range can still hold the target.',
        codeFocus: L.rightSortedGoLeft,
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
        narrative: `Target ${t} is not in the sorted right half → right = mid - 1 → ${right}.`,
        why: 'Discard the sorted half that cannot contain the target.',
        codeFocus: L.rightSortedGoRight,
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
    why: 'Target is absent from the rotated array.',
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
  kind: 'rotatedSortedArrayTarget',
  fields: [
    {
      key: 'nums',
      label: 'nums',
      widget: 'text',
      placeholder: '4, 5, 6, 7, 0, 1, 2',
      hint: 'Distinct values; a rotated sorted array (max 16)',
    },
    { key: 'target', label: 'target', widget: 'text', placeholder: '0' },
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
    return {
      ok: true,
      value: { nums: numsResult.value, target: targetResult.value },
    }
  },
  formatLabel: (value) =>
    `nums = [${value.nums.join(', ')}], target = ${value.target}`,
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { nums: '', target: '0' } },
    {
      name: 'not-found',
      raw: { nums: '4, 5, 6, 7, 0, 1, 2', target: '3' },
    },
    { name: 'no-rotation', raw: { nums: '1, 2, 3, 4', target: '3' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const searchInRotatedSortedArray: ProblemPack = {
  id: '0033-search-in-rotated-sorted-array',
  lcNumber: 33,
  title: 'Search in Rotated Sorted Array',
  pattern: 'Binary Search',
  difficulty: 'Medium',
  insight:
    'At least one half of [left, mid] / [mid, right] is sorted. If the target lies in that sorted range, search there; otherwise search the other half.',
  invariant:
    'If the target exists, it remains inside [left, right] after each discard.',
  complexity: {
    time: 'O(log n)',
    space: 'O(1)',
    notes: 'Distinct values keep the sorted-half test unambiguous.',
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
    'Rotated search stays logarithmic when values are distinct; a linear scan is O(n).',
  ),
  walkthrough: {
    statement:
      'Given a rotated sorted array of distinct integers and a target, return the index of target or -1.',
    keyIdea:
      'Decide which side of mid is sorted, then keep or discard that side based on the target.',
    approach: [
      'left = 0, right = n - 1.',
      'While left ≤ right: mid = (left+right)/2; return mid on a hit.',
      'If nums[left] ≤ nums[mid], the left half is sorted; otherwise the right half is.',
      'Narrow to the half that can still contain target; return -1 if empty.',
    ],
  },
}
