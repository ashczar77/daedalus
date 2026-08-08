/**
 * Quick Sort lab — partition around a pivot with bar highlights.
 */
import javaSrc from '../../algorithms/sort-quick-sort/Solution.java?raw'
import kotlinSrc from '../../algorithms/sort-quick-sort/Solution.kt?raw'
import pythonSrc from '../../algorithms/sort-quick-sort/solution.py?raw'
import type { ArrayHighlight, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'
import {
  packLabel,
  packSteps,
  rangeWindow,
  sortBars,
  sortedHead,
  sortingInput,
} from './sorting/shared'

const L = {
  sort: { java: 13, kotlin: 13, python: 12 },
  partition: { java: 22, kotlin: 23, python: 22 },
  swap: { java: 24, kotlin: 25, python: 23 },
} as const

function generateSteps(input: number[]): Step[] {
  const a = [...input]
  const n = a.length
  const steps: Step[] = []
  let id = 1

  steps.push({
    id: id++,
    narrative: `Quick Sort on ${n} bars. Partition around a pivot, then recurse.`,
    why: 'Average O(n log n); pivot choice (here: last element) affects balance.',
    codeFocus: L.sort,
    callStack: [{ name: 'quickSort', active: true, locals: { a: { ref: 'a' }, n } }],
    heap: [sortBars(a)],
  })

  function partition(lo: number, hi: number): number {
    const pivot = a[hi]!
    steps.push({
      id: id++,
      narrative: `Partition [${lo}..${hi}] with pivot a[${hi}]=${pivot}.`,
      why: 'Values < pivot move left of the final pivot index.',
      codeFocus: L.partition,
      callStack: [
        {
          name: 'partition',
          active: true,
          locals: { a: { ref: 'a' }, lo, hi, pivot },
        },
      ],
      heap: [
        sortBars(
          a,
          [...rangeWindow(lo, hi), { index: hi, role: 'found' }],
          { left: lo, right: hi },
        ),
      ],
    })

    let i = lo
    for (let j = lo; j < hi; j++) {
      if (a[j]! < pivot) {
        if (i !== j) {
          ;[a[i], a[j]] = [a[j]!, a[i]!]
          steps.push({
            id: id++,
            narrative: `a[${j}]=${a[i]} < pivot — swap with a[${i}].`,
            why: 'Grow the “less than pivot” region.',
            codeFocus: L.swap,
            callStack: [
              {
                name: 'partition',
                active: true,
                locals: { a: { ref: 'a' }, lo, hi, pivot, i, j },
              },
            ],
            heap: [
              sortBars(
                a,
                [
                  ...rangeWindow(lo, hi),
                  { index: hi, role: 'found' },
                  { index: i, role: 'compare' },
                  { index: j, role: 'compare' },
                ],
                { i, j },
              ),
            ],
          })
        }
        i += 1
      }
    }
    ;[a[i], a[hi]] = [a[hi]!, a[i]!]
    const highlights: ArrayHighlight[] = [
      ...rangeWindow(lo, hi),
      { index: i, role: 'found' },
    ]
    steps.push({
      id: id++,
      narrative: `Place pivot ${pivot} at index ${i}. Left side < pivot, right side ≥ pivot.`,
      why: 'Pivot is in final sorted position; recurse on the two sides.',
      codeFocus: L.swap,
      callStack: [
        {
          name: 'partition',
          active: true,
          locals: { a: { ref: 'a' }, lo, hi, p: i, pivot },
        },
      ],
      heap: [sortBars(a, highlights, { i })],
    })
    return i
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const p = partition(lo, hi)
    sort(lo, p - 1)
    sort(p + 1, hi)
  }

  if (n >= 2) sort(0, n - 1)

  steps.push({
    id: id++,
    narrative: 'Done — every pivot placement finished the sort.',
    why: 'When both sides of every pivot are sorted, the array is sorted.',
    codeFocus: L.sort,
    callStack: [{ name: 'quickSort', active: true, locals: { a: { ref: 'a' }, result: 'sorted' } }],
    heap: [sortBars(a, sortedHead(n, n))],
  })

  return steps
}

const input = sortingInput(generateSteps)

export const quickSort: ProblemPack = {
  id: 'sort-quick-sort',
  lcNumber: 0,
  title: 'Quick Sort',
  pattern: 'Sorting',
  difficulty: 'Medium',
  insight: 'Partition around a pivot so it sits in final position, then recurse on both sides.',
  invariant: 'After partition, a[p] is finalized; left values are < pivot, right are ≥ pivot.',
  complexity: {
    time: 'O(n log n) average, O(n²) worst',
    space: 'O(log n)',
    notes: 'Worst case on already-sorted data with last-element pivot.',
  },
  inputLabel: packLabel(input),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: packSteps(input),
  input,
  benchmark: placeholderBenchmark(
    'Usually fastest in practice among comparison sorts; watch degenerate pivots.',
  ),
  walkthrough: {
    statement: 'Sort an integer array in non-decreasing order using Quick Sort.',
    keyIdea: 'Partition, then recurse — the pivot never moves again.',
    approach: [
      'Choose pivot (here: a[hi]).',
      'Swap smaller values leftward; place pivot.',
      'Recurse on [lo..p-1] and [p+1..hi].',
    ],
  },
}
