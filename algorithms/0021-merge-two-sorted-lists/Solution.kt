// Merge Two Sorted Lists - dummy head + splice nodes from list1/list2.
// Time O(n+m), Space O(1) extra (reuse nodes).

class ListNode(var `val`: Int, var next: ListNode? = null)

class Solution {
    fun mergeTwoLists(list1: ListNode?, list2: ListNode?): ListNode? {
        val dummy = ListNode(0)
        var runner = dummy
        var a = list1
        var b = list2
        while (a != null && b != null) {
            if (a.`val` <= b.`val`) {
                runner.next = a
                a = a.next
            } else {
                runner.next = b
                b = b.next
            }
            runner = runner.next!!
        }
        runner.next = a ?: b
        return dummy.next
    }
}
