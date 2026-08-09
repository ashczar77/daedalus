// Maximum Depth of Binary Tree - DFS 1 + max(left, right).
// Time O(n), Space O(h).

class TreeNode(var `val`: Int, var left: TreeNode? = null, var right: TreeNode? = null)

class Solution {
    fun maxDepth(root: TreeNode?): Int {
        if (root == null) return 0
        val left = maxDepth(root.left)
        val right = maxDepth(root.right)
        return 1 + maxOf(left, right)
    }
}
