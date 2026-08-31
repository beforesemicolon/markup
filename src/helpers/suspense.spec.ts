import '../../test.common.ts'
import { html, HtmlTemplate } from '../html.ts'
import { suspense } from './suspense.ts'

const deferred = <T>() => {
    let resolvePromise: (value: T | PromiseLike<T>) => void = () => undefined
    let rejectPromise: (reason?: Error) => void = () => undefined
    const promise = new Promise<T>((resolve, reject) => {
        resolvePromise = resolve
        rejectPromise = reject
    })

    return {
        promise,
        resolve: resolvePromise,
        reject: rejectPromise,
    }
}

const flushAsyncRender = async () => {
    await jest.runAllTimersAsync()
}

describe('suspense', () => {
    it('should handle suspense with defaults', async () => {
        const pending = deferred<ReturnType<typeof html>>()
        const view = html`${suspense(() => pending.promise)}`.render(
            document.body
        )

        expect(document.body.innerHTML).toBe('<p>loading...</p>')

        pending.resolve(html`done`)
        await flushAsyncRender()

        expect(document.body.innerHTML).toBe('done')
        view.unmount()
    })

    it('should ignore resolved content after unmounting', async () => {
        const pending = deferred<ReturnType<typeof html>>()
        const contentMount = jest.fn()
        const view = html`${suspense(() => pending.promise)}`.render(
            document.body
        )

        view.unmount()
        pending.resolve(html`done`.onMount(contentMount))
        await flushAsyncRender()

        expect(document.body.innerHTML).toBe('')
        expect(contentMount).not.toHaveBeenCalled()
    })

    it('should ignore stale results after remounting', async () => {
        const first = deferred<ReturnType<typeof html>>()
        const second = deferred<ReturnType<typeof html>>()
        const actions = [first.promise, second.promise]
        let actionIndex = 0
        const template = suspense(() => actions[actionIndex++])()

        template.render(document.body)
        template.unmount()
        template.render(document.body)

        first.resolve(html`stale`)
        await flushAsyncRender()
        expect(document.body.innerHTML).toBe('<p>loading...</p>')

        second.resolve(html`fresh`)
        await flushAsyncRender()
        expect(document.body.innerHTML).toBe('fresh')

        template.unmount()
    })

    it('should preserve the computed helper API', () => {
        const pending = deferred<ReturnType<typeof html>>()
        const computed = suspense(() => pending.promise)

        expect(typeof computed).toBe('function')
        expect(computed()).toBeInstanceOf(HtmlTemplate)
    })

    it('should render failures', async () => {
        const pending = deferred<never>()
        const view = html`${suspense(() => pending.promise)}`.render(
            document.body
        )

        pending.reject(new Error('failed'))
        await flushAsyncRender()

        expect(document.body.innerHTML).toBe(
            '<p style="color: red">failed</p>'
        )
        view.unmount()
    })

    it('should render any resolved value', async () => {
        const pending = deferred<null>()
        const view = html`${suspense(() => pending.promise)}`.render(
            document.body
        )

        pending.resolve(null)
        await flushAsyncRender()

        expect(document.body.innerHTML).toBe('null')
        view.unmount()
    })
})
