import type { SystemDesignLab } from '../../types'

export const restDesignLab: SystemDesignLab = {
  id: 'net-rest-design',
  kind: 'network',
  title: 'REST Contracts',
  pathId: 'networking-apis',
  order: 2,
  summary:
    'REST is a simple way to design HTTP APIs around resources, so clients and servers share clear rules for reads, writes, retries, and change over time.',
  insight:
    'Use stable resource URLs and careful write rules. Blind POST retries can create duplicates; PUT to a known id usually does not.',
  teachingSteps: [
    {
      narrative:
        'REST stands for Representational State Transfer. In plain terms, it is a style for building APIs on top of HTTP: you name resources with URLs (like /orders/9), and you use HTTP methods to act on them (GET to read, POST to create, PUT to replace).',
      why: 'Teams use REST because browsers, mobile apps, and backend services already speak HTTP. One shared pattern beats inventing a new call style for every feature.',
    },
    {
      narrative:
        'A resource is the thing the API manages (a user, an order, a list of items). The path names the resource. The method says what you want to do to it. That pairing is the contract between client and server.',
      why: 'When everyone agrees on nouns (paths) and verbs (methods), docs, tests, and debugging stay simpler.',
    },
    {
      narrative:
        'Idempotent means "doing the same request again has the same end result." POST create is usually not idempotent: a timeout and a blind retry can create a second order. PUT to a known id is idempotent: retrying still leaves one resource.',
      why: 'Networks drop replies. Clients retry. Your write rules must say what a repeat means, or you get duplicates.',
    },
    {
      narrative:
        'Large lists use cursor pagination: the first response includes a cursor (a bookmark). The next request sends that cursor back to get the following page. When the API shape must change, version the path (/v1, /v2) so old clients keep working.',
      why: 'Cursors avoid fragile "skip 20 rows" math as data moves. Versions let you ship breaking changes without cutting off older apps overnight.',
    },
    {
      narrative:
        'Press Play. Watch each request go out (teal), then the response come back (blue). Compare the duplicate after a POST retry with the single id after a PUT retry, then follow the cursor and the /v2 call.',
      why: 'The resource list under the diagram shows what the server actually stored after each write.',
    },
  ],
  simDefaults: {
    algo: 'rest-design',
  },
  tradeoffs: [
    'Pros: easy to learn on HTTP; clear resource URLs; idempotent writes make retries safer; path versions support gradual upgrades.',
    'Cons: you must design write rules and versioning on purpose; a careless POST create invites duplicates.',
    'Use when: you want a public or internal HTTP API that many clients can call without a special protocol.',
  ],
  walkthrough: {
    statement:
      'See why REST uses HTTP resources, then compare unsafe POST retries with safe PUT retries, paging, and versioning.',
    keyIdea:
      'REST = resources on URLs + HTTP methods. Idempotent writes tolerate retries; cursors and /vN keep the contract usable as it grows.',
    approach: [
      'POST once → order-1.',
      'Blind POST retry → order-2 (duplicate).',
      'PUT /orders/9 again → still one order-9.',
      'Page with a cursor, then call /v2.',
    ],
  },
}
