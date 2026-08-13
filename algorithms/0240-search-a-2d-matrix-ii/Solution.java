// Search a 2D Matrix II - staircase from top-right; eliminate row or column.
// Time O(m+n), Space O(1).

class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        if (matrix == null || matrix.length == 0 || matrix[0].length == 0) {
            return false;
        }
        int row = 0;
        int col = matrix[0].length - 1;
        while (row < matrix.length && col >= 0) {
            int cur = matrix[row][col];
            if (cur == target) {
                return true;
            }
            if (cur > target) {
                col--;
            } else {
                row++;
            }
        }
        return false;
    }
}
