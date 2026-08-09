# Phase 2 Review - Array / window / stack packs + StackViz

**Status:** Complete - awaiting approval before Phase 3  
**Date:** 2026-08-07

## Goal

Add a Stack visualizer and ship the remaining Phase 2 problems from the progress list: Valid Palindrome, Container With Most Water, Best Time to Buy and Sell Stock, Valid Anagram, Valid Parentheses, and Evaluate Reverse Polish Notation - each with Java / Kotlin / Python sources, curated steps, comments, and benchmark placeholders.

## What changed

### Engine / visualizers
| Path | Change |
|---|---|
| [`src/engine/types.ts`](../../src/engine/types.ts) | Added `StackScene` (`items`, optional `topAction`) to the `Scene` union |
| [`src/visualizers/StackViz.tsx`](../../src/visualizers/StackViz.tsx) | Vertical stack UI (bottom→top) with push/pop/peek/mismatch cues |
| [`src/visualizers/SceneRenderer.tsx`](../../src/visualizers/SceneRenderer.tsx) | Dispatches `stack` scenes; hashmap no longer the fallback |
| [`src/visualizers/SceneRenderer.css`](../../src/visualizers/SceneRenderer.css) | Group layout uses auto-fit columns (supports 3-panel anagram scenes) |
| [`src/problems/benchmarkPlaceholders.ts`](../../src/problems/benchmarkPlaceholders.ts) | Shared illustrative `BenchmarkData` helper |

### New algorithm packs
| Problem | Sources | Pack |
|---|---|---|
| #125 Valid Palindrome | [`algorithms/0125-valid-palindrome/`](../../algorithms/0125-valid-palindrome/) | [`src/problems/0125-valid-palindrome.ts`](../../src/problems/0125-valid-palindrome.ts) |
| #11 Container With Most Water | [`algorithms/0011-container-with-most-water/`](../../algorithms/0011-container-with-most-water/) | [`src/problems/0011-container-with-most-water.ts`](../../src/problems/0011-container-with-most-water.ts) |
| #121 Best Time to Buy and Sell Stock | [`algorithms/0121-best-time-to-buy-and-sell-stock/`](../../algorithms/0121-best-time-to-buy-and-sell-stock/) | [`src/problems/0121-best-time-to-buy-and-sell-stock.ts`](../../src/problems/0121-best-time-to-buy-and-sell-stock.ts) |
| #242 Valid Anagram | [`algorithms/0242-valid-anagram/`](../../algorithms/0242-valid-anagram/) | [`src/problems/0242-valid-anagram.ts`](../../src/problems/0242-valid-anagram.ts) |
| #20 Valid Parentheses | [`algorithms/0020-valid-parentheses/`](../../algorithms/0020-valid-parentheses/) | [`src/problems/0020-valid-parentheses.ts`](../../src/problems/0020-valid-parentheses.ts) |
| #150 Evaluate RPN | [`algorithms/0150-evaluate-reverse-polish-notation/`](../../algorithms/0150-evaluate-reverse-polish-notation/) | [`src/problems/0150-evaluate-reverse-polish-notation.ts`](../../src/problems/0150-evaluate-reverse-polish-notation.ts) |

Registry now lists **10** problems: [`src/problems/registry.ts`](../../src/problems/registry.ts).

## Why

- **Stack as a first-class scene** keeps parentheses / RPN on the same language-agnostic step schema as arrays and maps.
- **Group scenes** let stack problems show the input string/tokens beside the live stack.
- **Shared `placeholderBenchmark`** avoids copy-pasting illustrative timing blobs while keeping the `benchmark` field required on every pack.
- Continued Phase 1 standards: intent comments, clear names, algorithm file headers with matching `codeFocus`.

## How it works

1. Stack steps set `scene.type = 'stack'` (often inside a `group` with an array).
2. `StackViz` draws items bottom→top and tags the top cell with the last action.
3. New packs register in `problems` so the catalog and `/problems/:id` routes pick them up.

## How to verify

```bash
npm run dev
```

1. Catalog shows 10 problems.
2. **Valid Parentheses** / **Evaluate RPN** - stack grows/shrinks with push/pop cues.
3. **Valid Palindrome** - pointers skip spaces and fail on `e` vs `a`.
4. **Container With Most Water** - best area becomes 49 at indices 1 and 8.
5. **Best Time to Buy and Sell Stock** - buy at 1, sell at 6, profit 5.
6. **Valid Anagram** - counts settle to empty nonzero map → true.
7. Language tabs still remaps highlights without resetting the step.
8. `npm run build` succeeds (verified).

## Open questions / follow-ups

- Linked list + tree visualizers and remaining PROGRESS problems are Phase 3.
- Custom inputs for all types still Phase 4.
- Benchmark numbers remain placeholders.
- Outstanding Phase 1 rename/comment commit may still need pushing with this phase.

## Approval gate

**Do not start Phase 3 until this review is approved.**
