// Max Area of Island - DFS flood-fill; return area, track global max.
// Time O(m*n), Space O(m*n) worst-case recursion depth.

class Solution {
    fun maxAreaOfIsland(grid: Array<IntArray>): Int {
        if (grid.isEmpty()) return 0
        var maxArea = 0
        for (r in grid.indices) {
            for (c in grid[0].indices) {
                if (grid[r][c] == 1) {
                    maxArea = maxOf(maxArea, dfs(grid, r, c))
                }
            }
        }
        return maxArea
    }

    private fun dfs(grid: Array<IntArray>, r: Int, c: Int): Int {
        if (r !in grid.indices || c !in grid[0].indices) return 0
        if (grid[r][c] != 1) return 0
        grid[r][c] = 0
        return 1 +
            dfs(grid, r + 1, c) +
            dfs(grid, r - 1, c) +
            dfs(grid, r, c + 1) +
            dfs(grid, r, c - 1)
    }
}
