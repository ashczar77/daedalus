/**
 * LeetCode #217 — Contains Duplicate (hash set membership).
 * Demo input: nums = [1, 2, 3, 1]. The set is rendered via HashMapScene chips.
 */
import javaSrc from '../../algorithms/0217-contains-duplicate/Solution.java?raw'
import kotlinSrc from '../../algorithms/0217-contains-duplicate/Solution.kt?raw'
import pythonSrc from '../../algorithms/0217-contains-duplicate/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'

const nums = [1, 2, 3, 1]

/** Walk through inserting values until the first duplicate is found. */
const steps: Step[] = [
  {
    id: 1,
    message: 'Create an empty set. We only need presence, not counts or indices.',
    codeFocus: { java: 9, kotlin: 6, python: 6 },
    variables: { result: null },
    scene: {
      type: 'group',
      children: [
        { type: 'array', label: 'nums', values: nums },
        { type: 'hashmap', label: 'seen (set)', entries: [] },
      ],
    },
  },
  {
    id: 2,
    message: 'Read 1. It is not in the set, so add it.',
    codeFocus: { java: 11, kotlin: 8, python: 10 },
    variables: { num: 1 },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'nums',
          values: nums,
          highlights: [{ index: 0, role: 'current' }],
          pointers: { i: 0 },
        },
        {
          type: 'hashmap',
          label: 'seen (set)',
          entries: [[1, '✓']],
          focusKeys: [1],
        },
      ],
    },
  },
  {
    id: 3,
    message: 'Read 2. New value — add it.',
    codeFocus: { java: 11, kotlin: 8, python: 10 },
    variables: { num: 2 },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'nums',
          values: nums,
          highlights: [
            { index: 0, role: 'visited' },
            { index: 1, role: 'current' },
          ],
          pointers: { i: 1 },
        },
        {
          type: 'hashmap',
          label: 'seen (set)',
          entries: [
            [1, '✓'],
            [2, '✓'],
          ],
          focusKeys: [2],
        },
      ],
    },
  },
  {
    id: 4,
    message: 'Read 3. Still unique — add it.',
    codeFocus: { java: 11, kotlin: 8, python: 10 },
    variables: { num: 3 },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'nums',
          values: nums,
          highlights: [
            { index: 0, role: 'visited' },
            { index: 1, role: 'visited' },
            { index: 2, role: 'current' },
          ],
          pointers: { i: 2 },
        },
        {
          type: 'hashmap',
          label: 'seen (set)',
          entries: [
            [1, '✓'],
            [2, '✓'],
            [3, '✓'],
          ],
          focusKeys: [3],
        },
      ],
    },
  },
  {
    id: 5,
    message: 'Read 1 again. Set.add returns false (Python: already in set) — duplicate found.',
    codeFocus: { java: 12, kotlin: 9, python: 9 },
    variables: { num: 1, result: true },
    scene: {
      type: 'group',
      children: [
        {
          type: 'array',
          label: 'nums',
          values: nums,
          highlights: [
            { index: 0, role: 'found' },
            { index: 3, role: 'found' },
          ],
          pointers: { i: 3 },
        },
        {
          type: 'hashmap',
          label: 'seen (set)',
          entries: [
            [1, '✓'],
            [2, '✓'],
            [3, '✓'],
          ],
          focusKeys: [1],
        },
      ],
    },
  },
]

export const containsDuplicate: ProblemPack = {
  id: '0217-contains-duplicate',
  lcNumber: 217,
  title: 'Contains Duplicate',
  pattern: 'Hash Set',
  difficulty: 'Easy',
  insight: 'Only presence matters — HashSet is the right tool, not a map of counts.',
  invariant:
    'The set holds every value seen so far; a duplicate is found if the current value is already present before insert.',
  complexity: {
    time: 'O(n)',
    space: 'O(n)',
  },
  inputLabel: 'nums = [1, 2, 3, 1]',
  languages: {
    java: javaSrc,
    kotlin: kotlinSrc,
    python: pythonSrc,
  },
  steps,
  benchmark: {
    sizes: [1_000, 10_000, 100_000],
    series: [
      {
        language: 'java',
        points: [
          { n: 1_000, ms: 0.06 },
          { n: 10_000, ms: 0.35 },
          { n: 100_000, ms: 3.4 },
        ],
      },
      {
        language: 'kotlin',
        points: [
          { n: 1_000, ms: 0.07 },
          { n: 10_000, ms: 0.39 },
          { n: 100_000, ms: 3.8 },
        ],
      },
      {
        language: 'python',
        points: [
          { n: 1_000, ms: 0.12 },
          { n: 10_000, ms: 1.1 },
          { n: 100_000, ms: 12.2 },
        ],
      },
    ],
    note: 'Set membership is amortized O(1) in all three languages; Python stays slower in absolute time due to interpreter overhead.',
  },
  walkthrough: {
    statement:
      "Return true if any value appears at least twice in the array; otherwise false.",
    keyIdea:
      "A hash set remembers values already seen — duplicate means membership hit.",
    approach: [
          "Create an empty set.",
          "For each number, if already in the set return true; else insert.",
          "If the loop finishes, return false."
    ],
  },
}
