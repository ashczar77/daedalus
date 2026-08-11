// Top K Frequent Elements - HashMap counts + size-k min-heap by frequency.
// Time O(n log k), Space O(n).

import java.util.PriorityQueue

class Solution {
    fun topKFrequent(nums: IntArray, k: Int): IntArray {
        val freq = HashMap<Int, Int>()
        for (num in nums) {
            freq[num] = freq.getOrDefault(num, 0) + 1
        }

        val minHeap = PriorityQueue<IntArray> { a, b -> a[1] - b[1] }
        for ((num, count) in freq) {
            minHeap.offer(intArrayOf(num, count))
            if (minHeap.size > k) minHeap.poll()
        }

        return IntArray(k) { minHeap.poll()[0] }
    }
}
