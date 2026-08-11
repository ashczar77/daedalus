/**
 * LeetCode #347 - Top K Frequent Elements (size-k min-heap on frequencies).
 * Sibling of #215: heap of (value, count) pairs instead of bare ints.
 */
import javaSrc from '../../algorithms/0347-top-k-frequent-elements/Solution.java?raw'
import kotlinSrc from '../../algorithms/0347-top-k-frequent-elements/Solution.kt?raw'
import pythonSrc from '../../algorithms/0347-top-k-frequent-elements/solution.py?raw'
import { defineInput, formatIntList, parseIntList, parseIntValue } from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { nums: number[]; k: number }

/** Classic LC demo: k=2 → [1, 2]. */
const defaultNums = [1, 1, 1, 2, 2, 3]
const defaultK = 2

const L = {
  enter: { java: 10, kotlin: 8, python: 9 },
  count: { java: 12, kotlin: 10, python: 11 },
  offer: { java: 18, kotlin: 15, python: 15 },
  poll: { java: 19, kotlin: 16, python: 17 },
  ret: { java: 26, kotlin: 19, python: 19 },
} as const

type FreqEntry = { num: number; count: number }

function entryLabel(e: FreqEntry): string {
  return `${e.num}×${e.count}`
}

function parent(i: number) {
  return Math.floor((i - 1) / 2)
}

function siftUp(heap: FreqEntry[], i: number): number {
  while (i > 0) {
    const p = parent(i)
    if (heap[p]!.count <= heap[i]!.count) break
    ;[heap[p], heap[i]] = [heap[i]!, heap[p]!]
    i = p
  }
  return i
}

function siftDown(heap: FreqEntry[], i: number) {
  const n = heap.length
  while (true) {
    let smallest = i
    const left = 2 * i + 1
    const right = 2 * i + 2
    if (left < n && heap[left]!.count < heap[smallest]!.count) smallest = left
    if (right < n && heap[right]!.count < heap[smallest]!.count) smallest = right
    if (smallest === i) break
    ;[heap[i], heap[smallest]] = [heap[smallest]!, heap[i]!]
    i = smallest
  }
}

function offer(heap: FreqEntry[], entry: FreqEntry): number {
  heap.push(entry)
  return siftUp(heap, heap.length - 1)
}

function poll(heap: FreqEntry[]): FreqEntry | undefined {
  if (heap.length === 0) return undefined
  const min = heap[0]!
  const last = heap.pop()!
  if (heap.length > 0) {
    heap[0] = last
    siftDown(heap, 0)
  }
  return min
}

function numsHeap(values: number[], i: number | null, highlights: ArrayHighlight[]): HeapObject {
  return {
    id: 'nums',
    kind: 'array',
    label: 'int[] nums',
    values: [...values],
    ...(i != null ? { pointers: { i }, highlights } : { highlights }),
    focused: true,
  }
}

function freqMapHeap(
  freq: Map<number, number>,
  focusKeys: Array<string | number> = [],
): HeapObject {
  return {
    id: 'freq',
    kind: 'hashmap',
    label: 'freq (HashMap)',
    entries: [...freq.entries()].map(([num, count]) => [num, count] as [number, number]),
    focusKeys,
    focused: true,
  }
}

function minHeapObject(
  items: FreqEntry[],
  k: number,
  opts: {
    rootAction?: 'offer' | 'poll' | 'peek'
    focusIndex?: number
    caption?: string
  } = {},
): HeapObject {
  return {
    id: 'minHeap',
    kind: 'heap',
    label: 'PriorityQueue minHeap (num×count)',
    items: items.map(entryLabel),
    order: 'min',
    capacity: k,
    focused: true,
    ...(opts.rootAction ? { rootAction: opts.rootAction } : {}),
    ...(opts.focusIndex != null ? { focusIndex: opts.focusIndex } : {}),
    ...(opts.caption ? { caption: opts.caption } : {}),
  }
}

function generateSteps({ nums, k }: Input): Step[] {
  const steps: Step[] = []
  let id = 1
  const freq = new Map<number, number>()
  const heap: FreqEntry[] = []

  const push = (
    narrative: string,
    why: string,
    codeFocus: (typeof L)[keyof typeof L],
    locals: Record<string, unknown>,
    heapObjs: HeapObject[],
  ) => {
    steps.push({
      id: id++,
      narrative,
      why,
      codeFocus,
      callStack: [
        {
          name: 'topKFrequent',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            k,
            freq: { ref: 'freq' },
            minHeap: { ref: 'minHeap' },
            ...locals,
          },
        },
      ],
      heap: heapObjs,
    })
  }

  push(
    `Enter topKFrequent. Count frequencies, then keep a size-${k} min-heap by count.`,
    'Root of a size-k min-heap of frequencies is the least frequent of the top k.',
    L.enter,
    {},
    [
      numsHeap(nums, nums.length ? 0 : null, []),
      freqMapHeap(freq),
      minHeapObject(heap, k, { caption: `capacity k = ${k}` }),
    ],
  )

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]!
    freq.set(num, (freq.get(num) ?? 0) + 1)
    const highlights: ArrayHighlight[] = []
    for (let j = 0; j < i; j++) highlights.push({ index: j, role: 'visited' })
    highlights.push({ index: i, role: 'current' })

    push(
      `i=${i}: nums[i]=${num} → freq[${num}]=${freq.get(num)}.`,
      'First pass builds a HashMap from value to occurrence count.',
      L.count,
      { i, num, count: freq.get(num) },
      [
        numsHeap(nums, i, highlights),
        freqMapHeap(freq, [num]),
        minHeapObject(heap, k),
      ],
    )
  }

  for (const [num, count] of freq.entries()) {
    const entry: FreqEntry = { num, count }
    const offeredIndex = offer(heap, entry)
    push(
      `Offer ${entryLabel(entry)}. Heap size=${heap.length}${heap.length > k ? ` > k=${k}` : ''}.`,
      'Order by count (min-heap). Labels show value×frequency for the walkthrough.',
      L.offer,
      { num, count, size: heap.length },
      [
        numsHeap(
          nums,
          null,
          nums.map((_, index) => ({ index, role: 'visited' as const })),
        ),
        freqMapHeap(freq, [num]),
        minHeapObject(heap, k, {
          rootAction: 'offer',
          focusIndex: offeredIndex,
          caption: `add ${entryLabel(entry)}`,
        }),
      ],
    )

    if (heap.length > k) {
      const dropped = heap[0]!
      push(
        `size > k → poll root ${entryLabel(dropped)}. Drop the least frequent candidate.`,
        'Anything rarer than the current kth cannot be in the answer.',
        L.poll,
        { polled: entryLabel(dropped), size: heap.length },
        [
          numsHeap(
            nums,
            null,
            nums.map((_, index) => ({ index, role: 'visited' as const })),
          ),
          freqMapHeap(freq),
          minHeapObject(heap, k, {
            rootAction: 'poll',
            caption: `poll ${entryLabel(dropped)}`,
          }),
        ],
      )
      poll(heap)
    }
  }

  const answer = heap.map((e) => e.num)
  push(
    `Return the heap keys: [${answer.join(', ')}].`,
    'After one pass over unique values, the heap holds the k most frequent numbers.',
    L.ret,
    { result: answer },
    [
      numsHeap(
        nums,
        null,
        nums.map((_, index) => ({ index, role: 'visited' as const })),
      ),
      freqMapHeap(freq),
      minHeapObject(heap, k, {
        rootAction: 'peek',
        caption: `return [${answer.join(', ')}]`,
      }),
    ],
  )

  return steps
}

const input = defineInput<Input>({
  kind: 'intArrayK',
  fields: [
    {
      key: 'nums',
      label: 'nums',
      widget: 'text',
      placeholder: '1, 1, 1, 2, 2, 3',
      hint: 'Up to 12 integers from -99-99',
    },
    {
      key: 'k',
      label: 'k',
      widget: 'text',
      placeholder: '2',
      hint: 'How many top-frequency values to return (1..unique count)',
    },
  ],
  defaultRaw: {
    nums: formatIntList(defaultNums),
    k: String(defaultK),
  },
  parse: (raw) => {
    const numsResult = parseIntList(raw.nums ?? '', {
      name: 'nums',
      minLen: 1,
      maxLen: 12,
      minVal: -99,
      maxVal: 99,
    })
    if (!numsResult.ok) return numsResult
    const unique = new Set(numsResult.value).size
    const kResult = parseIntValue(raw.k ?? '', {
      name: 'k',
      minVal: 1,
      maxVal: unique,
    })
    if (!kResult.ok) {
      if (kResult.errors[0]?.includes('between')) {
        return {
          ok: false,
          errors: [`k must be between 1 and the number of unique values (${unique}).`],
        }
      }
      return kResult
    }
    return { ok: true, value: { nums: numsResult.value, k: kResult.value } }
  },
  formatLabel: (value) => `nums = [${value.nums.join(', ')}], k = ${value.k}`,
  generateSteps,
  fixtures: [
    { name: 'k-one', raw: { nums: '4, 1, 4, 4, 2', k: '1' } },
    { name: 'all-unique', raw: { nums: '5, 3, 1', k: '2' } },
    { name: 'ties-ok', raw: { nums: '1, 2, 1, 2, 3', k: '2' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(`Top K Frequent default input invalid: ${defaultParsed.errors.join('; ')}`)
}

export const topKFrequentElements: ProblemPack = {
  id: '0347-top-k-frequent-elements',
  lcNumber: 347,
  title: 'Top K Frequent Elements',
  pattern: 'Heap',
  difficulty: 'Medium',
  insight:
    'Count with a HashMap, then keep a size-k min-heap ordered by frequency; return the keys.',
  invariant:
    'After each offer (and optional poll), the heap holds the k most frequent values seen among unique keys.',
  complexity: { time: 'O(n log k)', space: 'O(n)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: defaultNums.length },
  benchmark: placeholderBenchmark(
    'Size-k heap on unique keys beats sorting all n when k is small; each offer/poll is O(log k).',
  ),
  walkthrough: {
    statement:
      'Given an integer array nums and an integer k, return the k most frequent elements. Order does not matter.',
    keyIdea:
      'Frequency map first; a min-heap of size k by count drops anything rarer than the current kth.',
    approach: [
      'Count occurrences into a HashMap.',
      'For each (num, count): offer to a min-heap ordered by count; if size > k, poll.',
      'Return the numbers left in the heap.',
    ],
  },
}
