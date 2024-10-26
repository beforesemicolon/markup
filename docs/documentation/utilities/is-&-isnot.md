---
name: Is & IsNot
order: 6.5
title: Is & IsNot Utility - Markup by Before Semicolon
description: How to quickly check state truthy or falsy with Markup by Before Semicolon
layout: document
---

## Is & IsNot Utilities

The `is` and `isNot` are one of the simplest utilities that allows you to quickly check truthiness about values, especially states.

```javascript
const [status, setStatus] = state('pending')

html`${when(is(status, 'pending'), html`<p>loading...</p>`, html`<p>done</p>`)}`
```

Both the `is` and `isNot` take two arguments, a state or some data, and a value or a checker. They will always return a boolean as the result.

### Checker

The more advance way to use the `is` and `isNot` utilities is by providing a function as second argument that is called with the value and must return a boolean.

This checker allows you to perform custom checks instead of the default strict equality.

```javascript
const [count, setCount] = state(0)
const [status, setStatus] = state('loading')

const isGreaterThanTen = is(count, (n) => n > 10)
const isNotPending = isNot(status, (st) => st !== 'pending')
```

When they consume state as first argument, their result get re-evaluated with every change which allows it to be handy in quick validators.
