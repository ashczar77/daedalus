/**
 * LeetCode #74 - Search a 2D Matrix.
 * Flatten row-major sorted matrix to 1D binary search.
 */
import javaSrc from '../../algorithms/0074-search-a-2d-matrix/Solution.java?raw'
import kotlinSrc from '../../algorithms/0074-search-a-2d-matrix/Solution.kt?raw'
import pythonSrc from '../../algorithms/0074-search-a-2d-matrix/solution.py?raw'
import { defineInput, parseIntValue } from '../engine/input'
import type { ParseResult } from '../engine/input'
import type { HighlightRole, HeapObject, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { matrix: number[][]; target: number }

const defaultMatrix = [
  [1, 3, 5, 7],
  [10, 11, 16, 20],
  [23, 30, 34, 60],
]
const defaultTarget = 3

const L = {
  init: { java: 8, kotlin: 8, python: 8 },
  while: { java: 10, kotlin: 10, python: 10 },
  mid: { java: 14, kotlin: 14, python: 14 },
  found: { java: 16, kotlin: 16, python: 16 },
  leftInc: { java: 19, kotlin: 17, python: 18 },
  rightDec: { java: 21, kotlin: 18, python: 20 },
  retMiss: { java: 24, kotlin: 21, python: 21 },
} as const

type CellHighlight = { row: number; col: number; role: HighlightRole }

function toCell(flat: number, cols: number): [number, number] {
  return [Math.floor(flat / cols), flat % cols]
}

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row])
}

function formatMatrix(matrix: number[][]): string {
  if (matrix.length === 0) return ''
  return matrix.map((row) => row.join(' ')).join('; ')
}

function parseIntMatrix(
  raw: string,
  limits: {
    name?: string
    minRows?: number
    maxRows?: number
    minCols?: number
    maxCols?: number
    minVal?: number
    maxVal?: number
  } = {},
): ParseResult<number[][]> {
  const name = limits.name ?? 'matrix'
  const minRows = limits.minRows ?? 1
  const maxRows = limits.maxRows ?? 4
  const minCols = limits.minCols ?? 1
  const maxCols = limits.maxCols ?? 4
  const minVal = limits.minVal ?? -99
  const maxVal = limits.maxVal ?? 99

  const trimmed = raw.trim()
  if (trimmed === '') {
    return {
      ok: false,
      errors: [`${name} must have at least ${minRows} row(s).`],
    }
  }

  let rows: number[][] | null = null
  if (trimmed.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (!Array.isArray(parsed)) throw new Error('shape')
      rows = parsed.map((row) => {
        if (!Array.isArray(row)) throw new Error('row')
        return row.map((cell) => {
          if (typeof cell !== 'number' || !Number.isInteger(cell)) {
            throw new Error('cell')
          }
          return cell
        })
      })
    } catch {
      return {
        ok: false,
        errors: [`${name} JSON must look like [[1,2],[3,4]].`],
      }
    }
  } else {
    const lines = trimmed
      .split(/[;\n]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
    rows = []
    for (const line of lines) {
      const tokens = line.split(/[\s,]+/).filter(Boolean)
      if (tokens.length === 0) {
        return { ok: false, errors: [`${name} has an empty row.`] }
      }
      const ints: number[] = []
      for (const token of tokens) {
        if (!/^-?\d+$/.test(token)) {
          return {
            ok: false,
            errors: [`${name} cell "${token}" is not an integer.`],
          }
        }
        ints.push(Number(token))
      }
      rows.push(ints)
    }
  }

  if (rows.length < minRows || rows.length > maxRows) {
    return {
      ok: false,
      errors: [
        `${name} must have ${minRows}...${maxRows} rows (got ${rows.length}).`,
      ],
    }
  }

  const cols = rows[0]!.length
  if (cols < minCols || cols > maxCols) {
    return {
      ok: false,
      errors: [
        `${name} must have ${minCols}...${maxCols} columns (got ${cols}).`,
      ],
    }
  }

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]!
    if (row.length !== cols) {
      return {
        ok: false,
        errors: [
          `${name} row ${r} has ${row.length} cells; expected ${cols} (rectangular).`,
        ],
      }
    }
    for (let c = 0; c < row.length; c++) {
      const value = row[c]!
      if (value < minVal || value > maxVal) {
        return {
          ok: false,
          errors: [
            `${name}[${r}][${c}]=${value} is outside ${minVal}...${maxVal}.`,
          ],
        }
      }
    }
  }

  return { ok: true, value: rows }
}

function windowHighlights(
  rows: number,
  cols: number,
  left: number,
  right: number,
  mid?: number,
  midRole?: HighlightRole,
): CellHighlight[] {
  const out: CellHighlight[] = []
  const total = rows * cols
  for (let i = 0; i < total; i++) {
    const [row, col] = toCell(i, cols)
    if (i < left || i > right) out.push({ row, col, role: 'discard' })
    else if (mid !== undefined && i === mid)
      out.push({ row, col, role: midRole ?? 'compare' })
    else out.push({ row, col, role: 'window' })
  }
  return out
}

function gridHeap(
  cells: number[][],
  opts: {
    left?: number
    mid?: number
    right?: number
    highlights?: CellHighlight[]
    caption?: string
    focused?: boolean
  } = {},
): HeapObject {
  const cols = cells.length === 0 ? 0 : cells[0]!.length
  const pointers: Record<string, [number, number]> = {}
  if (opts.left !== undefined && cols > 0) {
    pointers.left = toCell(opts.left, cols)
  }
  if (opts.mid !== undefined && cols > 0) {
    pointers.mid = toCell(opts.mid, cols)
  }
  if (opts.right !== undefined && cols > 0 && opts.right >= 0) {
    pointers.right = toCell(opts.right, cols)
  }
  return {
    id: 'matrix',
    kind: 'grid',
    label: 'int[][] matrix',
    cells: cloneGrid(cells),
    ...(opts.highlights ? { highlights: opts.highlights } : {}),
    ...(Object.keys(pointers).length > 0 ? { pointers } : {}),
    ...(opts.caption ? { caption: opts.caption } : {}),
    focused: opts.focused ?? true,
  }
}

function generateSteps({ matrix, target: t }: Input): Step[] {
  const steps: Step[] = []
  let id = 1
  const rows = matrix.length
  const cols = rows === 0 ? 0 : matrix[0]!.length

  if (rows === 0 || cols === 0) {
    steps.push({
      id: id++,
      narrative: 'Empty matrix. No cells to search → return false.',
      why: 'There is no flat index that can hold the target.',
      codeFocus: L.retMiss,
      callStack: [
        {
          name: 'searchMatrix',
          active: true,
          locals: { matrix: { ref: 'matrix' }, target: t, result: false },
        },
      ],
      heap: [gridHeap([], { caption: 'Empty matrix.', focused: false })],
    })
    return steps
  }

  let left = 0
  let right = rows * cols - 1

  steps.push({
    id: id++,
    narrative: `Treat the ${rows}x${cols} matrix as a sorted row-major array of length ${rows * cols}. left=${left}, right=${right}.`,
    why: 'Each row continues where the previous row ended, so binary search still works in 1D index space.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'searchMatrix',
        active: true,
        locals: {
          matrix: { ref: 'matrix' },
          target: t,
          m: rows,
          n: cols,
          left,
          right,
        },
      },
    ],
    heap: [
      gridHeap(matrix, {
        left,
        right,
        highlights: windowHighlights(rows, cols, left, right),
        caption: `Flat window [${left}, ${right}]`,
      }),
    ],
  })

  while (left <= right) {
    steps.push({
      id: id++,
      narrative: `While left (${left}) ≤ right (${right}) - enter loop body.`,
      why: 'Stop when the inclusive flat window is empty.',
      codeFocus: L.while,
      callStack: [
        {
          name: 'searchMatrix',
          active: true,
          locals: {
            matrix: { ref: 'matrix' },
            target: t,
            m: rows,
            n: cols,
            left,
            right,
          },
        },
      ],
      heap: [
        gridHeap(matrix, {
          left,
          right,
          highlights: windowHighlights(rows, cols, left, right),
          caption: `Flat window [${left}, ${right}]`,
        }),
      ],
    })

    const mid = left + Math.floor((right - left) / 2)
    const [midRow, midCol] = toCell(mid, cols)
    const midVal = matrix[midRow]![midCol]!

    if (midVal === t) {
      steps.push({
        id: id++,
        narrative: `mid=${mid} → cell (${midRow},${midCol}) = ${midVal} equals target.`,
        why: 'Row = mid / cols, col = mid % cols recover the 2D address from the flat index.',
        codeFocus: L.found,
        callStack: [
          {
            name: 'searchMatrix',
            active: true,
            locals: {
              matrix: { ref: 'matrix' },
              target: t,
              left,
              right,
              mid,
              row: midRow,
              col: midCol,
              val: midVal,
            },
          },
        ],
        heap: [
          gridHeap(matrix, {
            left,
            mid,
            right,
            highlights: windowHighlights(
              rows,
              cols,
              left,
              right,
              mid,
              'found',
            ),
            caption: `Found at (${midRow},${midCol})`,
          }),
        ],
      })

      steps.push({
        id: id++,
        narrative: 'Return true.',
        why: 'Logarithmic probes on the flattened index beat scanning every cell.',
        codeFocus: L.found,
        callStack: [
          {
            name: 'searchMatrix',
            active: true,
            locals: {
              matrix: { ref: 'matrix' },
              target: t,
              result: true,
            },
          },
        ],
        heap: [
          gridHeap(matrix, {
            mid,
            highlights: [{ row: midRow, col: midCol, role: 'found' }],
            caption: `Answer cell (${midRow},${midCol})`,
          }),
        ],
      })
      return steps
    }

    const tooSmall = midVal < t
    steps.push({
      id: id++,
      narrative: `mid=${mid} → (${midRow},${midCol}) = ${midVal} - ${
        tooSmall ? `too small (< ${t}).` : `too large (> ${t}).`
      }`,
      why: tooSmall
        ? 'Discard mid and everything left of it in flat order.'
        : 'Discard mid and everything right of it in flat order.',
      codeFocus: L.mid,
      callStack: [
        {
          name: 'searchMatrix',
          active: true,
          locals: {
            matrix: { ref: 'matrix' },
            target: t,
            left,
            right,
            mid,
            row: midRow,
            col: midCol,
            val: midVal,
          },
        },
      ],
      heap: [
        gridHeap(matrix, {
          left,
          mid,
          right,
          highlights: windowHighlights(
            rows,
            cols,
            left,
            right,
            mid,
            'compare',
          ),
          caption: `Compare flat mid=${mid}`,
        }),
      ],
    })

    if (tooSmall) {
      left = mid + 1
      steps.push({
        id: id++,
        narrative: `Update left = mid + 1 → ${left}. Flat window is now [${left}, ${right}].`,
        why: 'Same mid + 1 rule as 1D binary search; only the address mapping is 2D.',
        codeFocus: L.leftInc,
        callStack: [
          {
            name: 'searchMatrix',
            active: true,
            locals: {
              matrix: { ref: 'matrix' },
              target: t,
              left,
              right,
            },
          },
        ],
        heap: [
          gridHeap(matrix, {
            left,
            right,
            highlights: windowHighlights(rows, cols, left, right),
            caption: `Flat window [${left}, ${right}]`,
          }),
        ],
      })
    } else {
      right = mid - 1
      steps.push({
        id: id++,
        narrative: `Update right = mid - 1 → ${right}. Flat window is now [${left}, ${right}].`,
        why: 'Same mid - 1 rule as 1D binary search; discarded cells tint as discard.',
        codeFocus: L.rightDec,
        callStack: [
          {
            name: 'searchMatrix',
            active: true,
            locals: {
              matrix: { ref: 'matrix' },
              target: t,
              left,
              right,
            },
          },
        ],
        heap: [
          gridHeap(matrix, {
            left,
            right,
            highlights: windowHighlights(rows, cols, left, right),
            caption: `Flat window [${left}, ${right}]`,
          }),
        ],
      })
    }
  }

  steps.push({
    id: id++,
    narrative: 'Flat window empty with no match → return false.',
    why: 'Target is absent from the sorted matrix.',
    codeFocus: L.retMiss,
    callStack: [
      {
        name: 'searchMatrix',
        active: true,
        locals: {
          matrix: { ref: 'matrix' },
          target: t,
          left,
          right,
          result: false,
        },
      },
    ],
    heap: [
      gridHeap(matrix, {
        highlights: windowHighlights(rows, cols, left, right),
        caption: 'No match',
      }),
    ],
  })

  return steps
}

const input = defineInput<Input>({
  kind: 'intMatrixTarget',
  fields: [
    {
      key: 'matrix',
      label: 'matrix',
      widget: 'text',
      placeholder: '1 3 5 7; 10 11 16 20; 23 30 34 60',
      hint: 'Rows separated by semicolon; ints space/comma separated. Cap 4x4.',
    },
    { key: 'target', label: 'target', widget: 'text', placeholder: '3' },
  ],
  defaultRaw: {
    matrix: formatMatrix(defaultMatrix),
    target: String(defaultTarget),
  },
  parse: (raw) => {
    const matrixResult = parseIntMatrix(raw.matrix ?? '', {
      name: 'matrix',
      minRows: 1,
      maxRows: 4,
      minCols: 1,
      maxCols: 4,
      minVal: -99,
      maxVal: 99,
    })
    if (!matrixResult.ok) return matrixResult
    const targetResult = parseIntValue(raw.target ?? '', {
      name: 'target',
      minVal: -999,
      maxVal: 999,
    })
    if (!targetResult.ok) return targetResult
    return {
      ok: true,
      value: { matrix: matrixResult.value, target: targetResult.value },
    }
  },
  formatLabel: (value) =>
    `matrix = [${value.matrix.map((row) => `[${row.join(', ')}]`).join(', ')}], target = ${value.target}`,
  generateSteps,
  fixtures: [
    {
      name: 'not-found',
      raw: {
        matrix: '1 3 5 7; 10 11 16 20; 23 30 34 60',
        target: '13',
      },
    },
    {
      name: 'single-cell',
      raw: { matrix: '5', target: '5' },
    },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) throw new Error(defaultParsed.errors.join('; '))

export const searchA2DMatrix: ProblemPack = {
  id: '0074-search-a-2d-matrix',
  lcNumber: 74,
  title: 'Search a 2D Matrix',
  pattern: 'Binary Search',
  difficulty: 'Medium',
  insight:
    'Treat the matrix as one sorted row-major array. mid maps to (mid / cols, mid % cols).',
  invariant:
    'If the target exists, it is always inside the flat window [left, right].',
  complexity: {
    time: 'O(log(m*n))',
    space: 'O(1)',
    notes: 'Works because each row starts after the previous row ends.',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: {
    java: javaSrc,
    kotlin: kotlinSrc,
    python: pythonSrc,
  },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Flattened binary search stays logarithmic in m*n; scanning cells is linear in m*n.',
  ),
  walkthrough: {
    statement:
      'Given an m x n matrix where each row is sorted and the first of each row is greater than the last of the previous row, return whether target appears.',
    keyIdea:
      'Binary search the flat index space; convert mid to a row and column with division and modulo.',
    approach: [
      'left = 0, right = m*n - 1.',
      'While left ≤ right: mid = (left+right)/2; read matrix[mid/n][mid%n].',
      'Move left or right like 1D binary search; return false if the window empties.',
    ],
  },
}
