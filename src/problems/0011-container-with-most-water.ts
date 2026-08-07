/**
 * LeetCode #11 — Container With Most Water (greedy opposite-end pointers).
 * Demo: height = [1,8,6,2,5,4,8,3,7] → area 49.
 */
import javaSrc from '../../algorithms/0011-container-with-most-water/Solution.java?raw'
import kotlinSrc from '../../algorithms/0011-container-with-most-water/Solution.kt?raw'
import pythonSrc from '../../algorithms/0011-container-with-most-water/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const height = [1, 8, 6, 2, 5, 4, 8, 3, 7]

const steps: Step[] = [
  {
    id: 1,
    message: 'Start with the widest container: left=0, right=8. Area = min(1,7)*8 = 8.',
    codeFocus: { java: 10, kotlin: 10, python: 10 },
    variables: { left: 0, right: 8, area: 8, best: 8 },
    scene: {
      type: 'array',
      label: 'height',
      values: height,
      pointers: { left: 0, right: 8 },
      highlights: [
        { index: 0, role: 'current' },
        { index: 8, role: 'current' },
      ],
    },
  },
  {
    id: 2,
    message: 'left side is shorter — move left inward (keeping the short wall cannot help as width shrinks).',
    codeFocus: { java: 13, kotlin: 12, python: 13 },
    variables: { left: 0, right: 8, reason: 'height[left] <= height[right]' },
    scene: {
      type: 'array',
      label: 'height',
      values: height,
      pointers: { left: 0, right: 8 },
      highlights: [
        { index: 0, role: 'discard' },
        { index: 8, role: 'window' },
      ],
    },
  },
  {
    id: 3,
    message: 'left=1, right=8. Area = min(8,7)*7 = 49 — new best.',
    codeFocus: { java: 11, kotlin: 11, python: 11 },
    variables: { left: 1, right: 8, area: 49, best: 49 },
    scene: {
      type: 'array',
      label: 'height',
      values: height,
      pointers: { left: 1, right: 8 },
      highlights: [
        { index: 1, role: 'found' },
        { index: 8, role: 'found' },
      ],
    },
  },
  {
    id: 4,
    message: 'Now right is shorter (7 < 8) — move right inward and keep searching.',
    codeFocus: { java: 15, kotlin: 12, python: 15 },
    variables: { left: 1, right: 8, best: 49 },
    scene: {
      type: 'array',
      label: 'height',
      values: height,
      pointers: { left: 1, right: 8 },
      highlights: [
        { index: 1, role: 'window' },
        { index: 8, role: 'discard' },
      ],
    },
  },
  {
    id: 5,
    message: 'Continue until pointers meet. Best stays 49 — the answer.',
    codeFocus: { java: 18, kotlin: 14, python: 16 },
    variables: { best: 49, result: 49 },
    scene: {
      type: 'array',
      label: 'height',
      values: height,
      pointers: { left: 1, right: 8 },
      highlights: [
        { index: 1, role: 'found' },
        { index: 8, role: 'found' },
      ],
    },
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
  benchmark: placeholderBenchmark(
    'One pass beats the O(n²) brute-force double loop by a huge constant-factor margin.',
  ),
  walkthrough: {
    statement:
      "Given heights, choose two lines that form a container holding the most water.",
    keyIdea:
      "Area = min(h[L],h[R]) * (R-L). Move the shorter pointer inward.",
    approach: [
          "Start with widest container.",
          "Track max area.",
          "Advance the shorter side; stop when pointers meet."
    ],
  },
}
