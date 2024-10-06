---
name: Markup State Store
path: /documentation/capabilities/state-store
title: State Store - Markup by Before Semicolon
description: How to use state to create a state store
layout: document
---

## State Store

The great thing about Markup [state](../state/define-state.md) is the fact that it is a standalone API that works great witht the template itself.

What this allows you to do is manage shared/global state away from the component and inject them directly into the template or perform side effects where needed. All that without worrying about subcriptions and cleanups.

### Create a state store

Take for example this `todos` state store:

```typescript
// src/stores/todos.ts

type UUID = `${string}-${string}-${string}-${string}-${string}`

export interface Todo {
    id: UUID
    name: string
    description: string
    status: 'done' | 'pending' | 'removed'
    dateCreated: Date
    dateLastUpdated: Date
}

const [todos, updateTodos] = state<Todo[]>([])

export const todoList = todos
```

As you can see, we can create a file dedicated to manage a particular state we want to use in multiple places in our application.

### Consuming the store state

We don't have to worry about subscription when it comes to rendering this data, we can inject it directly into the template.

```javascript
import {todoList} from "./stores/todos"

const App = () => {

    const renderTodo = () => {...}

    // html will handle all subscribing and
    // unsubscribing from todoList state
    return html`
        <ul id="todos">
            ${repeat(todoList, renderTodo)}
        </ul>
    `
}
```

Easy enough, to perform something whenever this list changes, we can just use the [effect](../state/effect.md).

```javascript
import { todoList } from './stores/todos'

const defaultTodosByStatus = { done: [], pending: [], removed: [] }

const [todosByStatus, updateTodosByStatus] = state(defaultTodosByStatus)

// effect will handle subscribing to the todoList state
const unsubFromEffect = effect(() => {
    updateTodosByStatus(
        todoList().reduce((acc, todo) => {
            if (!acc[todo.status]) {
                acc[todo.status] = []
            }

            acc[todo.status].push(todo)

            return acc
        }, defaultTodosByStatus)
    )
})

// call "unsubFromEffect" to unsubscribe from todoList state
```

### Define store actions

Because the store is simply a file, we can expose functions that perform changes in the data without exposing the logic or complexity of the state.

```typescript
// src/stores/todos.ts

...

export const createTodo = (name: string) => {
  const dateCreated = new Date();
  const todo: Todo = {
    id: crypto.randomUUID(),
    name,
    description: "",
    status: "pending",
    dateCreated,
    dateLastUpdated: dateCreated
  }

  updateTodos(prev => [...prev, todo])
}

export const updateTodo = (id: UUID, data: Partial<Todo>) => {
    updateTodos(prev => prev.map(todo => {
        if(todo.id === id) {
            return {
                ...todo,
                name: data.name ?? todo.name,
                description: data.description ?? todo.description,
                status: data.status ?? todo.status,
                dateLastUpdated: new Date()
            }
        }

        return todo;
    }))
}

export const deleteTodo = (id: UUID) => {
    updateTodos(prev => prev.filter(todo => {
        return todo.id !== id;
    }))
}

export const clearTodos = () => {
    updateTodos([])
}
```

These actions can be whatever you want. They can

-   store data in `localstorage` or `indexedDB`;
-   be asynchronous;
-   call servers APIs to save data;
-   perform validations;
-   map the data;
-   etc

Data storage and state management does not have to be complex and all you need from here is use the APIs readily available in the environment to do whatever you want.

Look at this example of [todo state store with localstorage](https://stackblitz.com/edit/web-platform-lvonxr?file=index.html).
