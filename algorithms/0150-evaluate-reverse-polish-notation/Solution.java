// Evaluate RPN — stack of operands; operators pop right then left (b op a).
// Time O(n), Space O(n).

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Set;

class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> stack = new ArrayDeque<>();
        Set<String> ops = Set.of("+", "-", "*", "/");
        for (String token : tokens) {
            if (!ops.contains(token)) {
                stack.push(Integer.parseInt(token));
                continue;
            }
            int a = stack.pop();
            int b = stack.pop();
            switch (token) {
                case "+" -> stack.push(b + a);
                case "-" -> stack.push(b - a);
                case "*" -> stack.push(b * a);
                case "/" -> stack.push(b / a);
            }
        }
        return stack.pop();
    }
}
