// Longest Substring Without Repeating Characters - sliding window + HashSet.
// Time O(n), Space O(min(n, alphabet)).

import java.util.HashSet;
import java.util.Set;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> seen = new HashSet<>();
        int left = 0;
        int best = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            while (seen.contains(ch)) {
                seen.remove(s.charAt(left));
                left++;
            }
            seen.add(ch);
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
