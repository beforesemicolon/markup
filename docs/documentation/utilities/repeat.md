---
name: Repeat
order: 6.4
title: Repeat Utility - Markup by Before Semicolon
description: How to handle lists and repeated content in Markup by Before Semicolon
layout: document
---

## Repeat Utility

The `repeat` utility is Markup recommended way to render iterable data or repeating content. It handles things like caching and tracking for the template ensuring list changes only happen to the items that need them.

```javascript
html`${repeat(todos, renderTodo)}`
```

### Why use repeat?

Markup templates already handle arrays but like any other injected value, Markup track the whole thing and not its individual items.

```javascript
const [todos, updateTodos] = state([])

html`${() => todos().map(renderTodo)}`.render(document.body)

updateTodos((prev) => [
    ...prev,
    {
        name: 'Go to gym',
        status: 'pending',
    },
])
```

The above code will work just fine as far as rendering a list. The issue becomes evident when a single item changes, is added or removed. This is because the function will get called again generating a brand new list of content to render. If Markup sees a new list, it will re-render everything.

The better way is to not dynamically map the list on render but on creation so Markup always have the things you want to render so it can check if its different from before or not.

```javascript
const [todos, updateTodos] = state([])

html`${todos}`.render(document.body)

updateTodos((prev) => [
    ...prev,
    renderTodo({
        name: 'Go to gym',
        status: 'pending',
    }),
])
```

This is exactly what `repeat` utility does for you by just taking the data and the render function.

### Numbers

The `repeat` helper accepts a number among many things. This number represents the number of times you want the callback render function needs to be called.

```javascript
html`${repeat(3, html`<spa></span>`)}`
```

The callback function will be called with numbers from 1 to the number you provided along with the indexes.

```javascript
html`${repeat(3, (n, index) => html`<spa>${n} - ${index}</span>`)}`.render(
    document.body
)
// <span>1 - 0</span><span>2 - 1</span><span>3 - 2</span>
```

### Iterables and Object literals

Additionally, `repeat` can consume any Object literal or [iterable object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) and this includes:

-   Array
-   Set
-   Map
-   String
-   any object with [Symbol.iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator)

```javascript
const iterable = {}

iterable[Symbol.iterator] = function* () {
    yield 1
    yield 2
    yield 3
}

html`${repeat(iterable, renderItem)}`
```

Since Markup template do not handle rendering such objects (except Array), this is an additional advantage in using `repeat`. You dont have to worry about converting any data into Array just so you can iterate and render.

The callback function will always get called with the entries and the index.

```javascript
const employeesSalary = {
    'john doe': 30000,
    'jane doe': 54000,
}

html`${repeat(employeesSalary, ([name, salary], index) => html`...`)}`
```

### Empty state

The `repeat` also consumes an optional third argument which is a function that will get called to return what to render when the data is empty.

```javascript
html`${repeat(todos, renderTodo, () => html`<p>No todos yet!</p>`)}`
```
