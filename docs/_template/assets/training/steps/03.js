import { createSelection } from './02.js'
import { tracks } from './tracks.js'

const { html, state, pick, when, is, isNot } = window.BFS.MARKUP

export function createTransport(initialTracks = tracks) {
    const [queue, setQueue] = state(initialTracks)
    const { current, select, next, selectedId } = createSelection(queue)
    const [status, setStatus] = state('paused')
    const [message, setMessage] = state('')
    const audio = () => view.refs.audio[0]

    function pause() {
        audio()?.pause()
        setStatus('paused')
        setMessage('')
    }

    async function toggle() {
        const media = audio()
        if (!media.paused) return pause()
        const requestedId = selectedId()
        try {
            setMessage('')
            await media.play()
        } catch (error) {
            if (error.name !== 'AbortError' && requestedId === selectedId()) {
                setMessage('Press Play to try again or select another track.')
            }
        }
    }

    function nextTrack() {
        pause()
        next()
    }

    function reportMediaError() {
        if (current()) setMessage('This recording could not play.')
    }

    const view = html`
        <h2 aria-live="polite">
            ${when(current, pick(current, 'title'), 'Choose a track')}
        </h2>
        <p>${pick(current, 'artist')}</p>
        <audio
            ref="audio"
            preload="metadata"
            src="${() => current()?.src || null}"
            onplaying="${() => setStatus('playing')}"
            onpause="${() => setStatus('paused')}"
            onended="${() => setStatus('ended')}"
            onerror="${reportMediaError}"
        ></audio>
        <button type="button" disabled="${isNot(current)}" onclick="${toggle}">
            ${when(is(status, 'playing'), 'Pause', 'Play')}
        </button>
        <button
            type="button"
            disabled="${isNot(current)}"
            onclick="${nextTrack}"
        >
            Next track
        </button>
        <p role="status">${message}</p>
    `.onMount(() => {
        const media = audio()
        return () => media.pause()
    })

    return {
        view,
        audio,
        queue,
        setQueue,
        current,
        selectedId,
        select,
        pause,
        status,
    }
}

export default function mount(target) {
    return createTransport().view.render(target)
}
