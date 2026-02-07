---
name: Guide & Best Practices
order: 4
title: Guidelines & Best Practices - Markup by Before Semicolon
description: Guidelines & Best Practices Markup by Before Semicolon
layout: document
---

# Markup Project Guide

Comprehensive guide for `@beforesemicolon/markup`. Use this as a quick onboarding for humans and AI agents exploring the repo.

## Contents

-   Overview
-   Quick Start (npm & CDN)
-   Core APIs: `html`, `state`, `effect`
-   Template Utilities (`when`, `repeat`, `is`, `oneOf`, `pick`, `element`, `suspense`, `val`)
-   Patterns & Gotchas
-   Real‑world Scenarios & Examples
-   Project Internals & Resources

## Overview

Markup is a tiny reactive templating system that keeps you close to web standards. It relies on JavaScript functions and tagged template literals to describe the DOM declaratively, then reconciles changes efficiently without a virtual DOM.

## Quick Start

### Install

```bash
npm install @beforesemicolon/markup
```

### CDN (no build step)

```html
<script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js"></script>
<script>
    const { html, state, effect } = BFS.MARKUP
    html`<h1>Hello World</h1>`.render(document.body)
</script>
```

### Minimal counter

```ts
import { html, state, effect } from '@beforesemicolon/markup'

const [count, setCount] = state(0)
const increment = () => setCount((prev) => prev + 1)

effect(() => {
    if (count() > 10) alert('Passed 10!')
})

html`
    <p>Count: ${count}</p>
    <button type="button" onclick="${increment}">Count up</button>
`.render(document.getElementById('app'))
```

## Core APIs

### `html` – reactive templates

-   Tagged template literal returning an `HtmlTemplate`. Interpolations accept primitives, Nodes, or **functions** returning either.
-   Any function interpolated inside the template is re-run when reactive values it reads change.
-   Use functions for dynamic attributes/styles/text. Prefer `${valueGetter}` over `${valueGetter()}` inside templates so Markup can call the getter reactively.

```ts
const [first] = state('Ada')
const [last] = state('Lovelace')

const fullName = () => `${first()} ${last()}` // function as data
html`<h1>Hello, ${fullName}</h1>` // do NOT call it here

const styles = () => `color: ${first() === 'Ada' ? 'teal' : 'black'}`
html`<p style="${styles}">${fullName}</p>` // template calls styles and fullName
```

-   Functions placed directly in templates are **first-class data**: the template calls them, subscribes to any state reads inside, and re-renders when those states change.
-   Helpers (`when`, `repeat`, `pick`, etc.) also accept functions and subscribe to the state reads inside them.

### `state` – reactive values

```ts
const [value, setValue, unsubscribe] = state(initial, optionalSubscriber)
setValue(next | (prev) => next)
unsubscribe() // stop the optional subscriber
```

-   Optional 2nd argument: `state(initial, subscriber)` registers an initial subscriber (useful for effects that should run on every change).
-   Getter form (`value`) is callable in JS (`value()`) and directly usable in templates (`${value}`) for reactivity.
-   Setters batch updates; subscribers run on the next tick.
-   Third tuple entry unsubscribes the initial subscriber when you no longer need it.

Example (unsubscribe after one update):

```ts
const [value, setValue, stopLog] = state(0, () => {
    console.log('value changed to', value())
})

setValue(1) // logs once
stopLog() // detach the subscriber
setValue(2) // no log
```

### `effect` – side effects

```ts
const removeEffect = effect(() => {
    console.log('value is', value())
    // return optional cleanup or derived value
})
// later: removeEffect()
```

-   Runs immediately and whenever reactive reads inside change.
-   Use for side effects only; render UI via template functions instead.

## Template Utilities (what/when/how)

These helpers are primarily for **stateful** data. For static values, plain JS (ternaries, `map`, literals) is fine.

### `when(condition, then, else?)`

-   Use when the condition depends on state so the template re-runs automatically.
-   For static booleans, a direct binding or ternary is fine.

```ts
// Reactive: reruns when stateful isLoading changes
html`${when(isLoading, 'Loading…', 'Ready')}`

// Static: simple ternary is clearer
html`${isStatic ? 'Yes' : 'No'}`

// Booleans: bind directly instead of wrapping in when
html`<button disabled="${isSaving}">Save</button>`
```

Avoid: nesting complex logic inside `when`. Compute booleans first, e.g.:

```ts
const canSubmit = () => isAuth() && hasPlan()
html`${when(canSubmit, 'Go', 'Login required')}`
```

### `repeat(data, mapFn, whenEmpty?)`

-   Renders lists from arrays, Sets, Maps, numbers, or objects; first arg may be a getter.
-   Keeps item instances stable by memoizing map results.

```ts
const [items] = state([{ id: 1, name: 'A' }]) // Array
html`${repeat(
    items,
    (item) => html`<li>${item.name}</li>`,
    () => 'No items'
)}`

const setData = new Set(['a', 'b']) // Set
html`${repeat(setData, (v) => html`<span>${v}</span>`)}`

const mapData = new Map([
    [1, 'one'],
    [2, 'two'],
]) // Map (receives [key,value])
html`${repeat(mapData, ([k, v]) => html`<p>${k}:${v}</p>`)}`

const count = 3 // Number (renders 1..n)
html`${repeat(count, (n, i) => html`<b>${n}</b>`)}`

const obj = { a: 1, b: 2 } // Object (entries)
html`${repeat(obj, ([k, v]) => html`<em>${k}:${v}</em>`)}`

const iterable = {
    // Custom iterable
    *[Symbol.iterator]() {
        yield 'x'
        yield 'y'
    },
}
html`${repeat(iterable, (v) => html`<i>${v}</i>`)}`
```

For static arrays, `array.map` inline is fine. Use `repeat` when the list is reactive so DOM nodes update efficiently. Avoid passing a non-iterable (will render empty/throw).

### `is(a, b)` / `isNot(a, b)`

-   Simple equality/predicate helpers that return booleans; pair with `when`.

```ts
html`${when(is(status, 'error'), 'Retry', 'Submit')}`
html`${when(
    is(value, (v) => v > 10),
    'Big',
    'Small'
)}` // predicate
html`${when(is(flag), 'Truthy', 'Falsy')}` // no second arg: truthy/falsy check
```

Use for clarity; avoid chaining multiple comparisons—use `oneOf` instead.

### `oneOf(value, list)`

-   Tests membership against an array.

```ts
html`${when(oneOf(mode, ['create', 'edit']), 'Writable', 'Read-only')}`
```

Use instead of long `||` chains. Avoid huge lists—precompute a Set if needed.

### `and(...conditions)` / `or(...conditions)`

-   Boolean combinators that evaluate values/getters lazily.

```ts
html`${when(and(isAuth, hasPlan), 'Welcome back')}`
```

Use to express intent; avoid very long chains—extract helper functions instead.

### `pick(obj, key, mapper?)`

-   Safely read deep values using dot paths; optionally map the extracted value.

```ts
const [user] = state({ profile: { name: 'Ada' } })
html`<p>Name: ${pick(user, 'profile.name')}</p>`
html`<p>
    Upper: ${pick(user, 'profile.name', (v) => String(v).toUpperCase())}
</p>`
```

Use when passing nested data into templates without manual guarding. Avoid overusing for simple flat reads—direct getters are clearer.

### `element(tagFn, options)`

-   Create dynamic elements while staying reactive (e.g., switching tag names). Options: `attributes`, `properties`, `htmlContent`, `children`, and event handlers in `attributes` (e.g., `onclick`).

```ts
const tag = () => (isBlock() ? 'div' : 'button')
const click = () => console.log('clicked')
html`${() =>
    element(tag(), {
        attributes: { class: 'box', onclick: click, 'data-kind': 'demo' },
        properties: { title: 'hello' },
        textContent: 'text',
        htmlContent: '<strong>Hi</strong>',
        children: [element('span', { textContent: ' more text' })],
    })}`
```

Use for dynamic tags or programmatic element creation. Avoid when a static tag suffices.

### `suspense(asyncAction, loadingTpl?, errorTpl?)`

-   Shows `loadingTpl` while `asyncAction` resolves; swaps in result (template or value) or `errorTpl` on failure.

```ts
const loadTodos = () => fetch('/api/todos').then((r) => r.json())

html`
    ${suspense(
        async () => {
            const todos = await loadTodos()
            return html`<ul>
                ${repeat(todos, (t) => html`<li>${t.title}</li>`)}
            </ul>`
        },
        html`<p>Loading todos…</p>`,
        (err) => html`<p class="error">${err.message}</p>`
    )}
`
```

Use for async UI slots. Avoid calling the same slow action repeatedly; wrap it to cache results if needed.

### `val(anything)`

-   Normalizes getters/values; mostly used internally. Handy when writing your own helpers.

```ts
const maybe = (x) => val(x) ?? 'N/A'
```

Use in utility code; avoid sprinkling in templates—other helpers already unwrap.

## Patterns & Best Practices

-   Keep templates declarative: use `when`, `repeat`, and boolean helpers **when binding to state**; for one-off static content, inline values/ternaries/`map` are fine.
-   Derive values inside small functions (`${() => ...}`) to stay reactive; avoid capturing mutable state outside. Rendering once? Use `${state()}`; need reactivity? Use `${state}`.
-   Cache or memoize expensive computations you call from template functions.
-   Favor enums over wide string unions for shared statuses.

### More examples

-   Reactive attributes and styles:

```ts
const [gap] = state(12)
html`<div style="--gap:${() => `${gap()}px`}; margin: ${gap}px">
    Box
</div>`
```

-   Conditional content without ternaries:

```ts
html`${when(oneOf(status, ['loading', 'creating']), 'Working…', 'Idle')}`
```

-   Derived lists stay reactive:

```ts
const groups = () => Object.groupBy(items(), (o) => o.group ?? 'Ungrouped')
html`${repeat(groups, ([g, opts]) => html`<section>${when(g, g)}</section>`)}`
```

-   State store pattern:

```ts
const [todos, setTodos] = state([])
const [loading, setLoading] = state('idle' as 'idle' | 'loading' | 'error')

export const refresh = async () => {
    setLoading('loading')
    try {
        const list = await api.list()
        setTodos(list)
        setLoading('idle')
    } catch {
        setLoading('error')
    }
}
```

-   Render once vs reactively:

```ts
html`${count()}` // render once
html`${count}` // stays reactive to count changes
```

## Resources

-   Documentation site: https://markup.beforesemicolon.com/documentation/
-   Code entrypoints: `src/index.ts`, `src/html.ts`, `src/state.ts`, `src/helpers/`

Happy building with Markup! Keep templates declarative, lean on the helpers, and let functions drive reactivity.
