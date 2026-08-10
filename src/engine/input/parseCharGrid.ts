import type { ParseResult } from './types'

export type CharGridLimits = {
  name?: string
  minRows?: number
  maxRows?: number
  minCols?: number
  maxCols?: number
  /** Allowed cell characters. Default: '0' and '1'. */
  alphabet?: string
}

/**
 * Parse a rectangular char grid from a text field.
 * Accepts JSON rows, semicolon/newline rows, or space-separated cells.
 *
 * Examples:
 * - [["1","1","0"],["0","1","0"]]
 * - 1 1 0; 0 1 0
 * - 110\n010
 */
export function parseCharGrid(
  raw: string,
  limits: CharGridLimits = {},
): ParseResult<string[][]> {
  const name = limits.name ?? 'grid'
  const minRows = limits.minRows ?? 0
  const maxRows = limits.maxRows ?? 4
  const minCols = limits.minCols ?? 0
  const maxCols = limits.maxCols ?? 4
  const alphabet = new Set([...(limits.alphabet ?? '01')])

  const trimmed = raw.trim()
  if (trimmed === '') {
    if (minRows === 0) return { ok: true, value: [] }
    return { ok: false, errors: [`${name} must have at least ${minRows} row(s).`] }
  }

  let rows: string[][] | null = tryParseJsonGrid(trimmed)
  if (!rows) rows = tryParseLineGrid(trimmed)
  if (!rows) {
    return {
      ok: false,
      errors: [
        `${name} format: JSON like [["1","0"]], or rows "1 0; 0 1", or "10\\n01".`,
      ],
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
    for (let c = 0; c < row.length; c++) {
      const cell = row[c]!
      if (!alphabet.has(cell)) {
        return {
          ok: false,
          errors: [
            `${name}[${r}][${c}]="${cell}" is not in {${[...alphabet].join(', ')}}.`,
          ],
        }
      }
    }
  }

  return { ok: true, value: rows }
}

export function formatCharGrid(grid: string[][]): string {
  if (grid.length === 0) return '[]'
  return grid.map((row) => row.join('')).join(' / ')
}

function tryParseJsonGrid(raw: string): string[][] | null {
  if (!raw.startsWith('[')) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed.map((row) => {
      if (!Array.isArray(row)) throw new Error('row')
      return row.map((cell) => {
        if (typeof cell === 'number') return String(cell)
        if (typeof cell === 'string') {
          if (cell.length !== 1) throw new Error('cell')
          return cell
        }
        throw new Error('cell')
      })
    })
  } catch {
    return null
  }
}

function tryParseLineGrid(raw: string): string[][] | null {
  const lines = raw
    .split(/[;\n]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  if (lines.length === 0) return null

  const rows: string[][] = []
  for (const line of lines) {
    if (/\s/.test(line)) {
      const cells = line.split(/\s+/).filter(Boolean)
      if (cells.some((cell) => cell.length !== 1)) return null
      rows.push(cells)
    } else {
      rows.push([...line])
    }
  }
  return rows
}
