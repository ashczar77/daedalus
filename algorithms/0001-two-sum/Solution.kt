// Two Sum - single-pass hash map of value → index; look up target - nums[i].
// Time O(n), Space O(n).

class Solution {
    fun twoSum(nums: IntArray, target: Int): IntArray {
        val seen = HashMap<Int, Int>()
        for (i in nums.indices) {
            val complement = target - nums[i]
            val found = seen[complement]
            if (found != null) {
                return intArrayOf(found, i)
            }
            seen[nums[i]] = i
        }
        return intArrayOf()
    }
}
