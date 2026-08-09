// Kth Largest Element in an Array - size-k min-heap (PriorityQueue).
// Time O(n log k), Space O(k).

import java.util.PriorityQueue;

class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();

        for (int num : nums) {
            minHeap.add(num);

            if (minHeap.size() > k) minHeap.poll();
        }

        return minHeap.peek();
    }
}
