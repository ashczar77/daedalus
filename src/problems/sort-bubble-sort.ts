/**
 * Bubble Sort lab — adjacent swaps with bar visualization.
 */
import javaSrc from '../../algorithms/sort-bubble-sort/Solution.java?raw'
import kotlinSrc from '../../algorithms/sort-bubble-sort/Solution.kt?raw'
import pythonSrc from '../../algorithms/sort-bubble-sort/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'
import {
  packLabel,
  packSteps,
  sortBars,
  sortedTail,
  sortingInput,
} from './sorting/shared'

const L = {
  loop: { java: 11, kotlin: 12, python: 10 },
  swap: { java: 13, kotlin: 14, python: 11 },
  done: { java: 18, kotlin: 18, python: 14 },
} as const

function generateSteps(input: number[]): Step[] {
  const a = [...input]
  const n = a.length
  const steps: Step[] = []
  let id = 1

  steps.push({
    id: id++,
    narrative: `Bubble Sort on ${n} bars. Each pass floats the next largest value to the end.`,
    why: 'Adjacent compares: if out of order, swap. Sorted suffix grows from the right.',
    codeFocus: L.loop,
    callStack: [{ name: 'bubbleSort', active: true, locals: { a: { ref: 'a' }, n } }],
    heap: [sortBars(a)],
  })

  for (let end = n - 1; end > 0; end--) {
    let swapped = false
    for (let i = 0; i < end; i++) {
      if (a[i]! > a[i + 1]!) {
        const left = a[i]!
        const right = a[i + 1]!
        ;[a[i], a[i + 1]] = [right, left]
        swapped = true
        steps.push({
          id: id++,
          narrative: `a[${i}]=${left} > a[${i + 1}]=${right} — swap.`,
          why: 'Out of order neighbors: swap so the larger value moves right.',
          codeFocus: L.swap,
          callStack: [
            {
              name: 'bubbleSort',
              active: true,
              locals: { a: { ref: 'a' }, i, end, swapped: true },
            },
          ],
          heap: [
            sortBars(
              a,
              [
                ...sortedTail(n, end + 1),
                { index: i, role: 'compare' },
                { index: i + 1, role: 'compare' },
              ],
              { i, j: i + 1 },
            ),
          ],
        })
      }
    }
    steps.push({
      id: id++,
      narrative: swapped
        ? `Pass complete — a[${end}]=${a[end]} is in final place.`
        : `No swaps this pass — array already sorted. Stop early.`,
      why: swapped
        ? 'Everything after end is sorted; next pass ignores that suffix.'
        : 'Early exit when a pass makes no swaps.',
      codeFocus: L.done,
      callStack: [
        {
          name: 'bubbleSort',
          active: true,
          locals: { a: { ref: 'a' }, end, swapped },
        },
      ],
      heap: [sortBars(a, sortedTail(n, end))],
    })
    if (!swapped) break
  }

  steps.push({
    id: id++,
    narrative: 'Done — every bar is in non-decreasing order.',
    why: 'Bubble Sort finishes when the sorted suffix covers the whole array.',
    codeFocus: L.done,
    callStack: [{ name: 'bubbleSort', active: true, locals: { a: { ref: 'a' }, result: 'sorted' } }],
    heap: [sortBars(a, sortedTail(n, 0))],
  })

  return steps
}

const input = sortingInput(generateSteps)

export const bubbleSort: ProblemPack = {
  id: 'sort-bubble-sort',
  lcNumber: 0,
  title: 'Bubble Sort',
  pattern: 'Sorting',
  difficulty: 'Easy',
  insight: 'Repeated adjacent swaps push larger values toward the end; sorted suffix grows each pass.',
  invariant: 'After pass k, the last k elements are in final sorted position.',
  complexity: { time: 'O(n²)', space: 'O(1)', notes: 'Early exit when a pass does no swaps.' },
  inputLabel: packLabel(input),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: packSteps(input),
  input,
  benchmark: placeholderBenchmark(
    'Quadratic compares dominate; fine for tiny n, too slow for large arrays vs O(n log n) sorts.',
  ),
  walkthrough: {
    statement: 'Sort an integer array in non-decreasing order using Bubble Sort.',
    keyIdea: 'Compare neighbors; swap if out of order; shrink the unsorted prefix each pass.',
    approach: [
      'For end from n-1 down to 1:',
      'Scan i=0..end-1; swap a[i] and a[i+1] when a[i] > a[i+1].',
      'If a pass does no swaps, stop early.',
    ],
  },
}
