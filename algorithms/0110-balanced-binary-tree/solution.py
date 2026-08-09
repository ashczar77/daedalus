# Balanced Binary Tree - one DFS returns height or -1 if unbalanced.
# Time O(n), Space O(h).

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def isBalanced(self, root: TreeNode | None) -> bool:
        return self.height(root) != -1

    def height(self, node: TreeNode | None) -> int:
        if node is None:
            return 0
        left = self.height(node.left)
        if left == -1:
            return -1
        right = self.height(node.right)
        if right == -1:
            return -1
        if abs(left - right) > 1:
            return -1
        return 1 + max(left, right)
