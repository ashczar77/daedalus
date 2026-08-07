import type { Language } from '../engine/types'
import './CodePanel.css'

type Props = {
  languages: Record<Language, string>
  language: Language
  onLanguageChange: (language: Language) => void
  /** 1-based line number from the current step's codeFocus for this language */
  focusLine: number
}

const LABELS: Record<Language, string> = {
  java: 'Java',
  kotlin: 'Kotlin',
  python: 'Python',
}

/**
 * Shows one solution language at a time and highlights the active line.
 * Switching tabs only changes which source + line mapping we display;
 * the playback step index stays the same.
 */
export function CodePanel({
  languages,
  language,
  onLanguageChange,
  focusLine,
}: Props) {
  const source = languages[language] ?? ''
  const lines = source.replace(/\n$/, '').split('\n')

  return (
    <section className="code-panel">
      <div className="code-panel__tabs" role="tablist" aria-label="Language">
        {(Object.keys(LABELS) as Language[]).map((lang) => (
          <button
            key={lang}
            type="button"
            role="tab"
            aria-selected={language === lang}
            className={`code-panel__tab${language === lang ? ' is-active' : ''}`}
            onClick={() => onLanguageChange(lang)}
          >
            {LABELS[lang]}
          </button>
        ))}
      </div>
      <pre
        className="code-panel__pre"
        aria-label={`${LABELS[language]} solution`}
      >
        <code>
          {lines.map((line, index) => {
            const lineNo = index + 1
            const focused = lineNo === focusLine
            return (
              <span
                key={lineNo}
                className={`code-panel__line${focused ? ' is-focus' : ''}`}
              >
                <span className="code-panel__gutter">{lineNo}</span>
                <span className="code-panel__text">{line || ' '}</span>
              </span>
            )
          })}
        </code>
      </pre>
    </section>
  )
}
