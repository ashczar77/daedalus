export type Language = 'java' | 'kotlin' | 'python'

export type HighlightRole =
  | 'current'
  | 'compare'
  | 'found'
  | 'visited'
  | 'window'
  | 'discard'

export type ArrayHighlight = {
  index: number
  role: HighlightRole
}

export type ArrayScene = {
  type: 'array'
  values: Array<number | string>
  highlights?: ArrayHighlight[]
  pointers?: Record<string, number>
  label?: string
}

export type HashMapScene = {
  type: 'hashmap'
  entries: Array<[string | number, unknown]>
  focusKeys?: Array<string | number>
  label?: string
}

export type Scene = ArrayScene | HashMapScene | { type: 'group'; children: Scene[] }

export type CodeFocus = Record<Language, number>

export type Step = {
  id: number
  message: string
  codeFocus: CodeFocus
  variables: Record<string, unknown>
  scene: Scene
}

export type Complexity = {
  time: string
  space: string
  notes?: string
}

export type PerfSeries = {
  language: Language
  /** Wall-clock milliseconds per input size */
  points: Array<{ n: number; ms: number }>
}

export type PerfData = {
  sizes: number[]
  series: PerfSeries[]
  note?: string
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type ProblemPack = {
  id: string
  lcNumber: number
  title: string
  pattern: string
  difficulty: Difficulty
  insight: string
  invariant: string
  complexity: Complexity
  inputLabel: string
  languages: Record<Language, string>
  steps: Step[]
  perf: PerfData
}
