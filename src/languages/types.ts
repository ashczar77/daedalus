/**
 * Languages mode: teaching walks + quizzes for Java, Spring, and Spring Boot.
 */

export type LanguageFocus = 'java' | 'spring' | 'spring-boot'

export type LanguagePath = {
  id: string
  title: string
  summary: string
  order: number
}

export type TeachingBeat = {
  narrative: string
  why: string
}

export type CodePane = {
  id: string
  label: string
  language: 'java'
  code: string
}

/** One node in a styled lesson flow graph (not ASCII). */
export type DiagramNode = {
  id: string
  label: string
  detail?: string
  /** Visual tone - matches algorithm highlight language. */
  tone?: 'default' | 'accent' | 'warn' | 'good' | 'muted' | 'window'
  /** 1-based grid placement */
  col: number
  row: number
}

export type DiagramEdge = {
  from: string
  to: string
  label?: string
}

/** Structured flow graph shown under teaching beats. */
export type LessonDiagram = {
  id: string
  title: string
  caption?: string
  columns: number
  rows: number
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

export type LanguageWalkthrough = {
  statement: string
  keyIdea: string
  approach: string[]
}

/** Single-select quiz item. */
export type MultipleChoiceQuiz = {
  id: string
  type: 'multipleChoice'
  prompt: string
  choices: string[]
  /** Index into choices. */
  answer: number
  explain: string
}

/** Multi-select quiz item (all correct indices required). */
export type MultiSelectQuiz = {
  id: string
  type: 'multiSelect'
  prompt: string
  choices: string[]
  answer: number[]
  explain: string
}

export type TrueFalseQuiz = {
  id: string
  type: 'trueFalse'
  prompt: string
  answer: boolean
  explain: string
}

export type LanguageQuizItem =
  | MultipleChoiceQuiz
  | MultiSelectQuiz
  | TrueFalseQuiz

export type LanguageLesson = {
  id: string
  title: string
  pathId: string
  order: number
  level: 'intro' | 'core' | 'advanced'
  summary: string
  insight: string
  /** Who this lesson mainly covers - drives compare callouts. */
  focuses: LanguageFocus[]
  teachingSteps: TeachingBeat[]
  codePanes?: CodePane[]
  diagrams?: LessonDiagram[]
  /** Explicit Java vs Spring vs Boot diffs. */
  compare?: string[]
  tradeoffs: string[]
  walkthrough: LanguageWalkthrough
  quiz: LanguageQuizItem[]
}

export type LanguageProgress = {
  completed: string[]
}
