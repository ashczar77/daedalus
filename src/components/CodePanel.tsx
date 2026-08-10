import { useEffect, useRef, useState } from 'react'
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

const FONT_MIN = 11
const FONT_MAX = 18
const FONT_STEP = 1
const FONT_DEFAULT = 13

/**
 * Shows one solution language at a time and highlights the active line.
 * Font size is adjustable so dense solutions stay readable.
 */
export function CodePanel({
  languages,
  language,
  onLanguageChange,
  focusLine,
}: Props) {
  const source = languages[language] ?? ''
  const lines = source.replace(/\n$/, '').split('\n')
  const focusRef = useRef<HTMLSpanElement | null>(null)
  const [fontPx, setFontPx] = useState(FONT_DEFAULT)

  useEffect(() => {
    const line = focusRef.current
    const scroller = line?.closest('.code-panel__pre')
    if (!line || !(scroller instanceof HTMLElement)) return

    // Scroll only inside the code pane. scrollIntoView would move the page
    // and make the visualization jump up and down.
    const lineRect = line.getBoundingClientRect()
    const viewRect = scroller.getBoundingClientRect()
    const pad = 12
    if (lineRect.top < viewRect.top + pad) {
      scroller.scrollTop -= viewRect.top + pad - lineRect.top
    } else if (lineRect.bottom > viewRect.bottom - pad) {
      scroller.scrollTop += lineRect.bottom - (viewRect.bottom - pad)
    }
  }, [focusLine, language])

  return (
    <section
      className="code-panel"
      style={{ ['--code-font-size' as string]: `${fontPx}px` }}
    >
      <div className="code-panel__header">
        <div className="code-panel__toolbar">
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
          <div className="code-panel__font" role="group" aria-label="Code font size">
            <button
              type="button"
              className="code-panel__font-btn"
              aria-label="Decrease code font size"
              disabled={fontPx <= FONT_MIN}
              onClick={() => setFontPx((size) => Math.max(FONT_MIN, size - FONT_STEP))}
            >
              A-
            </button>
            <button
              type="button"
              className="code-panel__font-btn"
              aria-label="Increase code font size"
              disabled={fontPx >= FONT_MAX}
              onClick={() => setFontPx((size) => Math.min(FONT_MAX, size + FONT_STEP))}
            >
              A+
            </button>
          </div>
        </div>
        <p className="code-panel__now">
          Executing line <strong>{focusLine}</strong>
        </p>
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
                ref={focused ? focusRef : undefined}
                className={`code-panel__line${focused ? ' is-focus' : ''}`}
              >
                <span className="code-panel__gutter">{lineNo}</span>
                <span className="code-panel__text">{line || ' '}</span>
                {focused ? (
                  <span className="code-panel__caret" aria-hidden>
                    ▶
                  </span>
                ) : null}
              </span>
            )
          })}
        </code>
      </pre>
    </section>
  )
}
