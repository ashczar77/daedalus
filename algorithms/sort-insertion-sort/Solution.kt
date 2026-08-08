// Insertion Sort — grow a sorted prefix; insert a[i] by shifting larger neighbors right.
// Time O(n²), Space O(1).

class Solution {
    fun insertionSort(a: IntArray) {
        for (i in 1 until a.size) {
            val key = a[i]
            var j = i - 1
            while (j >= 0 && a[j] > key) {
                a[j + 1] = a[j]
                j--
            }
            a[j + 1] = key
        }
    }
}
