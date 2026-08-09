// Daily Temperatures - monotonic stack of indices waiting for a warmer day.
// Time O(n), Space O(n).

class Solution {
    fun dailyTemperatures(temperatures: IntArray): IntArray {
        val n = temperatures.size
        val answer = IntArray(n)
        val stack = ArrayDeque<Int>()
        for (i in 0 until n) {
            while (stack.isNotEmpty() && temperatures[stack.peek()] < temperatures[i]) {
                val j = stack.pop()
                answer[j] = i - j
            }
            stack.push(i)
        }
        return answer
    }
}
