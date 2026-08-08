# Phase 4 Review — Custom inputs (pack-agnostic generators)

**Status:** In progress — all 17 packs on generators  
**Date:** 2026-08-08

### Shipped so far
- Input engine (`src/engine/input/*`) + schema-driven `InputPanel`
- **All original catalog packs** expose `ProblemInputSpec` + `generateSteps`
- Constraints + edge fixtures on each kind (empty, not-found, no-cycle, etc.)
- Sorted inputs offer **Sort for me** where required
- **Sorting labs** (Bubble, Insertion, Selection, Merge, Quick, Heap) with dense bar viz, up to 48 bars, Randomize

## Goal

Let learners try their own inputs without breaking the player. Steps are produced by per-pack `generateSteps` after a shared, schema-driven validate/parse path. The shell stays agnostic so future problem sets plug in without UI forks.

## Architecture

| Layer | Responsibility |
|---|---|
| `src/engine/input/*` | Input kinds, parsers, heap builders, limits |
| `InputPanel` | Renders `ProblemInputSpec.fields` only |
| Each `src/problems/*.ts` | `defaultRaw`, constraints, `generateSteps` |
| `registry.ts` | Catalog list only |

## Authoring checklist (new packs)

1. Reuse an input kind, or add one kind module if the structure is new.
2. Set `defaultRaw` + limits + `formatLabel`.
3. Implement `generateSteps` including empty/edge paths.
4. Register the pack; keep `steps = generateSteps(default)`.
5. Do not edit `ProblemPage` / `InputPanel` unless adding a new field kind.

## Constraints

Hard caps on length/nodes/values/step budget. Invalid input never reaches generators. Legal edge cases (empty, not found, no cycle) get short honest traces.

## Verify

```bash
npm run dev
npm run build
```

1. Container (#11): edit heights, Apply, watch bars/water regenerate.
2. Reset example restores the default demo.
3. Oversized / non-numeric input shows errors; Apply stays disabled.
4. Packs without `input` yet still play their curated traces.
