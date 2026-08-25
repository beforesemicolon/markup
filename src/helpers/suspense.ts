import { html, HtmlTemplate } from '../html.ts'
import { state } from '../state.ts'

type SuspenseState<T> =
    | { status: 'loading' }
    | { status: 'resolved'; value: T }
    | { status: 'rejected'; error: Error }

type RejectionReason =
    | string
    | number
    | boolean
    | bigint
    | symbol
    | object
    | null
    | undefined

const toError = (reason: RejectionReason): Error =>
    reason instanceof Error ? reason : new Error(String(reason))

/**
 * Temporarily renders the loading template while the async action resolves.
 * Results from an unmounted or superseded render are ignored.
 */
export const suspense = <T>(
    asyncAction: () => Promise<T>,
    loading = html`<p>loading...</p>`,
    failed = (error: Error) => html`<p style="color: red">${error.message}</p>`
): (() => HtmlTemplate) => {
    const initialState: SuspenseState<T> = { status: 'loading' }
    const [result, setResult] = state<SuspenseState<T>>(initialState)
    let generation = 0

    const template = html`${() => {
        const current = result()
        if (current.status === 'resolved') return current.value
        if (current.status === 'rejected') return failed(current.error)
        return loading
    }}`

    template.onMount(() => {
        const currentGeneration = ++generation

        Promise.resolve()
            .then(asyncAction)
            .then(
                (value) => {
                    if (generation !== currentGeneration) return
                    setResult({ status: 'resolved', value })
                },
                (reason: RejectionReason) => {
                    if (generation !== currentGeneration) return
                    setResult({ status: 'rejected', error: toError(reason) })
                }
            )

        return () => {
            generation++
            setResult(initialState)
        }
    })

    return () => template
}
