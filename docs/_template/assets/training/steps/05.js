import { createControls } from './04.js'

const { html, repeat, is, isNot, or, when, state } = window.BFS.MARKUP

export function createQueue(initialTracks) {
    const player = createControls(initialTracks)
    const [previousQueue, setPreviousQueue] = state([])

    function changeQueue(items) {
        const currentId = player.selectedId()
        const keepSelection = items.some((track) => track.id === currentId)
        if (!keepSelection) player.pause()
        player.setQueue(items)
        if (!keepSelection) player.select(items[0]?.id)
    }
    function clearOrRestore() {
        if (player.queue().length) {
            setPreviousQueue(player.queue())
            changeQueue([])
        } else {
            changeQueue(previousQueue())
        }
    }
    function replaceQueue(items) {
        setPreviousQueue([])
        changeQueue(items)
    }
    function choose(id) {
        if (id === player.selectedId()) return
        player.pause()
        player.select(id)
    }
    const hasTracks = () => player.queue().length > 0
    const canClearOrRestore = or(hasTracks, () => previousQueue().length > 0)
    const row = (track) => html`
        <li>
            <button
                type="button"
                aria-current="${is(player.selectedId, track.id)}"
                onclick="${() => choose(track.id)}"
            >
                ${track.title}
            </button>
        </li>
    `
    const view = html`
        ${player.view}
        <h3>Queue</h3>
        <ol>
            ${repeat(player.queue, row, {
                key: (track) => track.id,
                empty: () => html`<li>No tracks in the queue.</li>`,
            })}
        </ol>
        <button
            type="button"
            disabled="${isNot(hasTracks)}"
            onclick="${() => player.setQueue((items) => [...items].reverse())}"
        >
            Reverse queue
        </button>
        <button
            type="button"
            disabled="${isNot(canClearOrRestore)}"
            onclick="${clearOrRestore}"
        >
            ${when(hasTracks, 'Clear queue', 'Restore queue')}
        </button>
    `
    return { ...player, view, replaceQueue }
}

export default function mount(target) {
    return createQueue().view.render(target)
}
