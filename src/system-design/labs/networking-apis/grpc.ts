import type { SystemDesignLab } from '../../types'

export const grpcLab: SystemDesignLab = {
  id: 'net-grpc',
  kind: 'network',
  title: 'gRPC',
  pathId: 'networking-apis',
  order: 5,
  summary:
    'gRPC is a way for one service to call a method on another service, like a local function call, but over the network.',
  insight:
    'You call GetUser(42). The other machine runs that function and sends the return value back. That round trip is the remote procedure call.',
  teachingSteps: [
    {
      narrative:
        'gRPC stands for gRPC Remote Procedure Calls (the name repeats itself on purpose). Remote Procedure Call means: run this function on another machine and give me the return value.',
      why: 'Your code still looks like GetUser(42). Under the hood, the call crosses the network, runs over there, and the result comes home.',
    },
    {
      narrative:
        'Contrast with REST: you usually pick an HTTP path yourself (GET /api/users/42) and parse a JSON body. That is fine for browsers and public APIs. gRPC is aimed at programs calling each other with shared method names.',
      why: 'REST talks in resources and HTTP. gRPC talks in functions and return values.',
    },
    {
      narrative:
        'You describe the service once (method names, argument types, return types). Tools generate a stub: a small helper in your language. You call stub.GetUser(42). The stub sends the arguments and waits for the result.',
      why: 'Both sides agree on GetUser(id) → User in code. You are not freehanding a new URL string and JSON shape for every call.',
    },
    {
      narrative:
        'This lab shows unary RPC: one call out, one return value back, like a normal function. (gRPC can also stream many messages; we keep one-in, one-out here.)',
      why: 'Unary is the clearest picture of "remote procedure call."',
    },
    {
      narrative:
        'Press Play. Watch GetUser(42) leave your machine, run on the server, then return User { id: 42 }. Then the same pattern with id 7.',
      why: 'Follow the arrow: arguments go out, return value comes back. That is what RPC is.',
    },
  ],
  simDefaults: {
    algo: 'grpc',
  },
  tradeoffs: [
    'Pros: feels like a normal function call; clear method names and types; strong fit for service-to-service traffic.',
    'Cons: harder to try in a browser or with a simple curl; public human-facing APIs often stay REST+JSON.',
    'Use when: backend services share a schema and call each other often. Prefer REST when browsers and people are the main clients.',
  ],
  walkthrough: {
    statement: 'See a remote procedure call: arguments go out, the function runs elsewhere, the return value comes back.',
    keyIdea: 'RPC = run this function on another machine and give me the return value.',
    approach: [
      'Call GetUser(42): arguments travel to the server.',
      'Server runs GetUser and returns User { id: 42 }.',
      'Repeat with GetUser(7) and its return value.',
    ],
  },
}
