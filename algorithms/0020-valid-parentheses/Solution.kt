// Valid Parentheses — stack of opens; each close must match the top open.
// Time O(n), Space O(n).

class Solution {
    fun isValid(s: String): Boolean {
        val pairs = mapOf(')' to '(', ']' to '[', '}' to '{')
        val stack = ArrayDeque<Char>()
        for (ch in s) {
            if (ch !in pairs) {
                stack.push(ch)
                continue
            }
            if (stack.isEmpty() || stack.pop() != pairs[ch]) return false
        }
        return stack.isEmpty()
    }
}
