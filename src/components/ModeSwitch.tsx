import { Link } from 'react-router-dom'
import './ModeSwitch.css'

type Mode = 'algorithms' | 'terminal'

type Props = {
  mode: Mode
}

/**
 * Quiet home-mode control — text link, not a chunky tab bar.
 * Keeps Daedalus hero stable while / and /terminal swap catalog body.
 */
export function ModeSwitch({ mode }: Props) {
  if (mode === 'terminal') {
    return (
      <Link to="/" className="mode-switch" aria-label="Back to algorithm catalog">
        ← Algorithms
      </Link>
    )
  }

  return (
    <Link to="/terminal" className="mode-switch" aria-label="Open terminal academy">
      Terminal <span aria-hidden="true">›</span>
    </Link>
  )
}
