import type { VfsSpec } from '../types'
import { buildVfs, cloneVfs, type VfsDir } from './vfs'

export type FakeProcess = {
  pid: number
  name: string
  status: 'running' | 'stopped'
}

export type ShellState = {
  root: VfsDir
  cwd: string
  env: Record<string, string>
  history: string[]
  lastStdout: string
  lastStderr: string
  lastExit: number
  /** Last submitted command line (trimmed), for lesson checkers. */
  lastCommand: string
  processes: FakeProcess[]
  /** Lines already printed in the terminal UI (stdout/stderr history). */
  transcript: TranscriptLine[]
}

export type TranscriptLine = {
  kind: 'in' | 'out' | 'err' | 'sys'
  text: string
}

export function createShellState(setup: {
  cwd?: string
  files: VfsSpec
  processes?: FakeProcess[]
}): ShellState {
  return {
    root: buildVfs(setup.files),
    cwd: setup.cwd ?? '/home/cadet',
    env: {
      HOME: '/home/cadet',
      USER: 'cadet',
      PATH: '/bin:/usr/bin',
    },
    history: [],
    lastStdout: '',
    lastStderr: '',
    lastExit: 0,
    lastCommand: '',
    processes: (setup.processes ?? []).map((p) => ({ ...p })),
    transcript: [],
  }
}

export function cloneShellState(state: ShellState): ShellState {
  return {
    root: cloneVfs(state.root) as VfsDir,
    cwd: state.cwd,
    env: { ...state.env },
    history: [...state.history],
    lastStdout: state.lastStdout,
    lastStderr: state.lastStderr,
    lastExit: state.lastExit,
    lastCommand: state.lastCommand,
    processes: state.processes.map((p) => ({ ...p })),
    transcript: state.transcript.map((line) => ({ ...line })),
  }
}

export function promptFor(state: ShellState): string {
  const home = state.env.HOME ?? '/home/cadet'
  const short =
    state.cwd === home
      ? '~'
      : state.cwd.startsWith(home + '/')
        ? '~' + state.cwd.slice(home.length)
        : state.cwd
  return `cadet@daedalus:${short}$`
}
