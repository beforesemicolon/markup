import { createTransport } from './03.js'

const { html, state, val, is, isNot, and, or, oneOf } = window.BFS.MARKUP

function clock(input) {
    const seconds = Math.floor(val(input))
    return (
        Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
    )
}

export function createControls(initialTracks) {
    const player = createTransport(initialTracks)
    const [position, setPosition] = state(0)
    const [duration, setDuration] = state(0)
    const [volume, rememberVolume] = state(1)
    const hasDuration = is(
        duration,
        (seconds) => Number.isFinite(seconds) && seconds > 0
    )
    const canSeek = and(player.current, hasDuration)
    const isStopped = oneOf(player.status, ['paused', 'ended'])
    const cannotRestart = or(isNot(canSeek), and(is(position, 0), isStopped))
    const timeLabel = () => clock(position) + ' of ' + clock(duration)

    function seek(event) {
        if (canSeek()) player.audio().currentTime = event.target.valueAsNumber
    }

    function restart() {
        player.audio().currentTime = 0
    }

    function setVolume(level) {
        player.audio().volume = level
        rememberVolume(level)
    }

    const view = html`
        ${player.view}
        <label
            >Playback position
            <input
                type="range"
                min="0"
                max="${duration}"
                step=".1"
                value="${position}"
                disabled="${isNot(canSeek)}"
                aria-valuetext="${timeLabel}"
                oninput="${seek}"
            />
        </label>
        <p aria-hidden="true">${timeLabel}</p>
        <label
            >Volume
            <input
                type="range"
                min="0"
                max="1"
                step=".05"
                value="${volume}"
                oninput="${(event) => setVolume(event.target.valueAsNumber)}"
            />
        </label>
        <button type="button" disabled="${cannotRestart}" onclick="${restart}">
            Restart track
        </button>
    `.onMount(() => {
        const media = player.audio()
        const listeners = new AbortController()
        const options = { signal: listeners.signal }
        function updateDuration() {
            setDuration(Number.isFinite(media.duration) ? media.duration : 0)
        }
        function updatePosition() {
            setPosition(media.currentTime)
        }
        media.addEventListener('durationchange', updateDuration, options)
        media.addEventListener('timeupdate', updatePosition, options)
        media.addEventListener('emptied', updatePosition, options)
        updateDuration()
        return () => listeners.abort()
    })
    return { ...player, view, volume, setVolume }
}

export default function mount(target) {
    return createControls().view.render(target)
}
