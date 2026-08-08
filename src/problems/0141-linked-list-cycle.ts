/**
 * LeetCode #141 — Linked List Cycle (Floyd fast/slow).
 * Steps generated from list values + cycle index (Phase 4).
 */
import javaSrc from '../../algorithms/0141-linked-list-cycle/Solution.java?raw'
import kotlinSrc from '../../algorithms/0141-linked-list-cycle/Solution.kt?raw'
import pythonSrc from '../../algorithms/0141-linked-list-cycle/solution.py?raw'
import {
  defineInput,
  formatIntList,
  listNodeId,
  listNodesFromValues,
  parseIntList,
} from '../engine/input'
import type { ParseResult } from '../engine/input'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { values: number[]; cycleIndex: number | null }

const defaultValues = [1, 2, 3, 4]
const defaultCycleIndex = 1

const L = {
  init: { java: 13, kotlin: 9, python: 12 },
  advance: { java: 16, kotlin: 12, python: 15 },
  meet: { java: 18, kotlin: 13, python: 17 },
  retFalse: { java: 21, kotlin: 15, python: 18 },
} as const

type ListNodeSnap = { id: string; value: number; next: string | null }

function cloneNodes(nodes: ListNodeSnap[]): ListNodeSnap[] {
  return nodes.map((n) => ({ ...n }))
}

function buildListNodes(
  values: number[],
  cycleIndex: number | null,
): ListNodeSnap[] {
  const nodes = listNodesFromValues(values)
  if (cycleIndex !== null && values.length > 0) {
    nodes[values.length - 1]!.next = listNodeId(cycleIndex)
  }
  return nodes
}

function cycleTo(
  values: number[],
  cycleIndex: number | null,
): [string, string] | undefined {
  if (cycleIndex === null || values.length === 0) return undefined
  return [listNodeId(values.length - 1), listNodeId(cycleIndex)]
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

function parseCycleField(
  raw: string,
  len: number,
): ParseResult<number | null> {
  const s = raw.trim().toLowerCase()
  if (s === '' || s === 'none') return { ok: true, value: null }
  const idx = Number.parseInt(s, 10)
  if (Number.isNaN(idx)) {
    return { ok: false, errors: ['cycle must be none or an index 0..n-1'] }
  }
  if (len === 0) {
    return { ok: false, errors: ['cycle requires a nonempty list'] }
  }
  if (idx < 0 || idx >= len) {
    return {
      ok: false,
      errors: [`cycle index must be between 0 and ${len - 1}`],
    }
  }
  return { ok: true, value: idx }
}

function generateSteps({ values, cycleIndex }: Input): Step[] {
  const nodes = buildListNodes(values, cycleIndex)
  const cycle = cycleTo(values, cycleIndex)
  const steps: Step[] = []
  let id = 1

  if (values.length === 0) {
    return [
      {
        id: 1,
        narrative: 'Empty list — no nodes to walk. Return false.',
        why: 'head is null; fast never enters the loop.',
        codeFocus: L.retFalse,
        callStack: [
          {
            name: 'hasCycle',
            active: true,
            locals: { head: null, slow: null, fast: null, result: false },
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
            caption: 'empty → false',
          },
        ],
      },
    ]
  }

  let slow: string | null = listNodeId(0)
  let fast: string | null = listNodeId(0)

  steps.push({
    id: id++,
    narrative: 'Place slow and fast at head. Fast will move twice as quickly.',
    why: 'If a cycle exists, fast laps slow inside it; otherwise fast hits null.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'hasCycle',
        active: true,
        locals: { head: { ref: 'list' }, slow, fast },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: cycle ? 'ListNode chain (with cycle)' : 'ListNode chain',
        nodes: cloneNodes(nodes),
        pointers: { slow, fast },
        cycleTo: cycle,
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
      narrative: `Advance slow→${slow ?? 'null'}, fast→${fast ?? 'null'}.`,
      why:
        slow === fast
          ? 'Pointers meet inside the loop — cycle detected.'
          : 'Still not meeting — keep walking while fast and fast.next exist.',
      codeFocus: slow === fast ? L.meet : L.advance,
      callStack: [
        {
          name: 'hasCycle',
          active: true,
          locals:
            slow === fast
              ? { slow, fast, result: true }
              : { slow, fast },
        },
      ],
      heap: [
        {
          id: 'list',
          kind: 'linkedList',
          label: cycle ? 'ListNode chain (with cycle)' : 'ListNode chain',
          nodes: cloneNodes(nodes),
          pointers: { slow, fast },
          cycleTo: cycle,
          focusIds: [slow, fast].filter(Boolean) as string[],
          focused: true,
          caption:
            slow === fast ? 'meet → cycle = true' : 'slow +1 · fast +2',
        },
      ],
    })

    if (slow && fast && slow === fast) return steps
  }

  steps.push({
    id: id++,
    narrative: 'fast or fast.next is null — no cycle. Return false.',
    why: 'Fast escaped the list end; a cycle would keep fast inside forever.',
    codeFocus: L.retFalse,
    callStack: [
      {
        name: 'hasCycle',
        active: true,
        locals: { slow, fast, result: false },
      },
    ],
    heap: [
      {
        id: 'list',
        kind: 'linkedList',
        label: 'ListNode chain',
        nodes: cloneNodes(nodes),
        pointers: { slow, fast },
        cycleTo: cycle,
        focusIds: fast ? [fast] : [],
        focused: true,
        caption: 'fast hit null → false',
      },
    ],
  })

  return steps
}

const input = defineInput<Input>({
  kind: 'linkedListCycle',
  fields: [
    {
      key: 'values',
      label: 'values',
      widget: 'text',
      placeholder: '1, 2, 3, 4',
      hint: 'Up to 10 integers from -99–99',
    },
    {
      key: 'cycle',
      label: 'cycle',
      widget: 'text',
      placeholder: '1 or none',
      hint: 'Tail connects to this index (0-based), or none',
    },
  ],
  defaultRaw: {
    values: formatIntList(defaultValues),
    cycle: String(defaultCycleIndex),
  },
  parse: (raw) => {
    const valuesResult = parseIntList(raw.values ?? '', {
      name: 'values',
      minLen: 0,
      maxLen: 10,
      minVal: -99,
      maxVal: 99,
    })
    if (!valuesResult.ok) return valuesResult
    const cycleResult = parseCycleField(
      raw.cycle ?? '',
      valuesResult.value.length,
    )
    if (!cycleResult.ok) return cycleResult
    return {
      ok: true,
      value: { values: valuesResult.value, cycleIndex: cycleResult.value },
    }
  },
  formatLabel: (value) => {
    const base = `head = [${value.values.join(', ')}]`
    if (value.cycleIndex === null || value.values.length === 0) return base
    const tail = value.values[value.values.length - 1]
    const target = value.values[value.cycleIndex]
    return `${base} with cycle ${tail}→${target} (index ${value.cycleIndex})`
  },
  generateSteps,
  fixtures: [
    { name: 'no-cycle', raw: { values: '1, 2, 3', cycle: 'none' } },
    { name: 'empty', raw: { values: '', cycle: 'none' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const linkedListCycle: ProblemPack = {
  id: '0141-linked-list-cycle',
  lcNumber: 141,
  title: 'Linked List Cycle',
  pattern: 'Fast & Slow',
  difficulty: 'Easy',
  insight:
    'Move slow 1 and fast 2; a meeting means a cycle. Guard fast and fast.next before advancing.',
  invariant:
    'If a cycle exists, fast eventually enters it and laps slow; else fast reaches null.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'O(1) extra memory vs a HashSet of visited node identities.',
  ),
  walkthrough: {
    statement:
      'Given head of a linked list, determine if it has a cycle (some node can be reached again by continuously following next).',
    keyIdea:
      'Floyd’s tortoise and hare: slow moves 1, fast moves 2. If they meet, there is a cycle.',
    approach: [
      'Start both pointers at head.',
      'While fast and fast.next exist, advance slow by 1 and fast by 2.',
      'If slow == fast, return true; if fast hits null, return false.',
    ],
  },
}
