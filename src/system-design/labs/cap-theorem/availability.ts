import type { SystemDesignLab } from '../../types'

export const capAvailabilityLab: SystemDesignLab = {
  id: 'cap-availability',
  kind: 'cap',
  title: 'Availability',
  pathId: 'cap-theorem',
  order: 3,
  summary:
    'Availability means every working server returns an answer. Prefer Consistency may return errors during a split; Prefer Availability keeps answering.',
  insight:
    'Watch Answered versus Error next to each request. Availability is what you give up when Prefer Consistency blocks Zone B during a split.',
  teachingSteps: [
    {
      narrative:
        'Availability means a live server that receives a request sends back a response. An error or a hang counts as unavailable for that user.',
      why: 'From the user\'s view, "we are being careful" still looks like the service failed.',
    },
    {
      narrative:
        'When the network is healthy, every zone can answer. Availability and Consistency can both hold.',
      why: 'As long as the network works, users get answers and the data stays in sync. The hard choice only shows up when the link between servers breaks.',
    },
    {
      narrative:
        'After a split, Prefer Consistency makes Zone B return errors so it does not serve a second truth.',
      why: 'Those errors protect Consistency. For Zone B users, Availability is gone for that moment.',
    },
    {
      narrative:
        'Prefer Availability makes the same Zone B requests succeed. Users get answers; the stored value may be behind or different from Zone A.',
      why: 'You traded a guaranteed latest value for a reply.',
    },
    {
      narrative:
        'Press Play and count Answered versus Error during the split under Prefer Consistency, then under Prefer Availability.',
      why: 'The status strip marks Availability as given up while Prefer Consistency is active after the cut.',
    },
  ],
  simDefaults: {
    algo: 'availability',
    mode: 'cp',
    replicaCount: 3,
  },
  tradeoffs: [
    'Pros of Prefer Availability: users keep getting replies during outages and splits.',
    'Cons: replies may be stale or conflict until servers reconnect and reconcile.',
    'Use when a slightly old answer beats an error page (product catalogs, like counts, online status).',
  ],
  walkthrough: {
    statement: 'Keep answering users even when the cluster is split in two.',
    keyIdea:
      'Prefer Consistency returns errors on the smaller side. Prefer Availability answers on both sides.',
    approach: [
      'Serve reads and writes while healthy (all Answered).',
      'Break the network.',
      'Under Prefer Consistency, watch Zone B return Error.',
      'Under Prefer Availability, watch those same calls return Answered, then heal.',
    ],
  },
}
