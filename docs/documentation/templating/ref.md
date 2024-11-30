---
name: References
order: 5.4
title: Template DOM References - Markup by Before Semicolon
description: How to grab reference of the DOM element in Markup by Before Semicolon
layout: document
---

## Ref

Markup templates will handle all DOM elements rendering for you but if you really need to access the element rendered by the templates, you can use the `ref` attribute to provide a handle key that you can then use to grab the elements.

```javascript
html`<button ref="btn">click me</button>`
```

### Multiple references

The `ref` attribute always return an array. Therefore, you can use the same key to grab multiple items at once.

```javascript
const temp = html`
    <li ref="item">item 1</li>
    <li ref="item">item 2</li>
    <li ref="item">item 3</li>
`.render(document.body)
```

References are not created until the template is rendered. This is because creating a template simply registers a template and its during the rendering phase that the elements are collected.

### Access references

To access these reference elements, you can read the `refs` property in the template instance.

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

The `refs` property returns an object literal with array of elements keyed by the value you provided in the `ref` attributes.

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

```javascript
items[0].refs['item'] // [li]
temp.refs['list'] // [ul]
temp.refs['item'] // [li, li, li]
```

### Dynamic references

All references are dynamic and this means that as things render or unmount from the template, reference are added or removed.

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

For this reason, you should always check for the reference being there before doing anything. This would be the indication whether the element is still rendered in the template or not.
