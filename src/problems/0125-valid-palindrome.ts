/**
 * LeetCode #125 — Valid Palindrome (two pointers, skip non-alphanumeric).
 * Demo: s = "race a car" → false (after cleaning: "raceacar").
 */
import javaSrc from '../../algorithms/0125-valid-palindrome/Solution.java?raw'
import kotlinSrc from '../../algorithms/0125-valid-palindrome/Solution.kt?raw'
import pythonSrc from '../../algorithms/0125-valid-palindrome/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const chars = ['r', 'a', 'c', 'e', ' ', 'a', ' ', 'c', 'a', 'r']

const steps: Step[] = [
  {
    id: 1,
    message: 'Place left at the start and right at the end of the string.',
    codeFocus: { java: 7, kotlin: 7, python: 7 },
    variables: { left: 0, right: 9 },
    scene: {
      type: 'array',
      label: 's',
      values: chars,
      pointers: { left: 0, right: 9 },
      highlights: [
        { index: 0, role: 'current' },
        { index: 9, role: 'current' },
      ],
    },
  },
  {
    id: 2,
    message: 'Both ends are letters. Compare lowercase: "r" vs "r" — match, then move inward.',
    codeFocus: { java: 15, kotlin: 11, python: 13 },
    variables: { left: 0, right: 9, compare: 'r == r' },
    scene: {
      type: 'array',
      label: 's',
      values: chars,
      pointers: { left: 0, right: 9 },
      highlights: [
        { index: 0, role: 'compare' },
        { index: 9, role: 'compare' },
      ],
    },
  },
  {
    id: 3,
    message: 'left=1, right=8 → "a" vs "a". Match again.',
    codeFocus: { java: 15, kotlin: 11, python: 13 },
    variables: { left: 1, right: 8, compare: 'a == a' },
    scene: {
      type: 'array',
      label: 's',
      values: chars,
      pointers: { left: 1, right: 8 },
      highlights: [
        { index: 1, role: 'compare' },
        { index: 8, role: 'compare' },
      ],
    },
  },
  {
    id: 4,
    message: 'left=2, right=7 → "c" vs "c". Still matching.',
    codeFocus: { java: 15, kotlin: 11, python: 13 },
    variables: { left: 2, right: 7, compare: 'c == c' },
    scene: {
      type: 'array',
      label: 's',
      values: chars,
      pointers: { left: 2, right: 7 },
      highlights: [
        { index: 2, role: 'compare' },
        { index: 7, role: 'compare' },
      ],
    },
  },
  {
    id: 5,
    message: 'left=3 ("e"), right=5 — skip the space at index 6 first, then compare "e" vs "a". Mismatch → false.',
    codeFocus: { java: 16, kotlin: 11, python: 14 },
    variables: { left: 3, right: 5, compare: 'e != a', result: false },
    scene: {
      type: 'array',
      label: 's',
      values: chars,
      pointers: { left: 3, right: 5 },
      highlights: [
        { index: 3, role: 'compare' },
        { index: 4, role: 'discard' },
        { index: 5, role: 'compare' },
        { index: 6, role: 'discard' },
      ],
    },
  },
]

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
  inputLabel: 's = "race a car"',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark(
    'Two-pointer scan is linear in all languages; Python is slower mainly from interpreter overhead.',
  ),
  walkthrough: {
    statement:
      "Return true if s is a palindrome after converting to lowercase and removing non-alphanumeric characters.",
    keyIdea:
      "Two pointers from both ends, skipping junk, comparing equal characters.",
    approach: [
          "left=0, right=n-1.",
          "Skip non-alphanumeric on each side.",
          "Compare lowercased chars; mismatch → false; meet → true."
    ],
  },
}
