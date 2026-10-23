# Markup

Reactive HTML Templating System

[![Static Badge](https://img.shields.io/badge/Website-blue)](https://markup.beforesemicolon.com)
[![MD Docs](https://img.shields.io/badge/MD_docs-blue)](https://github.com/beforesemicolon/markup/blob/main/docs/index.md)
[![npm](https://img.shields.io/npm/v/%40beforesemicolon%2Fmarkup)](https://www.npmjs.com/package/@beforesemicolon/markup)
![npm](https://img.shields.io/npm/l/%40beforesemicolon%2Fmarkup)
[![Test](https://github.com/beforesemicolon/html/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/beforesemicolon/html/actions/workflows/test.yml)

Markup is a JavaScript reactive templating system built to simplify how you build Web user interfaces using web standards with minimal enhancements to the native web APIs as possible.

It consists of 3 main APIs with additional utilities to simplify things even further:

- `html`: A JavaScript tagged function that allows you to represent the DOM using a template literal string;
- `state`: A simple state tracking API that allows you to define reactive data as you wish;
- `effect`: A straight forward way to define things that need to happen when certain states change;

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

- **Functions**: JavaScript functions are perfect for lazy evaluations which makes it perfect for reactivity. Markup uses functions everywhere, from internals, defining state, effects, utilities, etc.
- **Template Literals**: The template literal is used to represent HTML in JavaScript and to avoid to reinvent the wheel. Everything else is enforced by web standards.

Literally everything else is how you know it to be in plain HTML, CSS and JavaScript.

We believe in a simple way to build the web without the jargon of a framework, complex project setups, new syntax, all to spit out HTML, CSS and JavaScript at the end.

#### Examples

This is a simple example of a button, but you can check:

- [A Modular Todo App](https://stackblitz.com/edit/web-platform-lvonxr?file=app.js)
- [A Simple Counter App](https://stackblitz.com/edit/web-platform-adqrrf?file=app.js)
- [A Simple Time App](https://stackblitz.com/edit/web-platform-bwoxex?file=button.js)

## Install

```
npm install @beforesemicolon/markup
```

or

```
yarn add @beforesemicolon/markup
```

## Use directly in the Browser

This library requires no build step. The CDN browser build is about 12.6 KB
gzip (36.8 KB uncompressed, measured from `dist/client.js`).

```html
<!-- Grab the latest version -->
<script src="https://unpkg.com/@beforesemicolon/markup/dist/client.js"></script>

<!-- Or a specific version -->
<script src="https://unpkg.com/@beforesemicolon/markup@0.3.0/dist/client.js"></script>
```

### Usage

```html
<div id="app"></div>

<script>
    const { html, state, effect } = BFS.MARKUP

    html`<h1>Hello World</h1>`.render(document.getElementById('app'))
</script>
```

Dynamic values belong in `html` interpolations. Markup applies those values
without parsing them as HTML:

```javascript
const message = '<strong>hello</strong>'
html`<p>${message}</p>` // renders the markup characters as text
```

When trusted or independently sanitized markup must be parsed deliberately,
use the explicit `unsafeHTML` API. Never pass user-controlled content to it:

```javascript
import { unsafeHTML } from '@beforesemicolon/markup'

const trustedIcon = unsafeHTML('<svg aria-hidden="true">...</svg>')
```

### Serialization and event safety

`toString()` escapes text at the template root as well as inside elements and
preserves HTML comments. It rejects content that could escape a script, style,
or other text container when the result is parsed again. For JSON data blocks,
escape every `<` after calling `JSON.stringify`:

```javascript
const json = JSON.stringify(data).replace(/</g, '\\u003c')
const output = html`<script type="application/json">
    ${json}
</script>`.toString()
```

Script and style interpolations still require trusted code; Markup does not
sanitize JavaScript or CSS. Boundary checks ignore tag-name casing and apply
across namespaces, including SVG/MathML nodes that may reparse as HTML. These
conservative checks also apply inside foreign-namespace wrappers. See the [SSR documentation](https://markup.beforesemicolon.com/documentation/capabilities/server-side-rendering)
for serialization restrictions and migration details.

Dynamic `on*` event bindings accept one function or `[function, options]`
interpolation, optionally surrounded by whitespace. String handlers and mixed
literal/interpolated event strings are rejected. Use `onclick="${handleClick}"`
instead of constructing inline JavaScript. Explicitly observed, non-native
custom-element properties such as `one` remain ordinary property bindings.
Templates can be constructed before the custom element is registered; define
the element before mounting so those properties can be recognized. Deferred
mixed event bindings are rejected before any binding is evaluated or written.

## AI and agent context

- [`llms.txt`](https://markup.beforesemicolon.com/llms.txt) is the concise,
  package-owned API contract and coding guide for AI tools.
- [`llms-full.txt`](https://markup.beforesemicolon.com/llms-full.txt) contains
  the complete resolved documentation and examples.

The source for the concise contract lives in [`docs/llms.txt`](docs/llms.txt),
so its behavior and recommendations are reviewed and versioned with Markup.

## Ecosystem

- [Web Component](https://web-component.beforesemicolon.com/) adds reactive
  native Custom Elements and re-exports Markup.
- [Router](https://router.beforesemicolon.com/) adds URL navigation, route
  elements, guards, and route data on top of Web Component.
- [Intl](https://intl.beforesemicolon.com/) adds locale scopes, messages, and
  internationalized formatting on top of Web Component.

Router and Intl are complementary and can be used together. Markup remains the
shared rendering and reactivity foundation across all packages.

## Community

- [Contributing guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [BSD 3-Clause License](LICENSE)
