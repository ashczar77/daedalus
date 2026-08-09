import { describe, expect, it } from 'vitest'
import { runJq } from './jq'

describe('runJq', () => {
  const users = JSON.stringify({
    users: [
      { name: 'ada', score: 98 },
      { name: 'linus', score: 87 },
    ],
  })

  it('pretty-prints identity', () => {
    const result = runJq(['jq', '.'], '{"text":"phosphor"}\n')
    expect(result.exit).toBe(0)
    expect(result.stdout).toContain('"text"')
    expect(result.stdout).toContain('phosphor')
  })

  it('selects fields with -r', () => {
    const result = runJq(['jq', '-r', '.text'], '{"text":"phosphor"}\n')
    expect(result.stdout).toBe('phosphor\n')
  })

  it('maps and selects', () => {
    const mapped = runJq(['jq', '-c', '.users | map(.name)'], users)
    expect(mapped.stdout).toContain('ada')
    expect(mapped.stdout).toContain('linus')

    const selected = runJq(
      ['jq', '-r', '.users[] | select(.score > 90) | .name'],
      users,
    )
    expect(selected.stdout).toBe('ada\n')
  })

  it('filters sale tags in arrays', () => {
    const items = JSON.stringify([
      { sku: 'a1', tags: ['new'] },
      { sku: 'b2', tags: ['sale'] },
      { sku: 'c3', tags: ['new', 'sale'] },
    ])
    const result = runJq(
      ['jq', '-r', '.[] | select(.tags[] == "sale") | .sku'],
      items,
    )
    expect(result.stdout).toBe('b2\nc3\n')
  })
})
