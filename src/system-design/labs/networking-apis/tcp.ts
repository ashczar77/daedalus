import type { SystemDesignLab } from '../../types'

export const tcpLab: SystemDesignLab = {
  id: 'net-tcp',
  kind: 'network',
  title: 'TCP Connections',
  pathId: 'networking-apis',
  order: 3,
  summary:
    'Before HTTP can talk, TCP runs a three-way handshake: SYN, SYN-ACK, then ACK. Only after that is the connection open.',
  insight:
    'A TCP connection is not open until all three handshake packets succeed. Sequence numbers let each side prove it heard the other.',
  teachingSteps: [
    {
      narrative:
        'TCP stands for Transmission Control Protocol. It creates a reliable ordered byte pipe between client and server. The pipe does not exist until a three-way handshake finishes.',
      why: 'HTTP and many other protocols ride this pipe. If you skip the handshake, there is no shared connection yet.',
    },
    {
      narrative:
        'Step 1: the client sends SYN (synchronize) with SEQ. Client, its starting sequence number. That says "I want to connect, and I will number my bytes starting here."',
      why: 'Sequence numbers track order. The server will later ACK Client+1 to show it received this SYN.',
    },
    {
      narrative:
        'Step 2: the server replies SYN-ACK. That packet does two jobs: ACK = Client+1 (I got your SYN), and SEQ. Server (here is my starting number too).',
      why: 'Both sides need a sequence number. SYN-ACK is the server agreeing and introducing itself.',
    },
    {
      narrative:
        'Step 3: the client sends ACK with ACK = Server+1 (and advances its own SEQ). Now both sides have confirmed each other. The connection is established. That last ACK can already carry the first application data.',
      why: 'Only after this third packet should either side treat the connection as open for normal traffic.',
    },
    {
      narrative:
        'Press Play. Watch SYN go client → server, SYN-ACK return, then ACK finish the handshake. After "connection established," a short first-data beat shows the open pipe, then close.',
      why: 'Match the diagram: three labeled arrows, then the pipe is ready for HTTP in the next labs.',
    },
  ],
  simDefaults: {
    algo: 'tcp',
  },
  tradeoffs: [
    'Pros: both sides agree on sequence numbers before data; lost handshake packets can be retried cleanly.',
    'Cons: three packets of latency before the first useful byte (unless the final ACK piggybacks data).',
    'Use when: you need a trustworthy stream between two hosts. Learn this before HTTP/1.1 vs HTTP/2 on that pipe.',
  ],
  walkthrough: {
    statement: 'Walk SYN → SYN-ACK → ACK until the TCP connection is established.',
    keyIdea: 'Three packets. Connection opens only after the final ACK.',
    approach: [
      'Client sends SYN | SEQ. Client.',
      'Server replies SYN-ACK | Client+1 and SEQ. Server.',
      'Client sends ACK | Server+1. Connection established.',
      'Optional first data on the open pipe, then close.',
    ],
  },
}
