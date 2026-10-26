# Markup repeated-rendering benchmarks

These suites measure `repeat` cache bookkeeping and DOM work. Every warmup and measured iteration starts from the declared fixture size, performs the named operation, and checks the result.

## Prerequisites

- Node.js >= 22.13.0
- Development dependencies installed with `npm ci`

## Commands

```bash
npm run benchmark             # Default reports
npm run benchmark:repeat      # Pure JavaScript cache bookkeeping
npm run benchmark:dom         # DOM mounting and updates in JSDOM
npm run benchmark:reactive    # Lifecycle operation counts
npm run benchmark:positional  # Opt-in 1,000/10,000-row indexed updates
npm run test:benchmarks       # Fast correctness smoke tests; no timing thresholds
```

The [large-list positional workload](./positional-list.md) verifies index text,
ARIA positions, and surviving DOM identity, with lifecycle counts collected
separately from elapsed time. The 10,000-row cases can take several minutes in
JSDOM, so they are opt-in rather than part of the default benchmark command.

The smoke test can also run directly:

```bash
node --import tsx benchmarks/benchmark-smoke.test.ts
```

## What is timed

The suites use the locked Tinybench 6 API: per-task `beforeEach` and `afterEach` hooks run outside the timed function, during both warmup and measurement. Suite-wide setup alone would not reset individual samples. Each suite explicitly enables `retainSamples` (off by default in Tinybench 6), preserving measured latency samples for correctness checks and the positional JSON report. This does not change the timed operation or include warmup samples in the report.

- **Cache evaluation:** time the `repeat` evaluator. Initial evaluation starts with a new cache; update scenarios start with a populated baseline cache. Input array allocation, immutable copies, baseline restoration, and assertions are outside the timer.
- **Initial DOM mount:** time `.render()` on a fresh template. Host and outer template creation, result checks, and `.unmount()` are outside the timer. Rendering child templates is part of the mount. Compiled template caches can be warm; this is not a cold JavaScript engine or first-page-load measurement.
- **DOM updates:** restore and flush the baseline before every iteration, then time the state write and the microtask that flushes rendering. Prepare new arrays and objects outside the timer. Check row counts, order, surviving node identities, and renderer calls after timing.
- **Same-array state updates:** explicitly labeled **No-op** because `state` ignores an identical reference. The DOM case includes the same microtask wait as other updates but performs no rendering. A direct cache reevaluation with the same array still executes the `repeat` evaluator.
- **Append/prepend/remove:** start from exactly N rows every time and finish with N+1/N+1/N−1 rows. Restoring the baseline is not included in the reported time. Warmup cannot turn removal into an already-removed cache hit or append into replacement of a previous appended row.

Counters increment when a renderer is called; assertions and fixture reset are not measured. Timed DOM renderers omit lifecycle counters to avoid instrumentation overhead. Lifecycle hooks no longer prevent matching keyed templates from being rebound.

## Correctness and failure reporting

`test:benchmarks` runs the same registered tasks with two warmup and three measured iterations at sizes 3 and 60. It verifies every iteration, including warmup, and checks sample and validation counts. Size 60 also exercises the batch-mount threshold. No machine-dependent performance threshold is enforced in CI.

All benchmark commands fail with a nonzero exit status if an assertion or task fails. The fast smoke suite checks both the fixtures and the task hooks, rather than running a separate implementation of the operations.

The lifecycle report resets to its baseline before each scenario too. Its renderers deliberately install lifecycle hooks and assert that immutable copies preserve retained rows without new mounts or cleanups. These are operation counts from an instrumented workload, not timing results. New `visible()` and `suspense()` instances remain separate stateful lifetimes; this report measures ordinary row templates.

## Comparing results

Run baseline and candidate revisions on the same machine and Node version with the same dependency lockfile. Keep background work and memory pressure comparable, and repeat runs rather than treating a single noisy sample as a regression. Save complete reports with their environment and commit information.

JSDOM measures JavaScript and simulated DOM work. It does not measure browser layout, paint, interaction latency, or native-browser heap retention; confirm conclusions about those costs in a browser.

### Positional invalidation

The repeat cache skips the renderer only when key, item reference, and index all stay unchanged. After a prepend, removal, or reversal, shifted rows run their renderers again so index-derived text and accessibility attributes stay correct. This extra renderer work is intentional even when row DOM is retained. Assertions include these calls; earlier measurements that skipped index updates are not equivalent workloads.

For a baseline of `n` rows, append renders one new row; prepend renders `n + 1` rows; removing the middle row renders the rows after it; reversing renders every row whose index changed. Stable references at unchanged indices still use the cache. Same-template immutable updates can now retain reactive children, nested templates, and ordinary lifecycle-bearing row DOM.

## Informational bundle-size comparison

PR CI builds the exact base and head source archives with one installed toolchain
and the same production browser command. It verifies source blob hashes, reports
raw/default-gzip/default-Brotli bytes, and publishes a job summary and artifacts.
There is no size threshold; review intentional increases alongside their behavior.
The JSON records compiler and compression versions, source and lockfile hashes,
and the exact measured bundle hashes.

Reproduce from a checkout with both full commit SHAs available and `npm ci` completed:

```bash
npm run report:bundle-size -- \
  --base 1fd15c5e431bc327887dd2c0cc8b526830e5a95d \
  --head 7ab137aa2c115ef0702e19bd86c4f9b7d7a7447a \
  --output /tmp/markup-bundle-size
npm run test:size-report
```

This controls the installed toolchain for both revisions, including after a
dependency upgrade. It compares source changes under that toolchain; separate
historical installations and stale README sizes are not the baseline.
