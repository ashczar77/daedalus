import { describe, expect, it } from 'vitest'
import { tokenizeJava } from './highlightJava'

describe('tokenizeJava', () => {
  it('colors keywords, annotations, strings, and comments', () => {
    const tokens = tokenizeJava(
      `// hi\n@RestController\npublic class App { String s = "x"; }`,
    )
    const kinds = tokens.map((t) => t.kind)
    expect(kinds).toContain('comment')
    expect(kinds).toContain('annotation')
    expect(kinds).toContain('keyword')
    expect(kinds).toContain('type')
    expect(kinds).toContain('string')
  })

  it('keeps source reconstructable', () => {
    const source = `@Service\nclass OrderService {\n  // ctor\n  public OrderService(OrderRepository repo) {}\n}`
    const rebuilt = tokenizeJava(source)
      .map((t) => t.value)
      .join('')
    expect(rebuilt).toBe(source)
  })
})
