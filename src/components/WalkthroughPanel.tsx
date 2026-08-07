import './WalkthroughPanel.css'

type Props = {
  statement: string
  inputLabel: string
  pattern: string
  keyIdea: string
  approach: string[]
  insight: string
  invariant: string
}

/**
 * Below-the-fold teaching copy: description + solution walkthrough.
 * Keeps prose out of the player chrome.
 */
export function WalkthroughPanel({
  statement,
  inputLabel,
  pattern,
  keyIdea,
  approach,
  insight,
  invariant,
}: Props) {
  return (
    <section className="walkthrough" aria-label="Description and walkthrough">
      <article className="walkthrough__card">
        <h2>Description</h2>
        <p>{statement}</p>
        <p className="walkthrough__input">
          <strong>Example.</strong> {inputLabel}
        </p>
      </article>

      <article className="walkthrough__card">
        <h2>Solution walkthrough</h2>
        <p className="walkthrough__pattern">
          <strong>Pattern.</strong> {pattern}
        </p>
        <p>
          <strong>Key idea.</strong> {keyIdea}
        </p>
        {approach.length > 0 ? (
          <>
            <h3>Step-by-step approach</h3>
            <ol>
              {approach.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </>
        ) : null}
        <p>
          <strong>Invariant.</strong> {invariant}
        </p>
        <p>
          <strong>Insight.</strong> {insight}
        </p>
      </article>
    </section>
  )
}
