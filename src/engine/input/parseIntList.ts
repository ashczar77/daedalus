import type { ParseResult } from './types'

export type IntListLimits = {
  /** Field label used in error messages */
  name?: string
  minLen?: number
  maxLen?: number
  minVal?: number
  maxVal?: number
  /** When true, require non-decreasing order */
  requireSorted?: boolean
}

const DEFAULTS: Required<
  Pick<IntListLimits, 'minLen' | 'maxLen' | 'minVal' | 'maxVal'>
> = {
  minLen: 0,
  maxLen: 16,
  minVal: -99,
  maxVal: 99,
}

/**
 * Parse a comma/space-separated int list from a single text field.
 * Empty string → []. Rejects NaN, out-of-range, and oversize lists.
 */
export function parseIntList(
  raw: string,
  limits: IntListLimits = {},
): ParseResult<number[]> {
  const name = limits.name ?? 'array'
  const minLen = limits.minLen ?? DEFAULTS.minLen
  const maxLen = limits.maxLen ?? DEFAULTS.maxLen
  const minVal = limits.minVal ?? DEFAULTS.minVal
  const maxVal = limits.maxVal ?? DEFAULTS.maxVal

  const trimmed = raw.trim()
  if (trimmed === '') {
    if (minLen > 0) {
      return { ok: false, errors: [`${name} needs at least ${minLen} value(s).`] }
    }
    return { ok: true, value: [] }
  }

  const parts = trimmed.split(/[\s,]+/).filter(Boolean)
  if (parts.length < minLen) {
    return { ok: false, errors: [`${name} needs at least ${minLen} value(s).`] }
  }
  if (parts.length > maxLen) {
    return {
      ok: false,
      errors: [`${name} supports at most ${maxLen} values (got ${parts.length}).`],
    }
  }

  const values: number[] = []
  for (const part of parts) {
    if (!/^-?\d+$/.test(part)) {
      return { ok: false, errors: [`“${part}” is not an integer in ${name}.`] }
    }
    const n = Number(part)
    if (n < minVal || n > maxVal) {
      return {
        ok: false,
        errors: [`${name} values must be between ${minVal} and ${maxVal} (got ${n}).`],
      }
    }
    values.push(n)
  }

  if (limits.requireSorted) {
    for (let i = 1; i < values.length; i++) {
      if (values[i]! < values[i - 1]!) {
        return {
          ok: false,
          errors: [
            `${name} must be sorted non-decreasing. Use “Sort for me” or fix the order.`,
          ],
        }
      }
    }
  }

  return { ok: true, value: values }
}

/** Format ints for a text field / label. */
export function formatIntList(values: number[]): string {
  return values.join(', ')
}
