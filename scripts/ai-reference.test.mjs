import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import test from 'node:test'
import { tmpdir } from 'node:os'
import { dirname, join, posix } from 'node:path'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const json = async (path) => JSON.parse(await read(path))

test('the packed index, records, examples, and old entry points agree', async () => {
    const index = await json('ai/index.json')
    const pkg = await json('package.json')

    const cache = await mkdtemp(join(tmpdir(), 'bfs-pack-test-'))
    let files
    try {
        ;[{ files }] = JSON.parse(
            execFileSync(
                'npm',
                ['pack', '--dry-run', '--json', '--cache', cache],
                {
                    encoding: 'utf8',
                }
            )
        )
    } finally {
        await rm(cache, { recursive: true, force: true })
    }
    const packed = new Set(files.map(({ path }) => path))
    assert(packed.has('ai/index.json'))
    assert(!packed.has('scripts/generate-ai-reference.mjs'))
    for (const path of [...Object.values(pkg.exports), 'dist/client.js']) {
        assert(
            packed.has(path.replace(/^\.\//, '')),
            `Missing existing entry: ${path}`
        )
    }

    assert.equal(index.package, pkg.name)
    assert.equal(index.version, pkg.version)
    assert.equal(index.skill.name, `beforesemicolon-${pkg.name.split('/')[1]}`)
    assert.equal(index.skill.path, `skills/${index.skill.name}/SKILL.md`)
    assert(packed.has(index.skill.path))
    assert(packed.has(index.skill.manifest))
    const manifest = await json(index.skill.manifest)
    for (const path of manifest.files) {
        assert(
            packed.has(`${dirname(index.skill.path)}/${path}`),
            `Missing packed skill resource: ${path}`
        )
    }
    const installedSkill = await read(index.skill.path)
    assert(
        installedSkill.startsWith(
            `---\nname: ${index.skill.name}\ndescription: `
        )
    )
    assert.equal(
        index.referenceUrl,
        `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/ai/index.json`
    )
    const seen = new Set()
    for (const item of index.records) {
        const record = await json(`ai/${item.path}`)
        assert(!seen.has(record.name), `Repeated record: ${record.name}`)
        seen.add(record.name)
        assert(packed.has(`ai/${item.path}`))
        assert.equal(item.id, record.id)
        assert.equal(record.version, pkg.version)
        assert(record.api.signature)
        for (const name of record.setup.npm.names) {
            assert(index.exports[pkg.name].includes(name))
        }
        for (const script of record.setup.classic?.scripts ?? []) {
            assert.equal(script.version, pkg.version)
            await access(script.path)
        }
        for (const example of Object.values(record.example)) {
            if (typeof example === 'object')
                assert(packed.has(`ai/${example.path}`))
        }
    }
    assert.deepEqual([...seen].sort(), index.exports[pkg.name])
})

test('the complete offline skill resolves every linked guide and API example', async () => {
    const index = await json('ai/index.json')
    const root = dirname(index.skill.path)
    const manifest = await json(index.skill.manifest)
    assert.equal(manifest.schemaVersion, 1)
    assert.equal(manifest.name, index.skill.name)
    assert(manifest.files.includes('SKILL.md'))
    const entries = new Set(manifest.files)
    assert.equal(entries.size, manifest.files.length)
    const guides = [
        'references/index.md',
        'references/maintainer-guide.md',
        'references/patterns.md',
    ]
    assert(guides.every((guide) => entries.has(guide)))
    for (const { id, name } of index.records) {
        const path = `references/api/${name}.md`
        assert.equal(manifest.coverage[id], path)
        assert(entries.has(path), `Missing API skill page: ${name}`)
        const source = await read(`${root}/${path}`)
        assert.match(source, /## Public signature/)
        assert.match(source, /## npm example/)
    }
    for (const path of entries) {
        const source = await read(`${root}/${path}`)
        if (!path.endsWith('.md')) continue
        for (const [, ref] of source.matchAll(/\[[^\]\n]+\]\(([^)\s]+)\)/g)) {
            if (/^(https?:|mailto:|#)/.test(ref)) continue
            const target = posix.normalize(
                posix.join(posix.dirname(path), ref.split('#')[0])
            )
            assert(
                entries.has(target),
                `Missing offline reference from ${path}: ${ref}`
            )
        }
    }
})

test('installation guide uses explicit script end tags', async () => {
    const docs = await read('docs/documentation/installation.md')
    assert.match(docs, /<script src="[^"]+"><\/script>/)
    assert.doesNotMatch(docs, /<script\b[^>]*\/>/)
})

test('classic HTML uses exact globals and does not load a second runtime', async () => {
    const pkg = await json('package.json')
    const webComponent = pkg.name.endsWith('/web-component')
    const file = webComponent ? 'status-button' : 'filter'
    const html = await read(`ai/examples/${file}.html`)
    assert.match(html, /const html = window\.BFS\.MARKUP\.html/)
    assert.doesNotMatch(html, /(?:window\.)?BFS\.html\b/)
    assert.equal(html.match(/<script src="/g)?.length, 1)
    if (webComponent) {
        assert.match(html, /const WebComponent = window\.BFS\.WebComponent/)
        assert.match(
            html,
            /customElements\.define\('status-button', StatusButton\)/
        )
    }
})
