/**
 * LeetCode #150 — Evaluate Reverse Polish Notation (operand stack).
 * Demo: tokens = ["2","1","+","3","*"] → ((2+1)*3) = 9.
 */
import javaSrc from '../../algorithms/0150-evaluate-reverse-polish-notation/Solution.java?raw'
import kotlinSrc from '../../algorithms/0150-evaluate-reverse-polish-notation/Solution.kt?raw'
import pythonSrc from '../../algorithms/0150-evaluate-reverse-polish-notation/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const tokens = ['2', '1', '+', '3', '*']

const steps: Step[] = [
  {
    id: 1,
    message: 'Token "2" is an operand — push 2.',
    codeFocus: { java: 14, kotlin: 10, python: 10 },
    variables: { token: '2', stack: [2] },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'tokens',
          values: tokens,
          highlights: [{ index: 0, role: 'current' }],
          pointers: { i: 0 },
        },
        { type: 'stack', label: 'stack', items: [2], topAction: 'push' },
      ],
    },
  },
  {
    id: 2,
    message: 'Push 1. Stack is [2, 1] (top = 1).',
    codeFocus: { java: 14, kotlin: 10, python: 10 },
    variables: { token: '1', stack: [2, 1] },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'tokens',
          values: tokens,
          highlights: [
            { index: 0, role: 'visited' },
            { index: 1, role: 'current' },
          ],
          pointers: { i: 1 },
        },
        { type: 'stack', label: 'stack', items: [2, 1], topAction: 'push' },
      ],
    },
  },
  {
    id: 3,
    message: 'Operator "+": pop a=1, pop b=2, push b+a = 3.',
    codeFocus: { java: 20, kotlin: 16, python: 15 },
    variables: { token: '+', a: 1, b: 2, pushed: 3 },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'tokens',
          values: tokens,
          highlights: [{ index: 2, role: 'current' }],
          pointers: { i: 2 },
        },
        { type: 'stack', label: 'stack', items: [3], topAction: 'push' },
      ],
    },
  },
  {
    id: 4,
    message: 'Push 3. Stack is [3, 3].',
    codeFocus: { java: 14, kotlin: 10, python: 10 },
    variables: { token: '3', stack: [3, 3] },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'tokens',
          values: tokens,
          highlights: [{ index: 3, role: 'current' }],
          pointers: { i: 3 },
        },
        { type: 'stack', label: 'stack', items: [3, 3], topAction: 'push' },
      ],
    },
  },
  {
    id: 5,
    message: 'Operator "*": pop a=3, pop b=3, push 9. Final result is 9.',
    codeFocus: { java: 22, kotlin: 18, python: 19 },
    variables: { token: '*', a: 3, b: 3, result: 9 },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'tokens',
          values: tokens,
          highlights: [{ index: 4, role: 'found' }],
          pointers: { i: 4 },
        },
        { type: 'stack', label: 'stack', items: [9], topAction: 'push' },
      ],
    },
  },
]

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
  inputLabel: 'tokens = ["2","1","+","3","*"]',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark(
    'Single left-to-right pass; stack depth stays small for typical RPN expressions.',
  ),
  walkthrough: {
    statement:
      "Evaluate the value of an arithmetic expression in Reverse Polish Notation.",
    keyIdea:
      "Stack operands; when an operator appears, pop two, push the result.",
    approach: [
          "Scan tokens left to right.",
          "Numbers push; operators pop b,a and push a⊗b.",
          "Final stack top is the answer."
    ],
  },
}
