/** Learning path grouping for System Design labs (e.g. Load Balancing). */
export type SystemDesignPath = {
  id: string
  title: string
  summary: string
  order: number
}

/** One teaching beat before the live simulation. */
export type TeachingBeat = {
  narrative: string
  why: string
}

/** Which load-balancing strategy the lab simulates. */
export type LoadBalancerAlgo =
  | 'round-robin'
  | 'weighted-round-robin'
  | 'least-connections'
  | 'consistent-hash'

export type LoadBalancerSimDefaults = {
  algo: LoadBalancerAlgo
  serverCount: number
  /** Per-server weights (WRR); length should match serverCount when set. */
  weights?: number[]
  /** How long a request occupies a server after it arrives (sim ticks). */
  requestDurationTicks: number
  /** @deprecated Kept optional for older lab objects; pacing is one-at-a-time now. */
  arrivalEveryTicks?: number
  /** Stop after this many arrivals (finite demo burst). */
  maxArrivals?: number
  /** Show add/remove server controls (consistent hashing). */
  allowServerChurn?: boolean
  /** Cap how many servers the sim may grow to (keeps the ring readable). */
  maxServers?: number
}

/** Which caching strategy the lab simulates. */
export type CacheAlgo =
  | 'cache-aside'
  | 'read-through'
  | 'write-through'
  | 'write-behind'
  | 'lru'
  | 'lfu'
  | 'fifo'
  | 'ttl'

export type CacheSimDefaults = {
  algo: CacheAlgo
  /** Max entries the cache can hold. */
  capacity: number
  /** Stop after this many scripted ops. */
  maxArrivals?: number
  /** TTL lab: entries expire after this many sim ticks. */
  ttlTicks?: number
  /** Write-behind: flush pending writes every N completed ops. */
  writeBehindFlushEvery?: number
}

type LabBase = {
  id: string
  title: string
  pathId: string
  order: number
  summary: string
  insight: string
  teachingSteps: TeachingBeat[]
  tradeoffs: string[]
  walkthrough: {
    statement: string
    keyIdea: string
    approach: string[]
  }
}

/**
 * One System Design lab: short teaching beats + live sim defaults.
 * All labs are unlocked; `order` is the suggested path sequence.
 */
export type SystemDesignLab =
  | (LabBase & {
      kind: 'load-balancer'
      simDefaults: LoadBalancerSimDefaults
    })
  | (LabBase & {
      kind: 'cache'
      simDefaults: CacheSimDefaults
    })
