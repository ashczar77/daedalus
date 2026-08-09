// Remove Nth Node From End - dummy + two pointers with an n+1 gap.
// Time O(n), Space O(1).

class ListNode(var `val`: Int) {
    var next: ListNode? = null
}

class Solution {
    fun removeNthFromEnd(head: ListNode?, n: Int): ListNode? {
        val dummy = ListNode(0).also { it.next = head }
        var fast: ListNode? = dummy
        var slow: ListNode? = dummy
        repeat(n + 1) {
            fast = fast?.next
        }
        while (fast != null) {
            fast = fast?.next
            slow = slow?.next
        }
        slow?.next = slow?.next?.next
        return dummy.next
    }
}
