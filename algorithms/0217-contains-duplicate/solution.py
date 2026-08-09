# Contains Duplicate - set membership; return True on first repeat.
# Time O(n), Space O(n).

class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        seen: set[int] = set()
        for num in nums:
            if num in seen:
                return True
            seen.add(num)
        return False
