import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { completeToken, executeLine } from '../academy/shell/execute'
import {
  cloneShellState,
  promptFor,
  type ShellState,
  type TranscriptLine,
} from '../academy/shell/state'
import './Terminal.css'

type Props = {
  state: ShellState
  onStateChange: (state: ShellState) => void
  onCommand?: (line: string, state: ShellState) => void
  disabled?: boolean
}

/**
 * Interactive simulated terminal: prompt, history, tab-complete.
 */
export function Terminal({ state, onStateChange, onCommand, disabled }: Props) {
  const [input, setInput] = useState('')
  const [histIndex, setHistIndex] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [state.transcript.length])

  const pushOutput = (working: ShellState, kind: 'out' | 'err', text: string) => {
    if (!text) return
    const body = text.endsWith('\n') ? text.slice(0, -1) : text
    if (body === '' && text === '\n') {
      working.transcript.push({ kind, text: '' })
      return
    }
    for (const row of body.split('\n')) {
      working.transcript.push({ kind, text: row })
    }
  }

  const run = (line: string) => {
    if (disabled) return
    const working = cloneShellState(state)
    const prompt = promptFor(working)
    working.transcript.push({ kind: 'in', text: `${prompt} ${line}` })
    const result = executeLine(working, line)
    pushOutput(working, 'out', result.stdout)
    pushOutput(working, 'err', result.stderr)
    setInput('')
    setHistIndex(null)
    onStateChange(working)
    onCommand?.(line, working)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      run(input)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (state.history.length === 0) return
      const next =
        histIndex == null ? state.history.length - 1 : Math.max(0, histIndex - 1)
      setHistIndex(next)
      setInput(state.history[next] ?? '')
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (histIndex == null) return
      if (histIndex >= state.history.length - 1) {
        setHistIndex(null)
        setInput('')
        return
      }
      const next = histIndex + 1
      setHistIndex(next)
      setInput(state.history[next] ?? '')
      return
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      const matches = completeToken(state, input)
      if (matches.length === 1) {
        const parts = input.split(/\s+/)
        parts[parts.length - 1] = matches[0]!
        setInput(parts.join(' '))
      } else if (matches.length > 1) {
        const next = cloneShellState(state)
        next.transcript.push({ kind: 'sys', text: matches.join('  ') })
        onStateChange(next)
      }
    }
  }

  return (
    <div
      className="term"
      onClick={() => inputRef.current?.focus()}
      role="application"
      aria-label="Terminal"
    >
      <div className="term__scroll">
        {state.transcript.map((line, index) => (
          <TranscriptRow key={`${index}-${line.kind}`} line={line} />
        ))}
        <div className="term__prompt-row">
          <span className="term__prompt">{promptFor(state)}</span>
          <input
            ref={inputRef}
            className="term__input"
            value={input}
            disabled={disabled}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Shell command"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function TranscriptRow({ line }: { line: TranscriptLine }) {
  return <pre className={`term__line is-${line.kind}`}>{line.text}</pre>
}
