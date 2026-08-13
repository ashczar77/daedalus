# Find Minimum in Rotated Sorted Array - if nums[mid] > nums[right], min is right of mid.
# Time O(log n), Space O(1).

class Solution:
    def findMin(self, nums: list[int]) -> int:
        left = 0
        right = len(nums) - 1
        while left < right:
            mid = left + (right - left) // 2
            if nums[mid] > nums[right]:
                left = mid + 1
            else:
                right = mid
        return nums[left]
