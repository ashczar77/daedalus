import type { CommandResult } from './commands'

/**
 * Teaching-scale jq subset:
 * ., .foo, .foo.bar, .["k"], .[n], .[], |, map(FILTER), select(FILTER),
 * keys, length, object ctors, comparisons in select, -r / -c flags.
 */
export function runJq(argv: string[], stdin: string): CommandResult {
  const flags = new Set(argv.filter((a) => a.startsWith('-')))
  const raw = flags.has('-r') || flags.has('--raw-output')
  const compact = flags.has('-c') || flags.has('--compact-output')
  const filter = argv.slice(1).find((a) => !a.startsWith('-')) ?? '.'

  if (!stdin.trim()) {
    return {
      stdout: '',
      stderr: 'jq: parse error: Invalid numeric literal at EOF\n',
      exit: 1,
    }
  }

  let data: unknown
  try {
    data = JSON.parse(stdin)
  } catch {
    return { stdout: '', stderr: 'jq: parse error: Invalid JSON from stdin\n', exit: 1 }
  }

  try {
    const results = evalFilter(filter.trim(), data)
    const out = results.map((value) => formatValue(value, raw, compact)).join('\n')
    return { stdout: out + (out !== '' ? '\n' : ''), stderr: '', exit: 0 }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { stdout: '', stderr: `jq: error: ${message}\n`, exit: 1 }
  }
}

function formatValue(value: unknown, raw: boolean, compact: boolean): string {
  if (raw && typeof value === 'string') return value
  if (raw && (typeof value === 'number' || typeof value === 'boolean')) return String(value)
  if (raw && value == null) return 'null'
  return compact ? JSON.stringify(value) : JSON.stringify(value, null, 2)
}

function evalFilter(filter: string, data: unknown): unknown[] {
  const stages = splitJqPipes(filter)
  let values: unknown[] = [data]
  for (const stage of stages) {
    const next: unknown[] = []
    for (const value of values) {
      next.push(...expand(evalStage(stage.trim(), value)))
    }
    values = next
  }
  return values
}

function expand(results: unknown[]): unknown[] {
  const out: unknown[] = []
  for (const r of results) {
    if (isIter(r)) out.push(...r.__iter__)
    else out.push(r)
  }
  return out
}

function isIter(value: unknown): value is { __iter__: unknown[] } {
  return Boolean(value && typeof value === 'object' && value !== null && '__iter__' in value)
}

function splitJqPipes(filter: string): string[] {
  const stages: string[] = []
  let depth = 0
  let current = ''
  for (let i = 0; i < filter.length; i++) {
    const ch = filter[i]!
    if (ch === '(' || ch === '[' || ch === '{') depth += 1
    if (ch === ')' || ch === ']' || ch === '}') depth -= 1
    if (ch === '|' && depth === 0) {
      stages.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) stages.push(current)
  return stages
}

function evalStage(stage: string, data: unknown): unknown[] {
  if (stage === '.' || stage === '') return [data]

  if (stage === 'keys') {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return [Object.keys(data as object).sort()]
    }
    if (Array.isArray(data)) return [data.map((_, i) => i)]
    throw new Error('keys only works on objects/arrays')
  }

  if (stage === 'length') {
    if (typeof data === 'string' || Array.isArray(data)) return [data.length]
    if (data && typeof data === 'object') return [Object.keys(data).length]
    throw new Error('length only works on strings/arrays/objects')
  }

  const mapMatch = /^map\(([\s\S]+)\)$/.exec(stage)
  if (mapMatch) {
    if (!Array.isArray(data)) throw new Error('map expects an array')
    return [data.flatMap((item) => evalFilter(mapMatch[1]!, item))]
  }

  const selectMatch = /^select\(([\s\S]+)\)$/.exec(stage)
  if (selectMatch) {
    return evalPredicate(selectMatch[1]!.trim(), data) ? [data] : []
  }

  if (stage.startsWith('{') && stage.endsWith('}')) {
    return [evalObjectCtor(stage, data)]
  }

  if (stage.startsWith('.')) {
    return [evalPath(stage, data)]
  }

  throw new Error(`unsupported filter: ${stage}`)
}

function evalPath(path: string, data: unknown): unknown {
  let i = 0
  let current: unknown = data
  if (path[i] === '.') i += 1
  if (i >= path.length) return current

  while (i < path.length) {
    if (path[i] === '.') {
      i += 1
      continue
    }
    if (path[i] === '[') {
      const close = path.indexOf(']', i)
      if (close < 0) throw new Error('unclosed [')
      const inside = path.slice(i + 1, close).trim()
      i = close + 1
      if (inside === '') {
        if (!Array.isArray(current)) throw new Error('.[] expects array')
        return { __iter__: current }
      }
      if (/^-?\d+$/.test(inside)) {
        if (!Array.isArray(current)) throw new Error('index on non-array')
        current = current[Number(inside)]
        continue
      }
      if (
        (inside.startsWith('"') && inside.endsWith('"')) ||
        (inside.startsWith("'") && inside.endsWith("'"))
      ) {
        const key = inside.slice(1, -1)
        if (!current || typeof current !== 'object' || Array.isArray(current)) {
          return null
        }
        current = (current as Record<string, unknown>)[key]
        continue
      }
      throw new Error(`bad index: ${inside}`)
    }

    let start = i
    while (i < path.length && /[A-Za-z0-9_]/.test(path[i]!)) i += 1
    const key = path.slice(start, i)
    if (!key) throw new Error(`bad path near: ${path.slice(i)}`)
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      current = null
    } else {
      current = (current as Record<string, unknown>)[key]
    }
  }
  return current
}

function evalObjectCtor(stage: string, data: unknown): Record<string, unknown> {
  const body = stage.slice(1, -1).trim()
  if (!body) return {}
  const out: Record<string, unknown> = {}
  for (const field of splitArgs(body)) {
    const colon = field.indexOf(':')
    if (colon < 0) throw new Error(`bad object field: ${field}`)
    const key = field.slice(0, colon).trim()
    const expr = field.slice(colon + 1).trim()
    out[key] = evalFilter(expr, data)[0] ?? null
  }
  return out
}

function splitArgs(body: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const ch of body) {
    if (ch === '(' || ch === '[' || ch === '{') depth += 1
    if (ch === ')' || ch === ']' || ch === '}') depth -= 1
    if (ch === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function evalPredicate(expr: string, data: unknown): boolean {
  const ops = ['==', '!=', '>=', '<=', '>', '<'] as const
  for (const op of ops) {
    const idx = expr.indexOf(op)
    if (idx === -1) continue
    const left = expr.slice(0, idx).trim()
    const right = expr.slice(idx + op.length).trim()
    const leftValues = evalFilter(left, data)
    const rv = parseLiteralOrPath(right, data)
    const cmp = (lv: unknown): boolean => {
      switch (op) {
        case '==':
          return lv === rv
        case '!=':
          return lv !== rv
        case '>':
          return Number(lv) > Number(rv)
        case '<':
          return Number(lv) < Number(rv)
        case '>=':
          return Number(lv) >= Number(rv)
        case '<=':
          return Number(lv) <= Number(rv)
      }
    }
    // select(.tags[] == "sale") - true if any iterated left value matches
    return leftValues.some(cmp)
  }
  return Boolean(evalFilter(expr, data)[0])
}

function parseLiteralOrPath(raw: string, data: unknown): unknown {
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (raw === 'null') return null
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1)
  }
  return evalFilter(raw, data)[0]
}
