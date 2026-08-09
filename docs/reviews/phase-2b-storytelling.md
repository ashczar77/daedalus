# Phase 2b Review - Visualization storytelling pivot

**Status:** Complete - awaiting approval before Phase 3  
**Date:** 2026-08-07

## Goal

Pivot Daedalus from “highlight numbers” to **execution storytelling**: narrative beats, unmistakable code focus, abstract **call stack + heap** (Python-Tutor style), while **keeping structure animations**. Prove it on three packs: Two Sum, Valid Parentheses, Binary Search. Older packs keep working via a compatibility layer.

## What changed

### Schema & adapter
| Path | Change |
|---|---|
| [`src/engine/types.ts`](../../src/engine/types.ts) | Added `CallFrame`, `HeapObject`, `HeapRef`, `narrative` / `why`; `scene`/`variables`/`message` become legacy-compatible |
| [`src/engine/normalizeStep.ts`](../../src/engine/normalizeStep.ts) | Normalizes rich steps; synthesizes stack/heap from legacy `scene` + `variables` |

### Player UI (animations retained)
| Path | Change |
|---|---|
| [`src/components/MemoryStage.tsx`](../../src/components/MemoryStage.tsx) | Narrative + why + stack/heap layout |
| [`src/components/CallStackPanel.tsx`](../../src/components/CallStackPanel.tsx) | Abstract call frames; locals show `→ heap:id` refs |
| [`src/components/HeapPanel.tsx`](../../src/components/HeapPanel.tsx) | Heap objects reuse Array/HashMap/Stack visualizers (motion kept) |
| [`src/components/CodePanel.tsx`](../../src/components/CodePanel.tsx) | “Executing line N”, caret, scroll-into-view, stronger focus styling |
| [`src/pages/ProblemPage.tsx`](../../src/pages/ProblemPage.tsx) | Story stage + sticky code spine (variable inspector folded into call stack) |

### Proof packs (full storytelling)
| Problem | Pack |
|---|---|
| #1 Two Sum | [`src/problems/0001-two-sum.ts`](../../src/problems/0001-two-sum.ts) |
| #20 Valid Parentheses | [`src/problems/0020-valid-parentheses.ts`](../../src/problems/0020-valid-parentheses.ts) |
| #704 Binary Search | [`src/problems/0704-binary-search.ts`](../../src/problems/0704-binary-search.ts) |

Other Phase 1-2 packs still play through `normalizeStep` (legacy scene → heap).

## Why

- Interview learning needs **control flow + memory**, not only painted cells.
- Abstract stack/heap teaches ownership and references without drowning in JVM internals.
- Keeping existing visualizers inside heap objects preserves choreography while adding story context.
- Compat layer avoids rewriting every pack before the model is proven.

## How it works

1. Each storytelling step declares `narrative`, `why?`, `codeFocus`, `callStack`, `heap`.
2. Locals may be scalars or `{ ref: 'heapId' }` pointing at heap objects.
3. `MemoryStage` renders the beat; heap objects animate via the existing Array/Map/Stack viz.
4. Legacy steps only providing `message` + `scene` + `variables` are adapted automatically.

## How to verify

```bash
npm run dev
```

1. Open **Two Sum** - see call-stack locals, heap `nums` + `seen`, narrative/why, code line badge.
2. Step until the map hit - heap map and array both focus; result array appears.
3. Open **Valid Parentheses** - watch heap stack push/pop while code line tracks.
4. Open **Binary Search** - locals `left`/`right`/`mid` update as the heap window shrinks.
5. Open a non-retrofit pack (e.g. Contains Duplicate) - still plays via compat (scene → heap).
6. Switch languages mid-run - line highlight remaps; step index stays.
7. Confirm structure motion still animates (highlight transitions, stack topAction).
8. `npm run build` succeeds (verified).

## Open questions / follow-ups

- Retrofit remaining packs to native `callStack`/`heap` (not just compat).
- Phase 3 lists/trees should emit heap node graphs + multi-frame recursion stacks.
- Richer reference arrows (drawn edges from local → heap object) still TODO.
- UI brand pass remains Phase 5.

## Approval gate

**Do not start Phase 3 until this review is approved.**
