/**
 * LeetCode #11 - Container With Most Water.
 * Steps are generated from validated height input (Phase 4).
 * Visualization: vertical bars + live water rectangle (display: 'bars').
 */
import javaSrc from '../../algorithms/0011-container-with-most-water/Solution.java?raw'
import kotlinSrc from '../../algorithms/0011-container-with-most-water/Solution.kt?raw'
import pythonSrc from '../../algorithms/0011-container-with-most-water/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
} from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

/** Default demo - name `height` kept for validate:traces array extraction. */
const height = [1, 8, 6, 2, 5, 4, 8, 3, 7]

const L = {
  moveLeft: { java: 13, kotlin: 12, python: 13 },
  moveRight: { java: 15, kotlin: 12, python: 15 },
  ret: { java: 18, kotlin: 14, python: 16 },
} as const

/** Histogram heap snapshot for the teaching surface. */
function heightBars(
  height: number[],
  left: number,
  right: number,
  highlights: ArrayHighlight[],
  metrics: { area?: number; best: number },
): HeapObject {
  return {
    id: 'height',
    kind: 'array',
    label: 'int[] height',
    values: height,
    display: 'bars',
    pointers: { left, right },
    highlights,
    metrics,
    focused: true,
  }
}

/**
 * Full two-pointer walk - every while-iteration is a step.
 * Handles empty / single-element inputs with a short return beat.
 */
function generateContainerSteps(height: number[]): Step[] {
  if (height.length < 2) {
    return [
      {
        id: 1,
        narrative:
          height.length === 0
            ? 'height is empty. No pair of lines exists → return 0.'
            : 'Only one line. Need two indices to form a container → return 0.',
        why: 'Area needs two sides; the algorithm’s while (left < right) never enters.',
        codeFocus: L.ret,
        callStack: [
          {
            name: 'maxArea',
            active: true,
            locals: {
              height: { ref: 'height' },
              left: 0,
              right: Math.max(0, height.length - 1),
              best: 0,
              result: 0,
            },
          },
        ],
        heap: [
          {
            id: 'height',
            kind: 'array',
            label: 'int[] height',
            values: height,
            display: 'bars',
            metrics: { best: 0 },
            focused: true,
          },
        ],
      },
    ]
  }

  const steps: Step[] = []
  let left = 0
  let right = height.length - 1
  let best = 0
  let bestLeft = 0
  let bestRight = right
  let id = 1

  while (left < right) {
    const hL = height[left]!
    const hR = height[right]!
    const area = Math.min(hL, hR) * (right - left)
    const improved = area > best
    if (improved) {
      best = area
      bestLeft = left
      bestRight = right
    }

    const moveLeft = hL <= hR
    const move = moveLeft ? 'left++' : 'right--'

    steps.push({
      id,
      narrative: `left=${left}, right=${right}. area=min(${hL},${hR})×${right - left}=${area} ${
        improved ? `→ best=${best}` : `< best=${best}`
      }. ${moveLeft ? 'Left' : 'Right'} is shorter (or equal) → ${move}.`,
      why: improved
        ? 'New maximum; still move the shorter side so a taller wall might appear.'
        : 'Loop continues while left < right - keep shrinking from the shorter side.',
      codeFocus: moveLeft ? L.moveLeft : L.moveRight,
      callStack: [
        {
          name: 'maxArea',
          active: true,
          locals: {
            height: { ref: 'height' },
            left,
            right,
            area,
            best,
            move,
          },
        },
      ],
      heap: [
        heightBars(
          height,
          left,
          right,
          [
            {
              index: left,
              role: improved && left === bestLeft ? 'found' : 'compare',
            },
            {
              index: right,
              role: improved && right === bestRight ? 'found' : 'compare',
            },
          ],
          { area, best },
        ),
      ],
    })

    if (moveLeft) left += 1
    else right -= 1
    id += 1
  }

  steps.push({
    id,
    narrative: `left=${left} is not < right=${right}. Loop ends. Return best=${best}.`,
    why: 'Answer is the max area seen across every candidate pair the pointers considered.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'maxArea',
        active: true,
        locals: {
          height: { ref: 'height' },
          left,
          right,
          best,
          result: best,
        },
      },
    ],
    heap: [
      heightBars(
        height,
        left,
        right,
        [
          { index: bestLeft, role: 'found' },
          { index: bestRight, role: 'found' },
        ],
        { best },
      ),
    ],
  })

  return steps
}

const input = defineInput<number[]>({
  kind: 'intArray',
  fields: [
    {
      key: 'height',
      label: 'height',
      widget: 'text',
      placeholder: '1, 8, 6, 2, 5, 4, 8, 3, 7',
      hint: 'Up to 16 integers from 0-99',
    },
  ],
  defaultRaw: { height: formatIntList(height) },
  parse: (raw) =>
    parseIntList(raw.height ?? '', {
      name: 'height',
      minLen: 0,
      maxLen: 16,
      minVal: 0,
      maxVal: 99,
    }),
  formatLabel: (height) => `height = [${height.join(', ')}]`,
  generateSteps: generateContainerSteps,
  fixtures: [
    { name: 'empty', raw: { height: '' } },
    { name: 'single', raw: { height: '5' } },
    { name: 'two', raw: { height: '1, 2' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(`Container default input invalid: ${defaultParsed.errors.join('; ')}`)
}

export const containerWithMostWater: ProblemPack = {
  id: '0011-container-with-most-water',
  lcNumber: 11,
  title: 'Container With Most Water',
  pattern: 'Two Pointers',
  difficulty: 'Medium',
  insight:
    'Always move the shorter line: any pair that keeps it only gets narrower with equal or lower min-height.',
  invariant:
    'best tracks the max area seen; the active pair is always (left, right) on the remaining range.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  /** Validator: generator packs check for a full left<right loop instead of literal pairs. */
  demoCoverage: { twoPointers: { array: 'height' } },
  benchmark: placeholderBenchmark(
    'One pass beats the O(n²) brute-force double loop by a huge constant-factor margin.',
  ),
  walkthrough: {
    statement:
      'Given heights, choose two lines that form a container holding the most water.',
    keyIdea: 'Area = min(h[L],h[R]) * (R-L). Move the shorter pointer inward.',
    approach: [
      'Start with widest container.',
      'Track max area each step.',
      'Advance the shorter side; stop when left >= right.',
    ],
  },
}
