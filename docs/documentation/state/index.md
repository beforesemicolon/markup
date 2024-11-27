---
name: Intro to States
order: 5
title: State - Markup by Before Semicolon
description: How to handle state in Markup by Before Semicolon
layout: document
---

## State

Something that is truly missing in web APIs is reactivity, the ability to react to changes instead of listening to events. A big promise is the [tc39 proposal](https://github.com/tc39/proposal-signals) which is attempting to bring signals to JavaScript.

Until then, Markup exposes a standalone API that gives you that capability called `state`.

The state API can be used with or without templates allowing you to create [state stores](../capabilities/state-store.md), enhance Web Components, and even provide reactivity with raw DOM manipulation.

```javascript
const [count, setCount] = state(0)

const btn = document.createElement('button')
btn.type = 'button'

btn.addEventListener('click', () => {
    setCount((prev) => prev + 1)
})

effect(() => {
    btn.textContent = `count: ${count()}`
})

document.body.append(btn)
```

The best part is when you combine state and templates to render DOM nodes that react to updates as they happen without having to manipulate the DOM yourself.

```javascript
const handleClick = () => {
    setCount((prev) => prev + 1)
}

html`<button type="button" onclick="${handleClick}">count: ${count}</button>`
```

Markup templates do not traverse the DOM to check for updates. Instead, it creates [render effects](./effect.md) in place to update the DOM exactly where and when needed.

### Input

To initialize a state, you can optionally provide an `initialValue` as well as a `StateSubscriber` which is a function that will be called every time the state changes.

```typescript
const [count] = state<number>(0, () => {
    // react to change
})
```

When no input value provided, the default value is an empty string.

### Return

The `state` function will return and array with three functions, a `StateGetter`, `StateSetter`, and a `StateUnSubscriber`.

```javascript
const [count, updateCount, unsubscribe] = state(0, () => {
    // will only get called once
})

updateCount(10)

unsubscribe()
```

#### StateGetter

The `StateGetter` is a function you must call to get the current value of the state.

```javascript
const [count] = state(0)

console.log(count()) // logs 0
```

#### StateSetter

The `StateSetter` is a function you call with the new value for the state or a function that gets called with the current value and must return a new value.

```javascript
const [count, updateCount] = state(0)

// provide a new value
updateCount(10)

// use current value and perform a calculation
updateCount(count() + 5)

// use the callback to update the value
updateCount((prev) => prev + 5)
```

Calling the `StateSetter` with same value will not cause the subscribers to be called. A shallow comparison is made before updating the current value which prevents unnecessary updates.

```javascript
const [count, updateCount] = state(0, () => {
    // this will never get called
    // given the setInterval update bellow
    console.log(count())
})

setInterval(() => {
    updateCount(0)
}, 1000)
```

#### StateUnSubscriber

In case you provide a `StateSubscriber` as a second argument for the `state`, you can then use the `StateUnSubscriber` to stop listening to the state changes.

```javascript
const [count, updateCount, unsubscribeFromCount] = state(0, () => {
    // react to change
})

unsubscribeFromCount()
```

### How it works?

The state is a synchronous value which means you can update it in one line and read it on the next.

```javascript
setCount(10)
console.log(count()) // logs 10
```

Behind the scenes, `state` is just a self managed subscription that works seamlessly with `effect` and `html` APIs.

### Examples

Form input value and validation:

```javascript
const [valid, setValid] = state(true)
const [value, setValue] = state('', () => {
    if (value().length > 8) {
        setValid(false)
    }

    setValid(true)
})
```
