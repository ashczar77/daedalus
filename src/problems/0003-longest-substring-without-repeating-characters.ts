/**
 * LeetCode #3 - Longest Substring Without Repeating Characters.
 * Sliding window + set; steps from validated string input (Phase 4).
 */
import javaSrc from '../../algorithms/0003-longest-substring-without-repeating-characters/Solution.java?raw'
import kotlinSrc from '../../algorithms/0003-longest-substring-without-repeating-characters/Solution.kt?raw'
import pythonSrc from '../../algorithms/0003-longest-substring-without-repeating-characters/solution.py?raw'
import { defineInput, parseString } from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

/** Classic LC demo. */
const defaultS = 'abcabcbb'

const L = {
  enter: { java: 9, kotlin: 6, python: 6 },
  shrink: { java: 15, kotlin: 12, python: 11 },
  expand: { java: 18, kotlin: 15, python: 13 },
  update: { java: 19, kotlin: 16, python: 14 },
  ret: { java: 21, kotlin: 18, python: 15 },
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

function seenHeap(seen: Set<string>, focusKeys: string[] = []): HeapObject {
  return {
    id: 'seen',
    kind: 'hashmap',
    label: 'seen (set)',
    entries: [...seen].map((ch) => [ch, '✓'] as [string, string]),
    focusKeys,
    focused: true,
  }
}

function windowHighlights(
  left: number,
  right: number,
  n: number,
  duplicate?: number,
): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let i = 0; i < n; i++) {
    if (i < left || i > right) out.push({ index: i, role: 'visited' })
    else if (i === right) out.push({ index: i, role: 'current' })
    else out.push({ index: i, role: 'window' })
  }
  if (duplicate != null && duplicate !== right) {
    out[duplicate] = { index: duplicate, role: 'found' }
  }
  return out
}

function generateLongestSubstringSteps(s: string): Step[] {
  const chars = [...s]
  const n = chars.length
  const seen = new Set<string>()
  let left = 0
  let best = 0
  let bestLeft = 0
  let bestRight = -1
  const steps: Step[] = []
  let id = 1

  steps.push({
    id: id++,
    narrative:
      n === 0
        ? 'Enter lengthOfLongestSubstring on "". Window never expands → return 0.'
        : 'Enter lengthOfLongestSubstring. Empty set, left=0, best=0.',
    why: 'The set tracks characters inside the current unique window [left, right].',
    codeFocus: L.enter,
    callStack: [
      {
        name: 'lengthOfLongestSubstring',
        active: true,
        locals: {
          s: { ref: 's' },
          seen: { ref: 'seen' },
          left: 0,
          best: 0,
        },
      },
    ],
    heap: [
      stringHeap(chars, 0, Math.max(0, n - 1), []),
      seenHeap(seen),
    ],
  })

  if (n === 0) {
    steps.push({
      id: id++,
      narrative: 'Return best=0.',
      why: 'No characters means no non-empty substring.',
      codeFocus: L.ret,
      callStack: [
        {
          name: 'lengthOfLongestSubstring',
          active: true,
          locals: { s: { ref: 's' }, best: 0, result: 0 },
        },
      ],
      heap: [stringHeap(chars, 0, 0, []), seenHeap(seen)],
    })
    return steps
  }

  for (let right = 0; right < n; right++) {
    const ch = chars[right]!

    while (seen.has(ch)) {
      const drop = chars[left]!
      seen.delete(drop)
      const prevLeft = left
      left += 1
      steps.push({
        id: id++,
        narrative: `right=${right} ch="${ch}" already in window → remove s[${prevLeft}]="${drop}", left=${left}.`,
        why: 'Shrink from the left until the duplicate is gone so the window stays unique.',
        codeFocus: L.shrink,
        callStack: [
          {
            name: 'lengthOfLongestSubstring',
            active: true,
            locals: {
              s: { ref: 's' },
              seen: { ref: 'seen' },
              left,
              right,
              ch,
              best,
            },
          },
        ],
        heap: [
          stringHeap(
            chars,
            left,
            right,
            windowHighlights(left, right, n, prevLeft),
          ),
          seenHeap(seen, [ch]),
        ],
      })
    }

    seen.add(ch)
    steps.push({
      id: id++,
      narrative: `right=${right} → add "${ch}" to the set. Window=[${left}, ${right}].`,
      why: 'Expand the right edge after the window is unique again.',
      codeFocus: L.expand,
      callStack: [
        {
          name: 'lengthOfLongestSubstring',
          active: true,
          locals: {
            s: { ref: 's' },
            seen: { ref: 'seen' },
            left,
            right,
            ch,
            best,
          },
        },
      ],
      heap: [
        stringHeap(chars, left, right, windowHighlights(left, right, n)),
        seenHeap(seen, [ch]),
      ],
    })

    const len = right - left + 1
    const improved = len > best
    if (improved) {
      best = len
      bestLeft = left
      bestRight = right
    }
    steps.push({
      id: id++,
      narrative: `Length=${len}${improved ? ` → best=${best}` : ` ≤ best=${best}`}.`,
      why: improved
        ? 'Record the longest unique window seen so far.'
        : 'Window is valid but not longer than the best so far.',
      codeFocus: L.update,
      callStack: [
        {
          name: 'lengthOfLongestSubstring',
          active: true,
          locals: {
            s: { ref: 's' },
            seen: { ref: 'seen' },
            left,
            right,
            len,
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
        seenHeap(seen),
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
    why: 'Each index enters and leaves the set at most once → O(n).',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'lengthOfLongestSubstring',
        active: true,
        locals: {
          s: { ref: 's' },
          seen: { ref: 'seen' },
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
      seenHeap(seen),
    ],
  })

  return steps
}

const input = defineInput<string>({
  kind: 'string',
  fields: [
    {
      key: 's',
      label: 's',
      widget: 'text',
      placeholder: 'abcabcbb',
      hint: 'Up to 16 printable characters',
    },
  ],
  defaultRaw: { s: defaultS },
  parse: (raw) =>
    parseString(raw.s ?? '', {
      name: 's',
      minLen: 0,
      maxLen: 16,
    }),
  formatLabel: (value) => `s = "${value}"`,
  generateSteps: generateLongestSubstringSteps,
  fixtures: [
    { name: 'empty', raw: { s: '' } },
    { name: 'all-unique', raw: { s: 'abcdef' } },
    { name: 'all-same', raw: { s: 'bbbbb' } },
    { name: 'spaced', raw: { s: 'pwwkew' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Longest Substring default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const longestSubstringWithoutRepeating: ProblemPack = {
  id: '0003-longest-substring-without-repeating-characters',
  lcNumber: 3,
  title: 'Longest Substring Without Repeating Characters',
  pattern: 'Sliding Window',
  difficulty: 'Medium',
  insight:
    'Expand right; while the new char is already in the window set, shrink left; then add and update max length.',
  invariant:
    'Window [left, right] always holds unique characters; seen is exactly the set of chars in that window.',
  complexity: {
    time: 'O(n)',
    space: 'O(min(n, alphabet))',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: defaultS.length },
  benchmark: placeholderBenchmark(
    'Sliding window is linear; nested “restart from each left” scans are quadratic.',
  ),
  walkthrough: {
    statement:
      'Find the length of the longest substring of s with all unique characters.',
    keyIdea:
      'Maintain a unique window with a set; shrink from the left when a duplicate arrives.',
    approach: [
      'seen = {}, left = 0, best = 0.',
      'For each right: shrink until s[right] is free, add it, update best.',
      'Return best.',
    ],
  },
}
