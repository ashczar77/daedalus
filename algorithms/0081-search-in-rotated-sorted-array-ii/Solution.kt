// Search in Rotated Sorted Array II - same as #33; shrink both ends when duplicates equal.
// Time O(n) worst case, Space O(1).

class Solution {
    fun search(nums: IntArray, target: Int): Boolean {
        var left = 0
        var right = nums.lastIndex
        while (left <= right) {
            val mid = left + (right - left) / 2
            if (nums[mid] == target) {
                return true
            }
            if (nums[left] == nums[mid] && nums[mid] == nums[right]) {
                left++
                right--
            } else if (nums[left] <= nums[mid]) {
                if (target in nums[left] until nums[mid]) {
                    right = mid - 1
                } else {
                    left = mid + 1
                }
            } else {
                if (target in (nums[mid] + 1)..nums[right]) {
                    left = mid + 1
                } else {
                    right = mid - 1
                }
            }
        }
        return false
    }
}
