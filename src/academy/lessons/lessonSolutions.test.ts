/**
 * Integration: scripted solutions for every Academy lesson must pass Check.
 */
import { describe, expect, it } from 'vitest'
import { runChecks } from '../check/runChecks'
import { executeLine } from '../shell/execute'
import { createShellState } from '../shell/state'
import { getLesson, lessons } from './registry'

/** Known-good command sequences that clear each lesson's checks. */
const SOLUTIONS: Record<string, string[]> = {
  'fund-pwd': ['pwd'],
  'fund-ls': ['ls'],
  'fund-cd': ['cd notes'],
  'fund-cat': ['cat notes/todo.txt'],
  'fund-hidden': ['ls -a'],
  'fund-mkdir-mv': ['mkdir archive', 'mv readme.txt archive/'],
  'fund-echo-redir': ['echo hello daedalus > hello.txt'],
  'fund-append': ['echo more text >> hello.txt'],
  'fund-grep': ['grep ERROR logs/app.log'],
  'fund-pipe-grep': ['cat logs/app.log | grep ERROR'],
  'mast-grep-i': ['grep -i error logs/mixed.log'],
  'mast-review-nav': ['cd ..', 'pwd'],
  'mast-review-text': ['cat logs/app.log | grep ERROR | wc -l'],
  'mast-compose': ['mkdir out', 'echo ready > out/status.txt', 'ls out'],
  'fund-wc': ['wc -l logs/access.log'],
  'fund-sort-uniq': ['sort data/names.txt | uniq'],
  'fund-head-tail': ['tail -n 2 logs/app.log'],
  'fund-chmod': ['chmod 755 tool.sh'],
  'fund-ps-kill': ['kill 4242'],
  'mast-globs': ['ls logs/*.log'],
  'mast-cp-rm': ['cp readme.txt backup.txt', 'rm temp.bak'],
  'mast-grep-flags': ['grep -v ERROR logs/app.log'],
  'mast-head-contrast': ['head -n 1 logs/access.log'],
  'mast-find': ["find . -name '*.txt'"],
  'mast-find-pipe': ['find logs | grep app'],
  'mast-cut': ["cut -d',' -f1 data/users.csv"],
  'mast-tee': ['cat logs/app.log | grep ERROR | tee errors.txt'],
  'mast-env': ['echo $HOME'],
  'mast-quoting': ['echo ok > "my notes.txt"', 'cat "my notes.txt"'],
  'mast-paths': ['cd ..'],
  'mast-capstone': [
    'mkdir reports',
    'grep ERROR logs/app.log > reports/errors.txt',
    'wc -l reports/errors.txt',
  ],
  'jq-identity': ['cat data/message.json | jq .'],
  'jq-field': ['cat data/message.json | jq -r .text'],
  'jq-index': ['cat data/users.json | jq -r .users[0].name'],
  'jq-map': ['cat data/users.json | jq -c ".users | map(.name)"'],
  'jq-select': [
    'cat data/users.json | jq -r ".users[] | select(.score > 90) | .name"',
  ],
  'jq-keys': ['cat data/users.json | jq keys'],
  'jq-reshape': [
    'cat data/items.json | jq -c "map({sku: .sku, price: .price})"',
  ],
  'jq-capstone': [
    `cat data/items.json | jq -r '.[] | select(.tags[] == "sale") | .sku'`,
  ],
}

describe('lesson solutions (integration)', () => {
  it('has a scripted solution for every lesson', () => {
    for (const lesson of lessons) {
      expect(SOLUTIONS[lesson.id], `missing solution for ${lesson.id}`).toBeDefined()
    }
  })

  for (const lesson of lessons) {
    it(`clears ${lesson.id}`, () => {
      const cmds = SOLUTIONS[lesson.id]
      expect(cmds).toBeDefined()
      const state = createShellState(lesson.setup)
      for (const cmd of cmds!) {
        executeLine(state, cmd)
      }
      const result = runChecks(state, lesson)
      expect(result, result.message).toMatchObject({ ok: true })
    })
  }

  it('rejects an empty shell against fund-pwd', () => {
    const lesson = getLesson('fund-pwd')!
    const state = createShellState(lesson.setup)
    const result = runChecks(state, lesson)
    expect(result.ok).toBe(false)
  })
})
