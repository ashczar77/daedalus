# Selection Sort - each pass select the minimum of the unsorted suffix and swap it forward.
# Time O(n²), Space O(1).

class Solution:
    def selectionSort(self, a: list[int]) -> None:
        n = len(a)
        for i in range(n - 1):
            min_i = i
            for j in range(i + 1, n):
                if a[j] < a[min_i]:
                    min_i = j
            if min_i != i:
                a[i], a[min_i] = a[min_i], a[i]
