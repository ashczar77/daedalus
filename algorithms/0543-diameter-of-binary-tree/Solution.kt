// Diameter of Binary Tree - DFS returns height; track max left+right path.
// Time O(n), Space O(h).

class TreeNode(var `val`: Int, var left: TreeNode? = null, var right: TreeNode? = null)

class Solution {
    private var best = 0

    fun diameterOfBinaryTree(root: TreeNode?): Int {
        best = 0
        height(root)
        return best
    }

    private fun height(node: TreeNode?): Int {
        if (node == null) return 0
        val left = height(node.left)
        val right = height(node.right)
        best = maxOf(best, left + right)
        return 1 + maxOf(left, right)
    }
}
