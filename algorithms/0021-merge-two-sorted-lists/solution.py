# Merge Two Sorted Lists - dummy head + splice nodes from list1/list2.
# Time O(n+m), Space O(1) extra (reuse nodes).

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeTwoLists(self, list1: ListNode | None, list2: ListNode | None) -> ListNode | None:
        dummy = ListNode(0)
        runner = dummy
        while list1 is not None and list2 is not None:
            if list1.val <= list2.val:
                runner.next = list1
                list1 = list1.next
            else:
                runner.next = list2
                list2 = list2.next
            runner = runner.next
        runner.next = list1 if list1 is not None else list2
        return dummy.next
