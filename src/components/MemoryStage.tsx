import type { NormalizedStep } from '../engine/types'
import { CallStackPanel } from './CallStackPanel'
import { HeapPanel } from './HeapPanel'
import './MemoryStage.css'

type Props = {
  step: NormalizedStep
}

/**
 * Storytelling stage: narrative beat + abstract call stack + animated heap.
 * Structure choreography (array/map/stack motion) still happens inside HeapPanel.
 */
export function MemoryStage({ step }: Props) {
  return (
    <section className="memory-stage" aria-live="polite">
      <div className="memory-stage__narrative">
        <p className="memory-stage__beat">{step.narrative}</p>
        {step.why ? <p className="memory-stage__why">{step.why}</p> : null}
      </div>
      <div className="memory-stage__panels">
        <CallStackPanel frames={step.callStack} />
        <HeapPanel objects={step.heap} />
      </div>
    </section>
  )
}
