# Markup

Reactive HTML Templating System

[![Static Badge](https://img.shields.io/badge/docs-markup.beforesemicolon.com-blue)](https://markup.beforesemicolon.com)
[![npm](https://img.shields.io/npm/v/%40beforesemicolon%2Fmarkup)](https://www.npmjs.com/package/@beforesemicolon/markup)
![npm](https://img.shields.io/npm/l/%40beforesemicolon%2Fmarkup)
[![Test](https://github.com/beforesemicolon/html/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/beforesemicolon/html/actions/workflows/test.yml)

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

Literally everything else is how you know it to be in plain HTML, CSS and JavaScript.

We believe in a simple way to build the web without the jargon of a framework, complex project setups, new syntax, all to spit out HTML, CSS and JavaScript at the end.

#### Examples

This is a simple example of a button, but you can check:

-   [A Modular Todo App](https://stackblitz.com/edit/web-platform-lvonxr?file=app.js)
-   [A Simple Counter App](https://stackblitz.com/edit/web-platform-adqrrf?file=app.js)
-   [A Simple Time App](https://stackblitz.com/edit/web-platform-bwoxex?file=button.js)

## Install

```
npm install @beforesemicolon/markup
```

or

```
yarn add @beforesemicolon/markup
```

## Use directly in the Browser

This library requires no build or parsing. The CDN package is one digit killobyte in size, tiny!

```html
<!doctype html>
<html lang="en">
    <head>
        <!-- Grab the latest version -->
        <script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js"></script>

        <!-- Or a specific version -->
        <script src="https://unpkg.com/@beforesemicolon/markup@0.3.0/dist/client.js"></script>
    </head>
</html>
```

### Usage

```html
<div id="app"></div>

<script>
    const { html, state, effect } = BFS.MARKUP

    html`<h1>Hello World</h1>`.render(document.getElementById('app'))
</script>
```
