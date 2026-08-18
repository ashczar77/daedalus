import { Link } from 'react-router-dom'
import './ModeSwitch.css'

export type AppMode = 'algorithms' | 'terminal' | 'system-design' | 'languages'

type Props = {
  mode: AppMode
}

const MODES: Array<{ id: AppMode; label: string; to: string }> = [
  { id: 'algorithms', label: 'Algorithms', to: '/' },
  { id: 'terminal', label: 'Terminal', to: '/terminal' },
  { id: 'system-design', label: 'System Design', to: '/system-design' },
  { id: 'languages', label: 'Languages', to: '/languages' },
]

/**
 * Quiet mode control. Text links, not a chunky tab bar.
 */
export function ModeSwitch({ mode }: Props) {
  return (
    <nav className="mode-switch" aria-label="Daedalus mode">
      {MODES.map((item, index) => (
        <span key={item.id} className="mode-switch__item">
          {index > 0 ? (
            <span className="mode-switch__sep" aria-hidden="true">
              /
            </span>
          ) : null}
          {item.id === mode ? (
            <span className="mode-switch__current" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link to={item.to} className="mode-switch__link">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
