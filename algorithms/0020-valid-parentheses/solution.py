# Valid Parentheses — stack of opens; each close must match the top open.
# Time O(n), Space O(n).

class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {")": "(", "]": "[", "}": "{"}
        stack: list[str] = []
        for ch in s:
            if ch not in pairs:
                stack.append(ch)
                continue
            if not stack or stack.pop() != pairs[ch]:
                return False
        return not stack
