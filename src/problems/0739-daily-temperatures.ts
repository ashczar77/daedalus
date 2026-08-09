/**
 * LeetCode #739 - Daily Temperatures (monotonic stack of day indices).
 * Steps generated from validated temperatures input (Phase 4).
 */
import javaSrc from '../../algorithms/0739-daily-temperatures/Solution.java?raw'
import kotlinSrc from '../../algorithms/0739-daily-temperatures/Solution.kt?raw'
import pythonSrc from '../../algorithms/0739-daily-temperatures/solution.py?raw'
import { defineInput, formatIntList, parseIntList } from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

/** Classic LC demo - name kept for validate:traces index coverage. */
const temperatures = [73, 74, 75, 71, 69, 72, 76, 73]

const L = {
  enter: { java: 11, kotlin: 8, python: 8 },
  pop: { java: 14, kotlin: 11, python: 11 },
  push: { java: 17, kotlin: 14, python: 13 },
  ret: { java: 19, kotlin: 16, python: 14 },
} as const

function tempsHeap(
  values: number[],
  i: number | null,
  highlights: ArrayHighlight[],
): HeapObject {
  return {
    id: 'temperatures',
    kind: 'array',
    label: 'int[] temperatures',
    values: [...values],
    ...(i != null ? { pointers: { i }, highlights } : { highlights }),
    focused: true,
  }
}

function answerHeap(values: number[], highlights: ArrayHighlight[] = []): HeapObject {
  return {
    id: 'answer',
    kind: 'array',
    label: 'int[] answer',
    values: [...values],
    highlights,
    focused: true,
  }
}

function stackHeap(items: number[], topAction?: 'push' | 'pop'): HeapObject {
  return {
    id: 'stack',
    kind: 'stack',
    label: 'Deque stack (indices)',
    items: [...items],
    ...(topAction ? { topAction } : {}),
    focused: true,
  }
}

function dayHighlights(
  i: number,
  stack: number[],
  resolved?: number,
): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let j = 0; j < i; j++) {
    if (stack.includes(j)) out.push({ index: j, role: 'window' })
    else out.push({ index: j, role: 'visited' })
  }
  out.push({ index: i, role: 'current' })
  if (resolved != null) out.push({ index: resolved, role: 'found' })
  return out
}

function generateDailyTemperaturesSteps(temps: number[]): Step[] {
  const n = temps.length
  const answer = Array.from({ length: n }, () => 0)
  const stack: number[] = []
  const steps: Step[] = []
  let id = 1

  steps.push({
    id: id++,
    narrative: `Enter dailyTemperatures. Allocate answer[0..${Math.max(0, n - 1)}] = 0 and an empty index stack.`,
    why: 'Each index waits on the stack until a strictly warmer day resolves its wait.',
    codeFocus: L.enter,
    callStack: [
      {
        name: 'dailyTemperatures',
        active: true,
        locals: {
          temperatures: { ref: 'temperatures' },
          answer: { ref: 'answer' },
          stack: { ref: 'stack' },
        },
      },
    ],
    heap: [
      tempsHeap(temps, n > 0 ? 0 : null, []),
      answerHeap(answer),
      stackHeap([]),
    ],
  })

  for (let i = 0; i < n; i++) {
    const t = temps[i]!

    while (stack.length > 0 && temps[stack[stack.length - 1]!]! < t) {
      const j = stack.pop()!
      answer[j] = i - j
      steps.push({
        id: id++,
        narrative: `i=${i} temp=${t} > temps[${j}]=${temps[j]} → pop ${j}, answer[${j}]=${i}-${j}=${answer[j]}.`,
        why: 'The first warmer day after j is i; store the wait in days.',
        codeFocus: L.pop,
        callStack: [
          {
            name: 'dailyTemperatures',
            active: true,
            locals: {
              temperatures: { ref: 'temperatures' },
              answer: { ref: 'answer' },
              stack: { ref: 'stack' },
              i,
              j,
              wait: answer[j],
            },
          },
        ],
        heap: [
          tempsHeap(temps, i, dayHighlights(i, stack, j)),
          answerHeap(answer, [{ index: j, role: 'found' }]),
          stackHeap(stack, 'pop'),
        ],
      })
    }

    stack.push(i)
    steps.push({
      id: id++,
      narrative: `i=${i} temp=${t} - no warmer day yet for this index → push ${i}.`,
      why: 'Keep a decreasing chain of unresolved days; later warmer temps will pop them.',
      codeFocus: L.push,
      callStack: [
        {
          name: 'dailyTemperatures',
          active: true,
          locals: {
            temperatures: { ref: 'temperatures' },
            answer: { ref: 'answer' },
            stack: { ref: 'stack' },
            i,
            t,
          },
        },
      ],
      heap: [
        tempsHeap(temps, i, dayHighlights(i, stack)),
        answerHeap(answer),
        stackHeap(stack, 'push'),
      ],
    })
  }

  steps.push({
    id: id++,
    narrative: `Scan complete. Remaining stack indices never see a warmer day (answer stays 0). Return answer=[${answer.join(', ')}].`,
    why: 'Monotonic stack guarantees each day is pushed and popped at most once → O(n).',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'dailyTemperatures',
        active: true,
        locals: {
          temperatures: { ref: 'temperatures' },
          answer: { ref: 'answer' },
          stack: { ref: 'stack' },
          result: { ref: 'answer' },
        },
      },
    ],
    heap: [
      tempsHeap(temps, null, []),
      answerHeap(
        answer,
        answer.map((v, index) =>
          v > 0
            ? { index, role: 'found' as const }
            : { index, role: 'visited' as const },
        ),
      ),
      stackHeap(stack),
    ],
  })

  return steps
}

const input = defineInput<number[]>({
  kind: 'intArray',
  fields: [
    {
      key: 'temperatures',
      label: 'temperatures',
      widget: 'text',
      placeholder: '73, 74, 75, 71, 69, 72, 76, 73',
      hint: 'Up to 16 integers from 30-100',
    },
  ],
  defaultRaw: { temperatures: formatIntList(temperatures) },
  parse: (raw) =>
    parseIntList(raw.temperatures ?? '', {
      name: 'temperatures',
      minLen: 0,
      maxLen: 16,
      minVal: 30,
      maxVal: 100,
    }),
  formatLabel: (value) => `temperatures = [${value.join(', ')}]`,
  generateSteps: generateDailyTemperaturesSteps,
  fixtures: [
    { name: 'empty', raw: { temperatures: '' } },
    { name: 'strictly-decreasing', raw: { temperatures: '80, 70, 60, 50' } },
    { name: 'strictly-increasing', raw: { temperatures: '50, 60, 70, 80' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Daily Temperatures default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const dailyTemperatures: ProblemPack = {
  id: '0739-daily-temperatures',
  lcNumber: 739,
  title: 'Daily Temperatures',
  pattern: 'Stack',
  difficulty: 'Medium',
  insight:
    'Keep a decreasing stack of day indices; when a warmer day arrives, pop and fill waits.',
  invariant:
    'Stack indices have decreasing temperatures; answer[j] is set exactly when the next warmer day after j is found.',
  complexity: { time: 'O(n)', space: 'O(n)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: temperatures.length },
  benchmark: placeholderBenchmark(
    'Monotonic stack is linear; nested “next warmer day” scans are quadratic.',
  ),
  walkthrough: {
    statement:
      'For each day, return how many days you wait until a warmer temperature (0 if none).',
    keyIdea:
      'Unresolved colder days sit on a stack; the first warmer day resolves them in LIFO order.',
    approach: [
      'answer = zeros; stack = empty index deque.',
      'For each day i: while top is colder than today, pop and set answer[top] = i - top.',
      'Push i. Leftover indices stay 0.',
    ],
  },
}
