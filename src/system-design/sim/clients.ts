/** Named clients reused across the sim so hashing shows stickiness. */
export const CLIENT_NAMES = [
  'alice',
  'bob',
  'carol',
  'dave',
  'erin',
  'frank',
] as const

export function clientNameFor(index: number): string {
  return CLIENT_NAMES[index % CLIENT_NAMES.length]!
}

export function clientIndexFor(name: string): number {
  const index = (CLIENT_NAMES as readonly string[]).indexOf(name)
  return index >= 0 ? index : 0
}
