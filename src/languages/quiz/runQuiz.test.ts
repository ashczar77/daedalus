import { describe, expect, it } from 'vitest'
import { runLanguageQuiz } from './runQuiz'
import type { LanguageQuizItem } from '../types'

const quiz: LanguageQuizItem[] = [
  {
    id: 'mc',
    type: 'multipleChoice',
    prompt: 'Pick B',
    choices: ['A', 'B', 'C'],
    answer: 1,
    explain: 'B is correct.',
  },
  {
    id: 'tf',
    type: 'trueFalse',
    prompt: 'True?',
    answer: true,
    explain: 'Yes.',
  },
  {
    id: 'ms',
    type: 'multiSelect',
    prompt: 'Pick 0 and 2',
    choices: ['x', 'y', 'z'],
    answer: [0, 2],
    explain: 'x and z.',
  },
]

describe('runLanguageQuiz', () => {
  it('passes when every answer is correct', () => {
    const result = runLanguageQuiz(quiz, {
      mc: 1,
      tf: true,
      ms: [2, 0],
    })
    expect(result.ok).toBe(true)
    expect(result.passed).toBe(3)
  })

  it('fails incomplete or wrong answers', () => {
    const missing = runLanguageQuiz(quiz, { mc: 1, tf: true })
    expect(missing.ok).toBe(false)

    const wrong = runLanguageQuiz(quiz, {
      mc: 0,
      tf: true,
      ms: [0, 2],
    })
    expect(wrong.ok).toBe(false)
    expect(wrong.results[0]?.ok).toBe(false)
  })
})
