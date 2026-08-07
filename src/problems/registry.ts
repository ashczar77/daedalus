import type { ProblemPack } from '../engine/types'
import { containerWithMostWater } from './0011-container-with-most-water'
import { sameTree } from './0100-same-tree'
import { maximumDepthOfBinaryTree } from './0104-maximum-depth-of-binary-tree'
import { validParentheses } from './0020-valid-parentheses'
import { mergeTwoSortedLists } from './0021-merge-two-sorted-lists'
import { twoSum } from './0001-two-sum'
import { linkedListCycle } from './0141-linked-list-cycle'
import { evaluateReversePolishNotation } from './0150-evaluate-reverse-polish-notation'
import { twoSumII } from './0167-two-sum-ii'
import { bestTimeToBuyAndSellStock } from './0121-best-time-to-buy-and-sell-stock'
import { validPalindrome } from './0125-valid-palindrome'
import { reverseLinkedList } from './0206-reverse-linked-list'
import { containsDuplicate } from './0217-contains-duplicate'
import { invertBinaryTree } from './0226-invert-binary-tree'
import { validAnagram } from './0242-valid-anagram'
import { diameterOfBinaryTree } from './0543-diameter-of-binary-tree'
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
  reverseLinkedList,
  mergeTwoSortedLists,
  linkedListCycle,
  invertBinaryTree,
  maximumDepthOfBinaryTree,
  sameTree,
  diameterOfBinaryTree,
  binarySearch,
]

/** Fast lookup by route param (`/problems/:problemId`). */
export const problemsById = Object.fromEntries(
  problems.map((problem) => [problem.id, problem]),
) as Record<string, ProblemPack>

export function getProblem(id: string): ProblemPack | undefined {
  return problemsById[id]
}
