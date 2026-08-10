/**
 * LeetCode #424 - Longest Repeating Character Replacement.
 * Sliding window + frequency counts; replacements keep the window valid.
 */
import javaSrc from '../../algorithms/0424-longest-repeating-character-replacement/Solution.java?raw'
import kotlinSrc from '../../algorithms/0424-longest-repeating-character-replacement/Solution.kt?raw'
import pythonSrc from '../../algorithms/0424-longest-repeating-character-replacement/solution.py?raw'
import {
  defineInput,
  parseIntValue,
  parseString,
} from '../engine/input'
import type { ParseResult } from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { s: string; k: number }

/** Classic LC demo: answer 4 (replace one B → AAAA). */
const defaultS = 'AABABBA'
const defaultK = 1

const L = {
  enter: { java: 6, kotlin: 5, python: 5 },
  expand: { java: 12, kotlin: 11, python: 11 },
  shrink: { java: 15, kotlin: 14, python: 14 },
  update: { java: 18, kotlin: 17, python: 16 },
  ret: { java: 20, kotlin: 19, python: 17 },
} as const

function stringHeap(
  chars: string[],
  left: number,
  right: number,
  highlights: ArrayHighlight[],
): HeapObject {
  return {
    id: 's',
    kind: 'array',
    label: 'char[] s',
    values: chars,
    pointers: { left, right },
    highlights,
    focused: true,
  }
}

function countHeap(
  count: number[],
  focusKeys: string[] = [],
): HeapObject {
  const entries: Array<[string, number]> = []
  for (let i = 0; i < 26; i++) {
    if (count[i]! > 0) {
      entries.push([String.fromCharCode(65 + i), count[i]!])
    }
  }
  return {
    id: 'count',
    kind: 'hashmap',
    label: 'count (window)',
    entries,
    focusKeys,
    focused: true,
  }
}

function windowHighlights(
  left: number,
  right: number,
  n: number,
): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let i = 0; i < n; i++) {
    if (i < left || i > right) out.push({ index: i, role: 'visited' })
    else if (i === right) out.push({ index: i, role: 'current' })
    else out.push({ index: i, role: 'window' })
  }
  return out
}

function generateSteps({ s, k }: Input): Step[] {
  const chars = [...s]
  const n = chars.length
  const count = Array.from({ length: 26 }, () => 0)
  let left = 0
  let best = 0
  let maxFreq = 0
  let bestLeft = 0
  let bestRight = -1
  const steps: Step[] = []
  let id = 1

  steps.push({
    id: id++,
    narrative:
      n === 0
        ? 'Enter characterReplacement on "". Window never expands → return 0.'
        : `Enter characterReplacement. k=${k} replacements allowed inside the window.`,
    why: 'Window length − maxFreq is how many chars must be replaced to make the window one letter.',
    codeFocus: L.enter,
    callStack: [
      {
        name: 'characterReplacement',
        active: true,
        locals: {
          s: { ref: 's' },
          count: { ref: 'count' },
          k,
          left: 0,
          best: 0,
          maxFreq: 0,
        },
      },
    ],
    heap: [stringHeap(chars, 0, Math.max(0, n - 1), []), countHeap(count)],
  })

  if (n === 0) {
    steps.push({
      id: id++,
      narrative: 'Return best=0.',
      why: 'No characters means no non-empty window.',
      codeFocus: L.ret,
      callStack: [
        {
          name: 'characterReplacement',
          active: true,
          locals: { s: { ref: 's' }, k, best: 0, result: 0 },
        },
      ],
      heap: [stringHeap(chars, 0, 0, []), countHeap(count)],
    })
    return steps
  }

  for (let right = 0; right < n; right++) {
    const ch = chars[right]!
    const idx = ch.charCodeAt(0) - 65
    count[idx]! += 1
    maxFreq = Math.max(maxFreq, count[idx]!)
    const need = right - left + 1 - maxFreq

    steps.push({
      id: id++,
      narrative: `right=${right} → count["${ch}"]=${count[idx]}. maxFreq=${maxFreq}; need ${need} replacement(s).`,
      why: 'Expand first; then shrink only if the window needs more than k swaps.',
      codeFocus: L.expand,
      callStack: [
        {
          name: 'characterReplacement',
          active: true,
          locals: {
            s: { ref: 's' },
            count: { ref: 'count' },
            k,
            left,
            right,
            ch,
            maxFreq,
            need,
            best,
          },
        },
      ],
      heap: [
        stringHeap(chars, left, right, windowHighlights(left, right, n)),
        countHeap(count, [ch]),
      ],
    })

    while (right - left + 1 - maxFreq > k) {
      const drop = chars[left]!
      const dropIdx = drop.charCodeAt(0) - 65
      count[dropIdx]! -= 1
      const prevLeft = left
      left += 1
      steps.push({
        id: id++,
        narrative: `Need > k → drop s[${prevLeft}]="${drop}", left=${left}.`,
        why: 'maxFreq is kept as a historical peak; shrinking still finds the longest valid window.',
        codeFocus: L.shrink,
        callStack: [
          {
            name: 'characterReplacement',
            active: true,
            locals: {
              s: { ref: 's' },
              count: { ref: 'count' },
              k,
              left,
              right,
              maxFreq,
              best,
            },
          },
        ],
        heap: [
          stringHeap(chars, left, right, windowHighlights(left, right, n)),
          countHeap(count, [drop]),
        ],
      })
    }

    const len = right - left + 1
    const improved = len > best
    if (improved) {
      best = len
      bestLeft = left
      bestRight = right
    }
    steps.push({
      id: id++,
      narrative: `Window=[${left}, ${right}] length=${len}${improved ? ` → best=${best}` : ` ≤ best=${best}`}.`,
      why: improved
        ? 'This window can become one character with ≤ k replacements.'
        : 'Valid window, but not longer than the best so far.',
      codeFocus: L.update,
      callStack: [
        {
          name: 'characterReplacement',
          active: true,
          locals: {
            s: { ref: 's' },
            count: { ref: 'count' },
            k,
            left,
            right,
            len,
            maxFreq,
            best,
          },
        },
      ],
      heap: [
        stringHeap(
          chars,
          left,
          right,
          improved
            ? windowHighlights(left, right, n).map((h) =>
                h.index >= left && h.index <= right
                  ? { index: h.index, role: 'found' as const }
                  : h,
              )
            : windowHighlights(left, right, n),
        ),
        countHeap(count),
      ],
    })
  }

  steps.push({
    id: id++,
    narrative: `Scan complete. Return best=${best}${
      bestRight >= 0
        ? ` (window "${chars.slice(bestLeft, bestRight + 1).join('')}")`
        : ''
    }.`,
    why: 'Each index enters and leaves the window at most once → O(n).',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'characterReplacement',
        active: true,
        locals: {
          s: { ref: 's' },
          count: { ref: 'count' },
          k,
          best,
          result: best,
        },
      },
    ],
    heap: [
      stringHeap(
        chars,
        bestLeft,
        Math.max(bestLeft, bestRight),
        bestRight >= 0
          ? Array.from({ length: n }, (_, i) =>
              i >= bestLeft && i <= bestRight
                ? { index: i, role: 'found' as const }
                : { index: i, role: 'visited' as const },
            )
          : [],
      ),
      countHeap(count),
    ],
  })

  return steps
}

function parseInput(raw: Record<string, string>): ParseResult<Input> {
  const sResult = parseString(raw.s ?? '', {
    name: 's',
    minLen: 0,
    maxLen: 12,
  })
  if (!sResult.ok) return sResult

  for (const ch of sResult.value) {
    if (ch < 'A' || ch > 'Z') {
      return {
        ok: false,
        errors: ['s must use uppercase A-Z only (matches the demo solutions).'],
      }
    }
  }

  const kResult = parseIntValue(raw.k ?? '', {
    name: 'k',
    minVal: 0,
    maxVal: 12,
  })
  if (!kResult.ok) return kResult

  if (kResult.value > sResult.value.length) {
    return {
      ok: false,
      errors: [`k must be ≤ length of s (${sResult.value.length}).`],
    }
  }

  return { ok: true, value: { s: sResult.value, k: kResult.value } }
}

const input = defineInput<Input>({
  kind: 'stringAndK',
  fields: [
    {
      key: 's',
      label: 's',
      widget: 'text',
      placeholder: 'AABABBA',
      hint: 'Up to 12 uppercase letters A-Z',
    },
    {
      key: 'k',
      label: 'k',
      widget: 'text',
      placeholder: '1',
      hint: 'Replacements allowed (0 … |s|)',
    },
  ],
  defaultRaw: { s: defaultS, k: String(defaultK) },
  parse: parseInput,
  formatLabel: ({ s, k }) => `s = "${s}", k = ${k}`,
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { s: '', k: '0' } },
    { name: 'all-same', raw: { s: 'AAAA', k: '2' } },
    { name: 'need-replacements', raw: { s: 'ABAB', k: '2' } },
    { name: 'k-zero', raw: { s: 'AABABBA', k: '0' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Character Replacement default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const longestRepeatingCharacterReplacement: ProblemPack = {
  id: '0424-longest-repeating-character-replacement',
  lcNumber: 424,
  title: 'Longest Repeating Character Replacement',
  pattern: 'Sliding Window',
  difficulty: 'Medium',
  insight:
    'Expand right and track maxFreq; shrink while windowLen − maxFreq > k, then update best length.',
  invariant:
    'After the shrink loop, the window needs at most k replacements to become one character.',
  complexity: {
    time: 'O(n)',
    space: 'O(1)',
    notes: 'Count array is fixed size 26 for A-Z.',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: defaultS.length },
  benchmark: placeholderBenchmark(
    'Sliding window is linear; restarting a fresh count from every left index is quadratic.',
  ),
  walkthrough: {
    statement:
      'Return the length of the longest substring that can become all one character after at most k replacements.',
    keyIdea:
      'A window is valid when length − mostFrequentChar ≤ k; slide until that holds.',
    approach: [
      'count[], left = 0, best = 0, maxFreq = 0.',
      'For each right: bump count, refresh maxFreq.',
      'While length − maxFreq > k, drop s[left] and advance left.',
      'Update best with the current window length; return best.',
    ],
  },
}
