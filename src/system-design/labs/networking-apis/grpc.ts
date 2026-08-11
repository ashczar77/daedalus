import type { SystemDesignLab } from '../../types'

export const grpcLab: SystemDesignLab = {
  id: 'net-grpc',
  kind: 'network',
  title: 'gRPC',
  pathId: 'networking-apis',
  order: 4,
  summary:
    'gRPC calls a typed stub method over HTTP/2 with compact binary frames instead of hand-written JSON paths.',
  insight:
    'The stub is the contract: UserService.GetUser(id) instead of crafting GET /api/users/:id and parsing JSON by hand.',
  teachingSteps: [
    {
      narrative:
        'A typical REST call sends text JSON over HTTP: method, path, and a JSON body you serialize yourself.',
      why: 'It is flexible and easy to inspect, but every client reimplements the same shapes.',
    },
    {
      narrative:
        'gRPC generates a stub from a service definition. You call UserService.GetUser(42); the library frames the RPC.',
      why: 'Types and method names live in one schema. Clients and servers share that schema.',
    },
    {
      narrative:
        'Unary RPC is one request, one response (like a function call). Framing is compact binary (simplified here), not pretty-printed JSON.',
      why: 'Smaller payloads and a fixed shape help service-to-service traffic at scale.',
    },
    {
      narrative:
        'The same stub handles the next call. You pass another id; you do not rebuild the URL string.',
      why: 'Repeatability is the point of codegen: less path/string drift between services.',
    },
    {
      narrative:
        'Press Play: compare GET /api/users/42 (JSON-over-HTTP) with UserService.GetUser via a stub and compact frame.',
      why: 'Side-by-side labels show path+JSON versus typed RPC framing.',
    },
  ],
  simDefaults: {
    algo: 'grpc',
  },
  tradeoffs: [
    'Pros: typed stubs, compact framing, natural fit on HTTP/2 streams for internal RPCs.',
    'Cons: harder to curl and debug in a browser; public APIs often stay JSON/REST for that reason.',
    'Use when: service-to-service calls with a shared schema; prefer REST/JSON when humans and browsers are first-class clients.',
  ],
  walkthrough: {
    statement: 'Compare a REST JSON call with a unary gRPC stub call.',
    keyIdea: 'REST builds path + JSON; gRPC calls a generated method over a compact frame.',
    approach: [
      'Send GET /api/users/42 as text JSON over HTTP.',
      'Call UserService.GetUser(42) through the stub.',
      'Call GetUser(7) again on the same stub.',
    ],
  },
}
