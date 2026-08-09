// Binary Tree Level Order Traversal - size-based BFS with a node queue.
// Time O(n), Space O(n).

class TreeNode(var `val`: Int) {
    var left: TreeNode? = null
    var right: TreeNode? = null
}

class Solution {
    fun levelOrder(root: TreeNode?): List<List<Int>> {
        val result = mutableListOf<List<Int>>()
        if (root == null) return result
        val q = ArrayDeque<TreeNode>()
        q.addLast(root)
        while (q.isNotEmpty()) {
            val size = q.size
            val level = mutableListOf<Int>()
            repeat(size) {
                val node = q.removeFirst()
                level.add(node.`val`)
                node.left?.let { q.addLast(it) }
                node.right?.let { q.addLast(it) }
            }
            result.add(level)
        }
        return result
    }
}
