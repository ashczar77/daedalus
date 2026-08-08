/**
 * LeetCode #125 — Valid Palindrome (two pointers, skip non-alphanumeric).
 * Steps generated from validated string input (Phase 4).
 */
import javaSrc from '../../algorithms/0125-valid-palindrome/Solution.java?raw'
import kotlinSrc from '../../algorithms/0125-valid-palindrome/Solution.kt?raw'
import pythonSrc from '../../algorithms/0125-valid-palindrome/solution.py?raw'
import { defineInput, parseString } from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const defaultS = 'race a car'

const L = {
  init: { java: 7, kotlin: 7, python: 7 },
  skipLeft: { java: 9, kotlin: 9, python: 9 },
  skipRight: { java: 12, kotlin: 10, python: 11 },
  compare: { java: 15, kotlin: 11, python: 13 },
  mismatch: { java: 16, kotlin: 11, python: 14 },
  ret: { java: 21, kotlin: 15, python: 17 },
} as const

function isAlnum(ch: string): boolean {
  return /[A-Za-z0-9]/.test(ch)
}

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

function generateValidPalindromeSteps(s: string): Step[] {
  const chars = [...s]
  const n = chars.length
  let left = 0
  let right = n - 1
  let id = 1
  const steps: Step[] = []

  steps.push({
    id: id++,
    narrative:
      n === 0
        ? 'Enter isPalindrome on an empty string. left=0, right=-1 → return true.'
        : `Enter isPalindrome. Place left at 0 and right at ${n - 1}.`,
    why: 'Two pointers scan inward; only alphanumeric characters participate in comparisons.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'isPalindrome',
        active: true,
        locals: { s: { ref: 's' }, left, right },
      },
    ],
    heap: [
      stringHeap(
        chars,
        left,
        Math.max(0, right),
        n === 0
          ? []
          : [
              { index: left, role: 'current' },
              { index: right, role: 'current' },
            ],
      ),
    ],
  })

  if (n === 0) {
    steps.push({
      id: id++,
      narrative: 'No characters to compare → return true.',
      why: 'Vacuously a palindrome.',
      codeFocus: L.ret,
      callStack: [
        {
          name: 'isPalindrome',
          active: true,
          locals: { s: { ref: 's' }, left, right, result: true },
        },
      ],
      heap: [stringHeap(chars, 0, 0, [])],
    })
    return steps
  }

  while (left < right) {
    while (left < right && !isAlnum(chars[left]!)) {
      const idx = left
      steps.push({
        id: id++,
        narrative: `left=${idx} is '${chars[idx]}' — not alphanumeric → left++.`,
        why: 'Spaces and punctuation are ignored entirely.',
        codeFocus: L.skipLeft,
        callStack: [
          {
            name: 'isPalindrome',
            active: true,
            locals: { s: { ref: 's' }, left: idx, right },
          },
        ],
        heap: [
          stringHeap(chars, idx, right, [{ index: idx, role: 'discard' }]),
        ],
      })
      left += 1
    }

    while (left < right && !isAlnum(chars[right]!)) {
      const idx = right
      steps.push({
        id: id++,
        narrative: `right=${idx} is '${chars[idx]}' — not alphanumeric → right--.`,
        why: 'Shrink the window from the right past junk characters.',
        codeFocus: L.skipRight,
        callStack: [
          {
            name: 'isPalindrome',
            active: true,
            locals: { s: { ref: 's' }, left, right: idx },
          },
        ],
        heap: [
          stringHeap(chars, left, idx, [{ index: idx, role: 'discard' }]),
        ],
      })
      right -= 1
    }

    if (left >= right) break

    const rawL = chars[left]!
    const rawR = chars[right]!
    const lc = rawL.toLowerCase()
    const rc = rawR.toLowerCase()

    if (lc !== rc) {
      steps.push({
        id: id++,
        narrative: `left=${left} ('${rawL}'), right=${right} ('${rawR}') — lowercase '${lc}' vs '${rc}' → mismatch, return false.`,
        why: 'First unequal pair proves the cleaned string is not a palindrome.',
        codeFocus: L.mismatch,
        callStack: [
          {
            name: 'isPalindrome',
            active: true,
            locals: {
              s: { ref: 's' },
              left,
              right,
              compare: `${lc} != ${rc}`,
              result: false,
            },
          },
        ],
        heap: [
          stringHeap(chars, left, right, [
            { index: left, role: 'compare' },
            { index: right, role: 'compare' },
          ]),
        ],
      })
      return steps
    }

    steps.push({
      id: id++,
      narrative: `left=${left}, right=${right} → lowercase '${lc}' vs '${rc}' — match, then move inward.`,
      why: 'Equal characters at both ends; shrink the window and continue.',
      codeFocus: L.compare,
      callStack: [
        {
          name: 'isPalindrome',
          active: true,
          locals: {
            s: { ref: 's' },
            left,
            right,
            compare: `${lc} == ${rc}`,
          },
        },
      ],
      heap: [
        stringHeap(chars, left, right, [
          { index: left, role: 'compare' },
          { index: right, role: 'compare' },
        ]),
      ],
    })

    left += 1
    right -= 1
  }

  steps.push({
    id: id++,
    narrative: 'Pointers met or crossed with no mismatch → return true.',
    why: 'Every compared alphanumeric pair matched.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'isPalindrome',
        active: true,
        locals: { s: { ref: 's' }, left, right, result: true },
      },
    ],
    heap: [stringHeap(chars, left, Math.max(left, right), [])],
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
      placeholder: 'race a car',
      hint: 'Up to 24 printable characters',
    },
  ],
  defaultRaw: { s: defaultS },
  parse: (raw) =>
    parseString(raw.s ?? '', {
      name: 's',
      minLen: 0,
      maxLen: 24,
    }),
  formatLabel: (value) => `s = "${value}"`,
  generateSteps: generateValidPalindromeSteps,
  fixtures: [
    { name: 'empty', raw: { s: '' } },
    { name: 'simple-true', raw: { s: 'aba' } },
    { name: 'spaces-only', raw: { s: ' ' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(`Valid Palindrome default input invalid: ${defaultParsed.errors.join('; ')}`)
}

export const validPalindrome: ProblemPack = {
  id: '0125-valid-palindrome',
  lcNumber: 125,
  title: 'Valid Palindrome',
  pattern: 'Two Pointers',
  difficulty: 'Easy',
  insight:
    'Skip non-alphanumeric inline; compare Character.toLowerCase / .lower() on chars — never compare String objects with !=.',
  invariant:
    'left and right always point at the next alphanumeric characters still left to compare.',
  complexity: {
    time: 'O(n)',
    space: 'O(1)',
    notes: 'A StringBuilder clean-copy works but uses O(n) extra space.',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Two-pointer scan is linear in all languages; Python is slower mainly from interpreter overhead.',
  ),
  walkthrough: {
    statement:
      'Return true if s is a palindrome after converting to lowercase and removing non-alphanumeric characters.',
    keyIdea: 'Two pointers from both ends, skipping junk, comparing equal characters.',
    approach: [
      'left=0, right=n-1.',
      'Skip non-alphanumeric on each side.',
      'Compare lowercased chars; mismatch → false; meet → true.',
    ],
  },
}
