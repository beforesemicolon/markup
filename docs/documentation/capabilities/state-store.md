---
name: '{{t.pages.documentation.capabilities.state_store.meta.state_store}}'
order: 5.5
title: '{{t.pages.documentation.capabilities.state_store.meta.state_store_markup_by_before_semicolon}}'
description: '{{t.pages.documentation.capabilities.state_store.meta.build_shared_state_stores_with_markup_state_derived_getters_update_functions_effects_and_repeat}}'
layout: document
---

## {{t.pages.documentation.capabilities.state_store.content.state_store}}

{{t.pages.documentation.capabilities.state_store.content.the_great_thing_about_markup_state_state_index_is_the_fact_that_it_is_a_standalone_api_that_work}}

{{t.pages.documentation.capabilities.state_store.content.what_this_allows_you_to_do_is_manage_shared_global_state_away_from_the_component_and_inject_them}}

### {{t.pages.documentation.capabilities.state_store.content.create_a_state_store}}

{{t.pages.documentation.capabilities.state_store.content.take_for_example_this_todos_state_store}}

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

{{t.pages.documentation.capabilities.state_store.content.as_you_can_see_we_can_create_a_file_dedicated_to_manage_a_particular_state_we_want_to_use_in_mul}}

### {{t.pages.documentation.capabilities.state_store.content.consuming_the_store_state}}

{{t.pages.documentation.capabilities.state_store.content.we_don_t_have_to_worry_about_subscription_when_it_comes_to_rendering_this_data_we_can_inject_it}}

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

{{t.pages.documentation.capabilities.state_store.content.easy_enough_to_perform_something_whenever_this_list_changes_we_can_just_use_the_effect_state_eff}}

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

### {{t.pages.documentation.capabilities.state_store.content.define_store_actions}}

{{t.pages.documentation.capabilities.state_store.content.because_the_store_is_simply_a_file_we_can_expose_functions_that_perform_changes_in_the_data_with}}

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

{{t.pages.documentation.capabilities.state_store.content.these_actions_can_be_whatever_you_want_they_can}}

-   {{t.pages.documentation.capabilities.state_store.content.store_data_in_localstorage_or_indexeddb}}
-   {{t.pages.documentation.capabilities.state_store.content.be_asynchronous}}
-   {{t.pages.documentation.capabilities.state_store.content.call_servers_apis_to_save_data}}
-   {{t.pages.documentation.capabilities.state_store.content.perform_validations}}
-   {{t.pages.documentation.capabilities.state_store.content.map_the_data}}
-   {{t.pages.documentation.capabilities.state_store.content.etc}}

{{t.pages.documentation.capabilities.state_store.content.data_storage_and_state_management_does_not_have_to_be_complex_and_all_you_need_from_here_is_use}}

{{t.pages.documentation.capabilities.state_store.content.look_at_this_example_of_todo_state_store_with_localstorage_https_stackblitz_com_edit_web_platfor}}
