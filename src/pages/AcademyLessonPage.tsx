import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { runChecks } from '../academy/check/runChecks'
import { getLesson, lessons } from '../academy/lessons/registry'
import {
  isUnlocked,
  loadProgress,
  markComplete,
} from '../academy/progress'
import {
  baseXp,
  hintXpCost,
  rankForScore,
  revealXpKept,
  xpForLesson,
} from '../academy/scoring'
import { createShellState, type ShellState } from '../academy/shell/state'
import type { CheckResult, LessonPack, LessonProgress } from '../academy/types'
import { ModeSwitch } from '../components/ModeSwitch'
import { Terminal } from '../components/Terminal'
import './AcademyLessonPage.css'

/**
 * Single lesson player: teaching copy + simulated shell + Check / Reset.
 * Hints are nudges; Reveal answer shows the full solution at a steep XP cost.
 */
export function AcademyLessonPage() {
  const { lessonId = '' } = useParams()
  const lesson = getLesson(lessonId)
  const [progress, setProgress] = useState<LessonProgress>(() => loadProgress(lessons))
  const [showHelp, setShowHelp] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)
  const [revealedSolution, setRevealedSolution] = useState(false)
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null)
  const [shell, setShell] = useState<ShellState | null>(null)

  const unlocked = lesson ? isUnlocked(progress, lesson.id) : false

  useEffect(() => {
    if (!lesson) return
    setShell(bootState(lesson))
    setCheckResult(null)
    setHintIndex(0)
    setRevealedSolution(false)
  }, [lesson])

  if (!lesson) {
    return <Navigate to="/terminal" replace />
  }

  if (!unlocked) {
    return (
      <div className="academy-lesson academy-lesson--locked">
        <p>This lesson is locked. Complete earlier lessons first.</p>
        <Link to="/terminal">Back to Terminal catalog</Link>
      </div>
    )
  }

  if (!shell) return null

  const done = progress.completed.includes(lesson.id)
  const nextId = lesson.unlocks[0]
  const hints = lesson.hints ?? []
  const solution = lesson.solution ?? []
  const rank = rankForScore(progress.score)
  const projectedXp = xpForLesson(lesson, {
    hintsUsed: hintIndex,
    revealedSolution,
  })
  const nextHintCost = hintXpCost(lesson, hintIndex)
  const revealKept = revealXpKept(lesson)
  const hintsRemaining = hintIndex < hints.length

  const handleCheck = () => {
    const result = runChecks(shell, lesson)
    if (result.ok) {
      const cleared = markComplete(progress, lesson, {
        hintsUsed: hintIndex,
        revealedSolution,
      })
      setProgress(cleared.progress)
      let xpNote: string
      if (cleared.alreadyComplete) {
        xpNote = ' Already cleared - no new XP.'
      } else if (revealedSolution) {
        xpNote = ` +${cleared.xpGained} XP (answer revealed) → ${cleared.progress.score} total.`
      } else if (hintIndex > 0) {
        xpNote = ` +${cleared.xpGained} XP (${hintIndex} hint${hintIndex === 1 ? '' : 's'}) → ${cleared.progress.score} total.`
      } else {
        xpNote = ` +${cleared.xpGained} XP → ${cleared.progress.score} total.`
      }
      setCheckResult({
        ...result,
        message: `${result.message}${xpNote}`,
        reward: cleared.alreadyComplete
          ? undefined
          : {
              xp: cleared.xpGained,
              score: cleared.progress.score,
              rank: rankForScore(cleared.progress.score).title,
            },
      })
    } else {
      setCheckResult(result)
    }
  }

  const handleReset = () => {
    setShell(bootState(lesson))
    setCheckResult(null)
  }

  return (
    <div className="academy-lesson">
      <header className="academy-lesson__header">
        <div className="academy-lesson__top">
          <Link to="/terminal" className="academy-lesson__back">
            ← DAEDALUS // TERMINAL
          </Link>
          <ModeSwitch mode="terminal" />
        </div>
        <p className="academy-lesson__meta">
          <span>{lesson.track}</span>
          <span>{lesson.level}</span>
          <span>up to {baseXp(lesson)} XP</span>
          <span>
            {progress.score} XP · {rank.title}
          </span>
          {done ? <span className="is-done">completed</span> : null}
        </p>
        <h1 className="academy-lesson__title">{lesson.title}</h1>
        <p className="academy-lesson__summary">{lesson.summary}</p>
      </header>

      <div className="academy-lesson__grid">
        <section className="academy-lesson__teach" aria-label="Lesson">
          {lesson.prose.map((para) => (
            <p key={para}>{para}</p>
          ))}

          <div className="academy-lesson__goals">
            <h2>Objectives</h2>
            <ul>
              {lesson.goals.map((goal) => (
                <li key={goal.id}>{goal.label}</li>
              ))}
            </ul>
          </div>

          <p className="academy-lesson__xp-live" aria-live="polite">
            Clearing now would earn <strong>{projectedXp} XP</strong>
            {hintIndex > 0 || revealedSolution ? ' (reduced)' : ''}.
          </p>

          <div className="academy-lesson__actions">
            <button type="button" className="academy-lesson__btn is-primary" onClick={handleCheck}>
              Check
            </button>
            <button type="button" className="academy-lesson__btn" onClick={handleReset}>
              Reset filesystem
            </button>
            {hintsRemaining ? (
              <button
                type="button"
                className="academy-lesson__btn"
                onClick={() => setHintIndex((i) => Math.min(hints.length, i + 1))}
              >
                Hint (−{nextHintCost} XP)
              </button>
            ) : null}
            {solution.length > 0 && !revealedSolution ? (
              <button
                type="button"
                className="academy-lesson__btn is-danger"
                onClick={() => {
                  const ok = window.confirm(
                    `Reveal the full answer? You would keep only ${revealKept} XP of ${baseXp(lesson)} if you clear after this.`,
                  )
                  if (!ok) return
                  setRevealedSolution(true)
                  setHintIndex(hints.length)
                }}
              >
                Reveal answer (keep {revealKept} XP)
              </button>
            ) : null}
            <button
              type="button"
              className="academy-lesson__btn"
              onClick={() => setShowHelp((v) => !v)}
            >
              Keyboard
            </button>
          </div>

          {hintIndex > 0 ? (
            <div className="academy-lesson__hints-block">
              <h2>Hints</h2>
              <ul className="academy-lesson__hints">
                {hints.slice(0, hintIndex).map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {revealedSolution && solution.length > 0 ? (
            <div className="academy-lesson__solution">
              <h2>Official answer</h2>
              <p className="academy-lesson__solution-note">
                XP heavily reduced. Try to clear with the least help next time.
              </p>
              <ol>
                {solution.map((cmd) => (
                  <li key={cmd}>
                    <code>{cmd}</code>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {showHelp ? (
            <div className="academy-lesson__help">
              <p>
                <strong>Enter</strong> run · <strong>↑/↓</strong> history ·{' '}
                <strong>Tab</strong> complete
              </p>
              <p>
                Supported: pipes <code>|</code>, redirects <code>&gt; &gt;&gt; &lt;</code>,
                globs, <code>$VAR</code>, find/cut/tee, and <code>jq</code>.
              </p>
              <p>
                Hints are nudges and cost XP. Reveal answer shows the full commands and
                keeps only a small consolation payout.
              </p>
            </div>
          ) : null}

          {checkResult ? (
            <p
              className={`academy-lesson__result${checkResult.ok ? ' is-ok' : ' is-bad'}`}
              role="status"
            >
              {checkResult.message}
            </p>
          ) : null}

          {done && nextId ? (
            <p className="academy-lesson__next">
              Unlocked next:{' '}
              <Link to={`/terminal/${nextId}`}>{getLesson(nextId)?.title ?? nextId}</Link>
            </p>
          ) : null}
        </section>

        <section className="academy-lesson__shell" aria-label="Shell">
          <div className="academy-lesson__shell-head">
            <span>cadet@daedalus</span>
            <span>sim shell</span>
          </div>
          <Terminal
            state={shell}
            onStateChange={(next) => {
              setShell(next)
              setCheckResult(null)
            }}
          />
        </section>
      </div>
    </div>
  )
}

function bootState(lesson: LessonPack): ShellState {
  const state = createShellState(lesson.setup)
  state.transcript.push({
    kind: 'sys',
    text: `# ${lesson.title} - type help if you get stuck`,
  })
  return state
}
