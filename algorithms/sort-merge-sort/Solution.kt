// Merge Sort - divide in half, sort recursively, merge ordered runs.
// Time O(n log n), Space O(n).

class Solution {
    fun mergeSort(a: IntArray) {
        if (a.size < 2) return
        sort(a, 0, a.lastIndex, IntArray(a.size))
    }

    private fun sort(a: IntArray, lo: Int, hi: Int, tmp: IntArray) {
        if (lo >= hi) return
        val mid = lo + (hi - lo) / 2
        sort(a, lo, mid, tmp)
        sort(a, mid + 1, hi, tmp)
        merge(a, lo, mid, hi, tmp)
    }

    private fun merge(a: IntArray, lo: Int, mid: Int, hi: Int, tmp: IntArray) {
        for (k in lo..hi) tmp[k] = a[k]
        var i = lo
        var j = mid + 1
        for (k in lo..hi) {
            when {
                i > mid -> a[k] = tmp[j++]
                j > hi -> a[k] = tmp[i++]
                tmp[j] < tmp[i] -> a[k] = tmp[j++]
                else -> a[k] = tmp[i++]
            }
        }
    }
}
