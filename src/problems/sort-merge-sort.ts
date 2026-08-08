/**
 * Merge Sort lab — divide, conquer, merge with bar windows.
 */
import javaSrc from '../../algorithms/sort-merge-sort/Solution.java?raw'
import kotlinSrc from '../../algorithms/sort-merge-sort/Solution.kt?raw'
import pythonSrc from '../../algorithms/sort-merge-sort/solution.py?raw'
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
  merge: { java: 25, kotlin: 26, python: 24 },
} as const

function generateSteps(input: number[]): Step[] {
  const a = [...input]
  const n = a.length
  const steps: Step[] = []
  let id = 1
  const tmp = new Array<number>(n)

  steps.push({
    id: id++,
    narrative: `Merge Sort on ${n} bars. Divide until singles, then merge ordered runs.`,
    why: 'Guaranteed O(n log n) — work is in the merges, not the splits.',
    codeFocus: L.sort,
    callStack: [{ name: 'mergeSort', active: true, locals: { a: { ref: 'a' }, n } }],
    heap: [sortBars(a)],
  })

  function merge(lo: number, mid: number, hi: number) {
    for (let k = lo; k <= hi; k++) tmp[k] = a[k]!
    let i = lo
    let j = mid + 1
    for (let k = lo; k <= hi; k++) {
      if (i > mid) a[k] = tmp[j++]!
      else if (j > hi) a[k] = tmp[i++]!
      else if (tmp[j]! < tmp[i]!) a[k] = tmp[j++]!
      else a[k] = tmp[i++]!
    }
    const highlights: ArrayHighlight[] = [
      ...rangeWindow(lo, hi).map((h) =>
        h.index <= mid
          ? { index: h.index, role: 'window' as const }
          : { index: h.index, role: 'compare' as const },
      ),
    ]
    steps.push({
      id: id++,
      narrative: `Merge [${lo}..${mid}] with [${mid + 1}..${hi}] into sorted run [${lo}..${hi}].`,
      why: 'Two sorted halves combine linearly using a temporary buffer.',
      codeFocus: L.merge,
      callStack: [
        {
          name: 'merge',
          active: true,
          locals: { a: { ref: 'a' }, lo, mid, hi },
        },
      ],
      heap: [sortBars(a, highlights, { left: lo, right: hi })],
    })
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return
    const mid = lo + Math.floor((hi - lo) / 2)
    steps.push({
      id: id++,
      narrative: `Divide [${lo}..${hi}] at mid=${mid}.`,
      why: 'Recurse on each half before merging.',
      codeFocus: L.sort,
      callStack: [
        {
          name: 'sort',
          active: true,
          locals: { a: { ref: 'a' }, lo, mid, hi },
        },
      ],
      heap: [sortBars(a, rangeWindow(lo, hi), { left: lo, mid, right: hi })],
    })
    sort(lo, mid)
    sort(mid + 1, hi)
    merge(lo, mid, hi)
  }

  if (n >= 2) sort(0, n - 1)

  steps.push({
    id: id++,
    narrative: 'Done — final merge produced a fully sorted array.',
    why: 'Depth of recursion is ~log n; each level moves every element once.',
    codeFocus: L.merge,
    callStack: [{ name: 'mergeSort', active: true, locals: { a: { ref: 'a' }, result: 'sorted' } }],
    heap: [sortBars(a, sortedHead(n, n))],
  })

  return steps
}

const input = sortingInput(generateSteps)

export const mergeSort: ProblemPack = {
  id: 'sort-merge-sort',
  lcNumber: 0,
  title: 'Merge Sort',
  pattern: 'Sorting',
  difficulty: 'Medium',
  insight: 'Divide the array, sort each half, merge the two sorted runs in linear time.',
  invariant: 'After merge(lo,mid,hi), a[lo..hi] is sorted.',
  complexity: { time: 'O(n log n)', space: 'O(n)', notes: 'Needs an auxiliary buffer for merging.' },
  inputLabel: packLabel(input),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: packSteps(input),
  input,
  benchmark: placeholderBenchmark(
    'Stable O(n log n) — predictable, but uses extra memory unlike heapsort/quicksort in-place variants.',
  ),
  walkthrough: {
    statement: 'Sort an integer array in non-decreasing order using Merge Sort.',
    keyIdea: 'Recursively sort halves, then merge two ordered runs.',
    approach: [
      'If lo >= hi, return.',
      'mid = (lo+hi)/2; sort both halves.',
      'Merge the two sorted halves into a[lo..hi].',
    ],
  },
}
