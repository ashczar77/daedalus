/**
 * LeetCode #21 — Merge Two Sorted Lists (dummy head splice).
 * Steps generated from validated list1/list2 (Phase 4).
 */
import javaSrc from '../../algorithms/0021-merge-two-sorted-lists/Solution.java?raw'
import kotlinSrc from '../../algorithms/0021-merge-two-sorted-lists/Solution.kt?raw'
import pythonSrc from '../../algorithms/0021-merge-two-sorted-lists/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
} from '../engine/input'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { list1: number[]; list2: number[] }

const defaultList1 = [1, 3]
const defaultList2 = [2, 4]

/** Line maps kept next to the sources so if/else focus cannot drift silently. */
const L = {
  dummy: { java: 13, kotlin: 8, python: 11 },
  whileHead: { java: 15, kotlin: 12, python: 13 },
  /** if (list1.val <= list2.val) — take from list1 */
  take1: { java: 17, kotlin: 14, python: 15 },
  /** else — take from list2 */
  take2: { java: 20, kotlin: 17, python: 18 },
  advanceRunner: { java: 23, kotlin: 20, python: 20 },
  attachTail: { java: 25, kotlin: 22, python: 21 },
  ret: { java: 26, kotlin: 23, python: 22 },
} as const

type ListNodeSnap = { id: string; value: number; next: string | null }

function listNodesPrefixed(values: number[], prefix: string): ListNodeSnap[] {
  return values.map((value, index) => ({
    id: `${prefix}${index + 1}`,
    value,
    next:
      index + 1 < values.length ? `${prefix}${index + 2}` : null,
  }))
}

function chainFrom(
  start: string | null,
  store: Map<string, ListNodeSnap>,
): ListNodeSnap[] {
  const out: ListNodeSnap[] = []
  let cur = start
  while (cur) {
    const n = store.get(cur)
    if (!n) break
    out.push({ ...n })
    cur = n.next
  }
  return out
}

function buildMergedNodes(
  mergedNext: Map<string, string | null>,
  valueStore: Map<string, ListNodeSnap>,
  start = 'dummy',
): ListNodeSnap[] {
  const out: ListNodeSnap[] = []
  let cur: string | null = start
  while (cur) {
    const base = valueStore.get(cur)
    if (!base) break
    out.push({
      id: cur,
      value: base.value,
      next: mergedNext.get(cur) ?? null,
    })
    cur = mergedNext.get(cur) ?? null
  }
  return out
}

function generateSteps({ list1: v1, list2: v2 }: Input): Step[] {
  const valueStore = new Map<string, ListNodeSnap>()
  for (const n of listNodesPrefixed(v1, 'a')) valueStore.set(n.id, { ...n })
  for (const n of listNodesPrefixed(v2, 'b')) valueStore.set(n.id, { ...n })
  valueStore.set('dummy', { id: 'dummy', value: 0, next: null })

  const mergedNext = new Map<string, string | null>([['dummy', null]])

  let list1: string | null = v1.length ? 'a1' : null
  let list2: string | null = v2.length ? 'b1' : null
  let runner = 'dummy'

  const steps: Step[] = []
  let id = 1

  if (!list1 && !list2) {
    return [
      {
        id: 1,
        narrative: 'Both lists empty — dummy.next is null. Return null.',
        why: 'Nothing to merge.',
        codeFocus: L.ret,
        callStack: [
          {
            name: 'mergeTwoLists',
            active: true,
            locals: { list1: null, list2: null, dummy: 'dummy', result: null },
          },
        ],
        heap: [
          {
            id: 'merged',
            kind: 'linkedList',
            label: 'dummy / merged',
            nodes: [{ id: 'dummy', value: 0, next: null }],
            pointers: { runner: 'dummy' },
            focused: true,
            caption: 'empty merge → null',
          },
        ],
      },
    ]
  }

  steps.push({
    id: id++,
    narrative: 'Create dummy and set runner = dummy. Both input lists still intact.',
    why: 'Dummy avoids a special case for the first splice.',
    codeFocus: L.dummy,
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: {
          list1,
          list2,
          dummy: 'dummy',
          runner,
        },
      },
    ],
    heap: [
      ...(list1
        ? [
            {
              id: 'list1',
              kind: 'linkedList' as const,
              label: 'list1',
              nodes: chainFrom(list1, valueStore),
              pointers: { list1 },
              focused: true,
            },
          ]
        : []),
      ...(list2
        ? [
            {
              id: 'list2',
              kind: 'linkedList' as const,
              label: 'list2',
              nodes: chainFrom(list2, valueStore),
              pointers: { list2 },
              focused: true,
            },
          ]
        : []),
      {
        id: 'merged',
        kind: 'linkedList',
        label: 'dummy / merged',
        nodes: buildMergedNodes(mergedNext, valueStore),
        pointers: { runner },
        caption: 'dummy · runner here',
      },
    ],
  })

  while (list1 && list2) {
    const vLeft = valueStore.get(list1)!.value
    const vRight = valueStore.get(list2)!.value
    const takeFrom1 = vLeft <= vRight
    const taken = takeFrom1 ? list1 : list2

    mergedNext.set(runner, taken)
    steps.push({
      id: id++,
      narrative: takeFrom1
        ? `Both lists nonempty. Compare heads: ${vLeft} ≤ ${vRight} → take list1 (if branch).`
        : `Compare heads: ${vLeft} > ${vRight} → else branch takes list2’s ${vRight}.`,
      why: takeFrom1
        ? 'The if branch runs when list1’s head is smaller or equal.'
        : 'When list2’s head is smaller, the else block runs — not the if.',
      codeFocus: takeFrom1 ? L.take1 : L.take2,
      callStack: [
        {
          name: 'mergeTwoLists',
          active: true,
          locals: {
            list1,
            list2,
            runner,
            cmp: takeFrom1 ? `${vLeft} <= ${vRight}` : `${vLeft} > ${vRight}`,
          },
        },
      ],
      heap: [
        {
          id: 'merged',
          kind: 'linkedList',
          label: 'dummy / merged',
          nodes: buildMergedNodes(mergedNext, valueStore),
          pointers: { runner },
          focusIds: [taken],
          focused: true,
          caption: takeFrom1
            ? `if: runner.next = list1 (${vLeft})`
            : `else: runner.next = list2 (${vRight})`,
        },
        ...(list1
          ? [
              {
                id: 'list1',
                kind: 'linkedList' as const,
                label: takeFrom1 ? 'list1' : 'list1 remaining',
                nodes: chainFrom(list1, valueStore),
                pointers: { list1 },
              },
            ]
          : []),
        ...(list2
          ? [
              {
                id: 'list2',
                kind: 'linkedList' as const,
                label: takeFrom1 ? 'list2' : 'list2 remaining',
                nodes: chainFrom(list2, valueStore),
                pointers: { list2 },
              },
            ]
          : []),
      ],
    })

    if (takeFrom1) list1 = valueStore.get(list1)!.next
    else list2 = valueStore.get(list2)!.next

    runner = taken
    mergedNext.set(runner, null)

    steps.push({
      id: id++,
      narrative: takeFrom1
        ? `Advance list1 and runner onto the spliced node (${valueStore.get(runner)!.value}).`
        : `Advance list2 and runner onto the spliced node (${valueStore.get(runner)!.value}).`,
      why: 'runner always sits at the tail of the merged prefix.',
      codeFocus: L.advanceRunner,
      callStack: [
        {
          name: 'mergeTwoLists',
          active: true,
          locals: { list1, list2, runner },
        },
      ],
      heap: [
        {
          id: 'merged',
          kind: 'linkedList',
          label: 'dummy / merged',
          nodes: buildMergedNodes(mergedNext, valueStore),
          pointers: { runner },
          focusIds: [runner],
          focused: true,
          caption: 'runner = runner.next',
        },
        ...(list1
          ? [
              {
                id: 'list1',
                kind: 'linkedList' as const,
                label: 'list1 remaining',
                nodes: chainFrom(list1, valueStore),
                pointers: { list1 },
              },
            ]
          : []),
        ...(list2
          ? [
              {
                id: 'list2',
                kind: 'linkedList' as const,
                label: 'list2 remaining',
                nodes: chainFrom(list2, valueStore),
                pointers: { list2 },
              },
            ]
          : []),
      ],
    })
  }

  const tail = list1 ?? list2
  if (tail) mergedNext.set(runner, tail)

  const head = mergedNext.get('dummy') ?? null
  steps.push({
    id: id++,
    narrative: list1
      ? 'list2 is now null. Attach leftover list1 and return dummy.next.'
      : list2
        ? 'list1 is now null. Attach leftover list2 and return dummy.next.'
        : 'Both exhausted — return dummy.next.',
    why: 'When one list empties, the other is already sorted — one pointer assign finishes.',
    codeFocus: L.attachTail,
    callStack: [
      {
        name: 'mergeTwoLists',
        active: true,
        locals: {
          list1,
          list2,
          runner,
          result: head,
        },
      },
    ],
    heap: [
      {
        id: 'merged',
        kind: 'linkedList',
        label: 'merged result',
        nodes: buildMergedNodes(mergedNext, valueStore).filter(
          (n) => n.id !== 'dummy',
        ),
        pointers: head ? { head } : {},
        focusIds: head
          ? buildMergedNodes(mergedNext, valueStore)
              .filter((n) => n.id !== 'dummy')
              .map((n) => n.id)
          : [],
        focused: true,
        caption: 'attach tail · return dummy.next',
      },
    ],
  })

  return steps
}

const input = defineInput<Input>({
  kind: 'mergeTwoSortedLists',
  fields: [
    {
      key: 'list1',
      label: 'list1',
      widget: 'text',
      placeholder: '1, 3',
      hint: 'Sorted non-decreasing, up to 8 values',
      sortable: true,
    },
    {
      key: 'list2',
      label: 'list2',
      widget: 'text',
      placeholder: '2, 4',
      hint: 'Sorted non-decreasing, up to 8 values',
      sortable: true,
    },
  ],
  defaultRaw: {
    list1: formatIntList(defaultList1),
    list2: formatIntList(defaultList2),
  },
  parse: (raw) => {
    const list1Result = parseIntList(raw.list1 ?? '', {
      name: 'list1',
      minLen: 0,
      maxLen: 8,
      minVal: -99,
      maxVal: 99,
      requireSorted: true,
    })
    if (!list1Result.ok) return list1Result
    const list2Result = parseIntList(raw.list2 ?? '', {
      name: 'list2',
      minLen: 0,
      maxLen: 8,
      minVal: -99,
      maxVal: 99,
      requireSorted: true,
    })
    if (!list2Result.ok) return list2Result
    return {
      ok: true,
      value: { list1: list1Result.value, list2: list2Result.value },
    }
  },
  formatLabel: (value) =>
    `list1 = [${value.list1.join(', ')}], list2 = [${value.list2.join(', ')}]`,
  generateSteps,
  fixtures: [
    { name: 'both-empty', raw: { list1: '', list2: '' } },
    { name: 'one-empty', raw: { list1: '1, 2', list2: '' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const mergeTwoSortedLists: ProblemPack = {
  id: '0021-merge-two-sorted-lists',
  lcNumber: 21,
  title: 'Merge Two Sorted Lists',
  pattern: 'Linked List',
  difficulty: 'Easy',
  insight:
    'Dummy head + splice existing nodes — avoid new ListNode(val) for each value.',
  invariant:
    'Merged portion behind runner is sorted; list1/list2 point at remaining sorted tails.',
  complexity: {
    time: 'O(n + m)',
    space: 'O(1)',
    notes: 'Creating new nodes works but wastes O(n+m) heap allocations.',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Pointer splicing dominates — language gaps are small at interview sizes.',
  ),
  walkthrough: {
    statement:
      'Merge two sorted linked lists and return the head of the merged sorted list.',
    keyIdea:
      'Dummy head + runner: always splice the smaller current head from list1 or list2.',
    approach: [
      'Create dummy; runner = dummy.',
      'While both lists nonempty: if list1.val <= list2.val take list1, else take list2.',
      'Attach the nonempty leftover.',
      'Return dummy.next.',
    ],
  },
}
