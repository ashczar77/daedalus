import { cacheAsideLab } from './labs/caching/cache-aside'
import { fifoLab } from './labs/caching/fifo'
import { lfuLab } from './labs/caching/lfu'
import { lruLab } from './labs/caching/lru'
import { readThroughLab } from './labs/caching/read-through'
import { ttlLab } from './labs/caching/ttl'
import { writeBehindLab } from './labs/caching/write-behind'
import { writeThroughLab } from './labs/caching/write-through'
import { consistentHashLab } from './labs/consistent-hash'
import { leastConnectionsLab } from './labs/least-connections'
import { roundRobinLab } from './labs/round-robin'
import { weightedRoundRobinLab } from './labs/weighted-round-robin'
import { cachingPath } from './paths/caching'
import { loadBalancingPath } from './paths/load-balancing'
import type { SystemDesignLab, SystemDesignPath } from './types'

/** All System Design learning paths (suggested catalog order). */
export const systemDesignPaths: SystemDesignPath[] = [
  loadBalancingPath,
  cachingPath,
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
