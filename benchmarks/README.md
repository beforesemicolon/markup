# Markup repeated-rendering benchmarks

These suites measure `repeat` cache bookkeeping and DOM work. Every warmup and measured iteration starts from the declared fixture size, performs the named operation, and checks the result.

## Prerequisites

- Node.js >= 22.13.0
- Development dependencies installed with `npm ci`

## Commands

```bash
npm run benchmark             # All reports
npm run benchmark:repeat      # Pure JavaScript cache bookkeeping
npm run benchmark:dom         # DOM mounting and updates in JSDOM
npm run benchmark:reactive    # Lifecycle operation counts
npm run test:benchmarks       # Fast correctness smoke tests; no timing thresholds
```

The smoke test can also run directly:

```bash
node --import tsx benchmarks/benchmark-smoke.test.ts
```

## What is timed

The suites use the locked Tinybench 3 API: per-task `beforeEach` and `afterEach` hooks run outside the timed function, during both warmup and measurement. Suite-wide setup alone would not reset individual samples.

- **Cache evaluation:** time the `repeat` evaluator. Initial evaluation starts with a new cache; update scenarios start with a populated baseline cache. Input array allocation, immutable copies, baseline restoration, and assertions are outside the timer.
- **Initial DOM mount:** time `.render()` on a fresh template. Host and outer template creation, result checks, and `.unmount()` are outside the timer. Rendering child templates is part of the mount. Compiled template caches can be warm; this is not a cold JavaScript engine or first-page-load measurement.
- **DOM updates:** restore and flush the baseline before every iteration, then time the state write and the microtask that flushes rendering. Prepare new arrays and objects outside the timer. Check row counts, order, surviving node identities, and renderer calls after timing.
- **Same-array state updates:** explicitly labeled **No-op** because `state` ignores an identical reference. The DOM case includes the same microtask wait as other updates but performs no rendering. A direct cache reevaluation with the same array still executes the `repeat` evaluator.
- **Append/prepend/remove:** start from exactly N rows every time and finish with N+1/N+1/N−1 rows. Restoring the baseline is not included in the reported time. Warmup cannot turn removal into an already-removed cache hit or append into replacement of a previous appended row.

Counters increment when a renderer is called; assertions and fixture reset are not measured. Timed DOM renderers do not install lifecycle hooks, since those hooks change whether existing templates can be rebound.

## Correctness and failure reporting

`test:benchmarks` runs the same registered tasks with two warmup and three measured iterations at sizes 3 and 60. It verifies every iteration, including warmup, and checks sample and validation counts. Size 60 also exercises the batch-mount threshold. No machine-dependent performance threshold is enforced in CI.

All benchmark commands fail with a nonzero exit status if an assertion or task fails. The fast smoke suite checks both the fixtures and the task hooks, rather than running a separate implementation of the operations.

The lifecycle report resets to its baseline before each scenario too. Its renderers deliberately install lifecycle hooks, so immutable copies can have different mount/reuse behavior from the uninstrumented timing suite. Counts describe that instrumented case and should not be presented as the normal renderer's cost.

## Comparing results

Run baseline and candidate revisions on the same machine and Node version with the same dependency lockfile. Keep background work and memory pressure comparable, and repeat runs rather than treating a single noisy sample as a regression. Save complete reports with their environment and commit information.

JSDOM measures JavaScript and simulated DOM work. It does not measure browser layout, paint, interaction latency, or native-browser heap retention; confirm conclusions about those costs in a browser.
