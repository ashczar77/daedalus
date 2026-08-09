// Contains Duplicate - HashSet membership; add() returns false on collision.
// Time O(n), Space O(n).

class Solution {
    fun containsDuplicate(nums: IntArray): Boolean {
        val seen = HashSet<Int>()
        for (num in nums) {
            if (!seen.add(num)) {
                return true
            }
        }
        return false
    }
}
