/**
 * LeetCode #876 - Middle of the Linked List (fast/slow).
 * Steps generated from validated list values.
 */
import javaSrc from '../../algorithms/0876-middle-of-the-linked-list/Solution.java?raw'
import kotlinSrc from '../../algorithms/0876-middle-of-the-linked-list/Solution.kt?raw'
import pythonSrc from '../../algorithms/0876-middle-of-the-linked-list/solution.py?raw'
import {
  defineInput,
  formatIntList,
  listNodeId,
  listNodesFromValues,
  parseIntList,
} from '../engine/input'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

/** Classic LC demo: odd length → middle value 3. */
const defaultList = [1, 2, 3, 4, 5]

const L = {
  init: { java: 12, kotlin: 8, python: 11 },
  advance: { java: 15, kotlin: 11, python: 14 },
  ret: { java: 18, kotlin: 14, python: 16 },
} as const

type ListNodeSnap = { id: string; value: number; next: string | null }

function cloneNodes(nodes: ListNodeSnap[]): ListNodeSnap[] {
  return nodes.map((n) => ({ ...n }))
}

function nextOf(nodes: ListNodeSnap[], id: string | null): string | null {
  if (!id) return null
  return nodes.find((n) => n.id === id)?.next ?? null
}

function advancePtr(
  nodes: ListNodeSnap[],
  id: string | null,
  steps: number,
): string | null {
  let cur = id
  for (let i = 0; i < steps; i++) {
    cur = nextOf(nodes, cur)
    if (!cur) return null
  }
  return cur
}

function valueOf(nodes: ListNodeSnap[], id: string | null): string {
  if (!id) return 'null'
  return String(nodes.find((n) => n.id === id)?.value ?? id)
}

function generateSteps(values: number[]): Step[] {
  if (values.length === 0) {
    return [
      {
        id: 1,
        narrative: 'Empty list - head is null. Return null.',
        why: 'No nodes to walk; slow never moves.',
        codeFocus: L.ret,
        callStack: [
          {
            name: 'middleNode',
            active: true,
            locals: { head: null, slow: null, fast: null, result: null },
          },
        ],
        heap: [
          {
            id: 'list',
            kind: 'linkedList',
            label: 'ListNode chain',
            nodes: [],
            pointers: { slow: null, fast: null },
            focused: true,
            caption: 'empty → return null',
          },
        ],
      },
    ]
  }

  const nodes = cloneNodes(listNodesFromValues(values))
  const steps: Step[] = []
  let id = 1
  let slow: string | null = listNodeId(0)
  let fast: string | null = listNodeId(0)

  steps.push({
    id: id++,
    narrative: `Place slow and fast at head (${valueOf(nodes, slow)}). Fast moves twice as far.`,
    why: 'When fast cannot take two steps, slow sits on the middle (second middle if even length).',
    codeFocus: L.init,
    callStack: [
      {
        name: 'middleNode',
        active: true,
        locals: { head: { ref: 'list' }, slow, fast },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain',
        nodes: cloneNodes(nodes),
        pointers: { slow, fast },
        focusIds: slow ? [slow] : [],
        focused: true,
        caption: 'slow & fast at head',
      },
    ],
  })

  while (fast && nextOf(nodes, fast)) {
    slow = nextOf(nodes, slow)
    fast = advancePtr(nodes, fast, 2)

    steps.push({
      id: id++,
      narrative: `Advance slow→${valueOf(nodes, slow)}, fast→${valueOf(nodes, fast)}.`,
      why:
        fast && nextOf(nodes, fast)
          ? 'Fast still has room; keep walking.'
          : 'Fast cannot continue; slow is the middle to return.',
      codeFocus: L.advance,
      callStack: [
        {
          name: 'middleNode',
          active: true,
          locals: { slow, fast },
        },
      ],
      heap: [
        {
          id: 'list',
          kind: 'linkedList',
          label: 'ListNode chain',
          nodes: cloneNodes(nodes),
          pointers: { slow, fast },
          focusIds: [slow, fast].filter(Boolean) as string[],
          focused: true,
          caption: 'slow +1 · fast +2',
        },
      ],
    })
  }

  steps.push({
    id: id++,
    narrative: `Loop done. Return slow=${valueOf(nodes, slow)} as the middle node.`,
    why:
      values.length % 2 === 0
        ? 'Even length: slow landed on the second of the two middle nodes.'
        : 'Odd length: slow is exactly the single middle node.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'middleNode',
        active: true,
        locals: { slow, fast, result: slow },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain',
        nodes: cloneNodes(nodes),
        pointers: { slow, fast },
        focusIds: slow ? [slow] : [],
        focused: true,
        caption: `middle → ${valueOf(nodes, slow)}`,
      },
    ],
  })

  return steps
}

const input = defineInput<number[]>({
  kind: 'linkedList',
  fields: [
    {
      key: 'list',
      label: 'list',
      widget: 'text',
      placeholder: '1, 2, 3, 4, 5',
      hint: 'Up to 10 integers from -99-99',
    },
  ],
  defaultRaw: { list: formatIntList(defaultList) },
  parse: (raw) =>
    parseIntList(raw.list ?? '', {
      name: 'list',
      minLen: 0,
      maxLen: 10,
      minVal: -99,
      maxVal: 99,
    }),
  formatLabel: (value) =>
    value.length === 0 ? 'head = []' : `head = [${value.join(', ')}]`,
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { list: '' } },
    { name: 'single', raw: { list: '7' } },
    { name: 'even', raw: { list: '1, 2, 3, 4' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const middleOfTheLinkedList: ProblemPack = {
  id: '0876-middle-of-the-linked-list',
  lcNumber: 876,
  title: 'Middle of the Linked List',
  pattern: 'Fast & Slow',
  difficulty: 'Easy',
  insight:
    'Move slow 1 and fast 2; when fast cannot continue, slow is the middle (second middle if even).',
  invariant:
    'After each advance, slow is roughly halfway from head to fast along the list.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'One pass with two pointers; no length count and no extra list copy.',
  ),
  walkthrough: {
    statement:
      'Given the head of a singly linked list, return the middle node. If there are two middles, return the second one.',
    keyIdea:
      'Fast moves twice as fast as slow. When fast hits the end, slow is at the middle.',
    approach: [
      'slow = head, fast = head.',
      'While fast and fast.next exist, advance slow by 1 and fast by 2.',
      'Return slow.',
    ],
  },
}
