import { tokenizeJava } from '../languages/highlightJava'

type Props = {
  code: string
  className?: string
  label?: string
}

/**
 * Colored Java snippet for Languages lessons.
 */
export function JavaCodeBlock({ code, className = '', label }: Props) {
  const tokens = tokenizeJava(code)

  return (
    <pre
      className={`java-code ${className}`.trim()}
      aria-label={label ?? 'Java code'}
    >
      <code>
        {tokens.map((token, index) =>
          token.kind === 'text' ? (
            <span key={index}>{token.value}</span>
          ) : (
            <span key={index} className={`java-code__${token.kind}`}>
              {token.value}
            </span>
          ),
        )}
      </code>
    </pre>
  )
}
