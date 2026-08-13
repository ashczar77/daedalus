# Minimum Number of Days to Make m Bouquets - binary search the earliest day.
# Time O(n log D), Space O(1). D = max(bloomDay) - min(bloomDay).

class Solution:
    def minDays(self, bloomDay: list[int], m: int, k: int) -> int:
        if m * k > len(bloomDay):
            return -1
        left = min(bloomDay)
        right = max(bloomDay)
        while left < right:
            mid = left + (right - left) // 2
            if self.can_make(bloomDay, m, k, mid):
                right = mid
            else:
                left = mid + 1
        return left

    def can_make(self, bloomDay: list[int], m: int, k: int, day: int) -> bool:
        bouquets = 0
        run = 0
        for d in bloomDay:
            if d <= day:
                run += 1
                if run == k:
                    bouquets += 1
                    run = 0
            else:
                run = 0
        return bouquets >= m
