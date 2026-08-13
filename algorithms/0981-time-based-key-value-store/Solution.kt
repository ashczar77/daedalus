// Time Based Key-Value Store - append on set; get binary-searches floor timestamp.
// Time set O(1), get O(log n); Space O(n).

class TimeMap {
    private data class Pair(val timestamp: Int, val value: String)

    private val store = HashMap<String, MutableList<Pair>>()

    fun set(key: String, value: String, timestamp: Int) {
        store.getOrPut(key) { mutableListOf() }.add(Pair(timestamp, value))
    }

    fun get(key: String, timestamp: Int): String {
        val list = store[key] ?: return ""
        if (list.isEmpty()) return ""
        var left = 0
        var right = list.lastIndex
        var ans = ""
        while (left <= right) {
            val mid = left + (right - left) / 2
            if (list[mid].timestamp <= timestamp) {
                ans = list[mid].value
                left = mid + 1
            } else {
                right = mid - 1
            }
        }
        return ans
    }
}
