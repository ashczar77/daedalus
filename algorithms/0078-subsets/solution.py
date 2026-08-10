# Subsets - backtracking: record path, choose, recurse, undo.
# Time O(n * 2^n), Space O(n) recursion (output O(n * 2^n)).


class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        result: list[list[int]] = []
        path: list[int] = []

        def backtrack(start: int) -> None:
            result.append(path.copy())
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(i + 1)
                path.pop()

        backtrack(0)
        return result
