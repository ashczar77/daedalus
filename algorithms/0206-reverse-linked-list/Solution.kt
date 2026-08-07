// Reverse Linked List — iterative three-pointer reversal (prev, cur, next).
// Time O(n), Space O(1).

class ListNode(var `val`: Int, var next: ListNode? = null)

class Solution {
    fun reverseList(head: ListNode?): ListNode? {
        var prev: ListNode? = null
        var cur = head
        while (cur != null) {
            val next = cur.next
            cur.next = prev
            prev = cur
            cur = next
        }
        return prev
    }
}
