/**
 * LeetCode #242 — Valid Anagram (frequency array of size 26).
 * Demo: s = "anagram", t = "nagaram" → true.
 */
import javaSrc from '../../algorithms/0242-valid-anagram/Solution.java?raw'
import kotlinSrc from '../../algorithms/0242-valid-anagram/Solution.kt?raw'
import pythonSrc from '../../algorithms/0242-valid-anagram/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const sChars = ['a', 'n', 'a', 'g', 'r', 'a', 'm']
const tChars = ['n', 'a', 'g', 'a', 'r', 'a', 'm']

const steps: Step[] = [
  {
    id: 1,
    message: 'Lengths match (7). Allocate counts[26] and walk both strings together.',
    codeFocus: { java: 9, kotlin: 7, python: 8 },
    variables: { 's.length': 7, 't.length': 7 },
    scene: {
      type: 'group',
      children: [
        { type: 'array', label: 's', values: sChars },
        { type: 'array', label: 't', values: tChars },
        { type: 'hashmap', label: 'counts (nonzero)', entries: [] },
      ],
    },
  },
  {
    id: 2,
    message: 'i=0: ++counts[a], --counts[n].',
    codeFocus: { java: 11, kotlin: 9, python: 10 },
    variables: { i: 0, 's[i]': 'a', 't[i]': 'n' },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 's',
          values: sChars,
          highlights: [{ index: 0, role: 'current' }],
        },
        {
          type: 'array',
          label: 't',
          values: tChars,
          highlights: [{ index: 0, role: 'current' }],
        },
        {
          type: 'hashmap',
          label: 'counts (nonzero)',
          entries: [
            ['a', 1],
            ['n', -1],
          ],
          focusKeys: ['a', 'n'],
        },
      ],
    },
  },
  {
    id: 3,
    message: 'After a few more indices, counts drift as letters are added from s and removed from t.',
    codeFocus: { java: 11, kotlin: 9, python: 10 },
    variables: { i: 2 },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 's',
          values: sChars,
          highlights: [
            { index: 0, role: 'visited' },
            { index: 1, role: 'visited' },
            { index: 2, role: 'current' },
          ],
        },
        {
          type: 'array',
          label: 't',
          values: tChars,
          highlights: [
            { index: 0, role: 'visited' },
            { index: 1, role: 'visited' },
            { index: 2, role: 'current' },
          ],
        },
        {
          type: 'hashmap',
          label: 'counts (nonzero)',
          entries: [
            ['a', 1],
            ['n', 0],
            ['g', -1],
          ],
          focusKeys: ['a', 'g'],
        },
      ],
    },
  },
  {
    id: 4,
    message: 'After the full pass every count returns to 0 — the strings are anagrams.',
    codeFocus: { java: 19, kotlin: 12, python: 12 },
    variables: { result: true },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 's',
          values: sChars,
          highlights: sChars.map((_, index) => ({ index, role: 'found' as const })),
        },
        {
          type: 'array',
          label: 't',
          values: tChars,
          highlights: tChars.map((_, index) => ({ index, role: 'found' as const })),
        },
        { type: 'hashmap', label: 'counts (nonzero)', entries: [] },
      ],
    },
  },
]

export const validAnagram: ProblemPack = {
  id: '0242-valid-anagram',
  lcNumber: 242,
  title: 'Valid Anagram',
  pattern: 'Hash Map',
  difficulty: 'Easy',
  insight: 'For lowercase a–z, int[26] beats a HashMap — fixed alphabet, O(1) space.',
  invariant: 'After processing both strings, every letter count must be zero for an anagram.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: 's = "anagram", t = "nagaram"',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark(
    'Fixed-size counting arrays keep memory flat; Python list ops still trail JVM tight loops.',
  ),
  walkthrough: {
    statement:
      "Return true if t is an anagram of s (same characters with the same frequencies).",
    keyIdea:
      "Count character frequencies; anagrams have identical counts.",
    approach: [
          "If lengths differ, return false.",
          "Count chars in s (increment) and t (decrement), or use two maps.",
          "All counts must be zero."
    ],
  },
}
