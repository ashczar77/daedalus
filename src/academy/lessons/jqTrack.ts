import type { LessonPack } from '../types'

const usersJson = JSON.stringify(
  {
    users: [
      { id: 1, name: 'ada', role: 'admin', score: 98 },
      { id: 2, name: 'linus', role: 'dev', score: 87 },
      { id: 3, name: 'grace', role: 'dev', score: 92 },
    ],
  },
  null,
  2,
) + '\n'

const itemsJson = JSON.stringify(
  [
    { sku: 'a1', price: 10, tags: ['new'] },
    { sku: 'b2', price: 25, tags: ['sale'] },
    { sku: 'c3', price: 5, tags: ['new', 'sale'] },
  ],
  null,
  2,
) + '\n'

const dataTree = {
  home: {
    cadet: {
      data: {
        'users.json': usersJson,
        'items.json': itemsJson,
        'message.json': '{"text":"phosphor","n":3}\n',
      },
    },
  },
}

export const jqLessons: LessonPack[] = [
  {
    id: 'jq-identity',
    title: 'jq: identity filter',
    track: 'jq',
    order: 15,
    level: 'intro',
    summary: 'Pretty-print JSON with jq .',
    prose: [
      'jq reads JSON from stdin and applies a filter.',
      'The simplest filter is . (identity) — it prints the document (pretty by default here).',
      'Try: cat data/message.json | jq .',
    ],
    goals: [{ id: 'g1', label: 'Pipe message.json through jq .' }],
    hints: ['cat data/message.json | jq .'],
    unlocks: ['jq-field'],
    setup: { cwd: '/home/cadet', files: dataTree },
    checks: [
      { type: 'stdoutContains', text: '"text"' },
      { type: 'stdoutContains', text: 'phosphor' },
    ],
  },
  {
    id: 'jq-field',
    title: 'jq: select a field',
    track: 'jq',
    order: 16,
    level: 'intro',
    summary: 'Extract .text from message.json.',
    prose: [
      '.field walks into an object key.',
      'Print only the text field from data/message.json (raw string with -r is nice).',
    ],
    goals: [{ id: 'g1', label: 'Output phosphor' }],
    hints: ['cat data/message.json | jq -r .text'],
    unlocks: ['jq-index'],
    setup: { cwd: '/home/cadet', files: dataTree },
    checks: [
      {
        type: 'stdoutEquals',
        text: 'phosphor\n',
        message: 'Expected raw text phosphor (use jq -r .text)',
      },
    ],
  },
  {
    id: 'jq-index',
    title: 'jq: array index',
    track: 'jq',
    order: 17,
    level: 'core',
    summary: 'Pick the first user name.',
    prose: [
      '.[0] indexes an array. You can chain: .users[0].name',
      'From users.json, print the first user\'s name as a raw string.',
    ],
    goals: [{ id: 'g1', label: 'Print ada' }],
    hints: ['cat data/users.json | jq -r .users[0].name'],
    unlocks: ['jq-map'],
    setup: { cwd: '/home/cadet', files: dataTree },
    checks: [{ type: 'stdoutEquals', text: 'ada\n' }],
  },
  {
    id: 'jq-map',
    title: 'jq: map',
    track: 'jq',
    order: 18,
    level: 'core',
    summary: 'Project all user names with map.',
    prose: [
      'map(FILTER) applies FILTER to each array element.',
      'List every user name from users.json.',
    ],
    goals: [{ id: 'g1', label: 'map(.name) on .users' }],
    hints: ['cat data/users.json | jq -c .users | jq -c \'map(.name)\'', 'Or: cat data/users.json | jq -c \'.users | map(.name)\''],
    unlocks: ['jq-select'],
    setup: { cwd: '/home/cadet', files: dataTree },
    checks: [
      { type: 'stdoutContains', text: 'ada' },
      { type: 'stdoutContains', text: 'linus' },
      { type: 'stdoutContains', text: 'grace' },
    ],
  },
  {
    id: 'jq-select',
    title: 'jq: select',
    track: 'jq',
    order: 19,
    level: 'core',
    summary: 'Filter users with score > 90.',
    prose: [
      'select(predicate) keeps values for which the predicate is true.',
      'From .users[], keep entries with score > 90 and show their names (raw).',
    ],
    goals: [{ id: 'g1', label: 'Names of users with score > 90' }],
    hints: [
      'cat data/users.json | jq -r \'.users[] | select(.score > 90) | .name\'',
    ],
    unlocks: ['jq-keys'],
    setup: { cwd: '/home/cadet', files: dataTree },
    checks: [
      { type: 'stdoutContains', text: 'ada' },
      { type: 'stdoutContains', text: 'grace' },
      {
        type: 'stdoutEquals',
        text: 'ada\ngrace\n',
        message: 'Expected ada then grace (score > 90), raw names one per line',
      },
    ],
  },
  {
    id: 'jq-keys',
    title: 'jq: keys',
    track: 'jq',
    order: 20,
    level: 'core',
    summary: 'List keys of the root object.',
    prose: [
      'keys returns an object\'s keys (sorted in this academy).',
      'Show the keys of users.json\'s root object.',
    ],
    goals: [{ id: 'g1', label: 'jq keys on users.json' }],
    hints: ['cat data/users.json | jq keys', 'Or: cat data/users.json | jq -c keys'],
    unlocks: ['jq-reshape'],
    setup: { cwd: '/home/cadet', files: dataTree },
    checks: [
      { type: 'stdoutContains', text: 'users' },
    ],
  },
  {
    id: 'jq-reshape',
    title: 'jq: reshape objects',
    track: 'jq',
    order: 21,
    level: 'advanced',
    summary: 'Build {sku, price} objects with map.',
    prose: [
      'Object constructors like {sku: .sku, price: .price} build new objects.',
      'From items.json, map each item to only sku and price (compact output is fine).',
    ],
    goals: [{ id: 'g1', label: 'map({sku: .sku, price: .price})' }],
    hints: [
      'cat data/items.json | jq -c \'map({sku: .sku, price: .price})\'',
    ],
    unlocks: ['jq-capstone'],
    setup: { cwd: '/home/cadet', files: dataTree },
    checks: [
      { type: 'stdoutContains', text: 'a1' },
      { type: 'stdoutContains', text: '"price":10' },
      { type: 'stdoutContains', text: 'b2' },
    ],
  },
  {
    id: 'jq-capstone',
    title: 'jq capstone: sale items',
    track: 'jq',
    order: 22,
    level: 'advanced',
    summary: 'Select sale-tagged skus with a pipe chain.',
    prose: [
      'Combine .[] , select, and field projection.',
      'Print the sku of every item in items.json whose tags include sale — raw, one per line.',
      'Tip: select(.tags[] == "sale") or select(.price > 20) — for this lab, filter on tags.',
    ],
    goals: [{ id: 'g1', label: 'skus with sale tag: b2 and c3' }],
    hints: [
      'cat data/items.json | jq -r \'.[] | select(.price >= 25) | .sku\' gets b2 only',
      'Better: cat data/items.json | jq -r \'.[] | select(.tags[] == "sale") | .sku\'',
    ],
    unlocks: [],
    setup: { cwd: '/home/cadet', files: dataTree },
    checks: [
      {
        type: 'stdoutEquals',
        text: 'b2\nc3\n',
        message: 'Expected skus b2 and c3 (items tagged sale)',
      },
    ],
  },
]
