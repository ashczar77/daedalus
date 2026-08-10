import { consistentHashLab } from './labs/consistent-hash'
import { leastConnectionsLab } from './labs/least-connections'
import { roundRobinLab } from './labs/round-robin'
import { weightedRoundRobinLab } from './labs/weighted-round-robin'
import { loadBalancingPath } from './paths/load-balancing'
import type { SystemDesignLab, SystemDesignPath } from './types'

/** All System Design learning paths (suggested catalog order). */
export const systemDesignPaths: SystemDesignPath[] = [loadBalancingPath].sort(
  (a, b) => a.order - b.order,
)

/** All labs; sorted by path order then lab order. */
export const systemDesignLabs: SystemDesignLab[] = [
  roundRobinLab,
  weightedRoundRobinLab,
  leastConnectionsLab,
  consistentHashLab,
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
