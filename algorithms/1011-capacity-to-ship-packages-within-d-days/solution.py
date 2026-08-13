# Capacity To Ship Packages Within D Days - binary search min capacity.
# Time O(n log S), Space O(1). S = sum(weights).

class Solution:
    def shipWithinDays(self, weights: list[int], days: int) -> int:
        left = max(weights)
        right = sum(weights)
        while left < right:
            mid = left + (right - left) // 2
            if self.can_ship(weights, days, mid):
                right = mid
            else:
                left = mid + 1
        return left

    def can_ship(self, weights: list[int], days: int, capacity: int) -> bool:
        day_count = 1
        load = 0
        for w in weights:
            if load + w > capacity:
                day_count += 1
                load = 0
            load += w
        return day_count <= days
