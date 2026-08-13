# Find Peak Element - binary search on slope; climb toward a greater neighbor.
# Time O(log n), Space O(1).

class Solution:
    def findPeakElement(self, nums: list[int]) -> int:
        left = 0
        right = len(nums) - 1
        while left < right:
            mid = left + (right - left) // 2
            if nums[mid] < nums[mid + 1]:
                left = mid + 1
            else:
                right = mid
        return left
