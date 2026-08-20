import '../test.common.ts'
import { html as currentHtml, HtmlTemplate as CurrentTemplate } from './html.ts'
import { html as v2Html, HtmlTemplate as V2Template } from './html-v2.ts'

const measure = (fn: () => void, iterations: number) => {
    const start = process.hrtime.bigint()
    for (let i = 0; i < iterations; i++) fn()
    return Number(process.hrtime.bigint() - start) / 1_000_000 / iterations
}

const currentMinimal = (i: number) => currentHtml`<div>${i}</div>`
const v2Minimal = (i: number) => v2Html`<div>${i}</div>`

const currentModerate = (i: number) =>
    currentHtml`<article class="row-${i % 3}" data-id="${i}"><h3>${`Item ${i}`}</h3><p>${`Description ${i}`}</p></article>`
const v2Moderate = (i: number) =>
    v2Html`<article class="row-${i % 3}" data-id="${i}"><h3>${`Item ${i}`}</h3><p>${`Description ${i}`}</p></article>`

const noop = () => undefined
const currentFs = (i: number) =>
    currentHtml`<article class="row-${i % 3}" data-id="${i}" aria-label="${`Item ${i}`}"><header><h3>${`Item ${i}`}</h3><span>${i % 2 ? 'active' : 'idle'}</span></header><p>${`Description ${i}`}</p><button onclick="${noop}">Open</button></article>`
const v2Fs = (i: number) =>
    v2Html`<article class="row-${i % 3}" data-id="${i}" aria-label="${`Item ${i}`}"><header><h3>${`Item ${i}`}</h3><span>${i % 2 ? 'active' : 'idle'}</span></header><p>${`Description ${i}`}</p><button onclick="${noop}">Open</button></article>`

const mountBatch = <T extends { render(target: HTMLElement): unknown; unmount(): unknown }>(
    factory: (i: number) => T,
    size: number
) => {
    const host = document.createElement('div')
    document.body.append(host)
    const rows: T[] = []
    for (let i = 0; i < size; i++) {
        const row = factory(i)
        row.render(host)
        rows.push(row)
    }
    for (const row of rows) row.unmount()
    host.remove()
}

const currentFsUpdate = (size: number) => {
    const host = document.createElement('div')
    document.body.append(host)
    let rows: CurrentTemplate[] = []
    for (let i = 0; i < size; i++) {
        const row = currentFs(i)
        row.render(host)
        rows.push(row)
    }
    const nextRows = rows.map((row, i) => {
        const next = currentFs(i + 1)
        if (!row.__rebind__(next)) {
            next.replace(row)
            return next
        }
        return row
    })
    rows = nextRows
    for (const row of rows) row.unmount()
    host.remove()
}

const v2FsUpdate = (size: number) => {
    const host = document.createElement('div')
    document.body.append(host)
    const rows: V2Template[] = []
    for (let i = 0; i < size; i++) {
        const row = v2Fs(i)
        row.render(host)
        rows.push(row)
    }
    for (let i = 0; i < size; i++) {
        rows[i].__updateFrom(v2Fs(i + 1))
    }
    for (const row of rows) row.unmount()
    host.remove()
}

describe('HTML V2 latest benchmark', () => {
    it('reports current vs expanded V2 timings', () => {
        currentMinimal(0)
        v2Minimal(0)
        currentModerate(0)
        v2Moderate(0)
        currentFs(0)
        v2Fs(0)

        const results: Record<string, { current: number; v2: number }> = {}
        const add = (
            name: string,
            current: () => void,
            v2: () => void,
            iterations: number
        ) => {
            current()
            v2()
            results[name] = {
                current: measure(current, iterations),
                v2: measure(v2, iterations),
            }
        }

        add(
            'create x1000',
            () => {
                for (let i = 0; i < 1000; i++) currentMinimal(i)
            },
            () => {
                for (let i = 0; i < 1000; i++) v2Minimal(i)
            },
            20
        )
        add(
            'minimal mount x20',
            () => mountBatch(currentMinimal, 20),
            () => mountBatch(v2Minimal, 20),
            12
        )
        add(
            'moderate mount x20',
            () => mountBatch(currentModerate, 20),
            () => mountBatch(v2Moderate, 20),
            10
        )
        add(
            'fs mount x20',
            () => mountBatch(currentFs, 20),
            () => mountBatch(v2Fs, 20),
            8
        )
        add(
            'minimal mount x250',
            () => mountBatch(currentMinimal, 250),
            () => mountBatch(v2Minimal, 250),
            4
        )
        add(
            'moderate mount x250',
            () => mountBatch(currentModerate, 250),
            () => mountBatch(v2Moderate, 250),
            3
        )
        add(
            'fs mount x250',
            () => mountBatch(currentFs, 250),
            () => mountBatch(v2Fs, 250),
            2
        )
        add(
            'fs immutable update x20',
            () => currentFsUpdate(20),
            () => v2FsUpdate(20),
            8
        )
        add(
            'fs immutable update x250',
            () => currentFsUpdate(250),
            () => v2FsUpdate(250),
            2
        )

        console.log('HTML_V2_LATEST_BENCHMARK', JSON.stringify(results))
        expect(Object.keys(results)).toHaveLength(9)
    })
})
