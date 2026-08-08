/**
 * LeetCode #150 — Evaluate Reverse Polish Notation (operand stack).
 * Steps generated from validated tokens (Phase 4).
 */
import javaSrc from '../../algorithms/0150-evaluate-reverse-polish-notation/Solution.java?raw'
import kotlinSrc from '../../algorithms/0150-evaluate-reverse-polish-notation/Solution.kt?raw'
import pythonSrc from '../../algorithms/0150-evaluate-reverse-polish-notation/solution.py?raw'
import { defineInput, parseTokenList } from '../engine/input'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const OPS = new Set(['+', '-', '*', '/'])

type RpnInput = string[]

const defaultTokens = ['2', '1', '+', '3', '*']

const L = {
  push: { java: 14, kotlin: 10, python: 10 },
  op: { java: 17, kotlin: 13, python: 12 },
  ret: { java: 26, kotlin: 22, python: 22 },
} as const

function isOperator(token: string): boolean {
  return OPS.has(token)
}

function applyOp(op: string, b: number, a: number): number {
  switch (op) {
    case '+':
      return b + a
    case '-':
      return b - a
    case '*':
      return b * a
    case '/':
      return Math.trunc(b / a)
    default:
      return 0
  }
}

function validateWellFormedRpn(tokens: string[]): { ok: true } | { ok: false; errors: string[] } {
  let depth = 0
  for (const token of tokens) {
    if (isOperator(token)) {
      if (depth < 2) {
        return {
          ok: false,
          errors: ['Invalid RPN: operator needs two operands on the stack.'],
        }
      }
      depth -= 1
    } else {
      depth += 1
    }
  }
  if (tokens.length > 0 && depth !== 1) {
    return {
      ok: false,
      errors: ['Invalid RPN: expression must leave exactly one value on the stack.'],
    }
  }
  return { ok: true }
}

function tokenHighlights(
  i: number,
  role: 'current' | 'visited' | 'found' = 'current',
): Array<{ index: number; role: 'current' | 'visited' | 'found' }> {
  if (role === 'found') {
    return [{ index: i, role: 'found' }]
  }
  return [
    ...Array.from({ length: i }, (_, idx) => ({ index: idx, role: 'visited' as const })),
    { index: i, role },
  ]
}

function generateEvaluateRpnSteps(tokens: string[]): Step[] {
  const steps: Step[] = []
  let id = 1
  const stack: number[] = []

  steps.push({
    id: id++,
    narrative: 'Enter evalRPN. Allocate an empty operand stack on the heap.',
    why: 'RPN is evaluated left-to-right; operands wait on a stack until an operator arrives.',
    codeFocus: L.push,
    callStack: [
      {
        name: 'evalRPN',
        active: true,
        locals: {
          tokens: { ref: 'tokens' },
          stack: { ref: 'stack' },
        },
      },
    ],
    heap: [
      {
        id: 'tokens',
        kind: 'array',
        label: 'String[] tokens',
        values: tokens,
        focused: true,
      },
      {
        id: 'stack',
        kind: 'stack',
        label: 'Deque<Integer> stack',
        items: [],
        focused: true,
      },
    ],
  })

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!

    if (!isOperator(token)) {
      const value = Number.parseInt(token, 10)
      stack.push(value)
      steps.push({
        id: id++,
        narrative: `Token "${token}" is an operand → push ${value} onto the stack.`,
        why: 'Numbers are deferred work — they stay until combined by a later operator.',
        codeFocus: L.push,
        callStack: [
          {
            name: 'evalRPN',
            active: true,
            locals: {
              tokens: { ref: 'tokens' },
              stack: { ref: 'stack' },
              token,
            },
          },
        ],
        heap: [
          {
            id: 'tokens',
            kind: 'array',
            label: 'String[] tokens',
            values: tokens,
            highlights: tokenHighlights(i),
            pointers: { i },
            focused: true,
          },
          {
            id: 'stack',
            kind: 'stack',
            label: 'Deque stack',
            items: [...stack],
            topAction: 'push',
            focused: true,
          },
        ],
      })
      continue
    }

    const a = stack.pop()!
    const b = stack.pop()!
    const result = applyOp(token, b, a)
    stack.push(result)
    const opDesc =
      token === '+'
        ? `${b} + ${a} = ${result}`
        : token === '-'
          ? `${b} − ${a} = ${result}`
          : token === '*'
            ? `${b} × ${a} = ${result}`
            : `${b} / ${a} = ${result} (truncate toward zero)`

    steps.push({
      id: id++,
      narrative: `Operator "${token}": pop a = ${a}, pop b = ${b}, push ${opDesc}.`,
      why: 'Pop order matters — first pop is the right operand a, second is left operand b.',
      codeFocus: L.op,
      callStack: [
        {
          name: 'evalRPN',
          active: true,
          locals: {
            tokens: { ref: 'tokens' },
            stack: { ref: 'stack' },
            token,
            a,
            b,
            pushed: result,
          },
        },
      ],
      heap: [
        {
          id: 'tokens',
          kind: 'array',
          label: 'String[] tokens',
          values: tokens,
          highlights: tokenHighlights(i),
          pointers: { i },
          focused: true,
        },
        {
          id: 'stack',
          kind: 'stack',
          label: 'Deque stack',
          items: [...stack],
          topAction: 'push',
          focused: true,
        },
      ],
    })
  }

  const answer = stack.length === 1 ? stack[0]! : stack.pop()
  steps.push({
    id: id++,
    narrative: `Stack holds one value → return ${answer}.`,
    why: 'Well-formed RPN always ends with a single evaluated result.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'evalRPN',
        active: true,
        locals: {
          tokens: { ref: 'tokens' },
          stack: { ref: 'stack' },
          result: answer,
        },
      },
    ],
    heap: [
      {
        id: 'tokens',
        kind: 'array',
        label: 'String[] tokens',
        values: tokens,
        highlights:
          tokens.length > 0
            ? tokenHighlights(tokens.length - 1, 'found')
            : undefined,
        pointers: tokens.length > 0 ? { i: tokens.length - 1 } : undefined,
        focused: true,
      },
      {
        id: 'stack',
        kind: 'stack',
        label: 'Deque stack',
        items: answer != null ? [answer] : [],
        topAction: 'peek',
        focused: true,
      },
    ],
  })

  return steps
}

const input = defineInput<RpnInput>({
  kind: 'rpnTokens',
  fields: [
    {
      key: 'tokens',
      label: 'tokens',
      widget: 'text',
      placeholder: '2, 1, +, 3, *',
      hint: 'Comma/space separated integers and + − * / (max 16 tokens)',
    },
  ],
  defaultRaw: { tokens: defaultTokens.join(', ') },
  parse: (raw) => {
    const listResult = parseTokenList(raw.tokens ?? '', { name: 'tokens', maxLen: 16 })
    if (!listResult.ok) return listResult
    const shape = validateWellFormedRpn(listResult.value)
    if (!shape.ok) return shape
    return { ok: true, value: listResult.value }
  },
  formatLabel: (value) =>
    `tokens = [${value.map((t) => `"${t}"`).join(', ')}]`,
  generateSteps: generateEvaluateRpnSteps,
  fixtures: [
    { name: 'too-few-operands', raw: { tokens: '1, +' } },
    { name: 'too-many-operands', raw: { tokens: '1, 2, 3' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Evaluate RPN default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const evaluateReversePolishNotation: ProblemPack = {
  id: '0150-evaluate-reverse-polish-notation',
  lcNumber: 150,
  title: 'Evaluate Reverse Polish Notation',
  pattern: 'Stack',
  difficulty: 'Medium',
  insight:
    'Pop order matters: first pop is the right operand a, second is left operand b; compute b op a. Java `/` truncates toward zero.',
  invariant:
    'Stack holds evaluated operands; each operator consumes the two most recent values and pushes one result.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Single left-to-right pass; stack depth stays small for typical RPN expressions.',
  ),
  walkthrough: {
    statement: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation.',
    keyIdea: 'Stack operands; when an operator appears, pop two, push the result.',
    approach: [
      'Scan tokens left to right.',
      'Numbers push; operators pop b,a and push a⊗b.',
      'Final stack top is the answer.',
    ],
  },
}
