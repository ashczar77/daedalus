# Search a 2D Matrix - flatten to 1D binary search; mid maps to (mid/cols, mid%cols).
# Time O(log(m*n)), Space O(1).

class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        m = len(matrix)
        n = len(matrix[0])
        left = 0
        right = m * n - 1
        while left <= right:
            mid = left + (right - left) // 2
            row = mid // n
            col = mid % n
            value = matrix[row][col]
            if value == target:
                return True
            if value < target:
                left = mid + 1
            else:
                right = mid - 1
        return False
