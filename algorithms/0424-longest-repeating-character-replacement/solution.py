# Longest Repeating Character Replacement - sliding window + counts.
# Time O(n), Space O(1) for A-Z (or alphabet size).

class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = [0] * 26
        left = 0
        best = 0
        max_freq = 0
        for right, ch in enumerate(s):
            idx = ord(ch) - ord("A")
            count[idx] += 1
            max_freq = max(max_freq, count[idx])
            while right - left + 1 - max_freq > k:
                count[ord(s[left]) - ord("A")] -= 1
                left += 1
            best = max(best, right - left + 1)
        return best
