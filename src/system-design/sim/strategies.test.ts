import { describe, expect, it } from 'vitest'
import { buildServers } from './createState'
import { hashToRing, pickServer, weightedSlots } from './strategies'

describe('load balancer strategies', () => {
  it('round robin cycles evenly', () => {
    const servers = buildServers(3)
    let rrIndex = 0
    const picks: string[] = []
    for (let i = 0; i < 6; i++) {
      const result = pickServer({
        algo: 'round-robin',
        servers,
        rrIndex,
        wrrCurrentWeight: 0,
        request: { clientKey: `c${i}` },
      })
      picks.push(result.serverId)
      rrIndex = result.rrIndex
    }
    expect(picks).toEqual([
      'server-1',
      'server-2',
      'server-3',
      'server-1',
      'server-2',
      'server-3',
    ])
  })

  it('weighted round robin expands slots by weight', () => {
    const servers = buildServers(2, [2, 1])
    expect(weightedSlots(servers)).toEqual(['server-1', 'server-1', 'server-2'])
    let rrIndex = 0
    const picks: string[] = []
    for (let i = 0; i < 6; i++) {
      const result = pickServer({
        algo: 'weighted-round-robin',
        servers,
        rrIndex,
        wrrCurrentWeight: 0,
        request: { clientKey: `c${i}` },
      })
      picks.push(result.serverId)
      rrIndex = result.rrIndex
    }
    expect(picks.filter((id) => id === 'server-1')).toHaveLength(4)
    expect(picks.filter((id) => id === 'server-2')).toHaveLength(2)
  })

  it('least connections prefers the quieter server', () => {
    const servers = buildServers(3)
    servers[0]!.activeConnections = 3
    servers[1]!.activeConnections = 1
    servers[2]!.activeConnections = 2
    const result = pickServer({
      algo: 'least-connections',
      servers,
      rrIndex: 0,
      wrrCurrentWeight: 0,
      request: { clientKey: 'alice' },
    })
    expect(result.serverId).toBe('server-2')
  })

  it('consistent hashing is sticky for the same client key', () => {
    const servers = buildServers(4)
    const a = pickServer({
      algo: 'consistent-hash',
      servers,
      rrIndex: 0,
      wrrCurrentWeight: 0,
      request: { clientKey: 'alice' },
    })
    const b = pickServer({
      algo: 'consistent-hash',
      servers,
      rrIndex: 0,
      wrrCurrentWeight: 0,
      request: { clientKey: 'alice' },
    })
    expect(a.serverId).toBe(b.serverId)
    expect(hashToRing('alice')).toBeGreaterThanOrEqual(0)
    expect(hashToRing('alice')).toBeLessThan(360)
  })
})
