/**
 * Shared helpers for sorting lab packs (bar-mode arrays, larger n).
 */
import {
  defineInput,
  formatIntList,
  parseIntList,
  type ProblemInputSpec,
} from '../../engine/input'
import type {
  ArrayHighlight,
  HeapObject,
  Language,
  Step,
} from '../../engine/types'

export const SORT_MAX_N = 48
export const SORT_MIN_N = 2
/** Distinct-ish default shuffle — enough bars to see the dance clearly. */
export const SORT_DEFAULT = [
  15, 3, 22, 8, 11, 1, 19, 27, 5, 14, 30, 9, 18, 2, 25, 12, 7, 21, 4, 16, 28, 10,
  23, 6, 31, 13, 20, 17,
]

export type FocusMap = Record<Language, number>

/** Bar heap snapshot for sorting demos. */
export function sortBars(
  values: number[],
  highlights: ArrayHighlight[] = [],
  pointers?: Record<string, number>,
  label = 'int[] a',
): HeapObject {
  return {
    id: 'a',
    kind: 'array',
    label,
    values: [...values],
    display: 'bars',
    highlights,
    pointers,
    focused: true,
  }
}

export function sortedTail(n: number, from: number): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let i = from; i < n; i++) out.push({ index: i, role: 'sorted' })
  return out
}

export function sortedHead(n: number, untilExclusive: number): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let i = 0; i < untilExclusive && i < n; i++) {
    out.push({ index: i, role: 'sorted' })
  }
  return out
}

export function rangeWindow(lo: number, hiInclusive: number): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let i = lo; i <= hiInclusive; i++) out.push({ index: i, role: 'window' })
  return out
}

/** Standard sorting input: large int arrays + Randomize. */
export function sortingInput(generateSteps: (a: number[]) => Step[]): ProblemInputSpec {
  return defineInput<number[]>({
    kind: 'sortingIntArray',
    fields: [
      {
        key: 'a',
        label: 'array',
        widget: 'text',
        placeholder: formatIntList(SORT_DEFAULT),
        hint: `2–${SORT_MAX_N} integers (1–99). Use Randomize for a fresh shuffle.`,
        randomize: true,
      },
    ],
    defaultRaw: { a: formatIntList(SORT_DEFAULT) },
    parse: (raw) =>
      parseIntList(raw.a ?? '', {
        name: 'array',
        minLen: SORT_MIN_N,
        maxLen: SORT_MAX_N,
        minVal: 1,
        maxVal: 99,
      }),
    formatLabel: (value) => `a = [${value.join(', ')}]  (${value.length} bars)`,
    generateSteps,
    fixtures: [
      { name: 'tiny', raw: { a: '3, 1, 2' } },
      { name: 'sorted', raw: { a: '1, 2, 3, 4, 5' } },
    ],
  })
}

export function packSteps(input: ProblemInputSpec): Step[] {
  const parsed = input.parse(input.defaultRaw)
  if (!parsed.ok) throw new Error(parsed.errors.join('; '))
  return input.generateSteps(parsed.value)
}

export function packLabel(input: ProblemInputSpec): string {
  const parsed = input.parse(input.defaultRaw)
  if (!parsed.ok) throw new Error(parsed.errors.join('; '))
  return input.formatLabel(parsed.value)
}
