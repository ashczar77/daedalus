# Container With Most Water — opposite-end pointers; move the shorter side inward.
# Time O(n), Space O(1).

class Solution:
    def maxArea(self, height: list[int]) -> int:
        left = 0
        right = len(height) - 1
        best = 0
        while left < right:
            area = min(height[left], height[right]) * (right - left)
            best = max(best, area)
            if height[left] <= height[right]:
                left += 1
            else:
                right -= 1
        return best
