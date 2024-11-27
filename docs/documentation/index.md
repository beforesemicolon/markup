---
name: What is Markup?
order: 1
path: /documentation
title: Documents - Markup by Before Semicolon
description: What is Markup?
layout: document
---

## What is Markup?

Markup is a JavaScript reactive templating system built to simplify how you build Web user interfaces using web standards with minimal enhancements to the native web APIs as possible.

It consists of 3 main APIs with additional utilities to simplify things even further:

-   `html`: A JavaScript tagged function that allows you to represent the DOM using template literal string;
-   `state`: A simple state tracking API that allows you to define reactive data as you wish;
-   `effect`: A straight forward way to define things that need to happen when certain states change;

### Motivation

JavaScript, Web Standards and APIs give you everything you need to build any web project you want. What is often painful to deal with is the DOM and reactivity, especially as the project gets bigger or require multiple people collaboration.

Markup was created to give you all the reactivity you need while making it simple to define your HTML in JavaScript without introducing a new syntax, or requiring a build, or a big library you need to ship to the client.

From this:

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

To this:

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

### How does it work?

Markup uses [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) and [Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) to do everything.

-   **Functions**: JavaScript functions are perfect for lazy evaluations which makes it perfect for reactivity. Markup uses functions everywhere, from internals, defining state, effects, utilities, etc.
-   **Template Literals**: The template literal is used to represent HTML in JavaScript and to avoid to reinvent the wheel. Everything else is enforced by web standards.

Literally everything else is you know it to be in plain HTML, CSS and JavaScript.

We believe in a simple way to build the web without the jargon of a framework, complex project setups, new syntax, all to spit out HTML, CSS and JavaScript at the end.

### Why Markup?

Markup focus on being intuitive by relying on whats familiar; on being small so you can confidently ship it to the client; and on enhancing the web by doing things well and in performant way.

This philosophy can be further broken down into six points:

-   **Reactive**
    Markup uses JavaScript [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) and [Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) to allow you to create reactive DOM with state management, render lifecycles, side effects control, and more.
-   **Small**
    Markup allows you to do a lot with **9Kb compressed** code (**_18Kb umcompressed_**). From prototyping to enterprise web applications, ship it with confidence!
-   **Simple**
    Markup is **[based on Web Standards](https://www.w3.org/standards/)** and exposes 3 simple APIs you can use to enhance Web Components APIs, working with DOM, and building any Web User Interface.
-   **Plug & Play**
    Markup requires no build and no parsing. You can simply add it to your project and start using it. It is just an extension of the familiar _HTML + CSS + JavaScript_ we love.
-   **Web Component**
    Markup enhances Web Component APIs with reactivity and by eliminating the need to perform DOM manipulations when creating components for your projects.
-   **Performance**
    Markup is data driven and handles everything behind the scenes which allows the DOM to only be updated when and where it is necessary.
