import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { HelpersGroup } from '../data/documents'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'

const page = HelpersGroup.list[3]

export default DocPageLayout(
    page.name,
    page.path,
    html`
        ${Heading(page.name)}
        <p>
            Pages can get super complex with a lot of repetitive markup and long
            lists. Using a template makes the work much easier since you can use
            data and logic to create long lists or repeat things with small
            variations much easier.
        </p>
        <p>
            By default, the template will already render array of contents for
            you:
        </p>
        ${CodeSnippet(
            'const todos = [\n' +
                '  "Go shopping",\n' +
                '  "Call the car salesman",\n' +
                '  "Register for next semester classes"\n' +
                ']\n' +
                '\n' +
                'const renderTodo = todo => html`<li class="todo-item">${todo}</li>`\n' +
                '\n' +
                'html`<ul>${todos.map(renderTodo)}</ul>`\n',
            'typescript'
        )}
        <p>
            The above example will correctly render the list just fine and all
            need in the template was a single line.
        </p>
        <p>
            Using the natively supported array rendering of the template is
            perfect for static lists but not so much if the list content or size
            keeps changing. Fortunately, the system offers a helper for that.
        </p>
        ${Heading('repeat helper', 'h3')}
        <p>
            The <code>repeat</code> helper is perfect for lists either static or
            dynamic.
        </p>
        <p>
            We can change the above example with the <code>repeat</code> helper
            and all renders the same.
        </p>
        ${CodeSnippet(
            'const todos = [\n' +
                '  "Go shopping",\n' +
                '  "Call the car salesman",\n' +
                '  "Register for next semester classes"\n' +
                ']\n' +
                '\n' +
                'const renderTodo = todo => html`<li class="todo-item">${todo}</li>`\n' +
                '\n' +
                'html`<ul>${repeat(todos, renderTodo)}</ul>`',
            'typescript'
        )}
        <p>
            The <code>repeat</code> helper takes 3 arguments and the third one
            is optional:
        </p>
        <p>
            <code
                >repeat(COUNT_OR_ARRAY, ITEM_RENDERER,
                ?WHEN_EMPTY_RENDERER)</code
            >:
        </p>
        <ul>
            <li>
                <strong>COUNT_OR_ARRAY</strong>: You can specify a number of
                times you need something to repeat or an array.
            </li>
            <li>
                <strong>ITEM_RENDERER</strong>: A function that will be called
                for every item and must return what to render. If a number ws
                specified as the first argument, this function will be get
                called with a number value and the index, otherwise, it will get
                called with the item in the array and its index.
            </li>
            <li>
                <strong>WHEN_EMPTY_RENDERER</strong> (optional): A function that
                will get called when the list is empty and must return something
                to render in that case. If nothing is provided, nothing will be
                rendered.
            </li>
        </ul>
        ${Heading('Why use the repeat helper?', 'h4')}
        <p>
            The <code>repeat</code> helper will keep an internal cache based on
            the items in the list. This is done to only re-render the items that
            change and not the whole list every time there is a change.
        </p>
        <p>
            This also means that if you have a repeated value associated with a
            template or DOM Node it will only appear once in the DOM.
        </p>
        ${CodeSnippet(
            'html`${repeat([1, 3, 5, 3], (n) => `item ${n}`)}`\n' +
                '// renders: item 1 item 3 item 5 item 3' +
                '\n\n' +
                'html`${repeat([1, 3, 5, 3], (n) => html`<span>item ${n}</span>`)}`\n' +
                '// renders: item 1 item 3 item 5' +
                '\n\n' +
                "html`${repeat([1, 3, 5, 3], (n) => element('li', {\n" +
                '  textContent: `item ${n}`\n' +
                '}))}`\n' +
                '// renders: item 1 item 3 item 5',
            'typescript'
        )}
        <p>
            This is only true when you are trying to render
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/Node"
                >Nodes</a
            >
            , and it is not specific to this library. You can't render the same
            nodes in multiple places. Because each template or node are mapped
            to the same value reference even when the <code>repeat</code> tries
            to render the whole list.
        </p>
        ${CodeSnippet(
            'Cache Map\n' +
                '1 -> DOM Node(s) 1\n' +
                '3 -> DOM Node(s) 3\n' +
                '5 -> DOM Node(s) 5'
        )}
        <p>
            The cache is updated whenever there is a change in the item
            reference or position in the list. But only the things that change
            will be updated in the cache map.
        </p>
        ${DocPrevNextNav({
            prev: {
                label: HelpersGroup.list[2].name,
                link: HelpersGroup.list[2].path,
            },
            next: {
                label: HelpersGroup.list[4].name,
                link: HelpersGroup.list[4].path,
            },
        })}
    `
)
