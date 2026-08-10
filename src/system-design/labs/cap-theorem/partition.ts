import type { SystemDesignLab } from '../../types'

export const capPartitionLab: SystemDesignLab = {
  id: 'cap-partition',
  kind: 'cap',
  title: 'Partition Tolerance',
  pathId: 'cap-theorem',
  order: 4,
  summary:
    'Partition tolerance means the system still has a defined rule when the network between servers is cut. The servers may be fine; they just cannot copy data to each other.',
  insight:
    'The broken link is the lesson. Copies stop syncing across the cut until heal. Consistency versus Availability only becomes a forced choice once that cut exists.',
  teachingSteps: [
    {
      narrative:
        'A network partition is not "every server crashed." Each zone can still be healthy. The problem is that Zone A and Zone B cannot send messages across the break.',
      why: 'Both sides are alive, so each still wants to serve users. That is why Consistency and Availability start to conflict.',
    },
    {
      narrative:
        'In the simulation the gap between zones is that broken link. Writes in one zone cannot update servers in the other zone until the network heals.',
      why: 'Seeing the blocked sync is what Partition tolerance looks like: the system keeps running under a cut, with a rule for each side.',
    },
    {
      narrative:
        'Partition tolerance does not mean "ignore the break." It means you already decided Prefer Consistency or Prefer Availability for what each side should do while cut off.',
      why: 'Without that rule, operators and clients get undefined behavior the first time a link fails.',
    },
    {
      narrative:
        'Heal restores the link. Servers copy data again and converge (this demo uses last write wins).',
      why: 'After heal, you can keep Consistency and Availability together again until the next cut.',
    },
    {
      narrative:
        'Press Play: healthy write, break the link, local requests under each policy, then reconnect.',
      why: 'Partition tolerance is the backdrop that makes the Consistency versus Availability choice real.',
    },
  ],
  simDefaults: {
    algo: 'partition',
    mode: 'cp',
    replicaCount: 3,
  },
  tradeoffs: [
    'Pros of designing for partitions: a broken link does not leave you without a rule.',
    'Cons: you must still choose Prefer Consistency or Prefer Availability for isolated zones.',
    'Use whenever your data lives on more than one machine or site (almost every real distributed store).',
  ],
  walkthrough: {
    statement: 'Keep a defined behavior when the network between servers is cut.',
    keyIdea:
      'The cut blocks cross-zone sync. Prefer Consistency or Prefer Availability decides what each zone answers until heal.',
    approach: [
      'Write while healthy so all servers agree.',
      'Break the link and watch Zone A and Zone B stop syncing.',
      'Issue local requests under Prefer Consistency, then Prefer Availability.',
      'Heal and watch values converge again.',
    ],
  },
}
