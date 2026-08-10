import type { SystemDesignLab } from '../../types'

export const capConsistencyLab: SystemDesignLab = {
  id: 'cap-consistency',
  kind: 'cap',
  title: 'Consistency',
  pathId: 'cap-theorem',
  order: 2,
  summary:
    'Consistency means every successful read returns the latest write. During a network split, Prefer Consistency keeps one shared story; Prefer Availability allows copies to drift.',
  insight:
    'Watch the stored value on each server. Prefer Consistency keeps the accepting side aligned. Prefer Availability can show two different values at once.',
  teachingSteps: [
    {
      narrative:
        'Consistency means: if a write finishes, the next successful read (from any server that answers) sees that write, not an older private copy.',
      why: 'If User A reads balance=100 and User B reads balance=50 for the same account at the same moment, Consistency is gone.',
    },
    {
      narrative:
        'While the network works, every write can be copied to all servers, so Consistency is easy to keep.',
      why: 'Messages reach everyone. There is no island holding an old value in secret.',
    },
    {
      narrative:
        'When the network splits and you Prefer Consistency, only the larger side (Zone A) accepts new writes. Zone B refuses rather than inventing a second value.',
      why: 'Turning users away protects the rule "there is one latest write." That is Consistency winning over Availability.',
    },
    {
      narrative:
        'If you Prefer Availability instead, Zone B keeps taking writes. Look at the server values: Zone A and Zone B can disagree until the network heals.',
      why: 'Those mismatched values are the cost of always answering during the split.',
    },
    {
      narrative:
        'Press Play and follow the stored value through a healthy write, a split under Prefer Consistency, a Prefer Availability write on Zone B, then heal.',
      why: 'Heal reunites the servers on one value (this demo uses last write wins).',
    },
  ],
  simDefaults: {
    algo: 'consistency',
    mode: 'cp',
    replicaCount: 3,
  },
  tradeoffs: [
    'Pros: clients can trust that a successful read is the latest agreed write.',
    'Cons: during a split some users may get errors so you do not serve two truths.',
    'Use when wrong data is worse than downtime (ledgers, seat booking, stock counts).',
  ],
  walkthrough: {
    statement: 'Keep every answering server on the same latest value, even when the network is cut.',
    keyIdea:
      'Prefer Consistency refuses the smaller side during a split. Prefer Availability lets values diverge.',
    approach: [
      'Write while healthy and confirm every server shows the same stored value.',
      'Break the network between Zone A and Zone B.',
      'Under Prefer Consistency, write in Zone A; Zone B stays frozen and errors.',
      'Switch to Prefer Availability, write in Zone B, see mismatched values, then heal.',
    ],
  },
}
