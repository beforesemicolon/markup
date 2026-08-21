import '../test.common.ts'
import { html as currentHtml } from './html.ts'
import { html as v2Html } from './html-v2.ts'
import { state } from './state.ts'

const now = () => process.hrtime.bigint()
const elapsedMs = (start: bigint) => Number(now() - start) / 1_000_000

const mountReactive = (
    html: typeof currentHtml,
    size: number
) => {
    const [value] = state(0)
    const host = document.createElement('div')
    document.body.append(host)
    const templates = []
    const start = now()

    for (let i = 0; i < size; i++) {
        const template = html`<article data-value="${value}"><span>${value}</span><p>${i}</p></article>`
        template.render(host)
        templates.push(template)
    }

    const ms = elapsedMs(start)
    for (const template of templates) template.unmount()
    host.remove()
    return ms
}

const setupReactive = (html: typeof currentHtml, size: number) => {
    const [value, setValue] = state(0)
    const host = document.createElement('div')
    document.body.append(host)
    const templates = []

    for (let i = 0; i < size; i++) {
        const template = html`<article data-value="${value}"><span>${value}</span><p>${i}</p></article>`
        template.render(host)
        templates.push(template)
    }

    return {
        setValue,
        host,
        cleanup() {
            for (const template of templates) template.unmount()
            host.remove()
        },
    }
}

const measureUpdates = async (
    setValue: (value: number) => number,
    iterations: number
) => {
    const start = now()
    for (let i = 1; i <= iterations; i++) {
        setValue(i)
        await new Promise<void>((resolve) => queueMicrotask(resolve))
    }
    return elapsedMs(start) / iterations
}

describe('HTML V2 reactive benchmark', () => {
    it('reports current vs V2 reactive mount and update timings', async () => {
        jest.useRealTimers()

        const results: Record<string, { current: number; v2: number }> = {}

        for (const size of [20, 250]) {
            // Warm caches before timing.
            mountReactive(currentHtml, size)
            mountReactive(v2Html as typeof currentHtml, size)

            results[`reactive mount x${size}`] = {
                current: mountReactive(currentHtml, size),
                v2: mountReactive(v2Html as typeof currentHtml, size),
            }

            const current = setupReactive(currentHtml, size)
            const v2 = setupReactive(v2Html as typeof currentHtml, size)

            results[`reactive update x${size}`] = {
                current: await measureUpdates(current.setValue, 20),
                v2: await measureUpdates(v2.setValue, 20),
            }

            expect(current.host.querySelector('span')?.textContent).toBe('20')
            expect(v2.host.querySelector('span')?.textContent).toBe('20')

            current.cleanup()
            v2.cleanup()
        }

        console.log('HTML_V2_REACTIVE_BENCHMARK', JSON.stringify(results))
        expect(Object.keys(results)).toHaveLength(4)
    })
})