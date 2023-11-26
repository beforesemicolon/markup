import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { PageComponentProps } from '../type'

export default ({ page, nextPage, prevPage, docsMenu }: PageComponentProps) =>
    DocPageLayout({
        page,
        nextPage,
        prevPage,
        docsMenu,
        content: html`
            ${Heading(page.name)}
            <p>
                One of the biggest sells for working with templates is the
                ability to conditional render things. Markup makes it super easy
                to conditional render anything because of
                <a href="./dynamic-values-and-update">dynamic values</a>.
            </p>
            <p>
                For a simple example, you can add a function in the template
                that can quickly check a condition and return different values
                accordingly.
            </p>
            ${CodeSnippet(
                'let count = 5;\n' +
                    '\n' +
                    "html`${() => count % 2 === 0 ? 'even' : 'odd'}`",
                'typescript'
            )}
            <p>
                You can use a function to conditionally return anything you want
                to be renderer. However, Markup offers a better way.
            </p>
            ${Heading('when helper', 'h3')}
            <p>
                Markup exposes a set of helpful helpers and one of them is the
                <code>when</code> helper which allows you to conditional render
                anything with better performance and handling.
            </p>
            ${CodeSnippet(
                'let count = 5;\n' +
                    '\n' +
                    'const even = x => x % 2 === 0;\n' +
                    '\n' +
                    "html`${when(is(count, even), 'even', 'odd')}`",
                'typescript'
            )}
            <p>
                The <code>when</code> helper takes three arguments, and the
                third one is optional:
            </p>
            <p><code>when(CONDITION, THEN, ?ELSE)</code>:</p>
            <ul>
                <li>
                    <strong>CONDITION</strong>: The condition can be a value or,
                    a function that returns a value, and it will be checked if
                    it is
                    <a
                        href="https://developer.mozilla.org/en-US/docs/Glossary/Truthy"
                        >TRUTHY</a
                    >
                    or
                    <a
                        href="https://developer.mozilla.org/en-US/docs/Glossary/Falsy"
                        >FALSY</a
                    >.
                </li>
                <li>
                    <strong>THEN</strong>: Something to render if the condition
                    is truthy. It can also be a function that returns any value
                    you need.
                </li>
                <li>
                    <strong>ELSE</strong> (optional): Something to render if the
                    condition is falsy. It can also be a function that returns
                    any value you need.
                </li>
            </ul>
            ${Heading('Why use the when helper?', 'h4')}
            <p>
                Beyond conditional rendering, the <code>when</code> helper also
                caches the <code>THEN</code> and <code>ELSE</code> values even
                when you use them as functions.
            </p>
            <p>
                This prevents the DOM from being unnecessarily updated when the
                condition haven't changed (remained truthy or falsy over many
                changes).
            </p>
            ${CodeSnippet(
                'const [count, setCount] = state(0);\n' +
                    '\n' +
                    'html`${\n' +
                    '  () => count() > 10 ? html`<p>over 10</p>` : html`<p>under 10</p>`}\n' +
                    '`'
            )}
            <p>
                The above example will render <code>over 10</code> or
                <code>under 10</code> templates on every change even though what
                you render for over or under 10 looks the same. This would cause
                unnecessary renders and DOM calculations using plain function
                instead of <code>when</code> helper because every time the
                function is called a new template instance is created, which for
                Markup is different, therefore re-render the DOM to look the
                same.
            </p>
            <p>
                With the <code>when</code> helper once the count is over 10 and
                keeps increasing the DOM will never change. Only when it goes
                under for the first time.
            </p>
        `,
    })
