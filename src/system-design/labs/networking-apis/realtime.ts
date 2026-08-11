import type { SystemDesignLab } from '../../types'

export const realtimeLab: SystemDesignLab = {
  id: 'net-realtime',
  kind: 'network',
  title: 'Long Polling vs WebSockets',
  pathId: 'networking-apis',
  order: 5,
  summary:
    'Long polling holds an HTTP request until an event (or timeout). WebSockets keep a duplex channel open for push.',
  insight:
    'Hold-and-reply reuses plain HTTP. Persistent duplex push avoids opening a new request for every event.',
  teachingSteps: [
    {
      narrative:
        'Long polling: the client sends a request and the server holds it open until there is news (or time runs out).',
      why: 'When an event arrives, the server replies. The client then opens the next hold.',
    },
    {
      narrative:
        'Each event cycle is still request/response HTTP. After a reply, you start another hold to keep listening.',
      why: 'It works through many proxies, but every event pays the cost of a new request.',
    },
    {
      narrative:
        'A WebSocket opens once, then either side can push frames without a new HTTP handshake each time.',
      why: 'That duplex channel fits chat, live feeds, and other frequent small updates.',
    },
    {
      narrative:
        'Closing the socket ends the push path. Reconnecting is a new open, not another long-poll hold.',
      why: 'You trade hold/reply simplicity for a long-lived connection you must manage.',
    },
    {
      narrative:
        'Press Play: watch a long-poll hold then reply, then a WebSocket open with two pushes and a close.',
      why: 'Compare one held request per event with a persistent duplex channel.',
    },
  ],
  simDefaults: {
    algo: 'realtime',
  },
  tradeoffs: [
    'Pros of long polling: plain HTTP, works where WebSockets are blocked; simple mental model.',
    'Cons: one request per event cycle; more overhead under high update rates.',
    'Use WebSockets when: frequent bidirectional push; use long polling when: rare events or constrained networks.',
  ],
  walkthrough: {
    statement: 'Compare hold-and-reply long polling with a persistent WebSocket push channel.',
    keyIdea: 'Long poll = hold until event; WebSocket = open once, push many.',
    approach: [
      'Hold a long-poll request, then reply with msg-1.',
      'Hold again (ready for the next event).',
      'Open a WebSocket, push msg-2 and msg-3, then close.',
    ],
  },
}
