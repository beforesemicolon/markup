---
name: Suspense
order: 7.2
title: Suspense Utility - Markup by Before Semicolon
description: How to lazy render content asynchronously in Markup by Before Semicolon
layout: document
---

## Suspense Utility

The `suspense` utility allows you to lazy render content by using the [replace](../templating/index.md#replace) method in the template instances while allowing you to handle the loading and error state.

```javascript
const loadTodos = async () => {
    const res = await fetch('/api/todos')

    if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`)
    }

    const { result } = await res.json()

    return result.map((item) => html`<li>${item.name}</li>`)
}

html`<ul>
    ${suspense(loadTodos)}
</ul>`.render(document.body)
```

### Loading state

You can pass a custom loading content to render while the asynchronous work is being performed. The `suspense` has a default loading indicator that might not be what you want.

```javascript
html`<ul>
    ${suspense(loadTodos, html`<loading-spinner></loading-spinner>`)}
</ul>`.render(document.body)
```

### Error state

You can also provide a function as third argument to handle how you want to display any errors. The `suspense` has a default way that might not be what you want.

```javascript
html`<ul>
    ${suspense(
        loadTodos,
        html`<loading-spinner></loading-spinner>`,
        (error) => html`<error-display error="${error}"></error-display>`
    )}
</ul>`.render(document.body)
```
