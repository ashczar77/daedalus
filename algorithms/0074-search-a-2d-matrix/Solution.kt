// Search a 2D Matrix - flatten to 1D binary search; mid maps to (mid/cols, mid%cols).
// Time O(log(m*n)), Space O(1).

class Solution {
    fun searchMatrix(matrix: Array<IntArray>, target: Int): Boolean {
        val m = matrix.size
        val n = matrix[0].size
        var left = 0
        var right = m * n - 1
        while (left <= right) {
            val mid = left + (right - left) / 2
            val row = mid / n
            val col = mid % n
            val value = matrix[row][col]
            when {
                value == target -> return true
                value < target -> left = mid + 1
                else -> right = mid - 1
            }
        }
        return false
    }
}
