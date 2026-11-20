import { createQueue } from './05.js'

const { html, effect } = window.BFS.MARKUP
const volumeKey = 'markup-training-volume'

export function createPreferences(initialTracks) {
    const player = createQueue(initialTracks)
    const view = html`
        ${player.view}
        <button type="button" onclick="${() => player.setVolume(1)}">
            Reset volume
        </button>
    `.onMount(() => {
        try {
            const saved = localStorage.getItem(volumeKey)
            const level = Number(saved)
            if (
                saved !== null &&
                Number.isFinite(level) &&
                level >= 0 &&
                level <= 1
            ) {
                player.setVolume(level)
            }
        } catch {
            // Playback still works in a browser that blocks storage.
        }

        return effect(() => {
            const level = player.volume()
            try {
                localStorage.setItem(volumeKey, String(level))
            } catch {
                // Keep the preference in memory for this session.
            }
        })
    })
    return { ...player, view }
}

export default function mount(target) {
    return createPreferences().view.render(target)
}
