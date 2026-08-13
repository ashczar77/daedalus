/**
 * LeetCode #162 - Find Peak Element.
 * Binary search on slope: climb toward a greater neighbor.
 */
import javaSrc from '../../algorithms/0162-find-peak-element/Solution.java?raw'
import kotlinSrc from '../../algorithms/0162-find-peak-element/Solution.kt?raw'
import pythonSrc from '../../algorithms/0162-find-peak-element/solution.py?raw'
import { defineInput, formatIntList, parseIntList } from '../engine/input'
import type { ArrayHighlight, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { nums: number[] }

const nums = [1, 2, 3, 1]

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
  slopeNeighbor?: number,
): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let i = 0; i < n; i++) {
    if (i < left || i > right) out.push({ index: i, role: 'discard' })
    else if (mid !== undefined && i === mid)
      out.push({ index: i, role: midRole ?? 'compare' })
    else if (slopeNeighbor !== undefined && i === slopeNeighbor)
      out.push({ index: i, role: 'current' })
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
      narrative: 'Empty array. No peak index to return.',
      why: 'Constraints expect at least one element; demo stops here.',
      codeFocus: L.ret,
      callStack: [
        {
          name: 'findPeakElement',
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
    narrative: `Enter findPeakElement. left=${left}, right=${right}.`,
    why: 'A peak always exists: imagine -∞ neighbors past both ends.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'findPeakElement',
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
      why: 'Stop when left and right meet on a peak index.',
      codeFocus: L.while,
      callStack: [
        {
          name: 'findPeakElement',
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
    const nextVal = arr[mid + 1]!
    const climbRight = midVal < nextVal

    steps.push({
      id: id++,
      narrative: `mid=${mid}. nums[mid]=${midVal}, nums[mid+1]=${nextVal} - slope ${
        climbRight ? 'rises to the right.' : 'falls (or ties) to the right.'
      }`,
      why: climbRight
        ? 'A peak exists on the rising side, so move left past mid.'
        : 'mid is ≥ its right neighbor, so a peak exists in [left, mid].',
      codeFocus: L.mid,
      callStack: [
        {
          name: 'findPeakElement',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            left,
            right,
            mid,
            'nums[mid]': midVal,
            'nums[mid+1]': nextVal,
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
            mid + 1,
          ),
        }),
      ],
    })

    if (climbRight) {
      left = mid + 1
      steps.push({
        id: id++,
        narrative: `Update left = mid + 1 → ${left}. Window shrinks to [${left}, ${right}].`,
        why: 'Climb the ascending slope; mid cannot be a peak.',
        codeFocus: L.leftInc,
        callStack: [
          {
            name: 'findPeakElement',
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
        narrative: `Update right = mid → ${right}. Window shrinks to [${left}, ${right}].`,
        why: 'Keep mid; it might already be a peak.',
        codeFocus: L.rightSet,
        callStack: [
          {
            name: 'findPeakElement',
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

  const answer = left
  const peakVal = arr[answer]!
  steps.push({
    id: id++,
    narrative: `left == right == ${answer}. Return index ${answer} (value ${peakVal}).`,
    why: 'Any local peak is accepted; the slope walk guarantees one exists in the window.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'findPeakElement',
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
        highlights: [{ index: answer, role: 'found' }],
      }),
    ],
  })

  return steps
}

const input = defineInput<Input>({
  kind: 'peakArray',
  fields: [
    {
      key: 'nums',
      label: 'nums',
      widget: 'text',
      placeholder: '1, 2, 3, 1',
      hint: 'Any ints; neighbors may be equal only if your code allows (max 16)',
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
    { name: 'single', raw: { nums: '5' } },
    { name: 'strict-increasing', raw: { nums: '1, 2, 3, 4' } },
    { name: 'strict-decreasing', raw: { nums: '4, 3, 2, 1' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const findPeakElement: ProblemPack = {
  id: '0162-find-peak-element',
  lcNumber: 162,
  title: 'Find Peak Element',
  pattern: 'Binary Search',
  difficulty: 'Medium',
  insight:
    'If nums[mid] < nums[mid+1], climb right (left = mid + 1); otherwise keep mid (right = mid). Return left.',
  invariant:
    'The live window [left, right] always contains at least one peak index.',
  complexity: {
    time: 'O(log n)',
    space: 'O(1)',
    notes: 'Any peak is valid; the algorithm does not promise the global max.',
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
    'Slope binary search is logarithmic; scanning for a local max is linear.',
  ),
  walkthrough: {
    statement:
      'A peak is an index i where nums[i] > its neighbors (treat ends as bordering -∞). Return any peak index.',
    keyIdea:
      'Follow the ascending slope; a peak must exist on that side of mid.',
    approach: [
      'left = 0, right = n - 1.',
      'While left < right: mid = (left+right)/2.',
      'If nums[mid] < nums[mid+1], left = mid + 1; else right = mid.',
      'Return left.',
    ],
  },
}
