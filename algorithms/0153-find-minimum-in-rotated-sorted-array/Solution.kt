// Find Minimum in Rotated Sorted Array - if nums[mid] > nums[right], min is right of mid.
// Time O(log n), Space O(1).

class Solution {
    fun findMin(nums: IntArray): Int {
        var left = 0
        var right = nums.lastIndex
        while (left < right) {
            val mid = left + (right - left) / 2
            if (nums[mid] > nums[right]) {
                left = mid + 1
            } else {
                right = mid
            }
        }
        return nums[left]
    }
}
