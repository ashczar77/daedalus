/**
 * LeetCode #46 - Permutations.
 * Backtracking: path is a partial permutation; retry all unused indices each level.
 */
import javaSrc from '../../algorithms/0046-permutations/Solution.java?raw'
import kotlinSrc from '../../algorithms/0046-permutations/Solution.kt?raw'
import pythonSrc from '../../algorithms/0046-permutations/solution.py?raw'
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

/** Classic LC demo: 6 permutations of [1, 2, 3]. */
const defaultNums = [1, 2, 3]

const L = {
  enter: { java: 8, kotlin: 5, python: 6 },
  record: { java: 21, kotlin: 18, python: 13 },
  add: { java: 27, kotlin: 24, python: 19 },
  recurse: { java: 28, kotlin: 25, python: 20 },
  remove: { java: 29, kotlin: 26, python: 21 },
  ret: { java: 11, kotlin: 8, python: 25 },
} as const

type Frame = {
  i: number | null
  action: 'check' | 'path.add' | 'recurse' | 'path.remove'
}

function fmtPath(path: number[]): string {
  return path.length === 0 ? '[]' : `[${path.join(', ')}]`
}

function numsHeap(
  nums: number[],
  used: boolean[],
  focusI: number | null,
  focused = false,
): HeapObject {
  const highlights: ArrayHighlight[] = nums.map((_, index) => {
    if (focusI != null && index === focusI) return { index, role: 'current' as const }
    if (used[index]) return { index, role: 'visited' as const }
    return { index, role: 'window' as const }
  })
  const pointers: Record<string, number> = {}
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

function usedHeap(used: boolean[], focusI: number | null): HeapObject {
  const highlights: ArrayHighlight[] = used.map((flag, index) => {
    if (focusI != null && index === focusI) {
      return { index, role: flag ? 'found' as const : 'current' as const }
    }
    return { index, role: flag ? 'visited' as const : 'window' as const }
  })
  return {
    id: 'used',
    kind: 'array',
    label: 'boolean[] used',
    values: used.map((flag) => (flag ? 'T' : 'F')),
    highlights,
    focused: false,
  }
}

function pathStack(
  path: number[],
  mode: 'idle' | 'add' | 'remove',
  opValue?: number,
): HeapObject {
  const items: number[] =
    mode === 'remove' && opValue != null ? [...path, opValue] : [...path]
  const label =
    mode === 'add' && opValue != null
      ? `path · ADD ${opValue}`
      : mode === 'remove' && opValue != null
        ? `path · REMOVE ${opValue}`
        : 'path · partial permutation'
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
    label: `result · ${result.length} permutation${result.length === 1 ? '' : 's'}`,
    // Snapshot the list: later pushes must not rewrite earlier steps.
    values: result.length === 0 ? ['(empty)'] : [...result],
    highlights: result.length === 0 ? [] : highlights,
    focused,
  }
}

function heapFor(
  nums: number[],
  used: boolean[],
  path: number[],
  result: string[],
  focusI: number | null,
  pathMode: 'idle' | 'add' | 'remove',
  justRecorded: boolean,
  opValue?: number,
): HeapObject[] {
  return [
    numsHeap(nums, used, focusI, pathMode === 'idle' && !justRecorded),
    usedHeap(used, focusI),
    pathStack(path, pathMode, opValue),
    resultHeap(result, justRecorded, justRecorded),
  ]
}

function generateSteps(nums: number[]): Step[] {
  const n = nums.length
  const steps: Step[] = []
  let stepId = 1
  const path: number[] = []
  const used: boolean[] = Array.from({ length: n }, () => false)
  const result: string[] = []
  const stack: Frame[] = []

  const push = (step: Omit<Step, 'id'>) => {
    steps.push({ ...step, id: stepId++ })
  }

  function frames(activeIdx: number | null, wrapperActive = false): CallFrame[] {
    const outer: CallFrame = {
      name: 'permute',
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
        ...(f.i != null ? { i: f.i } : {}),
        path: { ref: 'path' },
        used: { ref: 'used' },
        action: f.action,
      },
    }))
    return [outer, ...inner]
  }

  push({
    narrative:
      n === 0
        ? 'Enter permute on []. The only permutation is [].'
        : `Enter permute on ${fmtPath(nums)}. Unlike Subsets, every level may retry all unused indices.`,
    why: 'Order matters. boolean[] used tracks which indices are already in the path so we do not reuse them.',
    codeFocus: L.enter,
    callStack: frames(null, true),
    heap: heapFor(nums, used, path, result, null, 'idle', false),
  })

  function backtrack(): void {
    stack.push({ i: null, action: 'check' })

    if (path.length === n) {
      result.push(fmtPath(path))
      push({
        narrative: `path.size() == ${n}. Snapshot ${fmtPath(path)} into result.`,
        why: 'A full path is one permutation. Record a copy, then return so the caller can undo.',
        codeFocus: L.record,
        callStack: frames(stack.length - 1),
        heap: heapFor(nums, used, path, result, null, 'idle', true),
      })
      stack.pop()
      return
    }

    push({
      narrative: `Call backtrack with path ${fmtPath(path)}. Try every unused index.`,
      why: 'Subsets advances start=i+1 (forward-only). Permutations restart from 0 and skip used[i].',
      codeFocus: L.recurse,
      callStack: frames(stack.length - 1),
      heap: heapFor(nums, used, path, result, null, 'idle', false),
    })

    for (let i = 0; i < n; i++) {
      if (used[i]) continue

      const chosen = nums[i]!
      used[i] = true
      path.push(chosen)
      stack[stack.length - 1] = { i, action: 'path.add' }
      push({
        narrative: `Execute path.add(nums[${i}]): push ${chosen} → ${fmtPath(path)}. Mark used[${i}]=true.`,
        why: 'Line path.add is the choose. used[i] blocks this index until we undo.',
        codeFocus: L.add,
        callStack: frames(stack.length - 1),
        heap: heapFor(nums, used, path, result, i, 'add', false, chosen),
      })

      stack[stack.length - 1] = { i, action: 'recurse' }
      push({
        narrative: `RECURSE backtrack() with path ${fmtPath(path)}.`,
        why: 'Go deeper. The next level will again scan all indices and skip those still marked used.',
        codeFocus: L.recurse,
        callStack: frames(stack.length - 1),
        heap: heapFor(nums, used, path, result, i, 'idle', false),
      })

      backtrack()

      path.pop()
      used[i] = false
      stack[stack.length - 1] = { i, action: 'path.remove' }
      push({
        narrative: `Execute path.remove(...): pop ${chosen} → ${fmtPath(path)}. Clear used[${i}]=false.`,
        why: 'Line path.remove is the backtrack. Undo add and used so the next sibling index can run.',
        codeFocus: L.remove,
        callStack: frames(stack.length - 1),
        heap: heapFor(nums, used, path, result, i, 'remove', false, chosen),
      })
    }

    stack.pop()
  }

  backtrack()

  push({
    narrative: `Done. Return result with ${result.length} permutation${result.length === 1 ? '' : 's'}.`,
    why: 'There are n! permutations for n distinct elements. Each was recorded once, then the recursion unwound.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'permute',
        active: true,
        locals: {
          nums: { ref: 'nums' },
          result: { ref: 'result' },
          count: result.length,
        },
      },
    ],
    heap: heapFor(nums, used, path, result, null, 'idle', false),
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
      hint: 'Up to 3 distinct ints (n! permutations grow fast)',
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
          errors: [
            'nums must be distinct for this demo (duplicates need a different pack).',
          ],
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
  throw new Error(
    `Permutations default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const permutations: ProblemPack = {
  id: '0046-permutations',
  lcNumber: 46,
  title: 'Permutations',
  pattern: 'Backtracking',
  difficulty: 'Medium',
  insight:
    'Build a path of length n. At each level try every index not in used[]; path.add → recurse → path.remove, and clear used[i].',
  invariant:
    'path is the partial permutation; used[i] is true iff nums[i] is currently on the path. Unlike Subsets, the loop always starts at 0.',
  complexity: {
    time: 'O(n · n!)',
    space: 'O(n)',
    notes: 'Output size is O(n · n!); recursion depth is O(n).',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: defaultNums.length },
  benchmark: placeholderBenchmark(
    'Backtracking enumerates all n! permutations; each costs O(n) to copy into the answer list.',
  ),
  walkthrough: {
    statement:
      'Given distinct integers nums, return every possible permutation. Order of permutations does not matter.',
    keyIdea:
      'Same choose → recurse → undo pattern as Subsets, but each level retries all unused indices (order matters), tracked with boolean[] used.',
    approach: [
      'Start with path = [] and used = [false, ...]. Call backtrack().',
      'If path.size() == n: copy path into result and return.',
      'For each index i: if used[i], skip; else used[i]=true, path.add(nums[i]), recurse, path.removeLast(), used[i]=false.',
      'Watch ADD and REMOVE on the path stack: add grows the permutation, remove undoes it for the next sibling.',
      'Prefer used[] over path.contains: O(1) membership instead of scanning the path.',
    ],
  },
}
