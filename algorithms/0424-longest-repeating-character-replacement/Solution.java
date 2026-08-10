// Longest Repeating Character Replacement - sliding window + counts.
// Time O(n), Space O(1) for A-Z (or alphabet size).

class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0;
        int best = 0;
        int maxFreq = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            count[ch - 'A']++;
            maxFreq = Math.max(maxFreq, count[ch - 'A']);
            while (right - left + 1 - maxFreq > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
