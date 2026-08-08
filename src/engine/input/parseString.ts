import type { ParseResult } from './types'

export type StringLimits = {
  name?: string
  minLen?: number
  maxLen?: number
  /** If set, every character must be in this set */
  charset?: string
}

/** Parse a freeform string field with length / charset limits. */
export function parseString(
  raw: string,
  limits: StringLimits = {},
): ParseResult<string> {
  const name = limits.name ?? 'string'
  const minLen = limits.minLen ?? 0
  const maxLen = limits.maxLen ?? 24
  // Keep surrounding spaces only if intentional; trim ends for form UX.
  const value = raw
  if (value.length < minLen) {
    return { ok: false, errors: [`${name} needs at least ${minLen} character(s).`] }
  }
  if (value.length > maxLen) {
    return {
      ok: false,
      errors: [`${name} supports at most ${maxLen} characters (got ${value.length}).`],
    }
  }
  if (limits.charset) {
    const allowed = new Set(limits.charset.split(''))
    for (const ch of value) {
      if (!allowed.has(ch)) {
        return {
          ok: false,
          errors: [`${name} may only contain: ${limits.charset}`],
        }
      }
    }
  }
  return { ok: true, value }
}

/** Token list for RPN: comma/space separated symbols. */
export function parseTokenList(
  raw: string,
  limits: { name?: string; maxLen?: number } = {},
): ParseResult<string[]> {
  const name = limits.name ?? 'tokens'
  const maxLen = limits.maxLen ?? 16
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { ok: true, value: [] }
  }
  const parts = trimmed.split(/[\s,]+/).filter(Boolean)
  if (parts.length > maxLen) {
    return {
      ok: false,
      errors: [`${name} supports at most ${maxLen} tokens (got ${parts.length}).`],
    }
  }
  for (const part of parts) {
    if (!/^([+\-*/]|-?\d+)$/.test(part)) {
      return {
        ok: false,
        errors: [`“${part}” is not a valid RPN token (integer or + - * /).`],
      }
    }
  }
  return { ok: true, value: parts }
}
