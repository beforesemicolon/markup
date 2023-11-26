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
                The best things you can have in template literal are dynamic
                values. Lucky for <em>Markup</em> dynamic values are just
                functions that are automatically handled in the template.
            </p>
            <p>
                Any function added to the template, as long as it is not an
                <a href="./event-handling">event handler</a>, will be treated as
                a
                <a
                    href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get"
                    >getter</a
                >
                and be called to get the value to render or for an attribute.
            </p>
            <p>
                The example bellow will render the count just fine. Using a
                function to return the value tells the template that the value
                might change in the future, so it needs to be re-called on
                update requests or state changes.
            </p>
            ${CodeSnippet(
                'let count = 0;\n' +
                    '\n' +
                    'const conter = html`\n' +
                    '  <p>${() => count}</p>\n' +
                    '`;',
                'typescript'
            )}
            <p>
                You will learn a better way to have dynamic values when learning
                about <a href="./state-values">states</a> later. For now, let's
                focus on the function alone.
            </p>
            ${Heading('Update template', 'h3')}
            <p>
                Just having dynamic values in the template does not do much. All
                it does is render the value returned.
            </p>
            <p>
                The template still needs to know when to update. Enters the
                <code>update</code> method.
            </p>
            ${CodeSnippet(
                'let count = 0;\n' +
                    '\n' +
                    'const counter = html`\n' +
                    '  <p>${() => count}</p>\n' +
                    '  <button type="button" onclick="${countUp}">+</button>\n' +
                    '`;\n' +
                    '\n' +
                    'function countUp() {\n' +
                    '  count += 1;\n' +
                    '  counter.update()\n' +
                    '}\n' +
                    '\n' +
                    'counter.render(document.body)',
                'typescript'
            )}
            <p>The above example introduces 2 new functions in the template:</p>
            <ol>
                <li>
                    <code>countUp</code>: used as <code>click</code> event
                    listener on the button.
                </li>
                <li>
                    <code>counter.update</code>: used to tell the template about
                    the value change.
                </li>
            </ol>
            <p>
                <code>update</code> is another method the template instance
                exposes that you can use to tell the template to look into all
                the dynamic values for a change. The template will get a new
                value, do a <a>shallow comparison</a> and update the DOM if such
                value has changed.
            </p>
            <p>
                <strong>Important to know</strong> that this "re-check" happens
                to all dynamic values in the template. This means that you can
                update multiple values at once and call the
                <code>update</code> after to have the template update for all of
                them.
            </p>
            <p>
                It also means that the template will also re-check dynamic
                values that did not change. You will learn how to address this
                next when you learn about <a href="./state-values">states</a>.
            </p>
        `,
    })
