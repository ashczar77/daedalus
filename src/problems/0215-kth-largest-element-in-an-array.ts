/**
 * LeetCode #215 - Kth Largest Element in an Array (size-k min-heap).
 * Steps walk a PriorityQueue that keeps only the k largest seen so far.
 */
import javaSrc from '../../algorithms/0215-kth-largest-element-in-an-array/Solution.java?raw'
import kotlinSrc from '../../algorithms/0215-kth-largest-element-in-an-array/Solution.kt?raw'
import pythonSrc from '../../algorithms/0215-kth-largest-element-in-an-array/solution.py?raw'
import { defineInput, formatIntList, parseIntList, parseIntValue } from '../engine/input'
import type { ArrayHighlight, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { nums: number[]; k: number }

/** Classic LC demo: k=2 → 5. */
const defaultNums = [3, 2, 1, 5, 6, 4]
const defaultK = 2

const L = {
  enter: { java: 8, kotlin: 8, python: 9 },
  add: { java: 11, kotlin: 11, python: 12 },
  poll: { java: 13, kotlin: 13, python: 15 },
  ret: { java: 16, kotlin: 16, python: 17 },
} as const

function parent(i: number) {
  return Math.floor((i - 1) / 2)
}

function siftUp(heap: number[], i: number): number {
  while (i > 0) {
    const p = parent(i)
    if (heap[p]! <= heap[i]!) break
    ;[heap[p], heap[i]] = [heap[i]!, heap[p]!]
    i = p
  }
  return i
}

function siftDown(heap: number[], i: number) {
  const n = heap.length
  while (true) {
    let smallest = i
    const left = 2 * i + 1
    const right = 2 * i + 2
    if (left < n && heap[left]! < heap[smallest]!) smallest = left
    if (right < n && heap[right]! < heap[smallest]!) smallest = right
    if (smallest === i) break
    ;[heap[i], heap[smallest]] = [heap[smallest]!, heap[i]!]
    i = smallest
  }
}

/** Insert and return the final index after sift-up. */
function offer(heap: number[], value: number): number {
  heap.push(value)
  return siftUp(heap, heap.length - 1)
}

function poll(heap: number[]): number | undefined {
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

function minHeapObject(
  items: number[],
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
    label: 'PriorityQueue minHeap',
    items: [...items],
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
  const heap: number[] = []

  const push = (
    narrative: string,
    why: string,
    codeFocus: (typeof L)[keyof typeof L],
    i: number | null,
    highlights: ArrayHighlight[],
    locals: Record<string, unknown>,
    heapOpts: Parameters<typeof minHeapObject>[2] = {},
  ) => {
    steps.push({
      id: id++,
      narrative,
      why,
      codeFocus,
      callStack: [
        {
          name: 'findKthLargest',
          active: true,
          locals: {
            nums: { ref: 'nums' },
            k,
            minHeap: { ref: 'minHeap' },
            ...locals,
          },
        },
      ],
      heap: [numsHeap(nums, i, highlights), minHeapObject(heap, k, heapOpts)],
    })
  }

  push(
    `Enter findKthLargest. Keep a min-heap of size at most k=${k}.`,
    'Root of a size-k min-heap is the smallest of the k largest → the kth largest when done.',
    L.enter,
    nums.length ? 0 : null,
    [],
    {},
    { caption: `capacity k = ${k}` },
  )

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]!
    const highlights: ArrayHighlight[] = []
    for (let j = 0; j < i; j++) highlights.push({ index: j, role: 'visited' })
    highlights.push({ index: i, role: 'current' })

    const offeredIndex = offer(heap, num)
    push(
      `i=${i}: add ${num}. Heap size=${heap.length}${heap.length > k ? ` > k=${k}` : ''}.`,
      'Always insert first; the heap property bubbles the new value into place.',
      L.add,
      i,
      highlights,
      { i, num, size: heap.length },
      {
        rootAction: 'offer',
        focusIndex: offeredIndex,
        caption: `add ${num}`,
      },
    )

    if (heap.length > k) {
      const dropped = heap[0]!
      push(
        `size > k → poll root ${dropped}. Drop it so the heap keeps only the ${k} largest so far.`,
        'Evict the smallest of the candidates; anything smaller than the kth can never be the answer.',
        L.poll,
        i,
        highlights,
        { i, num, polled: dropped, size: heap.length },
        {
          rootAction: 'poll',
          caption: `poll ${dropped}`,
        },
      )
      poll(heap)
    }
  }

  const answer = heap[0]!
  push(
    `Return minHeap.peek() = ${answer}, the kth largest element.`,
    'After one pass, the heap’s minimum is exactly the kth largest in nums.',
    L.ret,
    null,
    nums.map((_, index) => ({ index, role: 'visited' as const })),
    { result: answer },
    { rootAction: 'peek', caption: `return ${answer}` },
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
      placeholder: '3, 2, 1, 5, 6, 4',
      hint: 'Up to 12 integers from -99-99',
    },
    {
      key: 'k',
      label: 'k',
      widget: 'text',
      placeholder: '2',
      hint: '1-based rank from the largest (1..nums.length)',
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
    const kResult = parseIntValue(raw.k ?? '', {
      name: 'k',
      minVal: 1,
      maxVal: numsResult.value.length,
    })
    if (!kResult.ok) {
      if (kResult.errors[0]?.includes('between')) {
        return {
          ok: false,
          errors: [`k must be between 1 and nums.length (${numsResult.value.length}).`],
        }
      }
      return kResult
    }
    return { ok: true, value: { nums: numsResult.value, k: kResult.value } }
  },
  formatLabel: (value) => `nums = [${value.nums.join(', ')}], k = ${value.k}`,
  generateSteps,
  fixtures: [
    { name: 'k-equals-n', raw: { nums: '4, 1, 3', k: '3' } },
    { name: 'k-one', raw: { nums: '2, 9, 7', k: '1' } },
    { name: 'duplicates', raw: { nums: '3, 3, 3, 3', k: '2' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(`Kth Largest default input invalid: ${defaultParsed.errors.join('; ')}`)
}

export const kthLargestElementInAnArray: ProblemPack = {
  id: '0215-kth-largest-element-in-an-array',
  lcNumber: 215,
  title: 'Kth Largest Element in an Array',
  pattern: 'Heap',
  difficulty: 'Medium',
  insight:
    'A size-k min-heap tracks the k largest; its root is the kth largest, cheaper than sorting all n.',
  invariant:
    'After each insert (and optional poll), the heap holds the k largest values seen so far.',
  complexity: { time: 'O(n log k)', space: 'O(k)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: defaultNums.length },
  benchmark: placeholderBenchmark(
    'Size-k min-heap beats full sort when k ≪ n; each offer/poll is O(log k).',
  ),
  walkthrough: {
    statement:
      'Given an integer array nums and an integer k, return the kth largest element in the array.',
    keyIdea:
      'Keep only k candidates in a min-heap; anything smaller than the current root can never win.',
    approach: [
      'Create an empty min-heap (PriorityQueue).',
      'For each num: add it; if size > k, poll the minimum.',
      'Return peek(): the smallest of the k largest.',
    ],
  },
}
