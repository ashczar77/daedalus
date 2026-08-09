# Longest Substring Without Repeating Characters - sliding window + set.
# Time O(n), Space O(min(n, alphabet)).

class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen: set[str] = set()
        left = 0
        best = 0
        for right, ch in enumerate(s):
            while ch in seen:
                seen.remove(s[left])
                left += 1
            seen.add(ch)
            best = max(best, right - left + 1)
        return best
