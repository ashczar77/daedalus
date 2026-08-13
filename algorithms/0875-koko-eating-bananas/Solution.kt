// Koko Eating Bananas - binary search the minimum speed k with hours ≤ h.
// Time O(n log M), Space O(1). M = max(piles).

class Solution {
    fun minEatingSpeed(piles: IntArray, h: Int): Int {
        var left = 1
        var right = 0
        for (pile in piles) right = maxOf(right, pile)
        while (left < right) {
            val mid = left + (right - left) / 2
            if (hoursNeeded(piles, mid) <= h) {
                right = mid
            } else {
                left = mid + 1
            }
        }
        return left
    }

    private fun hoursNeeded(piles: IntArray, speed: Int): Long {
        var hours = 0L
        for (pile in piles) {
            hours += (pile + speed.toLong() - 1) / speed
        }
        return hours
    }
}
