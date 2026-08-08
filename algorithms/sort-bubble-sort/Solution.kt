// Bubble Sort — adjacent swaps; largest element "bubbles" to the end each pass.
// Time O(n²), Space O(1).

class Solution {
    fun bubbleSort(a: IntArray) {
        var end = a.lastIndex
        while (end > 0) {
            var swapped = false
            for (i in 0 until end) {
                if (a[i] > a[i + 1]) {
                    val tmp = a[i]
                    a[i] = a[i + 1]
                    a[i + 1] = tmp
                    swapped = true
                }
            }
            if (!swapped) break
            end--
        }
    }
}
