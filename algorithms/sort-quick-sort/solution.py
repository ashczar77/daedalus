# Quick Sort — partition around a pivot, then recurse on both sides.
# Time O(n log n) average, O(n²) worst. Space O(log n) stack.

class Solution:
    def quickSort(self, a: list[int]) -> None:
        if len(a) < 2:
            return
        self._sort(a, 0, len(a) - 1)

    def _sort(self, a: list[int], lo: int, hi: int) -> None:
        if lo >= hi:
            return
        p = self._partition(a, lo, hi)
        self._sort(a, lo, p - 1)
        self._sort(a, p + 1, hi)

    def _partition(self, a: list[int], lo: int, hi: int) -> int:
        pivot = a[hi]
        i = lo
        for j in range(lo, hi):
            if a[j] < pivot:
                a[i], a[j] = a[j], a[i]
                i += 1
        a[i], a[hi] = a[hi], a[i]
        return i
