/**
 * LeetCode #20 — Valid Parentheses.
 * Steps generated from validated bracket string (Phase 4).
 */
import javaSrc from '../../algorithms/0020-valid-parentheses/Solution.java?raw'
import kotlinSrc from '../../algorithms/0020-valid-parentheses/Solution.kt?raw'
import pythonSrc from '../../algorithms/0020-valid-parentheses/solution.py?raw'
import { defineInput, parseString } from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

/** Default demo — name kept for validate:traces index coverage. */
const defaultS = '()[]{}'

const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
const CLOSERS = new Set(Object.keys(PAIRS))

const L = {
  enter: { java: 11, kotlin: 7, python: 7 },
  push: { java: 14, kotlin: 10, python: 10 },
  pop: { java: 17, kotlin: 13, python: 12 },
  fail: { java: 18, kotlin: 13, python: 13 },
  ret: { java: 21, kotlin: 15, python: 14 },
} as const

function isCloser(ch: string): boolean {
  return CLOSERS.has(ch)
}

function stringHeap(
  chars: string[],
  i: number | null,
  highlights: ArrayHighlight[],
): HeapObject {
  return {
    id: 's',
    kind: 'array',
    label: 'char[] s',
    values: chars,
    ...(i != null ? { pointers: { i }, highlights } : { highlights }),
    focused: true,
  }
}

function stackHeap(items: string[], topAction?: 'push' | 'pop'): HeapObject {
  return {
    id: 'stack',
    kind: 'stack',
    label: 'Deque stack',
    items: [...items],
    ...(topAction ? { topAction } : {}),
    focused: true,
  }
}

function visitedThrough(i: number): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let j = 0; j < i; j++) out.push({ index: j, role: 'visited' })
  out.push({ index: i, role: 'current' })
  return out
}

function generateValidParenthesesSteps(s: string): Step[] {
  const chars = [...s]
  const steps: Step[] = []
  let id = 1
  const stack: string[] = []

  steps.push({
    id: id++,
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
    heap: [stringHeap(chars, s.length > 0 ? 0 : null, []), stackHeap([])],
  })

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!

    if (!isCloser(ch)) {
      stack.push(ch)
      steps.push({
        id: id++,
        narrative: `i=${i}, ch="${ch}" — not a closer → push onto the stack.`,
        why: 'Remember the opener until its match arrives.',
        codeFocus: L.push,
        callStack: [
          {
            name: 'isValid',
            active: true,
            locals: { s: { ref: 's' }, stack: { ref: 'stack' }, i, ch },
          },
        ],
        heap: [stringHeap(chars, i, visitedThrough(i)), stackHeap(stack, 'push')],
      })
      continue
    }

    if (stack.length === 0) {
      steps.push({
        id: id++,
        narrative: `i=${i}, ch="${ch}" — closer but stack is empty → return false.`,
        why: 'Every closer needs a matching opener on top of the stack.',
        codeFocus: L.pop,
        callStack: [
          {
            name: 'isValid',
            active: true,
            locals: { s: { ref: 's' }, stack: { ref: 'stack' }, i, ch, result: false },
          },
        ],
        heap: [stringHeap(chars, i, visitedThrough(i)), stackHeap([])],
      })
      return steps
    }

    const popped = stack.pop()!
    const expected = PAIRS[ch]!
    const match = popped === expected

    steps.push({
      id: id++,
      narrative: match
        ? `i=${i}, ch="${ch}" — closer. Pop "${popped}" and confirm it matches.`
        : `i=${i}, ch="${ch}" — closer. Pop "${popped}" but expected "${expected}" → return false.`,
      why: match
        ? 'Empty stack or wrong opener would return false here.'
        : 'Wrong opener on top means brackets are crossed or mismatched.',
      codeFocus: L.pop,
      callStack: [
        {
          name: 'isValid',
          active: true,
          locals: {
            s: { ref: 's' },
            stack: { ref: 'stack' },
            i,
            ch,
            popped,
            match,
            ...(match ? {} : { result: false }),
          },
        },
      ],
      heap: [stringHeap(chars, i, visitedThrough(i)), stackHeap(stack, 'pop')],
    })

    if (!match) {
      steps.push({
        id: id++,
        narrative: 'Mismatch on pop → return false.',
        why: 'Fail fast — no point scanning the rest of the string.',
        codeFocus: L.fail,
        callStack: [
          {
            name: 'isValid',
            active: true,
            locals: { s: { ref: 's' }, stack: { ref: 'stack' }, result: false },
          },
        ],
        heap: [stringHeap(chars, i, visitedThrough(i)), stackHeap(stack)],
      })
      return steps
    }
  }

  const ok = stack.length === 0
  steps.push({
    id: id++,
    narrative: ok
      ? 'Loop done. Stack is empty → return true.'
      : `Loop done. Stack still holds [${stack.join(', ')}] → return false.`,
    why: ok
      ? 'Any leftover opener would mean an unclosed bracket.'
      : 'Unclosed openers remain — the string cannot be valid.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'isValid',
        active: true,
        locals: {
          s: { ref: 's' },
          stack: { ref: 'stack' },
          result: ok,
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
          role: ok ? ('found' as const) : ('visited' as const),
        })),
        focused: true,
      },
      stackHeap(stack),
    ],
  })

  return steps
}

const input = defineInput<string>({
  kind: 'bracketString',
  fields: [
    {
      key: 's',
      label: 's',
      widget: 'text',
      placeholder: '()[]{}',
      hint: 'Up to 24 characters from ()[]{}',
    },
  ],
  defaultRaw: { s: defaultS },
  parse: (raw) =>
    parseString(raw.s ?? '', {
      name: 's',
      minLen: 0,
      maxLen: 24,
      charset: '()[]{}',
    }),
  formatLabel: (value) => `s = "${value}"`,
  generateSteps: generateValidParenthesesSteps,
  fixtures: [
    { name: 'empty', raw: { s: '' } },
    { name: 'mismatch', raw: { s: '(]' } },
    { name: 'leftover', raw: { s: '(()' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(`Valid Parentheses default input invalid: ${defaultParsed.errors.join('; ')}`)
}

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
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: defaultS.length },
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
