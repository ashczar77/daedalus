import type { SystemDesignLab } from '../../types'

export const http2Lab: SystemDesignLab = {
  id: 'net-http2',
  kind: 'network',
  title: 'HTTP/1.1 vs HTTP/2',
  pathId: 'networking-apis',
  order: 3,
  summary:
    'HTTP/1.1 often waits on one response before the next starts on a connection. HTTP/2 multiplexes streams.',
  insight:
    'Head-of-line blocking means a slow first request stalls everything behind it. Multiplexing lets streams finish out of order.',
  teachingSteps: [
    {
      narrative:
        'On a single HTTP/1.1 connection, requests often queue: A starts, then B, then C. B waits until A finishes.',
      why: 'That wait is head-of-line blocking. One slow response holds the line.',
    },
    {
      narrative:
        'Browsers open several connections to work around it, but each connection still serializes its own queue.',
      why: 'More sockets help a bit; they do not remove the per-connection queue.',
    },
    {
      narrative:
        'HTTP/2 keeps one connection and runs many streams at once. A, B, and C can be in flight together.',
      why: 'Frames interleave on the wire. A slow stream does not freeze the others on that connection.',
    },
    {
      narrative:
        'Streams can finish out of start order. B may complete while A is still open.',
      why: 'That is the visible win of multiplexing: progress is per stream, not per whole connection queue.',
    },
    {
      narrative:
        'Press Play: watch A then B serialize under HTTP/1.1, then switch to HTTP/2 and see A, B, C start together.',
      why: 'Compare the queue (HTTP/1.1) with concurrent streams (HTTP/2) and out-of-order finishes.',
    },
  ],
  simDefaults: {
    algo: 'http2',
  },
  tradeoffs: [
    'Pros of HTTP/2: fewer connections, multiplexed streams, less head-of-line wait on one TCP link.',
    'Cons: more complex framing; TCP loss can still stall the connection (HTTP/3 addresses that separately).',
    'Use when: many small parallel requests on one origin; stick with HTTP/1.1 only if clients or proxies force it.',
  ],
  walkthrough: {
    statement: 'Contrast HTTP/1.1 request queuing with HTTP/2 multiplexed streams.',
    keyIdea: 'HTTP/1.1 serializes on a connection; HTTP/2 runs many streams and finishes out of order.',
    approach: [
      'Enqueue A, B, C under HTTP/1.1.',
      'Start and finish A, then start B (B waited on A).',
      'Switch to HTTP/2 and start A, B, C together.',
      'Watch B finish before A, then A and C complete.',
    ],
  },
}
