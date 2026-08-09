// Bubble Sort - adjacent swaps; largest element "bubbles" to the end each pass.
// Time O(n²), Space O(1).

class Solution {
    public void bubbleSort(int[] a) {
        int n = a.length;
        for (int end = n - 1; end > 0; end--) {
            boolean swapped = false;
            for (int i = 0; i < end; i++) {
                if (a[i] > a[i + 1]) {
                    int tmp = a[i];
                    a[i] = a[i + 1];
                    a[i + 1] = tmp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
}
