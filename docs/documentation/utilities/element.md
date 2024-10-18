---
name: Element
order: 6.1
title: Element Utility - Markup by Before Semicolon
description: How Markup by Before Semicolon allows you to easily create DOM elements
layout: document
---

## Element Utility

```typescript
interface ElementOptions<A> {
    attributes?: A
    textContent?: string
    htmlContent?: string
    ns?: 'http://www.w3.org/1999/xhtml' | 'http://www.w3.org/2000/svg'
}

type element = <A>(tagName: string, options?: ElementOptions<A>) => Element
```

The `element` attribute is simply a function that allows you to create DOM elements in one call.

Normally, when working with DOM elements we create and piece them together after.

```javascript
const button = document.createElement('button')
button.type = 'button'
button.textContent = 'click me'

button.addEventListener('click', () => {
    console.log('clicked')
})
```

This is a lot of steps to create a simple button. Here is the same thing using `element`:

```javascript
const button = element('button', {
    textContent: 'click me',
    attributes: {
        type: 'button',
        onclick: () => {
            console.log('clicked')
        },
    },
})
```

The `element` uses `addEventListener` behind the scenes and handles non-primitive values for you by easily detecting web component elements.

### Web components

The best part of working with `element` is with web components. It will handle all non-primitive props to ensure the web components get data as they should.

```javascript
const item = element('todo-item', {
    attributes: {
        data: {
            id: crypto.randomUUID(),
            name: 'buy groceries',
            status: 'pending',
            dateCreated: new Date(),
        },
    },
})
```

### SVG elements

To create SVG elements you can specify the `ns` option with the value of `http://www.w3.org/2000/svg` and that will give you any SVG element.

```javascript
const rect = element('rect', {
    ns: 'http://www.w3.org/2000/svg',
    attributes: {
        x: 10,
        y: 10,
        width: 100,
        height: 100,
    },
})
```
