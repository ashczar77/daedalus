/**
 * LeetCode #20 — Valid Parentheses.
 * Storytelling pack: call-stack locals + heap stack growing/shrinking.
 * Demo: s = "()[]{}".
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
    narrative: 'Enter isValid. Allocate an empty stack on the heap for unmatched openers.',
    why: 'Parentheses must close in LIFO order — a stack is the natural memory shape for that rule.',
    codeFocus: { java: 11, kotlin: 7, python: 7 },
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: {
          s: { ref: 's' },
          stack: { ref: 'stack' },
        },
      },
    ],
    heap: [
      {
        id: 's',
        kind: 'array',
        label: 'char[] s',
        values: chars,
        focused: true,
      },
      {
        id: 'stack',
        kind: 'stack',
        label: 'Deque stack',
        items: [],
        focused: true,
      },
    ],
  },
  {
    id: 2,
    narrative: 'Read "(" — not a closer — push it onto the heap stack.',
    why: 'We must remember this opener until a matching closer arrives.',
    codeFocus: { java: 14, kotlin: 10, python: 10 },
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: {
          s: { ref: 's' },
          stack: { ref: 'stack' },
          ch: '(',
        },
      },
    ],
    heap: [
      {
        id: 's',
        kind: 'array',
        label: 'char[] s',
        values: chars,
        highlights: [{ index: 0, role: 'current' }],
        pointers: { i: 0 },
        focused: true,
      },
      {
        id: 'stack',
        kind: 'stack',
        label: 'Deque stack',
        items: ['('],
        topAction: 'push',
        focused: true,
      },
    ],
  },
  {
    id: 3,
    narrative: 'Read ")". Pop the stack top "(" and confirm it matches the closer.',
    why: 'A mismatch or empty pop would fail immediately — the invariant held.',
    codeFocus: { java: 17, kotlin: 13, python: 12 },
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: {
          s: { ref: 's' },
          stack: { ref: 'stack' },
          ch: ')',
          popped: '(',
          match: true,
        },
      },
    ],
    heap: [
      {
        id: 's',
        kind: 'array',
        label: 'char[] s',
        values: chars,
        highlights: [
          { index: 0, role: 'visited' },
          { index: 1, role: 'current' },
        ],
        pointers: { i: 1 },
      },
      {
        id: 'stack',
        kind: 'stack',
        label: 'Deque stack',
        items: [],
        topAction: 'pop',
        focused: true,
      },
    ],
  },
  {
    id: 4,
    narrative: 'Same story for "[": push onto the heap stack.',
    why: 'Each nested/sequential opener claims a new stack frame slot until closed.',
    codeFocus: { java: 14, kotlin: 10, python: 10 },
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: {
          s: { ref: 's' },
          stack: { ref: 'stack' },
          ch: '[',
        },
      },
    ],
    heap: [
      {
        id: 's',
        kind: 'array',
        label: 'char[] s',
        values: chars,
        highlights: [{ index: 2, role: 'current' }],
        pointers: { i: 2 },
      },
      {
        id: 'stack',
        kind: 'stack',
        label: 'Deque stack',
        items: ['['],
        topAction: 'push',
        focused: true,
      },
    ],
  },
  {
    id: 5,
    narrative: 'After "[]{}" complete, the heap stack is empty — return true.',
    why: 'Empty stack means every opener found its closer in the correct order.',
    codeFocus: { java: 21, kotlin: 15, python: 14 },
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: {
          s: { ref: 's' },
          stack: { ref: 'stack' },
          result: true,
        },
      },
    ],
    heap: [
      {
        id: 's',
        kind: 'array',
        label: 'char[] s',
        values: chars,
        highlights: chars.map((_, index) => ({ index, role: 'found' as const })),
      },
      {
        id: 'stack',
        kind: 'stack',
        label: 'Deque stack',
        items: [],
        focused: true,
      },
    ],
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
    'Stack ops are amortized O(1); heap depth mirrors nesting depth of the input.',
  ),
}
