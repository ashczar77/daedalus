import { cacheAsideLab } from './labs/caching/cache-aside'
import { fifoLab } from './labs/caching/fifo'
import { lfuLab } from './labs/caching/lfu'
import { lruLab } from './labs/caching/lru'
import { readThroughLab } from './labs/caching/read-through'
import { ttlLab } from './labs/caching/ttl'
import { writeBehindLab } from './labs/caching/write-behind'
import { writeThroughLab } from './labs/caching/write-through'
import { capAvailabilityLab } from './labs/cap-theorem/availability'
import { capConsistencyLab } from './labs/cap-theorem/consistency'
import { capOverviewLab } from './labs/cap-theorem/overview'
import { capPartitionLab } from './labs/cap-theorem/partition'
import { bulkheadLab } from './labs/networking-apis/bulkhead'
import { circuitBreakerLab } from './labs/networking-apis/circuit-breaker'
import { gatewayLab } from './labs/networking-apis/gateway'
import { grpcLab } from './labs/networking-apis/grpc'
import { http2Lab } from './labs/networking-apis/http2'
import { httpBasicsLab } from './labs/networking-apis/http-basics'
import { rateLimitLab } from './labs/networking-apis/rate-limit'
import { realtimeLab } from './labs/networking-apis/realtime'
import { restDesignLab } from './labs/networking-apis/rest-design'
import { retriesLab } from './labs/networking-apis/retries'
import { tcpLab } from './labs/networking-apis/tcp'
import { consistentHashLab } from './labs/consistent-hash'
import { leastConnectionsLab } from './labs/least-connections'
import { roundRobinLab } from './labs/round-robin'
import { weightedRoundRobinLab } from './labs/weighted-round-robin'
import { cachingPath } from './paths/caching'
import { capTheoremPath } from './paths/cap-theorem'
import { loadBalancingPath } from './paths/load-balancing'
import { networkingApisPath } from './paths/networking-apis'
import type { SystemDesignLab, SystemDesignPath } from './types'

/** All System Design learning paths (suggested catalog order). */
export const systemDesignPaths: SystemDesignPath[] = [
  loadBalancingPath,
  cachingPath,
  capTheoremPath,
  networkingApisPath,
].sort((a, b) => a.order - b.order)

/** All labs; sorted by path order then lab order. */
export const systemDesignLabs: SystemDesignLab[] = [
  roundRobinLab,
  weightedRoundRobinLab,
  leastConnectionsLab,
  consistentHashLab,
  cacheAsideLab,
  readThroughLab,
  writeThroughLab,
  writeBehindLab,
  lruLab,
  lfuLab,
  fifoLab,
  ttlLab,
  capOverviewLab,
  capConsistencyLab,
  capAvailabilityLab,
  capPartitionLab,
  httpBasicsLab,
  restDesignLab,
  tcpLab,
  http2Lab,
  grpcLab,
  realtimeLab,
  gatewayLab,
  rateLimitLab,
  retriesLab,
  circuitBreakerLab,
  bulkheadLab,
].sort((a, b) => {
  const pathA = systemDesignPaths.find((p) => p.id === a.pathId)?.order ?? 0
  const pathB = systemDesignPaths.find((p) => p.id === b.pathId)?.order ?? 0
  if (pathA !== pathB) return pathA - pathB
  return a.order - b.order
})

const labsById = Object.fromEntries(
  systemDesignLabs.map((lab) => [lab.id, lab]),
) as Record<string, SystemDesignLab>

export function getSystemDesignLab(id: string): SystemDesignLab | undefined {
  return labsById[id]
}

export function labsForPath(pathId: string): SystemDesignLab[] {
  return systemDesignLabs.filter((lab) => lab.pathId === pathId)
}

export function pathTitle(pathId: string): string {
  return systemDesignPaths.find((p) => p.id === pathId)?.title ?? pathId
}
