import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { access, mkdtemp, readFile, rm } from 'node:fs/promises'
import test from 'node:test'
import { tmpdir } from 'node:os'
import { dirname, join, posix } from 'node:path'
import { JSDOM } from 'jsdom'

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

const externalScriptLocations = (html) => {
    // Parse as inert HTML: no execution or fetching scripts from the examples.
    const dom = new JSDOM(html, { includeNodeLocations: true })
    try {
        return Array.from(
            dom.window.document.querySelectorAll('script[src]'),
            (script) => dom.nodeLocation(script)
        )
    } finally {
        dom.window.close()
    }
}

test('installation guide uses explicit script end tags', async () => {
    const docs = await read('docs/documentation/installation.md')
    const scripts = Array.from(
        docs.matchAll(/^```html\r?\n([\s\S]*?)^```[ \t]*$/gm)
    ).flatMap(([, html]) => externalScriptLocations(html))
    assert(scripts.length > 0, 'No classic installation examples found')
    for (const script of scripts) {
        assert(script?.endTag, 'A classic installation script lacks an end tag')
    }
})

test('script locations account for HTML end-tag syntax', () => {
    const [closed] = externalScriptLocations(
        '<script src="./client.js"></SCRIPT >'
    )
    const [selfClosing] = externalScriptLocations('<script src="./client.js"/>')
    const [unterminated] = externalScriptLocations('<script src="./client.js">')
    assert(closed?.endTag)
    assert(selfClosing?.startTag && !selfClosing.endTag)
    assert(unterminated?.startTag && !unterminated.endTag)
})

test('classic HTML uses exact globals and does not load a second runtime', async () => {
    const pkg = await json('package.json')
    const webComponent = pkg.name.endsWith('/web-component')
    const file = webComponent ? 'status-button' : 'filter'
    const html = await read(`ai/examples/${file}.html`)
    assert.match(html, /const html = window\.BFS\.MARKUP\.html/)
    assert.doesNotMatch(html, /(?:window\.)?BFS\.html\b/)
    assert.equal(externalScriptLocations(html).length, 1)
    if (webComponent) {
        assert.match(html, /const WebComponent = window\.BFS\.WebComponent/)
        assert.match(
            html,
            /customElements\.define\('status-button', StatusButton\)/
        )
    }
})

test('occurrence board ships both setup modes with the same workflow', async () => {
    const { skill } = await json('ai/index.json')
    const manifest = await json(skill.manifest)
    const example = 'examples/occurrence-board'
    const npm = await read('ai/' + example + '.js')
    const classic = await read('ai/' + example + '.html')
    const local = await read(dirname(skill.path) + '/' + example + '.html')
    const source = await read('scripts/ai-examples/occurrence-board.js')
    assert(npm.endsWith(source))
    assert(classic.includes(source))
    assert(local.includes(source))
    assert(local.includes('src="./client.js"'))
    assert(manifest.files.includes(example + '.js'))
    assert(manifest.files.includes(example + '.html'))
})

test('numeric repeat docs use a renderer and well-formed span', async () => {
    const docs = await read('docs/documentation/utilities/repeat.md')
    assert.match(docs, /repeat\(3, \(\) => html`<span>Item<\/span>`\)/)
    assert.match(docs, /repeat\(3, \(n, index\) => html`<span>\$\{n\}/)
    assert.doesNotMatch(docs, /<spa>/)
})
