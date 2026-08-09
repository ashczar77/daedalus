// Longest Substring Without Repeating Characters - sliding window + HashSet.
// Time O(n), Space O(min(n, alphabet)).

class Solution {
    fun lengthOfLongestSubstring(s: String): Int {
        val seen = HashSet<Char>()
        var left = 0
        var best = 0
        for (right in s.indices) {
            val ch = s[right]
            while (ch in seen) {
                seen.remove(s[left])
                left++
            }
            seen.add(ch)
            best = maxOf(best, right - left + 1)
        }
        return best
    }
}
