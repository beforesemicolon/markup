# Markup worked patterns

Open the [API index](./index.md) for an example and the exact declaration for
every runtime and TypeScript export. Read the [maintainer guide](./maintainer-guide.md)
for the full templating and state contract.

## Render changing data without replacing inputs

A field value and the value read from that field are different responsibilities.
Bind a getter for the displayed value and use a real input event to update the
state. Do not recreate the field when the rest of the UI changes.

```js
import { html, state, pick, when, is } from '@beforesemicolon/markup'

const [person, updatePerson] = state({ profile: { displayName: 'Taylor' } })
const name = pick(person, 'profile.displayName')
const edit = (event) => {
    const displayName = event.currentTarget.value
    updatePerson((previous) => ({
        ...previous,
        profile: { ...previous.profile, displayName },
    }))
}

html`
    <label>Name <input value="${name}" oninput="${edit}" /></label>
    ${when(is(name), html`<p>Preview: ${name}</p>`)}
`.render(document.body)
```

Do not call `name()` in the template substitution unless you want a snapshot.
For validation, use `is(name, (value) => value.trim().length > 0)` if the
getter always returns text. Use `and`, `or`, or `oneOf` to avoid manually
detecting whether an argument is a function.

## Maintain identity in a derived list

Use the [runnable filter examples](../examples/README.md). The source array
stays in one state value; the filtered array is a getter. `repeat` runs the
row factory and keeps eligible keyed DOM nodes live. Stable ids, not positions,
identify reusable rows. A keyed loop is not a reason to keep hidden rows mounted.

Good tests: change the search text; assert only matching rows; clear; assert
original order; reorder while a row input has focus; check that state and
focus follow the item, not the previous position. Ensure each group of
repeated rows creates its own binding, so its retained keys are not shared.

## Events and subscriptions have separate owners

Pass handlers, not their results. A stable handler describes a repeatable native
interaction. Markup supports an event tuple with listener options.

```js
import { effect, html, state } from '@beforesemicolon/markup'

const [selection, select] = state('None')
const initialTitle = document.title
const choose = () => select('Blue')
const panel = html`
    <button type="button" onclick="${[choose, { once: true }]}">
        Choose blue once
    </button>
    <p role="status">${selection}</p>
`.onMount(() => {
    const dispose = effect(() => {
        document.title = selection()
    })
    return () => {
        dispose()
        document.title = initialTitle
    }
})
panel.render(document.body)
window.addEventListener('pagehide', () => panel.unmount(), { once: true })
```

Read getters synchronously in an effect if the effect should track them.
Return a cleanup function for resources; do not give an effect an async
callback if you expect a returned function to be the disposer. When a getter
stores a function, check the package contract instead of assuming it is a
second computed value. In reactive rendering, callbacks and state writes
belong outside template evaluation.

## Inspect, move, replace, and remove templates

```js
import { html } from '@beforesemicolon/markup'

const content = html`<section ref="content">Old text</section>`
    .onMount(() => {
        console.log('mounted')
    })
    .onMove(() => {
        console.log('moved')
    })
    .onUpdate(() => {
        console.log('updated')
    })

content.render(document.body)
console.log(content.mounted, content.parentNode, content.childNodes)
console.log(content.refs.content?.[0])
const following = html`<p>Following</p>`.insertAfter(content)
const replacement = html`<section>New text</section>`.replace(content)
console.log(replacement.toString(), following.mounted)
replacement.unmount()
following.unmount()
```

Set hooks before mounting and use a distinct template instance for each owner.
Use native semantics for the section or list elements. Access DOM through
`refs` after render or in mount. Never infer layout from a string serialized
with `toString()`. If server serializing, use a compatible DOM environment
and preserve the same data and escaping rules. Markup does not turn trusted
raw HTML into sanitized HTML.

## Handle async data and deferred content

```js
import { html, suspense, visible } from '@beforesemicolon/markup'

const loaded = suspense(
    async () => 'Available',
    html`<p role="status">Loading status</p>`,
    (error) => html`<p role="alert">${error.message}</p>`
)
const deferred = visible(
    () => html`<p>Details below the fold</p>`,
    html`<p>Waiting for details</p>`,
    { rootMargin: '120px' }
)

html`<main>${loaded}${deferred}</main>`.render(document.body)
```

Use a measurable placeholder for viewport observation. `suspense` ignores
results of discarded mounts; separately abort the underlying request when it
owns a cancellable transport. Do not bind unrelated loading, error, and data
changes to three independent effects when one lifecycle owns them.

## Choose safe DOM APIs

Use `element('button', { textContent: 'Save', attributes: { type: 'button' } })`
when an API needs a node rather than reactive content. Use `val` at a helper
boundary that accepts a getter or literal; do not use it to pre-read every
binding. Escape by interpolating data into the template instead of passing it
to `unsafeHTML`. Place raw trusted markup in an explicitly reviewed constant.
