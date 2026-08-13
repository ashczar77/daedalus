// Minimum Number of Days to Make m Bouquets - binary search the earliest day.
// Time O(n log D), Space O(1). D = max(bloomDay) - min(bloomDay).

class Solution {
    fun minDays(bloomDay: IntArray, m: Int, k: Int): Int {
        val need = m.toLong() * k
        if (need > bloomDay.size) return -1
        var left = Int.MAX_VALUE
        var right = 0
        for (d in bloomDay) {
            left = minOf(left, d)
            right = maxOf(right, d)
        }
        while (left < right) {
            val mid = left + (right - left) / 2
            if (canMake(bloomDay, m, k, mid)) {
                right = mid
            } else {
                left = mid + 1
            }
        }
        return left
    }

    private fun canMake(bloomDay: IntArray, m: Int, k: Int, day: Int): Boolean {
        var bouquets = 0
        var run = 0
        for (d in bloomDay) {
            if (d <= day) {
                run++
                if (run == k) {
                    bouquets++
                    run = 0
                }
            } else {
                run = 0
            }
        }
        return bouquets >= m
    }
}
