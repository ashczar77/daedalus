import type { ShellState } from './state'
import { basename, getNode, listNames, normalizePath, type VfsNode } from './vfs'

/**
 * Expand $VAR / ${VAR} / $? then shell globs (* ?) in argv words.
 * Globs that match nothing are left unchanged (bash nullglob off).
 */
export function expandArgv(state: ShellState, argv: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const word = argv[i]!
    const prev = argv[i - 1]
    const envExpanded = expandEnv(state, word)
    // Keep patterns for flag operands (find -name '*.log') unexpanded.
    const skipGlob = prev === '-name' || prev === '-d' || prev === '-f'
    if (!skipGlob && /[*?]/.test(envExpanded)) {
      const matches = expandGlob(state, envExpanded)
      if (matches.length === 0) out.push(envExpanded)
      else out.push(...matches)
    } else {
      out.push(envExpanded)
    }
  }
  return out
}

export function expandEnv(state: ShellState, word: string): string {
  return word
    .replace(/\$\?/g, String(state.lastExit))
    .replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name: string) => state.env[name] ?? '')
    .replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, name: string) => state.env[name] ?? '')
}

function expandGlob(state: ShellState, pattern: string): string[] {
  const slash = pattern.lastIndexOf('/')
  const dirPart = slash >= 0 ? pattern.slice(0, slash) || '/' : '.'
  const namePat = slash >= 0 ? pattern.slice(slash + 1) : pattern
  if (/[*?]/.test(dirPart)) {
    // Only basename globs for the teaching shell.
    return []
  }

  let dirPath: string
  if (dirPart === '~' || dirPart.startsWith('~/')) {
    const home = state.env.HOME ?? '/home/cadet'
    dirPath = dirPart === '~' ? home : normalizePath(home + dirPart.slice(1), '/')
  } else {
    dirPath = normalizePath(dirPart, state.cwd)
  }

  const dir = getNode(state.root, dirPath)
  if (!dir || dir.kind !== 'dir') return []

  const re = globToRegExp(namePat)
  const names = listNames(dir, true).filter((name) => re.test(name))
  names.sort((a, b) => a.localeCompare(b))

  const prefix =
    slash < 0
      ? ''
      : pattern.slice(0, slash + 1)

  return names.map((name) => prefix + name)
}

function globToRegExp(pattern: string): RegExp {
  let body = ''
  for (const ch of pattern) {
    if (ch === '*') body += '.*'
    else if (ch === '?') body += '.'
    else if (/[.+^${}()|[\]\\]/.test(ch)) body += `\\${ch}`
    else body += ch
  }
  return new RegExp(`^${body}$`)
}

/** Absolute paths under root for find. */
export function walkPaths(
  state: ShellState,
  start: string,
): string[] {
  const abs = normalizePath(start, state.cwd)
  const node = getNode(state.root, abs)
  if (!node) return []
  const out: string[] = []

  function walk(path: string, current: VfsNode) {
    out.push(path === '' ? '/' : path)
    if (current.kind !== 'dir') return
    const names = Object.keys(current.children).sort((a, b) => a.localeCompare(b))
    for (const name of names) {
      const child = current.children[name]!
      const childPath = path === '/' ? `/${name}` : `${path}/${name}`
      walk(childPath, child)
    }
  }

  walk(abs, node)
  return out
}

export function pathMatchesName(path: string, nameGlob: string): boolean {
  return globToRegExp(nameGlob).test(basename(path))
}
