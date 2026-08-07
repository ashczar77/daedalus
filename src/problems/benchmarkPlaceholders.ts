/**
 * Offline-estimated runtimes. Numbers are illustrative but intentionally
 * spread so language differences are obvious in the UI until real benches land.
 */
import type { BenchmarkData } from '../engine/types'

export function placeholderBenchmark(note: string): BenchmarkData {
  return {
    sizes: [1_000, 10_000, 100_000],
    series: [
      {
        language: 'java',
        points: [
          { n: 1_000, ms: 0.4 },
          { n: 10_000, ms: 3.1 },
          { n: 100_000, ms: 28 },
        ],
      },
      {
        language: 'kotlin',
        points: [
          { n: 1_000, ms: 0.5 },
          { n: 10_000, ms: 3.8 },
          { n: 100_000, ms: 34 },
        ],
      },
      {
        language: 'python',
        points: [
          { n: 1_000, ms: 2.4 },
          { n: 10_000, ms: 22 },
          { n: 100_000, ms: 210 },
        ],
      },
    ],
    note,
  }
}
