---
name: When
order: 7.3
title: When Utility - Markup by Before Semicolon
description: How to conditionally render content in Markup by Before Semicolon
layout: document
---

## When Utility

The `when` helper is Markup out of the box utility to do conditional rendering in or outside templates.

It mimics an if-and-else statement with the else being conditional.

```javascript
const visible = true

html` <p>${when(visible, `visible`, `hidden`)}</p> `
```

### Condition

The condition is the first argument and it can be a static value or a function for something that will change like a [StateGetter](../state/index.md#stategetter).

```javascript
const [visible, updateVisible] = state(true)

html` ${when(visible, html`<p>visible</p>`, html`<p>hidden</p>`)} `
```

The `when` helper will re-evaluate whenever the condition changes for an accurate render.

### Then & else

The second argument is required and represent the "then" value while the third argument is optional since it represent the "else" body.

```javascript
const [visible, updateVisible] = state(true)

html`${when(visible, html`<p>visible</p>`)}`
```
