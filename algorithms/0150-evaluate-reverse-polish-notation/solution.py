# Evaluate RPN — stack of operands; operators pop right then left (b op a).
# Time O(n), Space O(n). Integer division truncates toward zero.

class Solution:
    def evalRPN(self, tokens: list[str]) -> int:
        stack: list[int] = []
        ops = {"+", "-", "*", "/"}
        for token in tokens:
            if token not in ops:
                stack.append(int(token))
                continue
            a = stack.pop()
            b = stack.pop()
            if token == "+":
                stack.append(b + a)
            elif token == "-":
                stack.append(b - a)
            elif token == "*":
                stack.append(b * a)
            else:
                stack.append(int(b / a))
        return stack.pop()
