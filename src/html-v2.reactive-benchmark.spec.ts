import '../test.common.ts'
import { html as currentHtml } from './html.ts'
import { html as v2Html } from './html-v2.ts'
import { state } from './state.ts'

type TemplateLike = {
    render(target: HTMLElement): unknown
    unmount(): unknown
}

type HtmlFactory = (
    parts: TemplateStringsArray | string[],
    ...values: unknown[]
) => TemplateLike

const now = () => process.hrtime.bigint()
const elapsedMs = (start: bigint) => Number(now() - start) / 1_000_000

const mountReactive = (html: HtmlFactory, size: number) => {
    const [value] = state(0)
    const host = document.createElement('div')
    document.body.append(host)
    const templates: TemplateLike[] = []
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

const setupReactive = (html: HtmlFactory, size: number) => {
    const [value, setValue] = state(0)
    const host = document.createElement('div')
    document.body.append(host)
    const templates: TemplateLike[] = []

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

        const current = currentHtml as HtmlFactory
        const v2 = v2Html as HtmlFactory
        const results: Record<string, { current: number; v2: number }> = {}

        for (const size of [20, 250]) {
            mountReactive(current, size)
            mountReactive(v2, size)

            results[`reactive mount x${size}`] = {
                current: mountReactive(current, size),
                v2: mountReactive(v2, size),
            }

            const currentSetup = setupReactive(current, size)
            const v2Setup = setupReactive(v2, size)

            results[`reactive update x${size}`] = {
                current: await measureUpdates(currentSetup.setValue, 20),
                v2: await measureUpdates(v2Setup.setValue, 20),
            }

            expect(currentSetup.host.querySelector('span')?.textContent).toBe(
                '20'
            )
            expect(v2Setup.host.querySelector('span')?.textContent).toBe('20')

            currentSetup.cleanup()
            v2Setup.cleanup()
        }

        console.log('HTML_V2_REACTIVE_BENCHMARK', JSON.stringify(results))
        expect(Object.keys(results)).toHaveLength(4)
    })
})