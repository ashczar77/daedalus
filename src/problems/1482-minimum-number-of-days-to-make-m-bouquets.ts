/**
 * LeetCode #1482 - Minimum Number of Days to Make m Bouquets.
 * Binary search on day: count runs of k adjacent bloomed flowers.
 */
import javaSrc from '../../algorithms/1482-minimum-number-of-days-to-make-m-bouquets/Solution.java?raw'
import kotlinSrc from '../../algorithms/1482-minimum-number-of-days-to-make-m-bouquets/Solution.kt?raw'
import pythonSrc from '../../algorithms/1482-minimum-number-of-days-to-make-m-bouquets/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
  parseIntValue,
} from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { bloomDay: number[]; m: number; k: number }

/** Classic LC example: answer 3. */
const defaultBloomDay = [1, 10, 3, 10, 2]
const defaultM = 3
const defaultK = 1

const L = {
  early: { java: 7, kotlin: 7, python: 7 },
  init: { java: 8, kotlin: 8, python: 8 },
  bound: { java: 11, kotlin: 11, python: 9 },
  while: { java: 14, kotlin: 14, python: 10 },
  mid: { java: 15, kotlin: 15, python: 11 },
  check: { java: 16, kotlin: 16, python: 12 },
  rightDec: { java: 17, kotlin: 17, python: 13 },
  leftInc: { java: 19, kotlin: 19, python: 15 },
  ret: { java: 22, kotlin: 22, python: 16 },
  canMake: { java: 29, kotlin: 29, python: 22 },
} as const

function canMake(
  bloomDay: number[],
  m: number,
  k: number,
  day: number,
): { ok: boolean; bouquets: number } {
  let bouquets = 0
  let run = 0
  for (const d of bloomDay) {
    if (d <= day) {
      run++
      if (run === k) {
        bouquets++
        run = 0
      }
    } else {
      run = 0
    }
  }
  return { ok: bouquets >= m, bouquets }
}

function bloomHighlights(
  bloomDay: number[],
  day: number | null,
  feasible: boolean | null,
): ArrayHighlight[] {
  return bloomDay.map((d, i): ArrayHighlight => {
    if (day === null) return { index: i, role: 'compare' }
    if (d <= day) {
      return { index: i, role: feasible === false ? 'compare' : 'window' }
    }
    return { index: i, role: 'discard' }
  })
}

function bloomHeap(
  bloomDay: number[],
  highlights: ArrayHighlight[],
  focused = true,
): HeapObject {
  return {
    id: 'bloomDay',
    kind: 'array',
    label: 'int[] bloomDay',
    values: [...bloomDay],
    highlights,
    focused,
  }
}

function generateSteps({ bloomDay, m, k }: Input): Step[] {
  const steps: Step[] = []
  let id = 1
  const n = bloomDay.length
  const need = m * k

  steps.push({
    id: id++,
    narrative: `Need m=${m} bouquets of k=${k} adjacent flowers each (${need} flowers total).`,
    why: 'If m*k exceeds the garden size, no day can work.',
    codeFocus: L.early,
    callStack: [
      {
        name: 'minDays',
        active: true,
        locals: {
          bloomDay: { ref: 'bloomDay' },
          m,
          k,
          need,
        },
      },
    ],
    heap: [bloomHeap(bloomDay, [])],
  })

  if (need > n) {
    steps.push({
      id: id++,
      narrative: `m*k = ${need} > n = ${n} → return -1.`,
      why: 'Not enough flowers exist, even if every bloom is used.',
      codeFocus: L.early,
      callStack: [
        {
          name: 'minDays',
          active: true,
          locals: {
            bloomDay: { ref: 'bloomDay' },
            m,
            k,
            need,
            result: -1,
          },
        },
      ],
      heap: [
        bloomHeap(
          bloomDay,
          Array.from({ length: n }, (_, i) => ({
            index: i,
            role: 'discard' as const,
          })),
        ),
      ],
    })
    return steps
  }

  let left = Number.POSITIVE_INFINITY
  let right = 0
  for (const d of bloomDay) {
    left = Math.min(left, d)
    right = Math.max(right, d)
  }

  steps.push({
    id: id++,
    narrative: `Answer space is days. left = min(bloomDay) = ${left}, right = max(bloomDay) = ${right}.`,
    why: 'Before the earliest bloom nothing is ready; after the latest bloom everything is ready.',
    codeFocus: L.bound,
    callStack: [
      {
        name: 'minDays',
        active: true,
        locals: { bloomDay: { ref: 'bloomDay' }, m, k, left, right },
      },
    ],
    heap: [bloomHeap(bloomDay, [])],
  })

  let walkedFirst = false

  while (left < right) {
    steps.push({
      id: id++,
      narrative: `While left (${left}) < right (${right}): shrink the day range.`,
      why: 'Invariant: the earliest feasible day is always inside [left, right].',
      codeFocus: L.while,
      callStack: [
        {
          name: 'minDays',
          active: true,
          locals: { bloomDay: { ref: 'bloomDay' }, m, k, left, right },
        },
      ],
      heap: [bloomHeap(bloomDay, bloomHighlights(bloomDay, null, null))],
    })

    const mid = left + Math.floor((right - left) / 2)

    steps.push({
      id: id++,
      narrative: `Try day mid = ${mid}. Flowers with bloomDay[i] ≤ ${mid} are open.`,
      why: 'mid is a candidate calendar day, not an array index.',
      codeFocus: L.mid,
      callStack: [
        {
          name: 'minDays',
          active: true,
          locals: {
            bloomDay: { ref: 'bloomDay' },
            m,
            k,
            left,
            mid,
            right,
            day: mid,
          },
        },
      ],
      heap: [bloomHeap(bloomDay, bloomHighlights(bloomDay, mid, null))],
    })

    if (!walkedFirst) {
      walkedFirst = true
      steps.push({
        id: id++,
        narrative: `First check counts runs of k=${k} adjacent open flowers (bloomDay ≤ ${mid}), resetting a run on any closed flower.`,
        why: 'Each completed run of length k makes one bouquet; need at least m.',
        codeFocus: L.canMake,
        callStack: [
          {
            name: 'canMake',
            active: true,
            locals: {
              bloomDay: { ref: 'bloomDay' },
              m,
              k,
              day: mid,
              bouquets: 0,
              run: 0,
            },
          },
          {
            name: 'minDays',
            active: false,
            locals: { bloomDay: { ref: 'bloomDay' }, m, k, left, mid, right },
          },
        ],
        heap: [bloomHeap(bloomDay, bloomHighlights(bloomDay, mid, null))],
      })
    }

    const { ok: feasible, bouquets } = canMake(bloomDay, m, k, mid)

    steps.push({
      id: id++,
      narrative: `On day ${mid}: bouquets = ${bouquets}. ${
        feasible
          ? `${bouquets} ≥ m=${m}: feasible.`
          : `${bouquets} < m=${m}: not enough (infeasible).`
      }`,
      why: feasible
        ? 'If day mid works, every later day also works; search earlier days including mid.'
        : 'Too few bouquets: discard mid and earlier days; raise left to mid + 1.',
      codeFocus: L.check,
      callStack: [
        {
          name: 'minDays',
          active: true,
          locals: {
            bloomDay: { ref: 'bloomDay' },
            m,
            k,
            left,
            mid,
            right,
            day: mid,
            bouquets,
            feasible,
          },
        },
      ],
      heap: [bloomHeap(bloomDay, bloomHighlights(bloomDay, mid, feasible))],
    })

    if (feasible) {
      right = mid
      steps.push({
        id: id++,
        narrative: `Feasible → right = mid → ${right}. New day window [${left}, ${right}].`,
        why: 'Keep mid as a possible answer; try an earlier day next.',
        codeFocus: L.rightDec,
        callStack: [
          {
            name: 'minDays',
            active: true,
            locals: { bloomDay: { ref: 'bloomDay' }, m, k, left, right },
          },
        ],
        heap: [bloomHeap(bloomDay, bloomHighlights(bloomDay, mid, true))],
      })
    } else {
      left = mid + 1
      steps.push({
        id: id++,
        narrative: `Infeasible → left = mid + 1 → ${left}. New day window [${left}, ${right}].`,
        why: 'Critical: mid + 1. Each iteration halves the remaining days.',
        codeFocus: L.leftInc,
        callStack: [
          {
            name: 'minDays',
            active: true,
            locals: { bloomDay: { ref: 'bloomDay' }, m, k, left, right },
          },
        ],
        heap: [bloomHeap(bloomDay, bloomHighlights(bloomDay, mid, false))],
      })
    }
  }

  steps.push({
    id: id++,
    narrative: `left == right == ${left}. Return earliest day ${left}.`,
    why: 'The window collapsed onto the minimum day that still makes m bouquets.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'minDays',
        active: true,
        locals: {
          bloomDay: { ref: 'bloomDay' },
          m,
          k,
          left,
          right,
          result: left,
        },
      },
    ],
    heap: [
      bloomHeap(
        bloomDay,
        bloomDay.map((d, i): ArrayHighlight => ({
          index: i,
          role: d <= left ? 'found' : 'discard',
        })),
      ),
    ],
  })

  return steps
}

const input = defineInput<Input>({
  kind: 'bloomDayMK',
  fields: [
    {
      key: 'bloomDay',
      label: 'bloomDay',
      widget: 'text',
      placeholder: '1, 10, 3, 10, 2',
      hint: 'Up to 12 bloom days from 1..99',
    },
    {
      key: 'm',
      label: 'm',
      widget: 'text',
      placeholder: '3',
      hint: 'Bouquets required',
    },
    {
      key: 'k',
      label: 'k',
      widget: 'text',
      placeholder: '1',
      hint: 'Adjacent flowers per bouquet',
    },
  ],
  defaultRaw: {
    bloomDay: formatIntList(defaultBloomDay),
    m: String(defaultM),
    k: String(defaultK),
  },
  parse: (raw) => {
    const bloomResult = parseIntList(raw.bloomDay ?? '', {
      name: 'bloomDay',
      minLen: 1,
      maxLen: 12,
      minVal: 1,
      maxVal: 99,
    })
    if (!bloomResult.ok) return bloomResult
    const mResult = parseIntValue(raw.m ?? '', {
      name: 'm',
      minVal: 1,
      maxVal: 20,
    })
    if (!mResult.ok) return mResult
    const kResult = parseIntValue(raw.k ?? '', {
      name: 'k',
      minVal: 1,
      maxVal: bloomResult.value.length,
    })
    if (!kResult.ok) {
      if (kResult.errors[0]?.includes('between')) {
        return {
          ok: false,
          errors: [
            `k must be between 1 and bloomDay.length (${bloomResult.value.length}).`,
          ],
        }
      }
      return kResult
    }
    return {
      ok: true,
      value: {
        bloomDay: bloomResult.value,
        m: mResult.value,
        k: kResult.value,
      },
    }
  },
  formatLabel: (value) =>
    `bloomDay = [${value.bloomDay.join(', ')}], m = ${value.m}, k = ${value.k}`,
  generateSteps,
  fixtures: [
    { name: 'impossible', raw: { bloomDay: '1, 10, 3, 10, 2', m: '3', k: '2' } },
    { name: 'k-two', raw: { bloomDay: '1, 10, 3, 10, 2', m: '3', k: '1' } },
    { name: 'later', raw: { bloomDay: '7, 7, 7, 7, 12, 7, 7', m: '2', k: '3' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Make m Bouquets default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const minimumNumberOfDaysToMakeMBouquets: ProblemPack = {
  id: '1482-minimum-number-of-days-to-make-m-bouquets',
  lcNumber: 1482,
  title: 'Minimum Number of Days to Make m Bouquets',
  pattern: 'Binary Search',
  difficulty: 'Medium',
  insight:
    'Binary search the calendar day. Count adjacent runs of k bloomed flowers; need ≥ m bouquets.',
  invariant:
    'If day d works, every later day works; the earliest feasible day stays in [left, right].',
  complexity: {
    time: 'O(n log D)',
    space: 'O(1)',
    notes: 'D spans min..max bloomDay. Early -1 when m*k > n.',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Each day probe scans the garden once; log D probes beat checking every calendar day.',
  ),
  walkthrough: {
    statement:
      'Garden bloomDay[i] is when flower i opens. Make m bouquets of k adjacent flowers. Return the earliest day, or -1.',
    keyIdea:
      'Feasibility is monotonic in the day: once you can make m bouquets, waiting longer never hurts.',
    approach: [
      'If m*k > n, return -1.',
      'left = min(bloomDay), right = max(bloomDay).',
      'While left < right: mid = (left + right) / 2; count bouquets from runs of k open flowers.',
      'If bouquets ≥ m, right = mid; else left = mid + 1. Return left.',
    ],
  },
}
