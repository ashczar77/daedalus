// Best Time to Buy and Sell Stock - track min buy so far; update max profit at each day.
// Time O(n), Space O(1).

class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int best = 0;
        for (int price : prices) {
            if (price < minPrice) {
                minPrice = price;
            } else {
                best = Math.max(best, price - minPrice);
            }
        }
        return best;
    }
}
