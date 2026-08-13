/**
 * LeetCode #875 - Koko Eating Bananas.
 * Binary search on answer: minimum speed k in [1, max(piles)] with hours ≤ h.
 */
import javaSrc from '../../algorithms/0875-koko-eating-bananas/Solution.java?raw'
import kotlinSrc from '../../algorithms/0875-koko-eating-bananas/Solution.kt?raw'
import pythonSrc from '../../algorithms/0875-koko-eating-bananas/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
  parseIntValue,
} from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { piles: number[]; h: number }

/** Classic LC example: answer 4. */
const defaultPiles = [3, 6, 7, 11]
const defaultH = 8

const L = {
  init: { java: 6, kotlin: 6, python: 6 },
  bound: { java: 8, kotlin: 8, python: 7 },
  while: { java: 9, kotlin: 9, python: 8 },
  mid: { java: 10, kotlin: 10, python: 9 },
  check: { java: 11, kotlin: 11, python: 10 },
  rightDec: { java: 12, kotlin: 12, python: 11 },
  leftInc: { java: 14, kotlin: 14, python: 13 },
  ret: { java: 17, kotlin: 17, python: 14 },
  hours: { java: 23, kotlin: 23, python: 19 },
} as const

function ceilDiv(pile: number, speed: number): number {
  return Math.floor((pile + speed - 1) / speed)
}

function emptyHours(n: number): Array<string | number> {
  return Array.from({ length: n }, () => '—')
}

function pilesHeap(
  piles: number[],
  highlights: ArrayHighlight[],
  options: { speed?: number; focused?: boolean } = {},
): HeapObject {
  const { speed, focused = true } = options
  return {
    id: 'piles',
    kind: 'array',
    label: speed == null ? 'int[] piles' : `piles @ speed ${speed}`,
    values: [...piles],
    highlights,
    focused,
  }
}

function hoursHeap(
  values: Array<string | number>,
  highlights: ArrayHighlight[],
  options: { hoursSoFar?: number; h?: number; focused?: boolean } = {},
): HeapObject {
  const { hoursSoFar, h, focused = true } = options
  const label =
    hoursSoFar == null || h == null
      ? 'hours[]'
      : `hours so far ${hoursSoFar} / budget h=${h}`
  return {
    id: 'hours',
    kind: 'array',
    label,
    values: [...values],
    highlights,
    focused,
  }
}

function dualHeap(
  piles: number[],
  pilesHighlights: ArrayHighlight[],
  hoursValues: Array<string | number>,
  hoursHighlights: ArrayHighlight[],
  options: {
    speed?: number
    hoursSoFar?: number
    h?: number
  } = {},
): HeapObject[] {
  return [
    pilesHeap(piles, pilesHighlights, {
      speed: options.speed,
      focused: true,
    }),
    hoursHeap(hoursValues, hoursHighlights, {
      hoursSoFar: options.hoursSoFar,
      h: options.h,
      focused: true,
    }),
  ]
}

function indexHighlight(
  index: number,
  role: ArrayHighlight['role'] = 'current',
): ArrayHighlight[] {
  return [{ index, role }]
}

function feasibilityHighlights(
  n: number,
  feasible: boolean | null,
): ArrayHighlight[] {
  const role: ArrayHighlight['role'] =
    feasible === null ? 'compare' : feasible ? 'window' : 'discard'
  return Array.from({ length: n }, (_, i) => ({ index: i, role }))
}

function generateSteps({ piles, h }: Input): Step[] {
  const steps: Step[] = []
  let id = 1
  const n = piles.length
  const blankHours = emptyHours(n)

  let left = 1
  let right = 0
  for (const pile of piles) right = Math.max(right, pile)

  steps.push({
    id: id++,
    narrative: `Search the minimum eating speed. Piles are ready; hours[] starts empty. Answer space left=${left}.`,
    why: 'Any speed in [1, max(piles)] could work; we want the smallest feasible one.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'minEatingSpeed',
        active: true,
        locals: {
          piles: { ref: 'piles' },
          hours: { ref: 'hours' },
          h,
          left,
          right: 0,
        },
      },
    ],
    heap: dualHeap(piles, [], blankHours, [], { hoursSoFar: 0, h }),
  })

  steps.push({
    id: id++,
    narrative: `Bound the answer space: right = max(piles) = ${right}. Candidate speeds live in [${left}, ${right}].`,
    why: 'Speed max(piles) finishes every pile in one hour, so the true minimum is never larger.',
    codeFocus: L.bound,
    callStack: [
      {
        name: 'minEatingSpeed',
        active: true,
        locals: {
          piles: { ref: 'piles' },
          hours: { ref: 'hours' },
          h,
          left,
          right,
        },
      },
    ],
    heap: dualHeap(piles, [], blankHours, [], { hoursSoFar: 0, h }),
  })

  while (left < right) {
    steps.push({
      id: id++,
      narrative: `While left (${left}) < right (${right}): keep shrinking the speed range.`,
      why: 'Invariant: the minimum feasible speed is always inside [left, right].',
      codeFocus: L.while,
      callStack: [
        {
          name: 'minEatingSpeed',
          active: true,
          locals: {
            piles: { ref: 'piles' },
            hours: { ref: 'hours' },
            h,
            left,
            right,
          },
        },
      ],
      heap: dualHeap(piles, [], blankHours, [], { hoursSoFar: 0, h }),
    })

    const mid = left + Math.floor((right - left) / 2)
    const hoursRow = emptyHours(n)

    steps.push({
      id: id++,
      narrative: `Try speed mid = ${mid}. Reset hours[] and walk every pile at this speed.`,
      why: 'Binary search picks the middle of the remaining answer space (speeds), not an array index.',
      codeFocus: L.mid,
      callStack: [
        {
          name: 'minEatingSpeed',
          active: true,
          locals: {
            piles: { ref: 'piles' },
            hours: { ref: 'hours' },
            h,
            left,
            mid,
            right,
            speed: mid,
          },
        },
      ],
      heap: dualHeap(piles, [], hoursRow, [], {
        speed: mid,
        hoursSoFar: 0,
        h,
      }),
    })

    let hoursSoFar = 0
    for (let i = 0; i < n; i++) {
      const pile = piles[i]!
      const pileHours = ceilDiv(pile, mid)
      hoursSoFar += pileHours
      hoursRow[i] = `${pileHours}h`

      steps.push({
        id: id++,
        narrative: `Pile ${pile} at speed ${mid} needs ceil(${pile}/${mid})=${pileHours} hours. Total now ${hoursSoFar} / budget ${h}.`,
        why: 'Hours for one pile is ceil(pile/speed), written as (pile + speed - 1) / speed in integer arithmetic.',
        codeFocus: L.hours,
        callStack: [
          {
            name: 'minEatingSpeed',
            active: false,
            locals: {
              piles: { ref: 'piles' },
              hours: { ref: 'hours' },
              h,
              left,
              mid,
              right,
            },
          },
          {
            name: 'hoursNeeded',
            active: true,
            locals: {
              piles: { ref: 'piles' },
              hours: { ref: 'hours' },
              speed: mid,
              pile,
              pileHours,
              hoursSoFar,
              h,
              i,
            },
          },
        ],
        heap: dualHeap(
          piles,
          indexHighlight(i, 'current'),
          hoursRow,
          indexHighlight(i, 'compare'),
          { speed: mid, hoursSoFar, h },
        ),
      })
    }

    const hours = hoursSoFar
    const feasible = hours <= h

    steps.push({
      id: id++,
      narrative: `Total hours at speed ${mid}: ${hours}. ${
        feasible
          ? `${hours} <= h=${h}: feasible.`
          : `${hours} > h=${h}: too slow (infeasible).`
      }`,
      why: feasible
        ? 'A feasible mid means every speed >= mid also works; search the lower half including mid.'
        : 'Too many hours: discard mid and everything slower; raise left to mid + 1.',
      codeFocus: L.check,
      callStack: [
        {
          name: 'minEatingSpeed',
          active: true,
          locals: {
            piles: { ref: 'piles' },
            hours: { ref: 'hours' },
            h,
            left,
            mid,
            right,
            speed: mid,
            hoursNeeded: hours,
            feasible,
          },
        },
      ],
      heap: dualHeap(
        piles,
        feasibilityHighlights(n, feasible),
        hoursRow,
        feasibilityHighlights(n, feasible),
        { speed: mid, hoursSoFar: hours, h },
      ),
    })

    if (feasible) {
      right = mid
      steps.push({
        id: id++,
        narrative: `Feasible -> right = mid -> ${right}. New speed window [${left}, ${right}].`,
        why: 'Keep mid as a possible answer; try a smaller speed next.',
        codeFocus: L.rightDec,
        callStack: [
          {
            name: 'minEatingSpeed',
            active: true,
            locals: {
              piles: { ref: 'piles' },
              hours: { ref: 'hours' },
              h,
              left,
              mid,
              right,
            },
          },
        ],
        heap: dualHeap(
          piles,
          feasibilityHighlights(n, true),
          hoursRow,
          feasibilityHighlights(n, true),
          { speed: mid, hoursSoFar: hours, h },
        ),
      })
    } else {
      left = mid + 1
      steps.push({
        id: id++,
        narrative: `Infeasible -> left = mid + 1 -> ${left}. New speed window [${left}, ${right}].`,
        why: 'Critical: mid + 1 (not left++). Halving the answer space keeps O(log M).',
        codeFocus: L.leftInc,
        callStack: [
          {
            name: 'minEatingSpeed',
            active: true,
            locals: {
              piles: { ref: 'piles' },
              hours: { ref: 'hours' },
              h,
              left,
              mid,
              right,
            },
          },
        ],
        heap: dualHeap(
          piles,
          feasibilityHighlights(n, false),
          hoursRow,
          feasibilityHighlights(n, false),
          { speed: mid, hoursSoFar: hours, h },
        ),
      })
    }
  }

  steps.push({
    id: id++,
    narrative: `left == right == ${left}. Return minimum speed ${left}.`,
    why: 'The window collapsed onto the smallest feasible answer.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'minEatingSpeed',
        active: true,
        locals: {
          piles: { ref: 'piles' },
          hours: { ref: 'hours' },
          h,
          left,
          right,
          result: left,
        },
      },
    ],
    heap: dualHeap(
      piles,
      Array.from({ length: n }, (_, i) => ({
        index: i,
        role: 'found' as const,
      })),
      blankHours,
      [],
      { hoursSoFar: 0, h },
    ),
  })

  return steps
}

const input = defineInput<Input>({
  kind: 'intArrayH',
  fields: [
    {
      key: 'piles',
      label: 'piles',
      widget: 'text',
      placeholder: '3, 6, 7, 11',
      hint: 'Up to 12 pile sizes from 1..99',
    },
    {
      key: 'h',
      label: 'h',
      widget: 'text',
      placeholder: '8',
      hint: 'Hours available (must be ≥ piles.length)',
    },
  ],
  defaultRaw: {
    piles: formatIntList(defaultPiles),
    h: String(defaultH),
  },
  parse: (raw) => {
    const pilesResult = parseIntList(raw.piles ?? '', {
      name: 'piles',
      minLen: 1,
      maxLen: 12,
      minVal: 1,
      maxVal: 99,
    })
    if (!pilesResult.ok) return pilesResult
    const hResult = parseIntValue(raw.h ?? '', {
      name: 'h',
      minVal: pilesResult.value.length,
      maxVal: 10_000,
    })
    if (!hResult.ok) {
      if (hResult.errors[0]?.includes('between')) {
        return {
          ok: false,
          errors: [
            `h must be ≥ piles.length (${pilesResult.value.length}) so a solution exists.`,
          ],
        }
      }
      return hResult
    }
    return { ok: true, value: { piles: pilesResult.value, h: hResult.value } }
  },
  formatLabel: (value) =>
    `piles = [${value.piles.join(', ')}], h = ${value.h}`,
  generateSteps,
  fixtures: [
    { name: 'tight-h', raw: { piles: '30, 11, 23, 4, 20', h: '5' } },
    { name: 'plenty-time', raw: { piles: '3, 6, 7, 11', h: '15' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Koko Eating Bananas default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const kokoEatingBananas: ProblemPack = {
  id: '0875-koko-eating-bananas',
  lcNumber: 875,
  title: 'Koko Eating Bananas',
  pattern: 'Binary Search',
  difficulty: 'Medium',
  insight:
    'Binary search the eating speed. If mid finishes in ≤ h hours, try slower; else raise the floor.',
  invariant:
    'The minimum feasible speed always lies in [left, right]; each check halves that answer space.',
  complexity: {
    time: 'O(n log M)',
    space: 'O(1)',
    notes: 'M = max(piles). Sum hours with long/BigInt-safe ceil to avoid overflow.',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Each probe scans all piles; log M probes beat trying every speed from 1 to max.',
  ),
  walkthrough: {
    statement:
      'Koko eats all piles at integer speed k bananas/hour. Return the minimum k such that she finishes within h hours.',
    keyIdea:
      'Feasibility is monotonic in k: if speed mid works, every faster speed works too.',
    approach: [
      'left = 1, right = max(piles).',
      'While left < right: mid = (left + right) / 2.',
      'If hoursNeeded(mid) ≤ h, set right = mid; else left = mid + 1.',
      'Return left.',
    ],
  },
}
