// Koko Eating Bananas - binary search the minimum speed k with hours ≤ h.
// Time O(n log M), Space O(1). M = max(piles).

class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int left = 1;
        int right = 0;
        for (int pile : piles) right = Math.max(right, pile);
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (hoursNeeded(piles, mid) <= h) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left;
    }

    private long hoursNeeded(int[] piles, int speed) {
        long hours = 0;
        for (int pile : piles) {
            hours += (pile + (long) speed - 1) / speed;
        }
        return hours;
    }
}
