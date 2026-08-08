# Bubble Sort — adjacent swaps; largest element "bubbles" to the end each pass.
# Time O(n²), Space O(1).

class Solution:
    def bubbleSort(self, a: list[int]) -> None:
        end = len(a) - 1
        while end > 0:
            swapped = False
            for i in range(end):
                if a[i] > a[i + 1]:
                    a[i], a[i + 1] = a[i + 1], a[i]
                    swapped = True
            if not swapped:
                break
            end -= 1
