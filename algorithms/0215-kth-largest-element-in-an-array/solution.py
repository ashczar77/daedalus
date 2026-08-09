# Kth Largest Element in an Array - size-k min-heap.
# Time O(n log k), Space O(k).

import heapq


class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        min_heap: list[int] = []

        for num in nums:
            heapq.heappush(min_heap, num)

            if len(min_heap) > k:
                heapq.heappop(min_heap)

        return min_heap[0]
