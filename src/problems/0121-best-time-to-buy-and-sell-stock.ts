/**
 * LeetCode #121 — Best Time to Buy and Sell Stock (min-so-far / max profit).
 * Demo: prices = [7,1,5,3,6,4] → buy at 1, sell at 6, profit 5.
 */
import javaSrc from '../../algorithms/0121-best-time-to-buy-and-sell-stock/Solution.java?raw'
import kotlinSrc from '../../algorithms/0121-best-time-to-buy-and-sell-stock/Solution.kt?raw'
import pythonSrc from '../../algorithms/0121-best-time-to-buy-and-sell-stock/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const prices = [7, 1, 5, 3, 6, 4]

const steps: Step[] = [
  {
    id: 1,
    message: 'Day 0 price=7 becomes the first candidate buy (minPrice).',
    codeFocus: { java: 10, kotlin: 10, python: 10 },
    variables: { minPrice: 7, best: 0, day: 0 },
    scene: {
      type: 'array',
      label: 'prices',
      values: prices,
      pointers: { day: 0 },
      highlights: [{ index: 0, role: 'current' }],
    },
  },
  {
    id: 2,
    message: 'Day 1 price=1 is cheaper — update minPrice. No sell yet.',
    codeFocus: { java: 10, kotlin: 10, python: 10 },
    variables: { minPrice: 1, best: 0, day: 1 },
    scene: {
      type: 'array',
      label: 'prices',
      values: prices,
      pointers: { buy: 1, day: 1 },
      highlights: [
        { index: 0, role: 'discard' },
        { index: 1, role: 'current' },
      ],
    },
  },
  {
    id: 3,
    message: 'Day 2 price=5 → profit 5-1=4. best becomes 4.',
    codeFocus: { java: 12, kotlin: 12, python: 12 },
    variables: { minPrice: 1, best: 4, day: 2, profit: 4 },
    scene: {
      type: 'array',
      label: 'prices',
      values: prices,
      pointers: { buy: 1, sell: 2 },
      highlights: [
        { index: 1, role: 'window' },
        { index: 2, role: 'current' },
      ],
    },
  },
  {
    id: 4,
    message: 'Day 4 price=6 → profit 6-1=5. New best.',
    codeFocus: { java: 12, kotlin: 12, python: 12 },
    variables: { minPrice: 1, best: 5, day: 4, profit: 5 },
    scene: {
      type: 'array',
      label: 'prices',
      values: prices,
      pointers: { buy: 1, sell: 4 },
      highlights: [
        { index: 1, role: 'found' },
        { index: 4, role: 'found' },
      ],
    },
  },
  {
    id: 5,
    message: 'Finish the scan. Maximum profit is 5.',
    codeFocus: { java: 15, kotlin: 15, python: 13 },
    variables: { result: 5 },
    scene: {
      type: 'array',
      label: 'prices',
      values: prices,
      pointers: { buy: 1, sell: 4 },
      highlights: [
        { index: 1, role: 'found' },
        { index: 4, role: 'found' },
      ],
    },
  },
]

export const bestTimeToBuyAndSellStock: ProblemPack = {
  id: '0121-best-time-to-buy-and-sell-stock',
  lcNumber: 121,
  title: 'Best Time to Buy and Sell Stock',
  pattern: 'Sliding Window',
  difficulty: 'Easy',
  insight:
    'For one transaction, tracking the minimum buy price so far is enough — equivalent to a window that only expands profitably.',
  invariant:
    'minPrice is the cheapest buy day seen before the current sell day; best is the max profit of any completed pair so far.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: 'prices = [7,1,5,3,6,4]',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  benchmark: placeholderBenchmark(
    'One pass over prices; language gaps stay small compared with a nested buy/sell search.',
  ),
  walkthrough: {
    statement:
      "Pick one buy day and one later sell day to maximize profit (or 0).",
    keyIdea:
      "Track the minimum price so far; profit at i is price[i]-minSoFar.",
    approach: [
          "minBuy = first price, best = 0.",
          "For each day, update best with price-minBuy, then update minBuy."
    ],
  },
}
