# Heap Sort — build a max-heap, then repeatedly extract the maximum to the end.
# Time O(n log n), Space O(1).

class Solution:
    def heapSort(self, a: list[int]) -> None:
        n = len(a)
        for i in range(n // 2 - 1, -1, -1):
            self._sift_down(a, n, i)
        for end in range(n - 1, 0, -1):
            a[0], a[end] = a[end], a[0]
            self._sift_down(a, end, 0)

    def _sift_down(self, a: list[int], size: int, i: int) -> None:
        while True:
            largest = i
            left = 2 * i + 1
            right = 2 * i + 2
            if left < size and a[left] > a[largest]:
                largest = left
            if right < size and a[right] > a[largest]:
                largest = right
            if largest == i:
                return
            a[i], a[largest] = a[largest], a[i]
            i = largest
