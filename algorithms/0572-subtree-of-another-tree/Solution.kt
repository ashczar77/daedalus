// Subtree of Another Tree - search candidates, then Same Tree verify.
// Time O(m·n), Space O(h). Pass full subRoot when searching children.

class TreeNode(var `val`: Int, var left: TreeNode? = null, var right: TreeNode? = null)

class Solution {
    fun isSubtree(root: TreeNode?, subRoot: TreeNode?): Boolean {
        if (subRoot == null) return true
        if (root == null) return false
        if (isSameTree(root, subRoot)) return true
        return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot)
    }

    private fun isSameTree(p: TreeNode?, q: TreeNode?): Boolean {
        if (p == null || q == null) return p === q
        if (p.`val` != q.`val`) return false
        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right)
    }
}
