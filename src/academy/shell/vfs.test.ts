import { describe, expect, it } from 'vitest'
import {
  buildVfs,
  getNode,
  listNames,
  normalizePath,
  parseMode,
} from './vfs'

describe('normalizePath', () => {
  it('resolves . and .. against cwd', () => {
    expect(normalizePath('notes', '/home/cadet')).toBe('/home/cadet/notes')
    expect(normalizePath('..', '/home/cadet/notes')).toBe('/home/cadet')
    expect(normalizePath('../readme.txt', '/home/cadet/notes')).toBe(
      '/home/cadet/readme.txt',
    )
    expect(normalizePath('/tmp/x', '/home/cadet')).toBe('/tmp/x')
  })
})

describe('buildVfs / getNode', () => {
  it('builds nested trees and reads files', () => {
    const root = buildVfs({
      home: {
        cadet: {
          'readme.txt': 'hi\n',
          notes: { 'a.txt': 'A\n' },
        },
      },
    })
    const file = getNode(root, '/home/cadet/readme.txt')
    expect(file?.kind).toBe('file')
    if (file?.kind === 'file') expect(file.content).toBe('hi\n')

    const dir = getNode(root, '/home/cadet/notes')
    expect(dir?.kind).toBe('dir')
    if (dir?.kind === 'dir') {
      expect(listNames(dir, false)).toEqual(['a.txt'])
    }
  })
})

describe('parseMode', () => {
  it('parses octal modes', () => {
    expect(parseMode('755')).toBe(0o755)
    expect(parseMode('644')).toBe(0o644)
    expect(parseMode('bad')).toBeNull()
  })
})
