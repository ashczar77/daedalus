import { describe, expect, it } from 'vitest'
import { createCapState } from './createState'
import { completeCapFlight, spawnCapOp } from './stepSim'
import { sideAccepts, valuesAgree } from './strategies'

function runUntilIdle(defaults: Parameters<typeof createCapState>[0]) {
  let state = createCapState(defaults)
  let guard = 0
  while (!state.finished && guard < 80) {
    guard += 1
    if (state.flight) {
      state = completeCapFlight(state)
      continue
    }
    state = spawnCapOp(state)
  }
  return state
}

describe('CAP sim strategies', () => {
  it('CP refuses minority during partition; AP accepts both sides', () => {
    expect(sideAccepts('left', true, 'cp')).toBe(true)
    expect(sideAccepts('right', true, 'cp')).toBe(false)
    expect(sideAccepts('right', true, 'ap')).toBe(true)
    expect(sideAccepts('right', false, 'cp')).toBe(true)
  })
})

describe('CAP sim CP/AP rules', () => {
  it('overview: CP refuses minority write, then AP allows diverge before heal', () => {
    let state = createCapState({ algo: 'overview', mode: 'cp' })

    // write left v1
    state = completeCapFlight(spawnCapOp(state))
    expect(valuesAgree(state.replicas)).toBe(true)
    expect(state.replicas[0]?.value).toBe('v1')

    // read right
    state = completeCapFlight(spawnCapOp(state))

    // partition
    state = completeCapFlight(spawnCapOp(state))
    expect(state.partitioned).toBe(true)
    expect(state.sacrificed).toBe('A')

    // write left v2 (ok)
    state = completeCapFlight(spawnCapOp(state))
    expect(state.replicas.filter((r) => r.side === 'left').every((r) => r.value === 'v2')).toBe(
      true,
    )
    expect(state.replicas.find((r) => r.side === 'right')?.value).toBe('v1')

    // write right v3 (refuse under CP)
    state = spawnCapOp(state)
    expect(state.flight?.kind).toBe('write-refuse')
    expect(state.refuseCount).toBe(1)
    state = completeCapFlight(state)
    expect(state.replicas.find((r) => r.side === 'right')?.value).toBe('v1')

    // read right refuse
    state = spawnCapOp(state)
    expect(state.flight?.kind).toBe('read-refuse')
    state = completeCapFlight(state)

    // set-mode ap
    state = completeCapFlight(spawnCapOp(state))
    expect(state.mode).toBe('ap')
    expect(state.sacrificed).toBe('C')

    // write right v3 (ok under AP)
    state = completeCapFlight(spawnCapOp(state))
    expect(state.replicas.find((r) => r.side === 'right')?.value).toBe('v3')
    expect(state.replicas.find((r) => r.side === 'left')?.value).toBe('v2')
    expect(valuesAgree(state.replicas)).toBe(false)

    // read left
    state = completeCapFlight(spawnCapOp(state))

    // heal
    state = completeCapFlight(spawnCapOp(state))
    expect(state.partitioned).toBe(false)
    expect(valuesAgree(state.replicas)).toBe(true)
    expect(state.replicas[0]?.value).toBe('v3')
  })

  it('finishes each lab script without hanging', () => {
    for (const algo of [
      'overview',
      'consistency',
      'availability',
      'partition',
    ] as const) {
      const end = runUntilIdle({ algo })
      expect(end.finished).toBe(true)
      expect(end.partitioned).toBe(false)
      expect(valuesAgree(end.replicas)).toBe(true)
    }
  })
})
