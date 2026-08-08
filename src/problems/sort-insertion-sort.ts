/**
 * Insertion Sort lab — grow a sorted prefix with bar visualization.
 */
import javaSrc from '../../algorithms/sort-insertion-sort/Solution.java?raw'
import kotlinSrc from '../../algorithms/sort-insertion-sort/Solution.kt?raw'
import pythonSrc from '../../algorithms/sort-insertion-sort/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'
import {
  packLabel,
  packSteps,
  sortBars,
  sortedHead,
  sortingInput,
} from './sorting/shared'

const L = {
  key: { java: 8, kotlin: 8, python: 7 },
  shift: { java: 11, kotlin: 11, python: 10 },
  place: { java: 13, kotlin: 13, python: 12 },
} as const

function generateSteps(input: number[]): Step[] {
  const a = [...input]
  const n = a.length
  const steps: Step[] = []
  let id = 1

  steps.push({
    id: id++,
    narrative: `Insertion Sort on ${n} bars. Prefix a[0..i) stays sorted while we insert a[i].`,
    why: 'Like sorting cards in hand: shift larger cards right, drop the key into the gap.',
    codeFocus: L.key,
    callStack: [{ name: 'insertionSort', active: true, locals: { a: { ref: 'a' }, n } }],
    heap: [sortBars(a, sortedHead(n, 1))],
  })

  for (let i = 1; i < n; i++) {
    const key = a[i]!
    let j = i - 1
    steps.push({
      id: id++,
      narrative: `Pick key=a[${i}]=${key}. Shift larger prefix values right.`,
      why: 'The hole moves left until key belongs.',
      codeFocus: L.key,
      callStack: [
        {
          name: 'insertionSort',
          active: true,
          locals: { a: { ref: 'a' }, i, key, j },
        },
      ],
      heap: [
        sortBars(a, [...sortedHead(n, i), { index: i, role: 'current' }], {
          i,
        }),
      ],
    })

    while (j >= 0 && a[j]! > key) {
      a[j + 1] = a[j]!
      steps.push({
        id: id++,
        narrative: `Shift a[${j}]=${a[j]} → index ${j + 1}.`,
        why: 'Make room for the key among the sorted prefix.',
        codeFocus: L.shift,
        callStack: [
          {
            name: 'insertionSort',
            active: true,
            locals: { a: { ref: 'a' }, i, key, j },
          },
        ],
        heap: [
          sortBars(
            a,
            [
              ...sortedHead(n, j),
              { index: j, role: 'compare' },
              { index: j + 1, role: 'window' },
            ],
            { j, i },
          ),
        ],
      })
      j -= 1
    }
    a[j + 1] = key
    steps.push({
      id: id++,
      narrative: `Place key=${key} at index ${j + 1}. Prefix a[0..${i}] is sorted.`,
      why: 'Insertion complete for this card.',
      codeFocus: L.place,
      callStack: [
        {
          name: 'insertionSort',
          active: true,
          locals: { a: { ref: 'a' }, i, key, placed: j + 1 },
        },
      ],
      heap: [
        sortBars(a, [...sortedHead(n, i + 1), { index: j + 1, role: 'found' }], {
          i: j + 1,
        }),
      ],
    })
  }

  steps.push({
    id: id++,
    narrative: 'Done — sorted prefix covers the whole array.',
    why: 'Every element has been inserted into place.',
    codeFocus: L.place,
    callStack: [{ name: 'insertionSort', active: true, locals: { a: { ref: 'a' }, result: 'sorted' } }],
    heap: [sortBars(a, sortedHead(n, n))],
  })

  return steps
}

const input = sortingInput(generateSteps)

export const insertionSort: ProblemPack = {
  id: 'sort-insertion-sort',
  lcNumber: 0,
  title: 'Insertion Sort',
  pattern: 'Sorting',
  difficulty: 'Easy',
  insight: 'Keep a sorted prefix; insert each next value by shifting larger neighbors right.',
  invariant: 'Before handling index i, a[0..i) is sorted.',
  complexity: {
    time: 'O(n²)',
    space: 'O(1)',
    notes: 'Nearly-sorted inputs are nearly linear — few shifts.',
  },
  inputLabel: packLabel(input),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: packSteps(input),
  input,
  benchmark: placeholderBenchmark(
    'Excellent on nearly-sorted data; still quadratic in the worst case.',
  ),
  walkthrough: {
    statement: 'Sort an integer array in non-decreasing order using Insertion Sort.',
    keyIdea: 'Grow a sorted prefix; insert a[i] into the correct spot by shifting.',
    approach: [
      'For i from 1..n-1: key = a[i].',
      'While previous elements are larger, shift them right.',
      'Write key into the opened gap.',
    ],
  },
}
