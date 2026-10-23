import assert from 'node:assert/strict'
import { execFile, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
    copyFile,
    mkdir,
    mkdtemp,
    readFile,
    realpath,
    rm,
    symlink,
    writeFile,
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, promisify } from 'node:util'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

const exec = promisify(execFile)
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const buildSource =
    'import { buildBrowser } from "@beforesemicolon/builder"; await buildBrowser({ esbuildOptions: { keepNames: false, sourcemap: false } });'
const productionCommand = `NODE_ENV=production node --input-type=module -e '${buildSource}'`
const toolchainSource = `
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
const builder = import.meta.resolve('@beforesemicolon/builder');
const require = createRequire(builder);
const esbuild = require.resolve('esbuild/package.json');
writeFileSync(process.argv[1], JSON.stringify({
    builder: JSON.parse(readFileSync(new URL('../../package.json', builder))).version,
    esbuild: JSON.parse(readFileSync(esbuild)).version,
    builder_entry: builder,
    esbuild_package: esbuild,
}));
`

function runNode(args, options) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, args, {
            ...options,
            stdio: ['ignore', 'inherit', 'inherit'],
        })
        child.once('error', reject)
        child.once('close', (code, signal) => {
            if (code === 0) resolve()
            else reject(new Error(`Node subprocess failed: ${signal ?? code}`))
        })
    })
}

async function optionalFileHash(filename) {
    try {
        return sha256(await readFile(filename))
    } catch (error) {
        if (error.code === 'ENOENT') return null
        throw error
    }
}

async function git(repo, ...args) {
    return (
        await exec('git', args, { cwd: repo, maxBuffer: 16 * 1024 * 1024 })
    ).stdout.trim()
}

async function verifySources(repo, commit, directory) {
    const { stdout } = await exec(
        'git',
        ['ls-tree', '-r', '-z', commit, '--', 'src'],
        { cwd: repo, maxBuffer: 16 * 1024 * 1024 }
    )
    let count = 0
    for (const entry of stdout.split('\0').filter(Boolean)) {
        const separator = entry.indexOf('\t')
        const [mode, kind, expected] = entry.slice(0, separator).split(' ')
        const filename = entry.slice(separator + 1)
        assert.equal(kind, 'blob')
        assert.ok(
            mode === '100644' || mode === '100755',
            'regular source files required'
        )
        const bytes = await readFile(path.join(directory, filename))
        const actual = createHash(expected.length === 40 ? 'sha1' : 'sha256')
            .update(`blob ${bytes.length}\0`)
            .update(bytes)
            .digest('hex')
        assert.equal(
            actual,
            expected,
            `source differs from ${commit}: ${filename}`
        )
        count++
    }
    assert.ok(count > 0, 'revision must contain src files')
    return count
}

function measure(bytes) {
    return {
        sha256: sha256(bytes),
        raw: bytes.length,
        gzip: gzipSync(bytes).length,
        brotli: brotliCompressSync(bytes).length,
    }
}

function markdown(report) {
    const rows = ['raw', 'gzip', 'brotli'].map((kind) => {
        const { bytes, percent } = report.delta[kind]
        const sign = bytes >= 0 ? '+' : ''
        return `| ${kind} | ${report.base.bytes[kind]} | ${report.head.bytes[kind]} | ${sign}${bytes} (${sign}${percent.toFixed(2)}%) |`
    })
    return [
        '# Browser bundle size',
        '',
        'Informational source comparison; no size cap is enforced. Both revisions use one installed toolchain and the same production command.',
        '',
        `Base: \`${report.base.commit}\``,
        '',
        `Head: \`${report.head.commit}\``,
        '',
        '| Encoding | Base bytes | Head bytes | Change |',
        '| --- | ---: | ---: | ---: |',
        ...rows,
        '',
        `Node ${report.environment.node}; builder ${report.environment.builder}; esbuild ${report.environment.esbuild}; ${report.environment.os}.`,
        '',
        '`gzipSync(buffer)` and `brotliCompressSync(buffer)` use Node defaults. Brotli default quality is 11. Sizes exclude HTTP headers.',
        '',
        '```bash',
        productionCommand,
        '```',
        '',
        `Base bundle SHA-256: \`${report.base.bytes.sha256}\``,
        '',
        `Head bundle SHA-256: \`${report.head.bytes.sha256}\``,
        '',
        'The JSON artifact includes source tree IDs, verified source-file counts, toolchain and lockfile provenance, and compression versions. The JavaScript artifacts are the exact measured files. A dependency upgrade is applied to both builds: this controls the installed toolchain instead of comparing separate historical installations.',
        '',
    ].join('\n')
}

export async function compareBundles({
    base,
    head,
    output,
    cwd = process.cwd(),
}) {
    for (const [label, commit] of Object.entries({ base, head })) {
        assert.match(
            commit ?? '',
            /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/,
            `${label} requires a full commit SHA`
        )
    }
    const repo = await git(cwd, 'rev-parse', '--show-toplevel')
    for (const commit of [base, head]) {
        assert.equal(
            await git(repo, 'rev-parse', '--verify', `${commit}^{commit}`),
            commit
        )
    }
    const dependencies = await realpath(path.join(repo, 'node_modules'))
    const destination = path.resolve(output)
    const temporary = await mkdtemp(
        path.join(os.tmpdir(), 'markup-bundle-size-')
    )
    try {
        const metadata = path.join(temporary, 'toolchain.json')
        await runNode(
            ['--input-type=module', '--eval', toolchainSource, metadata],
            {
                cwd: repo,
            }
        )
        const resolved = JSON.parse(await readFile(metadata, 'utf8'))
        const report = {
            measured_at: new Date().toISOString(),
            command: productionCommand,
            environment: {
                node: process.version,
                os: `${os.type()} ${os.release()} ${os.arch()}`,
                ...resolved,
                dependency_directory: dependencies,
                toolchain_checkout_commit: await git(repo, 'rev-parse', 'HEAD'),
                checkout_lock_sha256: sha256(
                    await readFile(path.join(repo, 'package-lock.json'))
                ),
                installed_lock_sha256: await optionalFileHash(
                    path.join(dependencies, '.package-lock.json')
                ),
                zlib: process.versions.zlib,
                brotli: process.versions.brotli,
            },
            compression: {
                gzip: 'gzipSync(buffer), default options',
                brotli: 'brotliCompressSync(buffer), default options',
                brotli_default_quality: constants.BROTLI_DEFAULT_QUALITY,
            },
        }
        await mkdir(destination, { recursive: true })
        for (const [label, commit] of Object.entries({ base, head })) {
            const directory = path.join(temporary, label)
            const archive = path.join(temporary, `${label}.tar`)
            await mkdir(directory)
            await exec(
                'git',
                ['archive', '--format=tar', '--output', archive, commit],
                { cwd: repo }
            )
            await exec('tar', ['-xf', archive, '-C', directory])
            const verified = await verifySources(repo, commit, directory)
            await symlink(
                dependencies,
                path.join(directory, 'node_modules'),
                'dir'
            )
            assert.equal(
                await realpath(path.join(directory, 'node_modules')),
                dependencies
            )
            await runNode(['--input-type=module', '--eval', buildSource], {
                cwd: directory,
                env: { ...process.env, NODE_ENV: 'production' },
            })
            const bundle = path.join(directory, 'dist/client.js')
            report[label] = {
                commit,
                tree: await git(repo, 'rev-parse', `${commit}^{tree}`),
                source_tree: await git(repo, 'rev-parse', `${commit}:src`),
                verified_source_files: verified,
                revision_lock_sha256: sha256(
                    await readFile(path.join(directory, 'package-lock.json'))
                ),
                file: `${label}.client.js`,
                bytes: measure(await readFile(bundle)),
            }
            await copyFile(bundle, path.join(destination, report[label].file))
        }
        report.delta = Object.fromEntries(
            ['raw', 'gzip', 'brotli'].map((kind) => [
                kind,
                {
                    bytes: report.head.bytes[kind] - report.base.bytes[kind],
                    percent:
                        (report.head.bytes[kind] / report.base.bytes[kind] -
                            1) *
                        100,
                },
            ])
        )
        await writeFile(
            path.join(destination, 'report.json'),
            `${JSON.stringify(report, null, 2)}\n`
        )
        await writeFile(path.join(destination, 'report.md'), markdown(report))
        return report
    } finally {
        // Only the freshly-created temporary extracts are removed.
        await rm(temporary, { recursive: true, force: true })
    }
}

async function main() {
    const { values } = parseArgs({
        options: {
            base: { type: 'string' },
            head: { type: 'string' },
            output: { type: 'string', default: 'bundle-size-report' },
        },
    })
    const report = await compareBundles(values)
    console.log(markdown(report))
}

if (
    process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
    main().catch((error) => {
        console.error(error)
        process.exitCode = 1
    })
}
