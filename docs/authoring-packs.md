# Authoring problem packs

Checklist for adding a new algorithm pack to Daedalus.

1. Reuse an input kind, or add one kind module if the structure is new.
2. Set `defaultRaw` + limits + `formatLabel`.
3. Implement `generateSteps` including empty/edge paths.
4. Register the pack; keep `steps = generateSteps(default)`.
5. Do not edit `ProblemPage` / `InputPanel` unless adding a new field kind.

## Constraints

Hard caps on length/nodes/values/step budget. Invalid input never reaches generators. Legal edge cases (empty, not found, no cycle) get short honest traces.

## Layout

| Path | What to add |
| --- | --- |
| `algorithms/<lc>-<name>/` | `Solution.java`, `Solution.kt`, `solution.py` |
| `src/problems/<lc>-<name>.ts` | Pack: metadata, `defineInput`, `generateSteps` |
| `src/problems/registry.ts` | Register the pack |

Reuse an existing visualizer when you can; add a scene/heap kind only when the structure is new.

## Local review notes

After shipping a path, pack batch, or major feature, write a short note under
`docs/reviews/` (gitignored). Keep it concrete: goal, what landed, how to verify.
Do not commit review docs to GitHub.

## Verify

```bash
npm test
npm run build
npm run dev
```
