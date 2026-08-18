import type { LanguageQuizItem } from '../types'

export type QuizAnswers = Record<string, number | number[] | boolean | undefined>

export type QuizItemResult = {
  id: string
  ok: boolean
  message: string
}

export type QuizRunResult = {
  ok: boolean
  results: QuizItemResult[]
  passed: number
  total: number
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const left = [...a].sort((x, y) => x - y)
  const right = [...b].sort((x, y) => x - y)
  return left.every((v, i) => v === right[i])
}

function gradeOne(
  item: LanguageQuizItem,
  raw: number | number[] | boolean | undefined,
): QuizItemResult {
  if (raw === undefined) {
    return { id: item.id, ok: false, message: 'No answer yet.' }
  }

  if (item.type === 'multipleChoice') {
    const ok = raw === item.answer
    return {
      id: item.id,
      ok,
      message: ok ? item.explain : `Not quite. ${item.explain}`,
    }
  }

  if (item.type === 'trueFalse') {
    const ok = raw === item.answer
    return {
      id: item.id,
      ok,
      message: ok ? item.explain : `Not quite. ${item.explain}`,
    }
  }

  const selected = Array.isArray(raw) ? raw : []
  const ok = sameSet(selected, item.answer)
  return {
    id: item.id,
    ok,
    message: ok ? item.explain : `Not quite. ${item.explain}`,
  }
}

/** Grade every quiz item; lesson completes only when all pass. */
export function runLanguageQuiz(
  quiz: LanguageQuizItem[],
  answers: QuizAnswers,
): QuizRunResult {
  const results = quiz.map((item) => gradeOne(item, answers[item.id]))
  const passed = results.filter((r) => r.ok).length
  return {
    ok: results.length > 0 && passed === results.length,
    results,
    passed,
    total: results.length,
  }
}
