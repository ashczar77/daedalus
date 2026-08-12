import type { SystemDesignLab } from '../../types'

export const realtimeLab: SystemDesignLab = {
  id: 'net-realtime',
  kind: 'network',
  title: 'Long Polling vs WebSockets',
  pathId: 'networking-apis',
  order: 6,
  summary:
    'Both get live updates to the client. Long polling asks again after every answer. A WebSocket stays open so the server can send many updates on one connection.',
  insight:
    'Long polling: one wait, one answer, then ask again. WebSocket: open once, then keep receiving updates until you close.',
  teachingSteps: [
    {
      narrative:
        'The problem is the same: the server has new information (a chat message, a price change), and the client wants it soon. HTTP alone is usually "client asks, server answers, then the request is done." Live updates need a pattern on top of that.',
      why: 'If the client only asks once and walks away, it misses later news. So we need a way to keep listening.',
    },
    {
      narrative:
        'Long polling: the client sends a normal HTTP request and the server does not answer right away. It waits until there is news (or until time runs out). When news arrives, the server finally replies. After that reply, the request is finished, so the client must send a new request to wait for the next piece of news.',
      why: 'You reuse ordinary HTTP. The cost is: every update needs a new "please wait for news" request.',
    },
    {
      narrative:
        'WebSocket: the client and server open one connection and leave it open. After that, the server can send updates whenever it wants. The client does not open a new HTTP request for each message.',
      why: 'One open line. Many updates can travel on it. Good when news arrives often (chat, live scores, dashboards).',
    },
    {
      narrative:
        'Side by side: for the same two news items, long polling answers once then must ask again; the WebSocket delivers both on the same open connection.',
      why: 'Watch the left panel restart a wait after every reply. Watch the right panel stay connected.',
    },
    {
      narrative:
        'Press Play. Left is long polling. Right is WebSocket. Follow the same news events on both sides and see which side must reconnect.',
      why: 'Same job, two patterns. Pick based on how often updates arrive and whether a long-lived connection is allowed.',
    },
  ],
  simDefaults: {
    algo: 'realtime',
  },
  tradeoffs: [
    'Pros of long polling: uses normal HTTP; often works when a long-lived socket is blocked.',
    'Cons of long polling: a new request after every answer; more overhead when updates are frequent.',
    'Use WebSockets when updates come often and both sides can keep a connection open. Use long polling when updates are rare or sockets are hard to keep open.',
  ],
  walkthrough: {
    statement: 'Compare long polling and WebSockets side by side on the same news events.',
    keyIdea: 'Long poll asks again after each answer. WebSocket stays open for many updates.',
    approach: [
      'Long poll starts waiting; WebSocket opens once.',
      'News-1: long poll gets a reply (then must ask again); WebSocket gets a push on the open line.',
      'News-2: same contrast again on both panels.',
    ],
  },
}
