---
name: Guide & Best Practices
order: 5
title: Markup Guide and Best Practices - JavaScript Reactive UI
description: Comprehensive Markup guide covering installation, html templates, state, effects, utilities, WebComponent integration, Router patterns, and best practices.
layout: document
---

# Guide & Best Practices

This guide outlines core conventions, code design patterns, and common refactoring workflows for writing declarative, clean, and high-performance reactive applications with `@beforesemicolon/markup`.

---

## Core Rules

1.  **Prefer Declarative Helpers Over Branching**: Avoid writing inline JavaScript ternary operations or imperative functions inside template HTML strings. Always favor built-in Markup helpers (`when`, `repeat`, `pick`, `is`, etc.).
2.  **Keep Side Effects Out of Render Functions**: Keep template rendering strictly side-effect-free. Side effects should live inside `effect()` blocks or Web Component lifecycle hooks (such as `onMount`).
3.  **State Immutability**: Do not mutate objects used as canonical state directly. Track derived/pending changes separately and merge them only at render time.
4.  **Preserve Source Collections**: Keep source arrays intact when deriving filtered or sorted views. Clearing a filter or search input should restore the full source list without requiring manual data resets.
5.  **Reactive Value Binding**: Bind props and state directly (e.g. `disabled="${isDisabled}"` instead of `disabled="${isDisabled()}"`) to let Markup set up listeners surgically.

---

## Refactor Workflows

Here is how you can migrate traditional imperative habits into clean, declarative Markup code.

### 1. Conditional UI (if/else)

Avoid writing inline JavaScript conditions or logic gates inside templates.

**Imperative/Avoid:**

```javascript
html`
    <div>
        ${() => (isLoading() ? html`<p>Loading...</p>` : html`<p>Loaded!</p>`)}
    </div>
`
```

**Declarative/Prefer:**

```javascript
html`
    <div>${when(isLoading, html`<p>Loading...</p>`, html`<p>Loaded!</p>`)}</div>
`
```

You can use ternary directly if you intend to render once and or dont expect the data update:

```javascript
html` <div>${isLoading ? html`<p>Loading...</p>` : html`<p>Loaded!</p>`}</div> `
```

### 2. Rendering Lists

Avoid using `.map()` inside templates to generate dynamic list nodes. Using `.map()` destroys and rebuilds nodes on every update, whereas `repeat()` uses surgical memoization under the hood.

**Imperative/Avoid:**

```javascript
html`
    <ul>
        ${() => items().map((item) => html`<li>${item.name}</li>`)}
    </ul>
`
```

**Declarative/Prefer:**

```javascript
html`
    <ul>
        ${repeat(items, (item) => html`<li>${item.name}</li>`)}
    </ul>
`
```

You can use the `map` directly if you intend to render once and or dont expect updates:

```javascript
html`
    <ul>
        ${list.map((item) => html`<li>${item.name}</li>`)}
    </ul>
`
```

### 3. Nested Optional Reads

Avoid using nested optional chaining (`?.`) directly inside UI interpolations. This can lead to runtime errors if parts of the chain become undefined or unresolved.

**Imperative/Avoid:**

```javascript
html`
    <div>
        <h2>${() => user()?.profile?.details?.name || 'Guest'}</h2>
    </div>
`
```

**Declarative/Prefer:**

```javascript
html`
    <div>
        <h2>
            ${pick(user, 'profile.details.name', (name) => name || 'Guest')}
        </h2>
    </div>
`
```

The pick option allows you to define fallbacks or handle the value for formatting and or additional processing.

```javascript
const over18 = (age) => (age > 18 ? 'Over 18' : 'Under 18')

html`
    <div>
        <h2>${pick(user, 'profile.details.age', over18)}</h2>
    </div>
`
```

### 4. Boolean Expression Composition

Avoid writing custom functions that just combine multiple states with `&&` or `||`. Compose them using Markup boolean combinators.

**Imperative/Avoid:**

```javascript
const canPublish = () => !isSaving() && hasChanges() && hasPermission()

html` <button disabled="${() => !canPublish()}">Publish</button> `
```

**Declarative/Prefer:**

```javascript
const canPublish = and(isNot(isSaving), is(hasChanges), is(hasPermission))

html` <button disabled="${isNot(canPublish)}">Publish</button> `
```

Markup invites function compososition and working with stateful functions. You should look more into [how to create custom helpers](/documentation/utilities/#custom-utility) to understand more.

---

## Canonical Patterns

### Stateful Search & Filter Listing

This is the standard pattern for rendering collections with dynamic filtering. The source state (`items`) remains completely immutable.

```typescript
import { html, state, when, repeat, is, pick } from '@beforesemicolon/markup'

const [query, setQuery] = state('')
const [items] = state<Project[]>([])

// Derive filtered list reactively
const filtered = () =>
    items().filter((p) => p.name.toLowerCase().includes(query().toLowerCase()))

const handleInput = (event: Event) => {
    setQuery((event.target as HTMLInputElement).value)
}

const View = html`
    <input value="${query}" oninput="${handleInput}" />
    <ul>
        ${repeat(
            filtered,
            (item) => html`<li>${item.name}</li>`,
            () => html`<p>No results found.</p>`
        )}
    </ul>
`
```

This allows state to remain immutable and you to create derived states that you use for rendering that combines different states to resolve to a desired one.

### Async Slots (Suspense)

Use `suspense` to render async UI cleanly with error and fallback(while loading) rendering handlers:

```typescript
import { html, suspense } from '@beforesemicolon/markup'

const resource = async () => {
    const res = await fetch('/api/data')

    const data = await res.json()

    return html`<p>Resolved: ${data.message}</p>`
}

const ResourceView = html`
    ${suspense(
        resource,
        html`<p>Loading resource...</p>`,
        (err) => html`<p class="error">Error: ${err.message}</p>`
    )}
`
```

### More Common Patterns

Here are more typical recipes you can copy-paste for common UI requirements:

#### Membership Checks & Option Swapping

```typescript
import { html, state, when, oneOf } from '@beforesemicolon/markup'

const [mode, setMode] = state<'view' | 'edit' | 'preview'>('view')

const View = html`
    ${when(
        oneOf(mode, ['edit', 'preview']),
        html`<button onclick="${() => setMode('view')}">Done</button>`,
        html`<button onclick="${() => setMode('edit')}">Edit</button>`
    )}
`
```

#### Reactive CSS Variables & Styles

```typescript
import { html, state } from '@beforesemicolon/markup'

const [gap] = state(12)

// Reactive style bindings cleared and updated dynamically
const Box = html`
    <div style="--gap: ${() => `${gap()}px`}; margin: ${gap}px">
        Spacing Gap: ${gap}px
    </div>
`
```

#### Nested Value Rendering

```typescript
import { html, state, pick } from '@beforesemicolon/markup'

const [currentEntity] = state({ details: { author: { name: 'Ada Lovelace' } } })

// Safe nested navigation via pick
const AuthorHeader = html`
    <h1>Written by: ${pick(currentEntity, 'details.author.name')}</h1>
`
```

#### Shared State Store

```typescript
import { state } from '@beforesemicolon/markup'

export const [todos, setTodos] = state<Todo[]>([])
export const [loadingState, setLoadingState] = state<
    'idle' | 'loading' | 'error'
>('idle')

export const fetchTodos = async () => {
    setLoadingState('loading')
    try {
        const response = await fetch('/api/todos')
        const list = await response.json()
        setTodos(list)
        setLoadingState('idle')
    } catch {
        setLoadingState('error')
    }
}
```

---

## Conventions & Guardrails

-   **Pass Getters/Functions directly**: Do not execute getters inside template attributes when subscription/reactivity is intended. Pass `disabled="${isDisabled}"`, not `disabled="${isDisabled()}"`.
-   **Clean Event Bindings**: Do not wrap callbacks in redundant closures unless passing arguments:
    -   _Good_: `<button onclick="${logout}">Logout</button>`
    -   _Good_: `<button onclick="${() => handleSelect(item)}">Select</button>`
    -   _Avoid_: `<button onclick="${() => logout()}">Logout</button>`
-   **Direct Property Bindings**: Do not pre-normalize simple template attributes in setup/getters just to render them. Markup handles `undefined`, empty, and falsy attribute values correctly.
-   **Boolean Attributes**: Markup core automatically unwraps and evaluates boolean states. Do not add `Boolean(val(this.props.someBoolean()))`-style wrappers; bind properties directly.
-   **Static vs. Reactive**: If a value is static (never changes after initialization), render its evaluated state: `html`<p>${state()}</p>`. If it is reactive and should dynamically update, bind the getter: `html`<p>${state}</p>`.
