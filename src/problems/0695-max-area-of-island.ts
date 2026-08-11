/**
 * LeetCode #695 - Max Area of Island.
 * Graph DFS flood-fill: sink land, return area, track global max.
 */
import javaSrc from '../../algorithms/0695-max-area-of-island/Solution.java?raw'
import kotlinSrc from '../../algorithms/0695-max-area-of-island/Solution.kt?raw'
import pythonSrc from '../../algorithms/0695-max-area-of-island/solution.py?raw'
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

/** Small demo: island areas 3 and 2 → max 3. */

const L = {
  enter: { java: 5, kotlin: 5, python: 5 },
  scan: { java: 10, kotlin: 10, python: 21 },
  start: { java: 11, kotlin: 11, python: 22 },
  mark: { java: 21, kotlin: 21, python: 16 },
  ret: { java: 15, kotlin: 15, python: 23 },
} as const

type Highlight = { row: number; col: number; role: HighlightRole }

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row])
}

function gridHeap(
  cells: number[][],
  highlights: Highlight[],
  pointers: Record<string, [number, number]> | undefined,
  caption: string,
  focused = true,
): HeapObject {
  return {
    id: 'grid',
    kind: 'grid',
    label: 'int[][] grid',
    cells,
    highlights,
    pointers,
    caption,
    focused,
  }
}

function floodedHighlights(cells: number[][], original: number[][]): Highlight[] {
  const out: Highlight[] = []
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[r]!.length; c++) {
      if (original[r]![c] === 1 && cells[r]![c] === 0) {
        out.push({ row: r, col: c, role: 'visited' })
      }
    }
  }
  return out
}

function toNumberGrid(charGrid: string[][]): number[][] {
  return charGrid.map((row) => row.map((cell) => (cell === '1' ? 1 : 0)))
}

function generateSteps(gridInput: number[][]): Step[] {
  const original = cloneGrid(gridInput)
  const grid = cloneGrid(gridInput)
  const rows = grid.length
  const cols = rows === 0 ? 0 : grid[0]!.length
  const steps: Step[] = []
  let id = 1
  let maxArea = 0

  steps.push({
    id: id++,
    narrative:
      rows === 0
        ? 'Enter maxAreaOfIsland on an empty grid → return 0.'
        : `Enter maxAreaOfIsland on a ${rows}×${cols} grid. Scan every cell; DFS returns each island's area.`,
    why: 'Same sink-as-you-go DFS as Number of Islands, but the DFS returns a count instead of void.',
    codeFocus: L.enter,
    callStack: [
      {
        name: 'maxAreaOfIsland',
        active: true,
        locals: {
          grid: { ref: 'grid' },
          maxArea: 0,
        },
      },
    ],
    heap: [
      gridHeap(cloneGrid(grid), [], undefined, 'Ready to scan. maxArea = 0.'),
    ],
  })

  if (rows === 0) {
    steps.push({
      id: id++,
      narrative: 'Return maxArea=0.',
      why: 'No cells means no land.',
      codeFocus: L.ret,
      callStack: [
        {
          name: 'maxAreaOfIsland',
          active: true,
          locals: { grid: { ref: 'grid' }, maxArea: 0, result: 0 },
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
      if (cell !== 1) {
        steps.push({
          id: id++,
          narrative: `Scan (${r},${c}) = ${cell} → skip.`,
          why: 'Water (or already sunk land) cannot start a new island.',
          codeFocus: L.scan,
          callStack: [
            {
              name: 'maxAreaOfIsland',
              active: true,
              locals: {
                grid: { ref: 'grid' },
                r,
                c,
                maxArea,
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
              `maxArea = ${maxArea}`,
            ),
          ],
        })
        continue
      }

      steps.push({
        id: id++,
        narrative: `Scan (${r},${c}) = 1 → start DFS to measure this island.`,
        why: 'Each unscanned land cell begins a connected component whose size we will sum.',
        codeFocus: L.start,
        callStack: [
          {
            name: 'maxAreaOfIsland',
            active: true,
            locals: {
              grid: { ref: 'grid' },
              r,
              c,
              maxArea,
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
            `About to dfs(${r},${c}). maxArea = ${maxArea}`,
          ),
        ],
      })

      let area = 0
      const stack: Array<[number, number]> = [[r, c]]
      while (stack.length > 0) {
        const [cr, cc] = stack.pop()!
        if (cr < 0 || cc < 0 || cr >= rows || cc >= cols) continue
        if (grid[cr]![cc] !== 1) continue

        grid[cr]![cc] = 0
        area += 1
        steps.push({
          id: id++,
          narrative: `DFS sink (${cr},${cc}) → 0. Area so far = ${area}.`,
          why: 'Each sunk land cell adds 1. Neighbors will be explored next (recursive returns sum in the source).',
          codeFocus: L.mark,
          callStack: [
            {
              name: 'maxAreaOfIsland',
              active: true,
              locals: {
                grid: { ref: 'grid' },
                maxArea,
              },
            },
            {
              name: 'dfs',
              active: true,
              locals: {
                grid: { ref: 'grid' },
                r: cr,
                c: cc,
                area,
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
              `Flooding · area = ${area} · maxArea = ${maxArea}`,
            ),
          ],
        })

        for (const [dr, dc] of dirs) {
          stack.push([cr + dr, cc + dc])
        }
      }

      const prevMax = maxArea
      maxArea = Math.max(maxArea, area)
      steps.push({
        id: id++,
        narrative:
          area > prevMax
            ? `Island area = ${area}. Update maxArea: ${prevMax} → ${maxArea}.`
            : `Island area = ${area}. maxArea stays ${maxArea} (not larger).`,
        why: 'After DFS returns the component size, keep the running maximum.',
        codeFocus: L.start,
        callStack: [
          {
            name: 'maxAreaOfIsland',
            active: true,
            locals: {
              grid: { ref: 'grid' },
              maxArea,
              islandArea: area,
            },
          },
        ],
        heap: [
          gridHeap(
            cloneGrid(grid),
            floodedHighlights(grid, original),
            undefined,
            `Island done · area ${area} · maxArea ${maxArea}`,
          ),
        ],
      })
    }
  }

  steps.push({
    id: id++,
    narrative: `Scan complete. Return maxArea=${maxArea}.`,
    why: 'Every land cell was visited exactly once across all DFS calls → O(m·n).',
    codeFocus: L.ret,
    callStack: [
      {
        name: 'maxAreaOfIsland',
        active: true,
        locals: {
          grid: { ref: 'grid' },
          maxArea,
          result: maxArea,
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
        `Result: max area = ${maxArea}`,
      ),
    ],
  })

  return steps
}

const input = defineInput<number[][]>({
  kind: 'intGrid01',
  fields: [
    {
      key: 'grid',
      label: 'grid',
      widget: 'text',
      placeholder: '110; 101; 001',
      hint: 'Up to 4×4 of 0/1. Use "1 1 0; 1 0 1" or JSON.',
    },
  ],
  defaultRaw: { grid: '110;101;001' },
  parse: (raw) => {
    const parsed = parseCharGrid(raw.grid ?? '', {
      name: 'grid',
      minRows: 0,
      maxRows: 4,
      minCols: 0,
      maxCols: 4,
      alphabet: '01',
    })
    if (!parsed.ok) return parsed
    return { ok: true, value: toNumberGrid(parsed.value) }
  },
  formatLabel: (grid) =>
    `grid = ${formatCharGrid(grid.map((row) => row.map(String)))}`,
  generateSteps,
  fixtures: [
    { name: 'empty', raw: { grid: '' } },
    { name: 'all-water', raw: { grid: '000;000' } },
    { name: 'one-cell', raw: { grid: '1' } },
    { name: 'full', raw: { grid: '11;11' } },
  ],
})

const defaultParsed = input.parse(input.defaultRaw)
if (!defaultParsed.ok) {
  throw new Error(
    `Max Area of Island default input invalid: ${defaultParsed.errors.join('; ')}`,
  )
}

export const maxAreaOfIsland: ProblemPack = {
  id: '0695-max-area-of-island',
  lcNumber: 695,
  title: 'Max Area of Island',
  pattern: 'Graph DFS',
  difficulty: 'Medium',
  insight:
    'Flood-fill each island like Number of Islands, but DFS returns the cell count; keep a global maxArea.',
  invariant:
    'Once a land cell is sunk it becomes 0; maxArea is the largest connected component of the original land.',
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
    'Same linear flood-fill as Number of Islands; only the return value changes from void to area.',
  ),
  walkthrough: {
    statement:
      'Given a grid of 1 (land) and 0 (water), return the maximum area of an island. An island is land connected 4-directionally. Area is the number of land cells.',
    keyIdea:
      'Scan the grid. At each unscanned 1, run DFS that sinks cells and returns how many it sank. Track the max return value.',
    approach: [
      'maxArea = 0.',
      'For each cell: if it is 1, maxArea = max(maxArea, dfs(r, c)).',
      'dfs: out of bounds or not 1 → return 0; else sink to 0 and return 1 + four neighbors.',
      'Return maxArea.',
    ],
  },
}
