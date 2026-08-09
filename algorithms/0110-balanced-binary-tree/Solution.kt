// Balanced Binary Tree - one DFS returns height or -1 if unbalanced.
// Time O(n), Space O(h).

class TreeNode(var `val`: Int, var left: TreeNode? = null, var right: TreeNode? = null)

class Solution {
    fun isBalanced(root: TreeNode?): Boolean {
        return height(root) != -1
    }

    private fun height(node: TreeNode?): Int {
        if (node == null) return 0
        val left = height(node.left)
        if (left == -1) return -1
        val right = height(node.right)
        if (right == -1) return -1
        if (kotlin.math.abs(left - right) > 1) return -1
        return 1 + maxOf(left, right)
    }
}
