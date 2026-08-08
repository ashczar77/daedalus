import type { ParseResult } from './types'

export type IntValueLimits = {
  name?: string
  minVal?: number
  maxVal?: number
}

/** Parse a single integer from a text field. */
export function parseIntValue(
  raw: string,
  limits: IntValueLimits = {},
): ParseResult<number> {
  const name = limits.name ?? 'value'
  const minVal = limits.minVal ?? -999
  const maxVal = limits.maxVal ?? 999
  const trimmed = raw.trim()
  if (!/^-?\d+$/.test(trimmed)) {
    return { ok: false, errors: [`${name} must be an integer.`] }
  }
  const n = Number(trimmed)
  if (n < minVal || n > maxVal) {
    return {
      ok: false,
      errors: [`${name} must be between ${minVal} and ${maxVal} (got ${n}).`],
    }
  }
  return { ok: true, value: n }
}
