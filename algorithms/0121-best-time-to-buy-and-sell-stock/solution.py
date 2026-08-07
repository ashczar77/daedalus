# Best Time to Buy and Sell Stock — track min buy so far; update max profit at each day.
# Time O(n), Space O(1).

class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_price = float("inf")
        best = 0
        for price in prices:
            if price < min_price:
                min_price = price
            else:
                best = max(best, price - min_price)
        return best
