import type { SystemDesignLab } from '../../types'

export const capOverviewLab: SystemDesignLab = {
  id: 'cap-overview',
  kind: 'cap',
  title: 'CAP Theorem',
  pathId: 'cap-theorem',
  order: 1,
  summary:
    'When servers cannot talk to each other, a distributed database must choose: keep one shared truth (and turn some users away), or keep answering everyone (and risk temporary disagreement).',
  insight:
    'While the network is healthy you can keep data in sync and answer every request. The hard choice only appears when the network between servers breaks.',
  teachingSteps: [
    {
      narrative:
        'Imagine a database copied onto several servers so users in different places can all use it. That setup is a distributed system.',
      why: 'One machine is a single point of failure. Spreading copies improves reach and survival, but now those copies must stay in agreement.',
    },
    {
      narrative:
        'The CAP theorem names three things people want from that system: Consistency (every read sees the latest write), Availability (every working server answers), and Partition tolerance (the system keeps a defined behavior when the network between servers breaks).',
      why: 'When servers cannot talk, you cannot keep every copy identical and still answer every request. One of those two has to give.',
    },
    {
      narrative:
        'Networks drop packets, links go down, and data centers lose contact. So partition tolerance is the baseline: your design must say what happens when servers cannot talk.',
      why: 'If you only plan for a perfect network, the first real outage leaves you with no rule. Servers are still up, but they disagree about what to do.',
    },
    {
      narrative:
        'During a network split you face one choice. Prefer Consistency: only answer when you can keep every copy aligned, even if that means some users get an error. Prefer Availability: every reachable server keeps answering, even if copies temporarily disagree.',
      why: 'You cannot do both while the split lasts. A bank usually prefers Consistency. A social feed often prefers Availability.',
    },
    {
      narrative:
        'Press Play. First the network is healthy and a write reaches every server. Then the link breaks. Watch Prefer Consistency turn Zone B users away, then Prefer Availability let Zone B keep writing a different value until the network heals.',
      why: 'The status strip shows which property you gave up for that policy. Healthy periods keep Consistency and Availability together; the split is when the tradeoff bites.',
    },
  ],
  simDefaults: {
    algo: 'overview',
    mode: 'cp',
    replicaCount: 3,
  },
  tradeoffs: [
    'Prefer Consistency when a wrong answer is worse than a temporary error (payments, inventory locks).',
    'Prefer Availability when a slightly stale answer beats a hard failure (feeds, catalogs, presence).',
    'The slogan "pick any two of three" is incomplete: in real networks you already need Partition tolerance, so the live choice is Consistency versus Availability during a split.',
  ],
  walkthrough: {
    statement:
      'Show what a multi-server database does when the network between servers breaks.',
    keyIdea:
      'Healthy network: sync and answer. Broken network: choose one shared truth (refuse some users) or keep answering (allow temporary disagreement).',
    approach: [
      'Write while healthy and confirm every server stores the same value.',
      'Break the network between Zone A (two servers) and Zone B (one server).',
      'With Prefer Consistency, Zone A can still update; Zone B returns errors.',
      'With Prefer Availability, Zone B keeps answering and may store a different value until heal.',
    ],
  },
}
