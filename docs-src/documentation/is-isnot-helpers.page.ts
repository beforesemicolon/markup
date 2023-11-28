import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { PageComponentProps } from '../type'

export default ({
    name,
    page,
    nextPage,
    prevPage,
    docsMenu,
}: PageComponentProps) =>
    DocPageLayout({
        name,
        page,
        prevPage,
        nextPage,
        docsMenu,
        content: html`
            ${Heading(page.name)}
            <p>
                This library is function-oriented but things can get messy when
                you try to perform multiple logic directly in the template.
                However, that is not the reason the most of the helpers exist.
            </p>
            <p>
                All helpers are used to perform side effects, meaning, to react
                to <a href="./state-values">state</a> changes. Instead of using
                the <code>effect</code> helper for everything, you can use ones
                with specific capabilities that are more readable and easier to
                use.
            </p>
            ${Heading('is helper', 'h3')}
            <p>
                The <code>is</code> helper will return a boolean whether it is
                equal.
            </p>
            <p>It takes two arguments and both are required.</p>
            <p><code>is(VALUE_OR_STATE, CHECKER_OR_VALUE)</code></p>
            <ul>
                <li>
                    <strong>VALUE_OR_STATE</strong>: It can be any value or a
                    <code>StateGetter</code> for any value.
                </li>
                <li>
                    <strong>CHECKER_OR_VALUE</strong>: A static value to check
                    against, or a function that does the checking and return
                    true or false.
                </li>
            </ul>
            ${CodeSnippet('html`${is(val, isNumber)}`', 'typescript')}
            <p>
                It can be used anywhere in the template, inside templates, as
                attribute values and even body content.
            </p>
            ${CodeSnippet(
                'html`<button attr.disabled="${is(status, \'logged\')}">login</button>`',
                'typescript'
            )}
            <p>
                You can also nest helpers to compose more complex render logic.
            </p>
            ${CodeSnippet(
                'html`${when(is(status, \'logged\'), "Logged", "Not Logged")}`',
                'typescript'
            )}
            ${Heading('isNot helper', 'h3')}
            <p>
                The <code>isNot</code> helper works the same as the
                <code>is</code> helper but checks the opposite.
            </p>
            ${CodeSnippet(
                'html`${isNot(val, n => n typeof "number")}`',
                'typescript'
            )}
        `,
    })
