// Capacity To Ship Packages Within D Days - binary search min capacity.
// Time O(n log S), Space O(1). S = sum(weights).

class Solution {
    fun shipWithinDays(weights: IntArray, days: Int): Int {
        var left = 0
        var right = 0
        for (w in weights) {
            left = maxOf(left, w)
            right += w
        }
        while (left < right) {
            val mid = left + (right - left) / 2
            if (canShip(weights, days, mid)) {
                right = mid
            } else {
                left = mid + 1
            }
        }
        return left
    }

    private fun canShip(weights: IntArray, days: Int, capacity: Int): Boolean {
        var dayCount = 1
        var load = 0
        for (w in weights) {
            if (load + w > capacity) {
                dayCount++
                load = 0
            }
            load += w
        }
        return dayCount <= days
    }
}
