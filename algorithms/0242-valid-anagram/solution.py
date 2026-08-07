# Valid Anagram — count letters with a 26-slot list; lengths must match first.
# Time O(n), Space O(1).

class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        counts = [0] * 26
        for i in range(len(s)):
            counts[ord(s[i]) - ord("a")] += 1
            counts[ord(t[i]) - ord("a")] -= 1
        return all(count == 0 for count in counts)
