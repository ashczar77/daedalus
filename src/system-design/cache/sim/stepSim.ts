import {
  cloneDb,
  cloneEntries,
  findEntry,
  isExpired,
  pickVictim,
  touchEntry,
} from './strategies'
import type {
  CacheEntry,
  CacheFlight,
  CacheScriptOp,
  CacheSimState,
} from './types'

function maybeFinish(state: CacheSimState): CacheSimState {
  if (
    state.arrivalsCount >= state.maxArrivals &&
    state.flight == null &&
    (state.algo !== 'write-behind' || state.pendingWrites.length === 0)
  ) {
    return { ...state, finished: true }
  }
  return state
}

function makeEntry(
  key: string,
  value: string,
  tick: number,
  ttlTicks: number | null,
): CacheEntry {
  return {
    key,
    value,
    lastUsed: tick,
    freq: 1,
    insertedAt: tick,
    expiresAt: ttlTicks != null ? tick + ttlTicks : null,
  }
}

function putEntry(
  state: CacheSimState,
  entries: CacheEntry[],
  key: string,
  value: string,
): { entries: CacheEntry[]; evictedKey: string | null } {
  const existing = findEntry(entries, key)
  if (existing) {
    return {
      entries: entries.map((e) =>
        e.key === key
          ? {
              ...e,
              value,
              lastUsed: state.tick,
              freq: e.freq + 1,
              expiresAt:
                state.algo === 'ttl' ? state.tick + state.ttlTicks : e.expiresAt,
            }
          : e,
      ),
      evictedKey: null,
    }
  }

  let next = cloneEntries(entries)
  let evictedKey: string | null = null
  if (next.length >= state.capacity) {
    const victim = pickVictim(state.algo, next)
    if (victim) {
      evictedKey = victim.key
      next = next.filter((e) => e.key !== victim.key)
    }
  }
  next.push(
    makeEntry(
      key,
      value,
      state.tick,
      state.algo === 'ttl' ? state.ttlTicks : null,
    ),
  )
  return { entries: next, evictedKey }
}

function expireStale(state: CacheSimState): {
  entries: CacheEntry[]
  expired: CacheEntry[]
} {
  if (state.algo !== 'ttl') {
    return { entries: cloneEntries(state.entries), expired: [] }
  }
  const expired: CacheEntry[] = []
  const entries: CacheEntry[] = []
  for (const e of state.entries) {
    if (isExpired(e, state.tick)) expired.push(e)
    else entries.push({ ...e })
  }
  return { entries, expired }
}

function applyRead(
  state: CacheSimState,
  op: CacheScriptOp,
): { state: CacheSimState; flight: CacheFlight } {
  const tick = state.tick + 1
  const base = { ...state, tick }
  const { entries: afterExpire, expired } = expireStale({ ...base, tick })

  // Show TTL expiry as its own beat when something just died and we need room/story.
  if (expired.length > 0 && !findEntry(afterExpire, op.key)) {
    const first = expired[0]!
    // If the key we want expired, tell that story first via miss path below.
    void first
  }

  const live = findEntry(afterExpire, op.key)
  if (live && !isExpired(live, tick)) {
    const touched = afterExpire.map((e) =>
      e.key === op.key ? touchEntry(e, tick) : e,
    )
    const flight: CacheFlight = {
      id: `op${state.arrivalsCount + 1}`,
      op: 'read',
      key: op.key,
      value: live.value,
      hit: true,
      reason: `HIT ${op.key}=${live.value} in cache`,
      pathKind: 'read-hit',
      evictedKey: null,
      pendingFlushKeys: [],
    }
    return {
      state: {
        ...base,
        entries: touched,
        hits: state.hits + 1,
        arrivalsCount: state.arrivalsCount + 1,
        nextOpIndex: state.nextOpIndex + 1,
        flight,
      },
      flight,
    }
  }

  // Miss: load from DB into cache.
  const dbValue = state.db[op.key] ?? '?'
  const { entries, evictedKey } = putEntry(
    { ...base, entries: afterExpire },
    afterExpire,
    op.key,
    dbValue,
  )

  const isAside = state.algo === 'cache-aside'
  const flight: CacheFlight = {
    id: `op${state.arrivalsCount + 1}`,
    op: 'read',
    key: op.key,
    value: dbValue,
    hit: false,
    reason: isAside
      ? `MISS ${op.key}. App asks the cache, then queries the DB for ${op.key}=${dbValue}, then stores it in the cache${
          evictedKey ? ` (evicts ${evictedKey})` : ''
        }`
      : `MISS ${op.key}. App asks the cache and stops. Cache loads ${dbValue} from DB, stores it, then answers the app${
          evictedKey ? ` (evicts ${evictedKey})` : ''
        }`,
    pathKind: isAside ? 'aside-miss' : 'read-through-miss',
    evictedKey,
    pendingFlushKeys: [],
  }

  return {
    state: {
      ...base,
      entries,
      misses: state.misses + 1,
      arrivalsCount: state.arrivalsCount + 1,
      nextOpIndex: state.nextOpIndex + 1,
      flight,
    },
    flight,
  }
}

function applyWrite(
  state: CacheSimState,
  op: CacheScriptOp,
): { state: CacheSimState; flight: CacheFlight } {
  const tick = state.tick + 1
  const value = op.value ?? '0'
  const base = { ...state, tick }
  const { entries: afterExpire } = expireStale({ ...base, tick })

  if (state.algo === 'write-through') {
    const db = cloneDb(state.db)
    db[op.key] = value
    const { entries, evictedKey } = putEntry(
      { ...base, entries: afterExpire },
      afterExpire,
      op.key,
      value,
    )
    const flight: CacheFlight = {
      id: `op${state.arrivalsCount + 1}`,
      op: 'write',
      key: op.key,
      value,
      hit: Boolean(findEntry(afterExpire, op.key)),
      reason: `WRITE-THROUGH ${op.key}=${value}: cache first, then DB, then ack${
        evictedKey ? ` (evicted ${evictedKey})` : ''
      }`,
      pathKind: 'write-through',
      evictedKey,
      pendingFlushKeys: [],
    }
    return {
      state: {
        ...base,
        db,
        entries,
        arrivalsCount: state.arrivalsCount + 1,
        nextOpIndex: state.nextOpIndex + 1,
        flight,
      },
      flight,
    }
  }

  if (state.algo === 'write-behind') {
    const { entries, evictedKey } = putEntry(
      { ...base, entries: afterExpire },
      afterExpire,
      op.key,
      value,
    )
    const pendingWrites = [
      ...state.pendingWrites.filter((k) => k !== op.key),
      op.key,
    ]
    const flight: CacheFlight = {
      id: `op${state.arrivalsCount + 1}`,
      op: 'write',
      key: op.key,
      value,
      hit: Boolean(findEntry(afterExpire, op.key)),
      reason: `WRITE-BEHIND ${op.key}=${value} → cache now; DB later${
        evictedKey ? ` (evicted ${evictedKey})` : ''
      }`,
      pathKind: 'write-behind',
      evictedKey,
      pendingFlushKeys: [...pendingWrites],
    }
    return {
      state: {
        ...base,
        entries,
        pendingWrites,
        arrivalsCount: state.arrivalsCount + 1,
        nextOpIndex: state.nextOpIndex + 1,
        flight,
      },
      flight,
    }
  }

  // Cache-aside write: update DB; invalidate cache entry if present.
  const db = cloneDb(state.db)
  db[op.key] = value
  const hadCached = Boolean(findEntry(afterExpire, op.key))
  const entries = afterExpire.filter((e) => e.key !== op.key)
  const flight: CacheFlight = {
    id: `op${state.arrivalsCount + 1}`,
    op: 'write',
    key: op.key,
    value,
    hit: false,
    reason: hadCached
      ? `WRITE ${op.key}=${value} to DB; invalidate stale cache entry`
      : `WRITE ${op.key}=${value} to DB`,
    pathKind: 'aside-write',
    evictedKey: hadCached ? op.key : null,
    pendingFlushKeys: [],
  }

  return {
    state: {
      ...base,
      db,
      entries,
      arrivalsCount: state.arrivalsCount + 1,
      nextOpIndex: state.nextOpIndex + 1,
      flight,
    },
    flight,
  }
}

function flushWriteBehind(state: CacheSimState): CacheSimState {
  if (state.pendingWrites.length === 0) {
    return maybeFinish({ ...state, flight: null })
  }
  const keys = [...state.pendingWrites]
  const db = cloneDb(state.db)
  for (const key of keys) {
    const entry = findEntry(state.entries, key)
    if (entry) db[key] = entry.value
  }
  const flight: CacheFlight = {
    id: `flush${state.arrivalsCount}`,
    op: 'write',
    key: keys.join(','),
    value: '',
    hit: false,
    reason: `Flush pending writes to DB: ${keys.join(', ')}`,
    pathKind: 'write-behind-flush',
    evictedKey: null,
    pendingFlushKeys: keys,
  }
  return {
    ...state,
    db,
    pendingWrites: [],
    flight,
    tick: state.tick + 1,
  }
}

/** Spawn the next scripted op as a visual flight (state already applied). */
export function spawnCacheOp(state: CacheSimState): CacheSimState {
  if (state.flight != null || state.finished) return state

  // After the burst, write-behind still needs a flush beat.
  if (state.arrivalsCount >= state.maxArrivals) {
    if (state.algo === 'write-behind' && state.pendingWrites.length > 0) {
      return flushWriteBehind(state)
    }
    return maybeFinish(state)
  }

  const op = state.script[state.nextOpIndex]
  if (!op) return maybeFinish(state)

  // Periodic mid-burst flush for write-behind.
  if (
    state.algo === 'write-behind' &&
    state.pendingWrites.length > 0 &&
    state.arrivalsCount > 0 &&
    state.arrivalsCount % state.writeBehindFlushEvery === 0
  ) {
    return flushWriteBehind(state)
  }

  const result = op.op === 'read' ? applyRead(state, op) : applyWrite(state, op)
  return result.state
}

export function completeCacheFlight(state: CacheSimState): CacheSimState {
  if (state.flight == null) return state
  return maybeFinish({ ...state, flight: null })
}

export function idleCacheTick(state: CacheSimState): CacheSimState {
  if (state.flight != null) return state
  if (state.algo === 'write-behind' && state.pendingWrites.length > 0) {
    return flushWriteBehind(state)
  }
  const tick = state.tick + 1
  const { entries } = expireStale({ ...state, tick })
  return maybeFinish({ ...state, tick, entries })
}
