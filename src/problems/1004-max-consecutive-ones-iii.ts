/**
 * LeetCode #1004 - Max Consecutive Ones III.
 * Sliding window: flips turn 0s into 1s; keep (len − ones) ≤ k.
 * Sibling of #424 character replacement.
 */
import javaSrc from '../../algorithms/1004-max-consecutive-ones-iii/Solution.java?raw'
import kotlinSrc from '../../algorithms/1004-max-consecutive-ones-iii/Solution.kt?raw'
import pythonSrc from '../../algorithms/1004-max-consecutive-ones-iii/solution.py?raw'
import { defineInput, formatIntList, parseIntList, parseIntValue } from '../engine/input'
import type { ParseResult } from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { nums: number[]; k: number }

/** Classic LC example 2: answer 6 with k=2 flips. */
const defaultNums = [0, 0, 1, 1, 0, 0, 1]
const defaultK = 2

const L = {
  enter: { java: 6, kotlin: 6, python: 6 },
  expand: { java: 10, kotlin: 10, python: 11 },
  shrink: { java: 13, kotlin: 13, python: 15 },
  update: { java: 15, kotlin: 15, python: 16 },
  ret: { java: 17, kotlin: 17, python: 17 },
} as const

function numsHeap(
  values: number[],
  left: number,
  right: number,
  highlights: ArrayHighlight[],
): HeapObject {
  return {
    id: 'nums',
    kind: 'array',
    label: 'int[] nums',
    values: [...values],
    pointers: { left, right },
    highlights,
    focused: true,
  }
}

function windowHighlights(
  left: number,
  right: number,
  n: number,
): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let i = 0; i < n; i++) {
    if (i < left || i > right) out.push({ index: i, role: 'visited' })
    else if (i === right) out.push({ index: i, role: 'current' })
    else out.push({ index: i, role: 'window' })
  }
  return out
}

function generateSteps({ nums, k }: Input): Step[] {
  const n = nums.length
  let left = 0
  let ones = 0
  let best = 0
  let bestLeft = 0
  let bestRight = -1
  const steps: Step[] = []
  let id = 1

  steps.push({
    id: id++,
    narrative:
      n === 0
        ? 'Enter longestOnes on []. Window never expands → return 0.'
        : `Enter longestOnes. At most k=${k} zeros may sit inside the window (flips to 1).`,
    why: 'Window length − count of ones is how many zeros need flipping; keep that ≤ k.',
    codeFocus: L.enter,
    callStack: [
      {
        name: 'longestOnes',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          k,
          left: 0,
          ones: 0,
          best: 0,
        },
      },
    ],
    heap: [numsHeap(nums, 0, Math.max(0, n - 1), [])],
  })

  if (n === 0) {
    steps.push({
      id: id++,
      narrative: 'Return best=0.',
      why: 'No bits means no non-empty window.',
      codeFocus: L.ret,
      callStack: [
        {
          name: 'longestOnes',
          active: true,
          locals: { nums: { ref: 'nums' }, k, best: 0, result: 0 },
        },
      ],
      heap: [numsHeap(nums, 0, 0, [])],
    })
    return steps
  }

  for (let right = 0; right < n; right++) {
    if (nums[right] === 1) ones += 1
    const zeros = right - left + 1 - ones

    steps.push({
      id: id++,
      narrative: `right=${right} → nums[${right}]=${nums[right]}. ones=${ones}; zeros in window=${zeros}.`,
      why: 'Expand first; shrink only if zeros exceed k.',
      codeFocus: L.expand,
      callStack: [
        {
          name: 'longestOnes',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            k,
            left,
            right,
            ones,
            zeros,
            best,
          },
        },
      ],
      heap: [numsHeap(nums, left, right, windowHighlights(left, right, n))],
    })

    while (right - left + 1 - ones > k) {
      if (nums[left] === 1) ones -= 1
      const prevLeft = left
      left += 1
      steps.push({
        id: id++,
        narrative: `Zeros > k → drop nums[${prevLeft}]=${nums[prevLeft]}, left=${left}, ones=${ones}.`,
        why: 'Slide left until the window again needs at most k flips.',
        codeFocus: L.shrink,
        callStack: [
          {
            name: 'longestOnes',
            active: true,
            locals: {
              nums: { ref: 'nums' },
              k,
              left,
              right,
              ones,
              best,
            },
          },
        ],
        heap: [numsHeap(nums, left, right, windowHighlights(left, right, n))],
      })
    }

    const len = right - left + 1
    const improved = len > best
    if (improved) {
      best = len
      bestLeft = left
      bestRight = right
    }
    steps.push({
      id: id++,
      narrative: `Window=[${left}, ${right}] length=${len}${improved ? ` → best=${best}` : ` ≤ best=${best}`}.`,
      why: improved
        ? 'This window is all 1s after ≤ k flips, and longer than before.'
        : 'Valid window, but not longer than the best so far.',
      codeFocus: L.update,
      callStack: [
        {
          name: 'longestOnes',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            k,
            left,
            right,
            len,
            ones,
            best,
          },
        },
      ],
      heap: [
        numsHeap(
          nums,
          left,
          right,
          improved
            ? windowHighlights(left, right, n).map((h) =>
                h.index >= left && h.index <= right
                  ? { index: h.index, role: 'found' as const }
                  : h,
              )
            : windowHighlights(left, right, n),
        ),
      ],
    })
  }

  steps.push({
    id: id++,
    narrative: `Scan complete. Return best=${best}${
      bestRight >= 0
        ? ` (window [${nums.slice(bestLeft, bestRight + 1).join(', ')}])`
        : ''
    }.`,
    why: 'Each index enters and leaves the window at most once → O(n).',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'longestOnes',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          k,
          best,
          result: best,
        },
      },
    ],
    heap: [
      numsHeap(
        nums,
        bestLeft,
        Math.max(bestLeft, bestRight),
        bestRight >= 0
          ? Array.from({ length: n }, (_, i) =>
              i >= bestLeft && i <= bestRight
                ? { index: i, role: 'found' as const }
                : { index: i, role: 'visited' as const },
            )
          : [],
      ),
    ],
  })

  return steps
}

function parseInput(raw: Record<string, string>): ParseResult<Input> {
  const numsResult = parseIntList(raw.nums ?? '', {
    name: 'nums',
    minLen: 0,
    maxLen: 12,
    minVal: 0,
    maxVal: 1,
  })
  if (!numsResult.ok) return numsResult

  const kResult = parseIntValue(raw.k ?? '', {
    name: 'k',
    minVal: 0,
    maxVal: 12,
  })
  if (!kResult.ok) return kResult

  if (kResult.value > numsResult.value.length) {
    return {
      ok: false,
      errors: [`k must be ≤ length of nums (${numsResult.value.length}).`],
    }
  }

  return { ok: true, value: { nums: numsResult.value, k: kResult.value } }
}

const input = defineInput<Input>({
  kind: 'binaryArrayK',
  fields: [
    {
      key: 'nums',
      label: 'nums',
      widget: 'text',
      placeholder: '0, 0, 1, 1, 0, 0, 1',
      hint: 'Up to 12 bits (0 or 1 only)',
    },
    {
      key: 'k',
      label: 'k',
      widget: 'text',
      placeholder: '2',
      hint: 'Flips allowed (0 … |nums|)',
    },
  ],
  defaultRaw: {
    nums: formatIntList(defaultNums),
    k: String(defaultK),
  },
  parse: parseInput,
  formatLabel: ({ nums, k }) => `nums = [${nums.join(', ')}], k = ${k}`,
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { nums: '', k: '0' } },
    { name: 'all-ones', raw: { nums: '1, 1, 1, 1', k: '2' } },
    { name: 'k-zero', raw: { nums: '1, 0, 1, 1, 0', k: '0' } },
    { name: 'need-flips', raw: { nums: '1, 0, 0, 1, 1, 0, 1', k: '2' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Max Consecutive Ones III default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const maxConsecutiveOnesIII: ProblemPack = {
  id: '1004-max-consecutive-ones-iii',
  lcNumber: 1004,
  title: 'Max Consecutive Ones III',
  pattern: 'Sliding Window',
  difficulty: 'Medium',
  insight:
    'Expand right and count ones; shrink while (window length − ones) > k, then update best length.',
  invariant:
    'After the shrink loop, the window needs at most k flips to become all ones.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: defaultNums.length },
  benchmark: placeholderBenchmark(
    'Sliding window is linear; restarting a fresh count from every left index is quadratic.',
  ),
  walkthrough: {
    statement:
      'Given a binary array nums and an integer k, return the longest contiguous subarray that contains only 1s after flipping at most k zeros.',
    keyIdea:
      'A window is valid when length − countOfOnes ≤ k; slide until that holds.',
    approach: [
      'left = 0, ones = 0, best = 0.',
      'For each right: if nums[right] is 1, bump ones.',
      'While length − ones > k, drop nums[left] from ones if needed and advance left.',
      'Update best with the current window length; return best.',
    ],
  },
}
