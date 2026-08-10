/**
 * LeetCode #200 - Number of Islands.
 * Graph DFS flood-fill on a binary grid (Phase: grid visualizer).
 */
import javaSrc from '../../algorithms/0200-number-of-islands/Solution.java?raw'
import kotlinSrc from '../../algorithms/0200-number-of-islands/Solution.kt?raw'
import pythonSrc from '../../algorithms/0200-number-of-islands/solution.py?raw'
import {
  defineInput,
  formatCharGrid,
  parseCharGrid,
} from '../engine/input'
import type {
  HighlightRole,
  HeapObject,
  ProblemPack,
  Step,
} from '../engine/types'
import { placeholderBenchmark } from './benchmarkPlaceholders'

/** Small demo: two islands (see defaultRaw). */

const L = {
  enter: { java: 5, kotlin: 5, python: 5 },
  scan: { java: 10, kotlin: 10, python: 25 },
  start: { java: 11, kotlin: 11, python: 26 },
  mark: { java: 22, kotlin: 22, python: 16 },
  ret: { java: 16, kotlin: 16, python: 28 },
} as const

type Highlight = { row: number; col: number; role: HighlightRole }

function cloneGrid(grid: string[][]): string[][] {
  return grid.map((row) => [...row])
}

function gridHeap(
  cells: string[][],
  highlights: Highlight[],
  pointers: Record<string, [number, number]> | undefined,
  caption: string,
  focused = true,
): HeapObject {
  return {
    id: 'grid',
    kind: 'grid',
    label: 'char[][] grid',
    cells,
    highlights,
    pointers,
    caption,
    focused,
  }
}

function floodedHighlights(cells: string[][], original: string[][]): Highlight[] {
  const out: Highlight[] = []
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[r]!.length; c++) {
      if (original[r]![c] === '1' && cells[r]![c] === '0') {
        out.push({ row: r, col: c, role: 'visited' })
      }
    }
  }
  return out
}

function generateSteps(gridInput: string[][]): Step[] {
  const original = cloneGrid(gridInput)
  const grid = cloneGrid(gridInput)
  const rows = grid.length
  const cols = rows === 0 ? 0 : grid[0]!.length
  const steps: Step[] = []
  let id = 1
  let islands = 0

  steps.push({
    id: id++,
    narrative:
      rows === 0
        ? 'Enter numIslands on an empty grid → return 0.'
        : `Enter numIslands on a ${rows}×${cols} grid. Scan every cell; DFS sinks each island.`,
    why: 'Marking land as water during DFS prevents recounting the same connected component.',
    codeFocus: L.enter,
    callStack: [
      {
        name: 'numIslands',
        active: true,
        locals: {
          grid: { ref: 'grid' },
          islands: 0,
        },
      },
    ],
    heap: [
      gridHeap(cloneGrid(grid), [], undefined, 'Ready to scan row-major.'),
    ],
  })

  if (rows === 0) {
    steps.push({
      id: id++,
      narrative: 'Return islands=0.',
      why: 'No cells means no islands.',
      codeFocus: L.ret,
      callStack: [
        {
          name: 'numIslands',
          active: true,
          locals: { grid: { ref: 'grid' }, islands: 0, result: 0 },
        },
      ],
      heap: [gridHeap([], [], undefined, 'Empty grid.', false)],
    })
    return steps
  }

  const dirs: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r]![c]!
      if (cell !== '1') {
        steps.push({
          id: id++,
          narrative: `Scan (${r},${c}) = "${cell}" → skip.`,
          why: 'Water (or already sunk land) cannot start a new island.',
          codeFocus: L.scan,
          callStack: [
            {
              name: 'numIslands',
              active: true,
              locals: {
                grid: { ref: 'grid' },
                r,
                c,
                islands,
              },
            },
          ],
          heap: [
            gridHeap(
              cloneGrid(grid),
              [
                ...floodedHighlights(grid, original),
                { row: r, col: c, role: 'current' },
              ],
              { scan: [r, c] },
              `islands = ${islands}`,
            ),
          ],
        })
        continue
      }

      islands += 1
      steps.push({
        id: id++,
        narrative: `Scan (${r},${c}) = "1" → islands=${islands}. Start DFS.`,
        why: 'Each unscanned land cell is a new connected component.',
        codeFocus: L.start,
        callStack: [
          {
            name: 'numIslands',
            active: true,
            locals: {
              grid: { ref: 'grid' },
              r,
              c,
              islands,
            },
          },
        ],
        heap: [
          gridHeap(
            cloneGrid(grid),
            [
              ...floodedHighlights(grid, original),
              { row: r, col: c, role: 'found' },
            ],
            { scan: [r, c] },
            `Found island #${islands}`,
          ),
        ],
      })

      const stack: Array<[number, number]> = [[r, c]]
      while (stack.length > 0) {
        const [cr, cc] = stack.pop()!
        if (cr < 0 || cc < 0 || cr >= rows || cc >= cols) continue
        if (grid[cr]![cc] !== '1') continue

        grid[cr]![cc] = '0'
        steps.push({
          id: id++,
          narrative: `DFS mark (${cr},${cc}) as "0" (sunk).`,
          why: 'Sink the cell so later scans and neighbor walks skip it.',
          codeFocus: L.mark,
          callStack: [
            {
              name: 'numIslands',
              active: true,
              locals: {
                grid: { ref: 'grid' },
                islands,
              },
            },
            {
              name: 'dfs',
              active: true,
              locals: {
                grid: { ref: 'grid' },
                r: cr,
                c: cc,
              },
            },
          ],
          heap: [
            gridHeap(
              cloneGrid(grid),
              [
                ...floodedHighlights(grid, original),
                { row: cr, col: cc, role: 'window' },
              ],
              { dfs: [cr, cc] },
              `Flooding island #${islands}`,
            ),
          ],
        })

        for (const [dr, dc] of dirs) {
          stack.push([cr + dr, cc + dc])
        }
      }
    }
  }

  steps.push({
    id: id++,
    narrative: `Scan complete. Return islands=${islands}.`,
    why: 'Every land cell was visited exactly once across all DFS calls → O(m·n).',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'numIslands',
        active: true,
        locals: {
          grid: { ref: 'grid' },
          islands,
          result: islands,
        },
      },
    ],
    heap: [
      gridHeap(
        cloneGrid(grid),
        floodedHighlights(grid, original).map((h) => ({
          ...h,
          role: 'found' as const,
        })),
        undefined,
        `Result: ${islands} island${islands === 1 ? '' : 's'}`,
      ),
    ],
  })

  return steps
}

const input = defineInput<string[][]>({
  kind: 'charGrid',
  fields: [
    {
      key: 'grid',
      label: 'grid',
      widget: 'text',
      placeholder: '110; 100; 001',
      hint: 'Up to 4×4 of 0/1. Use "1 1 0; 1 0 0" or JSON.',
    },
  ],
  defaultRaw: { grid: '110;100;001' },
  parse: (raw) =>
    parseCharGrid(raw.grid ?? '', {
      name: 'grid',
      minRows: 0,
      maxRows: 4,
      minCols: 0,
      maxCols: 4,
      alphabet: '01',
    }),
  formatLabel: (grid) => `grid = ${formatCharGrid(grid)}`,
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { grid: '' } },
    { name: 'all-water', raw: { grid: '000;000' } },
    { name: 'one-island', raw: { grid: '11;11' } },
    { name: 'diagonal', raw: { grid: '10;01' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Number of Islands default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const numberOfIslands: ProblemPack = {
  id: '0200-number-of-islands',
  lcNumber: 200,
  title: 'Number of Islands',
  pattern: 'Graph DFS',
  difficulty: 'Medium',
  insight:
    'Scan the grid; each unscanned "1" starts an island, then DFS sinks the whole component.',
  invariant:
    'Once a land cell is visited it becomes "0"; islands counts connected components of the original land.',
  complexity: {
    time: 'O(m·n)',
    space: 'O(m·n)',
    notes: 'DFS recursion / stack can hold the whole grid in the worst case.',
  },
  inputLabel: input.formatLabel(defaultParsed.value),
  languages: { java: javaSrc, kotlin: kotlinSrc, python: pythonSrc },
  steps: input.generateSteps(defaultParsed.value),
  input,
  benchmark: placeholderBenchmark(
    'Flood-fill is linear in cells; restarting a BFS/DFS from every land without marking revisits work.',
  ),
  walkthrough: {
    statement:
      'Given a grid of "1" (land) and "0" (water), count the number of islands. An island is land connected 4-directionally.',
    keyIdea:
      'Treat the grid as a graph; flood-fill each land component and mark cells so they are not counted twice.',
    approach: [
      'islands = 0.',
      'For each cell: if it is "1", islands++, then DFS/BFS mark the whole island as "0".',
      'Return islands.',
    ],
  },
}
