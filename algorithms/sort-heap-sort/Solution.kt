// Heap Sort - build a max-heap, then repeatedly extract the maximum to the end.
// Time O(n log n), Space O(1).

class Solution {
    fun heapSort(a: IntArray) {
        val n = a.size
        for (i in n / 2 - 1 downTo 0) siftDown(a, n, i)
        for (end in n - 1 downTo 1) {
            val tmp = a[0]
            a[0] = a[end]
            a[end] = tmp
            siftDown(a, end, 0)
        }
    }

    private fun siftDown(a: IntArray, size: Int, start: Int) {
        var i = start
        while (true) {
            var largest = i
            val left = 2 * i + 1
            val right = 2 * i + 2
            if (left < size && a[left] > a[largest]) largest = left
            if (right < size && a[right] > a[largest]) largest = right
            if (largest == i) return
            val tmp = a[i]
            a[i] = a[largest]
            a[largest] = tmp
            i = largest
        }
    }
}
