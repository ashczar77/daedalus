# Top K Frequent Elements - HashMap counts + size-k min-heap by frequency.
# Time O(n log k), Space O(n).

import heapq


class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        freq: dict[int, int] = {}
        for num in nums:
            freq[num] = freq.get(num, 0) + 1

        min_heap: list[tuple[int, int]] = []
        for num, count in freq.items():
            heapq.heappush(min_heap, (count, num))
            if len(min_heap) > k:
                heapq.heappop(min_heap)

        return [num for count, num in min_heap]
