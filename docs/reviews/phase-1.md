# Phase 1 Review — Foundation + first array problems

**Status:** Complete — awaiting approval before Phase 2  
**Date:** 2026-08-07

## Goal

Stand up the Daedalus app shell, language-agnostic step/playback engine, Array + HashMap visualizers, and ship four end-to-end problems with Java / Kotlin / Python solutions, curated traces, and basic cross-language perf charts.

## What changed

### App scaffold & routing
| Path | Change |
|---|---|
| Vite React+TS scaffold | Created project (`npm create vite`) |
| [`package.json`](../../package.json) | Added `react-router-dom` |
| [`src/main.tsx`](../../src/main.tsx) | Wired `BrowserRouter` |
| [`src/App.tsx`](../../src/App.tsx) | Routes: catalog `/`, problem `/problems/:problemId` |
| [`src/index.css`](../../src/index.css) | Design tokens, Syne / Source Sans 3 / IBM Plex Mono, cool mist palette |
| [`index.html`](../../index.html) | Title → Daedalus |

### Engine
| Path | Change |
|---|---|
| [`src/engine/types.ts`](../../src/engine/types.ts) | `Step`, `Scene` (array / hashmap / group), `ProblemPack`, perf types |
| [`src/engine/usePlayback.ts`](../../src/engine/usePlayback.ts) | Play / pause / step ±1 / scrub / speed / reset |

### Visualizers & UI
| Path | Change |
|---|---|
| [`src/visualizers/ArrayViz.tsx`](../../src/visualizers/ArrayViz.tsx) | Array cells, highlight roles, pointer labels |
| [`src/visualizers/HashMapViz.tsx`](../../src/visualizers/HashMapViz.tsx) | Map/set entry chips with focus keys |
| [`src/visualizers/SceneRenderer.tsx`](../../src/visualizers/SceneRenderer.tsx) | Dispatches scenes; supports `group` composites |
| [`src/components/CodePanel.tsx`](../../src/components/CodePanel.tsx) | Language tabs + line highlight |
| [`src/components/VariableInspector.tsx`](../../src/components/VariableInspector.tsx) | Current-step locals |
| [`src/components/PlayerControls.tsx`](../../src/components/PlayerControls.tsx) | Transport + scrubber |
| [`src/components/PerfPanel.tsx`](../../src/components/PerfPanel.tsx) | Big-O, insight/invariant, language runtime bars |
| [`src/pages/CatalogPage.tsx`](../../src/pages/CatalogPage.tsx) | Brand-first catalog |
| [`src/pages/ProblemPage.tsx`](../../src/pages/ProblemPage.tsx) | Stage + code + controls + perf |

### Problem packs (algorithms + traces)
| Problem | Sources | Pack module |
|---|---|---|
| #1 Two Sum | [`algorithms/0001-two-sum/`](../../algorithms/0001-two-sum/) | [`src/problems/0001-two-sum.ts`](../../src/problems/0001-two-sum.ts) |
| #217 Contains Duplicate | [`algorithms/0217-contains-duplicate/`](../../algorithms/0217-contains-duplicate/) | [`src/problems/0217-contains-duplicate.ts`](../../src/problems/0217-contains-duplicate.ts) |
| #167 Two Sum II | [`algorithms/0167-two-sum-ii/`](../../algorithms/0167-two-sum-ii/) | [`src/problems/0167-two-sum-ii.ts`](../../src/problems/0167-two-sum-ii.ts) |
| #704 Binary Search | [`algorithms/0704-binary-search/`](../../algorithms/0704-binary-search/) | [`src/problems/0704-binary-search.ts`](../../src/problems/0704-binary-search.ts) |

Registry: [`src/problems/registry.ts`](../../src/problems/registry.ts)  
Sample perf JSON: [`public/perf/0001-two-sum.json`](../../public/perf/0001-two-sum.json) (charts currently read embedded pack data)

## Why

- **Curated `Step[]` schema first** keeps the UI language-agnostic so a future playground can emit the same frames.
- **`group` scenes** let Two Sum / Contains Duplicate show array + map together without a one-off visualizer.
- **Source files live under `algorithms/`** and are imported with Vite `?raw`, so the Code panel shows real Java/Kotlin/Python you can later feed to runners/benchmarks.
- **Perf is precomputed placeholders** for Phase 1 — enough to teach the UI and language-constant story; Phase 4 can replace with measured offline benchmarks.
- **Default language Java** matches your learning repo; switching language remaps line focus without resetting the step.

## How it works

1. Catalog lists packs from `problems` registry.
2. Problem page loads a `ProblemPack`, feeds `steps` into `usePlayback`.
3. Each step drives: message, `SceneRenderer`, variable inspector, and `codeFocus[language]`.
4. Below the fold, `PerfPanel` shows complexity + insight/invariant + bar chart of Java vs Kotlin vs Python.

## How to verify

```bash
npm install
npm run dev
```

Then:

1. Open the home page — brand **Daedalus** and 4 problem cards.
2. Open **Two Sum** — step through; confirm map fills and lines highlight per language tab.
3. Switch Java → Kotlin → Python mid-playback; step index should stay put, highlight line should change.
4. Open **Binary Search** — confirm window / discard / found roles and pointer labels.
5. Open **Two Sum II** — opposite-end pointers move correctly.
6. Open **Contains Duplicate** — set chips grow until duplicate found.
7. Confirm Play / Pause / scrubber / speed cycle work.
8. `npm run build` succeeds (verified during this phase).

## Open questions / follow-ups

- Perf numbers are illustrative, not measured — replace in the benchmark pipeline phase.
- No custom input yet (Phase 4).
- Stack / linked list / tree visualizers deferred to Phases 2–3.
- Remaining 13 problems from `PROGRESS.md` not yet authored.

## Approval gate

**Do not start Phase 2 until this review is approved.**
