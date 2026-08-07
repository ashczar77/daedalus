/**
 * LeetCode #1 — Two Sum (hash map / complement lookup).
 * Storytelling pack: call stack locals + heap array/map with references.
 * Demo: nums = [2,7,11,15], target = 9.
 */
import javaSrc from '../../algorithms/0001-two-sum/Solution.java?raw'
import kotlinSrc from '../../algorithms/0001-two-sum/Solution.kt?raw'
import pythonSrc from '../../algorithms/0001-two-sum/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'

const nums = [2, 7, 11, 15]
const target = 9

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Enter twoSum. Allocate an empty HashMap on the heap and bind it to local `seen`.',
    why: 'The map will remember every value we have already scanned so complements are O(1) lookups.',
    codeFocus: { java: 9, kotlin: 6, python: 6 },
    callStack: [
      {
        name: 'twoSum',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target,
          seen: { ref: 'seen' },
          i: null,
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums (argument)',
        values: nums,
        focused: true,
      },
      {
        id: 'seen',
        kind: 'hashmap',
        label: 'Map<Integer,Integer> seen',
        entries: [],
        focused: true,
      },
    ],
  },
  {
    id: 2,
    narrative: 'i = 0. Read nums[0] = 2 from the heap array. Compute complement = 9 − 2 = 7.',
    why: 'If 7 were already in `seen`, we would be done. It is not — we have not stored anything yet.',
    codeFocus: { java: 11, kotlin: 8, python: 8 },
    callStack: [
      {
        name: 'twoSum',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target,
          seen: { ref: 'seen' },
          i: 0,
          num: 2,
          complement: 7,
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums',
        values: nums,
        highlights: [{ index: 0, role: 'current' }],
        pointers: { i: 0 },
        focused: true,
      },
      {
        id: 'seen',
        kind: 'hashmap',
        label: 'Map seen',
        entries: [],
        focusKeys: [7],
      },
    ],
  },
  {
    id: 3,
    narrative: 'Miss on the map. Write heap entry 2 → 0 into `seen`, then advance the loop.',
    why: 'Future elements can discover this 2 as their complement in constant time.',
    codeFocus: { java: 15, kotlin: 13, python: 11 },
    callStack: [
      {
        name: 'twoSum',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target,
          seen: { ref: 'seen' },
          i: 0,
          num: 2,
          complement: 7,
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums',
        values: nums,
        highlights: [{ index: 0, role: 'visited' }],
        pointers: { i: 0 },
      },
      {
        id: 'seen',
        kind: 'hashmap',
        label: 'Map seen',
        entries: [[2, 0]],
        focusKeys: [2],
        focused: true,
      },
    ],
  },
  {
    id: 4,
    narrative: 'i = 1. Read nums[1] = 7. Complement = 2. Probe the map — hit at index 0.',
    why: 'The heap map closes the story: value 2 was stored earlier, so indices (0, 1) form the answer.',
    codeFocus: { java: 12, kotlin: 10, python: 9 },
    callStack: [
      {
        name: 'twoSum',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target,
          seen: { ref: 'seen' },
          i: 1,
          num: 7,
          complement: 2,
          'seen[2]': 0,
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums',
        values: nums,
        highlights: [
          { index: 0, role: 'found' },
          { index: 1, role: 'current' },
        ],
        pointers: { i: 1 },
        focused: true,
      },
      {
        id: 'seen',
        kind: 'hashmap',
        label: 'Map seen',
        entries: [[2, 0]],
        focusKeys: [2],
        focused: true,
      },
    ],
  },
  {
    id: 5,
    narrative: 'Return new int[]{0, 1}. Frame exits; the answer lives in the returned array object.',
    why: 'One pass, O(n) time — each element paid for a single hash lookup instead of a nested scan.',
    codeFocus: { java: 13, kotlin: 11, python: 10 },
    callStack: [
      {
        name: 'twoSum',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          target,
          seen: { ref: 'seen' },
          result: { ref: 'result' },
        },
      },
    ],
    heap: [
      {
        id: 'nums',
        kind: 'array',
        label: 'int[] nums',
        values: nums,
        highlights: [
          { index: 0, role: 'found' },
          { index: 1, role: 'found' },
        ],
      },
      {
        id: 'seen',
        kind: 'hashmap',
        label: 'Map seen',
        entries: [[2, 0]],
      },
      {
        id: 'result',
        kind: 'array',
        label: 'int[] result',
        values: [0, 1],
        highlights: [
          { index: 0, role: 'found' },
          { index: 1, role: 'found' },
        ],
        focused: true,
      },
    ],
  },
]

export const twoSum: ProblemPack = {
  id: '0001-two-sum',
  lcNumber: 1,
  title: 'Two Sum',
  pattern: 'Hash Map',
  difficulty: 'Easy',
  insight:
    'Single pass — complement lookup is O(1) per element instead of O(n²) nested loops.',
  invariant:
    'Map stores each value seen so far with its index; before inserting nums[i], check if target − nums[i] is already present.',
  complexity: {
    time: 'O(n)',
    space: 'O(n)',
    notes: 'Hash map trades linear extra heap memory for one-pass lookups.',
  },
  inputLabel: 'nums = [2, 7, 11, 15], target = 9',
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
          { n: 1_000, ms: 0.08 },
          { n: 10_000, ms: 0.42 },
          { n: 100_000, ms: 4.1 },
        ],
      },
      {
        language: 'kotlin',
        points: [
          { n: 1_000, ms: 0.09 },
          { n: 10_000, ms: 0.48 },
          { n: 100_000, ms: 4.6 },
        ],
      },
      {
        language: 'python',
        points: [
          { n: 1_000, ms: 0.18 },
          { n: 10_000, ms: 1.7 },
          { n: 100_000, ms: 18.5 },
        ],
      },
    ],
    note: 'Placeholder timings for the hash-map approach. Asymptotics dominate language constants.',
  },
  walkthrough: {
    statement:
      "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
    keyIdea:
      "Hash map of seen value→index; at each i look up target-nums[i].",
    approach: [
          "Scan left to right with an empty map.",
          "For each value, if complement is in the map, return both indices.",
          "Otherwise store value→index and continue."
    ],
  },
}
