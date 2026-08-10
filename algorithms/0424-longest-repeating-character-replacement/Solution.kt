// Longest Repeating Character Replacement - sliding window + counts.
// Time O(n), Space O(1) for A-Z (or alphabet size).

class Solution {
    fun characterReplacement(s: String, k: Int): Int {
        val count = IntArray(26)
        var left = 0
        var best = 0
        var maxFreq = 0
        for (right in s.indices) {
            val ch = s[right]
            count[ch - 'A']++
            maxFreq = maxOf(maxFreq, count[ch - 'A'])
            while (right - left + 1 - maxFreq > k) {
                count[s[left] - 'A']--
                left++
            }
            best = maxOf(best, right - left + 1)
        }
        return best
    }
}
