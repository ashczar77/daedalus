// Kth Largest Element in an Array - size-k min-heap (PriorityQueue).
// Time O(n log k), Space O(k).

import java.util.PriorityQueue

class Solution {
    fun findKthLargest(nums: IntArray, k: Int): Int {
        val minHeap = PriorityQueue<Int>()

        for (num in nums) {
            minHeap.add(num)

            if (minHeap.size > k) minHeap.poll()
        }

        return minHeap.peek()
    }
}
