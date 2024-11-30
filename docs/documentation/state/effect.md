---
name: Effect
order: 6.1
title: State Effect - Markup by Before Semicolon
description: How to react to state in Markup by Before Semicolon
layout: document
---

## Effect

The `effect` API complements the [state](./index) API by providing a better way to react to multiple state changes based on what you need to be executed.

```typescript
type EffectSubscriber<T> = (value: T | undefined) => undefined | T
type EffectUnSubscriber = () => void

effect: <T>(sub: EffectSubscriber<T>) => EffectUnSubscriber
```

The `state` API allows you to subscribe to changes of its value.

```javascript
const [count, updateCount] = state(0, () => {
    // react to changes
})

updateCount(10)
```

This is great if you want to perform side effects related to a single state. To perform side effects for multiple states you will need the `effect` API.

```javascript
const [count, updateCount] = state(0)

effect(() => {
    // react to changes
})

updateCount(10)
```

#### EffectUnSubscriber

Some side effects can stay there continuosly as a global effect to something specific. Others need to be cleaned up whenever the scope where they are defined at goes away.

```javascript
const cleanEffect = effect(() => {
    // react to changes
})

cleanEffect()
```

### How it works?

When you call a `StateGetter` inside the `effect` callback function, the `effect` becomes aware of the state and this detection is done synchronously.

The effect calls the provided callback as soon as its declared so it becomes aware of the states called inside.

```javascript
effect(() => {
    console.log(count()) // will log right away
})
```

The `effect` also batches updates which allows you to update multiple state at once and only have a single reaction.

```javascript
effect(() => {
    console.log(count(), total())
    // prints: 0 0 on initiation
    // prints: 1 1 on update of both values
})

setCount((prev) => prev + 1)
setTotal((prev) => prev + 1)
```

The batch update is useful but the `effect` also understand initialization which allows you to make a bunch calculation on load and only have it run once after you are done.

```javascript
effect(() => {
    console.log(count())
    // prints: 0 on initiation
    // print: 100 after the while loop completes
})

while (count() < 100) {
    setCount((prev) => prev + 1)
}
```

#### Caching

The `effect` allows you to return values that are cached and provided in the callback for the next time. This is great for tracking changes accross updates.

For example, perform a debounce effect on search value changes.

```javascript
const [search, setSearch] = state('')
const [searchResults, updateSearchResults] = state([])

effect((timer) => {
    clearTimeout(timer)

    // so the effect becomes aware of "search" state
    const searchValue = search()

    return setTimeout(async () => {
        const response = api.search({ searchValue })

        updateSearchResults(response.results)
    }, 300)
})
```

#### Async effect

The `effect` works synchronously. That's how it detects the states inside and caches data.

However, callback you provide to the `effect` can be asynchronous if you really want to.

```javascript
effect(async () => {
    try {
        const res = await fetch(
            `https://randomuser.me/api/?page=${count()}&results=10&seed=markup`
        )

        console.log(await res.json())
    } catch (e) {
        console.error(e)
    }
})
```

If you do so, the cached data will be the promise returned by the function and not the data you return from the async callback. This means you need to resolve the cached data to get the value.

```javascript
effect(async (res = Promise.resolve(0)) => {
    const result = count() + (await res)

    console.log(result)

    return result
})
```

#### Nested effect

You can nest `effect` to track different values. This allows for the body of your `effect` to react independently while different effects track different states.

```javascript
const unsub = effect(() => {
    console.log('outer', count())
    effect(() => {
        console.log('inner', count())
    })
})

unsub() // clears all effects
```

If you want to clear all effects, you can unsubscribe from the outer most `effect` and which will take care of all child `effect` for you. However, inner effects must be tracked by you as whenever the outer effect is called, a new inner effect will be created.
