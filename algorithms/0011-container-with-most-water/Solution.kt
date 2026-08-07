// Container With Most Water — opposite-end pointers; move the shorter side inward.
// Time O(n), Space O(1).

class Solution {
    fun maxArea(height: IntArray): Int {
        var left = 0
        var right = height.lastIndex
        var best = 0
        while (left < right) {
            val area = minOf(height[left], height[right]) * (right - left)
            best = maxOf(best, area)
            if (height[left] <= height[right]) left++ else right--
        }
        return best
    }
}
