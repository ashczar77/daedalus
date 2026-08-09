import { describe, expect, it } from 'vitest'
import { parseSimple, splitPipes, tokenize } from './parse'

describe('tokenize', () => {
  it('splits on whitespace and keeps quoted phrases', () => {
    expect(tokenize('echo hello world')).toEqual(['echo', 'hello', 'world'])
    expect(tokenize('cat "my notes.txt"')).toEqual(['cat', 'my notes.txt'])
    expect(tokenize("echo ok > 'my notes.txt'")).toEqual([
      'echo',
      'ok',
      '>',
      'my notes.txt',
    ])
  })

  it('recognizes >> as one token', () => {
    expect(tokenize('echo a >> f')).toEqual(['echo', 'a', '>>', 'f'])
  })

  it('throws on unclosed quotes', () => {
    expect(() => tokenize('echo "oops')).toThrow(/unclosed quote/)
  })
})

describe('splitPipes', () => {
  it('splits stages while ignoring pipes inside quotes', () => {
    expect(splitPipes('cat a | grep x | wc -l')).toEqual([
      'cat a',
      'grep x',
      'wc -l',
    ])
    expect(splitPipes('echo "a|b" | cat')).toEqual(['echo "a|b"', 'cat'])
  })
})

describe('parseSimple', () => {
  it('peels redirects from argv', () => {
    expect(parseSimple('echo hi > out.txt')).toEqual({
      argv: ['echo', 'hi'],
      redirects: [{ kind: '>', path: 'out.txt' }],
    })
    expect(parseSimple('cat < in.txt')).toEqual({
      argv: ['cat'],
      redirects: [{ kind: '<', path: 'in.txt' }],
    })
    expect(parseSimple('echo x >> log')).toEqual({
      argv: ['echo', 'x'],
      redirects: [{ kind: '>>', path: 'log' }],
    })
  })
})
