# Phase 3 Review — Linked lists + trees on the storytelling model

**Status:** Approved — Phase 4 started  
**Date:** 2026-08-07  
**Approved:** 2026-08-08

## Goal

Add LinkedList + Tree heap visualizers and ship the remaining PROGRESS problems: Reverse Linked List, Merge Two Sorted Lists, Linked List Cycle, Invert Binary Tree, Maximum Depth, Same Tree, Diameter of Binary Tree — with Java/Kotlin/Python sources and call-stack/heap storytelling beats.

## What changed

### Visualizers / engine
| Path | Change |
|---|---|
| [`src/engine/types.ts`](../../src/engine/types.ts) | `LinkedListScene`, `TreeScene`; heap kinds `linkedList` + `tree` |
| [`src/visualizers/LinkedListViz.tsx`](../../src/visualizers/LinkedListViz.tsx) | Nodes, pointers, cycle annotation |
| [`src/visualizers/TreeViz.tsx`](../../src/visualizers/TreeViz.tsx) | Layered SVG binary-tree layout + focus |
| [`src/components/HeapPanel.tsx`](../../src/components/HeapPanel.tsx) | Renders new heap kinds |
| [`src/engine/normalizeStep.ts`](../../src/engine/normalizeStep.ts) | Legacy scene → heap for list/tree |
| [`src/visualizers/SceneRenderer.tsx`](../../src/visualizers/SceneRenderer.tsx) | Dispatches list/tree scenes |

### New packs (17 total catalog)
| LC | Pack module |
|---|---|
| #206 | [`src/problems/0206-reverse-linked-list.ts`](../../src/problems/0206-reverse-linked-list.ts) |
| #21 | [`src/problems/0021-merge-two-sorted-lists.ts`](../../src/problems/0021-merge-two-sorted-lists.ts) |
| #141 | [`src/problems/0141-linked-list-cycle.ts`](../../src/problems/0141-linked-list-cycle.ts) |
| #226 | [`src/problems/0226-invert-binary-tree.ts`](../../src/problems/0226-invert-binary-tree.ts) |
| #104 | [`src/problems/0104-maximum-depth-of-binary-tree.ts`](../../src/problems/0104-maximum-depth-of-binary-tree.ts) |
| #100 | [`src/problems/0100-same-tree.ts`](../../src/problems/0100-same-tree.ts) |
| #543 | [`src/problems/0543-diameter-of-binary-tree.ts`](../../src/problems/0543-diameter-of-binary-tree.ts) |

Sources under [`algorithms/`](../../algorithms/) for each id. Registry: [`src/problems/registry.ts`](../../src/problems/registry.ts).

## Why

- List/tree problems need heap node graphs and (for DFS) multi-frame call stacks — the Phase 2b storytelling model.
- Floyd cycle and pointer reversal only click when pointers and links are visible together.
- Diameter/max-depth teach the difference between returned height and global answers via stacked frames.

## How to verify

```bash
npm run dev
```

1. Catalog shows **17** problems.
2. **Reverse Linked List** — watch prev/cur/next rewire the heap chain.
3. **Linked List Cycle** — slow/fast meet; cycle annotation visible.
4. **Merge Two Sorted Lists** — dummy + splice story.
5. **Invert / Max Depth / Same Tree / Diameter** — tree SVG + recursion frames where authored.
6. Language tabs still remap line focus.
7. `npm run build` succeeds (verified).

## Open questions / follow-ups

- Drawn SVG cycle arcs (vs text annotation) and reference arrows still polish TODOs.
- Phase 4: custom inputs for all problem types.
- Phase 5: full visual identity pass.

## Approval gate

**Do not start Phase 4 until this review is approved.**
