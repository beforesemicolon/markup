---
name: OneOf, And & Or
order: 6.6
title: OneOf, And & Or Utility - Markup by Before Semicolon
description: How to quickly check state truthy or falsy with Markup by Before Semicolon
layout: document
---

## OneOf, And & Or Utilities

Markup comes with additional utilities that work as operators and allows you to check a value from a bunch. This comes in form of `and`, `or`, and `oneOf` utilities.

### oneOf

The `oneOf` works like the [is and isNot](./is-&-isnot.md) utilities but instead of checking a one value, it checks many.

```javascript
const [status, setStatus] = state('pending')

html`${when(
    oneOf(status, ['pending', 'idle']),
    html`<p>loading...</p>`,
    html`<p>done</p>`
)}`
```

It takes the value/state you want to check and an array of values to check against. The utility simply checks the value exactly.

### and

The `and` utility works like the `&&` ([Logical AND](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND)). It will return `true` only if all values are [TRUTHY](https://developer.mozilla.org/en-US/docs/Glossary/Truthy).

```javascript
html`${when(
    and(loadingTodos, noTodos),
    html`<p>loading...</p>`,
    html`<p>done</p>`
)}`
```

You can list any amount of values for the check:

`and(value1, value2, ..., valueN)`

### or

The `or` utility works like the `||` ([Logical OR](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR)). It will return `true` only if at least one of the values are [TRUTHY](https://developer.mozilla.org/en-US/docs/Glossary/Truthy).

```javascript
html`${when(
    or(loadingTodos, noTodos),
    html`<p>loading...</p>`,
    html`<p>done</p>`
)}`
```

You can list any amount of values for the check:

`or(value1, value2, ..., valueN)`
