import { describe, expect, it } from 'vitest'
import { expandArgv, expandEnv, walkPaths } from './expand'
import { createShellState } from './state'

function stateWithLogs() {
  return createShellState({
    cwd: '/home/cadet',
    files: {
      home: {
        cadet: {
          logs: {
            'app.log': 'a\n',
            'access.log': 'b\n',
            'debug.log': 'c\n',
          },
          'readme.txt': 'ops\n',
        },
      },
    },
  })
}

describe('expandEnv', () => {
  it('expands $HOME, ${USER}, and $?', () => {
    const state = stateWithLogs()
    state.lastExit = 2
    expect(expandEnv(state, '$HOME')).toBe('/home/cadet')
    expect(expandEnv(state, '${USER}')).toBe('cadet')
    expect(expandEnv(state, 'exit=$?')).toBe('exit=2')
  })
})

describe('expandArgv', () => {
  it('expands basename globs', () => {
    const state = stateWithLogs()
    expect(expandArgv(state, ['ls', 'logs/*.log'])).toEqual([
      'ls',
      'logs/access.log',
      'logs/app.log',
      'logs/debug.log',
    ])
  })

  it('does not expand find -name patterns', () => {
    const state = stateWithLogs()
    expect(expandArgv(state, ['find', '.', '-name', '*.txt'])).toEqual([
      'find',
      '.',
      '-name',
      '*.txt',
    ])
  })
})

describe('walkPaths', () => {
  it('lists absolute paths under a start dir', () => {
    const state = stateWithLogs()
    const paths = walkPaths(state, '/home/cadet')
    expect(paths).toContain('/home/cadet')
    expect(paths).toContain('/home/cadet/readme.txt')
    expect(paths).toContain('/home/cadet/logs/app.log')
  })
})
