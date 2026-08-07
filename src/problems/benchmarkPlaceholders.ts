import type { BenchmarkData } from '../engine/types'

/**
 * Phase 1–2 placeholder runtimes. Same shape as offline-measured data will use later.
 * Absolute numbers are illustrative — useful for UI, not for real comparisons yet.
 */
export function placeholderBenchmark(note: string): BenchmarkData {
  return {
    sizes: [1_000, 10_000, 100_000],
    series: [
      {
        language: 'java',
        points: [
          { n: 1_000, ms: 0.05 },
          { n: 10_000, ms: 0.28 },
          { n: 100_000, ms: 2.6 },
        ],
      },
      {
        language: 'kotlin',
        points: [
          { n: 1_000, ms: 0.06 },
          { n: 10_000, ms: 0.32 },
          { n: 100_000, ms: 2.9 },
        ],
      },
      {
        language: 'python',
        points: [
          { n: 1_000, ms: 0.14 },
          { n: 10_000, ms: 1.2 },
          { n: 100_000, ms: 13.0 },
        ],
      },
    ],
    note,
  }
}
