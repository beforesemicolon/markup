import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'
import { PageComponentProps } from '../type'

export default ({ page, nextPage, prevPage, docsMenu }: PageComponentProps) =>
    DocPageLayout(
        page.title,
        page.path,
        docsMenu,
        html`
            ${Heading(page.name)}
            <p>
                To create a custom helper, all you need to do is create a
                function. If you expect to receive a state value you can wrap it
                in the
                <code>helper</code> function and handle the state value. All
                that this library can help you with.
            </p>
            <p>Let's look at this simple render of a todo list.</p>
            ${CodeSnippet(
                'const [todos, updateTodos] = state([\n' +
                    '  {name: "buy groceries", status: "pending"},\n' +
                    '  {name: "go to gym", status: "done"},\n' +
                    '  {name: "prepare for xmas", status: "pending"},\n' +
                    '  {name: "start a yt channel", status: "pending"},\n' +
                    '])\n' +
                    '\n' +
                    'html`${repeat(todos, t => html`<p>${t.name}</p>`)}`',
                'typescript'
            )}
            <p>
                Let's build a helper that can filter the todos based on status.
            </p>
            <p>
                The simplest way is to just create a function that takes a list
                and function that returns a boolean and gets called for each
                item.
            </p>
            ${CodeSnippet(
                'const filterList = (list, filterer) => {\n' +
                    '  return list.filter(filterer)\n' +
                    '}',
                'typescript'
            )}
            <p>We can use such a filter function as so:</p>
            ${CodeSnippet(
                'html`${repeat(\n' +
                    '  filterList(\n' +
                    '    todos(), \n' +
                    '    t => t.status === "done"\n' +
                    '  ), \n' +
                    '  t => html`<p>${t.name}</p>`\n' +
                    ')}`',
                'typescript'
            )}
            <p>
                This works perfectly for the first render. It fails when the
                todo list state changes. This is because the template only
                performs a DOM update when it sees the state.
            </p>
            <p>
                The first thing we can do is wrap the function with the helper
                function so the template knows to look for a state.
            </p>
            ${CodeSnippet(
                'const filterList = helper((list, filterer) => {\n' +
                    '  return list.filter(filterer)\n' +
                    '})',
                'typescript'
            )}
            <p>
                But we are not passing the <code>todos</code> state to the
                helper, we are just calling it to pass the value to the
                <code>filterList</code>.
            </p>
            ${CodeSnippet(
                'html`${repeat(\n' +
                    '  filterList(\n' +
                    '    todos(), // <- here \n' +
                    '    t => t.status === "done"\n' +
                    '  ), \n' +
                    '  t => html`<p>${t.name}</p>`\n' +
                    ')}`',
                'typescript'
            )}
            <p>Instead, we can call it inside the helper instead.</p>
            ${CodeSnippet(
                'const filterList = helper((list, filterer) => {\n' +
                    '  return list().filter(filterer)\n' +
                    '})',
                'typescript'
            )}
            <p>
                All the issues are now fixed and the final result looks like so.
            </p>
            ${CodeSnippet(
                'const filterList = helper((list, filterer) => {\n' +
                    '  return list().filter(filterer)\n' +
                    '});\n\n' +
                    'html`${repeat(\n' +
                    '  filterList(\n' +
                    '    todos,\n' +
                    '    t => t.status === "done"\n' +
                    '  ), \n' +
                    '  t => html`<p>${t.name}</p>`\n' +
                    ')}`',
                'typescript'
            )}
            <p>
                However, the <code>filterList</code> only works for state
                values. Ideally, you want a helper to work if a state, raw, or
                helper value is provided. To do that, we can use the
                <code>val</code> utility.
            </p>
            ${CodeSnippet(
                'const filterList = helper((list, filterer) => {\n' +
                    '  return val(list).filter(filterer)\n' +
                    '})',
                'typescript'
            )}
            <p>
                Now the helper is complete and would work for any type of data.
                Here is the full example in typescript.
            </p>
            ${CodeSnippet(
                'import {\n' +
                    '  html,\n' +
                    '  state,\n' +
                    '  helper,\n' +
                    '  val,\n' +
                    '  repeat,\n' +
                    '  StateGetter\n' +
                    '} from "@beforesemicolon/markup";\n\n' +
                    'const filterList = helper(<T>(\n' +
                    '  list: T[] | StateGetter<T[]>,\n' +
                    '  filterer: (item: T) => boolean\n' +
                    ') => {\n' +
                    '  return val<T[]>(list).filter(filterer)\n' +
                    '});\n\n' +
                    'interface ToDo {\n' +
                    '  name: string;\n' +
                    '  status: "done" | "pending";\n' +
                    '}\n\n' +
                    'const [todos, updateTodos] = state<ToDo[]>([\n' +
                    '  {name: "buy groceries", status: "pending"},\n' +
                    '  {name: "go to gym", status: "done"},\n' +
                    '  {name: "prepare for xmas", status: "pending"},\n' +
                    '  {name: "start a yt channel", status: "pending"},\n' +
                    '])\n' +
                    '\n' +
                    'html`${repeat(\n' +
                    '  filterList(\n' +
                    '    todos,\n' +
                    '    t => t.status === "done"\n' +
                    '  ), \n' +
                    '  t => html`<p>${t.name}</p>`\n' +
                    ')}`.render(document.body);',
                'typescript'
            )}
            ${DocPrevNextNav({
                prev: prevPage,
                next: nextPage,
            })}
        `
    )
