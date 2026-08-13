// Minimum Number of Days to Make m Bouquets - binary search the earliest day.
// Time O(n log D), Space O(1). D = max(bloomDay) - min(bloomDay).

class Solution {
    public int minDays(int[] bloomDay, int m, int k) {
        long need = (long) m * k;
        if (need > bloomDay.length) return -1;
        int left = Integer.MAX_VALUE;
        int right = 0;
        for (int d : bloomDay) {
            left = Math.min(left, d);
            right = Math.max(right, d);
        }
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (canMake(bloomDay, m, k, mid)) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }

    private boolean canMake(int[] bloomDay, int m, int k, int day) {
        int bouquets = 0;
        int run = 0;
        for (int d : bloomDay) {
            if (d <= day) {
                run++;
                if (run == k) {
                    bouquets++;
                    run = 0;
                }
            } else {
                run = 0;
            }
        }
        return bouquets >= m;
    }
}
