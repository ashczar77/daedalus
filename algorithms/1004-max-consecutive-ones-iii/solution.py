# Max Consecutive Ones III - sliding window with at most k flips.
# Time O(n), Space O(1).

class Solution:
    def longestOnes(self, nums: list[int], k: int) -> int:
        left = 0
        ones = 0
        best = 0
        for right in range(len(nums)):
            if nums[right] == 1:
                ones += 1
            while right - left + 1 - ones > k:
                if nums[left] == 1:
                    ones -= 1
                left += 1
            best = max(best, right - left + 1)
        return best
