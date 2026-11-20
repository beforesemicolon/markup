import { createNotesPlayer } from './08.js'

const { html, state, when } = window.BFS.MARKUP

class PlaylistPlayer extends HTMLElement {
    connectedCallback() {
        if (!this.view) this.view = createNotesPlayer().render(this)
    }

    disconnectedCallback() {
        this.view?.unmount()
        this.view = null
    }
}

if (!customElements.get('playlist-player')) {
    customElements.define('playlist-player', PlaylistPlayer)
}

export default function mount(target) {
    const [showSecond, setShowSecond] = state(false)
    return html`
        <section aria-label="Player 1">
            <h3>Player 1</h3>
            <playlist-player></playlist-player>
        </section>
        <button
            type="button"
            onclick="${() => setShowSecond((shown) => !shown)}"
        >
            ${when(showSecond, 'Remove second player', 'Add second player')}
        </button>
        ${when(
            showSecond,
            () => html`
                <section aria-label="Player 2">
                    <h3>Player 2</h3>
                    <playlist-player></playlist-player>
                </section>
            `
        )}
    `.render(target)
}
