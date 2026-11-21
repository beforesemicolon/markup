import { tracks } from './tracks.js'

const { html, state, pick } = window.BFS.MARKUP

export function createSelection(readTracks) {
    const [selectedId, select] = state(readTracks()[0]?.id)
    const current = () =>
        readTracks().find((track) => track.id === selectedId())

    function next() {
        const queue = readTracks()
        if (queue.length === 0) return
        const index = queue.findIndex((track) => track.id === selectedId())
        select(queue[(index + 1) % queue.length].id)
    }
    return { current, selectedId, select, next }
}

export default function mount(target) {
    const { current, next } = createSelection(() => tracks)
    return html`
        <h2 aria-live="polite">${pick(current, 'title')}</h2>
        <p>${pick(current, 'artist')}</p>
        <audio
            controls
            preload="metadata"
            src="${pick(current, 'src')}"
        ></audio>
        <button type="button" onclick="${next}">Next track</button>
    `.render(target)
}
