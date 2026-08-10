// Subsets - backtracking: record path, choose, recurse, undo.
// Time O(n * 2^n), Space O(n) recursion (output O(n * 2^n)).

class Solution {
    fun subsets(nums: IntArray): List<List<Int>> {
        val result = mutableListOf<List<Int>>()
        backtrack(nums, 0, mutableListOf(), result)
        return result
    }

    private fun backtrack(
        nums: IntArray,
        start: Int,
        path: MutableList<Int>,
        result: MutableList<List<Int>>,
    ) {
        result.add(path.toList())
        for (i in start until nums.size) {
            path.add(nums[i])
            backtrack(nums, i + 1, path, result)
            path.removeAt(path.lastIndex)
        }
    }
}
