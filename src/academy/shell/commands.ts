import type { ShellState } from './state'
import {
  basename,
  DEFAULT_DIR_MODE,
  DEFAULT_FILE_MODE,
  dirname,
  getNode,
  listNames,
  modeString,
  normalizePath,
  parseMode,
  type VfsFile,
} from './vfs'
import { runJq } from './jq'

export type CommandResult = {
  stdout: string
  stderr: string
  exit: number
}

export type CommandFn = (
  state: ShellState,
  argv: string[],
  stdin: string,
) => CommandResult

const ok = (stdout = '', exit = 0): CommandResult => ({
  stdout,
  stderr: '',
  exit,
})

const fail = (stderr: string, exit = 1): CommandResult => ({
  stdout: '',
  stderr,
  exit,
})

function resolve(state: ShellState, path: string): string {
  if (path === '~' || path.startsWith('~/')) {
    const home = state.env.HOME ?? '/home/cadet'
    return path === '~' ? home : home + path.slice(1)
  }
  return normalizePath(path, state.cwd)
}

export const commands: Record<string, CommandFn> = {
  help: (_state, argv) => {
    if (argv[1]) {
      return ok(helpText(argv[1]))
    }
    return ok(
      [
        'Daedalus Terminal Academy — simulated shell',
        'Commands: pwd cd ls cat echo mkdir touch cp mv rm chmod',
        '          grep wc head tail sort uniq ps kill jq clear help',
        'Pipes | and redirects > >> < are supported.',
        'Type: help <command>',
      ].join('\n'),
    )
  },

  clear: () => ok('__CLEAR__'),

  pwd: (state) => ok(state.cwd + '\n'),

  cd: (state, argv) => {
    const target = argv[1] ?? state.env.HOME ?? '/home/cadet'
    const path = resolve(state, target)
    const node = getNode(state.root, path)
    if (!node) return fail(`cd: ${target}: No such file or directory`)
    if (node.kind !== 'dir') return fail(`cd: ${target}: Not a directory`)
    state.cwd = path
    return ok()
  },

  ls: (state, argv) => {
    const flags = new Set(argv.filter((a) => a.startsWith('-')).join('').replaceAll('-', '').split(''))
    const paths = argv.filter((a) => !a.startsWith('-')).slice(1)
    const target = paths[0] ?? '.'
    const path = resolve(state, target)
    const node = getNode(state.root, path)
    if (!node) return fail(`ls: cannot access '${target}': No such file or directory`)
    if (node.kind === 'file') {
      return flags.has('l')
        ? ok(`${modeString(node)} 1 cadet cadet ${node.content.length} ${basename(path)}\n`)
        : ok(basename(path) + '\n')
    }
    const names = listNames(node, flags.has('a'))
    if (flags.has('l')) {
      const lines = names.map((name) => {
        const child = node.children[name]!
        const size = child.kind === 'file' ? child.content.length : 0
        return `${modeString(child)} 1 cadet cadet ${String(size).padStart(4)} ${name}`
      })
      return ok((lines.length ? lines.join('\n') + '\n' : ''))
    }
    return ok(names.length ? names.join('  ') + '\n' : '')
  },

  cat: (state, argv, stdin) => {
    const files = argv.slice(1).filter((a) => !a.startsWith('-'))
    if (files.length === 0) return ok(stdin)
    let out = ''
    for (const file of files) {
      const path = resolve(state, file)
      const node = getNode(state.root, path)
      if (!node) return fail(`cat: ${file}: No such file or directory`)
      if (node.kind !== 'file') return fail(`cat: ${file}: Is a directory`)
      out += node.content
    }
    return ok(out.endsWith('\n') || out === '' ? out : out + '\n')
  },

  echo: (_state, argv) => {
    const n = argv.includes('-n')
    const parts = argv.slice(1).filter((a) => a !== '-n')
    const text = parts.join(' ')
    return ok(n ? text : text + '\n')
  },

  mkdir: (state, argv) => {
    const targets = argv.slice(1).filter((a) => !a.startsWith('-'))
    if (targets.length === 0) return fail('mkdir: missing operand')
    for (const target of targets) {
      const path = resolve(state, target)
      if (getNode(state.root, path)) return fail(`mkdir: cannot create directory '${target}': File exists`)
      const parent = getNode(state.root, dirname(path))
      if (!parent || parent.kind !== 'dir') {
        return fail(`mkdir: cannot create directory '${target}': No such file or directory`)
      }
      parent.children[basename(path)] = {
        kind: 'dir',
        children: {},
        mode: DEFAULT_DIR_MODE,
      }
    }
    return ok()
  },

  touch: (state, argv) => {
    const targets = argv.slice(1)
    if (targets.length === 0) return fail('touch: missing file operand')
    for (const target of targets) {
      const path = resolve(state, target)
      const existing = getNode(state.root, path)
      if (existing) {
        if (existing.kind !== 'file') return fail(`touch: ${target}: Is a directory`)
        continue
      }
      const parent = getNode(state.root, dirname(path))
      if (!parent || parent.kind !== 'dir') {
        return fail(`touch: cannot touch '${target}': No such file or directory`)
      }
      parent.children[basename(path)] = {
        kind: 'file',
        content: '',
        mode: DEFAULT_FILE_MODE,
      }
    }
    return ok()
  },

  cp: (state, argv) => {
    const args = argv.slice(1)
    if (args.length < 2) return fail('cp: missing file operand')
    const destArg = args[args.length - 1]!
    const srcArg = args[0]!
    const srcPath = resolve(state, srcArg)
    const destPath = resolve(state, destArg)
    const src = getNode(state.root, srcPath)
    if (!src) return fail(`cp: cannot stat '${srcArg}': No such file or directory`)
    if (src.kind !== 'file') return fail('cp: omitting directory (use a file)')
    let finalPath = destPath
    const destNode = getNode(state.root, destPath)
    if (destNode?.kind === 'dir') {
      finalPath = normalizePath(basename(srcPath), destPath)
    }
    const parent = getNode(state.root, dirname(finalPath))
    if (!parent || parent.kind !== 'dir') {
      return fail(`cp: cannot create regular file '${destArg}': No such file or directory`)
    }
    parent.children[basename(finalPath)] = {
      kind: 'file',
      content: src.content,
      mode: src.mode,
    }
    return ok()
  },

  mv: (state, argv) => {
    const args = argv.slice(1)
    if (args.length < 2) return fail('mv: missing file operand')
    const srcArg = args[0]!
    const destArg = args[1]!
    const srcPath = resolve(state, srcArg)
    const destPath = resolve(state, destArg)
    const srcParent = getNode(state.root, dirname(srcPath))
    const srcName = basename(srcPath)
    if (!srcParent || srcParent.kind !== 'dir' || !srcParent.children[srcName]) {
      return fail(`mv: cannot stat '${srcArg}': No such file or directory`)
    }
    const node = srcParent.children[srcName]!
    let finalPath = destPath
    const destNode = getNode(state.root, destPath)
    if (destNode?.kind === 'dir') {
      finalPath = normalizePath(srcName, destPath)
    }
    const destParent = getNode(state.root, dirname(finalPath))
    if (!destParent || destParent.kind !== 'dir') {
      return fail(`mv: cannot move to '${destArg}': No such file or directory`)
    }
    delete srcParent.children[srcName]
    destParent.children[basename(finalPath)] = node
    return ok()
  },

  rm: (state, argv) => {
    const recursive = argv.includes('-r') || argv.includes('-rf') || argv.includes('-fr')
    const targets = argv.slice(1).filter((a) => !a.startsWith('-'))
    if (targets.length === 0) return fail('rm: missing operand')
    for (const target of targets) {
      const path = resolve(state, target)
      if (path === '/') return fail('rm: refusing to remove /')
      const parent = getNode(state.root, dirname(path))
      const name = basename(path)
      if (!parent || parent.kind !== 'dir' || !parent.children[name]) {
        return fail(`rm: cannot remove '${target}': No such file or directory`)
      }
      const node = parent.children[name]!
      if (node.kind === 'dir' && !recursive) {
        return fail(`rm: cannot remove '${target}': Is a directory`)
      }
      delete parent.children[name]
    }
    return ok()
  },

  chmod: (state, argv) => {
    const args = argv.slice(1)
    if (args.length < 2) return fail('chmod: missing operand')
    const mode = parseMode(args[0]!)
    if (mode == null) return fail(`chmod: invalid mode: '${args[0]}'`)
    for (const target of args.slice(1)) {
      const path = resolve(state, target)
      const node = getNode(state.root, path)
      if (!node) return fail(`chmod: cannot access '${target}': No such file or directory`)
      node.mode = mode
    }
    return ok()
  },

  grep: (_state, argv, stdin) => {
    const args = argv.slice(1)
    const ignoreCase = args.includes('-i')
    const pattern = args.find((a) => !a.startsWith('-'))
    if (!pattern) return fail('grep: missing pattern')
    const fileArgs = args.filter((a) => !a.startsWith('-') && a !== pattern)
    let text = stdin
    if (fileArgs.length > 0) {
      // Files handled by caller via cat-like path — here we only support stdin or one path through execute
      return fail('grep: pass file content via stdin or use: grep PAT file (see shell)')
    }
    const re = new RegExp(pattern, ignoreCase ? 'i' : undefined)
    const lines = text.split('\n')
    // Drop trailing empty from final newline for matching, keep structure
    const matched = lines.filter((line, idx) => {
      if (idx === lines.length - 1 && line === '') return false
      return re.test(line)
    })
    return matched.length ? ok(matched.join('\n') + '\n') : ok('', 1)
  },

  wc: (_state, argv, stdin) => {
    const text = stdin
    const lines = text === '' ? 0 : text.endsWith('\n') ? text.split('\n').length - 1 : text.split('\n').length
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
    const bytes = text.length
    if (argv.includes('-l')) return ok(`${lines}\n`)
    if (argv.includes('-w')) return ok(`${words}\n`)
    if (argv.includes('-c')) return ok(`${bytes}\n`)
    return ok(` ${lines} ${words} ${bytes}\n`)
  },

  head: (_state, argv, stdin) => {
    let n = 10
    const idx = argv.indexOf('-n')
    if (idx >= 0 && argv[idx + 1]) n = Number(argv[idx + 1])
    const dashN = argv.find((a) => /^-\d+$/.test(a))
    if (dashN) n = Number(dashN.slice(1))
    const lines = stdin.split('\n')
    if (stdin.endsWith('\n')) lines.pop()
    return ok(lines.slice(0, n).join('\n') + (lines.length ? '\n' : ''))
  },

  tail: (_state, argv, stdin) => {
    let n = 10
    const idx = argv.indexOf('-n')
    if (idx >= 0 && argv[idx + 1]) n = Number(argv[idx + 1])
    const dashN = argv.find((a) => /^-\d+$/.test(a))
    if (dashN) n = Number(dashN.slice(1))
    const lines = stdin.split('\n')
    if (stdin.endsWith('\n')) lines.pop()
    return ok(lines.slice(-n).join('\n') + (lines.length ? '\n' : ''))
  },

  sort: (_state, argv, stdin) => {
    const lines = stdin.split('\n')
    if (stdin.endsWith('\n')) lines.pop()
    const unique = argv.includes('-u')
    lines.sort((a, b) => a.localeCompare(b))
    const out = unique ? [...new Set(lines)] : lines
    return ok(out.length ? out.join('\n') + '\n' : '')
  },

  uniq: (_state, _argv, stdin) => {
    const lines = stdin.split('\n')
    if (stdin.endsWith('\n')) lines.pop()
    const out: string[] = []
    for (const line of lines) {
      if (out[out.length - 1] !== line) out.push(line)
    }
    return ok(out.length ? out.join('\n') + '\n' : '')
  },

  ps: (state) => {
    const header = '  PID TTY          STATUS  CMD'
    const rows = state.processes.map(
      (p) =>
        `${String(p.pid).padStart(5)} pts/0        ${p.status.padEnd(7)} ${p.name}`,
    )
    return ok([header, ...rows].join('\n') + '\n')
  },

  kill: (state, argv) => {
    const pid = Number(argv[1])
    if (!Number.isFinite(pid)) return fail('kill: usage: kill <pid>')
    const proc = state.processes.find((p) => p.pid === pid)
    if (!proc) return fail(`kill: (${pid}) - No such process`)
    proc.status = 'stopped'
    return ok()
  },

  jq: (_state, argv, stdin) => {
    return runJq(argv, stdin)
  },
}

function helpText(cmd: string): string {
  const map: Record<string, string> = {
    pwd: 'pwd — print working directory',
    cd: 'cd [dir] — change directory (~ is home)',
    ls: 'ls [-la] [path] — list directory contents',
    cat: 'cat <file> — print file contents',
    echo: 'echo [-n] args... — print arguments',
    mkdir: 'mkdir <dir> — create directory',
    touch: 'touch <file> — create empty file',
    cp: 'cp <src> <dest> — copy file',
    mv: 'mv <src> <dest> — move/rename',
    rm: 'rm [-r] <path> — remove file (or directory with -r)',
    chmod: 'chmod MODE file — set mode (e.g. 755)',
    grep: 'grep [-i] PATTERN — filter stdin lines',
    wc: 'wc [-lwc] — count lines/words/bytes from stdin',
    head: 'head [-n N] — first lines of stdin',
    tail: 'tail [-n N] — last lines of stdin',
    sort: 'sort [-u] — sort stdin lines',
    uniq: 'uniq — collapse adjacent duplicates',
    ps: 'ps — list simulated processes',
    kill: 'kill <pid> — stop a simulated process',
    jq: 'jq [flags] FILTER — filter JSON from stdin',
    clear: 'clear — clear the terminal screen',
  }
  return (map[cmd] ?? `No help for '${cmd}'`) + '\n'
}

/** Grep with optional file operands (reads from VFS). */
export function grepWithFiles(
  state: ShellState,
  argv: string[],
  stdin: string,
): CommandResult {
  const args = argv.slice(1)
  const ignoreCase = args.includes('-i')
  const nonFlags = args.filter((a) => !a.startsWith('-'))
  const pattern = nonFlags[0]
  if (!pattern) return fail('grep: missing pattern')
  const files = nonFlags.slice(1)
  const re = new RegExp(pattern, ignoreCase ? 'i' : undefined)

  if (files.length === 0) {
    const lines = stdin.split('\n')
    const matched = lines.filter((line, idx) => {
      if (idx === lines.length - 1 && line === '') return false
      return re.test(line)
    })
    return matched.length ? ok(matched.join('\n') + '\n') : ok('', 1)
  }

  let out = ''
  let any = false
  for (const file of files) {
    const path = resolve(state, file)
    const node = getNode(state.root, path)
    if (!node) return fail(`grep: ${file}: No such file or directory`)
    if (node.kind !== 'file') return fail(`grep: ${file}: Is a directory`)
    const lines = node.content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      if (i === lines.length - 1 && line === '' && node.content.endsWith('\n')) continue
      if (re.test(line)) {
        out += (files.length > 1 ? `${file}:` : '') + line + '\n'
        any = true
      }
    }
  }
  return any ? ok(out) : ok('', 1)
}

export function readFileToStdout(state: ShellState, pathArg: string): CommandResult {
  const path = resolve(state, pathArg)
  const node = getNode(state.root, path)
  if (!node) return fail(`${pathArg}: No such file or directory`)
  if (node.kind !== 'file') return fail(`${pathArg}: Is a directory`)
  const content = node.content
  return ok(content.endsWith('\n') || content === '' ? content : content + '\n')
}

export function writeRedirect(
  state: ShellState,
  pathArg: string,
  content: string,
  append: boolean,
): CommandResult {
  const path = resolve(state, pathArg)
  const parent = getNode(state.root, dirname(path))
  if (!parent || parent.kind !== 'dir') {
    return fail(`cannot write '${pathArg}': No such file or directory`)
  }
  const name = basename(path)
  const existing = parent.children[name]
  if (existing && existing.kind !== 'file') {
    return fail(`cannot write '${pathArg}': Is a directory`)
  }
  const prev = existing && existing.kind === 'file' ? existing.content : ''
  const next: VfsFile = {
    kind: 'file',
    content: append ? prev + content : content,
    mode: existing && existing.kind === 'file' ? existing.mode : DEFAULT_FILE_MODE,
  }
  parent.children[name] = next
  return ok()
}
