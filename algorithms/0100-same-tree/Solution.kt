// Same Tree - simultaneous DFS on both trees.
// Time O(n), Space O(h).

class TreeNode(var `val`: Int, var left: TreeNode? = null, var right: TreeNode? = null)

class Solution {
    fun isSameTree(p: TreeNode?, q: TreeNode?): Boolean {
        if (p == null || q == null) return p === q
        if (p.`val` != q.`val`) return false
        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right)
    }
}
