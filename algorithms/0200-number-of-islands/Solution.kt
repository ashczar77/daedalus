// Number of Islands - DFS flood-fill on a grid.
// Time O(m*n), Space O(m*n) worst-case recursion depth.

class Solution {
    fun numIslands(grid: Array<CharArray>): Int {
        if (grid.isEmpty()) return 0
        var islands = 0
        for (r in grid.indices) {
            for (c in grid[0].indices) {
                if (grid[r][c] == '1') {
                    islands++
                    dfs(grid, r, c)
                }
            }
        }
        return islands
    }

    private fun dfs(grid: Array<CharArray>, r: Int, c: Int) {
        if (r !in grid.indices || c !in grid[0].indices) return
        if (grid[r][c] != '1') return
        grid[r][c] = '0'
        dfs(grid, r + 1, c)
        dfs(grid, r - 1, c)
        dfs(grid, r, c + 1)
        dfs(grid, r, c - 1)
    }
}
