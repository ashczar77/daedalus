# Binary Tree Level Order Traversal - size-based BFS with a node queue.
# Time O(n), Space O(n).

from collections import deque


class TreeNode:
    def __init__(self, val: int = 0, left: "TreeNode | None" = None, right: "TreeNode | None" = None):
        self.val = val
        self.left = left
        self.right = right


class Solution:
    def levelOrder(self, root: TreeNode | None) -> list[list[int]]:
        result: list[list[int]] = []
        if root is None:
            return result
        q: deque[TreeNode] = deque([root])
        while q:
            size = len(q)
            level: list[int] = []
            for _ in range(size):
                node = q.popleft()
                level.append(node.val)
                if node.left is not None:
                    q.append(node.left)
                if node.right is not None:
                    q.append(node.right)
            result.append(level)
        return result
