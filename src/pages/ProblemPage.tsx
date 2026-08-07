import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlgoMetrics } from '../components/AlgoMetrics'
import { CallStackPanel } from '../components/CallStackPanel'
import { CodePanel } from '../components/CodePanel'
import { CodeRuntime } from '../components/CodeRuntime'
import { HeapInspector } from '../components/HeapInspector'
import { PlayerControls } from '../components/PlayerControls'
import { StructureStage } from '../components/StructureStage'
import { WalkthroughPanel } from '../components/WalkthroughPanel'
import { normalizeStep } from '../engine/normalizeStep'
import type { Language } from '../engine/types'
import { usePlayback } from '../engine/usePlayback'
import { getProblem } from '../problems/registry'
import './ProblemPage.css'

/**
 * Problem player: header → controls → main body (code | viz | rail) → walkthrough.
 * Layout mirrors Codedive: visualization is the centerpiece.
 */
export function ProblemPage() {
  const { problemId = '' } = useParams()
  const problem = getProblem(problemId)
  const [language, setLanguage] = useState<Language>('java')
  const [runEpoch, setRunEpoch] = useState(0)

  const steps = useMemo(() => problem?.steps ?? [], [problem])
  const playback = usePlayback({ steps })

  useEffect(() => {
    setRunEpoch((value) => value + 1)
  }, [problem?.id])

  const normalized = useMemo(
    () => (playback.step ? normalizeStep(playback.step) : null),
    [playback.step],
  )

  if (!problem) {
    return (
      <div className="problem problem--missing">
        <p>Problem not found.</p>
        <Link to="/">Back to catalog</Link>
      </div>
    )
  }

  const focusLine = normalized?.codeFocus[language] ?? 1
  const walkthrough = problem.walkthrough ?? {
    statement: problem.insight,
    keyIdea: problem.insight,
    approach: [],
  }

  const handleReset = () => {
    setRunEpoch((value) => value + 1)
    playback.reset()
  }

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
      </header>

      <PlayerControls
        index={playback.index}
        total={playback.total}
        playing={playback.playing}
        speed={playback.speed}
        atStart={playback.atStart}
        atEnd={playback.atEnd}
        beat={normalized?.narrative}
        onToggle={playback.toggle}
        onBack={playback.stepBack}
        onForward={playback.stepForward}
        onReset={handleReset}
        onScrub={playback.scrub}
        onCycleSpeed={playback.cycleSpeed}
      />

      <div className="problem__main">
        <div className="problem__code">
          <CodePanel
            languages={problem.languages}
            language={language}
            onLanguageChange={setLanguage}
            focusLine={focusLine}
          />
          <CodeRuntime
            language={language}
            benchmark={problem.benchmark}
            playing={playback.playing}
            atEnd={playback.atEnd}
            runEpoch={runEpoch}
          />
        </div>

        <div className="problem__viz">
          <StructureStage objects={normalized?.heap ?? []} />
        </div>

        <aside className="problem__rail">
          <CallStackPanel frames={normalized?.callStack ?? []} />
          <HeapInspector
            objects={normalized?.heap ?? []}
            callStack={normalized?.callStack ?? []}
          />
          <AlgoMetrics
            complexity={problem.complexity}
            pattern={problem.pattern}
          />
        </aside>
      </div>

      <div className="problem__below">
        <WalkthroughPanel
          statement={walkthrough.statement}
          inputLabel={problem.inputLabel}
          pattern={problem.pattern}
          keyIdea={walkthrough.keyIdea}
          approach={walkthrough.approach}
          insight={problem.insight}
          invariant={problem.invariant}
        />
      </div>
    </div>
  )
}
