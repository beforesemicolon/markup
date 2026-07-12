---
name: Markup
order: 0
title: Markup by Before Semicolon
description: Markup is an under-8KB gzip reactive HTML templating system for building web-standard JavaScript user interfaces with state, effects, components, and no build step.
layout: landing
---

::: layout landing-hero version=v1.18.3 title="Reactive DOM." title2="Zero build." primaryLabel="Get Started" secondaryLabel="npm i @beforesemicolon/markup"

=== copy

A tiny, web-standards-first templating system that brings reactivity, state, and components to vanilla JavaScript. **No bundlers. No JSX. No magic.**

=== stat

## 7.6KB

CDN gzip

=== stat

## 0

third-party deps

=== stat

## 100%

web standards

=== code filename=counter.js lang=javascript

```text
import { html, state, effect } from '@beforesemicolon/markup';

const [count, updateCount] = state(0);

const doubleCount = () => count() * 2;

effect(() => {
    console.log(count())
})

const countUp = () => updateCount(prev => prev + 1);
const countDown = () => updateCount(prev => prev - 1);

const App = html`
  <h1>Conunter</h1>
  <p><strong>Current count</strong>: ${count}</p>
  <p><strong>Double count</strong>: ${doubleCount}</p>
  <button type="button" onclick="${countDown}">-</button>
  <button type="button" onclick="${countUp}">+</button>
`;

App.render(document.getElementById('app'));
```

:::

::: layout landing-ecosystem

=== header

`// the ecosystem`

## Extend the way you build.

Use Markup on its own for reactive templates, or add focused companion packages when your app needs custom elements, routing, or localization.

=== product title="Web Components" package=@beforesemicolon/web-component color=orange icon=webComponents href=https://web-component.beforesemicolon.com/

A reactive layer over the native Web Components API. Keep Markup's template model while adding props, state, lifecycles, and scoped styles.

=== product title=Router package=@beforesemicolon/router color=cyan icon=router href=https://router.beforesemicolon.com/

Declarative routing as web component tags. Compose pages, nested layouts, query routes, and lazy-loaded views without adopting a framework router.

=== product title=Intl package=@beforesemicolon/intl color=primary icon=reactive href=https://intl.beforesemicolon.com/

Localization for component-first interfaces. Add locale scopes, translated messages, and formatter helpers that fit naturally into Markup-driven UI.

:::

::: layout landing-features

=== header

`// why markup`

## The platform is the framework.

Web Standards, Web APIs, and modern JavaScript are all you need. Markup just adds the reactivity.

=== feature icon=reactive

### Reactive

Template literals and functions create reactive DOM with state, lifecycles, and side-effects.

=== feature icon=tiny

### Tiny - under 8KB gzip

The CDN browser build transfers at about 7.6KB gzip. Ship enterprise apps without a megabyte of framework.

=== feature icon=standards

### Web Standards

Three simple APIs that extend the platform you already know. No proprietary abstractions.

=== feature icon=plug

### Plug & Play

Drop in a script tag and go. No build step, no JSX, no configuration files.

=== feature icon=webComponents

### Web Components

Supercharge native Web Components with reactivity. Skip manual DOM manipulation.

=== feature icon=surgical

### Surgical Updates

Data-driven rendering means the DOM updates only where and when it actually needs to.

:::

::: layout landing-showcase

=== header

`// see it in action`

## Looks like HTML. Feels like magic.

Reactive state, component composition, and lifecycle &mdash; all from the JavaScript primitives you already know.

=== example label="Todos + localStorage" color=orange filename=todos.js lang=javascript

```javascript
import { html, state, effect, repeat } from '@beforesemicolon/markup'

const [todos, setTodos] = state(
    JSON.parse(localStorage.getItem('todos') ?? '[]')
)

effect(() => {
    localStorage.setItem('todos', JSON.stringify(todos()))
})

const addTodo = () => {
    const text = window.prompt('What needs doing?')?.trim()

    if (text) setTodos((prev) => [...prev, { text, done: false }])
}

const toggle = (i) =>
    setTodos(todos().map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)))

html`
    <button type="button" onclick="${addTodo}">Add</button>
    <ul>
        ${repeat(
            todos,
            (todo, i) => html`
                <li
                    class="${todo.done ? 'done' : ''}"
                    onclick="${() => toggle(i)}"
                >
                    ${todo.text}
                </li>
            `
        )}
    </ul>
`.render(document.querySelector('#app'))
```

=== example label="Button component using WebComponent" color=cyan filename=button-component.js lang=javascript

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'
import stylesheet from './button.css' with { type: 'css' }

class Button extends WebComponent {
    static observedAttributes = ['disabled', 'type']

    type = 'button'
    disabled = false

    stylesheet = stylesheet

    handleClick = (evt) => {
        evt.stopPropagation()
        this.dispatch('click')
    }

    render = () => {
        return html`
            <button ${this.props} class="btn" onclick="${this.handleClick}">
                <slot></slot>
            </button>
        `
    }
}

customElements.define('bfs-button', Button)
```

=== example label="Suspense (async)" color=orange filename=profile.js lang=javascript

```javascript
import { html, suspense } from '@beforesemicolon/markup'

const loadUser = async () => {
    const res = await fetch('/api/me')
    return res.json()
}

const renderUser = async () => {
    const user = await loadUser()
    return html`
        <article>
            <h2>${user.name}</h2>
            <p>${user.bio}</p>
        </article>
    `
}

html`
    <h1>Profile</h1>

    ${suspense(
        renderUser,
        html`<p>Loading profile...</p>`, // fallback
        (err) => html`<p>Failed: ${err.message}</p>` // catch
    )}
`.render(document.querySelector('#app'))
```

=== example label="Page routing" color=cyan filename=app.html lang=html

```html
<!-- in <head>:
<script src="https://unpkg.com/@beforesemicolon/router/dist/client.js"></script>
-->

<nav>
    <page-link path="/">Home</page-link>
    <page-link path="/about">About</page-link>
    <page-link path="/users">Users</page-link>
</nav>

<page-route path="/">
    <h1>Welcome home</h1>
</page-route>

<page-route path="/about" src="./pages/about.js"></page-route>

<page-route path="/users" exact="false">
    <page-route src="./pages/users.js"></page-route>
    <page-route path="/:userId" src="./pages/user.js"></page-route>
</page-route>

<page-route path="/404"> 404 - Page not found! </page-route>

<page-redirect path="/404" title="404 - Page not found!"></page-redirect>
```

=== example label="Template lifecycles" color=orange filename=timer.js lang=javascript

```javascript
import { html, state } from '@beforesemicolon/markup'

const [seconds, setSeconds] = state(0)

html` <p>Elapsed: ${seconds}s</p> `
    .onMount(() => {
        // runs once when attached to the DOM
        const id = setInterval(() => setSeconds(seconds() + 1), 1000)
        return () => clearInterval(id)
    })
    .onUpdate(() => {
        // runs every time a tracked value changes
        console.log('tick', seconds())
    })
    .render(document.querySelector('#app'))
```

:::

::: layout landing-install

=== header

`// quick start`

## Install in seconds.

Pick your weapon. Markup works everywhere JavaScript runs.

=== tab key=cdn label=CDN command="<script src=&quot;https://unpkg.com/@beforesemicolon/markup/dist/client.js&quot;></script>"

=== tab key=npm label=npm command="npm install @beforesemicolon/markup"

=== tab key=yarn label=yarn command="yarn add @beforesemicolon/markup"

=== tab key=pnpm label=pnpm command="pnpm add @beforesemicolon/markup"

:::

::: layout landing-cta title="Build the Web," title2="your way."

=== copy

Join developers shipping faster with a framework that respects the platform - and your time.

:::
