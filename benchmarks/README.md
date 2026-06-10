# Markup repeated-rendering benchmarks

This directory contains benchmarking suites to measure the bookkeeping and DOM rendering overhead of the `repeat` helper.

## Prerequisites

-   Node.js >= 18.16.0
-   Development dependencies installed (`npm install`)

## Benchmark Commands

Run all benchmarks:

```bash
npm run benchmark
```

Or run individual benchmark suites:

-   **Repeat Cache (pure JS bookkeeping)**:
    ```bash
    npm run benchmark:repeat
    ```
-   **Repeat DOM (mounting/rendering in JSDOM)**:
    ```bash
    npm run benchmark:dom
    ```
-   **Reactive List Lifecycle (tracking callback execution counts)**:
    ```bash
    npm run benchmark:reactive
    ```

## Methodology & Guidelines

1. **Machine Consistency**: Always run baseline and comparison benchmarks on the **same machine**. Variations in CPU, memory pressure, and background tasks can introduce up to 15% noise.
2. **Warmup & Garbage Collection**: The benchmarking engine performs warm-up cycles to compile hot paths. Avoid running CPU-heavy applications during runs.
3. **Comparing Versions**:
    - Save your baseline results into a local file (e.g. `baseline.txt`).
    - Checkout the branch/commit to test.
    - Run benchmarks again and compare the output side-by-side.
