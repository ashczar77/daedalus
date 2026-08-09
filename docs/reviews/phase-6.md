# Phase 6 Review - Unix fundamentals track

**Status:** Complete - awaiting approval before Phase 7 polish is considered locked  
**Date:** 2026-08-09

## Goal

Coherent gated path: navigation → files → redirects → pipes/text tools → permissions → simulated processes.

## Curriculum ([`src/academy/lessons/fundamentals.ts`](../../src/academy/lessons/fundamentals.ts))

| # | Id | Topic |
|---|---|---|
| 1 | fund-pwd | pwd |
| 2 | fund-ls | ls |
| 3 | fund-cd | cd |
| 4 | fund-cat | cat |
| 5 | fund-hidden | ls -a |
| 6 | fund-mkdir-mv | mkdir + mv |
| 7 | fund-echo-redir | echo + `>` |
| 8 | fund-append | `>>` |
| 9 | fund-pipe-grep | pipes + grep |
| 10 | fund-wc | wc -l |
| 11 | fund-sort-uniq | sort \| uniq |
| 12 | fund-head-tail | tail -n |
| 13 | fund-chmod | chmod 755 |
| 14 | fund-ps-kill | ps + kill (fake process table) |

## Shell additions used by this track

- Pipes `|`, redirects `>` `>>` `<`
- `grep`, `wc`, `head`, `tail`, `sort`, `uniq`
- `chmod` + `ls -l` mode display
- `ps` / `kill` against lesson-scoped fake processes

## Verify

1. Reset Academy progress.
2. Walk fund-pwd → fund-ps-kill; each Check unlocks the next.
3. Confirm dishonest shortcuts fail (wrong cwd, missing file, wrong mode).
4. `npm run build`

**Phase 7 (jq + polish) follows after approval.**
