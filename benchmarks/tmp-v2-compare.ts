import 'global-jsdom/register'
import { execFileSync, execSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import * as current from '../src/index.ts'

type Api = Pick<typeof current, 'html' | 'repeat'>
type Item = { id: number; name: string }
type Result = Record<string, number>

type Renderer = (api: Api, item: Item) => ReturnType<Api['html']>

const items = (size: number): Item[] =>
    Array.from({ length: size }, (_, index) => ({
        id: index + 1,
        name: `item-${index + 1}`,
    }))

const moderate: Renderer = (api, item) => api.html`
    <div class="card" data-id="${item.id}">
        <button onclick="${() => {}}">Action</button>
        <strong>${item.name}</strong>
        <span>${item.id}</span>
    </div>
`

const filesystem: Renderer = (api, item) => api.html`
    <article class="business-asset-card" data-id="${item.id}">
        <div class="icon-area"><span class="icon">📁</span></div>
        <div class="card-details">
            <h3 class="title">${item.name}</h3>
            <p class="description">Description for item ${item.id}</p>
            <div class="badges">
                <span class="badge warning">Draft</span>
                <span class="badge info">Asset</span>
            </div>
            <div class="metadata">
                <span class="meta-label">Size:</span>
                <span class="meta-value">2.4 MB</span>
                <span class="meta-label">Updated:</span>
                <span class="meta-value">2 hours ago</span>
            </div>
            <button class="action-trigger" onclick="${() => {}}">
                Actions
            </button>
        </div>
    </article>
`

const profile = (
    api: Api,
    data: Item[],
    renderer: Renderer,
    iterations: number
) => {
    let create = 0
    let render = 0
    let unmount = 0

    const run = (record: boolean) => {
        const container = document.createElement('div')
        const startCreate = performance.now()
        const template = api.html`<div>${api.repeat(data, (item) =>
            renderer(api, item)
        )}</div>`
        const startRender = performance.now()
        template.render(container)
        const startUnmount = performance.now()
        template.unmount()
        const end = performance.now()

        if (record) {
            create += startRender - startCreate
            render += startUnmount - startRender
            unmount += end - startUnmount
        }
    }

    run(false)
    run(false)
    for (let index = 0; index < iterations; index++) run(true)

    return {
        create: create / iterations,
        render: render / iterations,
        unmount: unmount / iterations,
    }
}

const run = (api: Api): Result => {
    const result: Result = {}
    for (const [name, renderer] of [
        ['moderate', moderate],
        ['fs-like', filesystem],
    ] as const) {
        for (const size of [250, 1000]) {
            const phases = profile(
                api,
                items(size),
                renderer,
                size === 1000 ? 3 : 5
            )
            result[`${name}-${size}-create`] = phases.create
            result[`${name}-${size}-render`] = phases.render
            result[`${name}-${size}-unmount`] = phases.unmount
            result[`${name}-${size}-total`] =
                phases.create + phases.render + phases.unmount
        }
    }
    return result
}

const mode = process.argv[2]
if (mode === 'current') {
    console.log(JSON.stringify(run(current)))
} else if (mode === 'baseline') {
    const baselinePath = process.argv[3]
    const baseline = (await import(pathToFileURL(baselinePath).href)) as Api
    console.log(JSON.stringify(run(baseline)))
} else {
    const baselineDir = mkdtempSync(join(tmpdir(), 'markup-1191-'))
    execSync(
        `npm install --prefix "${baselineDir}" @beforesemicolon/markup@1.19.1 --ignore-scripts --no-audit --no-fund`,
        { stdio: 'ignore' }
    )
    const baselinePath = join(
        baselineDir,
        'node_modules/@beforesemicolon/markup/dist/esm/index.js'
    )
    const executable = join(process.cwd(), 'node_modules/.bin/tsx')
    const script = fileURLToPath(import.meta.url)
    const baseline = JSON.parse(
        execFileSync(executable, [script, 'baseline', baselinePath], {
            encoding: 'utf8',
        })
    ) as Result
    const v2 = JSON.parse(
        execFileSync(executable, [script, 'current'], {
            encoding: 'utf8',
        })
    ) as Result

    console.log('\nV2 isolated phase benchmark (ms/op; lower is better)')
    for (const key of Object.keys(baseline)) {
        const oldMs = baseline[key]
        const newMs = v2[key]
        const delta = ((newMs / oldMs - 1) * 100).toFixed(1)
        console.log(
            `${key}: 1.19.1=${oldMs.toFixed(2)} current=${newMs.toFixed(2)} delta=${delta}%`
        )
    }
}
