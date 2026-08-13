// Search a 2D Matrix II - staircase from top-right; eliminate row or column.
// Time O(m+n), Space O(1).

class Solution {
    fun searchMatrix(matrix: Array<IntArray>, target: Int): Boolean {
        if (matrix.isEmpty() || matrix[0].isEmpty()) return false
        var row = 0
        var col = matrix[0].lastIndex
        while (row < matrix.size && col >= 0) {
            val cur = matrix[row][col]
            when {
                cur == target -> return true
                cur > target -> col--
                else -> row++
            }
        }
        return false
    }
}
