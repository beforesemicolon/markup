import 'global-jsdom/register'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRepeatCacheSuite } from './helpers/repeat-cache-suite.ts'
import { createRepeatDomSuite } from './helpers/repeat-dom-suite.ts'

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
