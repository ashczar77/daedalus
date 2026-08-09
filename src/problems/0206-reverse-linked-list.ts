/**
 * LeetCode #206 - Reverse Linked List (iterative pointer flip).
 * Steps generated from validated list values (Phase 4).
 */
import javaSrc from '../../algorithms/0206-reverse-linked-list/Solution.java?raw'
import kotlinSrc from '../../algorithms/0206-reverse-linked-list/Solution.kt?raw'
import pythonSrc from '../../algorithms/0206-reverse-linked-list/solution.py?raw'
import {
  defineInput,
  formatIntList,
  listNodeId,
  listNodesFromValues,
  parseIntList,
} from '../engine/input'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const defaultList = [1, 2, 3]

const L = {
  init: { java: 13, kotlin: 9, python: 12 },
  flip: { java: 16, kotlin: 12, python: 15 },
  ret: { java: 20, kotlin: 16, python: 18 },
} as const

type ListNodeSnap = { id: string; value: number; next: string | null }

function cloneNodes(nodes: ListNodeSnap[]): ListNodeSnap[] {
  return nodes.map((n) => ({ ...n }))
}

function generateSteps(values: number[]): Step[] {
  if (values.length === 0) {
    return [
      {
        id: 1,
        narrative: 'Empty list - head is null. Return null in one step.',
        why: 'Nothing to reverse; prev stays null.',
        codeFocus: L.ret,
        callStack: [
          {
            name: 'reverseList',
            active: true,
            locals: { head: null, prev: null, cur: null, result: null },
          },
        ],
        heap: [
          {
            id: 'list',
            kind: 'linkedList',
            label: 'ListNode chain',
            nodes: [],
            pointers: { prev: null, cur: null },
            focused: true,
            caption: 'empty → return null',
          },
        ],
      },
    ]
  }

  const steps: Step[] = []
  let stepId = 1
  const nodes = cloneNodes(listNodesFromValues(values))
  let prev: string | null = null
  let cur: string | null = listNodeId(0)

  const valueStr = values.join('→')
  steps.push({
    id: stepId++,
    narrative: `Start with prev=null and cur=head on ${valueStr}.`,
    why: 'Everything before cur becomes the reversed prefix; cur is next to flip.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'reverseList',
        active: true,
        locals: { head: { ref: 'list' }, prev: null, cur },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain',
        nodes: cloneNodes(nodes),
        pointers: { cur, prev },
        focusIds: cur ? [cur] : [],
        focused: true,
        caption: 'setup: prev=null · cur=head',
      },
    ],
  })

  while (cur) {
    const curNode = nodes.find((n) => n.id === cur)!
    const next = curNode.next
    const prevLabel = prev ?? 'null'
    curNode.next = prev

    steps.push({
      id: stepId++,
      narrative: `Cache next=${next ?? 'null'}, flip ${cur}.next → ${prevLabel}, advance prev/cur.`,
      why: 'Save next before overwriting the pointer or the rest is lost.',
      codeFocus: L.flip,
      callStack: [
        {
          name: 'reverseList',
          active: true,
          locals: { prev, cur, next },
        },
      ],
      heap: [
        {
          id: 'list',
          kind: 'linkedList',
          label: 'ListNode chain',
          nodes: cloneNodes(nodes),
          pointers: { prev, cur, next },
          focusIds: [cur],
          focused: true,
          caption: `flip: ${cur}.next → ${prevLabel}`,
        },
      ],
    })

    prev = cur
    cur = next
  }

  steps.push({
    id: stepId++,
    narrative: `cur is null. Return prev=${prev ?? 'null'} as the new head.`,
    why: 'When cur hits null, prev is the tip of the fully reversed list.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'reverseList',
        active: true,
        locals: { prev, cur: null, result: prev },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain',
        nodes: cloneNodes(nodes),
        pointers: { prev, cur: null },
        focusIds: prev ? nodes.map((n) => n.id) : [],
        focused: true,
        caption: 'done: return prev (new head)',
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
      placeholder: '1, 2, 3',
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
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const reverseLinkedList: ProblemPack = {
  id: '0206-reverse-linked-list',
  lcNumber: 206,
  title: 'Reverse Linked List',
  pattern: 'Linked List',
  difficulty: 'Easy',
  insight: 'Save next before overwriting cur.next; return prev as the new head.',
  invariant:
    'Nodes before cur are reversed and linked from prev; cur is the next flip target.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'In-place pointer rewrites - no extra heap nodes allocated.',
  ),
  walkthrough: {
    statement:
      'Given the head of a singly linked list, reverse the list and return the new head.',
    keyIdea:
      'Iteratively flip cur.next to prev while walking forward - three pointers: prev, cur, next.',
    approach: [
      'prev = null, cur = head.',
      'While cur: save next, set cur.next = prev, advance prev/cur.',
      'Return prev.',
    ],
  },
}
