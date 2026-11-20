import assert from 'node:assert/strict'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export const typedExamples = {
    AnythingButAFunction:
        'type AcceptsText = AnythingButAFunction<string>\ntype RejectsCallback = AnythingButAFunction<() => void> // never',
    DynamicValue:
        'const bindingName = (value: DynamicValue<string>) => value.name',
    EffectCleanup:
        'const cleanup: EffectCleanup = () => window.removeEventListener("resize", reportSize)\nfunction reportSize() { console.log(window.innerWidth) }',
    EffectSubscriber:
        'const keepPrevious: EffectSubscriber<number> = (previous) => previous ?? 0',
    EffectUnSubscriber:
        'const stop: EffectUnSubscriber = () => controller.abort()\nconst controller = new AbortController()',
    ElementOptions:
        'const options: ElementOptions<{ id: string }> = {\n    attributes: { id: "status" },\n    textContent: "Ready",\n}',
    HelperValueChecker:
        'const isNonEmpty: HelperValueChecker<string> = (text) => text.trim().length > 0',
    LifecycleCallback:
        'const attach: LifecycleCallback = (template) => {\n    const node = template.refs.status?.[0]\n    node?.setAttribute("data-mounted", "")\n    return () => node?.removeAttribute("data-mounted")\n}',
    ObjectLiteral:
        'const labels: ObjectLiteral<string> = { draft: "Draft", ready: "Ready" }',
    RepeatData: 'const values: RepeatData<string> = new Set(["One", "Two"])',
    RepeatOptions:
        'const options: RepeatOptions<{ id: string }, string> = {\n    key: ({ id }) => id,\n    empty: () => "No rows",\n}',
    StateGetter: 'const readLabel: StateGetter<string> = () => "Ready"',
    StateSetter:
        'const setLabel: StateSetter<string> = (next) =>\n    typeof next === "function" ? next("Ready") : next',
    StateSubscriber:
        'const updateStatus: StateSubscriber = () => console.log("Changed")',
    StateUnSubscriber:
        'const stopUpdates: StateUnSubscriber = () => controller.abort()\nconst controller = new AbortController()',
    VisibleOptions:
        'const options: VisibleOptions = { rootMargin: "100px", threshold: 0.25 }',
    HTMLComponentElement:
        'type StatusProps = { message: string }\nconst status = document.querySelector<HTMLComponentElement<StatusProps>>("status-label")\nif (status) status.message = "Ready"',
    ObjectInterface:
        'type StatusValues = ObjectInterface<{ status: "ready" | "busy" }>\nconst values: StatusValues = { status: "ready" }',
    Props: 'const props: Props<{ message: string }> = { message: () => "Ready" }\nconsole.log(props.message())',
    PropsSetters:
        'const setters: PropsSetters<{ message: string }> = {\n    message: (next) => typeof next === "function" ? next("Ready") : next,\n}',
    State: 'const state: State<{ count: number }> = { count: () => 0 }\nconsole.log(state.count())',
    StateSetters:
        'const setters: StateSetters<{ count: number }> = {\n    count: (next) => typeof next === "function" ? next(0) : next,\n}',
}

const code = (body, language = 'js') =>
    ['```' + language, body.trim(), '```'].join('\n')

async function listFiles(directory, prefix = '') {
    const entries = await readdir(join(directory, prefix), {
        withFileTypes: true,
    })
    return (
        await Promise.all(
            entries.map((entry) => {
                const name = prefix + entry.name
                return entry.isDirectory()
                    ? listFiles(directory, name + '/')
                    : [name]
            })
        )
    ).flat()
}

const guideEnd = /^## Canonical (documentation|pages)\s*$/m
export async function buildSkillBundle({ skill, pkg, out, index, pinned }) {
    const root = dirname(skill.path)
    const api = join(root, 'references', 'api')
    const examples = join(root, 'examples')
    await rm(api, { recursive: true, force: true })
    await rm(examples, { recursive: true, force: true })
    await mkdir(api, { recursive: true })
    await mkdir(examples, { recursive: true })
    const runtimeUrl = pinned(pkg.name, pkg.version, 'dist/client.js')
    const guide = (await readFile('docs/llms.txt', 'utf8'))
        .replaceAll('{{project.name}}', pkg.name)
        .replaceAll('{{project.version}}', pkg.version)
        .replace(/^Documentation:.*\n/m, '')
        .replace(/^Complete context:.*\n/m, '')
        .replace(/^Versioned AI lookup index:.*\n/m, '')
        .replace(/^Dedicated agent skill:.*\n/m, '')
        .replace(guideEnd, '## Optional online documentation')
    assert(!guide.includes('{{project.'), 'Unresolved guide metadata')
    await writeFile(join(root, 'references', 'maintainer-guide.md'), guide)

    const records = await Promise.all(
        index.records.map(async ({ name, path }) => {
            const record = JSON.parse(await readFile(join(out, path), 'utf8'))
            const memberSection = record.api.members?.length
                ? '\n## Public members\n\n' +
                  code(record.api.members.join('\n'), 'ts') +
                  '\n'
                : ''
            const notes = record.api.notes?.length
                ? '\n## Usage notes\n\n' +
                  record.api.notes.map((note) => '- ' + note).join('\n') +
                  '\n'
                : ''
            const language = record.setup.npm.typeOnly ? 'ts' : 'js'
            const exampleSections = []
            for (const target of ['npm', 'classic']) {
                const example = record.example[target]
                if (!example) continue
                const title = target === 'npm' ? 'npm' : 'Classic browser'
                if (typeof example === 'string') {
                    exampleSections.push(
                        `## ${title} example\n\n${code(example, language)}`
                    )
                } else {
                    exampleSections.push(
                        `## ${title} example\n\n[Open the complete example](../../${example.path}).` +
                            (example.markup
                                ? '\n\nRequired page markup:\n\n' +
                                  code(example.markup, 'html')
                                : '')
                    )
                }
            }
            assert(
                exampleSections.length > 0,
                `Missing offline example for ${record.id}`
            )
            const provenance = record.api.reexportOf
                ? '\nThe browser runtime bundles this API from the locked Markup ' +
                  record.api.reexportOf.version +
                  '. In npm, follow the Markup version resolved by the consumer.\n'
                : ''
            const classic = record.setup.classic
                ? '\nBrowser globals: ' +
                  record.setup.classic.globals
                      .map((name) => '`window.' + name + '`')
                      .join(', ') +
                  '. Use the browser setup in the [offline guide](../index.md).\n'
                : ''
            await writeFile(
                join(api, name + '.md'),
                `# ${name}\n\n${pkg.name} ${pkg.version}\n\n${record.summary}\n${provenance}${classic}\n## Public signature\n\n${code(record.api.signature, 'ts')}\n${memberSection}${notes}\n${exampleSections.join('\n\n')}\n\n[Worked patterns and lifecycle examples](../patterns.md).\n`
            )
            return {
                id: record.id,
                name,
                summary: record.summary,
                typeOnly: record.setup.npm.typeOnly,
            }
        })
    )

    const examplePaths = await readdir(join(out, 'examples'))
    for (const file of examplePaths) {
        const input = await readFile(join(out, 'examples', file), 'utf8')
        await writeFile(
            join(examples, file),
            file.endsWith('.html')
                ? input.replace(runtimeUrl, './client.js')
                : input
        )
    }
    await writeFile(
        join(examples, 'README.md'),
        `# Run these examples without documentation access\n\n${pkg.name} ${pkg.version}\n\nFor browser-only HTML, copy the example and the installed package's \`dist/client.js\` to the same folder. If you maintain a private mirror of the package, use its exact version. Serve the folder using a static server, e.g. \`python3 -m http.server 8000\`, and open its example HTML file. No external script is referenced by this copy.\n\nFor npm, copy the JavaScript file into the project, include the matching example markup described in its API record, and use the project's existing module loader or bundler. Read the package from local installation, not a CDN.\n\n` +
            examplePaths.map((file) => `- [${file}](./${file})`).join('\n') +
            '\n'
    )

    const group = (typeOnly) =>
        records
            .filter((record) => Boolean(record.typeOnly) === typeOnly)
            .map(
                ({ name, summary }) =>
                    `- [${name}](./api/${name}.md): ${summary}`
            )
            .join('\n')
    await writeFile(
        join(root, 'references', 'index.md'),
        `# Offline guide and reference\n\nThese documents describe ${pkg.name} **${pkg.version}**. The public API index below has one page and example per export. Do not substitute these facts for another installed release.\n\n- [Package maintainer guide](./maintainer-guide.md): setup, API behavior, and end-to-end examples.\n- [Worked patterns](./patterns.md): composition, ownership, and test cases.\n- [Run the offline examples](../examples/README.md): do not fetch browser runtimes during verification.\n\n## Runtime APIs\n\n${group(false)}\n\n## TypeScript APIs\n\n${group(true)}\n`
    )

    const files = (await listFiles(root))
        .filter((file) => file !== 'manifest.json')
        .sort()
    assert(
        files.includes('SKILL.md') && files.includes('references/patterns.md')
    )
    assert.equal(
        files.filter((file) => file.startsWith('references/api/')).length,
        records.length
    )
    assert(files.every((file) => /^[\w.-]+(?:\/[\w.-]+)*$/.test(file)))
    await writeFile(
        skill.manifest,
        JSON.stringify(
            {
                schemaVersion: 1,
                name: skill.name,
                files,
                coverage: Object.fromEntries(
                    index.records.map(({ id, name }) => [
                        id,
                        `references/api/${name}.md`,
                    ])
                ),
            },
            null,
            4
        ) + '\n'
    )
}
