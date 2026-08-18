import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ModeSwitch } from '../components/ModeSwitch'
import { JavaCodeBlock } from '../components/JavaCodeBlock'
import { LessonFlowGraph } from '../components/LessonFlowGraph'
import {
  isLessonComplete,
  loadLanguageProgress,
  markLessonComplete,
} from '../languages/progress'
import {
  getLanguageLesson,
  lessonsForPath,
  pathTitle,
} from '../languages/registry'
import {
  runLanguageQuiz,
  type QuizAnswers,
} from '../languages/quiz/runQuiz'
import type {
  LanguageLesson,
  LanguageQuizItem,
} from '../languages/types'
import './LanguageLessonPage.css'

/**
 * Languages lesson: teaching beats, diagrams, code panes, compare, quiz, recap.
 */
export function LanguageLessonPage() {
  const { lessonId = '' } = useParams()
  const lesson = getLanguageLesson(lessonId)

  if (!lesson) {
    return (
      <div className="lang-lesson lang-lesson--missing">
        <p>Lesson not found.</p>
        <Link to="/languages">Back to Languages</Link>
      </div>
    )
  }

  return <LessonView lesson={lesson} />
}

function LessonView({ lesson }: { lesson: LanguageLesson }) {
  const [beatIndex, setBeatIndex] = useState(0)
  const [paneId, setPaneId] = useState(lesson.codePanes?.[0]?.id ?? '')
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [quizMessage, setQuizMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState(() => loadLanguageProgress())

  const pathLessons = useMemo(
    () => lessonsForPath(lesson.pathId),
    [lesson.pathId],
  )
  const lessonIndex = pathLessons.findIndex((item) => item.id === lesson.id)
  const prevLesson = lessonIndex > 0 ? pathLessons[lessonIndex - 1] : undefined
  const nextLesson =
    lessonIndex >= 0 && lessonIndex < pathLessons.length - 1
      ? pathLessons[lessonIndex + 1]
      : undefined

  useEffect(() => {
    setBeatIndex(0)
    setPaneId(lesson.codePanes?.[0]?.id ?? '')
    setAnswers({})
    setQuizMessage(null)
  }, [lesson.id, lesson.codePanes])

  const beat = lesson.teachingSteps[beatIndex] ?? lesson.teachingSteps[0]!
  const atStart = beatIndex <= 0
  const atEnd = beatIndex >= lesson.teachingSteps.length - 1
  const activePane =
    lesson.codePanes?.find((pane) => pane.id === paneId) ?? lesson.codePanes?.[0]
  const completed = isLessonComplete(progress, lesson.id)

  const onCheck = () => {
    const result = runLanguageQuiz(lesson.quiz, answers)
    if (result.ok) {
      setProgress(markLessonComplete(progress, lesson.id))
      setQuizMessage(`Passed ${result.passed}/${result.total}. Lesson marked complete.`)
    } else {
      const firstFail = result.results.find((item) => !item.ok)
      setQuizMessage(
        `Score ${result.passed}/${result.total}. ${firstFail?.message ?? 'Keep going.'}`,
      )
    }
  }

  return (
    <div className="lang-lesson">
      <header className="lang-lesson__header">
        <div className="lang-lesson__top">
          <Link to="/languages" className="lang-lesson__back">
            ← DAEDALUS // LANGUAGES
          </Link>
          <ModeSwitch mode="languages" />
        </div>
        <div className="lang-lesson__meta">
          <span>{pathTitle(lesson.pathId)}</span>
          <span>
            Lesson {lesson.order} of {pathLessons.length}
          </span>
          <span className={`lang-lesson__level is-${lesson.level}`}>
            {lesson.level}
          </span>
          {completed ? (
            <span className="lang-lesson__done">completed</span>
          ) : null}
        </div>
        <h1>{lesson.title}</h1>
        <p className="lang-lesson__insight">{lesson.insight}</p>
        <p className="lang-lesson__focuses" aria-label="Focus areas">
          {lesson.focuses.map((focus) => (
            <span key={focus} className={`lang-lesson__focus is-${focus}`}>
              {focus}
            </span>
          ))}
        </p>
        <div className="lang-lesson__nav">
          {prevLesson ? (
            <Link to={`/languages/${prevLesson.id}`}>← {prevLesson.title}</Link>
          ) : (
            <span />
          )}
          {nextLesson ? (
            <Link to={`/languages/${nextLesson.id}`}>{nextLesson.title} →</Link>
          ) : (
            <span />
          )}
        </div>
      </header>

      <section className="lang-lesson__teach" aria-label="Teaching beats">
        <div className="lang-lesson__section-head">
          <h2>
            <span className="lang-lesson__prompt">&gt;</span> How it works
          </h2>
          <p>
            Beat {beatIndex + 1} / {lesson.teachingSteps.length}
          </p>
        </div>
        <p className="lang-lesson__narrative">{beat.narrative}</p>
        <p className="lang-lesson__why">{beat.why}</p>
        <div className="lang-lesson__controls">
          <button
            type="button"
            className="lang-lesson__btn"
            disabled={atStart}
            onClick={() => setBeatIndex((i) => Math.max(0, i - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="lang-lesson__btn"
            disabled={atEnd}
            onClick={() =>
              setBeatIndex((i) =>
                Math.min(lesson.teachingSteps.length - 1, i + 1),
              )
            }
          >
            Next
          </button>
        </div>
      </section>

      {lesson.diagrams && lesson.diagrams.length > 0 ? (
        <section className="lang-lesson__diagrams" aria-label="Diagrams">
          <div className="lang-lesson__section-head">
            <h2>
              <span className="lang-lesson__prompt">&gt;</span> Diagrams
            </h2>
            <p>Eden / Survivors, object path, and GC phases</p>
          </div>
          <div className="lang-lesson__diagram-list">
            {lesson.diagrams.map((diagram) => (
              <LessonFlowGraph key={diagram.id} diagram={diagram} />
            ))}
          </div>
        </section>
      ) : null}

      {lesson.codePanes && lesson.codePanes.length > 0 && activePane ? (
        <section className="lang-lesson__code" aria-label="Code compare">
          <div className="lang-lesson__section-head">
            <h2>
              <span className="lang-lesson__prompt">&gt;</span> Code
            </h2>
            <p>Side-by-side snippets for this lesson</p>
          </div>
          <div className="lang-lesson__tabs" role="tablist">
            {lesson.codePanes.map((pane) => (
              <button
                key={pane.id}
                type="button"
                role="tab"
                aria-selected={pane.id === activePane.id}
                className={`lang-lesson__tab${
                  pane.id === activePane.id ? ' is-active' : ''
                }`}
                onClick={() => setPaneId(pane.id)}
              >
                {pane.label}
              </button>
            ))}
          </div>
          <JavaCodeBlock
            className="lang-lesson__pre"
            code={activePane.code}
            label={`${activePane.label} Java snippet`}
          />
        </section>
      ) : null}

      {lesson.compare && lesson.compare.length > 0 ? (
        <section className="lang-lesson__compare" aria-label="Compare layers">
          <h2>
            <span className="lang-lesson__prompt">&gt;</span> Java · Spring · Boot
          </h2>
          <ul>
            {lesson.compare.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="lang-lesson__quiz" aria-label="Quiz">
        <div className="lang-lesson__section-head">
          <h2>
            <span className="lang-lesson__prompt">&gt;</span> Check yourself
          </h2>
          <p>Pass every item to mark the lesson complete</p>
        </div>
        <div className="lang-lesson__quiz-list">
          {lesson.quiz.map((item) => (
            <QuizItemView
              key={item.id}
              item={item}
              value={answers[item.id]}
              onChange={(next) =>
                setAnswers((prev) => ({ ...prev, [item.id]: next }))
              }
            />
          ))}
        </div>
        <div className="lang-lesson__controls">
          <button
            type="button"
            className="lang-lesson__btn is-accent"
            onClick={onCheck}
          >
            Check answers
          </button>
        </div>
        {quizMessage ? (
          <p className="lang-lesson__quiz-msg" role="status">
            {quizMessage}
          </p>
        ) : null}
      </section>

      <section className="lang-lesson__tradeoffs" aria-label="Tradeoffs">
        <h2>
          <span className="lang-lesson__prompt">&gt;</span> When to use
        </h2>
        <ul>
          {lesson.tradeoffs.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="lang-lesson__walk" aria-label="Walkthrough">
        <h2>
          <span className="lang-lesson__prompt">&gt;</span> Recap
        </h2>
        <p>
          <strong>Problem.</strong> {lesson.walkthrough.statement}
        </p>
        <p>
          <strong>Key idea.</strong> {lesson.walkthrough.keyIdea}
        </p>
        <ol>
          {lesson.walkthrough.approach.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}

function QuizItemView({
  item,
  value,
  onChange,
}: {
  item: LanguageQuizItem
  value: number | number[] | boolean | undefined
  onChange: (next: number | number[] | boolean) => void
}) {
  if (item.type === 'trueFalse') {
    const current = typeof value === 'boolean' ? value : undefined
    return (
      <fieldset className="lang-lesson__q">
        <legend>{item.prompt}</legend>
        <label className="lang-lesson__choice">
          <input
            type="radio"
            name={item.id}
            checked={current === true}
            onChange={() => onChange(true)}
          />
          True
        </label>
        <label className="lang-lesson__choice">
          <input
            type="radio"
            name={item.id}
            checked={current === false}
            onChange={() => onChange(false)}
          />
          False
        </label>
      </fieldset>
    )
  }

  if (item.type === 'multipleChoice') {
    const current = typeof value === 'number' ? value : undefined
    return (
      <fieldset className="lang-lesson__q">
        <legend>{item.prompt}</legend>
        {item.choices.map((choice, index) => (
          <label key={choice} className="lang-lesson__choice">
            <input
              type="radio"
              name={item.id}
              checked={current === index}
              onChange={() => onChange(index)}
            />
            {choice}
          </label>
        ))}
      </fieldset>
    )
  }

  const selected = Array.isArray(value) ? value : []
  return (
    <fieldset className="lang-lesson__q">
      <legend>{item.prompt}</legend>
      {item.choices.map((choice, index) => {
        const checked = selected.includes(index)
        return (
          <label key={choice} className="lang-lesson__choice">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => {
                if (checked) {
                  onChange(selected.filter((n) => n !== index))
                } else {
                  onChange([...selected, index])
                }
              }}
            />
            {choice}
          </label>
        )
      })}
    </fieldset>
  )
}
