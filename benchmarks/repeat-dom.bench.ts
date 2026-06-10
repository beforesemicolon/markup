import 'global-jsdom/register'
import { Bench } from 'tinybench'
import { html, repeat, state } from '../src/index.ts'
import {
    generateItems,
    copyItems,
    renderModerate,
    renderFilesystemLike,
} from './helpers/fixtures.ts'
import { getEnvironmentInfo } from './helpers/environment.ts'
import { printReport } from './helpers/report.ts'

const env = getEnvironmentInfo()
const SIZES = [20, 60, 250, 1000]

async function run() {
    for (const size of SIZES) {
        const bench = new Bench({ time: 100 })
        const items = generateItems(size)

        // 1. Initial Mount (Cold) - Minimal Template
        bench.add(`Initial Mount (Minimal) - Size ${size}`, () => {
            const container = document.createElement('div')
            const tmpl = html`<div>
                ${repeat(items, (item) => html`<span>${item.name}</span>`)}
            </div>`
            tmpl.render(container)
            tmpl.unmount()
        })

        // 2. Initial Mount (Cold) - Moderate Template
        bench.add(`Initial Mount (Moderate) - Size ${size}`, () => {
            const container = document.createElement('div')
            const tmpl = html`<div>${repeat(items, renderModerate)}</div>`
            tmpl.render(container)
            tmpl.unmount()
        })

        // 3. Initial Mount (Cold) - Filesystem-like Template
        bench.add(`Initial Mount (FS-like) - Size ${size}`, () => {
            const container = document.createElement('div')
            const tmpl = html`<div>${repeat(items, renderFilesystemLike)}</div>`
            tmpl.render(container)
            tmpl.unmount()
        })

        // 4. Update (Same Array) - FS-like
        const [fsStateStable, setFsStateStable] = state(items)
        const containerStable = document.createElement('div')
        const tmplStable = html`<div>
            ${repeat(fsStateStable, renderFilesystemLike)}
        </div>`
        tmplStable.render(containerStable)
        bench.add(`Update (Same Array) - FS-like - Size ${size}`, async () => {
            setFsStateStable(items)
            await new Promise((resolve) => queueMicrotask(resolve))
        })

        // 5. Update (New Refs, Same IDs) - FS-like
        let refs = items
        const [fsStateRefs, setFsStateRefs] = state(refs)
        const containerRefs = document.createElement('div')
        const tmplRefs = html`<div>
            ${repeat(fsStateRefs, renderFilesystemLike)}
        </div>`
        tmplRefs.render(containerRefs)
        bench.add(
            `Update (New Refs, Same IDs) - FS-like - Size ${size}`,
            async () => {
                refs = copyItems(refs)
                setFsStateRefs(refs)
                await new Promise((resolve) => queueMicrotask(resolve))
            }
        )

        // 6. Update (Append 1 Item) - FS-like
        let appendRefs = items
        const [fsStateAppend, setFsStateAppend] = state(appendRefs)
        const containerAppend = document.createElement('div')
        const tmplAppend = html`<div>
            ${repeat(fsStateAppend, renderFilesystemLike)}
        </div>`
        tmplAppend.render(containerAppend)
        bench.add(`Update (Append 1) - FS-like - Size ${size}`, async () => {
            appendRefs = [...items, { id: size + 1, name: `item-${size + 1}` }]
            setFsStateAppend(appendRefs)
            await new Promise((resolve) => queueMicrotask(resolve))
        })

        await bench.run()
        tmplStable.unmount()
        tmplRefs.unmount()
        tmplAppend.unmount()

        printReport(`DOM Mount and Update - Size ${size}`, bench, env)
    }
}

run().catch(console.error)
