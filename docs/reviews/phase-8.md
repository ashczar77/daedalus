# Phase 8 Review - Shell mastery track + Academy score

**Status:** Complete  
**Date:** 2026-08-09

## Goal

Make Terminal Academy extensive enough for mastery: reinforcement lessons, advanced composition tools, and an XP / rank / badge loop that stays easy to extend when new tracks land.

## Curriculum

**Fundamentals** now introduce `grep` before pipes. **Shell mastery** adds contrast lessons plus spaced-practice drills; unlocks jq at the capstone.

Mastery highlights: globs, cp/rm, grep -v/-i, head vs tail, find, find|grep, cut, tee, env, quoting, `cd ..`, nav drill, text drill, compose lab, capstone.

Total catalog: 39 lessons (15 fundamentals + 16 mastery + 8 jq).

## Shell additions

- Glob expansion (`*`, `?`) and `$VAR` / `$?`
- `find`, `cut`, `tee`, `env`
- `grep -v`

## Score / rewards

- XP by lesson level (hints trim first-clear XP)
- Ranks: Cadet → Operator → Shellwright → Terminal Adept → Master Cadet
- Catalog scoreboard (XP + rank); no badge chips
- Progress in `daedalus.academy.progress.v2`

## Verify

```bash
npm run build
npm run dev
# /terminal → scoreboard → fundamentals → mastery → jq
```
