---
name: Markup
path: /
title: Markup by Before Semicolon
description: Reactive HTML Templating System to create Web User Interfaces.
layout: landing
---

<div role="banner" class="banner">

## Reactive Templating System

A simple and lightweight solution to create stateful Web User Interfaces.

--|.actions
[Documentation]() [Get Started]()
--$

</div>

```javascript
const [count, updateCount] = state(0)

effect(() => {
    if(count() > 10) {
        alert('Count exceeded max of 10')
    }
})

const heading = 'Hello World';

const handleClick = () => {
    updateCount((prev) => prev + 1)
}

const App = html`
    <h1>${heading}</h1>
    <button type="button" onclick="${handleClick}">${count}</button>
`

App.render(document.body)
```

<section class="why">

## Why Markup?

### It is Simple!

Markup comes with a low learning curve. Its pretty much HTML, CSS and JavaScript as you know with the addition of three APIs: `html`, `state`, and `effect`

- **html**
    The `html` API allows you to define the template of what you want to render. It also offers methods you can use to [render]() in many ways, subscribe to the different [lyfecycle](), and tap into the [nodes]() of the template. [Learn more]();
- **state**
    The `state` API allows you to easily define a reactive data you want to use in the template or to perform side effects on. It can be used independent from `html` like a [state stores](), data subscription, and as content. [Learn more]();
- **effect**
    The `effect` API is tied to `state` and all it does it allow you to perform side effects on the states the callback you provide consumes. It is self-manageable and reacts to things just the the template. [Learn more]();

### Small and Powerful!

With just 8kb compressed, and 80kb uncompressed its incredible how much it allows you to do. You can confidently ship it to the client allowing you to make that vanilla JavaScript project reactive and efficient.

Markup enhances the DOM by offering reactivity. Working with Web Components becomes a breeze as it handles all state and templating needed so you don't have to do DOM manipulations and tracks data and events.

Its a perfect option for quick prototyping, and experiments as it requires no setup to be used. Its plug and play!

Make no mistake, Markup can scale with your project allowing you to build complex and modular web applications that are efficient, lightweight and easy to maintain. On top of that, you can choose to render everything on the server and ship your static content to the browser. Its a no brainer.

</section>
