# Phase 5 Review — Terminal Academy runtime + lesson engine

**Status:** Complete — awaiting approval before Phase 6 content is treated as locked  
**Date:** 2026-08-09

## Goal

Ship a sibling **Terminal Academy** mode inside Daedalus: simulated shell, lesson packs, checkers, progress gating, and a short starter curriculum (framework complete for Phases 6–7).

## What changed

| Area | Path |
|---|---|
| Types / lessons | [`src/academy/types.ts`](../../src/academy/types.ts), [`src/academy/lessons/*`](../../src/academy/lessons/) |
| Simulated VFS + shell | [`src/academy/shell/*`](../../src/academy/shell/) |
| Checkers + progress | [`src/academy/check/*`](../../src/academy/check/), [`src/academy/progress.ts`](../../src/academy/progress.ts) |
| UI | [`src/components/Terminal.tsx`](../../src/components/Terminal.tsx), [`src/pages/CatalogPage.tsx`](../../src/pages/CatalogPage.tsx) (shared Daedalus home + terminal catalog), [`src/pages/AcademyLessonPage.tsx`](../../src/pages/AcademyLessonPage.tsx) |
| Nav / routes | [`src/components/ModeSwitch.tsx`](../../src/components/ModeSwitch.tsx), [`src/App.tsx`](../../src/App.tsx) |

### Runtime (v1 command set + more)
- VFS with modes; cwd/env/history/transcript
- Commands: `pwd` `cd` `ls`/`ls -la` `cat` `echo` `mkdir` `touch` `cp` `mv` `rm` `chmod` `help` `clear`
- Also wired early for later phases: pipes, redirects, text tools, `ps`/`kill`, `jq`
- Checkers: cwd, file exists/missing/equals/contains, stdout, mode, process, exit
- Progress in `localStorage` with unlock graph

### Starter lessons
Fundamentals 01–05 style openers (pwd, ls, cd, cat, hidden files) plus the rest of the fundamentals/jq tracks land in Phases 6–7 docs.

## Verify

```bash
npm run dev
# open /terminal — first lesson unlocked
# complete “Where am I?” with pwd → Check → next unlocks
npm run build
```

## Notes

- Simulated shell only (no Docker/WASM).
- Algorithm packs/player untouched aside from shared `ModeSwitch` on the home shell.

**Do not treat Phase 6 as approved until this review is signed off.**
