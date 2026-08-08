/**
 * Heap Sort lab — max-heapify then extract maxima to the end.
 */
import javaSrc from '../../algorithms/sort-heap-sort/Solution.java?raw'
import kotlinSrc from '../../algorithms/sort-heap-sort/Solution.kt?raw'
import pythonSrc from '../../algorithms/sort-heap-sort/solution.py?raw'
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
  build: { java: 9, kotlin: 8, python: 8 },
  extract: { java: 13, kotlin: 11, python: 11 },
  sift: { java: 24, kotlin: 24, python: 22 },
} as const

function generateSteps(input: number[]): Step[] {
  const a = [...input]
  const n = a.length
  const steps: Step[] = []
  let id = 1

  steps.push({
    id: id++,
    narrative: `Heap Sort on ${n} bars. Build a max-heap, then peel off the maximum repeatedly.`,
    why: 'In-place O(n log n): heap property replaces an explicit priority queue.',
    codeFocus: L.build,
    callStack: [{ name: 'heapSort', active: true, locals: { a: { ref: 'a' }, n } }],
    heap: [sortBars(a)],
  })

  function siftDown(size: number, start: number) {
    let i = start
    while (true) {
      let largest = i
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < size && a[left]! > a[largest]!) largest = left
      if (right < size && a[right]! > a[largest]!) largest = right
      if (largest === i) return
      ;[a[i], a[largest]] = [a[largest]!, a[i]!]
      steps.push({
        id: id++,
        narrative: `Sift: swap a[${i}] with child a[${largest}] to restore heap order (heap size ${size}).`,
        why: 'Parent must be ≥ both children in a max-heap.',
        codeFocus: L.sift,
        callStack: [
          {
            name: 'siftDown',
            active: true,
            locals: { a: { ref: 'a' }, size, i, largest },
          },
        ],
        heap: [
          sortBars(
            a,
            [
              ...sortedTail(n, size),
              { index: i, role: 'compare' },
              { index: largest, role: 'compare' },
            ],
            { i, j: largest },
          ),
        ],
      })
      i = largest
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(n, i)
  }
  steps.push({
    id: id++,
    narrative: 'Max-heap built — a[0] is the largest value.',
    why: 'Ready to extract maxima into the sorted suffix.',
    codeFocus: L.build,
    callStack: [{ name: 'heapSort', active: true, locals: { a: { ref: 'a' }, phase: 'heap-ready' } }],
    heap: [sortBars(a, [{ index: 0, role: 'found' }], { i: 0 })],
  })

  for (let end = n - 1; end > 0; end--) {
    ;[a[0], a[end]] = [a[end]!, a[0]!]
    steps.push({
      id: id++,
      narrative: `Extract max → swap a[0] with a[${end}]=${a[end]}. Suffix grows.`,
      why: 'The end of the array becomes the sorted region.',
      codeFocus: L.extract,
      callStack: [
        {
          name: 'heapSort',
          active: true,
          locals: { a: { ref: 'a' }, end },
        },
      ],
      heap: [
        sortBars(
          a,
          [...sortedTail(n, end), { index: 0, role: 'compare' }, { index: end, role: 'found' }],
          { i: 0, j: end },
        ),
      ],
    })
    siftDown(end, 0)
  }

  steps.push({
    id: id++,
    narrative: 'Done — heap extractions filled the sorted suffix.',
    why: 'Heap Sort never needs an auxiliary array of size n.',
    codeFocus: L.extract,
    callStack: [{ name: 'heapSort', active: true, locals: { a: { ref: 'a' }, result: 'sorted' } }],
    heap: [sortBars(a, sortedTail(n, 0))],
  })

  return steps
}

const input = sortingInput(generateSteps)

export const heapSort: ProblemPack = {
  id: 'sort-heap-sort',
  lcNumber: 0,
  title: 'Heap Sort',
  pattern: 'Sorting',
  difficulty: 'Medium',
  insight: 'Build a max-heap in place, then repeatedly swap the root with the end and sift down.',
  invariant: 'After each extract, a[end..n) is sorted and a[0..end) is a max-heap.',
  complexity: { time: 'O(n log n)', space: 'O(1)' },
  inputLabel: packLabel(input),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: packSteps(input),
  input,
  benchmark: placeholderBenchmark(
    'In-place O(n log n) with worse constants than well-tuned quicksort.',
  ),
  walkthrough: {
    statement: 'Sort an integer array in non-decreasing order using Heap Sort.',
    keyIdea: 'Heapify, then peel the maximum into the sorted suffix.',
    approach: [
      'siftDown from the last parent to index 0 (build heap).',
      'Swap a[0] with a[end]; shrink heap size; siftDown(0).',
      'Repeat until one element remains.',
    ],
  },
}
