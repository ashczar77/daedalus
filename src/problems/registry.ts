import type { ProblemPack } from '../engine/types'
import { containerWithMostWater } from './0011-container-with-most-water'
import { validParentheses } from './0020-valid-parentheses'
import { twoSum } from './0001-two-sum'
import { evaluateReversePolishNotation } from './0150-evaluate-reverse-polish-notation'
import { twoSumII } from './0167-two-sum-ii'
import { bestTimeToBuyAndSellStock } from './0121-best-time-to-buy-and-sell-stock'
import { validPalindrome } from './0125-valid-palindrome'
import { containsDuplicate } from './0217-contains-duplicate'
import { validAnagram } from './0242-valid-anagram'
import { binarySearch } from './0704-binary-search'

/**
 * Catalog of shipped problem packs.
 * Add new packs here after authoring algorithms/ + a matching module in this folder.
 */
export const problems: ProblemPack[] = [
  twoSum,
  containsDuplicate,
  validAnagram,
  validPalindrome,
  twoSumII,
  containerWithMostWater,
  bestTimeToBuyAndSellStock,
  validParentheses,
  evaluateReversePolishNotation,
  binarySearch,
]

/** Fast lookup by route param (`/problems/:problemId`). */
export const problemsById = Object.fromEntries(
  problems.map((problem) => [problem.id, problem]),
) as Record<string, ProblemPack>

export function getProblem(id: string): ProblemPack | undefined {
  return problemsById[id]
}
