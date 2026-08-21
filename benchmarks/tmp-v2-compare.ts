import 'global-jsdom/register'
import { execSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import * as current from '../src/index.ts'

type Api = Pick<typeof current, 'html' | 'repeat'>
type Item = { id: number; name: string }

const items = (size: number): Item[] =>
    Array.from({ length: size }, (_, index) => ({
        id: index + 1,
        name: `item-${index + 1}`,
    }))

const moderate = (api: Api, item: Item) => api.html`
    <div class="card" data-id="${item.id}">
        <button onclick="${() => {}}">Action</button>
        <strong>${item.name}</strong>
        <span>${item.id}</span>
    </div>
`

const filesystem = (api: Api, item: Item) => api.html`
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

const mount = (
    api: Api,
    size: number,
    renderer: (api: Api, item: Item) => ReturnType<Api['html']>
) => {
    const data = items(size)
    const container = document.createElement('div')
    const template = api.html`<div>${api.repeat(data, (item) =>
        renderer(api, item)
    )}</div>`
    template.render(container)
    template.unmount()
}

const measure = (fn: () => void, iterations: number) => {
    for (let index = 0; index < 2; index++) fn()
    const start = performance.now()
    for (let index = 0; index < iterations; index++) fn()
    return (performance.now() - start) / iterations
}

const baselineDir = mkdtempSync(join(tmpdir(), 'markup-1191-'))
execSync(
    `npm install --prefix "${baselineDir}" @beforesemicolon/markup@1.19.1 --ignore-scripts --no-audit --no-fund`,
    { stdio: 'ignore' }
)
const baselinePath = join(
    baselineDir,
    'node_modules/@beforesemicolon/markup/dist/esm/index.js'
)
const baseline = (await import(pathToFileURL(baselinePath).href)) as Api

console.log('\nV2 standard-pattern benchmark (ms/op; lower is better)')
for (const [name, renderer] of [
    ['moderate', moderate],
    ['fs-like', filesystem],
] as const) {
    for (const size of [250, 1000]) {
        const iterations = size === 1000 ? 3 : 6
        const oldMs = measure(() => mount(baseline, size, renderer), iterations)
        const newMs = measure(() => mount(current, size, renderer), iterations)
        const delta = ((newMs / oldMs - 1) * 100).toFixed(1)
        console.log(
            `${name} ${size}: 1.19.1=${oldMs.toFixed(2)} current=${newMs.toFixed(2)} delta=${delta}%`
        )
    }
}
