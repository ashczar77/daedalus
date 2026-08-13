/**
 * LeetCode #981 - Time Based Key-Value Store.
 * Design: set appends; get binary-searches the floor timestamp ≤ query.
 */
import javaSrc from '../../algorithms/0981-time-based-key-value-store/Solution.java?raw'
import kotlinSrc from '../../algorithms/0981-time-based-key-value-store/Solution.kt?raw'
import pythonSrc from '../../algorithms/0981-time-based-key-value-store/solution.py?raw'
import { defineInput } from '../engine/input'
import type { ParseResult } from '../engine/input'
import type {
  ArrayHighlight,
  HeapObject,
  ProblemPack,
  Step,
} from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type SetOp = { kind: 'set'; key: string; value: string; timestamp: number }
type GetOp = { kind: 'get'; key: string; timestamp: number }
type Op = SetOp | GetOp

type Entry = { timestamp: number; value: string }

const L = {
  ctor: { java: 22, kotlin: 7, python: 5 },
  set: { java: 26, kotlin: 10, python: 11 },
  getStart: { java: 31, kotlin: 14, python: 14 },
  getEmpty: { java: 33, kotlin: 15, python: 16 },
  getInit: { java: 35, kotlin: 16, python: 17 },
  mid: { java: 39, kotlin: 20, python: 21 },
  keep: { java: 41, kotlin: 22, python: 23 },
  leftInc: { java: 42, kotlin: 23, python: 24 },
  rightDec: { java: 44, kotlin: 25, python: 26 },
  ret: { java: 47, kotlin: 28, python: 27 },
} as const

const defaultOpsRaw =
  'set foo bar 1; get foo 1; get foo 3; set foo bar2 4; get foo 4; get foo 5'

function formatHistory(list: Entry[]): string {
  if (list.length === 0) return '[]'
  return `[${list.map((e) => `(${e.timestamp},${e.value})`).join(', ')}]`
}

function storeHeap(
  store: Map<string, Entry[]>,
  focusKeys: string[] = [],
): HeapObject {
  return {
    id: 'store',
    kind: 'hashmap',
    label: 'Map<String, List<Pair>> store',
    entries: [...store.entries()].map(
      ([key, list]) => [key, formatHistory(list)] as [string, string],
    ),
    focusKeys,
    focused: true,
  }
}

function historyHeap(
  key: string,
  list: Entry[],
  opts: {
    left?: number
    mid?: number
    right?: number
    highlights?: ArrayHighlight[]
    caption?: string
  } = {},
): HeapObject {
  return {
    id: 'history',
    kind: 'array',
    label: `history[${key}] (ts,value)`,
    values: list.map((e) => `${e.timestamp}:${e.value}`),
    ...(opts.left !== undefined ||
    opts.mid !== undefined ||
    opts.right !== undefined
      ? {
          pointers: {
            ...(opts.left !== undefined ? { left: opts.left } : {}),
            ...(opts.mid !== undefined ? { mid: opts.mid } : {}),
            ...(opts.right !== undefined ? { right: opts.right } : {}),
          },
        }
      : {}),
    ...(opts.highlights ? { highlights: opts.highlights } : {}),
    focused: true,
  }
}

function windowHighlights(
  n: number,
  left: number,
  right: number,
  mid?: number,
  midRole: 'compare' | 'found' | 'window' = 'compare',
): ArrayHighlight[] {
  const out: ArrayHighlight[] = []
  for (let i = 0; i < n; i++) {
    if (i < left || i > right) out.push({ index: i, role: 'discard' })
    else if (mid !== undefined && i === mid) out.push({ index: i, role: midRole })
    else out.push({ index: i, role: 'window' })
  }
  return out
}

function parseOps(raw: string): ParseResult<Op[]> {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { ok: false, errors: ['ops needs at least one set/get line.'] }
  }
  if (trimmed.length > 400) {
    return { ok: false, errors: ['ops supports at most 400 characters.'] }
  }

  const lines = trimmed
    .split(/[;\n]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { ok: false, errors: ['ops needs at least one set/get line.'] }
  }
  if (lines.length > 12) {
    return {
      ok: false,
      errors: [`ops supports at most 12 operations (got ${lines.length}).`],
    }
  }

  const ops: Op[] = []
  const lastTs = new Map<string, number>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const parts = line.split(/\s+/).filter(Boolean)
    const opName = (parts[0] ?? '').toLowerCase()

    if (opName === 'set') {
      if (parts.length !== 4) {
        return {
          ok: false,
          errors: [
            `ops line ${i + 1}: set needs "set <key> <value> <timestamp>".`,
          ],
        }
      }
      const key = parts[1]!
      const value = parts[2]!
      const tsRaw = parts[3]!
      if (!/^-?\d+$/.test(tsRaw)) {
        return {
          ok: false,
          errors: [`ops line ${i + 1}: timestamp must be an integer.`],
        }
      }
      const timestamp = Number(tsRaw)
      if (timestamp < 1 || timestamp > 999) {
        return {
          ok: false,
          errors: [`ops line ${i + 1}: timestamp must be 1…999.`],
        }
      }
      if (!/^[A-Za-z0-9_]{1,8}$/.test(key)) {
        return {
          ok: false,
          errors: [
            `ops line ${i + 1}: key must be 1…8 alphanumerics/underscore.`,
          ],
        }
      }
      if (!/^[A-Za-z0-9_]{1,8}$/.test(value)) {
        return {
          ok: false,
          errors: [
            `ops line ${i + 1}: value must be 1…8 alphanumerics/underscore.`,
          ],
        }
      }
      const prev = lastTs.get(key)
      if (prev !== undefined && timestamp <= prev) {
        return {
          ok: false,
          errors: [
            `ops line ${i + 1}: timestamps for "${key}" must strictly increase.`,
          ],
        }
      }
      lastTs.set(key, timestamp)
      ops.push({ kind: 'set', key, value, timestamp })
      continue
    }

    if (opName === 'get') {
      if (parts.length !== 3) {
        return {
          ok: false,
          errors: [`ops line ${i + 1}: get needs "get <key> <timestamp>".`],
        }
      }
      const key = parts[1]!
      const tsRaw = parts[2]!
      if (!/^-?\d+$/.test(tsRaw)) {
        return {
          ok: false,
          errors: [`ops line ${i + 1}: timestamp must be an integer.`],
        }
      }
      const timestamp = Number(tsRaw)
      if (timestamp < 1 || timestamp > 999) {
        return {
          ok: false,
          errors: [`ops line ${i + 1}: timestamp must be 1…999.`],
        }
      }
      if (!/^[A-Za-z0-9_]{1,8}$/.test(key)) {
        return {
          ok: false,
          errors: [
            `ops line ${i + 1}: key must be 1…8 alphanumerics/underscore.`,
          ],
        }
      }
      ops.push({ kind: 'get', key, timestamp })
      continue
    }

    return {
      ok: false,
      errors: [`ops line ${i + 1}: expected set or get, got "${parts[0] ?? ''}".`],
    }
  }

  return { ok: true, value: ops }
}

function formatOps(ops: Op[]): string {
  return ops
    .map((op) =>
      op.kind === 'set'
        ? `set ${op.key} ${op.value} ${op.timestamp}`
        : `get ${op.key} ${op.timestamp}`,
    )
    .join('; ')
}

function generateSteps(ops: Op[]): Step[] {
  const steps: Step[] = []
  let id = 1
  const store = new Map<string, Entry[]>()

  steps.push({
    id: id++,
    narrative: 'Construct TimeMap. Allocate an empty HashMap on the heap.',
    why: 'Each key owns a list of (timestamp, value) pairs appended in increasing time order.',
    codeFocus: L.ctor,
    callStack: [
      {
        name: 'TimeMap',
        active: true,
        locals: { store: { ref: 'store' } },
      },
    ],
    heap: [storeHeap(store)],
  })

  for (const op of ops) {
    if (op.kind === 'set') {
      const list = store.get(op.key) ?? []
      list.push({ timestamp: op.timestamp, value: op.value })
      store.set(op.key, list)

      steps.push({
        id: id++,
        narrative: `set("${op.key}", "${op.value}", ${op.timestamp}) → append to history.`,
        why: 'Timestamps for a key arrive in increasing order, so the list stays sorted for binary search.',
        codeFocus: L.set,
        callStack: [
          {
            name: 'set',
            active: true,
            locals: {
              key: op.key,
              value: op.value,
              timestamp: op.timestamp,
              store: { ref: 'store' },
            },
          },
        ],
        heap: [
          storeHeap(store, [op.key]),
          historyHeap(op.key, list, {
            highlights: [{ index: list.length - 1, role: 'found' }],
          }),
        ],
      })
      continue
    }

    const list = store.get(op.key) ?? []

    steps.push({
      id: id++,
      narrative: `get("${op.key}", ${op.timestamp}) → look up history for key.`,
      why: 'Need the value with the largest timestamp ≤ query (floor).',
      codeFocus: L.getStart,
      callStack: [
        {
          name: 'get',
          active: true,
          locals: {
            key: op.key,
            timestamp: op.timestamp,
            store: { ref: 'store' },
          },
        },
      ],
      heap: [
        storeHeap(store, [op.key]),
        ...(list.length > 0
          ? [historyHeap(op.key, list)]
          : []),
      ],
    })

    if (list.length === 0) {
      steps.push({
        id: id++,
        narrative: `No history for "${op.key}" → return "".`,
        why: 'Missing key (or empty list) has no floor value.',
        codeFocus: L.getEmpty,
        callStack: [
          {
            name: 'get',
            active: true,
            locals: {
              key: op.key,
              timestamp: op.timestamp,
              result: '""',
            },
          },
        ],
        heap: [storeHeap(store, [op.key])],
      })
      continue
    }

    let left = 0
    let right = list.length - 1
    let ans = ''
    let floorIdx = -1

    steps.push({
      id: id++,
      narrative: `Binary search floor on history. left=${left}, right=${right}, ans="".`,
      why: 'Invariant: if a floor exists, it is always inside [left, right] until the window empties.',
      codeFocus: L.getInit,
      callStack: [
        {
          name: 'get',
          active: true,
          locals: {
            key: op.key,
            timestamp: op.timestamp,
            left,
            right,
            ans: '""',
            store: { ref: 'store' },
            history: { ref: 'history' },
          },
        },
      ],
      heap: [
        storeHeap(store, [op.key]),
        historyHeap(op.key, list, {
          left,
          right,
          highlights: windowHighlights(list.length, left, right),
        }),
      ],
    })

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2)
      const midTs = list[mid]!.timestamp
      const midVal = list[mid]!.value

      if (midTs <= op.timestamp) {
        ans = midVal
        floorIdx = mid
        steps.push({
          id: id++,
          narrative: `mid=${mid}: ts=${midTs} ≤ ${op.timestamp} → keep ans="${ans}", then left = mid + 1.`,
          why: 'This timestamp is feasible; search the right half for a later (still ≤ query) floor.',
          codeFocus: L.keep,
          callStack: [
            {
              name: 'get',
              active: true,
              locals: {
                key: op.key,
                timestamp: op.timestamp,
                left,
                right,
                mid,
                midTs,
                ans: `"${ans}"`,
                store: { ref: 'store' },
                history: { ref: 'history' },
              },
            },
          ],
          heap: [
            storeHeap(store, [op.key]),
            historyHeap(op.key, list, {
              left,
              mid,
              right,
              highlights: windowHighlights(
                list.length,
                left,
                right,
                mid,
                'found',
              ),
            }),
          ],
        })
        left = mid + 1
        steps.push({
          id: id++,
          narrative: `left = mid + 1 → ${left}. Window is now [${left}, ${right}].`,
          why: 'Keep searching for a closer floor without losing the answer already stored in ans.',
          codeFocus: L.leftInc,
          callStack: [
            {
              name: 'get',
              active: true,
              locals: {
                key: op.key,
                timestamp: op.timestamp,
                left,
                right,
                ans: `"${ans}"`,
                store: { ref: 'store' },
                history: { ref: 'history' },
              },
            },
          ],
          heap: [
            storeHeap(store, [op.key]),
            historyHeap(op.key, list, {
              left,
              right,
              highlights:
                left <= right
                  ? windowHighlights(list.length, left, right)
                  : list.map((_, i) => ({
                      index: i,
                      role: 'discard' as const,
                    })),
            }),
          ],
        })
      } else {
        steps.push({
          id: id++,
          narrative: `mid=${mid}: ts=${midTs} > ${op.timestamp} → discard mid and the right half.`,
          why: 'Too late for this query; floor must be further left.',
          codeFocus: L.mid,
          callStack: [
            {
              name: 'get',
              active: true,
              locals: {
                key: op.key,
                timestamp: op.timestamp,
                left,
                right,
                mid,
                midTs,
                ans: ans === '' ? '""' : `"${ans}"`,
                store: { ref: 'store' },
                history: { ref: 'history' },
              },
            },
          ],
          heap: [
            storeHeap(store, [op.key]),
            historyHeap(op.key, list, {
              left,
              mid,
              right,
              highlights: windowHighlights(
                list.length,
                left,
                right,
                mid,
                'compare',
              ),
            }),
          ],
        })
        right = mid - 1
        steps.push({
          id: id++,
          narrative: `right = mid - 1 → ${right}. Window is now [${left}, ${right}].`,
          why: 'Shrink past the too-large timestamp; ans stays unchanged.',
          codeFocus: L.rightDec,
          callStack: [
            {
              name: 'get',
              active: true,
              locals: {
                key: op.key,
                timestamp: op.timestamp,
                left,
                right,
                ans: ans === '' ? '""' : `"${ans}"`,
                store: { ref: 'store' },
                history: { ref: 'history' },
              },
            },
          ],
          heap: [
            storeHeap(store, [op.key]),
            historyHeap(op.key, list, {
              left,
              right,
              highlights:
                left <= right
                  ? windowHighlights(list.length, left, right)
                  : list.map((_, i) => ({
                      index: i,
                      role: 'discard' as const,
                    })),
            }),
          ],
        })
      }
    }

    const resultLabel = ans === '' ? '""' : `"${ans}"`
    steps.push({
      id: id++,
      narrative: `Window empty. Return ${resultLabel}.`,
      why:
        ans === ''
          ? 'Every timestamp was greater than the query.'
          : 'ans holds the latest feasible value from the binary search.',
      codeFocus: L.ret,
      callStack: [
        {
          name: 'get',
          active: true,
          locals: {
            key: op.key,
            timestamp: op.timestamp,
            result: resultLabel,
            store: { ref: 'store' },
          },
        },
      ],
      heap: [
        storeHeap(store, [op.key]),
        historyHeap(op.key, list, {
          highlights: list.map((_, i) => ({
            index: i,
            role: i === floorIdx ? ('found' as const) : ('discard' as const),
          })),
        }),
      ],
    })
  }

  return steps
}

const input = defineInput<Op[]>({
  kind: 'timeMapOps',
  fields: [
    {
      key: 'ops',
      label: 'ops',
      widget: 'text',
      placeholder: defaultOpsRaw,
      hint: 'One op per line or ";" separated: set key value ts / get key ts',
    },
  ],
  defaultRaw: { ops: defaultOpsRaw },
  parse: (raw) => parseOps(raw.ops ?? ''),
  formatLabel: (ops) => formatOps(ops),
  generateSteps,
  fixtures: [
    {
      name: 'missing-key',
      raw: { ops: 'get foo 1' },
    },
    {
      name: 'two-keys',
      raw: {
        ops: 'set foo bar 1; set baz qux 2; get foo 1; get baz 2',
      },
    },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Time Based Key-Value Store default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const timeBasedKeyValueStore: ProblemPack = {
  id: '0981-time-based-key-value-store',
  lcNumber: 981,
  title: 'Time Based Key-Value Store',
  pattern: 'Binary Search Design',
  difficulty: 'Medium',
  insight:
    'set appends (timestamps increase per key). get binary-searches for the largest timestamp ≤ query and keeps ans when midTs ≤ timestamp, then left = mid + 1.',
  invariant:
    'For each key, the history list is sorted by timestamp; during get, ans is the best floor found so far inside the shrinking [left, right] window.',
  complexity: {
    time: 'set O(1), get O(log n)',
    space: 'O(n)',
    notes: 'n is the number of set calls (total stored pairs).',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Gets are logarithmic in the per-key history length; sets are amortized constant appends.',
  ),
  walkthrough: {
    statement:
      'Design a time-based key-value store. set(key, value, timestamp) stores the pair. get(key, timestamp) returns the value with the largest timestamp ≤ the query, or "" if none exists.',
    keyIdea:
      'Store a sorted list per key. Binary search for the floor timestamp on get.',
    approach: [
      'set: append (timestamp, value) to the key\'s list.',
      'get: left/right over the list; when midTs ≤ timestamp, save ans and search right (left = mid + 1); else right = mid - 1.',
      'Return ans (possibly empty string).',
    ],
  },
}
