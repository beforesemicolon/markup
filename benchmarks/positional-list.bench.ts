import 'global-jsdom/register'
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import { parseArgs, promisify } from 'node:util'
import {
    countPositionalListWork,
    createPositionalListSuite,
} from './helpers/positional-list-suite.ts'

const { values } = parseArgs({
    options: {
        sizes: { type: 'string', default: '1000,10000' },
        samples: { type: 'string', default: '16' },
        warmup: { type: 'string', default: '5' },
        output: { type: 'string' },
    },
})
const sizes = values.sizes!.split(',').map(Number)
const samples = Number(values.samples)
const warmup = Number(values.warmup)
assert.ok(
    sizes.length > 0 && sizes.every((n) => Number.isSafeInteger(n) && n > 0)
)
assert.ok(Number.isSafeInteger(samples) && samples > 0)
assert.ok(Number.isSafeInteger(warmup) && warmup >= 0)

const exec = promisify(execFile)
const git = async (...args: string[]) =>
    (await exec('git', args, { encoding: 'utf8' })).stdout.trim()
const sha256 = (bytes: string | Buffer) =>
    createHash('sha256').update(bytes).digest('hex')
const version = (name: string) =>
    JSON.parse(readFileSync(`node_modules/${name}/package.json`, 'utf8'))
        .version
const harnessFiles = [
    'benchmarks/positional-list.bench.ts',
    'benchmarks/helpers/positional-list-suite.ts',
    'benchmarks/helpers/fixtures.ts',
    'benchmarks/helpers/scenarios.ts',
]

async function run() {
    const output = {
        started_at: new Date().toISOString(),
        finished_at: '',
        environment: {
            node: process.version,
            os: `${os.type()} ${os.release()} ${os.arch()}`,
            cpu: os.cpus()[0]?.model,
            logical_cpus: os.cpus().length,
            tinybench: version('tinybench'),
            jsdom: version('jsdom'),
            lock_sha256: sha256(readFileSync('package-lock.json')),
            source_commit: await git('rev-parse', 'HEAD'),
            source_tree: await git('rev-parse', 'HEAD:src'),
            source_dirty:
                (await git('status', '--porcelain', '--', 'src')) !== '',
            harness_sha256: Object.fromEntries(
                harnessFiles.map((file) => [file, sha256(readFileSync(file))])
            ),
        },
        workload: {
            sizes,
            key: 'item.id',
            row: 'li with index text, aria-posinset, and a button with a stable event handler',
            immutable: 'new object and changed name for every row',
            timings:
                'state write + rendering microtask; no lifecycle hooks or counters',
            excluded:
                'initial mount, fixture reset, input allocation, assertions, final unmount',
            counts: 'separate instrumented pass; reset and teardown excluded',
        },
        options: {
            time: 0,
            iterations: samples,
            warmupTime: 0,
            warmupIterations: warmup,
        },
        timings: [] as Array<Record<string, unknown>>,
        counts: [] as Array<Record<string, unknown>>,
    }
    assert.equal(
        output.environment.source_dirty,
        false,
        'commit runtime changes before measuring'
    )
    const save = () => {
        if (values.output) {
            writeFileSync(values.output, `${JSON.stringify(output, null, 2)}\n`)
        }
    }
    for (const size of sizes) {
        const suite = createPositionalListSuite(size, output.options)
        try {
            await suite.bench.run()
            for (const task of suite.bench.tasks) {
                assert.ok(task.result, task.name)
                assert.equal(task.result.error, undefined, task.name)
                assert.equal(task.runs, samples, task.name)
                assert.equal(
                    suite.verifiedIterations.get(task.name),
                    samples + warmup
                )
                const latency = task.result.latency
                const result = {
                    size,
                    name: task.name,
                    samples: latency.samples.length,
                    verified_iterations: suite.verifiedIterations.get(
                        task.name
                    ),
                    latency_ms: {
                        mean: latency.mean,
                        p50: latency.p50,
                        sd: latency.sd,
                        rme: latency.rme,
                        min: latency.min,
                        max: latency.max,
                        samples: latency.samples,
                    },
                }
                output.timings.push(result)
                console.log(JSON.stringify(result))
            }
        } finally {
            suite.dispose()
        }
        const counts = { size, ...(await countPositionalListWork(size)) }
        output.counts.push(counts)
        console.log(JSON.stringify({ counts }))
        save()
    }
    output.finished_at = new Date().toISOString()
    save()
    console.log(
        JSON.stringify({
            environment: output.environment,
            options: output.options,
        })
    )
}

run().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
