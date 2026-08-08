# Merge Sort — divide in half, sort recursively, merge ordered runs.
# Time O(n log n), Space O(n).

class Solution:
    def mergeSort(self, a: list[int]) -> None:
        if len(a) < 2:
            return
        self._sort(a, 0, len(a) - 1, [0] * len(a))

    def _sort(self, a: list[int], lo: int, hi: int, tmp: list[int]) -> None:
        if lo >= hi:
            return
        mid = lo + (hi - lo) // 2
        self._sort(a, lo, mid, tmp)
        self._sort(a, mid + 1, hi, tmp)
        self._merge(a, lo, mid, hi, tmp)

    def _merge(self, a: list[int], lo: int, mid: int, hi: int, tmp: list[int]) -> None:
        tmp[lo : hi + 1] = a[lo : hi + 1]
        i, j = lo, mid + 1
        for k in range(lo, hi + 1):
            if i > mid:
                a[k] = tmp[j]
                j += 1
            elif j > hi:
                a[k] = tmp[i]
                i += 1
            elif tmp[j] < tmp[i]:
                a[k] = tmp[j]
                j += 1
            else:
                a[k] = tmp[i]
                i += 1
