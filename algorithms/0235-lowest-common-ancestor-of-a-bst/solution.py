# Lowest Common Ancestor of a BST - iterative walk using BST order.
# Time O(h), Space O(1).


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def lowestCommonAncestor(
        self, root: TreeNode | None, p: TreeNode | None, q: TreeNode | None
    ) -> TreeNode | None:
        cur = root
        while cur is not None:
            if p.val > cur.val and q.val > cur.val:
                cur = cur.right
            elif p.val < cur.val and q.val < cur.val:
                cur = cur.left
            else:
                return cur
        return None
