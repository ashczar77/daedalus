/**
 * LeetCode #78 - Subsets.
 * Backtracking: record path, choose nums[i], recurse, undo (pop).
 */
import javaSrc from '../../algorithms/0078-subsets/Solution.java?raw'
import kotlinSrc from '../../algorithms/0078-subsets/Solution.kt?raw'
import pythonSrc from '../../algorithms/0078-subsets/solution.py?raw'
import {
  defineInput,
  formatIntList,
  parseIntList,
} from '../engine/input'
import type {
  ArrayHighlight,
  CallFrame,
  HeapObject,
  ProblemPack,
  Step,
} from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

/** Classic LC demo: 8 subsets, still under the step budget. */
const defaultNums = [1, 2, 3]

const L = {
  enter: { java: 10, kotlin: 7, python: 17 },
  record: { java: 20, kotlin: 17, python: 11 },
  /** path.add(nums[i]) / path.append / path.add */
  add: { java: 22, kotlin: 19, python: 13 },
  recurse: { java: 23, kotlin: 20, python: 14 },
  /** path.remove(...) / removeAt / pop */
  remove: { java: 24, kotlin: 21, python: 15 },
  ret: { java: 11, kotlin: 8, python: 18 },
} as const

type Frame = {
  start: number
  i: number | null
  action: 'record' | 'path.add' | 'recurse' | 'path.remove'
}

function fmtPath(path: number[]): string {
  return path.length === 0 ? '[]' : `[${path.join(', ')}]`
}

function numsHeap(
  nums: number[],
  start: number,
  focusI: number | null,
  focused = false,
): HeapObject {
  const highlights: ArrayHighlight[] = nums.map((_, index) => {
    if (focusI != null && index === focusI) return { index, role: 'current' as const }
    if (index < start) return { index, role: 'visited' as const }
    return { index, role: 'window' as const }
  })
  const pointers: Record<string, number> = { start }
  if (focusI != null) pointers.i = focusI
  return {
    id: 'nums',
    kind: 'array',
    label: 'int[] nums',
    values: nums,
    pointers,
    highlights,
    focused,
  }
}

function pathStack(
  path: number[],
  mode: 'idle' | 'add' | 'remove',
  opValue?: number,
): HeapObject {
  // On remove, keep the popped value visible on top so the undo is obvious.
  const items: number[] =
    mode === 'remove' && opValue != null ? [...path, opValue] : [...path]
  const label =
    mode === 'add' && opValue != null
      ? `path · ADD ${opValue}`
      : mode === 'remove' && opValue != null
        ? `path · REMOVE ${opValue}`
        : 'path · current subset'
  return {
    id: 'path',
    kind: 'stack',
    label,
    items,
    ...(mode === 'add'
      ? { topAction: 'push' as const }
      : mode === 'remove'
        ? { topAction: 'pop' as const }
        : {}),
    focused: mode === 'add' || mode === 'remove',
  }
}

function resultHeap(result: string[], justAdded: boolean, focused = false): HeapObject {
  const highlights: ArrayHighlight[] = result.map((_, index) =>
    justAdded && index === result.length - 1
      ? { index, role: 'found' as const }
      : { index, role: 'sorted' as const },
  )
  return {
    id: 'result',
    kind: 'array',
    label: `result · ${result.length} subset${result.length === 1 ? '' : 's'}`,
    values: result.length === 0 ? ['—'] : result,
    highlights: result.length === 0 ? [] : highlights,
    focused,
  }
}

function heapFor(
  nums: number[],
  path: number[],
  result: string[],
  start: number,
  focusI: number | null,
  pathMode: 'idle' | 'add' | 'remove',
  justRecorded: boolean,
  opValue?: number,
): HeapObject[] {
  // Stable order every step so the stage does not reshuffle and jump.
  return [
    numsHeap(nums, start, focusI, pathMode === 'idle' && !justRecorded),
    pathStack(path, pathMode, opValue),
    resultHeap(result, justRecorded, justRecorded),
  ]
}

function generateSteps(nums: number[]): Step[] {
  const n = nums.length
  const steps: Step[] = []
  let stepId = 1
  const path: number[] = []
  const result: string[] = []
  const stack: Frame[] = []

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function frames(activeIdx: number | null, wrapperActive = false): CallFrame[] {
    const outer: CallFrame = {
      name: 'subsets',
      active: wrapperActive || activeIdx === null,
      locals: {
        nums: { ref: 'nums' },
        result: { ref: 'result' },
      },
    }
    const inner = stack.map((f, index) => ({
      name: 'backtrack',
      active: !wrapperActive && activeIdx === index,
      locals: {
        start: f.start,
        ...(f.i != null ? { i: f.i } : {}),
        path: { ref: 'path' },
        action: f.action,
      },
    }))
    return [outer, ...inner]
  }

  push({
    narrative:
      n === 0
        ? 'Enter subsets on []. Only the empty subset exists.'
        : `Enter subsets on ${fmtPath(nums)}. We will grow every subset with backtracking.`,
    why: 'Backtracking explores choices depth-first: choose → recurse → undo, so each branch gets a clean path.',
    codeFocus: L.enter,
    callStack: frames(null, true),
    heap: heapFor(nums, path, result, 0, null, 'idle', false),
  })

  function backtrack(start: number): void {
    stack.push({ start, i: null, action: 'record' })
    result.push(fmtPath(path))
    push({
      narrative: `Call backtrack(start=${start}). Record a copy of path ${fmtPath(path)} into result.`,
      why: 'Every call is a valid subset, including []. Recording before choosing means we keep the shorter prefixes too.',
      codeFocus: L.record,
      callStack: frames(stack.length - 1),
      heap: heapFor(nums, path, result, start, null, 'idle', true),
    })

    for (let i = start; i < n; i++) {
      const chosen = nums[i]!
      stack[stack.length - 1] = { start, i, action: 'path.add' }
      path.push(chosen)
      push({
        narrative: `Execute path.add(nums[${i}]): push ${chosen} onto path → ${fmtPath(path)}.`,
        why: 'Line path.add(nums[i]) is the choose. Path grows before we recurse.',
        codeFocus: L.add,
        callStack: frames(stack.length - 1),
        heap: heapFor(nums, path, result, start, i, 'add', false, chosen),
      })

      stack[stack.length - 1] = { start, i, action: 'recurse' }
      push({
        narrative: `RECURSE backtrack(${i + 1}) with path ${fmtPath(path)}.`,
        why: `start becomes ${i + 1} so later picks only use later indices. That prevents duplicate subsets like [1,2] and [2,1].`,
        codeFocus: L.recurse,
        callStack: frames(stack.length - 1),
        heap: heapFor(nums, path, result, start, i, 'idle', false),
      })

      backtrack(i + 1)

      stack[stack.length - 1] = { start, i, action: 'path.remove' }
      path.pop()
      push({
        narrative: `Execute path.remove(...): pop ${chosen} off path → ${fmtPath(path)}.`,
        why: 'Line path.remove is the backtrack. Undo the add so the next sibling choice starts clean.',
        codeFocus: L.remove,
        callStack: frames(stack.length - 1),
        heap: heapFor(nums, path, result, start, i, 'remove', false, chosen),
      })
    }

    stack.pop()
  }

  backtrack(0)

  push({
    narrative: `Done. Return result with ${result.length} subset${result.length === 1 ? '' : 's'}.`,
    why: 'There are 2^n subsets for n distinct elements. Each was recorded once, then the recursion unwound.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'subsets',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          result: { ref: 'result' },
          count: result.length,
        },
      },
    ],
    heap: heapFor(nums, path, result, 0, null, 'idle', false),
  })

  return steps
}

const input = defineInput<number[]>({
  kind: 'intArray',
  fields: [
    {
      key: 'nums',
      label: 'nums',
      widget: 'text',
      placeholder: '1, 2, 3',
      hint: 'Up to 3 distinct ints (2^n subsets grow fast)',
    },
  ],
  defaultRaw: { nums: formatIntList(defaultNums) },
  parse: (raw) => {
    const parsed = parseIntList(raw.nums ?? '', {
      name: 'nums',
      minLen: 0,
      maxLen: 3,
      minVal: -9,
      maxVal: 99,
    })
    if (!parsed.ok) return parsed
    const seen = new Set<number>()
    for (const value of parsed.value) {
      if (seen.has(value)) {
        return {
          ok: false,
          errors: ['nums must be distinct for this demo (duplicates need a different pack).'],
        }
      }
      seen.add(value)
    }
    return parsed
  },
  formatLabel: (nums) => `nums = ${formatIntList(nums)}`,
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { nums: '' } },
    { name: 'one', raw: { nums: '7' } },
    { name: 'two', raw: { nums: '1, 2' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(`Subsets default input invalid: ${defaultParsed.errors.join('; ')}`)
}

export const subsets: ProblemPack = {
  id: '0078-subsets',
  lcNumber: 78,
  title: 'Subsets',
  pattern: 'Backtracking',
  difficulty: 'Medium',
  insight:
    'At every call, record the current path, then for each later index: path.add → recurse → path.remove. The remove is the backtrack.',
  invariant:
    'path is the subset under construction; start only moves forward so each subset is built in increasing index order (no duplicates).',
  complexity: {
    time: 'O(n · 2^n)',
    space: 'O(n)',
    notes: 'Output size is O(n · 2^n); recursion depth is O(n).',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: defaultNums.length },
  benchmark: placeholderBenchmark(
    'Backtracking enumerates all 2^n subsets; each costs O(n) to copy into the answer list.',
  ),
  walkthrough: {
    statement:
      'Given distinct integers nums, return every possible subset (the power set). Order of subsets does not matter.',
    keyIdea:
      'Build one path at a time. Record it, path.add a later element, recurse, then path.remove (backtrack) before trying the next element.',
    approach: [
      'Start with path = [] and call backtrack(start=0).',
      'At every call: copy path into result (even when empty).',
      'For i from start to n-1: path.add(nums[i]), recurse with start=i+1, then path.removeLast().',
      'Watch those two lines in the code panel: add grows path, remove undoes it for the next sibling.',
      'Return result. The call stack grows on recurse and shrinks after each remove.',
    ],
  },
}
