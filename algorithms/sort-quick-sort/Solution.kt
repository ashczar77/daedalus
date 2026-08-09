// Quick Sort - partition around a pivot, then recurse on both sides.
// Time O(n log n) average, O(n²) worst. Space O(log n) stack.

class Solution {
    fun quickSort(a: IntArray) {
        if (a.size < 2) return
        sort(a, 0, a.lastIndex)
    }

    private fun sort(a: IntArray, lo: Int, hi: Int) {
        if (lo >= hi) return
        val p = partition(a, lo, hi)
        sort(a, lo, p - 1)
        sort(a, p + 1, hi)
    }

    private fun partition(a: IntArray, lo: Int, hi: Int): Int {
        val pivot = a[hi]
        var i = lo
        for (j in lo until hi) {
            if (a[j] < pivot) {
                val tmp = a[i]
                a[i] = a[j]
                a[j] = tmp
                i++
            }
        }
        val tmp = a[i]
        a[i] = a[hi]
        a[hi] = tmp
        return i
    }
}
