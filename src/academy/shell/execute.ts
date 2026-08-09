import {
  commands,
  grepWithFiles,
  readFileToStdout,
  writeRedirect,
  type CommandResult,
} from './commands'
import { parseSimple, splitPipes } from './parse'
import type { ShellState } from './state'
import { basename, dirname, getNode, listNames, normalizePath } from './vfs'

/**
 * Execute one shell line against the simulated VFS.
 * Supports pipes and >, >>, < redirects.
 */
export function executeLine(state: ShellState, line: string): CommandResult {
  const trimmed = line.trim()
  if (!trimmed) {
    return { stdout: '', stderr: '', exit: 0 }
  }

  state.history.push(trimmed)
  state.lastCommand = trimmed

  try {
    const stages = splitPipes(trimmed)
    let stdin = ''
    let last: CommandResult = { stdout: '', stderr: '', exit: 0 }

    for (let s = 0; s < stages.length; s++) {
      const simple = parseSimple(stages[s]!)
      const inputRedirect = simple.redirects.find((r) => r.kind === '<')
      if (inputRedirect) {
        const read = readFileToStdout(state, inputRedirect.path)
        if (read.exit !== 0) {
          last = read
          break
        }
        stdin = read.stdout
      }

      const argv = simple.argv
      if (argv.length === 0) {
        last = { stdout: '', stderr: 'syntax error: empty command\n', exit: 2 }
        break
      }

      const name = argv[0]!
      let result: CommandResult

      if (name === 'grep') {
        result = grepWithFiles(state, argv, stdin)
      } else {
        const fn = commands[name]
        if (!fn) {
          result = {
            stdout: '',
            stderr: `daedalus: command not found: ${name}\n`,
            exit: 127,
          }
        } else if (
          (name === 'wc' ||
            name === 'head' ||
            name === 'tail' ||
            name === 'sort' ||
            name === 'uniq') &&
          stdin === ''
        ) {
          const fileArg = takeFileOperand(argv)
          if (fileArg) {
            const read = readFileToStdout(state, fileArg)
            if (read.exit !== 0) {
              result = read
            } else {
              const stripped = [name, ...argv.slice(1).filter((a) => a !== fileArg)]
              result = fn(state, stripped, read.stdout)
            }
          } else {
            result = fn(state, argv, stdin)
          }
        } else {
          result = fn(state, argv, stdin)
        }
      }

      const outRedirects = simple.redirects.filter((r) => r.kind === '>' || r.kind === '>>')
      if (outRedirects.length > 0 && result.exit === 0) {
        for (const redir of outRedirects) {
          const written = writeRedirect(
            state,
            redir.path,
            result.stdout,
            redir.kind === '>>',
          )
          if (written.exit !== 0) {
            result = written
            break
          }
        }
        result = { ...result, stdout: '' }
      }

      last = result
      if (result.exit === 127 || result.exit === 2) break
      stdin = result.stdout
    }

    if (last.stdout === '__CLEAR__') {
      state.transcript = []
      last = { stdout: '', stderr: '', exit: 0 }
    }

    state.lastStdout = last.stdout
    state.lastStderr = last.stderr
    state.lastExit = last.exit
    return last
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const result = { stdout: '', stderr: message + '\n', exit: 2 }
    state.lastStdout = ''
    state.lastStderr = result.stderr
    state.lastExit = 2
    return result
  }
}

/** Last non-flag path argument, skipping values bound to -n. */
function takeFileOperand(argv: string[]): string | undefined {
  const args = argv.slice(1)
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!
    if (a === '-n') {
      i += 1
      continue
    }
    if (a.startsWith('-')) continue
    return a
  }
  return undefined
}

function resolveForComplete(state: ShellState, token: string): string {
  if (token === '~' || token.startsWith('~/')) {
    const home = state.env.HOME ?? '/home/cadet'
    return token === '~' ? home : home + token.slice(1)
  }
  return normalizePath(token || '.', state.cwd)
}

/** Tab-completion candidates for the current token. */
export function completeToken(state: ShellState, line: string): string[] {
  const parts = line.split(/\s+/)
  const token = parts[parts.length - 1] ?? ''
  if (parts.length <= 1) {
    return Object.keys(commands)
      .filter((c) => c.startsWith(token))
      .sort()
  }

  const abs = resolveForComplete(state, token || '.')
  const dirPath = token.endsWith('/') ? abs : dirname(abs)
  const prefix = token.endsWith('/') ? '' : basename(abs)
  const dir = getNode(state.root, dirPath)
  if (!dir || dir.kind !== 'dir') return []

  return listNames(dir, true)
    .filter((name) => name.startsWith(prefix === '/' ? '' : prefix))
    .map((name) => {
      const child = dir.children[name]!
      const base = token.endsWith('/')
        ? token + name
        : token.slice(0, Math.max(0, token.length - (prefix === '/' ? 0 : prefix.length))) +
          name
      return child.kind === 'dir' ? `${base}/` : base
    })
}
