/**
 * Named clients reused across the sim so hashing shows stickiness.
 * Chosen so the default 3-server consistent-hash ring (spots 90 / 210 / 330)
 * actually receives traffic on every server:
 *   carol, dave → S1; uma, olivia → S2; alice, bob → S3
 */
export const CLIENT_NAMES = [
  'alice',
  'bob',
  'carol',
  'dave',
  'uma',
  'olivia',
] as const

export function clientNameFor(index: number): string {
  return CLIENT_NAMES[index % CLIENT_NAMES.length]!
}

export function clientIndexFor(name: string): number {
  const index = (CLIENT_NAMES as readonly string[]).indexOf(name)
  return index >= 0 ? index : 0
}
