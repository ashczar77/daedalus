// Lowest Common Ancestor of a BST - iterative walk using BST order.
// Time O(h), Space O(1).

class TreeNode(var `val`: Int, var left: TreeNode? = null, var right: TreeNode? = null)

class Solution {
    fun lowestCommonAncestor(root: TreeNode?, p: TreeNode?, q: TreeNode?): TreeNode? {
        var cur = root
        while (cur != null) {
            val pv = p!!.`val`
            val qv = q!!.`val`
            if (pv > cur.`val` && qv > cur.`val`) {
                cur = cur.right
            } else if (pv < cur.`val` && qv < cur.`val`) {
                cur = cur.left
            } else {
                return cur
            }
        }
        return null
    }
}
