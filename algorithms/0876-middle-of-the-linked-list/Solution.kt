// Middle of the Linked List - fast/slow pointers.
// Time O(n), Space O(1).

class ListNode(var `val`: Int, var next: ListNode? = null)

class Solution {
    fun middleNode(head: ListNode?): ListNode? {
        var slow = head
        var fast = head
        while (fast?.next != null) {
            slow = slow?.next
            fast = fast.next!!.next
        }
        return slow
    }
}
