// Permutations - backtracking with boolean[] used (retry all unused each level).
// Time O(n * n!), Space O(n) recursion (output O(n * n!)).

class Solution {
    fun permute(nums: IntArray): List<List<Int>> {
        val result = mutableListOf<List<Int>>()
        backtrack(nums, BooleanArray(nums.size), mutableListOf(), result)
        return result
    }

    private fun backtrack(
        nums: IntArray,
        used: BooleanArray,
        path: MutableList<Int>,
        result: MutableList<List<Int>>,
    ) {
        if (path.size == nums.size) {
            result.add(path.toList())
            return
        }
        for (i in nums.indices) {
            if (used[i]) continue
            used[i] = true
            path.add(nums[i])
            backtrack(nums, used, path, result)
            path.removeAt(path.lastIndex)
            used[i] = false
        }
    }
}
