/**
 * LeetCode #240 - Search a 2D Matrix II.
 * Staircase elimination from the top-right corner (not flatten binary search).
 */
import javaSrc from '../../algorithms/0240-search-a-2d-matrix-ii/Solution.java?raw'
import kotlinSrc from '../../algorithms/0240-search-a-2d-matrix-ii/Solution.kt?raw'
import pythonSrc from '../../algorithms/0240-search-a-2d-matrix-ii/solution.py?raw'
import { defineInput, parseIntValue } from '../engine/input'
import type { ParseResult } from '../engine/input'
import type {
  HighlightRole,
  HeapObject,
  ProblemPack,
  Step,
} from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

type Input = { matrix: number[][]; target: number }

/** Smaller viz default that still shows the staircase (LC sample is 5x5). */
const defaultTarget = 5

const L = {
  empty: { java: 7, kotlin: 6, python: 7 },
  init: { java: 9, kotlin: 7, python: 8 },
  while: { java: 11, kotlin: 9, python: 10 },
  cur: { java: 12, kotlin: 10, python: 11 },
  found: { java: 14, kotlin: 12, python: 13 },
  colDec: { java: 17, kotlin: 13, python: 15 },
  rowInc: { java: 19, kotlin: 14, python: 17 },
  miss: { java: 22, kotlin: 17, python: 18 },
} as const

type Highlight = { row: number; col: number; role: HighlightRole }

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row])
}

function staircaseHighlights(
  rows: number,
  cols: number,
  row: number,
  col: number,
  cellRole: HighlightRole = 'compare',
): Highlight[] {
  const out: Highlight[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === row && c === col) {
        out.push({ row: r, col: c, role: cellRole })
      } else if (r < row || c > col) {
        // Already eliminated: rows above cur, columns to the right of cur.
        out.push({ row: r, col: c, role: 'discard' })
      } else if (r === row || c === col) {
        // Active row / column still under consideration.
        out.push({ row: r, col: c, role: 'compare' })
      } else {
        out.push({ row: r, col: c, role: 'window' })
      }
    }
  }
  return out
}

function allDiscard(rows: number, cols: number): Highlight[] {
  const out: Highlight[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push({ row: r, col: c, role: 'discard' })
    }
  }
  return out
}

function gridHeap(
  cells: number[][],
  highlights: Highlight[],
  pointers: Record<string, [number, number]> | undefined,
  caption: string,
  focused = true,
): HeapObject {
  return {
    id: 'matrix',
    kind: 'grid',
    label: 'int[][] matrix',
    cells,
    highlights,
    pointers,
    caption,
    focused,
  }
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
  const minRows = limits.minRows ?? 0
  const maxRows = limits.maxRows ?? 5
  const minCols = limits.minCols ?? 0
  const maxCols = limits.maxCols ?? 5
  const minVal = limits.minVal ?? -99
  const maxVal = limits.maxVal ?? 99

  const trimmed = raw.trim()
  if (trimmed === '') {
    if (minRows === 0) return { ok: true, value: [] }
    return { ok: false, errors: [`${name} must have at least ${minRows} row(s).`] }
  }

  let rows: number[][] | null = null
  if (trimmed.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (!Array.isArray(parsed)) throw new Error('grid')
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
        errors: [
          `${name} JSON must look like [[1,4],[2,5]] with integer cells.`,
        ],
      }
    }
  } else {
    const lines = trimmed
      .split(/[;\n]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
    rows = []
    for (const line of lines) {
      const parts = line.split(/[\s,]+/).filter(Boolean)
      const nums: number[] = []
      for (const part of parts) {
        if (!/^-?\d+$/.test(part)) {
          return {
            ok: false,
            errors: [`${name} cell "${part}" is not an integer.`],
          }
        }
        nums.push(Number(part))
      }
      rows.push(nums)
    }
  }

  if (rows.length < minRows || rows.length > maxRows) {
    return {
      ok: false,
      errors: [
        `${name} must have ${minRows}…${maxRows} rows (got ${rows.length}).`,
      ],
    }
  }
  if (rows.length === 0) return { ok: true, value: [] }

  const cols = rows[0]!.length
  if (cols < minCols || cols > maxCols) {
    return {
      ok: false,
      errors: [
        `${name} must have ${minCols}…${maxCols} columns (got ${cols}).`,
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
    for (let c = 0; c < cols; c++) {
      const v = row[c]!
      if (v < minVal || v > maxVal) {
        return {
          ok: false,
          errors: [
            `${name}[${r}][${c}]=${v} is outside ${minVal}…${maxVal}.`,
          ],
        }
      }
    }
  }

  return { ok: true, value: rows }
}

function formatIntMatrix(matrix: number[][]): string {
  if (matrix.length === 0) return '[]'
  return matrix.map((row) => `[${row.join(', ')}]`).join(', ')
}

function generateSteps({ matrix, target }: Input): Step[] {
  const steps: Step[] = []
  let id = 1
  const rows = matrix.length
  const cols = rows === 0 ? 0 : matrix[0]!.length
  const cells = cloneGrid(matrix)

  if (rows === 0 || cols === 0) {
    steps.push({
      id: id++,
      narrative: 'Empty matrix → return false.',
      why: 'No cell can hold the target.',
      codeFocus: L.empty,
      callStack: [
        {
          name: 'searchMatrix',
          active: true,
          locals: {
            matrix: { ref: 'matrix' },
            target,
            result: false,
          },
        },
      ],
      heap: [gridHeap([], [], undefined, 'Empty matrix.', false)],
    })
    return steps
  }

  let row = 0
  let col = cols - 1

  steps.push({
    id: id++,
    narrative: `Start at the top-right corner (${row}, ${col}). Locals row=${row}, col=${col}.`,
    why: 'Rows increase downward and columns increase rightward, so the top-right cell can discard a whole row or column each step.',
    codeFocus: L.init,
    callStack: [
      {
        name: 'searchMatrix',
        active: true,
        locals: {
          matrix: { ref: 'matrix' },
          target,
          row,
          col,
        },
      },
    ],
    heap: [
      gridHeap(
        cells,
        staircaseHighlights(rows, cols, row, col, 'current'),
        { cur: [row, col] },
        `At r${row}, c${col}. Analyzing this cell. target = ${target}`,
      ),
    ],
  })

  while (row < rows && col >= 0) {
    steps.push({
      id: id++,
      narrative: `While row (${row}) < ${rows} and col (${col}) ≥ 0 - cur stays inside the live rectangle.`,
      why: 'Faded cells are eliminated (rows above cur, columns right of cur). Teal cells are still live.',
      codeFocus: L.while,
      callStack: [
        {
          name: 'searchMatrix',
          active: true,
          locals: {
            matrix: { ref: 'matrix' },
            target,
            row,
            col,
          },
        },
      ],
      heap: [
        gridHeap(
          cells,
          staircaseHighlights(rows, cols, row, col, 'current'),
          { cur: [row, col] },
          `Analyzing r${row}, c${col}. Live: rows ≥ ${row}, cols ≤ ${col}. Eliminated: faded.`,
        ),
      ],
    })

    const cur = matrix[row]![col]!

    if (cur === target) {
      steps.push({
        id: id++,
        narrative: `Read matrix[${row}][${col}] = ${cur} - equals target.`,
        why: 'Staircase walk found the value without scanning every cell.',
        codeFocus: L.found,
        callStack: [
          {
            name: 'searchMatrix',
            active: true,
            locals: {
              matrix: { ref: 'matrix' },
              target,
              row,
              col,
              cur,
              result: true,
            },
          },
        ],
        heap: [
          gridHeap(
            cells,
            staircaseHighlights(rows, cols, row, col, 'found'),
            { cur: [row, col] },
            `Found ${target} at r${row}, c${col}`,
          ),
        ],
      })
      return steps
    }

    const tooLarge = cur > target
    steps.push({
      id: id++,
      narrative: `Read matrix[${row}][${col}] = ${cur} - ${
        tooLarge ? `too large (> ${target}).` : `too small (< ${target}).`
      }`,
      why: tooLarge
        ? 'Everything below in this column is ≥ cur, so discard the column (col--).'
        : 'Everything left in this row is ≤ cur, so discard the row (row++).',
      codeFocus: L.cur,
      callStack: [
        {
          name: 'searchMatrix',
          active: true,
          locals: {
            matrix: { ref: 'matrix' },
            target,
            row,
            col,
            cur,
          },
        },
      ],
      heap: [
        gridHeap(
          cells,
          staircaseHighlights(rows, cols, row, col, 'compare'),
          { cur: [row, col] },
          tooLarge
            ? `At r${row}, c${col}: ${cur} > ${target} → eliminate column c${col}`
            : `At r${row}, c${col}: ${cur} < ${target} → eliminate row r${row}`,
        ),
      ],
    })

    if (tooLarge) {
      col -= 1
      const inBounds = col >= 0
      steps.push({
        id: id++,
        narrative: `col-- → ${col}. Move cur left (col--). Column just left of cur is eliminated.`,
        why: 'Critical: one column gone. At most m + n moves total → O(m+n).',
        codeFocus: L.colDec,
        callStack: [
          {
            name: 'searchMatrix',
            active: true,
            locals: {
              matrix: { ref: 'matrix' },
              target,
              row,
              col,
            },
          },
        ],
        heap: [
          gridHeap(
            cells,
            inBounds
              ? staircaseHighlights(rows, cols, row, col, 'current')
              : allDiscard(rows, cols),
            inBounds ? { cur: [row, col] } : undefined,
            inBounds
              ? `Analyzing r${row}, c${col}. Live: rows ≥ ${row}, cols ≤ ${col}. Eliminated: faded.`
              : 'No columns left.',
          ),
        ],
      })
    } else {
      row += 1
      const inBounds = row < rows
      steps.push({
        id: id++,
        narrative: `row++ → ${row}. Move cur down (row++). Row just above cur is eliminated.`,
        why: 'Critical: one row gone. Never restart a binary search on a flattened index.',
        codeFocus: L.rowInc,
        callStack: [
          {
            name: 'searchMatrix',
            active: true,
            locals: {
              matrix: { ref: 'matrix' },
              target,
              row,
              col,
            },
          },
        ],
        heap: [
          gridHeap(
            cells,
            inBounds
              ? staircaseHighlights(rows, cols, row, col, 'current')
              : allDiscard(rows, cols),
            inBounds ? { cur: [row, col] } : undefined,
            inBounds
              ? `Analyzing r${row}, c${col}. Live: rows ≥ ${row}, cols ≤ ${col}. Eliminated: faded.`
              : 'No rows left.',
          ),
        ],
      })
    }
  }

  steps.push({
    id: id++,
    narrative: 'cur walked off the matrix with no match → return false.',
    why: 'Every eliminated strip was proven impossible; the target is absent.',
    codeFocus: L.miss,
    callStack: [
      {
        name: 'searchMatrix',
        active: true,
        locals: {
          matrix: { ref: 'matrix' },
          target,
          row,
          col,
          result: false,
        },
      },
    ],
    heap: [
      gridHeap(cells, allDiscard(rows, cols), undefined, `Not found: ${target}`),
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
      placeholder: '1 4 7 11; 2 5 8 12; 3 6 9 16; 10 13 14 17',
      hint: 'Up to 5×5 ints. Rows with ";" or JSON [[1,4],[2,5]].',
    },
    {
      key: 'target',
      label: 'target',
      widget: 'text',
      placeholder: '5',
    },
  ],
  defaultRaw: {
    matrix: '1 4 7 11; 2 5 8 12; 3 6 9 16; 10 13 14 17',
    target: String(defaultTarget),
  },
  parse: (raw) => {
    const matrixResult = parseIntMatrix(raw.matrix ?? '', {
      name: 'matrix',
      minRows: 0,
      maxRows: 5,
      minCols: 0,
      maxCols: 5,
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
    `matrix = [${formatIntMatrix(value.matrix)}], target = ${value.target}`,
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { matrix: '', target: '5' } },
    {
      name: 'lc-sample',
      raw: {
        matrix:
          '1 4 7 11 15; 2 5 8 12 19; 3 6 9 16 22; 10 13 14 17 24; 18 21 23 26 30',
        target: '5',
      },
    },
    {
      name: 'not-found',
      raw: {
        matrix: '1 4 7 11; 2 5 8 12; 3 6 9 16; 10 13 14 17',
        target: '20',
      },
    },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Search a 2D Matrix II default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const searchA2dMatrixIi: ProblemPack = {
  id: '0240-search-a-2d-matrix-ii',
  lcNumber: 240,
  title: 'Search a 2D Matrix II',
  pattern: 'Staircase Elimination',
  difficulty: 'Medium',
  insight:
    'Start at the top-right. If cur > target, discard the column; if cur < target, discard the row. Unlike #74, do not flatten into one binary search.',
  invariant:
    'If the target exists, it is always inside the live rectangle (rows ≥ row and cols ≤ col).',
  complexity: {
    time: 'O(m+n)',
    space: 'O(1)',
    notes: 'Each step removes one row or one column; at most m + n moves.',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Linear in m+n. Flattening and binary-searching each row is slower for dense targets.',
  ),
  walkthrough: {
    statement:
      'Given an m×n matrix where each row and each column is sorted ascending, return true if target appears. LC sample uses a 5×5 matrix; the default walk uses a 4×4 slice so the staircase stays readable.',
    keyIdea:
      'Walk a staircase from the top-right corner, eliminating one row or column per comparison.',
    approach: [
      'row = 0, col = n - 1.',
      'While in bounds: if matrix[row][col] == target, return true.',
      'If cur > target, col--; else row++. Return false if cur leaves the matrix.',
    ],
  },
}
