/**
 * Selection Sort lab — select min of unsorted suffix each pass.
 */
import javaSrc from '../../algorithms/sort-selection-sort/Solution.java?raw'
import kotlinSrc from '../../algorithms/sort-selection-sort/Solution.kt?raw'
import pythonSrc from '../../algorithms/sort-selection-sort/solution.py?raw'
import type { ArrayHighlight, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'
import {
  packLabel,
  packSteps,
  sortBars,
  sortedHead,
  sortingInput,
} from './sorting/shared'

const L = {
  scan: { java: 10, kotlin: 10, python: 9 },
  swap: { java: 15, kotlin: 14, python: 13 },
} as const

function generateSteps(input: number[]): Step[] {
  const a = [...input]
  const n = a.length
  const steps: Step[] = []
  let id = 1

  steps.push({
    id: id++,
    narrative: `Selection Sort on ${n} bars. Each pass locks the next minimum into place.`,
    why: 'Scan the unsorted suffix for the min, then swap it to the front of that suffix.',
    codeFocus: L.scan,
    callStack: [{ name: 'selectionSort', active: true, locals: { a: { ref: 'a' }, n } }],
    heap: [sortBars(a)],
  })

  for (let i = 0; i < n - 1; i++) {
    let min = i
    for (let j = i + 1; j < n; j++) {
      if (a[j]! < a[min]!) {
        min = j
        const highlights: ArrayHighlight[] = [
          ...sortedHead(n, i),
          { index: i, role: 'window' },
          { index: min, role: 'found' },
          { index: j, role: 'compare' },
        ]
        steps.push({
          id: id++,
          narrative: `New minimum candidate a[${min}]=${a[min]} while scanning j=${j}.`,
          why: 'Track the smallest value seen so far in the unsorted suffix.',
          codeFocus: L.scan,
          callStack: [
            {
              name: 'selectionSort',
              active: true,
              locals: { a: { ref: 'a' }, i, j, min },
            },
          ],
          heap: [sortBars(a, highlights, { i, j, min })],
        })
      }
    }
    if (min !== i) {
      ;[a[i], a[min]] = [a[min]!, a[i]!]
      steps.push({
        id: id++,
        narrative: `Swap a[${i}] with min a[${min}] → lock ${a[i]} at index ${i}.`,
        why: 'Position i is now finalized; sorted prefix grows by one.',
        codeFocus: L.swap,
        callStack: [
          {
            name: 'selectionSort',
            active: true,
            locals: { a: { ref: 'a' }, i, min },
          },
        ],
        heap: [
          sortBars(
            a,
            [...sortedHead(n, i + 1), { index: i, role: 'found' }],
            { i, min },
          ),
        ],
      })
    } else {
      steps.push({
        id: id++,
        narrative: `a[${i}]=${a[i]} was already the minimum — no swap.`,
        why: 'Still extend the sorted prefix.',
        codeFocus: L.swap,
        callStack: [
          {
            name: 'selectionSort',
            active: true,
            locals: { a: { ref: 'a' }, i, min },
          },
        ],
        heap: [sortBars(a, sortedHead(n, i + 1))],
      })
    }
  }

  steps.push({
    id: id++,
    narrative: 'Done — every position has been selected into place.',
    why: 'Selection Sort always does ~n passes over shrinking suffixes.',
    codeFocus: L.swap,
    callStack: [{ name: 'selectionSort', active: true, locals: { a: { ref: 'a' }, result: 'sorted' } }],
    heap: [sortBars(a, sortedHead(n, n))],
  })

  return steps
}

const input = sortingInput(generateSteps)

export const selectionSort: ProblemPack = {
  id: 'sort-selection-sort',
  lcNumber: 0,
  title: 'Selection Sort',
  pattern: 'Sorting',
  difficulty: 'Easy',
  insight: 'Repeatedly select the minimum of the unsorted suffix and swap it into the next slot.',
  invariant: 'After pass i, a[0..i] holds the i+1 smallest elements in order.',
  complexity: { time: 'O(n²)', space: 'O(1)', notes: 'Swap count is at most n−1.' },
  inputLabel: packLabel(input),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: packSteps(input),
  input,
  benchmark: placeholderBenchmark(
    'Always Θ(n²) compares — no early exit like Bubble Sort’s swapped flag.',
  ),
  walkthrough: {
    statement: 'Sort an integer array in non-decreasing order using Selection Sort.',
    keyIdea: 'Find the min of the unsorted part; swap it to the front of that part.',
    approach: [
      'For i from 0..n-2:',
      'Scan j=i+1..n-1 for the index of the minimum.',
      'Swap a[i] with a[min].',
    ],
  },
}
