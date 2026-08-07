// Evaluate RPN — stack of operands; operators pop right then left (b op a).
// Time O(n), Space O(n).

class Solution {
    fun evalRPN(tokens: Array<String>): Int {
        val stack = ArrayDeque<Int>()
        val ops = setOf("+", "-", "*", "/")
        for (token in tokens) {
            if (token !in ops) {
                stack.push(token.toInt())
                continue
            }
            val a = stack.pop()
            val b = stack.pop()
            when (token) {
                "+" -> stack.push(b + a)
                "-" -> stack.push(b - a)
                "*" -> stack.push(b * a)
                "/" -> stack.push(b / a)
            }
        }
        return stack.pop()
    }
}
