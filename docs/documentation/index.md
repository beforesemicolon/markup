---
name: What is Markup?
order: 1
path: /documentation
title: Markup Documentation - Reactive HTML Templating for JavaScript
description: Learn what Markup is, why it exists, and how it uses JavaScript template literals, functions, and web standards to build reactive user interfaces.
layout: document
---

## What is Markup?

Markup is a JavaScript reactive templating system built to simplify how you build Web user interfaces using web standards with minimal enhancements to the native web APIs as possible.

It consists of 3 main APIs with additional utilities to simplify things even further:

-   `html` A JavaScript tagged function that allows you to represent the DOM using template literal strings.
-   `state` A simple state tracking API that lets you define reactive data however you want.
-   `effect` A straightforward way to define things that need to happen when certain states change.

### Why do we need another tool?

Modern web development has become heavily reliant on complex build steps, compiler configuration, and massive framework dependencies. Often, all you want to do is build a reactive interface, but you end up having to set up Vite, Babel, Webpack, Svelte, or React just to get basic state reactivity.

Markup exists to solve this pain point. It bridges the gap between raw, tedious DOM manipulation and heavy component frameworks. By utilizing modern JavaScript primitives—specifically **template literals** and **functions**—Markup provides clean, declarative, and surgically precise reactivity **without any build steps**.

Compare how you build a simple counter.

#### The Tedious Vanilla Way

```javascript
let count = 0

// tedious DOM definition and manipulation
const p = document.createElement('p')
p.textContent = `count: ${count}`

const btn = document.createElement('button')
btn.type = 'button'
btn.textContent = 'count up'

// limiting event driven
btn.addEventListener('onclick', () => {
    count += 1
    p.textContent = `count: ${count}`

    if (count > 10) {
        alert('You counted passed 10!')
    }
})

document.body.append(p, btn)
```

#### The Markup Way (Simple & Reactive)

```javascript
// reactive data
const [count, updateCount] = state(0)

// data driven
effect(() => {
    if (count() > 10) {
        alert('You counted passed 10!')
    }
})

const countUp = () => {
    updateCount((prev) => prev + 1)
}

// reactive DOM/templates
html`
    <p>count: ${count}</p>
    <button type="button" onclick="${countUp}">count up</button>
`.render(document.body)
```

### Core Concepts

#### 1. Functions for Lazy Evaluation

Reactivity in Markup is powered by native JavaScript functions. Since functions represent lazy evaluations, they can be run whenever their underlying state changes. Wrapping your values or templates in functions is the secret behind Markup's surgical DOM updates.

#### 2. Tagged Template Literals

Markup uses the standard `html` tagged template literal to represent the DOM. No JSX parser, no proprietary template syntax, and no Virtual DOM. What you write is parsed directly into native HTML templates and updated surgically.

### Key Benefits

-   🚀 **Zero Build Step**: No compilers, no bundlers, no npm install required to get started. Drop the CDN link into a `<script>` tag and start coding.
-   ⚡ **Surgical DOM Updates**: No Virtual DOM diffing. Markup target-updates only the specific nodes and attributes that changed.
-   📦 **Ultra Lightweight**: At only **7.6KB gzip** (18KB uncompressed), it is perfect for micro-frontends, widgets, prototypes, and lightweight web apps.
-   🔌 **Standard Web Components**: Easily integrates with Web Components to provide reactive rendering and simplified lifecycle management.
