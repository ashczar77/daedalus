import type { CheckResult, LessonPack } from '../types'
import type { ShellState } from '../shell/state'
import { getNode, normalizePath, parseMode } from '../shell/vfs'
import type { CheckSpec } from './types'

export function runChecks(state: ShellState, lesson: LessonPack): CheckResult {
  for (let i = 0; i < lesson.checks.length; i++) {
    const check = lesson.checks[i]!
    const result = runOne(state, check)
    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
        failedGoal: lesson.goals[i]?.label ?? lesson.goals[lesson.goals.length - 1]?.label,
      }
    }
  }
  return { ok: true, message: 'All checks passed. Lesson complete.' }
}

function runOne(state: ShellState, check: CheckSpec): CheckResult {
  switch (check.type) {
    case 'cwdIs': {
      const want = normalizePath(check.path.replace(/^~/, state.env.HOME ?? '/home/cadet'), '/')
      const ok = state.cwd === want
      return {
        ok,
        message: ok
          ? 'cwd ok'
          : (check.message ?? `Expected cwd ${want}, currently ${state.cwd}`),
      }
    }
    case 'fileExists': {
      const path = resolve(state, check.path)
      const node = getNode(state.root, path)
      const ok = node != null
      return {
        ok,
        message: ok ? 'exists' : (check.message ?? `Expected file or directory at ${path}`),
      }
    }
    case 'fileMissing': {
      const path = resolve(state, check.path)
      const ok = getNode(state.root, path) == null
      return {
        ok,
        message: ok ? 'missing' : (check.message ?? `Expected ${path} to be removed`),
      }
    }
    case 'fileEquals': {
      const path = resolve(state, check.path)
      const node = getNode(state.root, path)
      if (!node || node.kind !== 'file') {
        return { ok: false, message: check.message ?? `Expected file at ${path}` }
      }
      const ok = normalizeText(node.content) === normalizeText(check.content)
      return {
        ok,
        message: ok ? 'content ok' : (check.message ?? `File ${path} does not have the expected contents`),
      }
    }
    case 'fileContains': {
      const path = resolve(state, check.path)
      const node = getNode(state.root, path)
      if (!node || node.kind !== 'file') {
        return { ok: false, message: check.message ?? `Expected file at ${path}` }
      }
      const ok = node.content.includes(check.text)
      return {
        ok,
        message: ok ? 'contains ok' : (check.message ?? `File ${path} should contain “${check.text}”`),
      }
    }
    case 'stdoutEquals': {
      const ok = normalizeText(state.lastStdout) === normalizeText(check.text)
      return {
        ok,
        message: ok
          ? 'stdout ok'
          : (check.message ?? `Last command stdout did not match.\nGot:\n${state.lastStdout}`),
      }
    }
    case 'stdoutContains': {
      const ok = state.lastStdout.includes(check.text)
      return {
        ok,
        message: ok
          ? 'stdout ok'
          : (check.message ?? `Last stdout should contain “${check.text}”`),
      }
    }
    case 'modeIs': {
      const path = resolve(state, check.path)
      const node = getNode(state.root, path)
      if (!node) return { ok: false, message: check.message ?? `Missing ${path}` }
      const want = parseMode(check.mode)
      if (want == null) return { ok: false, message: `Bad mode in lesson: ${check.mode}` }
      const ok = node.mode === want
      return {
        ok,
        message: ok
          ? 'mode ok'
          : (check.message ??
            `Expected mode ${check.mode} on ${path}, got ${node.mode.toString(8)}`),
      }
    }
    case 'processStopped': {
      const proc = state.processes.find((p) => p.pid === check.pid)
      if (!proc) return { ok: false, message: check.message ?? `No process ${check.pid}` }
      const ok = proc.status === 'stopped'
      return {
        ok,
        message: ok
          ? 'stopped'
          : (check.message ?? `Process ${check.pid} (${proc.name}) is still ${proc.status}`),
      }
    }
    case 'lastExit': {
      const ok = state.lastExit === check.code
      return {
        ok,
        message: ok
          ? 'exit ok'
          : (check.message ?? `Expected exit ${check.code}, got ${state.lastExit}`),
      }
    }
    case 'lastCommandIs': {
      const got = state.lastCommand.trim()
      const ok = got === check.command
      return {
        ok,
        message: ok
          ? 'command ok'
          : (check.message ??
            `Expected last command to be “${check.command}”${got ? `, got “${got}”` : ' (run a command first)'}`),
      }
    }
    case 'lastCommandMatches': {
      const got = state.lastCommand.trim()
      const re = new RegExp(check.pattern)
      const ok = re.test(got)
      return {
        ok,
        message: ok
          ? 'command ok'
          : (check.message ??
            `Last command “${got || '(none)'}” did not match what this lesson expects`),
      }
    }
  }
}

function resolve(state: ShellState, path: string): string {
  if (path === '~' || path.startsWith('~/')) {
    const home = state.env.HOME ?? '/home/cadet'
    return path === '~' ? home : normalizePath(home + path.slice(1), '/')
  }
  return normalizePath(path, state.cwd)
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\n$/, '')
}
