// Max Consecutive Ones III - sliding window with at most k flips.
// Time O(n), Space O(1).

class Solution {
    public int longestOnes(int[] nums, int k) {
        int left = 0;
        int ones = 0;
        int best = 0;
        for (int right = 0; right < nums.length; right++) {
            if (nums[right] == 1) ones++;
            while (right - left + 1 - ones > k) {
                if (nums[left] == 1) ones--;
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
