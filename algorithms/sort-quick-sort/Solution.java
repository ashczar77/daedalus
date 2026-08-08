// Quick Sort — partition around a pivot, then recurse on both sides.
// Time O(n log n) average, O(n²) worst. Space O(log n) stack.

class Solution {
    public void quickSort(int[] a) {
        if (a.length < 2) return;
        sort(a, 0, a.length - 1);
    }

    private void sort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);
        sort(a, lo, p - 1);
        sort(a, p + 1, hi);
    }

    private int partition(int[] a, int lo, int hi) {
        int pivot = a[hi];
        int i = lo;
        for (int j = lo; j < hi; j++) {
            if (a[j] < pivot) {
                int tmp = a[i];
                a[i] = a[j];
                a[j] = tmp;
                i++;
            }
        }
        int tmp = a[i];
        a[i] = a[hi];
        a[hi] = tmp;
        return i;
    }
}
