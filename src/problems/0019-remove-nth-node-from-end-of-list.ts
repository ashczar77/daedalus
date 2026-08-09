/**
 * LeetCode #19 - Remove Nth Node From End of List.
 * Dummy head + two pointers with an n+1 gap (Phase 4).
 */
import javaSrc from '../../algorithms/0019-remove-nth-node-from-end-of-list/Solution.java?raw'
import kotlinSrc from '../../algorithms/0019-remove-nth-node-from-end-of-list/Solution.kt?raw'
import pythonSrc from '../../algorithms/0019-remove-nth-node-from-end-of-list/solution.py?raw'
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

type Input = { values: number[]; n: number }

const defaultValues = [1, 2, 3, 4, 5]
const defaultN = 2

const L = {
  init: { java: 13, kotlin: 10, python: 12 },
  gap: { java: 17, kotlin: 14, python: 15 },
  walk: { java: 20, kotlin: 17, python: 17 },
  unlink: { java: 23, kotlin: 20, python: 19 },
  ret: { java: 24, kotlin: 21, python: 20 },
} as const

type ListNodeSnap = { id: string; value: number | string; next: string | null }

const DUMMY = 'dummy'

function cloneNodes(nodes: ListNodeSnap[]): ListNodeSnap[] {
  return nodes.map((n) => ({ ...n }))
}

function buildChain(values: number[]): ListNodeSnap[] {
  const nodes = listNodesFromValues(values) as ListNodeSnap[]
  const head = values.length > 0 ? listNodeId(0) : null
  return [{ id: DUMMY, value: 'D', next: head }, ...nodes]
}

function nextOf(nodes: ListNodeSnap[], id: string | null): string | null {
  if (!id) return null
  return nodes.find((n) => n.id === id)?.next ?? null
}

function valueOf(nodes: ListNodeSnap[], id: string | null): string {
  if (!id) return 'null'
  return String(nodes.find((n) => n.id === id)?.value ?? id)
}

function parseN(raw: string, len: number): ParseResult<number> {
  const trimmed = raw.trim()
  const n = Number.parseInt(trimmed, 10)
  if (trimmed === '' || Number.isNaN(n)) {
    return { ok: false, errors: ['n must be an integer'] }
  }
  if (len === 0) {
    return { ok: false, errors: ['list must be nonempty when n is set'] }
  }
  if (n < 1 || n > len) {
    return {
      ok: false,
      errors: [`n must be between 1 and ${len} (list length)`],
    }
  }
  return { ok: true, value: n }
}

function generateSteps({ values, n }: Input): Step[] {
  const nodes = buildChain(values)
  const steps: Step[] = []
  let stepId = 1
  let fast: string | null = DUMMY
  let slow: string | null = DUMMY
  let dangerIds: string[] = []
  let linkFocus: [string, string] | undefined

  const push = (
    narrative: string,
    why: string,
    codeFocus: (typeof L)[keyof typeof L],
    caption: string,
    focusIds: string[],
    locals: Record<string, unknown>,
  ) => {
    steps.push({
      id: stepId++,
      narrative,
      why,
      codeFocus,
      callStack: [
        {
          name: 'removeNthFromEnd',
          active: true,
          locals: {
            head: values.length ? listNodeId(0) : null,
            n,
            dummy: DUMMY,
            ...locals,
          },
        },
      ],
      heap: [
        {
          id: 'list',
          kind: 'linkedList',
          label: 'dummy → list',
          nodes: cloneNodes(nodes),
          pointers: { dummy: DUMMY, slow, fast },
          focusIds,
          ...(dangerIds.length ? { dangerIds: [...dangerIds] } : {}),
          ...(linkFocus ? { linkFocus: [...linkFocus] as [string, string] } : {}),
          focused: true,
          caption,
        },
      ],
    })
  }

  push(
    `Attach dummy before head=[${values.join(', ')}]. slow=fast=dummy. n=${n}.`,
    'Dummy unifies the remove-head case with every other deletion.',
    L.init,
    'setup: dummy.next = head',
    [DUMMY],
    { slow, fast },
  )

  for (let i = 0; i <= n; i++) {
    fast = nextOf(nodes, fast)
    push(
      `Gap step ${i + 1}/${n + 1}: advance fast → ${valueOf(nodes, fast)}.`,
      i === n
        ? 'After n+1 hops, fast sits n nodes ahead of slow (counting from dummy).'
        : 'Build a gap of n+1 links between fast and slow.',
      L.gap,
      `fast += 1 (${i + 1}/${n + 1})`,
      fast ? [fast] : [],
      { slow, fast, gapStep: i + 1 },
    )
  }

  while (fast !== null) {
    fast = nextOf(nodes, fast)
    slow = nextOf(nodes, slow)
    push(
      `Walk: fast → ${valueOf(nodes, fast)}, slow → ${valueOf(nodes, slow)}.`,
      'Keep the gap fixed until fast falls off the end; then slow is just before the victim.',
      L.walk,
      'fast++, slow++',
      [slow, fast].filter((id): id is string => id != null),
      { slow, fast },
    )
  }

  const victim = nextOf(nodes, slow)
  const after = nextOf(nodes, victim)
  const victimVal = valueOf(nodes, victim)
  const afterVal = valueOf(nodes, after)
  const slowVal = valueOf(nodes, slow)

  if (victim) dangerIds = [victim]
  push(
    `Target found: slow=${slowVal} sits before victim=${victimVal} (nth from end). Next is ${afterVal}.`,
    'About to splice: predecessor.next should jump over the victim.',
    L.unlink,
    `remove ${victimVal}`,
    [slow, victim, after].filter((id): id is string => id != null),
    { slow, fast: null, victim, after },
  )

  if (slow && victim) {
    const slowNode = nodes.find((node) => node.id === slow)!
    slowNode.next = after
    const victimIndex = nodes.findIndex((node) => node.id === victim)
    if (victimIndex >= 0) nodes.splice(victimIndex, 1)
  }
  dangerIds = []
  linkFocus = slow && after ? [slow, after] : undefined

  push(
    `Remove ${victimVal}: ${slowVal}.next now points to ${afterVal}. The list closes the gap.`,
    'The deleted node is gone from the chain; neighbors join in one hop.',
    L.unlink,
    `${slowVal} → ${afterVal}  (${victimVal} removed)`,
    [slow, after].filter((id): id is string => id != null),
    { slow, fast: null, removed: victim, after },
  )

  const newHead = nextOf(nodes, DUMMY)
  linkFocus = undefined
  push(
    `Return dummy.next → ${valueOf(nodes, newHead)} as the new head.`,
    'Whether or not the old head was removed, dummy.next is the answer.',
    L.ret,
    `return ${valueOf(nodes, newHead)}`,
    newHead ? [newHead] : [DUMMY],
    { slow, fast: null, result: newHead },
  )

  return steps
}

const input = defineInput<Input>({
  kind: 'linkedListNth',
  fields: [
    {
      key: 'list',
      label: 'list',
      widget: 'text',
      placeholder: '1, 2, 3, 4, 5',
      hint: 'Up to 10 integers from -99-99',
    },
    {
      key: 'n',
      label: 'n',
      widget: 'text',
      placeholder: '2',
      hint: '1-based count from the end (1..list length)',
    },
  ],
  defaultRaw: {
    list: formatIntList(defaultValues),
    n: String(defaultN),
  },
  parse: (raw) => {
    const valuesResult = parseIntList(raw.list ?? '', {
      name: 'list',
      minLen: 1,
      maxLen: 10,
      minVal: -99,
      maxVal: 99,
    })
    if (!valuesResult.ok) return valuesResult
    const nResult = parseN(raw.n ?? '', valuesResult.value.length)
    if (!nResult.ok) return nResult
    return {
      ok: true,
      value: { values: valuesResult.value, n: nResult.value },
    }
  },
  formatLabel: (value) =>
    `head = [${value.values.join(', ')}], n = ${value.n}`,
  generateSteps,
  fixtures: [
    { name: 'remove-head', raw: { list: '1, 2', n: '2' } },
    { name: 'remove-tail', raw: { list: '1, 2, 3', n: '1' } },
    { name: 'single', raw: { list: '7', n: '1' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const removeNthNodeFromEndOfList: ProblemPack = {
  id: '0019-remove-nth-node-from-end-of-list',
  lcNumber: 19,
  title: 'Remove Nth Node From End of List',
  pattern: 'Linked List',
  difficulty: 'Medium',
  insight:
    'Dummy + advance fast by n+1, then walk both until fast is null; slow.next is the node to drop.',
  invariant:
    'When fast reaches null, slow is on the node just before the nth-from-end.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: defaultValues.length },
  benchmark: placeholderBenchmark(
    'One pass with a fixed gap beats counting length then scanning again.',
  ),
  walkthrough: {
    statement:
      'Given the head of a linked list, remove the nth node from the end and return its head.',
    keyIdea:
      'Dummy head plus two pointers: open a gap of n+1, then slide until fast falls off.',
    approach: [
      'dummy → head; slow = fast = dummy.',
      'Advance fast n+1 steps.',
      'Move both until fast is null; set slow.next = slow.next.next; return dummy.next.',
    ],
  },
}
