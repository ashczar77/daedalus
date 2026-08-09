import { describe, expect, it } from 'vitest'
import { executeLine } from './execute'
import { createShellState } from './state'
import { getNode } from './vfs'

function homeState() {
  return createShellState({
    cwd: '/home/cadet',
    files: {
      home: {
        cadet: {
          'readme.txt': 'ops desk\n',
          logs: {
            'app.log': 'INFO boot\nERROR disk\nERROR timeout\nINFO ok\n',
          },
          data: {
            'users.csv': 'ada,90\ngrace,99\n',
            'names.txt': 'b\na\na\n',
          },
        },
      },
    },
    processes: [
      { pid: 1, name: 'init', status: 'running' },
      { pid: 4242, name: 'rogue', status: 'running' },
    ],
  })
}

describe('executeLine', () => {
  it('runs pwd / cd and tracks lastCommand', () => {
    const state = homeState()
    expect(executeLine(state, 'pwd').stdout).toBe('/home/cadet\n')
    expect(state.lastCommand).toBe('pwd')
    executeLine(state, 'cd logs')
    expect(state.cwd).toBe('/home/cadet/logs')
    expect(executeLine(state, 'cd ~/ntes').stderr).toMatch(/No such file/)
    expect(state.cwd).toBe('/home/cadet/logs')
  })

  it('supports redirects, append, and pipes', () => {
    const state = homeState()
    executeLine(state, 'echo hello daedalus > hello.txt')
    const file = getNode(state.root, '/home/cadet/hello.txt')
    expect(file?.kind).toBe('file')
    if (file?.kind === 'file') expect(file.content).toBe('hello daedalus\n')

    executeLine(state, 'echo more >> hello.txt')
    const appended = getNode(state.root, '/home/cadet/hello.txt')
    if (appended?.kind === 'file') {
      expect(appended.content).toBe('hello daedalus\nmore\n')
    }

    const piped = executeLine(state, 'cat logs/app.log | grep ERROR')
    expect(piped.stdout).toBe('ERROR disk\nERROR timeout\n')
  })

  it('supports globs, cut, tee, find, env, grep -v', () => {
    const state = homeState()
    expect(executeLine(state, 'ls logs/*.log').stdout).toContain('app.log')
    expect(executeLine(state, "cut -d',' -f1 data/users.csv").stdout).toBe(
      'ada\ngrace\n',
    )
    executeLine(state, 'cat logs/app.log | grep ERROR | tee errors.txt')
    const teeFile = getNode(state.root, '/home/cadet/errors.txt')
    expect(teeFile?.kind).toBe('file')
    if (teeFile?.kind === 'file') {
      expect(teeFile.content).toContain('ERROR disk')
    }
    expect(executeLine(state, "find . -name '*.txt'").stdout).toContain(
      'readme.txt',
    )
    expect(executeLine(state, 'echo $HOME').stdout).toBe('/home/cadet\n')
    expect(executeLine(state, 'env').stdout).toContain('HOME=/home/cadet')
    expect(executeLine(state, 'grep -v ERROR logs/app.log').stdout).toContain(
      'INFO boot',
    )
    expect(executeLine(state, 'grep -v ERROR logs/app.log').stdout).not.toContain(
      'ERROR disk',
    )
  })

  it('supports cp/rm/chmod/ps/kill and unknown commands', () => {
    const state = homeState()
    executeLine(state, 'cp readme.txt backup.txt')
    expect(getNode(state.root, '/home/cadet/backup.txt')?.kind).toBe('file')
    executeLine(state, 'rm backup.txt')
    expect(getNode(state.root, '/home/cadet/backup.txt')).toBeNull()

    executeLine(state, 'touch tool.sh')
    executeLine(state, 'chmod 755 tool.sh')
    const tool = getNode(state.root, '/home/cadet/tool.sh')
    expect(tool?.mode).toBe(0o755)

    expect(executeLine(state, 'ps').stdout).toContain('4242')
    executeLine(state, 'kill 4242')
    expect(state.processes.find((p) => p.pid === 4242)?.status).toBe('stopped')

    expect(executeLine(state, 'nope').exit).toBe(127)
  })

  it('sorts and uniques through a pipe', () => {
    const state = homeState()
    const result = executeLine(state, 'sort data/names.txt | uniq')
    expect(result.stdout).toBe('a\nb\n')
  })
})
