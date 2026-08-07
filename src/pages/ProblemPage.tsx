import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CodePanel } from '../components/CodePanel'
import { PerfPanel } from '../components/PerfPanel'
import { PlayerControls } from '../components/PlayerControls'
import { VariableInspector } from '../components/VariableInspector'
import type { Language } from '../engine/types'
import { usePlayback } from '../engine/usePlayback'
import { getProblem } from '../problems/registry'
import { SceneRenderer } from '../visualizers/SceneRenderer'
import './ProblemPage.css'

export function ProblemPage() {
  const { problemId = '' } = useParams()
  const problem = getProblem(problemId)
  const [language, setLanguage] = useState<Language>('java')

  const steps = useMemo(() => problem?.steps ?? [], [problem])
  const playback = usePlayback({ steps })

  if (!problem) {
    return (
      <div className="problem problem--missing">
        <p>Problem not found.</p>
        <Link to="/">Back to catalog</Link>
      </div>
    )
  }

  const focusLine = playback.step?.codeFocus[language] ?? 1

  return (
    <div className="problem">
      <header className="problem__header">
        <Link to="/" className="problem__back">
          ← Daedalus
        </Link>
        <div className="problem__meta">
          <span>#{problem.lcNumber}</span>
          <span>{problem.pattern}</span>
          <span>{problem.difficulty}</span>
        </div>
        <h1>{problem.title}</h1>
        <p className="problem__input">{problem.inputLabel}</p>
      </header>

      <div className="problem__stage">
        <section className="problem__viz" aria-live="polite">
          <p className="problem__message">
            {playback.step?.message ?? 'No steps yet.'}
          </p>
          {playback.step ? <SceneRenderer scene={playback.step.scene} /> : null}
        </section>

        <aside className="problem__side">
          <CodePanel
            languages={problem.languages}
            language={language}
            onLanguageChange={setLanguage}
            focusLine={focusLine}
          />
          <VariableInspector variables={playback.step?.variables ?? {}} />
        </aside>
      </div>

      <PlayerControls
        index={playback.index}
        total={playback.total}
        playing={playback.playing}
        speed={playback.speed}
        atStart={playback.atStart}
        atEnd={playback.atEnd}
        onToggle={playback.toggle}
        onBack={playback.stepBack}
        onForward={playback.stepForward}
        onReset={playback.reset}
        onScrub={playback.scrub}
        onCycleSpeed={playback.cycleSpeed}
      />

      <div className="problem__below">
        <PerfPanel
          complexity={problem.complexity}
          perf={problem.perf}
          insight={problem.insight}
          invariant={problem.invariant}
        />
      </div>
    </div>
  )
}
