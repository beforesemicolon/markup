---
name: References
order: 4.4
title: Template References - Markup by Before Semicolon
description: How to grab reference of the DOM element in Markup by Before Semicolon
layout: document
---

## Ref

Markup templates will handle all DOM elements for you but if you really need to access the element rendered by the templates, you can use the `ref` attribute to profide a handle key that you can then use to grab the elements.

```javascript
html`<button ref="btn">click me</button>`
```

### Multiple references

The `ref` attribute always collect multiple elements therefore, you can use the same key to grab multiple items at once.

```javascript
html`
    <li ref="item">item 1</li>
    <li ref="item">item 2</li>
    <li ref="item">item 3</li>
`
```

### Access references

To access these elements, you can read the `refs` property in the template instance.

```javascript
const temp = html`
    <li ref="item">item 1</li>
    <li ref="item">item 2</li>
    <li ref="item">item 3</li>
`.render(document.body)

console.log(
    temp.refs['item'] // (3) [li, li, li]
)
```

### Nested references

You can access any reference via the template instance including its child templates.

```javascript
const items = [
    html`<li ref="item">Buy groceries</li>`,
    html`<li ref="item">Go to gym</li>`,
    html`<li ref="item">Write a blog</li>`,
]

const temp = html`
    <ul ref="list">
        ${items}
    </ul>
`.render(document.body)

console.log(
    temp.refs // {item: Array(3), list: Array(1)}
)
```

This capability allows you to focus on your top template and work everything from there. This does not mean you cannot access the references at each individual template level. Its just more convenient.

### Dynamic references

All references are dynamic and this means that as things render or unmount from the template, the reference are added or removed.

```javascript
const items = [
    html`<li ref="item">Buy groceries</li>`,
    html`<li ref="item">Go to gym</li>`,
    html`<li ref="item">Write a blog</li>`,
]

const temp = html`
    <ul ref="list">
        ${items}
    </ul>
`.render(document.body)

console.log(
    temp.refs // {item: Array(3), list: Array(1)}
)

items[0].unmount()
items[2].unmount()

console.log(
    temp.refs // {item: Array(1), list: Array(1)}
)
```

For this reason, you should always check for the reference being there before doing anything.
