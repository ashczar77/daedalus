import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { lessons, TRACK_META } from '../academy/lessons/registry'
import { isUnlocked, loadProgress, resetAllProgress } from '../academy/progress'
import { nextRank, rankForScore } from '../academy/scoring'
import type { AcademyTrack, LessonProgress } from '../academy/types'
import { ModeSwitch, type AppMode } from '../components/ModeSwitch'
import type { Difficulty } from '../engine/types'
import { problems } from '../problems/registry'
import {
  labsForPath,
  pathTitle,
  systemDesignLabs,
  systemDesignPaths,
} from '../system-design/registry'
import {
  languageLessons,
  languagePaths,
  lessonsForPath as languageLessonsForPath,
  pathTitle as languagePathTitle,
} from '../languages/registry'
import {
  isLessonComplete,
  loadLanguageProgress,
} from '../languages/progress'
import './CatalogPage.css'

const DIFFICULTIES: Array<Difficulty | 'All'> = ['All', 'Easy', 'Medium', 'Hard']

const ALGORITHMS_FILTERS_KEY = 'daedalus.catalog.algorithms'
const SYSTEM_DESIGN_FILTERS_KEY = 'daedalus.catalog.system-design'
const TERMINAL_FILTERS_KEY = 'daedalus.catalog.terminal'
const LANGUAGES_FILTERS_KEY = 'daedalus.catalog.languages'

type AlgorithmsFilters = {
  query: string
  pattern: string
  difficulty: Difficulty | 'All'
}

function loadAlgorithmsFilters(): AlgorithmsFilters {
  const fallback: AlgorithmsFilters = {
    query: '',
    pattern: 'All',
    difficulty: 'All',
  }
  try {
    const raw = sessionStorage.getItem(ALGORITHMS_FILTERS_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<AlgorithmsFilters>
    const difficulty =
      parsed.difficulty &&
      DIFFICULTIES.includes(parsed.difficulty as Difficulty | 'All')
        ? (parsed.difficulty as Difficulty | 'All')
        : 'All'
    return {
      query: typeof parsed.query === 'string' ? parsed.query : '',
      pattern: typeof parsed.pattern === 'string' ? parsed.pattern : 'All',
      difficulty,
    }
  } catch {
    return fallback
  }
}

function saveAlgorithmsFilters(filters: AlgorithmsFilters): void {
  try {
    sessionStorage.setItem(ALGORITHMS_FILTERS_KEY, JSON.stringify(filters))
  } catch {
    // Ignore quota / private-mode failures; filters just will not persist.
  }
}

function loadSessionString(key: string, fallback: string): string {
  try {
    return sessionStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function saveSessionString(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Ignore.
  }
}

function catalogMode(pathname: string): AppMode {
  if (pathname.startsWith('/terminal')) return 'terminal'
  if (pathname.startsWith('/system-design')) return 'system-design'
  if (pathname.startsWith('/languages')) return 'languages'
  return 'algorithms'
}

/**
 * Shared Daedalus home: hero stays put; mode swaps only the catalog body
 * (same shell width) with a light crossfade.
 */
export function CatalogPage() {
  const { pathname } = useLocation()
  const mode = catalogMode(pathname)

  const statusLabel =
    mode === 'terminal'
      ? 'TERMINAL'
      : mode === 'system-design'
        ? 'SYSTEM DESIGN'
        : mode === 'languages'
          ? 'LANGUAGES'
          : 'CATALOG'

  const eyebrow =
    mode === 'terminal'
      ? 'Interactive shell academy'
      : mode === 'system-design'
        ? 'System design labs'
        : mode === 'languages'
          ? 'Java · Spring · Spring Boot'
          : 'Step-through algorithm lab'

  return (
    <div className="catalog">
      <header className="catalog__hero">
        <div className="catalog__top">
          <p className="catalog__status">
            <span>DAEDALUS // OS</span>
            <span className="catalog__status-sep">·</span>
            <span>{statusLabel}</span>
            <span className="catalog__status-sep">·</span>
            <span className="catalog__status-live">
              LINK READY<span className="is-blink">_</span>
            </span>
          </p>
          <ModeSwitch mode={mode} />
        </div>
        <p className="catalog__eyebrow">{eyebrow}</p>
        <h1 className="catalog__brand">Daedalus</h1>
        <p className="catalog__lede">
          {mode === 'terminal' ? (
            <>
              Learn the shell by doing - fundamentals, mastery drills, and jq.
              Earn XP and climb ranks as you clear gated checks.
              <span className="is-blink catalog__caret">█</span>
            </>
          ) : mode === 'system-design' ? (
            <>
              Explore distributed-systems ideas with teaching beats and live
              sims. Start with load balancing: round robin through consistent
              hashing.
              <span className="is-blink catalog__caret">█</span>
            </>
          ) : mode === 'languages' ? (
            <>
              Walk Java, Spring, and Spring Boot side by side - teaching beats,
              code panes, and quizzes. Start with the map path so the three
              layers stay distinct.
              <span className="is-blink catalog__caret">█</span>
            </>
          ) : (
            <>
              Watch interview patterns and sorting labs execute line by line -
              arrays, maps, pointers, and bar charts animated in sync with Java,
              Kotlin, and Python.
              <span className="is-blink catalog__caret">█</span>
            </>
          )}
        </p>
      </header>

      <div key={mode} className="catalog__stage">
        {mode === 'terminal' ? (
          <TerminalCatalog />
        ) : mode === 'system-design' ? (
          <SystemDesignCatalog />
        ) : mode === 'languages' ? (
          <LanguagesCatalog />
        ) : (
          <AlgorithmsCatalog />
        )}
      </div>
    </div>
  )
}

function LanguagesCatalog() {
  const [pathId, setPathId] = useState<string>(() =>
    loadSessionString(LANGUAGES_FILTERS_KEY, 'all'),
  )
  const [progress] = useState(() => loadLanguageProgress())

  useEffect(() => {
    saveSessionString(LANGUAGES_FILTERS_KEY, pathId)
  }, [pathId])

  const filtered = useMemo(() => {
    if (pathId === 'all') return languageLessons
    return languageLessonsForPath(pathId)
  }, [pathId])

  const completedCount = filtered.filter((lesson) =>
    isLessonComplete(progress, lesson.id),
  ).length

  return (
    <section className="catalog__list" aria-label="Language lessons">
      <div className="catalog__list-head">
        <h2>
          <span className="catalog__prompt">&gt;</span> Language catalog
        </h2>
        <p>
          {filtered.length === languageLessons.length
            ? `${languageLessons.length} lessons · ${completedCount} completed`
            : `${filtered.length} of ${languageLessons.length} lessons · ${completedCount} completed`}
        </p>
      </div>

      <div className="catalog__filters">
        <div className="catalog__filter-row" role="group" aria-label="Filter by path">
          <span className="catalog__filter-label">Path</span>
          <div className="catalog__chips">
            <button
              type="button"
              className={`catalog__chip${pathId === 'all' ? ' is-active' : ''}`}
              aria-pressed={pathId === 'all'}
              onClick={() => setPathId('all')}
            >
              All
            </button>
            {languagePaths.map((path) => (
              <button
                key={path.id}
                type="button"
                className={`catalog__chip${pathId === path.id ? ' is-active' : ''}`}
                aria-pressed={pathId === path.id}
                onClick={() => setPathId(path.id)}
              >
                {path.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul>
        {filtered.map((lesson) => {
          const pathLessons = languageLessonsForPath(lesson.pathId)
          const done = isLessonComplete(progress, lesson.id)
          return (
            <li key={lesson.id}>
              <Link to={`/languages/${lesson.id}`} className="catalog__card">
                <div className="catalog__card-top">
                  <span className="catalog__lc">
                    Lesson {lesson.order}/{pathLessons.length}
                  </span>
                  <span className={`catalog__level is-${lesson.level}`}>
                    {lesson.level}
                  </span>
                  {done ? (
                    <span className="catalog__level is-core">done</span>
                  ) : null}
                </div>
                <h3>{lesson.title}</h3>
                <p>
                  {languagePathTitle(lesson.pathId)} · {lesson.summary}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function SystemDesignCatalog() {
  const [pathId, setPathId] = useState<string>(() =>
    loadSessionString(SYSTEM_DESIGN_FILTERS_KEY, 'all'),
  )

  useEffect(() => {
    saveSessionString(SYSTEM_DESIGN_FILTERS_KEY, pathId)
  }, [pathId])

  const filtered = useMemo(() => {
    if (pathId === 'all') return systemDesignLabs
    return labsForPath(pathId)
  }, [pathId])

  return (
    <section className="catalog__list" aria-label="System design labs">
      <div className="catalog__list-head">
        <h2>
          <span className="catalog__prompt">&gt;</span> Lab catalog
        </h2>
        <p>
          {filtered.length === systemDesignLabs.length
            ? `${systemDesignLabs.length} labs · suggested path order`
            : `${filtered.length} of ${systemDesignLabs.length} labs`}
        </p>
      </div>

      <div className="catalog__filters">
        <div className="catalog__filter-row" role="group" aria-label="Filter by path">
          <span className="catalog__filter-label">Path</span>
          <div className="catalog__chips">
            <button
              type="button"
              className={`catalog__chip${pathId === 'all' ? ' is-active' : ''}`}
              aria-pressed={pathId === 'all'}
              onClick={() => setPathId('all')}
            >
              All
            </button>
            {systemDesignPaths.map((path) => (
              <button
                key={path.id}
                type="button"
                className={`catalog__chip${pathId === path.id ? ' is-active' : ''}`}
                aria-pressed={pathId === path.id}
                onClick={() => setPathId(path.id)}
              >
                {path.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul>
        {filtered.map((lab) => {
          const pathLabs = labsForPath(lab.pathId)
          return (
            <li key={lab.id}>
              <Link to={`/system-design/${lab.id}`} className="catalog__card">
                <div className="catalog__card-top">
                  <span className="catalog__lc">
                    Lab {lab.order}/{pathLabs.length}
                  </span>
                  <span className="catalog__level is-intro">open</span>
                </div>
                <h3>{lab.title}</h3>
                <p>
                  {pathTitle(lab.pathId)} · {lab.summary}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function AlgorithmsCatalog() {
  const [filters, setFilters] = useState<AlgorithmsFilters>(() =>
    loadAlgorithmsFilters(),
  )
  const { pattern, difficulty, query } = filters

  useEffect(() => {
    saveAlgorithmsFilters(filters)
  }, [filters])

  const setPattern = (next: string) =>
    setFilters((prev) => ({ ...prev, pattern: next }))
  const setDifficulty = (next: Difficulty | 'All') =>
    setFilters((prev) => ({ ...prev, difficulty: next }))
  const setQuery = (next: string) =>
    setFilters((prev) => ({ ...prev, query: next }))
  const clearFilters = () =>
    setFilters({ query: '', pattern: 'All', difficulty: 'All' })

  const patterns = useMemo(() => {
    const set = new Set(problems.map((problem) => problem.pattern))
    return ['All', ...[...set].sort((a, b) => a.localeCompare(b))]
  }, [])

  // Drop a persisted pattern chip if the catalog no longer has that pattern.
  useEffect(() => {
    if (pattern !== 'All' && !patterns.includes(pattern)) {
      setPattern('All')
    }
  }, [pattern, patterns])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return problems.filter((problem) => {
      if (pattern !== 'All' && problem.pattern !== pattern) return false
      if (difficulty !== 'All' && problem.difficulty !== difficulty) return false
      if (!needle) return true
      const hay = [
        problem.title,
        problem.pattern,
        problem.difficulty,
        problem.lcNumber > 0 ? String(problem.lcNumber) : '',
        problem.lcNumber > 0 ? `#${problem.lcNumber}` : '',
        problem.id,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(needle)
    })
  }, [pattern, difficulty, query])

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
        <div className="catalog__filter-row catalog__filter-row--search">
          <label className="catalog__filter-label" htmlFor="catalog-search">
            Search
          </label>
          <input
            id="catalog-search"
            type="search"
            className="catalog__search"
            placeholder="Title, pattern, or #number"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

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
            onClick={clearFilters}
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
  const [track, setTrack] = useState<AcademyTrack | 'all'>(() => {
    const saved = loadSessionString(TERMINAL_FILTERS_KEY, 'all')
    if (saved === 'all') return 'all'
    return (Object.keys(TRACK_META) as AcademyTrack[]).includes(
      saved as AcademyTrack,
    )
      ? (saved as AcademyTrack)
      : 'all'
  })
  const [progress, setProgress] = useState<LessonProgress>(() => loadProgress(lessons))

  useEffect(() => {
    saveSessionString(TERMINAL_FILTERS_KEY, track)
  }, [track])

  const filtered = useMemo(() => {
    return lessons.filter((lesson) => track === 'all' || lesson.track === track)
  }, [track])

  const rank = rankForScore(progress.score)
  const upcoming = nextRank(progress.score)
  const rankProgress = upcoming
    ? Math.min(
        100,
        Math.round(
          ((progress.score - rank.minScore) /
            Math.max(1, upcoming.minScore - rank.minScore)) *
            100,
        ),
      )
    : 100

  return (
    <section className="catalog__list" aria-label="Lessons">
      <div className="catalog__scoreboard" aria-label="Academy score">
        <div className="catalog__score-main">
          <p className="catalog__score-label">Score</p>
          <p className="catalog__score-value">{progress.score} XP</p>
          <p className="catalog__score-rank">{rank.title}</p>
        </div>
        <div className="catalog__score-meter">
          <div className="catalog__score-meter-head">
            <span>
              {progress.completed.length}/{lessons.length} lessons
            </span>
            <span>
              {upcoming
                ? `${upcoming.minScore - progress.score} XP to ${upcoming.title}`
                : 'Max rank'}
            </span>
          </div>
          <div
            className="catalog__score-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={rankProgress}
          >
            <span style={{ width: `${rankProgress}%` }} />
          </div>
        </div>
      </div>

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
              onClick={() => {
                const ok = window.confirm(
                  'Reset all Terminal Academy progress? Completed lessons will be locked again.',
                )
                if (!ok) return
                setProgress(resetAllProgress(lessons))
              }}
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
