/**
 * LeetCode #121 — Best Time to Buy and Sell Stock.
 * Full scan of prices = [7,1,5,3,6,4] — every day is a step.
 */
import javaSrc from '../../algorithms/0121-best-time-to-buy-and-sell-stock/Solution.java?raw'
import kotlinSrc from '../../algorithms/0121-best-time-to-buy-and-sell-stock/Solution.kt?raw'
import pythonSrc from '../../algorithms/0121-best-time-to-buy-and-sell-stock/solution.py?raw'
import type { ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const prices = [7, 1, 5, 3, 6, 4]

const L = {
  min: { java: 10, kotlin: 10, python: 10 },
  profit: { java: 12, kotlin: 12, python: 12 },
  ret: { java: 15, kotlin: 15, python: 13 },
} as const

const steps: Step[] = [
  {
    id: 1,
    narrative: 'Day 0 price=7 → minPrice=7, best=0.',
    why: 'First price is the only buy candidate so far.',
    codeFocus: L.min,
    callStack: [
      {
        name: 'maxProfit',
        active: true,
        locals: { prices: { ref: 'prices' }, day: 0, minPrice: 7, best: 0 },
      },
    ],
    heap: [
      {
        id: 'prices',
        kind: 'array',
        label: 'int[] prices',
        values: prices,
        pointers: { i: 0 },
        highlights: [{ index: 0, role: 'current' }],
        focused: true,
      },
    ],
  },
  {
    id: 2,
    narrative: 'Day 1 price=1 < minPrice → update minPrice=1. Profit still 0.',
    why: 'A cheaper buy resets the baseline for later sells.',
    codeFocus: L.min,
    callStack: [
      {
        name: 'maxProfit',
        active: true,
        locals: { prices: { ref: 'prices' }, day: 1, minPrice: 1, best: 0 },
      },
    ],
    heap: [
      {
        id: 'prices',
        kind: 'array',
        label: 'int[] prices',
        values: prices,
        pointers: { i: 1 },
        highlights: [
          { index: 0, role: 'discard' },
          { index: 1, role: 'current' },
        ],
        focused: true,
      },
    ],
  },
  {
    id: 3,
    narrative: 'Day 2 price=5 → profit=5-1=4 → best=4.',
    why: 'First positive profit candidate.',
    codeFocus: L.profit,
    callStack: [
      {
        name: 'maxProfit',
        active: true,
        locals: {
          prices: { ref: 'prices' },
          day: 2,
          minPrice: 1,
          profit: 4,
          best: 4,
        },
      },
    ],
    heap: [
      {
        id: 'prices',
        kind: 'array',
        label: 'int[] prices',
        values: prices,
        pointers: { i: 2 },
        highlights: [
          { index: 1, role: 'window' },
          { index: 2, role: 'current' },
        ],
        focused: true,
      },
    ],
  },
  {
    id: 4,
    narrative: 'Day 3 price=3 → profit=3-1=2 < best. best stays 4.',
    why: 'Still must scan every later day — a better sell may appear.',
    codeFocus: L.profit,
    callStack: [
      {
        name: 'maxProfit',
        active: true,
        locals: {
          prices: { ref: 'prices' },
          day: 3,
          minPrice: 1,
          profit: 2,
          best: 4,
        },
      },
    ],
    heap: [
      {
        id: 'prices',
        kind: 'array',
        label: 'int[] prices',
        values: prices,
        pointers: { i: 3 },
        highlights: [
          { index: 1, role: 'window' },
          { index: 3, role: 'current' },
        ],
        focused: true,
      },
    ],
  },
  {
    id: 5,
    narrative: 'Day 4 price=6 → profit=6-1=5 → best=5.',
    why: 'New maximum profit.',
    codeFocus: L.profit,
    callStack: [
      {
        name: 'maxProfit',
        active: true,
        locals: {
          prices: { ref: 'prices' },
          day: 4,
          minPrice: 1,
          profit: 5,
          best: 5,
        },
      },
    ],
    heap: [
      {
        id: 'prices',
        kind: 'array',
        label: 'int[] prices',
        values: prices,
        pointers: { i: 4 },
        highlights: [
          { index: 1, role: 'found' },
          { index: 4, role: 'found' },
        ],
        focused: true,
      },
    ],
  },
  {
    id: 6,
    narrative: 'Day 5 price=4 → profit=4-1=3 < best. best stays 5.',
    why: 'Last day of the scan.',
    codeFocus: L.profit,
    callStack: [
      {
        name: 'maxProfit',
        active: true,
        locals: {
          prices: { ref: 'prices' },
          day: 5,
          minPrice: 1,
          profit: 3,
          best: 5,
        },
      },
    ],
    heap: [
      {
        id: 'prices',
        kind: 'array',
        label: 'int[] prices',
        values: prices,
        pointers: { i: 5 },
        highlights: [
          { index: 1, role: 'found' },
          { index: 4, role: 'found' },
          { index: 5, role: 'current' },
        ],
        focused: true,
      },
    ],
  },
  {
    id: 7,
    narrative: 'Loop done. Return best=5 (buy at 1, sell at 6).',
    why: 'One forward pass is enough for a single transaction.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'maxProfit',
        active: true,
        locals: { prices: { ref: 'prices' }, best: 5, result: 5 },
      },
    ],
    heap: [
      {
        id: 'prices',
        kind: 'array',
        label: 'int[] prices',
        values: prices,
        pointers: { i: 5 },
        highlights: [
          { index: 1, role: 'found' },
          { index: 4, role: 'found' },
        ],
        focused: true,
      },
    ],
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
  invariant: 'minPrice is the lowest price in prices[0..i]; best is max profit selling on a day ≤ i.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: 'prices = [7,1,5,3,6,4]',
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps,
  demoCoverage: { indices: 6 },
  benchmark: placeholderBenchmark(
    'Single pass; heap is just the prices array.',
  ),
  walkthrough: {
    statement:
      'Pick one buy day and one later sell day to maximize profit (or 0 if no profit).',
    keyIdea: 'Track the minimum price so far; profit at day i is price[i] − minSoFar.',
    approach: [
      'minBuy = first price, best = 0.',
      'For each day, update best with price − minBuy, then update minBuy.',
      'Return best.',
    ],
  },
}
