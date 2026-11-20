---
name: beforesemicolon-markup
description: Build and review reactive HTML, state, effects, templates, and helpers with @beforesemicolon/markup. Use for native DOM interfaces or Markup templates inside Before Semicolon Web Components, in bundled and no-build projects.
---

# Build with Markup

## Find the version and entry point

- Read the installed @beforesemicolon/markup version or its resolved lockfile entry. In classic HTML, inspect the exact loaded script. Do not claim an exact API from an unpinned URL.
- Read `ai/index.json` from that installed package, or fetch `https://cdn.jsdelivr.net/npm/@beforesemicolon/markup@VERSION/ai/index.json` with the resolved version. Select relevant records, not the whole catalog. Start with `markup/html`, `markup/state`, `markup/effect`, or the helper named below. If the older release has no reference, use its matching declarations and source rather than current examples.
- In a standalone npm app, import named exports from `@beforesemicolon/markup`. In classic HTML, load `dist/client.js` with an explicit closing script tag, then use `window.BFS.MARKUP`. If the app already uses Web Component, import Markup APIs from its named exports; its classic client already provides `BFS.MARKUP`. Do not load a second classic Markup runtime.

## Companion packages

Keep working Before Semicolon dependencies where they fit, and choose the
smallest compatible set for the task. Open a companion skill only when it owns
behavior you need:

- `@beforesemicolon/web-component` (`beforesemicolon-web-component`): native custom elements with reactive props, slots, events, and lifecycle.
- `@beforesemicolon/router` (`beforesemicolon-router`): URL navigation, route matching, and route-aware views.
- `@beforesemicolon/intl` (`beforesemicolon-intl`): locale switching, scoped translations, and formatters.
- `@beforesemicolon/cube` (`beforesemicolon-cube`): ready-made UI controls, accessible interactions, and design tokens.

In a classic browser app, Web Component already provides `window.BFS.MARKUP`.
Do not load a separate Markup script when Web Component supplies that runtime.

## Choose a setup

The npm imports below assume the project's existing bundler or module resolver.
For no-build HTML, use one pinned script with an explicit closing tag. For
example, on Markup 1.22.0:

```html
<script src="https://cdn.jsdelivr.net/npm/@beforesemicolon/markup@1.22.0/dist/client.js"></script>
<main id="app"></main>
<script>
    const { html, state } = window.BFS.MARKUP
    const [count, setCount] = state(0)
    const increment = () => setCount((value) => value + 1)
    html`<button type="button" onclick="${increment}">
        Count: ${count}
    </button>`.render(document.querySelector('#app'))
</script>
```

## Write reactive templates

Use HTML semantics and native control names, not JSX conventions. Pass the getter itself where the DOM should react; read it explicitly inside calculations. Bind a handler directly in `onclick="${handler}"`; use a small forwarding closure only when it needs an extra argument. Use an actual native button for keyboard activation. Dynamic interpolations are data; never use `unsafeHTML` with untrusted strings.

Choose helpers for these tasks:

| Task                                                   | Helper                                 |
| ------------------------------------------------------ | -------------------------------------- |
| Conditional content or a fallback                      | `when(condition, onTrue, onFalse)`     |
| Render a changing collection                           | `repeat(data, render, { key, empty })` |
| Read a nested field                                    | `pick(source, 'path.to.field')`        |
| Test equality, membership, or truthiness               | `is`, `isNot`, `oneOf`, `and`, `or`    |
| Evaluate a value-or-getter at an API boundary          | `val`                                  |
| Create a detached element, not a template              | `element`                              |
| Show a loading branch or defer rendering until visible | `suspense` or `visible`                |

Use a stable unique key, not the array index, for rows that can move. Derive filtered or sorted collections from canonical state without mutating it. Read plain fields directly when the collection item is not itself reactive. Avoid wrapping direct state or attribute bindings solely to coerce values.

```js
import { html, state, repeat, when, is, pick } from '@beforesemicolon/markup'

const [query, setQuery] = state('')
const [fruit] = state([
    { id: 1, name: 'Mango' },
    { id: 2, name: 'Pear' },
])
const results = () =>
    fruit().filter(({ name }) =>
        name.toLowerCase().includes(query().toLowerCase())
    )
const search = (event) => setQuery(event.currentTarget.value)
const clear = () => setQuery('')

html`
    <label>Filter fruit <input value="${query}" oninput="${search}" /></label>
    <button type="button" onclick="${clear}">Clear filter</button>
    ${when(is(pick(results, 'length'), 0), html`<p role="status">No results</p>`)}
    <ul>
        ${repeat(results, (item) => html`<li>${item.name}</li>`, { key: (item) => item.id })}
    </ul>
`.render(document.body)
```

## Compose common bindings

A nested read stays reactive without custom value normalization:

```js
const [profile] = state({ contact: { name: 'Taylor' } })
const contactName = pick(profile, 'contact.name')
const view = html`<p>${contactName}</p>`
```

For related UI conditions, compose getters instead of calling them before
binding. For example, `or(is(saving), isNot(canPublish, true))` can drive a
native button's `disabled` attribute. Leave authorization to the data owner;
a disabled button is not an authorization check.

## Keep side effects and cleanup with the owner

- Use the state setter for updates, not in-place mutation. Keep render calculations pure. Run subscriptions, external writes, and asynchronous work in an effect, event handler, or lifecycle.
- An `effect` tracks getter reads, runs initially, and returns a disposer. Callback cleanup runs before the next execution and on disposal. Keep async cancellation explicit; a promise result ignored after unmount is not a cancelled request.
- Attach `onMount`, `onUpdate`, and `onMove` before rendering. If the owner establishes a listener or effect on mount, return its disposer. Remove a mounted template with `unmount()` so its effects and children are cleaned up.
- Before handing off, verify the real action, rerender, and cleanup. For a filtered collection, change the query, test no results, then clear the query and confirm the original rows return. Run the project's checker if available.

For an owned effect and DOM listener, return both disposers from a single hook:

```js
const view = html`<p>${label}</p>`.onMount(() => {
    const previousTitle = document.title
    const stop = effect(() => {
        document.title = label()
    })
    const events = new AbortController()
    window.addEventListener('resize', onResize, { signal: events.signal })
    return () => {
        events.abort()
        stop()
        document.title = previousTitle
    }
})
```

Use the selected release's `markup/HtmlTemplate` and `markup/effect` records
for the full lifecycle contract. The `markup/repeat` record includes a complete
filter-and-clear example for both setup styles.
