/**
 * Shared types for Daedalus problem packs and the step-through player.
 *
 * Steps tell an execution story: code focus + narrative + abstract call stack
 * and heap (Python-Tutor style). Structure animations still live on heap objects.
 */

import type { ProblemInputSpec } from './input/types'

/** Languages we display (and later may run) for each solution. */
export type Language = 'java' | 'kotlin' | 'python'

export type { ProblemInputSpec }

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
  /** Finalized region (e.g. sorted prefix/suffix in sorting demos) */
  | 'sorted'

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
  /**
   * `bars` = histogram (e.g. Container With Most Water).
   * Default / omitted = equal-size cells.
   */
  display?: 'cells' | 'bars'
  /** Area / best labels for bar-mode water overlays */
  metrics?: {
    area?: number
    best?: number
  }
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
 * Snapshot of a queue (front → back).
 * `frontAction` highlights the most recent offer/poll/peek for BFS cues.
 */
export type QueueScene = {
  type: 'queue'
  items: unknown[]
  frontAction?: 'offer' | 'poll' | 'peek'
  label?: string
}

/**
 * Snapshot of a binary heap (array order = level-order complete tree).
 * Root is peek(); used for PriorityQueue / top-k demos.
 */
export type HeapScene = {
  type: 'heap'
  items: unknown[]
  /** min-heap (default) or max-heap */
  order?: 'min' | 'max'
  rootAction?: 'offer' | 'poll' | 'peek'
  /** Highlight a specific array index (e.g. just-offered leaf). */
  focusIndex?: number
  /** Soft capacity badge (e.g. keep size ≤ k). */
  capacity?: number
  label?: string
  caption?: string
}

/**
 * Snapshot of a linked list on the heap.
 * `pointers` map names (prev/cur/fast) → node id; `cycleTo` draws a back-edge.
 */
export type LinkedListScene = {
  type: 'linkedList'
  nodes: Array<{ id: string; value: unknown; next: string | null }>
  pointers?: Record<string, string | null>
  /** Optional cycle edge from node id → node id (Floyd demos) */
  cycleTo?: [string, string]
  label?: string
  focusIds?: string[]
  /** Nodes marked for deletion / danger (solid red highlight). */
  dangerIds?: string[]
  /** Nodes unlinked from the list but still shown as a ghost (e.g. deleted nth). */
  discardIds?: string[]
  /** Emphasize a specific next-edge (fromId → toId), e.g. after a rewire. */
  linkFocus?: [string, string]
  /** Short teaching caption under the list (e.g. flip / meet) */
  caption?: string
}

/**
 * Snapshot of a binary tree. Layout is derived from parent/left/right links.
 */
export type TreeScene = {
  type: 'tree'
  nodes: Array<{
    id: string
    value: unknown
    left: string | null
    right: string | null
  }>
  rootId: string | null
  focusIds?: string[]
  label?: string
  /**
   * Teaching overlays for DFS / recursion:
   * returned depths, active formula, and null-child base cases.
   */
  viz?: TreeVizState
}

/**
 * Snapshot of a 2D char/number grid (e.g. Number of Islands).
 * `cells[r][c]` is the displayed value; highlights use flat roles per cell.
 */
export type GridScene = {
  type: 'grid'
  cells: Array<Array<string | number>>
  highlights?: Array<{ row: number; col: number; role: HighlightRole }>
  /** Optional named cursors such as scan/dfs → [row, col] */
  pointers?: Record<string, [number, number]>
  label?: string
  caption?: string
}

/** Optional drawings that make recursive returns visible on the tree. */
export type TreeVizState = {
  /** nodeId → depth already returned from that subtree (renders as d=N) */
  depths?: Record<string, number>
  /** Freeform badges under nodes, e.g. h=2, ✓, swapped */
  marks?: Record<string, string>
  /** Formula chip next to a node, e.g. 1+max(0,0)=1 */
  formula?: { nodeId: string; text: string }
  /** Ghost null child currently being evaluated */
  nullCall?: {
    parentId: string
    side: 'left' | 'right'
    /** Usually "0" or "return 0" */
    text: string
  }
}

/**
 * Legacy stage payload (still supported via normalizeStep).
 * Prefer putting structures on the heap going forward.
 */
export type Scene =
  | ArrayScene
  | HashMapScene
  | StackScene
  | QueueScene
  | HeapScene
  | LinkedListScene
  | TreeScene
  | GridScene
  | { type: 'group'; children: Scene[] }

/** 1-based line numbers to highlight in each language's source. */
export type CodeFocus = Record<Language, number>

/** Local that points at a heap object instead of storing a nested value. */
export type HeapRef = {
  ref: string
}

export type LocalValue = unknown | HeapRef

/** One frame on the abstract call stack. */
export type CallFrame = {
  /** Function / method name shown in the frame header */
  name: string
  locals: Record<string, LocalValue>
  /** True when this frame is the active execution context */
  active?: boolean
}

type HeapObjectBase = {
  id: string
  label?: string
  /** Draws attention to this object on the current beat */
  focused?: boolean
}

/** Heap-resident structures the algorithm is manipulating. */
export type HeapObject =
  | (HeapObjectBase & {
      kind: 'array'
      values: Array<number | string>
      highlights?: ArrayHighlight[]
      pointers?: Record<string, number>
      display?: 'cells' | 'bars'
      metrics?: {
        area?: number
        best?: number
      }
    })
  | (HeapObjectBase & {
      kind: 'hashmap'
      entries: Array<[string | number, unknown]>
      focusKeys?: Array<string | number>
    })
  | (HeapObjectBase & {
      kind: 'stack'
      items: unknown[]
      topAction?: 'push' | 'pop' | 'peek' | 'mismatch'
    })
  | (HeapObjectBase & {
      kind: 'queue'
      items: unknown[]
      frontAction?: 'offer' | 'poll' | 'peek'
    })
  | (HeapObjectBase & {
      kind: 'heap'
      items: unknown[]
      order?: 'min' | 'max'
      rootAction?: 'offer' | 'poll' | 'peek'
      focusIndex?: number
      capacity?: number
      caption?: string
    })
  | (HeapObjectBase & {
      kind: 'linkedList'
      nodes: Array<{ id: string; value: unknown; next: string | null }>
      pointers?: Record<string, string | null>
      cycleTo?: [string, string]
      focusIds?: string[]
      dangerIds?: string[]
      discardIds?: string[]
      linkFocus?: [string, string]
      caption?: string
    })
  | (HeapObjectBase & {
      kind: 'tree'
      nodes: Array<{
        id: string
        value: unknown
        left: string | null
        right: string | null
      }>
      rootId: string | null
      focusIds?: string[]
      viz?: TreeVizState
    })
  | (HeapObjectBase & {
      kind: 'grid'
      cells: Array<Array<string | number>>
      highlights?: Array<{ row: number; col: number; role: HighlightRole }>
      pointers?: Record<string, [number, number]>
      caption?: string
    })

/**
 * One frame of the algorithm walkthrough - a storytelling beat.
 * Language-agnostic so a future playground can emit the same shape.
 */
export type Step = {
  id: number
  /**
   * Primary story beat: what just happened.
   * Prefer `narrative`; `message` remains as a legacy alias.
   */
  narrative?: string
  message?: string
  /** Optional “why this matters” line under the narrative */
  why?: string
  codeFocus: CodeFocus
  /** Abstract call stack (top of array = deepest / active frame preferred last) */
  callStack?: CallFrame[]
  /** Abstract heap objects referenced by locals */
  heap?: HeapObject[]
  /** @deprecated Prefer callStack locals - kept for older packs */
  variables?: Record<string, unknown>
  /** @deprecated Prefer heap - kept for older packs */
  scene?: Scene
}

/** Normalized step always has narrative + callStack + heap filled in. */
export type NormalizedStep = {
  id: number
  narrative: string
  why?: string
  codeFocus: CodeFocus
  callStack: CallFrame[]
  heap: HeapObject[]
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

/** Optional below-fold teaching copy for the walkthrough section. */
export type ProblemWalkthrough = {
  /** Short problem statement shown below the player */
  statement: string
  /** One-sentence key idea */
  keyIdea: string
  /** Numbered approach bullets */
  approach: string[]
}

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
  /** Prefer for Codedive-style description / walkthrough below the player */
  walkthrough?: ProblemWalkthrough
  /**
   * Optional custom-input contract (Phase 4).
   * When set, InputPanel can regenerate `steps` from learner input.
   * Pack-agnostic: UI never branches on problem id.
   */
  input?: ProblemInputSpec
  /**
   * Trace completeness checks used by validate:traces.
   * - indices: every 0..n-1 must appear as pointers.i / current highlight
   * - twoPointers: simulate array and require every loop (left,right) state
   */
  demoCoverage?: {
    indices?: number
    twoPointers?: { array: string }
  }
}

export function isHeapRef(value: unknown): value is HeapRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ref' in value &&
    typeof (value as HeapRef).ref === 'string'
  )
}
