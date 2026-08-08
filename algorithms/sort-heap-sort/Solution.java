// Heap Sort — build a max-heap, then repeatedly extract the maximum to the end.
// Time O(n log n), Space O(1).

class Solution {
    public void heapSort(int[] a) {
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--) {
            siftDown(a, n, i);
        }
        for (int end = n - 1; end > 0; end--) {
            int tmp = a[0];
            a[0] = a[end];
            a[end] = tmp;
            siftDown(a, end, 0);
        }
    }

    private void siftDown(int[] a, int size, int i) {
        while (true) {
            int largest = i;
            int left = 2 * i + 1;
            int right = 2 * i + 2;
            if (left < size && a[left] > a[largest]) largest = left;
            if (right < size && a[right] > a[largest]) largest = right;
            if (largest == i) return;
            int tmp = a[i];
            a[i] = a[largest];
            a[largest] = tmp;
            i = largest;
        }
    }
}
