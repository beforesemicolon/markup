# Markup
HTML Templating System

⚠️ This is still in Beta and contains parts which are still under development and experimentation.

⚠️ Do NOT use in production!

[![Static Badge](https://img.shields.io/badge/docs-markup.beforesemicolon.com-blue)](https://beforesemicolon.github.io/html/)
[![npm](https://img.shields.io/npm/v/%40beforesemicolon%2Fhtml)](https://www.npmjs.com/package/@beforesemicolon/html)
![npm](https://img.shields.io/npm/l/%40beforesemicolon%2Fhtml)


The beforesemicolon `html` is a plug-and-play template system for those who need the bare minimal yet powerful
way to build user interface. Its small size and ready-to-go nature makes it perfect for quick prototypes, 
UI components library, browser extensions, and side projects. But make no mistake, it has all the templating
features for a big project and serves as a perfect start to build any UI framework or library.

### Motivation
Most UI libraries need too much setup and require build with a steep learning curve. If you find a good templating system
its either not powerful enough or requires extra things to make it work by itself.

This templating system is standalone system. You don't need anything else to start rendering and reacting to changes.

It requires **no build**, **its tiny**, and the API is literally **2 main things to learn**, and you are ready to go. 
It is pretty much HTML and Javascript so the learning curve is extremely small.

### Example
Below is a simple todo app and as you can see, its pretty much HTML and Javascript.

```ts
import {html, state, repeat} from "@beforesemicolon/html";

interface TodoItem {
  name: string;
  description: string;
  id: string;
}

const [todos, updateTodos] = state<Array<TodoItem>>([])

const createTodo = () => {
  const name = window.prompt("Enter todo name");
  const description = window.prompt("Enter todo description") ?? '';
  
  if (name) {
    updateTodos(prev => [...prev, {name, description, id: crypto.randomUUID()}])
  }
}

const deleteTodo = id => {
  updateTodos(prev => prev.filter(todo => todo.id !== id))
}

const TodoItem = ({name, description, id}: TodoItem) => html`
  <div class="todo-item">
    <h3>${name}</h3>
    <p>${description}</p>
    <button type="button" onclick="${() => deleteTodo(id)}">delete</button>
  </div>
`;

const TodoApp = html`
  <h2>Todo App</h2>
  <button type="button" onclick="${createTodo}">add new</button>
  <div class="todo-list">
    ${repeat(todos, TodoItem)}
  </div>
`

TodoApp.render(document.body)
```

#### More examples

This is a simple example of a button, but you can check:
- [Some examples of how to create components](#component-patterns).
- [A Modular Todo App](https://stackblitz.com/edit/web-platform-lvonxr?file=app.js)
- [A Simple Counter App](https://stackblitz.com/edit/web-platform-adqrrf?file=app.js)
- [A Simple Time App](https://stackblitz.com/edit/web-platform-bwoxex?file=button.js)

## Install
```
npm i @beforesemicolon/html
```

## Use directly in the Browser
This library requires no build or parsing. The CDN package is one digit killobyte in size, tiny!

```html
<!DOCTYPE html>
<html lang="en">
<head>

  <!-- Grab the latest version -->
  <script src="https://unpkg.com/@beforesemicolon/html/dist/client.js"></script>

  <!-- Or a specific version -->
  <script src="https://unpkg.com/@beforesemicolon/html@1.0.0/dist/client.js"></script>

</head>
<body></body>
</html>

```
