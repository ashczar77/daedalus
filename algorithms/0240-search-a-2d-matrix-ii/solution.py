# Search a 2D Matrix II - staircase from top-right; eliminate row or column.
# Time O(m+n), Space O(1).

class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        if not matrix or not matrix[0]:
            return False
        row = 0
        col = len(matrix[0]) - 1
        while row < len(matrix) and col >= 0:
            cur = matrix[row][col]
            if cur == target:
                return True
            if cur > target:
                col -= 1
            else:
                row += 1
        return False
