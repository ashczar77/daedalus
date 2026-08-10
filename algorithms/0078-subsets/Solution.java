// Subsets - backtracking: record path, choose, recurse, undo.
// Time O(n * 2^n), Space O(n) recursion (output O(n * 2^n)).

import java.util.ArrayList;
import java.util.List;

class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(
        int[] nums,
        int start,
        List<Integer> path,
        List<List<Integer>> result
    ) {
        result.add(new ArrayList<>(path));
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1, path, result);
            path.remove(path.size() - 1);
        }
    }
}
