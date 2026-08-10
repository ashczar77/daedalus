# Validate Binary Search Tree - DFS with open interval bounds.
# Time O(n), Space O(h). Use ±inf so int min/max values stay valid.


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def isValidBST(self, root: TreeNode | None) -> bool:
        return self.dfs(root, float("-inf"), float("inf"))

    def dfs(self, node: TreeNode | None, low: float, high: float) -> bool:
        if node is None:
            return True
        if node.val <= low or node.val >= high:
            return False
        return self.dfs(node.left, low, node.val) and self.dfs(
            node.right, node.val, high
        )
