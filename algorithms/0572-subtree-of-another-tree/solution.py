# Subtree of Another Tree - search candidates, then Same Tree verify.
# Time O(m·n), Space O(h). Pass full subRoot when searching children.

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def isSubtree(self, root: TreeNode | None, subRoot: TreeNode | None) -> bool:
        if subRoot is None:
            return True
        if root is None:
            return False
        if self.isSameTree(root, subRoot):
            return True
        return self.isSubtree(root.left, subRoot) or self.isSubtree(
            root.right, subRoot
        )

    def isSameTree(self, p: TreeNode | None, q: TreeNode | None) -> bool:
        if p is None or q is None:
            return p is q
        if p.val != q.val:
            return False
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)
