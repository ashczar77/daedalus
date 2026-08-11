import type { SystemDesignLab } from '../../types'

export const gatewayLab: SystemDesignLab = {
  id: 'net-gateway',
  kind: 'network',
  title: 'API Gateway',
  pathId: 'networking-apis',
  order: 7,
  summary:
    'A gateway sits in front of services: check auth, match the path, forward to the right backend.',
  insight:
    'Clients talk to one edge. Routing and auth live at the gate so each service does less of both.',
  teachingSteps: [
    {
      narrative:
        'Clients call the gateway, not every microservice URL. One public entry point replaces many internal hosts.',
      why: 'You can change backends without teaching every client a new address.',
    },
    {
      narrative:
        'Auth runs at the gate first. A valid token continues; a deny stops the call before any service work.',
      why: 'Rejected /admin never reaches an admin service. That keeps bad traffic off the fleet.',
    },
    {
      narrative:
        'Path routing picks the target: /orders goes to Orders, /users/me goes to Users.',
      why: 'The path is the map. The gateway forwards; the service handles the business logic.',
    },
    {
      narrative:
        'Allowed paths still pass auth, then route. Denied paths never get a target.',
      why: 'Auth gate + route is the two-step edge pattern this lab shows.',
    },
    {
      narrative:
        'Press Play: watch auth-ok then route to Orders/Users, an auth-deny on /admin, then another Orders route.',
      why: 'Follow path labels and the chosen service target on each hop.',
    },
  ],
  simDefaults: {
    algo: 'gateway',
  },
  tradeoffs: [
    'Pros: single edge for auth and routing; backends stay private; clients stay simple.',
    'Cons: the gateway is a critical hop; misconfigured routes or auth rules block everyone.',
    'Use when: many services behind one public API; skip a heavy gateway for a single small service.',
  ],
  walkthrough: {
    statement: 'Authenticate at the edge, then route by path to the owning service.',
    keyIdea: 'Auth gate first; path match second; forward only when both pass.',
    approach: [
      'Auth-ok /orders, route to Orders.',
      'Auth-ok /users/me, route to Users.',
      'Auth-deny /admin (no forward).',
      'Auth-ok /orders/9, route to Orders again.',
    ],
  },
}
