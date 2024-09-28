---
title: Markup by Before Semicolon
description: Reactive HTML Templating System to create Web User Interfaces.
layout: landing
---

# Markup by Before Semicolon

Markup is a reactive HTML Templating System to create Web User Interfaces.

```js
const [count, updateCount] = state(0)

const heading = 'Hello World'
const handleClick = () => {
    updateCount((prev) => prev + 1)
}

const App = html`
    <h1>Hello World</h1>
    <button type="button" onclick="${handleClick}">${count}</button>
`

App.render(document.body)
```

Markup is a lightweight, simple solution that makes working with DOM a
reactive experience for those who usually enjoy a vanilla way of build UI
and don't want to adopt a major framework.

## Functional and Simple

The only API you need to build anything is the `html` tagged template literal and functions to create anything you want. On top of that, Markup exposes `state` and `effect` that simplifies how you work with data.
