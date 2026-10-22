# Indexed large-list workload

This workload exercises the positional invalidation and retained-row behavior in PR #145 at 1,000 and 10,000 rows. It reports absolute observations from the current runtime; it does not compare correct index updates with an older runtime that left indices stale.

## Run

After `npm ci`, run from the repository root:

```bash
node --import tsx benchmarks/positional-list.bench.ts \
  --sizes 1000,10000 --samples 16 --warmup 5 \
  --output /tmp/markup-positional-list.json
```

These are also the default sizes and iteration counts. A 10,000-row reversal can take several minutes across the measured operations and untimed resets in JSDOM. For a shorter descriptive run, explicitly request `--samples 5 --warmup 2`; the report records those settings. Small samples are not evidence of a statistically established improvement or regression.

The JSON includes Node/OS/CPU, Tinybench and JSDOM versions, the dependency lockfile hash, the full runtime source commit and tree, benchmark-file hashes, sample counts, all latency samples, per-task mean/median/variability, validation counts, and separate lifecycle counts. Runtime source changes must be committed before measurement. Tinybench sorts its latency sample array; it is not a chronological execution trace.

## Work performed

Every row has a stable explicit `item.id` key. Its `li` contains index text, an `aria-posinset` value, and a button with the item name and a stable event handler. The timed renderer has no lifecycle hooks or counter increments.

- **Prepend:** insert one new row at the front; all existing indices change.
- **Middle removal:** remove index `floor(N / 2)`; later rows shift one position.
- **Reverse:** reverse the baseline list; every index changes for the default even sizes.
- **Immutable update:** replace every item object and change every name, keeping IDs and order stable. This exercises visible value updates as well as identity-preserving template rebinding.

Before **every warmup and measured sample**, restore the exact N-row baseline, await its rendering, verify its contents, capture row DOM identities, and allocate the next input. Tinybench's `beforeEach` hook keeps this work outside the clock. The measured callback contains only the state write and the rendering microtask wait. The `afterEach` hook verifies row count, order, names, index text, `aria-posinset`, and every surviving row's DOM identity. Initial mounting and final unmounting are outside the clock too.

A separate pass uses the same fixture and operations with renderer, mount, and cleanup counters. Each count starts after the baseline has been restored; reset and final teardown work are excluded. Rendering a shifted row is required even when its mounted DOM survives. The assertions require these counts:

| Operation        | Renderers at 1,000 rows | Renderers at 10,000 rows | New mounts | Cleanups |
| ---------------- | ----------------------: | -----------------------: | ---------: | -------: |
| Prepend          |                   1,001 |                   10,001 |          1 |        0 |
| Middle removal   |                     499 |                    4,999 |          0 |        1 |
| Reverse          |                   1,000 |                   10,000 |          0 |        0 |
| Immutable update |                   1,000 |                   10,000 |          0 |        0 |

Initial mounting is counted separately as N renderer calls and N mounts. An odd-sized reversal leaves its center row at the same index, so that row's renderer remains cached.

## Validation and interpretation

```bash
node --import tsx benchmarks/benchmark-smoke.test.ts
```

The existing smoke command also runs this timing fixture at sizes 3 and 60 with two warmups and three measured samples per operation. It verifies every iteration and separately checks literal expected lifecycle counts. Size 3 exercises the unchanged center of an odd reversal; size 60 exercises batch mounting. CI has no latency threshold.

These timings measure JavaScript and simulated DOM work in JSDOM, including correct positional updates. They do not measure native browser layout, paint, user interaction latency, or retained browser heap. This indexed-row workload also differs from the older FS-like fixture, so their absolute timings are not interchangeable. Repeat comparable runs before attributing small changes to code; preserve the reported commit, options, environment, and correctness results with any published numbers.
