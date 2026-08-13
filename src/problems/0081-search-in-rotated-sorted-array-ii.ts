/**
 * LeetCode #81 - Search in Rotated Sorted Array II.
 * Same as #33, but shrink both ends when nums[left]==nums[mid]==nums[right].
 */
import javaSrc from '../../algorithms/0081-search-in-rotated-sorted-array-ii/Solution.java?raw'
import kotlinSrc from '../../algorithms/0081-search-in-rotated-sorted-array-ii/Solution.kt?raw'
import pythonSrc from '../../algorithms/0081-search-in-rotated-sorted-array-ii/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
  parseIntValue,
} from '../engine/input'
import type { ArrayHighlight, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { nums: number[]; target: number }

const nums = [2, 2, 2, 0, 1, 2]
const target = 0

const L = {
  init: { java: 6, kotlin: 6, python: 6 },
  while: { java: 8, kotlin: 8, python: 8 },
  mid: { java: 9, kotlin: 9, python: 9 },
  found: { java: 11, kotlin: 11, python: 11 },
  shrink: { java: 13, kotlin: 13, python: 12 },
  leftSorted: { java: 16, kotlin: 16, python: 15 },
  rightDec: { java: 18, kotlin: 18, python: 17 },
  leftInc: { java: 20, kotlin: 20, python: 19 },
  rightSortedGoLeft: { java: 24, kotlin: 24, python: 22 },
  rightSortedGoRight: { java: 26, kotlin: 26, python: 24 },
  retMiss: { java: 30, kotlin: 30, python: 25 },
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
        : `Enter search. left=${left}, right=${right}. Duplicates may force linear shrinks.`,
    why: 'Same rotated search as #33, with an extra branch when ends equal mid.',
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
      narrative: 'left > right immediately. Loop never runs → return false.',
      why: 'Empty input cannot contain the target.',
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
            result: false,
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
        why: 'Return true as soon as any index matches.',
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
        narrative: 'Return true.',
        why: 'Presence only; duplicates do not change a successful hit.',
        codeFocus: L.found,
        callStack: [
          {
            name: 'search',
            active: true,
            locals: {
              nums: { ref: 'nums' },
              target: t,
              result: true,
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

    if (arr[left]! === midVal && midVal === arr[right]!) {
      steps.push({
        id: id++,
        narrative: `mid=${mid}. nums[left]=nums[mid]=nums[right]=${midVal}. Cannot tell which half is sorted.`,
        why: 'Duplicates make the sorted-half test ambiguous, so shrink one index from each end.',
        codeFocus: L.shrink,
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
              'compare',
            ),
          }),
        ],
      })

      left++
      right--
      steps.push({
        id: id++,
        narrative: `Shrink both ends → left=${left}, right=${right}.`,
        why: 'Worst case this becomes O(n); average case still discards half when ends differ.',
        codeFocus: L.shrink,
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
      continue
    }

    const leftSorted = arr[left]! <= midVal
    steps.push({
      id: id++,
      narrative: `mid=${mid}, nums[mid]=${midVal}. ${
        leftSorted
          ? `Left half [${left}, ${mid}] is sorted.`
          : `Right half [${mid}, ${right}] is sorted.`
      }`,
      why: 'With unequal ends, the usual rotated sorted-half rule applies.',
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
          why: 'Discard the impossible right side of mid.',
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
    narrative: 'Window empty with no match → return false.',
    why: 'Target is absent (or was only among discarded duplicates).',
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
          result: false,
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
  kind: 'rotatedSortedArrayTargetDup',
  fields: [
    {
      key: 'nums',
      label: 'nums',
      widget: 'text',
      placeholder: '2, 2, 2, 0, 1, 2',
      hint: 'Rotated sorted array; duplicates allowed (max 16)',
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
      name: 'all-same-miss',
      raw: { nums: '1, 1, 1, 1', target: '0' },
    },
    {
      name: 'not-found',
      raw: { nums: '2, 5, 6, 0, 0, 1, 2', target: '3' },
    },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const searchInRotatedSortedArrayII: ProblemPack = {
  id: '0081-search-in-rotated-sorted-array-ii',
  lcNumber: 81,
  title: 'Search in Rotated Sorted Array II',
  pattern: 'Binary Search',
  difficulty: 'Medium',
  insight:
    'Same sorted-half logic as #33. When nums[left] == nums[mid] == nums[right], shrink both ends because the half test is ambiguous.',
  invariant:
    'If the target exists, it remains inside [left, right] after each discard or shrink.',
  complexity: {
    time: 'O(n) worst case',
    space: 'O(1)',
    notes: 'Duplicates can force left++ / right-- every step.',
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
    'Average case still discards half; all-equal inputs degrade toward a linear scan.',
  ),
  walkthrough: {
    statement:
      'Given a rotated sorted array that may contain duplicates and a target, return whether target appears.',
    keyIdea:
      'Use #33 when ends differ; when left, mid, and right are equal, shrink both ends.',
    approach: [
      'left = 0, right = n - 1.',
      'While left ≤ right: mid = (left+right)/2; return true on a hit.',
      'If nums[left] == nums[mid] == nums[right], left++, right--.',
      'Otherwise apply the sorted-half test from #33; return false if empty.',
    ],
  },
}
