import type { ProblemPack } from '../engine/types'
import { longestSubstringWithoutRepeating } from './0003-longest-substring-without-repeating-characters'
import { permutations } from './0046-permutations'
import { containerWithMostWater } from './0011-container-with-most-water'
import { sameTree } from './0100-same-tree'
import { binaryTreeLevelOrderTraversal } from './0102-binary-tree-level-order-traversal'
import { maximumDepthOfBinaryTree } from './0104-maximum-depth-of-binary-tree'
import { balancedBinaryTree } from './0110-balanced-binary-tree'
import { removeNthNodeFromEndOfList } from './0019-remove-nth-node-from-end-of-list'
import { numberOfIslands } from './0200-number-of-islands'
import { validParentheses } from './0020-valid-parentheses'
import { mergeTwoSortedLists } from './0021-merge-two-sorted-lists'
import { twoSum } from './0001-two-sum'
import { lowestCommonAncestorOfABst } from './0235-lowest-common-ancestor-of-a-bst'
import { validateBinarySearchTree } from './0098-validate-binary-search-tree'
import { subsets } from './0078-subsets'
import { topKFrequentElements } from './0347-top-k-frequent-elements'
import { linkedListCycle } from './0141-linked-list-cycle'
import { evaluateReversePolishNotation } from './0150-evaluate-reverse-polish-notation'
import { twoSumII } from './0167-two-sum-ii'
import { bestTimeToBuyAndSellStock } from './0121-best-time-to-buy-and-sell-stock'
import { validPalindrome } from './0125-valid-palindrome'
import { reverseLinkedList } from './0206-reverse-linked-list'
import { kthLargestElementInAnArray } from './0215-kth-largest-element-in-an-array'
import { containsDuplicate } from './0217-contains-duplicate'
import { invertBinaryTree } from './0226-invert-binary-tree'
import { validAnagram } from './0242-valid-anagram'
import { longestRepeatingCharacterReplacement } from './0424-longest-repeating-character-replacement'
import { diameterOfBinaryTree } from './0543-diameter-of-binary-tree'
import { subtreeOfAnotherTree } from './0572-subtree-of-another-tree'
import { maxAreaOfIsland } from './0695-max-area-of-island'
import { binarySearch } from './0704-binary-search'
import { dailyTemperatures } from './0739-daily-temperatures'
import { middleOfTheLinkedList } from './0876-middle-of-the-linked-list'
import { maxConsecutiveOnesIII } from './1004-max-consecutive-ones-iii'
import { bubbleSort } from './sort-bubble-sort'
import { heapSort } from './sort-heap-sort'
import { insertionSort } from './sort-insertion-sort'
import { mergeSort } from './sort-merge-sort'
import { quickSort } from './sort-quick-sort'
import { selectionSort } from './sort-selection-sort'

/**
 * Catalog of shipped problem packs.
 * Add new packs here after authoring algorithms/ + a matching module in this folder.
 */
export const problems: ProblemPack[] = [
  twoSum,
  containsDuplicate,
  validAnagram,
  validPalindrome,
  longestSubstringWithoutRepeating,
  longestRepeatingCharacterReplacement,
  maxConsecutiveOnesIII,
  twoSumII,
  containerWithMostWater,
  bestTimeToBuyAndSellStock,
  validParentheses,
  evaluateReversePolishNotation,
  dailyTemperatures,
  subsets,
  permutations,
  reverseLinkedList,
  removeNthNodeFromEndOfList,
  middleOfTheLinkedList,
  kthLargestElementInAnArray,
  topKFrequentElements,
  mergeTwoSortedLists,
  linkedListCycle,
  numberOfIslands,
  maxAreaOfIsland,
  invertBinaryTree,
  maximumDepthOfBinaryTree,
  balancedBinaryTree,
  sameTree,
  validateBinarySearchTree,
  lowestCommonAncestorOfABst,
  binaryTreeLevelOrderTraversal,
  diameterOfBinaryTree,
  subtreeOfAnotherTree,
  binarySearch,
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  quickSort,
  heapSort,
]

/** Fast lookup by route param (`/problems/:problemId`). */
export const problemsById = Object.fromEntries(
  problems.map((problem) => [problem.id, problem]),
) as Record<string, ProblemPack>

export function getProblem(id: string): ProblemPack | undefined {
  return problemsById[id]
}
