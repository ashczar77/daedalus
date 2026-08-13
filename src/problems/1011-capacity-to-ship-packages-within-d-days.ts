/**
 * LeetCode #1011 - Capacity To Ship Packages Within D Days.
 * Binary search on capacity: low = max(weight), high = sum(weights).
 */
import javaSrc from '../../algorithms/1011-capacity-to-ship-packages-within-d-days/Solution.java?raw'
import kotlinSrc from '../../algorithms/1011-capacity-to-ship-packages-within-d-days/Solution.kt?raw'
import pythonSrc from '../../algorithms/1011-capacity-to-ship-packages-within-d-days/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
  parseIntValue,
} from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { weights: number[]; days: number }

/** Classic LC example: answer 15. */
const defaultWeights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const defaultDays = 5

const L = {
  init: { java: 6, kotlin: 6, python: 6 },
  bound: { java: 9, kotlin: 9, python: 7 },
  while: { java: 12, kotlin: 12, python: 8 },
  mid: { java: 13, kotlin: 13, python: 9 },
  check: { java: 14, kotlin: 14, python: 10 },
  rightDec: { java: 15, kotlin: 15, python: 11 },
  leftInc: { java: 17, kotlin: 17, python: 13 },
  ret: { java: 20, kotlin: 20, python: 14 },
  canShip: { java: 27, kotlin: 27, python: 20 },
} as const

function daysNeeded(weights: number[], capacity: number): number {
  let dayCount = 1
  let load = 0
  for (const w of weights) {
    if (load + w > capacity) {
      dayCount++
      load = 0
    }
    load += w
  }
  return dayCount
}

function weightsHeap(
  weights: number[],
  highlights: ArrayHighlight[],
  focused = true,
): HeapObject {
  return {
    id: 'weights',
    kind: 'array',
    label: 'int[] weights',
    values: [...weights],
    highlights,
    focused,
  }
}

function feasibilityHighlights(
  n: number,
  feasible: boolean | null,
): ArrayHighlight[] {
  const role: ArrayHighlight['role'] =
    feasible === null ? 'compare' : feasible ? 'window' : 'discard'
  return Array.from({ length: n }, (_, i) => ({ index: i, role }))
}

function generateSteps({ weights, days }: Input): Step[] {
  const steps: Step[] = []
  let id = 1
  const n = weights.length

  let left = 0
  let right = 0
  for (const w of weights) {
    left = Math.max(left, w)
    right += w
  }

  steps.push({
    id: id++,
    narrative: `Search the minimum ship capacity. Packages must stay in order.`,
    why: 'Capacity is the answer we binary-search; the heap holds package weights.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'shipWithinDays',
        active: true,
        locals: {
          weights: { ref: 'weights' },
          days,
          left: 0,
          right: 0,
        },
      },
    ],
    heap: [weightsHeap(weights, [])],
  })

  steps.push({
    id: id++,
    narrative: `Bounds: left = max(weight) = ${left}, right = sum(weights) = ${right}. Capacity window [${left}, ${right}].`,
    why: 'Need at least the heaviest package; sum ships everything in one day.',
    codeFocus: L.bound,
    callStack: [
      {
        name: 'shipWithinDays',
        active: true,
        locals: { weights: { ref: 'weights' }, days, left, right },
      },
    ],
    heap: [weightsHeap(weights, [])],
  })

  let walkedFirst = false

  while (left < right) {
    steps.push({
      id: id++,
      narrative: `While left (${left}) < right (${right}): shrink the capacity range.`,
      why: 'Invariant: the minimum feasible capacity is always inside [left, right].',
      codeFocus: L.while,
      callStack: [
        {
          name: 'shipWithinDays',
          active: true,
          locals: { weights: { ref: 'weights' }, days, left, right },
        },
      ],
      heap: [weightsHeap(weights, feasibilityHighlights(n, null))],
    })

    const mid = left + Math.floor((right - left) / 2)

    steps.push({
      id: id++,
      narrative: `Try capacity mid = ${mid}.`,
      why: 'mid is a candidate answer (capacity), not an index into weights.',
      codeFocus: L.mid,
      callStack: [
        {
          name: 'shipWithinDays',
          active: true,
          locals: {
            weights: { ref: 'weights' },
            days,
            left,
            mid,
            right,
            capacity: mid,
          },
        },
      ],
      heap: [weightsHeap(weights, feasibilityHighlights(n, null))],
    })

    if (!walkedFirst) {
      walkedFirst = true
      steps.push({
        id: id++,
        narrative: `First check simulates days greedily: fill today's load until the next package would overflow capacity ${mid}, then start a new day.`,
        why: 'Order is fixed; the only choice is how much capacity lets you finish in ≤ days.',
        codeFocus: L.canShip,
        callStack: [
          {
            name: 'canShip',
            active: true,
            locals: {
              weights: { ref: 'weights' },
              days,
              capacity: mid,
              dayCount: 1,
              load: 0,
            },
          },
          {
            name: 'shipWithinDays',
            active: false,
            locals: { weights: { ref: 'weights' }, days, left, mid, right },
          },
        ],
        heap: [weightsHeap(weights, feasibilityHighlights(n, null))],
      })
    }

    const needed = daysNeeded(weights, mid)
    const feasible = needed <= days

    steps.push({
      id: id++,
      narrative: `With capacity ${mid}, daysNeeded = ${needed}. ${
        feasible
          ? `${needed} ≤ days=${days}: feasible.`
          : `${needed} > days=${days}: capacity too small (infeasible).`
      }`,
      why: feasible
        ? 'Feasible mid means every larger capacity also works; search the lower half including mid.'
        : 'Not enough days: discard mid and smaller capacities; raise left to mid + 1.',
      codeFocus: L.check,
      callStack: [
        {
          name: 'shipWithinDays',
          active: true,
          locals: {
            weights: { ref: 'weights' },
            days,
            left,
            mid,
            right,
            capacity: mid,
            daysNeeded: needed,
            feasible,
          },
        },
      ],
      heap: [weightsHeap(weights, feasibilityHighlights(n, feasible))],
    })

    if (feasible) {
      right = mid
      steps.push({
        id: id++,
        narrative: `Feasible → right = mid → ${right}. New capacity window [${left}, ${right}].`,
        why: 'Keep mid as a possible answer; try a smaller capacity next.',
        codeFocus: L.rightDec,
        callStack: [
          {
            name: 'shipWithinDays',
            active: true,
            locals: { weights: { ref: 'weights' }, days, left, right },
          },
        ],
        heap: [weightsHeap(weights, feasibilityHighlights(n, true))],
      })
    } else {
      left = mid + 1
      steps.push({
        id: id++,
        narrative: `Infeasible → left = mid + 1 → ${left}. New capacity window [${left}, ${right}].`,
        why: 'Critical: mid + 1. Each iteration halves the remaining capacities.',
        codeFocus: L.leftInc,
        callStack: [
          {
            name: 'shipWithinDays',
            active: true,
            locals: { weights: { ref: 'weights' }, days, left, right },
          },
        ],
        heap: [weightsHeap(weights, feasibilityHighlights(n, false))],
      })
    }
  }

  steps.push({
    id: id++,
    narrative: `left == right == ${left}. Return minimum capacity ${left}.`,
    why: 'The window collapsed onto the smallest capacity that still ships in time.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'shipWithinDays',
        active: true,
        locals: {
          weights: { ref: 'weights' },
          days,
          left,
          right,
          result: left,
        },
      },
    ],
    heap: [
      weightsHeap(
        weights,
        Array.from({ length: n }, (_, i) => ({
          index: i,
          role: 'found' as const,
        })),
      ),
    ],
  })

  return steps
}

const input = defineInput<Input>({
  kind: 'intArrayDays',
  fields: [
    {
      key: 'weights',
      label: 'weights',
      widget: 'text',
      placeholder: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
      hint: 'Up to 12 package weights from 1..50',
    },
    {
      key: 'days',
      label: 'days',
      widget: 'text',
      placeholder: '5',
      hint: 'Shipping days (1..weights.length)',
    },
  ],
  defaultRaw: {
    weights: formatIntList(defaultWeights),
    days: String(defaultDays),
  },
  parse: (raw) => {
    const weightsResult = parseIntList(raw.weights ?? '', {
      name: 'weights',
      minLen: 1,
      maxLen: 12,
      minVal: 1,
      maxVal: 50,
    })
    if (!weightsResult.ok) return weightsResult
    const daysResult = parseIntValue(raw.days ?? '', {
      name: 'days',
      minVal: 1,
      maxVal: weightsResult.value.length,
    })
    if (!daysResult.ok) {
      if (daysResult.errors[0]?.includes('between')) {
        return {
          ok: false,
          errors: [
            `days must be between 1 and weights.length (${weightsResult.value.length}).`,
          ],
        }
      }
      return daysResult
    }
    return {
      ok: true,
      value: { weights: weightsResult.value, days: daysResult.value },
    }
  },
  formatLabel: (value) =>
    `weights = [${value.weights.join(', ')}], days = ${value.days}`,
  generateSteps,
  fixtures: [
    { name: 'one-day', raw: { weights: '1, 2, 3, 4, 5', days: '1' } },
    { name: 'tight', raw: { weights: '3, 2, 2, 4, 1, 4', days: '3' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Capacity To Ship default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const capacityToShipPackagesWithinDDays: ProblemPack = {
  id: '1011-capacity-to-ship-packages-within-d-days',
  lcNumber: 1011,
  title: 'Capacity To Ship Packages Within D Days',
  pattern: 'Binary Search',
  difficulty: 'Medium',
  insight:
    'Binary search capacity. Simulate greedy day loads; if mid finishes in ≤ days, try smaller.',
  invariant:
    'The minimum feasible capacity always lies in [left, right]; each probe halves that range.',
  complexity: {
    time: 'O(n log S)',
    space: 'O(1)',
    notes: 'S = sum(weights). left starts at max(weight).',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Each capacity probe walks all packages once; log S probes beat scanning every capacity.',
  ),
  walkthrough: {
    statement:
      'Packages must ship in order. Return the least ship capacity that finishes within days days.',
    keyIdea:
      'Feasibility is monotonic in capacity: if mid works, every larger capacity works too.',
    approach: [
      'left = max(weight), right = sum(weights).',
      'While left < right: mid = (left + right) / 2.',
      'Greedy-simulate days needed at capacity mid.',
      'If daysNeeded ≤ days, right = mid; else left = mid + 1. Return left.',
    ],
  },
}
