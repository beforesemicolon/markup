import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { Heading } from '../partials/heading'
import { CodeSnippet } from '../partials/code-snippet'
import { DocPrevNextNav } from '../partials/doc-prev-next-nav'
import { PageComponentProps } from '../type'

export default ({ page, nextPage, prevPage, docsMenu }: PageComponentProps) =>
    DocPageLayout(
        page.title,
        page.description,
        page.path,
        docsMenu,
        html`
            ${Heading(page.name)}
            <p>
                When working on the client, the best thing you can have is
                dynamic values. For <em>Markup</em> dynamic values are simply
                functions.
            </p>
            <p>
                Any function added to the template, as long as it is not an
                <a href="./event-handling">event handler</a>, will be called to
                get the value to render or for an attribute.
            </p>
            <p>
                The example bellow will render the count just fine but using a
                function to return the value tells the template that the value
                might change in the future.
            </p>
            ${CodeSnippet(
                'let count = 0;\n' +
                    '\n' +
                    'const conter = html`\n' +
                    '  <p>${() => count}</p>\n' +
                    '  <button type="button">+</button>\n' +
                    '`;',
                'typescript'
            )}
            <p>
                You will learn a better way to have dynamic values when reading
                about <a href="./state-values">states</a> in the future. For
                now, let's focus on the function alone.
            </p>
            ${Heading('Update template', 'h3')}
            <p>
                Just having dynamic values in the template does not do much. All
                it does is render the value correctly.
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
                    <code>counter.update</code>: used to tell the template the
                    about the value change.
                </li>
            </ol>
            <p>
                The <code>update</code> is another method the template instance
                exposes which you can use to tell it to look into all those
                dynamic values and rerun them. The template will get a new
                value, do a <em>shallow comparison</em> and update the DOM if
                such value has changed.
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
                later when you learn about <a href="./state-values">states</a>.
            </p>
            ${DocPrevNextNav({
                prev: prevPage,
                next: nextPage,
            })}
        `
    )
