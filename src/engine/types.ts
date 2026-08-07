/**
 * Shared types for Daedalus problem packs and the step-through player.
 *
 * A problem pack is curated content: solution source in several languages,
 * a sequence of Steps that describe what the algorithm is doing, and
 * optional benchmark numbers comparing language runtimes.
 */

/** Languages we display (and later may run) for each solution. */
export type Language = 'java' | 'kotlin' | 'python'

/**
 * Visual role of an array cell in a step.
 * These map to CSS classes in ArrayViz (e.g. `is-current`).
 */
export type HighlightRole =
  | 'current'
  | 'compare'
  | 'found'
  | 'visited'
  | 'window'
  | 'discard'

/** One highlighted index inside an array scene. */
export type ArrayHighlight = {
  index: number
  role: HighlightRole
}

/** Snapshot of an array at a single step (values + optional pointers). */
export type ArrayScene = {
  type: 'array'
  values: Array<number | string>
  highlights?: ArrayHighlight[]
  /** Named pointers such as left/right/mid → index */
  pointers?: Record<string, number>
  label?: string
}

/**
 * Snapshot of a hash map (or set rendered as key → marker).
 * Used for hash-map / hash-set patterns like Two Sum.
 */
export type HashMapScene = {
  type: 'hashmap'
  entries: Array<[string | number, unknown]>
  /** Keys that should visually stand out on this step */
  focusKeys?: Array<string | number>
  label?: string
}

/**
 * Snapshot of a stack (bottom → top).
 * `topAction` highlights the most recent push/pop/peek for animation cues.
 */
export type StackScene = {
  type: 'stack'
  items: unknown[]
  topAction?: 'push' | 'pop' | 'peek' | 'mismatch'
  label?: string
}

/**
 * What to draw on the visualization stage for one step.
 * `group` lets a step show more than one structure at once
 * (e.g. array beside the hash map for Two Sum).
 */
export type Scene =
  | ArrayScene
  | HashMapScene
  | StackScene
  | { type: 'group'; children: Scene[] }

/** 1-based line numbers to highlight in each language's source. */
export type CodeFocus = Record<Language, number>

/**
 * One frame of the algorithm walkthrough.
 * Language-agnostic on purpose: a future playground can emit the same shape.
 */
export type Step = {
  id: number
  /** Plain-language explanation shown above the visualization */
  message: string
  codeFocus: CodeFocus
  /** Locals / intermediates for the variable inspector */
  variables: Record<string, unknown>
  scene: Scene
}

/** Big-O summary shown below the player. */
export type Complexity = {
  time: string
  space: string
  notes?: string
}

/**
 * Runtime samples for one language across several input sizes.
 * `n` is input size; `ms` is wall-clock milliseconds for that size.
 */
export type BenchmarkSeries = {
  language: Language
  points: Array<{ n: number; ms: number }>
}

/**
 * Cross-language runtime comparison for a problem.
 * Phase 1 values are illustrative placeholders; later phases replace them
 * with offline-measured results.
 */
export type BenchmarkData = {
  sizes: number[]
  series: BenchmarkSeries[]
  note?: string
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

/**
 * Everything needed to render one catalog entry and its player page.
 * Solution sources are imported as raw text from /algorithms.
 */
export type ProblemPack = {
  id: string
  lcNumber: number
  title: string
  pattern: string
  difficulty: Difficulty
  insight: string
  invariant: string
  complexity: Complexity
  /** Human-readable default example, e.g. nums = [2,7,11,15], target = 9 */
  inputLabel: string
  languages: Record<Language, string>
  steps: Step[]
  benchmark: BenchmarkData
}
