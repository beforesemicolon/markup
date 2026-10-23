import 'global-jsdom/register'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRepeatCacheSuite } from './helpers/repeat-cache-suite.ts'
import { createRepeatDomSuite } from './helpers/repeat-dom-suite.ts'
import {
    countPositionalListWork,
    createPositionalListSuite,
} from './helpers/positional-list-suite.ts'

const options = {
    time: 0,
    iterations: 3,
    warmupTime: 0,
    warmupIterations: 2,
}

for (const size of [3, 60]) {
    for (const [name, createSuite] of [
        ['cache', createRepeatCacheSuite],
        ['DOM', createRepeatDomSuite],
        ['indexed DOM', createPositionalListSuite],
    ] as const) {
        test(`${name} size ${size}: every warmup and sample performs its operation`, async () => {
            const suite = createSuite(size, options)
            try {
                await suite.bench.run()
                for (const task of suite.bench.tasks) {
                    assert.equal(task.result?.error, undefined, task.name)
                    assert.equal(task.runs, options.iterations, task.name)
                    assert.equal(
                        suite.verifiedIterations.get(task.name),
                        options.iterations + options.warmupIterations,
                        `${task.name}: validate both warmup and measured iterations`
                    )
                    assert.equal(
                        task.result?.latency.samples.length,
                        options.iterations,
                        task.name
                    )
                }
            } finally {
                suite.dispose()
            }
        })
    }
}

// Odd size verifies that reversal leaves the center row's renderer cached;
// size 60 covers the batch-mount path. These are work counts, not timing gates.
for (const [size, renderers] of [
    [3, [4, 1, 2, 3]],
    [60, [61, 29, 60, 60]],
] as const) {
    test(`indexed lifecycle size ${size}: count only each declared update`, async () => {
        const report = await countPositionalListWork(size)
        assert.deepEqual(report.initial, {
            renderers: size,
            mounts: size,
            cleanups: 0,
        })
        assert.deepEqual(
            report.operations.map(({ counts }) => counts),
            [
                { renderers: renderers[0], mounts: 1, cleanups: 0 },
                { renderers: renderers[1], mounts: 0, cleanups: 1 },
                { renderers: renderers[2], mounts: 0, cleanups: 0 },
                { renderers: renderers[3], mounts: 0, cleanups: 0 },
            ]
        )
    })
}
