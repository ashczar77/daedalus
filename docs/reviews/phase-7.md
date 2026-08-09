# Phase 7 Review - jq track + Academy polish

**Status:** Complete - awaiting approval  
**Date:** 2026-08-09

## Goal

Dedicated **jq** lesson track on the simulated shell, plus Academy UX polish (hints, reset filesystem, keyboard help, terminal aesthetic).

## jq runtime

Teaching subset in [`src/academy/shell/jq.ts`](../../src/academy/shell/jq.ts):

- `.`, `.field`, `.["k"]`, `.[n]`, `.[]`
- `|`, `map(...)`, `select(...)`, `keys`, `length`
- object constructors `{a: .b}`
- flags `-r`, `-c`
- JSON fixtures under `/home/cadet/data/*.json`

## Curriculum ([`src/academy/lessons/jqTrack.ts`](../../src/academy/lessons/jqTrack.ts))

| # | Id | Topic |
|---|---|---|
| 15 | jq-identity | `jq .` |
| 16 | jq-field | field + `-r` |
| 17 | jq-index | `.users[0].name` |
| 18 | jq-map | `map(.name)` |
| 19 | jq-select | `select(.score > 90)` |
| 20 | jq-keys | `keys` |
| 21 | jq-reshape | `map({sku, price})` |
| 22 | jq-capstone | sale-tagged skus via `select(.tags[] == "sale")` |

Unlock chain: fundamentals capstone (`fund-ps-kill`) → `jq-identity` → … → `jq-capstone`.

## Polish

- Lesson **Hint** reveals progressive hints
- **Reset filesystem** restores lesson VFS
- **Keyboard** overlay (Enter / history / Tab)
- Catalog lock/done badges; Reset progress
- Shared Algorithms | Terminal nav

## Verify

```bash
npm run build
npm run dev
# /terminal → finish fundamentals → jq track → capstone
```

## Out of scope (held)

- Real containers / WASM Linux
- Ethical hacking / CTF
- Accounts / cloud sync
