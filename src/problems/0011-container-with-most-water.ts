/**
 * LeetCode #11 — Container With Most Water.
 * Full two-pointer walk of height = [1,8,6,2,5,4,8,3,7] → 49.
 * Every while-iteration (left < right) is a step — no early exit.
 * Visualization: vertical bars + live water rectangle (display: 'bars').
 */
import javaSrc from '../../algorithms/0011-container-with-most-water/Solution.java?raw'
import kotlinSrc from '../../algorithms/0011-container-with-most-water/Solution.kt?raw'
import pythonSrc from '../../algorithms/0011-container-with-most-water/solution.py?raw'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const height = [1, 8, 6, 2, 5, 4, 8, 3, 7]

const L = {
  moveLeft: { java: 13, kotlin: 12, python: 13 },
  moveRight: { java: 15, kotlin: 12, python: 15 },
  ret: { java: 18, kotlin: 14, python: 16 },
} as const

/** Histogram heap snapshot for the teaching surface. */
function heightBars(
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

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Start widest: left=0, right=8. area=min(1,7)×8=8 → best=8. Left is shorter → left++.',
    why: 'Keeping the short wall while shrinking width cannot beat this area.',
    codeFocus: L.moveLeft,
    callStack: [
      {
        name: 'maxArea',
        active: true,
        locals: {
          height: { ref: 'height' },
          left: 0,
          right: 8,
          area: 8,
          best: 8,
          move: 'left++',
        },
      },
    ],
    heap: [
      heightBars(
        0,
        8,
        [
          { index: 0, role: 'compare' },
          { index: 8, role: 'compare' },
        ],
        { area: 8, best: 8 },
      ),
    ],
  },
  {
    id: 2,
    narrative: 'left=1, right=8. area=min(8,7)×7=49 → best=49. Right is shorter → right--.',
    why: 'New maximum; still move the shorter side (7 < 8).',
    codeFocus: L.moveRight,
    callStack: [
      {
        name: 'maxArea',
        active: true,
        locals: {
          height: { ref: 'height' },
          left: 1,
          right: 8,
          area: 49,
          best: 49,
          move: 'right--',
        },
      },
    ],
    heap: [
      heightBars(
        1,
        8,
        [
          { index: 1, role: 'found' },
          { index: 8, role: 'found' },
        ],
        { area: 49, best: 49 },
      ),
    ],
  },
  {
    id: 3,
    narrative: 'left=1, right=7. area=min(8,3)×6=18 < best. Right shorter → right--.',
    why: 'Loop continues while left < right — we do not stop at the first good area.',
    codeFocus: L.moveRight,
    callStack: [
      {
        name: 'maxArea',
        active: true,
        locals: {
          height: { ref: 'height' },
          left: 1,
          right: 7,
          area: 18,
          best: 49,
          move: 'right--',
        },
      },
    ],
    heap: [
      heightBars(
        1,
        7,
        [
          { index: 1, role: 'compare' },
          { index: 7, role: 'compare' },
        ],
        { area: 18, best: 49 },
      ),
    ],
  },
  {
    id: 4,
    narrative: 'left=1, right=6. area=min(8,8)×5=40 < best. Heights equal → move left (≤ branch).',
    why: 'When equal, either side can move; this code advances left.',
    codeFocus: L.moveLeft,
    callStack: [
      {
        name: 'maxArea',
        active: true,
        locals: {
          height: { ref: 'height' },
          left: 1,
          right: 6,
          area: 40,
          best: 49,
          move: 'left++',
        },
      },
    ],
    heap: [
      heightBars(
        1,
        6,
        [
          { index: 1, role: 'compare' },
          { index: 6, role: 'compare' },
        ],
        { area: 40, best: 49 },
      ),
    ],
  },
  {
    id: 5,
    narrative: 'left=2, right=6. area=min(6,8)×4=24 < best. Left shorter → left++.',
    why: 'Still searching the remaining range for a better pair.',
    codeFocus: L.moveLeft,
    callStack: [
      {
        name: 'maxArea',
        active: true,
        locals: {
          height: { ref: 'height' },
          left: 2,
          right: 6,
          area: 24,
          best: 49,
          move: 'left++',
        },
      },
    ],
    heap: [
      heightBars(
        2,
        6,
        [
          { index: 2, role: 'compare' },
          { index: 6, role: 'compare' },
        ],
        { area: 24, best: 49 },
      ),
    ],
  },
  {
    id: 6,
    narrative: 'left=3, right=6. area=min(2,8)×3=6 < best. Left shorter → left++.',
    why: 'Narrower and shorter min-height cannot beat 49.',
    codeFocus: L.moveLeft,
    callStack: [
      {
        name: 'maxArea',
        active: true,
        locals: {
          height: { ref: 'height' },
          left: 3,
          right: 6,
          area: 6,
          best: 49,
          move: 'left++',
        },
      },
    ],
    heap: [
      heightBars(
        3,
        6,
        [
          { index: 3, role: 'compare' },
          { index: 6, role: 'compare' },
        ],
        { area: 6, best: 49 },
      ),
    ],
  },
  {
    id: 7,
    narrative: 'left=4, right=6. area=min(5,8)×2=10 < best. Left shorter → left++.',
    why: 'Keep walking until the pointers meet.',
    codeFocus: L.moveLeft,
    callStack: [
      {
        name: 'maxArea',
        active: true,
        locals: {
          height: { ref: 'height' },
          left: 4,
          right: 6,
          area: 10,
          best: 49,
          move: 'left++',
        },
      },
    ],
    heap: [
      heightBars(
        4,
        6,
        [
          { index: 4, role: 'compare' },
          { index: 6, role: 'compare' },
        ],
        { area: 10, best: 49 },
      ),
    ],
  },
  {
    id: 8,
    narrative: 'left=5, right=6. area=min(4,8)×1=4 < best. Left shorter → left++ → left=6.',
    why: 'Last iteration: after this move left == right and the while ends.',
    codeFocus: L.moveLeft,
    callStack: [
      {
        name: 'maxArea',
        active: true,
        locals: {
          height: { ref: 'height' },
          left: 5,
          right: 6,
          area: 4,
          best: 49,
          move: 'left++',
        },
      },
    ],
    heap: [
      heightBars(
        5,
        6,
        [
          { index: 5, role: 'compare' },
          { index: 6, role: 'compare' },
        ],
        { area: 4, best: 49 },
      ),
    ],
  },
  {
    id: 9,
    narrative: 'left=6 is not < right=6. Loop ends. Return best=49.',
    why: 'Answer is the max area seen across every candidate pair the pointers considered.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'maxArea',
        active: true,
        locals: {
          height: { ref: 'height' },
          left: 6,
          right: 6,
          best: 49,
          result: 49,
        },
      },
    ],
    heap: [
      heightBars(
        6,
        6,
        [
          { index: 1, role: 'found' },
          { index: 8, role: 'found' },
        ],
        { best: 49 },
      ),
    ],
  },
]

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
  inputLabel: 'height = [1,8,6,2,5,4,8,3,7]',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  /** Validator simulates move-shorter two-pointers on `height` and requires every loop state. */
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
