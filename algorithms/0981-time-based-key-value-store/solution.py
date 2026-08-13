# Time Based Key-Value Store - append on set; get binary-searches floor timestamp.
# Time set O(1), get O(log n); Space O(n).

class TimeMap:
    def __init__(self):
        self.store: dict[str, list[tuple[int, str]]] = {}

    def set(self, key: str, value: str, timestamp: int) -> None:
        if key not in self.store:
            self.store[key] = []
        self.store[key].append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        lst = self.store.get(key)
        if not lst:
            return ""
        left = 0
        right = len(lst) - 1
        ans = ""
        while left <= right:
            mid = left + (right - left) // 2
            if lst[mid][0] <= timestamp:
                ans = lst[mid][1]
                left = mid + 1
            else:
                right = mid - 1
        return ans
