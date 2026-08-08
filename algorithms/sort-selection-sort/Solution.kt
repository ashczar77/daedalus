// Selection Sort — each pass select the minimum of the unsorted suffix and swap it forward.
// Time O(n²), Space O(1).

class Solution {
    fun selectionSort(a: IntArray) {
        for (i in 0 until a.lastIndex) {
            var min = i
            for (j in i + 1 until a.size) {
                if (a[j] < a[min]) min = j
            }
            if (min != i) {
                val tmp = a[i]
                a[i] = a[min]
                a[min] = tmp
            }
        }
    }
}
