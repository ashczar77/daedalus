// Valid Parentheses — stack of opens; each close must match the top open.
// Time O(n), Space O(n).

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;

class Solution {
    public boolean isValid(String s) {
        Map<Character, Character> pairs = Map.of(')', '(', ']', '[', '}', '{');
        Deque<Character> stack = new ArrayDeque<>();
        for (char ch : s.toCharArray()) {
            if (!pairs.containsKey(ch)) {
                stack.push(ch);
                continue;
            }
            if (stack.isEmpty() || stack.pop() != pairs.get(ch)) {
                return false;
            }
        }
        return stack.isEmpty();
    }
}
