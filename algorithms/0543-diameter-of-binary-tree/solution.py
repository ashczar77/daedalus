# Diameter of Binary Tree — DFS returns height; track max left+right path.
# Time O(n), Space O(h).

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def diameterOfBinaryTree(self, root: TreeNode | None) -> int:
        self.best = 0

        def height(node: TreeNode | None) -> int:
            if node is None:
                return 0
            left = height(node.left)
            right = height(node.right)
            self.best = max(self.best, left + right)
            return 1 + max(left, right)

        height(root)
        return self.best
