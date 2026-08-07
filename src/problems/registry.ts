import type { ProblemPack } from '../engine/types'
import { twoSum } from './0001-two-sum'
import { twoSumII } from './0167-two-sum-ii'
import { containsDuplicate } from './0217-contains-duplicate'
import { binarySearch } from './0704-binary-search'

export const problems: ProblemPack[] = [
  twoSum,
  containsDuplicate,
  twoSumII,
  binarySearch,
]

export const problemsById = Object.fromEntries(
  problems.map((problem) => [problem.id, problem]),
) as Record<string, ProblemPack>

export function getProblem(id: string): ProblemPack | undefined {
  return problemsById[id]
}
