const { html, HtmlTemplate, state, effect, repeat, DynamicValueType } =
    window.BFS.MARKUP

export default function mount(target) {
    const [messages, setMessages] = state([])
    const [step, setStep] = state(0)
    const [busy, setBusy] = state(false)
    const [inspection, setInspection] = state('')
    const log = (message) => setMessages((previous) => [...previous, message])
    const titles = [
        'Harbor Lights',
        'Slow Tide',
        'Night Signal',
        'Harbor Lights',
    ]
    const [index, setIndex, unsubscribe] = state(0, () =>
        log('The state subscriber ran.')
    )
    const title = () => titles[index()]

    const card = html`<p ref="track">Now playing: ${title}</p>`
        .onMount(() => {
            log('onMount: the card was mounted.')
            return () => log('The cleanup returned by onMount ran.')
        })
        .onUpdate(() => log('onUpdate: the title changed.'))
        .onMove(() => log('onMove: the card changed parent.'))
    // Constructor exercise. The parts here are fixed, author-owned strings.
    const marker = new HtmlTemplate(['<p>Starting position</p>'], [])
    const badge = html`<p>Queue item</p>`
    let stopHistory, stopResource

    const steps = [
        ['Render the marker in the main player', () => marker.render(main)],
        ['Replace the marker with the track card', () => card.replace(marker)],
        [
            'Insert the queue label after the card',
            () => badge.insertAfter(card),
        ],
        ['Move the card to the mini player', () => card.render(mini)],
        [
            'Start two effects',
            () => {
                stopHistory = effect((previous) => {
                    const current = title()
                    log(`History: ${previous ?? 'initial'} → ${current}.`)
                    return current
                })
                stopResource = effect(() => {
                    const current = title()
                    log(`Start a resource for ${current}.`)
                    return () => log(`Release the resource for ${current}.`)
                })
            },
        ],
        [
            'Change the current track',
            () => setIndex((previous) => previous + 1),
        ],
        [
            'Unsubscribe from state and change tracks',
            () => {
                unsubscribe()
                setIndex(2)
            },
        ],
        [
            'Stop the effects and change tracks',
            () => {
                stopHistory()
                stopResource()
                setIndex(3)
            },
        ],
        [
            'Unmount the card and queue label',
            () => {
                card.unmount()
                badge.unmount()
            },
        ],
    ]

    function inspect() {
        const lines = [
            `instanceof HtmlTemplate: ${card instanceof HtmlTemplate}`,
            `mounted: ${card.mounted}`,
            `parentNode: ${card.parentNode?.getAttribute('aria-label') ?? 'none'}`,
            `childNodes: ${card.childNodes.map((node) => node.nodeName).join(', ') || 'none'}`,
            `refs.track: ${card.refs.track?.length ?? 0}`,
        ]
        // Serializing an unmounted template would itself trigger a temporary mount.
        if (card.mounted) lines.push(`toString(): ${card.toString()}`)
        setInspection(lines.join('\n'))
    }

    async function advance() {
        if (busy() || step() >= steps.length) return
        setBusy(true)
        const [name, run] = steps[step()]
        log(name)
        run()
        // Let Markup finish its scheduled binding updates before inspecting the nodes.
        await new Promise((resolve) => requestAnimationFrame(resolve))
        inspect()
        setStep((previous) => previous + 1)
        setBusy(false)
    }

    function restart() {
        view.unmount()
        mount(target)
    }

    const next = () =>
        step() === steps.length
            ? 'Lab complete.'
            : `Step ${step() + 1} of ${steps.length}: ${steps[step()][0]}`
    const view = html`
        <p role="status">${next}</p>
        <button
            type="button"
            onclick="${advance}"
            disabled="${() => busy() || step() === steps.length}"
        >
            Run next step
        </button>
        <button type="button" onclick="${restart}" disabled="${busy}">
            Restart lab
        </button>
        <h3>Main player</h3>
        <div ref="main" aria-label="Main player"></div>
        <h3>Mini player</h3>
        <div ref="mini" aria-label="Mini player"></div>
        <h3>Track card inspection</h3>
        <pre>${inspection}</pre>
        <details>
            <summary>Four binding types</summary>
            <dl>
                <dt>${DynamicValueType.Content}</dt>
                <dd>The track title inside a paragraph.</dd>
                <dt>${DynamicValueType.Attribute}</dt>
                <dd>A changing disabled attribute.</dd>
                <dt>${DynamicValueType.Directive}</dt>
                <dd>An attribute object supplied in an opening tag.</dd>
                <dt>${DynamicValueType.Event}</dt>
                <dd>A function bound to a button click.</dd>
            </dl>
        </details>
        <h3>Event log</h3>
        <ol>
            ${repeat(messages, (message) => html`<li>${message}</li>`, { key: (_, i) => i })}
        </ol>
    `
        .onMount(() => () => {
            stopHistory?.()
            stopResource?.()
            unsubscribe()
            card.unmount()
            marker.unmount()
            badge.unmount()
        })
        .render(target)
    const [main] = view.refs.main
    const [mini] = view.refs.mini
    inspect()
    return view
}
