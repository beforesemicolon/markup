import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { promisify } from 'node:util'
import { brotliCompressSync, gzipSync } from 'node:zlib'
import { compareBundles } from './bundle-size.mjs'

const exec = promisify(execFile)

test('same commit produces identical isolated production bundles and default compression', async () => {
    const commit = (await exec('git', ['rev-parse', 'HEAD'])).stdout.trim()
    const output = await mkdtemp(path.join(os.tmpdir(), 'markup-size-test-'))
    try {
        const report = await compareBundles({
            base: commit,
            head: commit,
            output,
        })
        assert.equal(report.base.commit, commit)
        assert.equal(report.head.commit, commit)
        assert.equal(report.base.source_tree, report.head.source_tree)
        assert.ok(report.base.verified_source_files > 0)
        assert.equal(report.environment.toolchain_checkout_commit, commit)
        assert.equal(
            report.environment.checkout_lock_sha256,
            createHash('sha256')
                .update(await readFile('package-lock.json'))
                .digest('hex')
        )
        assert.deepEqual(report.base.bytes, report.head.bytes)
        for (const kind of ['raw', 'gzip', 'brotli']) {
            assert.deepEqual(report.delta[kind], { bytes: 0, percent: 0 })
        }
        for (const label of ['base', 'head']) {
            const bytes = await readFile(path.join(output, report[label].file))
            assert.equal(report[label].bytes.raw, bytes.length)
            assert.equal(report[label].bytes.gzip, gzipSync(bytes).length)
            assert.equal(
                report[label].bytes.brotli,
                brotliCompressSync(bytes).length
            )
            assert.equal(
                report[label].bytes.sha256,
                createHash('sha256').update(bytes).digest('hex')
            )
        }
        const saved = JSON.parse(
            await readFile(path.join(output, 'report.json'), 'utf8')
        )
        assert.deepEqual(saved, report)
        assert.match(
            await readFile(path.join(output, 'report.md'), 'utf8'),
            /no size cap/
        )
    } finally {
        await rm(output, { recursive: true, force: true })
    }
})

test('comparison requires explicit immutable revisions', async () => {
    await assert.rejects(
        compareBundles({ base: 'HEAD', head: 'main', output: '.' }),
        /full commit SHA/
    )
})
