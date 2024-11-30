---
name: Lifecycles
order: 5.1
title: Template Lifecycles - Markup by Before Semicolon
description: How to react to template lifecycles in Markup by Before Semicolon
layout: document
---

## Lifecycles

Markup exposes few methods you can use to tap into the lifecycles of the template:

-   `onMount`: method that takes a function to call when the template is mounted that can return another function to be called when the template is unmounted;
-   `onUpdate`: method that takes a function to call when something in the rendered template changes;
-   `onMove`: method that takes a function to call when the template content is moved from one location to another in the DOM.

### onMount

The `onMount` method takes a function to be called when the template is rendered via any of the [render methods](./index.md#rendering). This function can return another function to be called when the template gets unmounted.

```javascript
const temp = html`<h1>Hello World</h1>`

temp.onMount(() => {
    // handle mount
    console.log('mounted')

    return () => {
        // handle unmount
        console.log('unmounted')
    }
})

temp.render(document.body) // triggers mount

temp.unmount() // trigger unmount
```

The unmount event can be triggered by calling the `unmount` or when the template was removed part of some change in the parent template.

These livecycles are perfect for setups and cleanups around the template. These are things like working with timers or other event driven actions that stay in the background.

```javascript
const [count, setCount] = state(0)

const temp = html`<p>${count}</p>`

temp.onMount(() => {
    let interval = setInterval(() => {
        setCount((prev) => prev + 1)
    }, 1000)

    return () => {
        clearInterval(interval)
    }
})

temp.render(document.body)

setTimeout(() => {
    temp.unmount()
}, 10000)
```

### onUpdate

The `onUpdate` method takes a function to be called whenever something in the template changes. This could attribute or node added, removed, or updated.

```javascript
const [count, updateCount] = state(0)

const temp = html`<p>${count}</p>`

temp.onUpdate(() => {
    console.log(temp.toString())
    // prints: "<p>10</p>"
})

temp.render(document.body)

updateCount(10)
```

If you want to react to a specific state change, you can use the [effect](../state/effect.md). The `onUpdate` is perfect for when you want to take snapshots of the template or perform generic template related side effects.

### onMove

The `onMove` method takes a function to be called whenever the template render target changes.

```javascript
const temp = html`<h1>Hello World</h1>`

temp.onMove(() => {
    console.log('moved to', temp.parentNode)
})

temp.render(document.body)

setTimeout(() => {
    temp.render(document.getElementById('app'))
}, 1000)
```

This livecycle is perfect to perform action dependent on the template location. These can be things like DOM reordering or when working with drag and drop.

### Chaining

All template livecycles and [render methods](./index.md#rendering) can be chained and you should always set the livecycles before rendering anything.

```javascript
const [count, updateCount] = state(0)

const temp = html`<p>${count}</p>`
    .onMount(() => {
        console.log('mounted')

        return () => {
            console.log('unmounted')
        }
    })
    .onUpdate(() => {
        console.log('udpated', temp.toString())
    })
    .onMove(() => {
        updateCount(10)
        console.log('moved', temp.parentNode)
    })
    .render(document.body)

setTimeout(() => {
    temp.render(document.getElementById('app'))
}, 1000)

setTimeout(() => {
    temp.unmount()
}, 2000)
```
