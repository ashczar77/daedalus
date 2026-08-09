export type Redirect = {
  kind: '>' | '>>' | '<'
  path: string
}

export type SimpleCommand = {
  argv: string[]
  redirects: Redirect[]
}

/** Split a line into pipe stages, respecting quotes. */
export function splitPipes(line: string): string[] {
  const stages: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (quote) {
      if (ch === quote) quote = null
      current += ch
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      current += ch
      continue
    }
    if (ch === '|') {
      stages.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) stages.push(current.trim())
  return stages
}

/** Tokenize a simple command and peel off redirects. */
export function parseSimple(stage: string): SimpleCommand {
  const tokens = tokenize(stage)
  const argv: string[] = []
  const redirects: Redirect[] = []
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]!
    if (tok === '>' || tok === '>>' || tok === '<') {
      const path = tokens[i + 1]
      if (!path) {
        throw new Error(`syntax error near unexpected token '${tok}'`)
      }
      redirects.push({ kind: tok, path })
      i += 1
      continue
    }
    argv.push(tok)
  }
  return { argv, redirects }
}

export function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  const flush = () => {
    if (current.length > 0 || quote !== null) {
      // quote already closed before flush in normal path
    }
    if (current !== '' || tokens.length === 0) {
      // always push non-empty; empty allowed only inside quotes handled below
    }
  }
  void flush

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!
    if (quote) {
      if (ch === quote) {
        quote = null
        continue
      }
      current += ch
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (/\s/.test(ch)) {
      if (current !== '') {
        tokens.push(current)
        current = ''
      }
      continue
    }
    // Multi-char redirect
    if (ch === '>' && input[i + 1] === '>') {
      if (current !== '') {
        tokens.push(current)
        current = ''
      }
      tokens.push('>>')
      i += 1
      continue
    }
    if (ch === '>' || ch === '<') {
      if (current !== '') {
        tokens.push(current)
        current = ''
      }
      tokens.push(ch)
      continue
    }
    current += ch
  }
  if (quote) throw new Error(`unclosed quote: ${quote}`)
  if (current !== '') tokens.push(current)
  return tokens
}
