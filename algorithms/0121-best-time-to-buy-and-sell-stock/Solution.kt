// Best Time to Buy and Sell Stock - track min buy so far; update max profit at each day.
// Time O(n), Space O(1).

class Solution {
    fun maxProfit(prices: IntArray): Int {
        var minPrice = Int.MAX_VALUE
        var best = 0
        for (price in prices) {
            if (price < minPrice) {
                minPrice = price
            } else {
                best = maxOf(best, price - minPrice)
            }
        }
        return best
    }
}
