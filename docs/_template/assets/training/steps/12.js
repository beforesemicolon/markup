const { html, state, is, when } = window.BFS.MARKUP

export default function mount(target) {
    // The TypeScript lab applies StateGetter<number> and StateSetter<number>
    // to these same two values. Types disappear when you compile the code.
    const [volume, setVolume] = state(0.5)
    const silent = is(volume, 0)
    const quiet = is(volume, (level) => level < 0.5)
    const levelLabel = when(silent, 'Muted', when(quiet, 'Quiet', 'Audible'))

    return html`
        <label>
            Volume
            <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value="${volume}"
                aria-valuetext="${() => Math.round(volume() * 100) + '%'}"
                oninput="${(event) => setVolume(event.currentTarget.valueAsNumber)}"
            />
        </label>
        <p>
            <output
                >${levelLabel} · ${() => Math.round(volume() * 100)}%</output
            >
        </p>
    `.render(target)
}
