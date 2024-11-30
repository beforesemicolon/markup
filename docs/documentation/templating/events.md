---
name: Events
order: 5.5
title: HTML Events - Markup by Before Semicolon
description: how to handle HTML events in Markup by Before Semicolon
layout: document
---

## Events

HTML allows you set inline event listeners using `on*` attributes. This is pretty much how you set event listeners on tags in Markup.

```javascript
const handleClick = (event) => {
    console.log(event)
}

html`<button onclick="${handleClick}">click me</button>`
```

The big difference with Markup is that these attributes are not rendered and behind the scenes Markup is using the [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) to set event listeners on your tags.

```javascript
html`<button onclick="${handleClick}">click me</button>`.render(document.body)

// renders: <button>click me</button>
```

This allows your HTML to have event listeners and be safe by not allowing unsafe inline event listeners attributes while still enjoying all the advantages of using `addEventListener` API.

### Event options

Because Markup is using `addEventListener` behind the scenes, it offers a special syntax that allows you to set options which is not possible with native HTML.

```javascript
const handleClick = (event) => {
    console.log(event)
}

html`<button onclick="${[handleClick, { once: true }]}">
    click me
</button>`.render(document.body)
```

By providing a tuple (array with two values), you can specify the handler and its options to be used when setting an event listener.

These options are just [addEventListener options](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options) that allows you to specify how the event should be handled including defining signals.

```javascript
const controller = new AbortController()
const signal = controller.signal

const handleClick = (event) => {
    controller.abort()
    console.log('clicked')
}

html`<button onclick="${[handleClick, { signal }]}">click me</button>`.render(
    document.body
)
```
