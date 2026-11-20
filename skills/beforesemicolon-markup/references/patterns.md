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

## Decision rules: use the smallest helper that preserves the behavior

Read the owner's existing selector and component API before replacing code.
Move only the UI decision to the helper; leave business logic where it already
belongs. Markup 1.22.0 does not export a `compute`, `computed`, or `derived`
function. Use a named pure getter for calculated values, and compose Markup
helpers around it. Do not import an API just because another framework uses
that spelling.

| What the code does                                 | What to use in a reactive view                                                                                                                              | When ordinary code is appropriate                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Chooses between view blocks                        | `when(condition, thenValue, elseValue?)`. Pass a getter to let the view track the condition; use a branch factory when creating a fresh template is needed. | An early return for invalid input in an event handler, or an invariant choice before mounting.                            |
| Renders a collection of rows                       | `repeat(source, rowFactory, { key, empty })`. Use a stable id for rows that can move; use `empty` for the collection's empty state.                         | `.map` to transform data, not produce live rows. No helper is needed for fixed, literal markup.                           |
| Reads a stable nested path                         | `pick(source, 'profile.name')`. Read ordinary fields like `row.name` directly in a `repeat` callback.                                                       | Dynamic keys, several fallback paths, computed indexes, or a domain-specific null/default contract.                       |
| Checks exact equality or applies a predicate       | `is(source, expected)` / `isNot(source, expected)` use strict equality for scalar expected values. Pass a predicate for a range or domain-specific test.    | Compare two changing sources with a predicate that reads the other getter; do not pass that getter as the expected value. |
| Checks truthiness or membership                    | `is(source)`, `isNot(source)`, `oneOf(source, fixedOptions)`. Passing `undefined` to `is` checks truthiness; use a predicate to test specifically for it.   | For changing options, use `is(source, (value) => options().includes(value))` so both reads stay reactive.                 |
| Combines conditions                                | `and(a, b, ...)` / `or(a, b, ...)`, minimum two operands. Pass getters, not their results. No wrapping is needed for a single boolean getter.               | Keep branches in a command that performs actions or must report which validation rule failed.                             |
| Computes a total, filters data, or joins sources   | A pure named getter reads canonical state; pass the getter to `repeat`, `when`, another helper, or directly to the template.                                | Use ordinary JS transforms inside the getter. Do not introduce state or an effect to mirror pure data.                    |
| Observes or changes something outside the template | An event handler for explicit commands, `effect` for reactive synchronization, and mount cleanup for owned resources.                                       | A non-reactive service or a native API when ownership is outside the template.                                            |

Do not assume a `pick` mapper handles every missing root. In 1.22.0 it returns
an empty string for a falsy root before calling the mapper; a missing path in
an existing object yields `undefined` or is passed to the mapper. For null-only
fallbacks, or if `0`, `false`, and the empty string must remain distinct, write
an explicit selector or use a normalized, typed source. Do not replace a nullish
check with truthiness unless that is the intended behavior.

## Before and after: bind states instead of rebuilding the view

Avoid computing an array of view nodes inside a custom getter, and do not call
the reactive boolean at template creation. The example below captures
`saving()` at mount and recreates the rows when the binding updates:

```js
const view = html`
    <button type="button" disabled="${saving()}" onclick="${() => save()}">
        Save
    </button>
    ${() =>
        items().length
            ? html`<ul>
                  ${items().map((item) => html`<li>${item.name}</li>`)}
              </ul>`
            : html`<p>No items</p>`}
`
```

Prefer a direct handler, composed boolean, and separate key-aware row binding:

```js
import { html, is, or, repeat, state, when } from '@beforesemicolon/markup'

const [items, setItems] = state([{ id: 'a', name: 'Mango' }])
const [saving, setSaving] = state(false)
const [permission] = state('write')
const blocked = or(
    saving,
    is(permission, (value) => value !== 'write')
)
const save = () => {
    if (blocked()) return
    setSaving(true)
    setItems((previous) => [
        ...previous,
        { id: String(previous.length), name: 'Pear' },
    ])
    setSaving(false)
}

html`
    <button type="button" disabled="${blocked}" onclick="${save}">Save</button>
    <ul aria-label="Items">
        ${repeat(items, (item) => html`<li>${item.name}</li>`, {
            key: (item) => item.id,
            empty: () => html`<li>No items</li>`,
        })}
    </ul>
    ${when(saving, html`<p role="status">Saving</p>`)}
`.render(document.body)
```

The disabled binding only describes UI state. It does not grant or enforce
permission to write data. A command handler and its backend must enforce
the real access rules.

## Before and after: keep a filter in data and a format in the view

Avoid storing a second array that an effect must synchronize:

```js
const [visibleItems, setVisibleItems] = state(items())
effect(() =>
    setVisibleItems(items().filter((row) => row.name.includes(query())))
)
```

Prefer reading the search term once, preserving source order, and composing
comparisons from getters:

```js
import {
    html,
    is,
    oneOf,
    pick,
    repeat,
    state,
    when,
} from '@beforesemicolon/markup'

const [query, setQuery] = state('')
const [items] = state([
    { id: 'a', name: 'Mango' },
    { id: 'b', name: 'Pear' },
])
const [profile] = state({ settings: { mode: 'advanced' } })
const mode = pick(profile, 'settings.mode')
const showTools = oneOf(mode, ['advanced', 'expert'])
const filtered = () => {
    const searchTerm = query().trim().toLowerCase()
    return items().filter((row) => row.name.toLowerCase().includes(searchTerm))
}
const emptyQuery = is(query, (value) => value.trim() === '')
const update = (event) => setQuery(event.currentTarget.value)
const clear = () => setQuery('')

html`
    <label>Filter <input value="${query}" oninput="${update}" /></label>
    ${when(
        showTools,
        html`<button type="button" onclick="${clear}" disabled="${emptyQuery}">
            Clear
        </button>`
    )}
    <ul>
        ${repeat(filtered, (row) => html`<li>${row.name}</li>`, {
            key: (row) => row.id,
            empty: () => html`<li>No matches</li>`,
        })}
    </ul>
`.render(document.body)
```

Sorting follows the same principle: use `toSorted` if target browsers support
it, or copy before sorting. Never sort the canonical array in place. For
expensive transformations, measure first; if a cache is necessary, implement
it at the selector's data boundary and test invalidation. Do not treat a
plain getter as a memoized primitive.

## Reuse components and keep the real DOM contract

Avoid a generic wrapper whose only job is to set width or spacing already
supported by the selected control. Prefer its documented props and variants,
and use its public event directly. Do not add a wrapper that reaches into a
component's shadow DOM or duplicates keyboard, focus, or ARIA behavior. Keep
a native `form`, `fieldset`, `nav`, list, or labelled section when it adds
semantics. Prefer an actual button to a clickable generic element.

For example, do not replace an existing `RemoveButton` with a generic
`div` and duplicate key bindings. If no suitable shared control exists and the
requirement is a simple native action, keep the native button and pass the
row's id through a thin adapter:

```js
import { html, repeat } from '@beforesemicolon/markup'

const rows = [{ id: 'a', name: 'Mango' }]
const remove = (id) => console.log('Remove', id)
html`
    <ul>
        ${repeat(
            rows,
            (row) => html`
                <li>
                    ${row.name}
                    <button type="button" onclick="${() => remove(row.id)}">
                        Remove ${row.name}
                    </button>
                </li>
            `
        )}
    </ul>
`.render(document.body)
```

A wrapper is valid for otherwise unsupported semantics, responsive
reflow, positioning or stacking, a measured animation need, or a real test or
behavior boundary. A custom selector is valid for a new calculation or
contract a helper cannot express without hiding behavior. Do not build a
second primitive merely to rename attributes or duck-type getter inputs.
Use `val` only at a boundary that explicitly accepts a literal or getter.

## Audit before handing off

- Identify the existing controls, templates, selectors, and public helpers
  you reused. If you added a wrapper or selector, name the missing behavior.
- Read each reactive binding. Remove accidental snapshots, casts, redundant
  calls, and unnecessary event adapters. Test an update after mount.
- Test boundary states: empty and restored lists, false versus missing
  inputs, changed options, and keyed reorder where row identity matters.
- Keep accessible names, native keyboard behavior, and valid nesting. For
  custom components, test the actual documented event and payload.
- Check effect ownership: no asynchronous operations or writes in render;
  dispose subscriptions and cancel cancellable requests on replacement or
  unmount. Verify the cleanup runs, not just that nodes disappear.
- Run the project's checker, type checks, and interaction tests. Prefer
  assertions against the visible state and public contract, not private DOM.

## Review real binding shapes

| Look for in an existing template                        | Prefer                                                                                   |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `value="${() => query().search}"` for a stable path     | Define `const search = pick(query, 'search')`; bind `value="${search}"`.                 |
| `disabled="${() => replying()                           |                                                                                          | pending()}"`    | Define `const blocked = or(replying, pending)`; bind `disabled="${blocked}"`. |
| `disabled="${() => !hasAccess()                         |                                                                                          | submitting()}"` | Define `const blocked = or(isNot(hasAccess), submitting)`.                    |
| `hidden="${() => selectedView() !== 'preview'}"`        | Define `const hidden = isNot(selectedView, 'preview')`; bind `hidden="${hidden}"`.       |
| `${() => formatPrice(amount())}` for a real format rule | Keep the transform, ideally as a named getter; a nested read is not currency formatting. |
| `onclick="${() => move(field.id, -1)}"`                 | Keep the thin adapter. The DOM event does not supply the field id and direction.         |

Treat native boolean attributes and ARIA states as different contracts. For
native `hidden` or `disabled`, bind a boolean getter: false removes the
attribute. For `aria-expanded` or `aria-pressed`, preserve the explicit
string value `"false"` when the ARIA state requires it. For example,
`const ariaExpanded = when(open, 'true', 'false')` and
`aria-expanded="${ariaExpanded}"`. This conversion is intentional, not a
reason to stringify ordinary boolean or numeric attributes.
