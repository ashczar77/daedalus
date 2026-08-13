// Capacity To Ship Packages Within D Days - binary search min capacity.
// Time O(n log S), Space O(1). S = sum(weights).

class Solution {
    public int shipWithinDays(int[] weights, int days) {
        int left = 0;
        int right = 0;
        for (int w : weights) {
            left = Math.max(left, w);
            right += w;
        }
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (canShip(weights, days, mid)) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }

    private boolean canShip(int[] weights, int days, int capacity) {
        int dayCount = 1;
        int load = 0;
        for (int w : weights) {
            if (load + w > capacity) {
                dayCount++;
                load = 0;
            }
            load += w;
        }
        return dayCount <= days;
    }
}
