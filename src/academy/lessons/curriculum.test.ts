import { describe, expect, it } from 'vitest'
import { lessons, TRACK_META } from './registry'

describe('lesson catalog integrity', () => {
  it('has unique ids and increasing orders', () => {
    const ids = lessons.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)

    for (let i = 1; i < lessons.length; i++) {
      expect(lessons[i]!.order).toBeGreaterThan(lessons[i - 1]!.order)
    }
  })

  it('only unlocks existing lessons and has a single starter', () => {
    const ids = new Set(lessons.map((l) => l.id))
    const starters = lessons.filter((l) => l.startUnlocked)
    expect(starters.map((l) => l.id)).toEqual(['fund-pwd'])

    for (const lesson of lessons) {
      expect(TRACK_META[lesson.track]).toBeDefined()
      expect(lesson.checks.length).toBeGreaterThan(0)
      expect(lesson.goals.length).toBeGreaterThan(0)
      for (const next of lesson.unlocks) {
        expect(ids.has(next)).toBe(true)
      }
    }
  })

  it('chains fundamentals → mastery → jq with progressive tools', () => {
    const byId = Object.fromEntries(lessons.map((l) => [l.id, l]))
    expect(byId['fund-append']!.unlocks).toContain('fund-grep')
    expect(byId['fund-grep']!.unlocks).toContain('fund-pipe-grep')
    expect(byId['fund-ps-kill']!.unlocks).toContain('mast-globs')
    expect(byId['mast-capstone']!.unlocks).toContain('jq-identity')
    expect(byId['jq-capstone']!.unlocks).toEqual([])
  })
})
