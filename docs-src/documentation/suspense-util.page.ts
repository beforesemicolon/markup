import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { PageComponentProps } from '../type'

export default ({ page, nextPage, prevPage, docsMenu }: PageComponentProps) =>
    DocPageLayout({
        page,
        prevPage,
        nextPage,
        docsMenu,
        content: html`
            ${Heading(page.name)}
            <p>
                The <code>suspense</code> utility exist solely to aid you with
                any asynchronous rendering.
            </p>
            <p>It takes three arguments and only the first one is required.</p>
            <p>
                <code
                    >suspense(ASYNC_ACTION, LOADING_TEMPLATE,
                    FAILING_FN_RENDER)</code
                >
            </p>
            <ul>
                <li>
                    <strong>ASYNC_ACTION</strong>: Some async function or one
                    that returns a promise.
                </li>
                <li>
                    <strong>LOADING_TEMPLATE</strong> (optional): Anything you
                    want to render while the action is still pending.
                </li>
                <li>
                    <strong>FAILING_FN_RENDER</strong> (optional): A function
                    that must return something to render when the action fails.
                    This function will get called with the error.
                </li>
            </ul>
            <p>
                By default, it will render a paragraph saying
                <code>loading...</code> and if it fails it will render a
                paragraph with the error message.
            </p>
            ${CodeSnippet(
                'html`${suspense(fetchUser, html`<p>user loading...</p>`)}`',
                'typescript'
            )}
            <p>
                This helper can be very powerful with API calls as well as lazy
                loading parts of the page.
            </p>
            ${CodeSnippet(
                'const loadTodos = () => {\n' +
                    "  return fetch('/api/todos')\n" +
                    '    .then(res => res.json())\n' +
                    '    .then(res => html`${repeat(res, renderTodo)}`)\n' +
                    '}\n' +
                    '\n' +
                    'html`${suspense(loadTodos)}`',
                'typescript'
            )}
        `,
    })
