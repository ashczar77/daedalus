// Top K Frequent Elements - HashMap counts + size-k min-heap by frequency.
// Time O(n log k), Space O(n).

import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;

class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int num : nums) {
            freq.put(num, freq.getOrDefault(num, 0) + 1);
        }

        PriorityQueue<int[]> minHeap =
            new PriorityQueue<>((a, b) -> a[1] - b[1]);
        for (Map.Entry<Integer, Integer> e : freq.entrySet()) {
            minHeap.offer(new int[] { e.getKey(), e.getValue() });
            if (minHeap.size() > k) minHeap.poll();
        }

        int[] ans = new int[k];
        for (int i = 0; i < k; i++) {
            ans[i] = minHeap.poll()[0];
        }
        return ans;
    }
}
