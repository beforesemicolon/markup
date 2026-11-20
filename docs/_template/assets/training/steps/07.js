import { createPreferences } from './06.js'

const { html, state, suspense } = window.BFS.MARKUP

export function createCatalog() {
    const player = createPreferences([])
    const [attempt, setAttempt] = state({ mode: 'catalog' })
    let request
    let disposed = false

    function load(mode = 'catalog') {
        request?.abort()
        setAttempt({ mode })
    }

    function catalogStatus() {
        const { mode } = attempt()
        return suspense(
            async () => {
                if (disposed) return ''
                const controller = new AbortController()
                request = controller
                const url = '/assets/training/tracks.json'
                const response = await fetch(url, { signal: controller.signal })
                if (!response.ok || mode === 'failed')
                    throw new Error('Catalog unavailable')
                const tracks = await response.json()
                if (disposed || controller.signal.aborted) return ''

                // These two modes let learners rehearse the empty and error paths.
                const items = mode === 'empty' ? [] : tracks
                player.replaceQueue(items)
                return html`<p role="status">${items.length} tracks loaded.</p>`
            },
            html`<p role="status">Loading catalog…</p>`,
            () => html`
                <p role="status">The catalog could not load.</p>
                <button type="button" onclick="${() => load()}">Retry</button>
            `
        )()
    }

    const view = html`
        ${player.view}
        <h3>Catalog</h3>
        <button type="button" onclick="${() => load()}">Reload catalog</button>
        <button type="button" onclick="${() => load('failed')}">
            Test failed request
        </button>
        <button type="button" onclick="${() => load('empty')}">
            Test empty catalog
        </button>
        ${catalogStatus}
    `.onMount(() => () => {
        disposed = true
        request?.abort()
    })
    return { ...player, view }
}

export default function mount(target) {
    return createCatalog().view.render(target)
}
