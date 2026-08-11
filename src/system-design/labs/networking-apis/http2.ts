import type { SystemDesignLab } from '../../types'

export const http2Lab: SystemDesignLab = {
  id: 'net-http2',
  kind: 'network',
  title: 'HTTP/1.1 vs HTTP/2',
  pathId: 'networking-apis',
  order: 4,
  summary:
    'Both versions ride one TCP pipe. HTTP/1.1 usually sends one request at a time. HTTP/2 runs many streams side by side on that same pipe.',
  insight:
    'Head-of-line blocking means a slow first request stalls everything behind it on HTTP/1.1. Multiplexing on HTTP/2 lets other streams keep moving.',
  teachingSteps: [
    {
      narrative:
        'You already opened TCP in the previous lab: one reliable ordered pipe. This lab asks how HTTP uses that pipe. Think of TCP as the road and HTTP as the traffic rules.',
      why: 'HTTP/1.1 and HTTP/2 both need TCP first. The difference is how many requests share the connection at once.',
    },
    {
      narrative:
        'On HTTP/1.1, that TCP pipe usually acts like a single lane. Request A goes, then B waits, then C waits. If A is slow, B and C are stuck behind it. That wait is called head-of-line blocking.',
      why: 'One slow response holds the whole lane, even if the next requests are ready.',
    },
    {
      narrative:
        'HTTP/2 still uses one TCP connection, but it splits traffic into streams (parallel lanes inside the same pipe). A, B, and C can be in flight together. That sharing is called multiplexing.',
      why: 'Frames from different streams interleave on the wire. A slow stream does not freeze the others on that connection.',
    },
    {
      narrative:
        'Because streams are independent, they can finish out of start order. B may complete while A is still open.',
      why: 'Progress is per stream, not per whole-connection queue. That is the visible win in the diagram.',
    },
    {
      narrative:
        'Press Play. TCP opens as a quick reminder. Then watch HTTP/1.1 use one lane while A, B, C queue. After the switch, watch three colored stream lanes carry A, B, and C at once, with B finishing before A.',
      why: 'Same TCP card underneath. Different HTTP rules on top.',
    },
  ],
  simDefaults: {
    algo: 'http2',
  },
  tradeoffs: [
    'Pros of HTTP/2: one TCP connection, multiplexed streams, less head-of-line wait for ready requests.',
    'Cons: framing is more complex; packet loss on TCP can still stall the whole connection (HTTP/3 changes that later).',
    'Use when: many small parallel requests to one origin. Prefer HTTP/1.1 only when an old client or proxy forces it.',
  ],
  walkthrough: {
    statement: 'Reuse one TCP pipe, then contrast HTTP/1.1 single-lane queuing with HTTP/2 parallel streams.',
    keyIdea: 'TCP is shared. HTTP/1.1 serializes on it. HTTP/2 multiplexes streams inside it.',
    approach: [
      'Open the TCP connection (brief reminder from the TCP lab).',
      'Enqueue A, B, C under HTTP/1.1; send A then B on the single lane.',
      'Switch to HTTP/2 on the same TCP pipe.',
      'Start A, B, C on separate lanes; watch B finish before A.',
    ],
  },
}
