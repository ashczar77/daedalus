// Time Based Key-Value Store - append on set; get binary-searches floor timestamp.
// Time set O(1), get O(log n); Space O(n).

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class TimeMap {
    private static class Pair {
        final int timestamp;
        final String value;

        Pair(int timestamp, String value) {
            this.timestamp = timestamp;
            this.value = value;
        }
    }

    private final Map<String, List<Pair>> store = new HashMap<>();

    public TimeMap() {
    }

    public void set(String key, String value, int timestamp) {
        store.computeIfAbsent(key, k -> new ArrayList<>())
                .add(new Pair(timestamp, value));
    }

    public String get(String key, int timestamp) {
        List<Pair> list = store.get(key);
        if (list == null || list.isEmpty()) {
            return "";
        }
        int left = 0;
        int right = list.size() - 1;
        String ans = "";
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (list.get(mid).timestamp <= timestamp) {
                ans = list.get(mid).value;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return ans;
    }
}
