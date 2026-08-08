# Insertion Sort — grow a sorted prefix; insert a[i] by shifting larger neighbors right.
# Time O(n²), Space O(1).

class Solution:
    def insertionSort(self, a: list[int]) -> None:
        for i in range(1, len(a)):
            key = a[i]
            j = i - 1
            while j >= 0 and a[j] > key:
                a[j + 1] = a[j]
                j -= 1
            a[j + 1] = key
