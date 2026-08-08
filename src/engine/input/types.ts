import type { Step } from '../types'

/** Result of parsing raw form strings into a typed pack input. */
export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] }

/**
 * One form control. InputPanel switches on `widget` only — never on pack id.
 * Add a widget here when a future structure needs a new control type.
 */
export type InputField =
  | {
      key: string
      label: string
      widget: 'text'
      placeholder?: string
      hint?: string
      /** Show a “Sort for me” control that sorts comma-separated ints in-place. */
      sortable?: boolean
    }
  | {
      key: string
      label: string
      widget: 'select'
      options: Array<{ value: string; label: string }>
      hint?: string
    }

/**
 * Pack-agnostic custom-input contract.
 * ProblemPage / InputPanel only read this shape.
 */
export type ProblemInputSpec = {
  /** Catalog id for docs / tooling (e.g. intArray, linkedListCycle). */
  kind: string
  fields: InputField[]
  /** Initial form values keyed by field.key */
  defaultRaw: Record<string, string>
  parse: (raw: Record<string, string>) => ParseResult<unknown>
  formatLabel: (value: unknown) => string
  generateSteps: (value: unknown) => Step[]
  /**
   * Optional edge cases for validate:traces (raw form → must parse + generate).
   * Keep these small; they document graceful behavior.
   */
  fixtures?: Array<{ name: string; raw: Record<string, string> }>
}

/** Helper to define a typed spec without forcing packs to cast at every call. */
export function defineInput<T>(spec: {
  kind: string
  fields: InputField[]
  defaultRaw: Record<string, string>
  parse: (raw: Record<string, string>) => ParseResult<T>
  formatLabel: (value: T) => string
  generateSteps: (value: T) => Step[]
  fixtures?: Array<{ name: string; raw: Record<string, string> }>
}): ProblemInputSpec {
  return {
    kind: spec.kind,
    fields: spec.fields,
    defaultRaw: spec.defaultRaw,
    parse: spec.parse,
    formatLabel: (value) => spec.formatLabel(value as T),
    generateSteps: (value) => spec.generateSteps(value as T),
    fixtures: spec.fixtures,
  }
}
