// Max Consecutive Ones III - sliding window with at most k flips.
// Time O(n), Space O(1).

class Solution {
    fun longestOnes(nums: IntArray, k: Int): Int {
        var left = 0
        var ones = 0
        var best = 0
        for (right in nums.indices) {
            if (nums[right] == 1) ones++
            while (right - left + 1 - ones > k) {
                if (nums[left] == 1) ones--
                left++
            }
            best = maxOf(best, right - left + 1)
        }
        return best
    }
}
