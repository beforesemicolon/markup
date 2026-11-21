// These ids identify occurrences, not the label or the current array position.
const initialRows = [
    { id: 'mango-1', label: 'Mango', note: 'Monday pickup' },
    { id: 'pear-1', label: 'Pear', note: 'Wednesday pickup' },
    { id: 'mango-2', label: 'Mango', note: 'Friday pickup' },
]
const [rows, setRows] = state(initialRows)
const [query, setQuery] = state('')
const [selected, setSelected] = state('')
const [detail, setDetail] = state('')
const [pending, setPending] = state(false)

const visibleRows = () => {
    const term = query().trim().toLowerCase()
    return rows().filter((row) => row.label.toLowerCase().includes(term))
}
const clear = () => setQuery('')
const updateQuery = (event) => setQuery(event.currentTarget.value)
const reverse = () => setRows((previous) => [...previous].reverse())
const saveNote = (id, event) => {
    const note = event.currentTarget.value
    setRows((previous) =>
        previous.map((row) => (row.id === id ? { ...row, note } : row))
    )
}
const onNoteKey = (event) => {
    if (!event.altKey || event.key !== 'ArrowUp') return
    event.preventDefault()
    reverse()
}

// A deterministic stand-in for a transport that cannot always be aborted.
// Replace with your request function; pass its AbortSignal when supported.
const loadDetails = (id) =>
    new Promise((resolve) => {
        setTimeout(
            () => resolve(initialRows.find((row) => row.id === id)?.note ?? ''),
            id === 'mango-1' ? 350 : 30
        )
    })

const board = html`
    <label
        >Filter fruit <input value="${query}" oninput="${updateQuery}"
    /></label>
    <button type="button" onclick="${clear}">Clear</button>
    <button type="button" onclick="${reverse}">Reverse order</button>
    <p>In a note field, press Alt+Up to reverse without moving focus.</p>
    <ul aria-label="Fruit">
        ${repeat(
            visibleRows,
            (row) => html`
                <li>
                    <button
                        type="button"
                        onclick="${() => setSelected(row.id)}"
                    >
                        View ${row.label} (${row.id})
                    </button>
                    <label>
                        Note for ${row.id}
                        <input
                            value="${row.note}"
                            oninput="${(event) => saveNote(row.id, event)}"
                            onkeydown="${onNoteKey}"
                        />
                    </label>
                </li>
            `,
            { key: (row) => row.id, empty: () => html`<li>No matches</li>` }
        )}
    </ul>
    <p role="status">${when(pending, 'Loading details…', detail)}</p>
`.onMount(() =>
    effect(() => {
        const id = selected()
        if (!id) return
        let current = true
        setPending(true)
        void loadDetails(id).then(
            (note) => {
                if (!current) return
                setDetail(note)
                setPending(false)
            },
            () => {
                if (!current) return
                setDetail('Could not load details')
                setPending(false)
            }
        )
        return () => {
            current = false
        }
    })
)

board.render(document.querySelector('#board'))
const close = document.querySelector('#close-board')
close.addEventListener(
    'click',
    () => {
        board.unmount()
        close.disabled = true
    },
    { once: true }
)
