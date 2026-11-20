const [query, setQuery] = state('')
const [items] = state([
    { id: 'apple', details: { name: 'Apple' } },
    { id: 'pear', details: { name: 'Pear' } },
    { id: 'plum', details: { name: 'Plum' } },
])

const filtered = () =>
    items().filter((item) =>
        item.details.name.toLowerCase().includes(query().trim().toLowerCase())
    )
const readInput = (event) => setQuery(event.currentTarget.value)
const clear = () => setQuery('')

html`
    <label>
        Filter fruit
        <input value="${query}" oninput="${readInput}" />
    </label>
    <button type="button" onclick="${clear}">Clear filter</button>
    ${when(
        is(pick(filtered, 'length'), 0),
        html`<p role="status">No fruit found.</p>`,
        html`<ul>
            ${repeat(filtered, (item) => html`<li>${item.details.name}</li>`, {
                key: (item) => item.id,
            })}
        </ul>`
    )}
`.render(document.querySelector('#app'))
