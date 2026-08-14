/**
 * LeetCode #1482 - Minimum Number of Days to Make m Bouquets.
 * Binary search on day: count runs of k adjacent bloomed flowers.
 *
 * Viz teaches the garden story: open vs shut flowers, the adjacent streak,
 * and which index ranges become bouquets - not opaque B1/B2 tokens.
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

/**
 * LC sample where adjacency matters: need 2 bouquets of 3 adjacent.
 * Answer is 12 (day 7 only yields one bouquet).
 */
const defaultBloomDay = [7, 7, 7, 7, 12, 7, 7]
const defaultM = 2
const defaultK = 3

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

function countBouquets(bloomDay: number[], day: number, k: number): number {
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
  return bouquets
}

/** Ranges of flower indices that form completed bouquets, in order. */
function bouquetRanges(
  bloomDay: number[],
  day: number,
  k: number,
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  let run = 0
  let runStart = 0
  for (let i = 0; i < bloomDay.length; i++) {
    if (bloomDay[i]! <= day) {
      if (run === 0) runStart = i
      run++
      if (run === k) {
        ranges.push({ start: runStart, end: i })
        run = 0
      }
    } else {
      run = 0
    }
  }
  return ranges
}

function formatRange(start: number, end: number): string {
  return start === end ? `[${start}]` : `[${start}-${end}]`
}

/** bloomDay numbers before any day probe. */
function bloomDaysHeap(
  bloomDay: number[],
  highlights: ArrayHighlight[] = [],
  focused = true,
): HeapObject {
  return {
    id: 'garden',
    kind: 'array',
    label: 'garden · bloomDay[i] = day flower i opens',
    values: [...bloomDay],
    highlights,
    focused,
  }
}

/**
 * Garden as open/shut/streak/taken for a candidate day.
 * Cell text is the teaching surface: shut, open, 2/3, bq1, ...
 */
function gardenStateHeap(
  bloomDay: number[],
  day: number,
  opts: {
    k: number
    scannedThrough?: number
    streak?: number
    taken?: Array<{ start: number; end: number }>
    scanIndex?: number | null
    focused?: boolean
    labelExtra?: string
  },
): HeapObject {
  const {
    k,
    scannedThrough = bloomDay.length - 1,
    streak = 0,
    taken = [],
    scanIndex = null,
    focused = true,
    labelExtra,
  } = opts
  const n = bloomDay.length
  const openCount = bloomDay.filter((d) => d <= day).length
  const values: Array<string | number> = Array.from({ length: n }, () => '')
  const highlights: ArrayHighlight[] = []

  const takenAt = new Map<number, number>()
  taken.forEach((range, bqIdx) => {
    for (let i = range.start; i <= range.end; i++) {
      takenAt.set(i, bqIdx + 1)
    }
  })

  const streakStart =
    streak > 0 ? scannedThrough - streak + 1 : -1

  for (let i = 0; i < n; i++) {
    const open = bloomDay[i]! <= day
    const bq = takenAt.get(i)

    if (bq !== undefined) {
      values[i] = `bq${bq}`
      highlights.push({
        index: i,
        role: scanIndex === i ? 'current' : 'found',
      })
    } else if (!open) {
      values[i] = 'shut'
      highlights.push({
        index: i,
        role: scanIndex === i ? 'current' : 'discard',
      })
    } else if (i > scannedThrough) {
      values[i] = 'open'
      highlights.push({
        index: i,
        role: scanIndex === i ? 'current' : 'window',
      })
    } else if (streak > 0 && i >= streakStart && i <= scannedThrough) {
      const pos = i - streakStart + 1
      values[i] = `${pos}/${k}`
      highlights.push({
        index: i,
        role: scanIndex === i ? 'current' : 'compare',
      })
    } else {
      // Open, already passed, not used in a bouquet or active streak.
      values[i] = 'open'
      highlights.push({
        index: i,
        role: scanIndex === i ? 'current' : 'visited',
      })
    }
  }

  return {
    id: 'garden',
    kind: 'array',
    label:
      labelExtra ??
      `garden @ day ${day} · ${openCount} open, ${n - openCount} shut · need ${k} adjacent`,
    values,
    highlights,
    ...(scanIndex !== null && scanIndex >= 0
      ? { pointers: { i: scanIndex } }
      : {}),
    focused,
  }
}

function madeHeap(
  m: number,
  ranges: Array<{ start: number; end: number }>,
  opts: { justAdded?: boolean; focused?: boolean } = {},
): HeapObject {
  const { justAdded = false, focused = false } = opts
  const values: Array<string | number> = Array.from({ length: m }, (_, i) => {
    const range = ranges[i]
    return range ? formatRange(range.start, range.end) : 'need'
  })
  const highlights: ArrayHighlight[] = values.map((_, i) => {
    if (i < ranges.length) {
      return {
        index: i,
        role:
          justAdded && i === ranges.length - 1
            ? ('found' as const)
            : ('sorted' as const),
      }
    }
    return { index: i, role: 'compare' as const }
  })
  return {
    id: 'made',
    kind: 'array',
    label:
      ranges.length === 0
        ? `bouquets made 0 / ${m} (each cell = flower indices)`
        : `bouquets made ${ranges.length} / ${m}`,
    values,
    highlights,
    focused: focused || justAdded,
  }
}

function dual(
  garden: HeapObject,
  made: HeapObject,
): HeapObject[] {
  return [garden, made]
}

function minDaysLocals(
  m: number,
  k: number,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    bloomDay: { ref: 'garden' },
    m,
    k,
    ...extra,
  }
}

function generateSteps({ bloomDay, m, k }: Input): Step[] {
  const steps: Step[] = []
  let id = 1
  const n = bloomDay.length
  const need = m * k

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: id++ })
  }

  push({
    narrative: `Garden of ${n} flowers. Each cell is the day that flower opens. Goal: m=${m} bouquets, each from k=${k} adjacent flowers (${need} flowers total).`,
    why: 'Adjacent means a contiguous run in the garden. You cannot skip a shut flower inside a bouquet.',
    codeFocus: L.early,
    callStack: [
      {
        name: 'minDays',
        active: true,
        locals: minDaysLocals(m, k, { need }),
      },
    ],
    heap: dual(bloomDaysHeap(bloomDay), madeHeap(m, [])),
  })

  if (need > n) {
    push({
      narrative: `m*k = ${need} > n = ${n} → return -1. Not enough flowers exist.`,
      why: 'Even if every flower is open, you cannot fill m bouquets of size k.',
      codeFocus: L.early,
      callStack: [
        {
          name: 'minDays',
          active: true,
          locals: minDaysLocals(m, k, { need, result: -1 }),
        },
      ],
      heap: dual(
        bloomDaysHeap(
          bloomDay,
          Array.from({ length: n }, (_, i) => ({
            index: i,
            role: 'discard' as const,
          })),
        ),
        madeHeap(m, []),
      ),
    })
    return steps
  }

  let left = Number.POSITIVE_INFINITY
  let right = 0
  for (const d of bloomDay) {
    left = Math.min(left, d)
    right = Math.max(right, d)
  }

  push({
    narrative: `Binary-search the calendar day. left = earliest bloom ${left}, right = latest bloom ${right}.`,
    why: 'Before left nothing is open. After right everything is open. Feasibility is monotonic in the day.',
    codeFocus: L.bound,
    callStack: [
      {
        name: 'minDays',
        active: true,
        locals: minDaysLocals(m, k, { left, right }),
      },
    ],
    heap: dual(bloomDaysHeap(bloomDay), madeHeap(m, [])),
  })

  let walkedFirst = false

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    const openCount = bloomDay.filter((d) => d <= mid).length

    push({
      narrative: `Probe day mid = ${mid}. A flower is open if bloomDay[i] ≤ ${mid}, otherwise shut.`,
      why: 'mid is a candidate answer (a calendar day), not an array index.',
      codeFocus: L.mid,
      callStack: [
        {
          name: 'minDays',
          active: true,
          locals: minDaysLocals(m, k, { left, mid, right, day: mid }),
        },
      ],
      heap: dual(
        gardenStateHeap(bloomDay, mid, {
          k,
          scannedThrough: -1,
          streak: 0,
          taken: [],
          labelExtra: `garden @ day ${mid} · flip open/shut (${openCount} open) · need ${k} in a row`,
        }),
        madeHeap(m, []),
      ),
    })

    // Reveal open/shut for the whole garden before walking.
    push({
      narrative: `On day ${mid}: ${openCount} open, ${n - openCount} shut. Walk left → right. Build an adjacent open streak; every ${k} in a row becomes one bouquet.`,
      why: 'A shut flower breaks the streak. Flowers already used in a bouquet cannot be reused.',
      codeFocus: L.canMake,
      callStack: [
        {
          name: 'canMake',
          active: true,
          locals: {
            bloomDay: { ref: 'garden' },
            made: { ref: 'made' },
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
          locals: minDaysLocals(m, k, { left, mid, right }),
        },
      ],
      heap: dual(
        gardenStateHeap(bloomDay, mid, {
          k,
          scannedThrough: -1,
          streak: 0,
          taken: [],
          labelExtra: `garden @ day ${mid} · teal open, faded shut · streak resets on shut`,
        }),
        madeHeap(m, []),
      ),
    })

    const detailWalk = !walkedFirst || n <= 8
    walkedFirst = true

    let bouquets = 0
    let run = 0
    const taken: Array<{ start: number; end: number }> = []

    if (detailWalk) {
      for (let i = 0; i < n; i++) {
        const d = bloomDay[i]!
        const open = d <= mid
        let justBouquet = false

        if (open) {
          run++
          if (run === k) {
            bouquets++
            taken.push({ start: i - k + 1, end: i })
            run = 0
            justBouquet = true
          }
        } else {
          run = 0
        }

        const range = justBouquet ? taken[taken.length - 1]! : null
        const narrative = open
          ? justBouquet
            ? `i=${i}: open (bloomDay=${d}). Streak hits ${k} → bouquet #${bouquets} from flowers ${formatRange(range!.start, range!.end)}. Reset streak.`
            : `i=${i}: open (bloomDay=${d}). Streak is now ${run}/${k}. Need ${k - run} more adjacent open flower(s).`
          : `i=${i}: shut (bloomDay=${d} > ${mid}). Streak resets to 0.`

        push({
          narrative,
          why: justBouquet
            ? 'Those k adjacent opens are picked as one bouquet. The next bouquet must start on a later flower.'
            : open
              ? 'Keep walking. Only a full run of k adjacent opens counts.'
              : 'A gap breaks adjacency. Partial streaks are discarded.',
          codeFocus: L.canMake,
          callStack: [
            {
              name: 'canMake',
              active: true,
              locals: {
                bloomDay: { ref: 'garden' },
                made: { ref: 'made' },
                m,
                k,
                day: mid,
                i,
                bloomDay_i: d,
                open,
                bouquets,
                run,
              },
            },
            {
              name: 'minDays',
              active: false,
              locals: minDaysLocals(m, k, { left, mid, right }),
            },
          ],
          heap: dual(
            gardenStateHeap(bloomDay, mid, {
              k,
              scannedThrough: i,
              streak: run,
              taken: [...taken],
              scanIndex: i,
            }),
            madeHeap(m, taken, { justAdded: justBouquet, focused: justBouquet }),
          ),
        })
      }
    } else {
      bouquets = countBouquets(bloomDay, mid, k)
      taken.push(...bouquetRanges(bloomDay, mid, k))
      push({
        narrative: `canMake(day=${mid}) summary: ${bouquets} bouquet(s) ${
          taken.length
            ? taken.map((r) => formatRange(r.start, r.end)).join(', ')
            : '(none)'
        }.`,
        why: 'Same left-to-right streak scan as the first mid; condensed so the day search stays readable.',
        codeFocus: L.canMake,
        callStack: [
          {
            name: 'canMake',
            active: true,
            locals: {
              bloomDay: { ref: 'garden' },
              made: { ref: 'made' },
              m,
              k,
              day: mid,
              bouquets,
            },
          },
          {
            name: 'minDays',
            active: false,
            locals: minDaysLocals(m, k, { left, mid, right }),
          },
        ],
        heap: dual(
          gardenStateHeap(bloomDay, mid, {
            k,
            scannedThrough: n - 1,
            streak: 0,
            taken: [...taken],
          }),
          madeHeap(m, taken, { focused: true }),
        ),
      })
    }

    const feasible = bouquets >= m

    push({
      narrative: `Day ${mid} result: ${bouquets} bouquet(s) vs m=${m}. ${
        feasible ? 'Feasible - try an earlier day.' : 'Infeasible - need a later day.'
      }`,
      why: feasible
        ? 'If day mid works, every later day also works. Search [left, mid].'
        : 'Too few bouquets. Discard mid and earlier: search [mid+1, right].',
      codeFocus: L.check,
      callStack: [
        {
          name: 'minDays',
          active: true,
          locals: minDaysLocals(m, k, {
            left,
            mid,
            right,
            day: mid,
            bouquets,
            feasible,
          }),
        },
      ],
      heap: dual(
        gardenStateHeap(bloomDay, mid, {
          k,
          scannedThrough: n - 1,
          streak: 0,
          taken: [...taken],
          labelExtra: feasible
            ? `day ${mid} works · ${bouquets} ≥ m=${m}`
            : `day ${mid} fails · ${bouquets} < m=${m}`,
        }),
        madeHeap(m, taken, { focused: true }),
      ),
    })

    if (feasible) {
      right = mid
      push({
        narrative: `Feasible → right = ${right}. Day window is now [${left}, ${right}].`,
        why: 'Keep mid as a possible answer; try earlier next.',
        codeFocus: L.rightDec,
        callStack: [
          {
            name: 'minDays',
            active: true,
            locals: minDaysLocals(m, k, { left, right }),
          },
        ],
        heap: dual(
          gardenStateHeap(bloomDay, mid, {
            k,
            taken: [...taken],
          }),
          madeHeap(m, taken),
        ),
      })
    } else {
      left = mid + 1
      push({
        narrative: `Infeasible → left = ${left}. Day window is now [${left}, ${right}].`,
        why: 'Critical: left becomes mid + 1. Each probe halves the remaining days.',
        codeFocus: L.leftInc,
        callStack: [
          {
            name: 'minDays',
            active: true,
            locals: minDaysLocals(m, k, { left, right }),
          },
        ],
        heap: dual(
          gardenStateHeap(bloomDay, mid, {
            k,
            taken: [...taken],
            focused: false,
          }),
          madeHeap(m, taken),
        ),
      })
    }
  }

  const finalTaken = bouquetRanges(bloomDay, left, k)
  push({
    narrative: `left == right == ${left}. Earliest day that makes ${m} bouquet(s) is ${left}.`,
    why: 'The search window collapsed onto the minimum feasible calendar day.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'minDays',
        active: true,
        locals: minDaysLocals(m, k, {
          left,
          right,
          result: left,
        }),
      },
    ],
    heap: dual(
      gardenStateHeap(bloomDay, left, {
        k,
        taken: finalTaken,
        labelExtra: `answer day ${left} · bouquets ${finalTaken
          .map((r) => formatRange(r.start, r.end))
          .join(', ')}`,
      }),
      madeHeap(m, finalTaken, { focused: true }),
    ),
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
      placeholder: '7, 7, 7, 7, 12, 7, 7',
      hint: 'Up to 12 bloom days from 1..99',
    },
    {
      key: 'm',
      label: 'm',
      widget: 'text',
      placeholder: '2',
      hint: 'Bouquets required',
    },
    {
      key: 'k',
      label: 'k',
      widget: 'text',
      placeholder: '3',
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
    { name: 'day-3', raw: { bloomDay: '1, 10, 3, 10, 2', m: '3', k: '1' } },
    { name: 'impossible', raw: { bloomDay: '1, 10, 3, 10, 2', m: '3', k: '2' } },
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
