// Merge Sort - divide in half, sort recursively, merge ordered runs.
// Time O(n log n), Space O(n).

class Solution {
    public void mergeSort(int[] a) {
        if (a.length < 2) return;
        sort(a, 0, a.length - 1, new int[a.length]);
    }

    private void sort(int[] a, int lo, int hi, int[] tmp) {
        if (lo >= hi) return;
        int mid = lo + (hi - lo) / 2;
        sort(a, lo, mid, tmp);
        sort(a, mid + 1, hi, tmp);
        merge(a, lo, mid, hi, tmp);
    }

    private void merge(int[] a, int lo, int mid, int hi, int[] tmp) {
        for (int k = lo; k <= hi; k++) tmp[k] = a[k];
        int i = lo;
        int j = mid + 1;
        for (int k = lo; k <= hi; k++) {
            if (i > mid) a[k] = tmp[j++];
            else if (j > hi) a[k] = tmp[i++];
            else if (tmp[j] < tmp[i]) a[k] = tmp[j++];
            else a[k] = tmp[i++];
        }
    }
}
