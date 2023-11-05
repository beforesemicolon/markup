import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { ComponentsGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'

const page = ComponentsGroup.list[3]

export default DocPageLayout(
    page.path,
    html`
        ${Heading(page.name)}
        <p>
            Having a global store can come in handy. There are many solutions
            out there you can use but let's entertain the idea you can create a
            simple store using the
            <a href="./state-values.html#state">state</a> function.
        </p>
        <p>Let's create a todo store.</p>
        ${CodeSnippet(
            '// src/stores/todo.ts\n' +
                'import {state} from "@beforesemicolon/html";\n\n' +
                'type UUID = `${string}-${string}-${string}-${string}-${string}`\n\n' +
                'export interface Todo {\n' +
                '  id: UUID\n' +
                '  name: string\n' +
                '  description: string\n' +
                '  status: "done" | "pending" | "removed"\n' +
                '  dateCreated: Date\n' +
                '  dateLastUpdated: Date\n' +
                '}\n' +
                '\n' +
                'const [todos, updateTodos] = state<Todo[]>([]);\n' +
                '\n' +
                'export const todoList = todos;\n' +
                '\n' +
                'export const createTodo = (name: string) => {\n' +
                '  const dateCreated = new Date();\n' +
                '  const todo: Todo = {\n' +
                '    id: crypto.randomUUID()\n' +
                '    name,\n' +
                '    description: "",\n' +
                '    status: "pending",\n' +
                '    dateCreated,\n' +
                '    dateLastUpdated: dateCreated \n' +
                '  }\n' +
                '  \n' +
                '  updateTodos(prev => [...prev, todo])\n' +
                '}\n' +
                '\n' +
                'export const updateTodo = (id: UUID, data: Partial<Todo>) => {\n' +
                '  updateTodos(prev => prev.map(todo => {\n' +
                '    if(todo.id === id) {\n' +
                '      return {\n' +
                '        ...todo,\n' +
                '        name: data.name ?? todo.name,\n' +
                '        description: data.description ?? todo.description,\n' +
                '        status: data.status ?? todo.status,\n' +
                '        dateLastUpdated: new Date()\n' +
                '      }\n' +
                '    }\n' +
                '    \n' +
                '    return todo;\n' +
                '  }))\n' +
                '}\n' +
                '\n' +
                'export const deleteTodo = (id: UUID) => {\n' +
                '  updateTodos(prev => prev.filter(todo => {\n' +
                '    return todo.id !== id;\n' +
                '  }))\n' +
                '}\n' +
                '\n' +
                'export const clearTodos = () => {\n' +
                '  updateTodos([])\n' +
                '}',
            'typescript'
        )}
        <p>
            This is a simple file store that handles all the CRUD operations and
            only exposes the necessary.
        </p>
        <p>
            There is no subscriptions needed, not complex setup and using the
            <code>todoList</code> in the template with the nice cocktail of
            helpers is all you need to create very complex applications.
        </p>
        <p>
            We have prepared a full tutorial on how to create such application
            and you can <a href="">watch it here</a> to learn more.
        </p>
    `
)
