// Valid Anagram — count letters with IntArray(26); lengths must match first.
// Time O(n), Space O(1).

class Solution {
    fun isAnagram(s: String, t: String): Boolean {
        if (s.length != t.length) return false
        val counts = IntArray(26)
        for (i in s.indices) {
            counts[s[i] - 'a']++
            counts[t[i] - 'a']--
        }
        return counts.all { it == 0 }
    }
}
