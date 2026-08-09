import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { lessons, TRACK_META } from '../academy/lessons/registry'
import { isUnlocked, loadProgress, resetAllProgress } from '../academy/progress'
import type { AcademyTrack, LessonProgress } from '../academy/types'
import { ModeSwitch } from '../components/ModeSwitch'
import type { Difficulty } from '../engine/types'
import { problems } from '../problems/registry'
import './CatalogPage.css'

const DIFFICULTIES: Array<Difficulty | 'All'> = ['All', 'Easy', 'Medium', 'Hard']

/**
 * Shared Daedalus home: hero stays put; Algorithms / Terminal swap only the
 * catalog body (same shell width) with a light crossfade.
 */
export function CatalogPage() {
  const { pathname } = useLocation()
  const mode = pathname.startsWith('/terminal') ? 'terminal' : 'algorithms'

  return (
    <div className="catalog">
      <header className="catalog__hero">
        <div className="catalog__top">
          <p className="catalog__status">
            <span>DAEDALUS // OS</span>
            <span className="catalog__status-sep">·</span>
            <span>{mode === 'terminal' ? 'TERMINAL' : 'CATALOG'}</span>
            <span className="catalog__status-sep">·</span>
            <span className="catalog__status-live">
              LINK READY<span className="is-blink">_</span>
            </span>
          </p>
          <ModeSwitch mode={mode} />
        </div>
        <p className="catalog__eyebrow">
          {mode === 'terminal'
            ? 'Interactive shell academy'
            : 'Step-through algorithm lab'}
        </p>
        <h1 className="catalog__brand">Daedalus</h1>
        <p className="catalog__lede">
          {mode === 'terminal' ? (
            <>
              Learn the shell by doing — gated lessons, a simulated filesystem,
              and checks that unlock the next challenge. Includes a full jq
              track.
              <span className="is-blink catalog__caret">█</span>
            </>
          ) : (
            <>
              Watch interview patterns and sorting labs execute line by line —
              arrays, maps, pointers, and bar charts animated in sync with Java,
              Kotlin, and Python.
              <span className="is-blink catalog__caret">█</span>
            </>
          )}
        </p>
      </header>

      <div key={mode} className="catalog__stage">
        {mode === 'terminal' ? <TerminalCatalog /> : <AlgorithmsCatalog />}
      </div>
    </div>
  )
}

function AlgorithmsCatalog() {
  const [pattern, setPattern] = useState<string>('All')
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All')

  const patterns = useMemo(() => {
    const set = new Set(problems.map((problem) => problem.pattern))
    return ['All', ...[...set].sort((a, b) => a.localeCompare(b))]
  }, [])

  const filtered = useMemo(() => {
    return problems.filter((problem) => {
      if (pattern !== 'All' && problem.pattern !== pattern) return false
      if (difficulty !== 'All' && problem.difficulty !== difficulty) return false
      return true
    })
  }, [pattern, difficulty])

  return (
    <section className="catalog__list" aria-label="Problems">
      <div className="catalog__list-head">
        <h2>
          <span className="catalog__prompt">&gt;</span> Problem catalog
        </h2>
        <p>
          {filtered.length === problems.length
            ? `${problems.length} problems ready to step through`
            : `${filtered.length} of ${problems.length} problems`}
        </p>
      </div>

      <div className="catalog__filters">
        <div className="catalog__filter-row" role="group" aria-label="Filter by pattern">
          <span className="catalog__filter-label">Pattern</span>
          <div className="catalog__chips">
            {patterns.map((name) => (
              <button
                key={name}
                type="button"
                className={`catalog__chip${pattern === name ? ' is-active' : ''}`}
                aria-pressed={pattern === name}
                onClick={() => setPattern(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="catalog__filter-row" role="group" aria-label="Filter by difficulty">
          <span className="catalog__filter-label">Difficulty</span>
          <div className="catalog__chips">
            {DIFFICULTIES.map((name) => (
              <button
                key={name}
                type="button"
                className={`catalog__chip catalog__chip--diff${
                  difficulty === name ? ' is-active' : ''
                }${name !== 'All' ? ` is-${name.toLowerCase()}` : ''}`}
                aria-pressed={difficulty === name}
                onClick={() => setDifficulty(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="catalog__empty">
          No problems match these filters.{' '}
          <button
            type="button"
            className="catalog__reset"
            onClick={() => {
              setPattern('All')
              setDifficulty('All')
            }}
          >
            Clear filters
          </button>
        </p>
      ) : (
        <ul>
          {filtered.map((problem) => (
            <li key={problem.id}>
              <Link to={`/problems/${problem.id}`} className="catalog__card">
                <div className="catalog__card-top">
                  <span className="catalog__lc">
                    {problem.lcNumber > 0 ? `#${problem.lcNumber}` : 'LAB'}
                  </span>
                  <span className={`catalog__diff is-${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <h3>{problem.title}</h3>
                <p>{problem.pattern}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function TerminalCatalog() {
  const [track, setTrack] = useState<AcademyTrack | 'all'>('all')
  const [progress, setProgress] = useState<LessonProgress>(() => loadProgress(lessons))

  const filtered = useMemo(() => {
    return lessons.filter((lesson) => track === 'all' || lesson.track === track)
  }, [track])

  return (
    <section className="catalog__list" aria-label="Lessons">
      <div className="catalog__list-head">
        <h2>
          <span className="catalog__prompt">&gt;</span> Lesson catalog
        </h2>
        <p>
          {progress.completed.length} completed · {progress.unlocked.length} unlocked
        </p>
      </div>

      <div className="catalog__filters">
        <div className="catalog__filter-row" role="group" aria-label="Filter by track">
          <span className="catalog__filter-label">Track</span>
          <div className="catalog__chips">
            <button
              type="button"
              className={`catalog__chip${track === 'all' ? ' is-active' : ''}`}
              aria-pressed={track === 'all'}
              onClick={() => setTrack('all')}
            >
              All
            </button>
            {(Object.keys(TRACK_META) as AcademyTrack[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`catalog__chip${track === id ? ' is-active' : ''}`}
                aria-pressed={track === id}
                onClick={() => setTrack(id)}
              >
                {TRACK_META[id].title}
              </button>
            ))}
            <button
              type="button"
              className="catalog__text-btn"
              onClick={() => setProgress(resetAllProgress(lessons))}
            >
              Reset progress
            </button>
          </div>
        </div>
      </div>

      <ul>
        {filtered.map((lesson) => {
          const unlocked = isUnlocked(progress, lesson.id)
          const done = progress.completed.includes(lesson.id)
          return (
            <li key={lesson.id}>
              {unlocked ? (
                <Link to={`/terminal/${lesson.id}`} className="catalog__card">
                  <LessonCard lesson={lesson} done={done} locked={false} />
                </Link>
              ) : (
                <div className="catalog__card is-locked" aria-disabled="true">
                  <LessonCard lesson={lesson} done={false} locked />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function LessonCard({
  lesson,
  done,
  locked,
}: {
  lesson: (typeof lessons)[number]
  done: boolean
  locked: boolean
}) {
  return (
    <>
      <div className="catalog__card-top">
        <span className="catalog__lc">{String(lesson.order).padStart(2, '0')}</span>
        <span className="catalog__meta-row">
          <span className={`catalog__level is-${lesson.level}`}>{lesson.level}</span>
          {locked ? <span className="catalog__lock">locked</span> : null}
          {done ? <span className="catalog__done">done</span> : null}
        </span>
      </div>
      <h3>{lesson.title}</h3>
      <p>
        {TRACK_META[lesson.track].title} · {lesson.summary}
      </p>
    </>
  )
}
