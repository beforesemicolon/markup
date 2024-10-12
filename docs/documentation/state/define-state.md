---
name: Markup State
path: /documentation/state/define-state
title: State - Markup by Before Semicolon
description: How to handle state in Markup by Before Semicolon
layout: document
---

## State

Markup exposes a standalone API to work with state called `state`.

```typescript
state: <T>(initialValue: T, sub?: StateSubscriber) => readonly [
    StateGetter<T>, 
    StateSetter<T>, 
    StateUnSubscriber
];
```

### Input

You can provide an `initialValue` to start the state as well as a `StateSubscriber` which is function that will get called every time the state changes.

```typescript
const [count] = state<number>(0, () => {
    // react to change
})
```

No input is required and the default value is an empty string.

### Return

The `state` function will recturn and array with three functions, a `StateGetter`, `StateSetter`, and a `StateUnSubscriber`.

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
updateCount(10);

// use current value and perform a calculation
updateCount(count() + 5);

// use the callback to update the value
updateCount(prev => prev + 5)
```

#### StateUnSubscriber

In case you provide a `StateSubscriber` as a second argument for the `state`, you can then use the `StateUnSubscriber` to stop listening to the state changes.

```javascript
const [count, updateCount, unsubscribeFromCount] = state(0, () => {
    // react to change
})

unsubscribeFromCount();
```

### Examples

Form input value and validation:

```javascript
const [valid, setValid] = state(true);
const [value, setValue] = state('', () => {
    if(value().length > 8) {
        setValid(false)
    }
    
    setValid(true)
});
```

