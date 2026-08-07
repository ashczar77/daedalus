/**
 * LeetCode #20 — Valid Parentheses (stack of unmatched opens).
 * Demo: s = "()[]{}" → true.
 */
import javaSrc from '../../algorithms/0020-valid-parentheses/Solution.java?raw'
import kotlinSrc from '../../algorithms/0020-valid-parentheses/Solution.kt?raw'
import pythonSrc from '../../algorithms/0020-valid-parentheses/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const chars = ['(', ')', '[', ']', '{', '}']

const steps: Step[] = [
  {
    id: 1,
    message: 'Read "(" — an opener — push it onto the stack.',
    codeFocus: { java: 14, kotlin: 10, python: 10 },
    variables: { ch: '(', stack: ['('] },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 's',
          values: chars,
          highlights: [{ index: 0, role: 'current' }],
          pointers: { i: 0 },
        },
        { type: 'stack', label: 'stack', items: ['('], topAction: 'push' },
      ],
    },
  },
  {
    id: 2,
    message: 'Read ")" — a closer. Pop "(" and confirm it matches.',
    codeFocus: { java: 17, kotlin: 13, python: 12 },
    variables: { ch: ')', popped: '(', match: true },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 's',
          values: chars,
          highlights: [
            { index: 0, role: 'visited' },
            { index: 1, role: 'current' },
          ],
          pointers: { i: 1 },
        },
        { type: 'stack', label: 'stack', items: [], topAction: 'pop' },
      ],
    },
  },
  {
    id: 3,
    message: 'Same pattern for "[]": push "[", then pop on "]".',
    codeFocus: { java: 14, kotlin: 10, python: 10 },
    variables: { ch: '[', stack: ['['] },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 's',
          values: chars,
          highlights: [{ index: 2, role: 'current' }],
          pointers: { i: 2 },
        },
        { type: 'stack', label: 'stack', items: ['['], topAction: 'push' },
      ],
    },
  },
  {
    id: 4,
    message: 'After "{}" the stack is empty again. Empty stack at the end ⇒ valid.',
    codeFocus: { java: 21, kotlin: 15, python: 14 },
    variables: { result: true },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 's',
          values: chars,
          highlights: chars.map((_, index) => ({ index, role: 'found' as const })),
        },
        { type: 'stack', label: 'stack', items: [] },
      ],
    },
  },
]

export const validParentheses: ProblemPack = {
  id: '0020-valid-parentheses',
  lcNumber: 20,
  title: 'Valid Parentheses',
  pattern: 'Stack',
  difficulty: 'Easy',
  insight: 'LIFO — the last opened bracket must close first. Fail fast on mismatch or empty pop.',
  invariant:
    'Stack holds unmatched open brackets in order; each close must equal the current top.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  inputLabel: 's = "()[]{}"',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark(
    'Stack ops are amortized O(1); Python lists are fine but still slower than JVM ArrayDeque.',
  ),
}
