/**
 * LeetCode #20 — Valid Parentheses.
 * Demo: s = "()[]{}" — every character is its own step (push or pop).
 */
import javaSrc from '../../algorithms/0020-valid-parentheses/Solution.java?raw'
import kotlinSrc from '../../algorithms/0020-valid-parentheses/Solution.kt?raw'
import pythonSrc from '../../algorithms/0020-valid-parentheses/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const chars = ['(', ')', '[', ']', '{', '}']

const L = {
  enter: { java: 11, kotlin: 7, python: 7 },
  push: { java: 14, kotlin: 10, python: 10 },
  pop: { java: 17, kotlin: 13, python: 12 },
  ret: { java: 21, kotlin: 15, python: 14 },
} as const

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Enter isValid. Build the closer→opener map and an empty stack.',
    why: 'LIFO memory is what enforces matching order.',
    codeFocus: L.enter,
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: { s: { ref: 's' }, stack: { ref: 'stack' } },
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
    narrative: 'i=0, ch="(" — not a closer → push onto the stack.',
    why: 'Remember the opener until its match arrives.',
    codeFocus: L.push,
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: { s: { ref: 's' }, stack: { ref: 'stack' }, ch: '(' },
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
    narrative: 'i=1, ch=")" — closer. Pop "(" and confirm it matches.',
    why: 'Empty stack or wrong opener would return false here.',
    codeFocus: L.pop,
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
        focused: true,
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
    narrative: 'i=2, ch="[" — opener → push.',
    why: 'Next pair is independent; stack may grow again.',
    codeFocus: L.push,
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: { s: { ref: 's' }, stack: { ref: 'stack' }, ch: '[' },
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
          { index: 1, role: 'visited' },
          { index: 2, role: 'current' },
        ],
        pointers: { i: 2 },
        focused: true,
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
    narrative: 'i=3, ch="]" — closer. Pop "[" — match.',
    why: 'Same pop-and-compare rule for every closer type.',
    codeFocus: L.pop,
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: {
          s: { ref: 's' },
          stack: { ref: 'stack' },
          ch: ']',
          popped: '[',
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
          { index: 1, role: 'visited' },
          { index: 2, role: 'visited' },
          { index: 3, role: 'current' },
        ],
        pointers: { i: 3 },
        focused: true,
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
    id: 6,
    narrative: 'i=4, ch="{" — opener → push.',
    why: 'Last pair still has to run through the same loop body.',
    codeFocus: L.push,
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: { s: { ref: 's' }, stack: { ref: 'stack' }, ch: '{' },
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
          { index: 1, role: 'visited' },
          { index: 2, role: 'visited' },
          { index: 3, role: 'visited' },
          { index: 4, role: 'current' },
        ],
        pointers: { i: 4 },
        focused: true,
      },
      {
        id: 'stack',
        kind: 'stack',
        label: 'Deque stack',
        items: ['{'],
        topAction: 'push',
        focused: true,
      },
    ],
  },
  {
    id: 7,
    narrative: 'i=5, ch="}" — closer. Pop "{" — match.',
    why: 'Final closer clears the stack.',
    codeFocus: L.pop,
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: {
          s: { ref: 's' },
          stack: { ref: 'stack' },
          ch: '}',
          popped: '{',
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
          { index: 1, role: 'visited' },
          { index: 2, role: 'visited' },
          { index: 3, role: 'visited' },
          { index: 4, role: 'visited' },
          { index: 5, role: 'current' },
        ],
        pointers: { i: 5 },
        focused: true,
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
    id: 8,
    narrative: 'Loop done. Stack is empty → return true.',
    why: 'Any leftover opener would mean an unclosed bracket.',
    codeFocus: L.ret,
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
        highlights: chars.map((_, index) => ({
          index,
          role: 'found' as const,
        })),
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
  /** Every index 0..5 must appear as pointers.i / current highlight in the trace. */
  demoCoverage: { indices: 6 },
  benchmark: placeholderBenchmark(
    'Stack ops are amortized O(1); heap depth mirrors nesting depth of the input.',
  ),
  walkthrough: {
    statement:
      'Given a string of brackets, determine if the input is valid (correctly matched and ordered).',
    keyIdea: 'Stack openers; on a closer, it must match the top opener.',
    approach: [
      'Push opening brackets.',
      'On closing, pop and check the pair; mismatch or empty → false.',
      'Valid iff stack empty at the end.',
    ],
  },
}
