/**
 * LeetCode #242 — Valid Anagram (frequency counting).
 * Steps generated from validated s + t (Phase 4).
 */
import javaSrc from '../../algorithms/0242-valid-anagram/Solution.java?raw'
import kotlinSrc from '../../algorithms/0242-valid-anagram/Solution.kt?raw'
import pythonSrc from '../../algorithms/0242-valid-anagram/solution.py?raw'
import { defineInput, parseString } from '../engine/input'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type ValidAnagramInput = { s: string; t: string }

const defaultS = 'anagram'
const defaultT = 'nagaram'

const L = {
  lenCheck: { java: 6, kotlin: 6, python: 6 },
  counts: { java: 9, kotlin: 7, python: 8 },
  loop: { java: 11, kotlin: 8, python: 9 },
  verify: { java: 15, kotlin: 12, python: 12 },
  retTrue: { java: 19, kotlin: 12, python: 12 },
  retFalse: { java: 16, kotlin: 12, python: 12 },
} as const

function toCharArray(str: string): string[] {
  return [...str]
}

function bumpCounts(counts: Map<string, number>, ch: string, delta: number): void {
  const next = (counts.get(ch) ?? 0) + delta
  if (next === 0) counts.delete(ch)
  else counts.set(ch, next)
}

function countsEntries(counts: Map<string, number>): Array<[string, number]> {
  return [...counts.entries()]
}

function heapStrings(s: string, t: string) {
  const sArr = toCharArray(s)
  const tArr = toCharArray(t)
  return { sArr, tArr }
}

function generateValidAnagramSteps({ s, t }: ValidAnagramInput): Step[] {
  const steps: Step[] = []
  let id = 1
  const { sArr, tArr } = heapStrings(s, t)

  if (s.length !== t.length) {
    steps.push({
      id: id++,
      narrative: `s.length = ${s.length} and t.length = ${t.length} differ → return false without counting.`,
      why: 'Anagrams must have identical length; mismatch is an immediate no.',
      codeFocus: L.lenCheck,
      callStack: [
        {
          name: 'isAnagram',
          active: true,
          locals: {
            s: { ref: 's' },
            t: { ref: 't' },
            result: false,
          },
        },
      ],
      heap: [
        {
          id: 's',
          kind: 'array',
          label: 'String s',
          values: sArr,
          focused: true,
        },
        {
          id: 't',
          kind: 'array',
          label: 'String t',
          values: tArr,
          focused: true,
        },
      ],
    })
    return steps
  }

  const counts = new Map<string, number>()

  steps.push({
    id: id++,
    narrative:
      'Enter isAnagram. Lengths match — allocate counting storage and bind it to local `counts` (nonzero letter deltas).',
    why: 'Increment letters from s and decrement letters from t; anagrams cancel every delta to zero.',
    codeFocus: L.counts,
    callStack: [
      {
        name: 'isAnagram',
        active: true,
        locals: {
          s: { ref: 's' },
          t: { ref: 't' },
          counts: { ref: 'counts' },
          i: null,
        },
      },
    ],
    heap: [
      {
        id: 's',
        kind: 'array',
        label: 'String s',
        values: sArr,
        focused: true,
      },
      {
        id: 't',
        kind: 'array',
        label: 'String t',
        values: tArr,
        focused: true,
      },
      {
        id: 'counts',
        kind: 'hashmap',
        label: 'counts (nonzero deltas)',
        entries: [],
        focused: true,
      },
    ],
  })

  for (let i = 0; i < s.length; i++) {
    const sc = s[i]!
    const tc = t[i]!
    bumpCounts(counts, sc, 1)
    bumpCounts(counts, tc, -1)
    const entries = countsEntries(counts)
    const focusKeys = [sc, tc].filter((k) => counts.has(k))

    steps.push({
      id: id++,
      narrative: `i = ${i}. ++counts[${JSON.stringify(sc)}], --counts[${JSON.stringify(tc)}] at the same index.`,
      why: 'One synchronized pass avoids building two separate frequency tables.',
      codeFocus: L.loop,
      callStack: [
        {
          name: 'isAnagram',
          active: true,
          locals: {
            s: { ref: 's' },
            t: { ref: 't' },
            counts: { ref: 'counts' },
            i,
            's[i]': sc,
            't[i]': tc,
          },
        },
      ],
      heap: [
        {
          id: 's',
          kind: 'array',
          label: 'String s',
          values: sArr,
          highlights: [
            ...Array.from({ length: i }, (_, idx) => ({
              index: idx,
              role: 'visited' as const,
            })),
            { index: i, role: 'current' },
          ],
          pointers: { i },
          focused: true,
        },
        {
          id: 't',
          kind: 'array',
          label: 'String t',
          values: tArr,
          highlights: [
            ...Array.from({ length: i }, (_, idx) => ({
              index: idx,
              role: 'visited' as const,
            })),
            { index: i, role: 'current' },
          ],
          pointers: { i },
          focused: true,
        },
        {
          id: 'counts',
          kind: 'hashmap',
          label: 'counts (nonzero deltas)',
          entries,
          focusKeys,
          focused: true,
        },
      ],
    })
  }

  if (counts.size === 0) {
    steps.push({
      id: id++,
      narrative: 'Verify pass: every stored count is 0 — frequencies match.',
      why: 'The second loop in Java scans all 26 slots; here the map is already empty.',
      codeFocus: L.verify,
      callStack: [
        {
          name: 'isAnagram',
          active: true,
          locals: {
            s: { ref: 's' },
            t: { ref: 't' },
            counts: { ref: 'counts' },
          },
        },
      ],
      heap: [
        {
          id: 's',
          kind: 'array',
          label: 'String s',
          values: sArr,
          highlights: sArr.map((_, index) => ({ index, role: 'visited' as const })),
        },
        {
          id: 't',
          kind: 'array',
          label: 'String t',
          values: tArr,
          highlights: tArr.map((_, index) => ({ index, role: 'visited' as const })),
        },
        {
          id: 'counts',
          kind: 'hashmap',
          label: 'counts (nonzero deltas)',
          entries: [],
          focused: true,
        },
      ],
    })
    steps.push({
      id: id++,
      narrative: 'return true — t is an anagram of s.',
      why: 'O(n) time with O(1) alphabet space for lowercase a–z.',
      codeFocus: L.retTrue,
      callStack: [
        {
          name: 'isAnagram',
          active: true,
          locals: {
            s: { ref: 's' },
            t: { ref: 't' },
            counts: { ref: 'counts' },
            result: true,
          },
        },
      ],
      heap: [
        {
          id: 's',
          kind: 'array',
          label: 'String s',
          values: sArr,
          highlights: sArr.map((_, index) => ({ index, role: 'found' as const })),
          focused: true,
        },
        {
          id: 't',
          kind: 'array',
          label: 'String t',
          values: tArr,
          highlights: tArr.map((_, index) => ({ index, role: 'found' as const })),
          focused: true,
        },
        {
          id: 'counts',
          kind: 'hashmap',
          label: 'counts (nonzero deltas)',
          entries: [],
        },
      ],
    })
    return steps
  }

  const [badCh, badVal] = countsEntries(counts)[0]!
  steps.push({
    id: id++,
    narrative: `Verify finds counts[${JSON.stringify(badCh)}] = ${badVal} ≠ 0 → return false.`,
    why: 'At least one letter frequency differs, so the strings cannot be anagrams.',
    codeFocus: L.retFalse,
    callStack: [
      {
        name: 'isAnagram',
        active: true,
        locals: {
          s: { ref: 's' },
          t: { ref: 't' },
          counts: { ref: 'counts' },
          result: false,
        },
      },
    ],
    heap: [
      {
        id: 's',
        kind: 'array',
        label: 'String s',
        values: sArr,
        highlights: sArr.map((_, index) => ({ index, role: 'visited' as const })),
      },
      {
        id: 't',
        kind: 'array',
        label: 'String t',
        values: tArr,
        highlights: tArr.map((_, index) => ({ index, role: 'visited' as const })),
      },
      {
        id: 'counts',
        kind: 'hashmap',
        label: 'counts (nonzero deltas)',
        entries: countsEntries(counts),
        focusKeys: [badCh],
        focused: true,
      },
    ],
  })

  return steps
}

const stringLimits = {
  minLen: 0,
  maxLen: 16,
  charset: 'abcdefghijklmnopqrstuvwxyz',
} as const

const input = defineInput<ValidAnagramInput>({
  kind: 'twoLowercaseStrings',
  fields: [
    {
      key: 's',
      label: 's',
      widget: 'text',
      placeholder: 'anagram',
      hint: 'Lowercase a–z, up to 16 characters',
    },
    {
      key: 't',
      label: 't',
      widget: 'text',
      placeholder: 'nagaram',
      hint: 'Lowercase a–z, up to 16 characters',
    },
  ],
  defaultRaw: { s: defaultS, t: defaultT },
  parse: (raw) => {
    const sResult = parseString(raw.s ?? '', { name: 's', ...stringLimits })
    if (!sResult.ok) return sResult
    const tResult = parseString(raw.t ?? '', { name: 't', ...stringLimits })
    if (!tResult.ok) return tResult
    return { ok: true, value: { s: sResult.value, t: tResult.value } }
  },
  formatLabel: (value) => `s = "${value.s}", t = "${value.t}"`,
  generateSteps: generateValidAnagramSteps,
  fixtures: [
    { name: 'length-mismatch', raw: { s: 'ab', t: 'abc' } },
    { name: 'not-anagram', raw: { s: 'rat', t: 'car' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(`Valid Anagram default input invalid: ${defaultParsed.errors.join('; ')}`)
}

export const validAnagram: ProblemPack = {
  id: '0242-valid-anagram',
  lcNumber: 242,
  title: 'Valid Anagram',
  pattern: 'Hash Map',
  difficulty: 'Easy',
  insight: 'For lowercase a–z, int[26] beats a HashMap — fixed alphabet, O(1) space.',
  invariant: 'After processing both strings, every letter count must be zero for an anagram.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Fixed-size counting arrays keep memory flat; Python list ops still trail JVM tight loops.',
  ),
  walkthrough: {
    statement:
      'Return true if t is an anagram of s (same characters with the same frequencies).',
    keyIdea: 'Count character frequencies; anagrams have identical counts.',
    approach: [
      'If lengths differ, return false.',
      'Count chars in s (increment) and t (decrement), or use two maps.',
      'All counts must be zero.',
    ],
  },
}
