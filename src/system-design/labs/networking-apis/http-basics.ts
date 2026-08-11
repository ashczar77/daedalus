import type { SystemDesignLab } from '../../types'

export const httpBasicsLab: SystemDesignLab = {
  id: 'net-http-basics',
  kind: 'network',
  title: 'HTTP Request & Response',
  pathId: 'networking-apis',
  order: 1,
  summary:
    'Your app asks a server for something, then the server sends an answer back.',
  insight:
    'Read the status number first. 2xx means it worked, 4xx means your request was wrong, 5xx means the server broke.',
  teachingSteps: [
    {
      narrative:
        'HTTP is the common way a client (your app) talks to a server (the API). The client sends a request. The request has a method like GET or POST, and a path like /users/1.',
      why: 'GET means "read this." POST means "create this." The path says which thing you mean.',
    },
    {
      narrative:
        'The server sends a response back. That reply includes a status code (a short number) and often a body (the data or an error message).',
      why: 'Always check the status before you trust the body. A success body and an error body look different for a reason.',
    },
    {
      narrative:
        'Status codes come in families. 2xx means success (200 OK, 201 Created). 4xx means the client got something wrong (404 not found, 400 bad input). 5xx means the server failed (500).',
      why: 'If you see 400, fix the request. If you see 503, waiting and trying again might help. The family tells you who should act.',
    },
    {
      narrative:
        'One full exchange is a round trip: request goes out, response comes back. The time that round trip takes is called latency (how long you wait for the answer).',
      why: 'When something feels slow or fails, ask: did the request leave, and did the response return? That split makes debugging clearer.',
    },
    {
      narrative:
        'Press Play. Watch the teal request travel to the server, then the blue response travel back with a status like 200, 201, 404, 400, or 500.',
      why: 'Match each status to its family: success, client error, or server fault.',
    },
  ],
  simDefaults: {
    algo: 'http-basics',
  },
  tradeoffs: [
    'Pros: one shared language for every client and server; status families are easy to learn.',
    'Cons: a status number alone is not enough; good APIs also send a clear error body.',
    'Use when: any HTTP API. Learn this before gateways, retries, or newer protocols.',
  ],
  walkthrough: {
    statement: 'Send a request, then read the status on the response.',
    keyIdea: 'Method + path go out. Status family comes back.',
    approach: [
      'GET /users/1 → 200 (success read).',
      'POST /users → 201 (created).',
      'GET /missing → 404 and POST with bad input → 400 (client errors).',
      'GET /users → 500, then a later GET → 200 (server fault, then recovery).',
    ],
  },
}
