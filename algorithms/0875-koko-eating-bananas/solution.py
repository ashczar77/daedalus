# Koko Eating Bananas - binary search the minimum speed k with hours ≤ h.
# Time O(n log M), Space O(1). M = max(piles).

class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        left = 1
        right = max(piles)
        while left < right:
            mid = left + (right - left) // 2
            if self.hours_needed(piles, mid) <= h:
                right = mid
            else:
                left = mid + 1
        return left

    def hours_needed(self, piles: list[int], speed: int) -> int:
        hours = 0
        for pile in piles:
            hours += (pile + speed - 1) // speed
        return hours
