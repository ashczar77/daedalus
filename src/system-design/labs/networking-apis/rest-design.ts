import type { SystemDesignLab } from '../../types'

export const restDesignLab: SystemDesignLab = {
  id: 'net-rest-design',
  kind: 'network',
  title: 'REST Contracts',
  pathId: 'networking-apis',
  order: 2,
  summary:
    'Design HTTP APIs so retries, paging, and version bumps stay safe and predictable.',
  insight:
    'Idempotent writes (PUT with a stable id) survive retries. Blind POST retries can create duplicates.',
  teachingSteps: [
    {
      narrative:
        'REST maps resources to URLs and uses HTTP methods as verbs: GET to read, POST to create, PUT to replace.',
      why: 'Clients and servers share one mental model: nouns in the path, verbs in the method.',
    },
    {
      narrative:
        'POST create is not idempotent by default. If the client times out and retries, a second POST can create a second resource.',
      why: 'That duplicate is the classic "I clicked submit twice" bug at the API layer.',
    },
    {
      narrative:
        'PUT (or POST with an idempotency key) targets a known id. Retrying the same PUT leaves one resource.',
      why: 'Safe retries need a stable identity so the server can treat repeats as the same write.',
    },
    {
      narrative:
        'Large collections use cursor pagination: page one returns a cursor; page two sends that cursor back. Version the path (/v1, /v2) when the contract changes.',
      why: 'Cursors avoid fragile offset math. Versions let old clients keep working while new clients move forward.',
    },
    {
      narrative:
        'Press Play: watch a blind POST retry spawn a duplicate, a PUT retry stay one id, then cursor pages and a /v2 call.',
      why: 'Compare created ids after POST vs PUT, then follow the cursor and the version bump.',
    },
  ],
  simDefaults: {
    algo: 'rest-design',
  },
  tradeoffs: [
    'Pros: clear resource URLs; idempotent writes make retries safer; cursors scale better than raw offsets.',
    'Cons: versioning and idempotency keys add design work; poorly chosen POST semantics invite duplicates.',
    'Use when: public HTTP APIs where clients retry, page large lists, and need a migration path for breaking changes.',
  ],
  walkthrough: {
    statement: 'Compare POST vs PUT retries, then page with a cursor and bump the API version.',
    keyIdea: 'Idempotent writes tolerate retries; cursors and path versions keep the contract stable as it grows.',
    approach: [
      'POST once to create order-1.',
      'Retry POST blindly and see order-2 (duplicate).',
      'Retry PUT with the same id and keep one resource.',
      'Fetch page one (cursor), page two (use cursor), then call /v2.',
    ],
  },
}
