// Validate Binary Search Tree - DFS with open interval bounds.
// Time O(n), Space O(h). Use Long so Int.MIN/MAX are valid node values.

class TreeNode(var `val`: Int, var left: TreeNode? = null, var right: TreeNode? = null)

class Solution {
    fun isValidBST(root: TreeNode?): Boolean {
        return dfs(root, Long.MIN_VALUE, Long.MAX_VALUE)
    }

    private fun dfs(node: TreeNode?, low: Long, high: Long): Boolean {
        if (node == null) return true
        if (node.`val` <= low || node.`val` >= high) return false
        return dfs(node.left, low, node.`val`.toLong()) &&
            dfs(node.right, node.`val`.toLong(), high)
    }
}
