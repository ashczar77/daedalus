/**
 * LeetCode #121 - Best Time to Buy and Sell Stock.
 * Steps generated from validated prices input (Phase 4).
 */
import javaSrc from '../../algorithms/0121-best-time-to-buy-and-sell-stock/Solution.java?raw'
import kotlinSrc from '../../algorithms/0121-best-time-to-buy-and-sell-stock/Solution.kt?raw'
import pythonSrc from '../../algorithms/0121-best-time-to-buy-and-sell-stock/solution.py?raw'
import { defineInput, formatIntList, parseIntList } from '../engine/input'
import type { ArrayHighlight, ProblemPack, Step } from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

const prices = [7, 1, 5, 3, 6, 4]

const L = {
  min: { java: 10, kotlin: 10, python: 10 },
  profit: { java: 12, kotlin: 12, python: 12 },
  ret: { java: 15, kotlin: 15, python: 13 },
} as const

function generateStockSteps(pricesIn: number[]): Step[] {
  if (pricesIn.length === 0) {
    return [
      {
        id: 1,
        narrative: 'prices is empty. Loop never runs → return best=0.',
        why: 'No day to buy or sell.',
        codeFocus: L.ret,
        callStack: [
          {
            name: 'maxProfit',
            active: true,
            locals: { prices: { ref: 'prices' }, minPrice: '∞', best: 0, result: 0 },
          },
        ],
        heap: [
          {
            id: 'prices',
            kind: 'array',
            label: 'int[] prices',
            values: pricesIn,
            focused: true,
          },
        ],
      },
    ]
  }

  const steps: Step[] = []
  let minPrice = Number.POSITIVE_INFINITY
  let minIndex = -1
  let best = 0
  let bestBuy = -1
  let bestSell = -1
  let id = 1

  for (let i = 0; i < pricesIn.length; i++) {
    const price = pricesIn[i]!
    const highlights: ArrayHighlight[] = []
    if (minIndex >= 0) {
      highlights.push({
        index: minIndex,
        role: bestBuy === minIndex ? 'found' : 'window',
      })
    }
    if (bestSell >= 0 && bestSell !== i) {
      highlights.push({ index: bestSell, role: 'found' })
    }

    if (price < minPrice) {
      minPrice = price
      minIndex = i
      highlights.push({ index: i, role: 'current' })
      steps.push({
        id,
        narrative: `Day ${i} price=${price} < minPrice → update minPrice=${price}. best=${best}.`,
        why:
          i === 0
            ? 'First price is the only buy candidate so far.'
            : 'A cheaper buy resets the baseline for later sells.',
        codeFocus: L.min,
        callStack: [
          {
            name: 'maxProfit',
            active: true,
            locals: {
              prices: { ref: 'prices' },
              day: i,
              minPrice,
              best,
            },
          },
        ],
        heap: [
          {
            id: 'prices',
            kind: 'array',
            label: 'int[] prices',
            values: pricesIn,
            pointers: { i },
            highlights,
            focused: true,
          },
        ],
      })
    } else {
      const profit = price - minPrice
      const improved = profit > best
      if (improved) {
        best = profit
        bestBuy = minIndex
        bestSell = i
      }
      const hl: ArrayHighlight[] = [
        { index: minIndex, role: improved ? 'found' : 'window' },
        { index: i, role: improved ? 'found' : 'current' },
      ]
      if (bestSell >= 0 && bestSell !== i && !improved) {
        hl.push({ index: bestSell, role: 'found' })
      }
      steps.push({
        id,
        narrative: `Day ${i} price=${price} → profit=${price}-${minPrice}=${profit}${
          improved ? ` → best=${best}` : ` < best=${best}`
        }.`,
        why: improved
          ? 'New best sell day relative to the current min buy.'
          : 'Track the max profit without changing the buy day.',
        codeFocus: L.profit,
        callStack: [
          {
            name: 'maxProfit',
            active: true,
            locals: {
              prices: { ref: 'prices' },
              day: i,
              minPrice,
              profit,
              best,
            },
          },
        ],
        heap: [
          {
            id: 'prices',
            kind: 'array',
            label: 'int[] prices',
            values: pricesIn,
            pointers: { i },
            highlights: hl,
            focused: true,
          },
        ],
      })
    }
    id += 1
  }

  steps.push({
    id,
    narrative: `Scan complete. Return best=${best}.`,
    why: 'One pass tracked the cheapest buy before each candidate sell.',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'maxProfit',
        active: true,
        locals: {
          prices: { ref: 'prices' },
          minPrice: minPrice === Number.POSITIVE_INFINITY ? '∞' : minPrice,
          best,
          result: best,
        },
      },
    ],
    heap: [
      {
        id: 'prices',
        kind: 'array',
        label: 'int[] prices',
        values: pricesIn,
        pointers: bestSell >= 0 ? { i: bestSell } : undefined,
        highlights:
          bestBuy >= 0 && bestSell >= 0
            ? [
                { index: bestBuy, role: 'found' },
                { index: bestSell, role: 'found' },
              ]
            : [],
        focused: true,
      },
    ],
  })

  return steps
}

const input = defineInput<number[]>({
  kind: 'intArray',
  fields: [
    {
      key: 'prices',
      label: 'prices',
      widget: 'text',
      placeholder: '7, 1, 5, 3, 6, 4',
      hint: 'Up to 16 integers from 0-99',
    },
  ],
  defaultRaw: { prices: formatIntList(prices) },
  parse: (raw) =>
    parseIntList(raw.prices ?? '', {
      name: 'prices',
      minLen: 0,
      maxLen: 16,
      minVal: 0,
      maxVal: 99,
    }),
  formatLabel: (value) => `prices = [${value.join(', ')}]`,
  generateSteps: generateStockSteps,
  fixtures: [
    { name: 'empty', raw: { prices: '' } },
    { name: 'flat', raw: { prices: '3, 3, 3' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(`Stock default input invalid: ${defaultParsed.errors.join('; ')}`)
}

export const bestTimeToBuyAndSellStock: ProblemPack = {
  id: '0121-best-time-to-buy-and-sell-stock',
  lcNumber: 121,
  title: 'Best Time to Buy and Sell Stock',
  pattern: 'Arrays',
  difficulty: 'Easy',
  insight:
    'Track the lowest price seen so far; at each day the best sell is price - that minimum.',
  invariant: 'minPrice is the cheapest buy on or before the current day; best is max profit so far.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  demoCoverage: { indices: prices.length },
  benchmark: placeholderBenchmark(
    'One pass dominates nested “buy day × sell day” brute force.',
  ),
  walkthrough: {
    statement: 'Pick one buy day and one later sell day to maximize profit (or 0 if none).',
    keyIdea: 'Maintain running minimum; update best profit at each price.',
    approach: [
      'minPrice = ∞, best = 0.',
      'For each price: update min or best profit.',
      'Return best.',
    ],
  },
}
