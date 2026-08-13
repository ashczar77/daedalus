// Search in Rotated Sorted Array - identify the sorted half, then decide where target lives.
// Time O(log n), Space O(1).

class Solution {
    fun search(nums: IntArray, target: Int): Int {
        var left = 0
        var right = nums.lastIndex
        while (left <= right) {
            val mid = left + (right - left) / 2
            if (nums[mid] == target) {
                return mid
            }
            if (nums[left] <= nums[mid]) {
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
        return -1
    }
}
