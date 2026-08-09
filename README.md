# Daedalus

In the old stories, Daedalus was the craftsman who built the Labyrinth: clever enough to design a maze you could get lost in, and careful enough to leave himself a way through it. That is roughly the spirit of this project. Interview algorithms can feel like a maze of pointers, stacks, and recursive returns. Daedalus is here so you can walk the path with the lights on.

This repo is a browser lab for stepping through coding-interview algorithms (and a small Terminal Academy for shell basics). You get curated execution traces, animated structures, and the same idea shown in Java, Kotlin, and Python side by side.

**Repo:** https://github.com/ashczar77/daedalus

![Daedalus catalog](docs/media/catalog.png)

## What you can do here

**Algorithm lab.** Open a problem from the catalog, hit play or step one beat at a time, and watch the heap and call stack move with the narrative. Arrays, maps, stacks, linked lists, trees, and sorting bars all have their own drawings. Custom inputs are supported on the packs that ship generators, so you are not stuck with a single demo case.

![Invert Binary Tree player](docs/media/player-invert-tree.png)

**Terminal Academy.** Terminal has gated shell lessons on a simulated filesystem: fundamentals, a mastery track with reinforcement drills, and a jq workshop. Completing lessons earns XP and ranks. Progress stays in local storage on your machine.

![Terminal Academy catalog](docs/media/terminal-catalog.png)

![Terminal lesson](docs/media/terminal-lesson.png)

## Develop

```bash
npm install
npm run dev
```

Production build (includes trace validation):

```bash
npm run build
```

Other scripts:

```bash
npm test                  # unit + integration tests (Vitest)
npm run validate:traces   # check curated traces against sources
npm run lint
npm run preview           # serve the production build locally
```

`npm run build` runs trace validation and the test suite before compiling.

## Project layout (rough map)

| Path | What lives there |
| --- | --- |
| `algorithms/` | Java / Kotlin / Python solutions the player highlights |
| `src/problems/` | Packs: steps or generators, metadata, registry |
| `src/engine/` | Playback, step normalization, shared input parsing |
| `src/visualizers/` | Structure drawings (arrays, trees, lists, etc.) |
| `src/academy/` | Terminal Academy lessons, VFS shell, checkers |
| `src/pages/` | Catalog, problem player, academy lesson page |
| `docs/reviews/` | Phase write-ups we use as stage gates |
| `docs/media/` | Screenshots used in this README |

## Notes and limits

- Benchmark numbers on the player are placeholders for teaching the UI story, not live timings from your machine.
- The academy shell is simulated on purpose. It teaches a useful subset of commands. It is not a full Linux userspace and it will not run arbitrary programs.
- Trace validation runs as part of `npm run build`. If a pack's story and `codeFocus` drift apart, the build should complain.

## License / status

Personal learning lab under active development. Clone it, break it, send a PR if you make something nicer.
