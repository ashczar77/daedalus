// Diameter of Binary Tree - DFS returns height; track max left+right path.
// Time O(n), Space O(h).

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int val) { this.val = val; }
}

class Solution {
    private int best = 0;

    public int diameterOfBinaryTree(TreeNode root) {
        best = 0;
        height(root);
        return best;
    }

    private int height(TreeNode node) {
        if (node == null) {
            return 0;
        }
        int left = height(node.left);
        int right = height(node.right);
        best = Math.max(best, left + right);
        return 1 + Math.max(left, right);
    }
}
