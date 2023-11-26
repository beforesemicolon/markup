import { html } from '../../src'
import { DocPageLayout } from '../partials/doc-page-layout'
import { CodeSnippet } from '../partials/code-snippet'
import { Heading } from '../partials/heading'
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
                There could be times when you need to get reference of the
                element in the DOM to perform something specific to your
                project. Fortunately, Markup makes it easy get reference of DOM
                elements.
            </p>
            <p>
                Markup exposes a special attribute you can use to create DOM
                references. It is the <code>ref</code> attribute.
            </p>
            ${CodeSnippet(
                'const button = html`<button ref="btn">click me</button>`\n' +
                    '\n' +
                    'button.render(document.body)\n' +
                    '\n' +
                    "button.refs.btn[0].style.setProperty('color', 'red')",
                'typescript'
            )}
            <p>
                The example above sets a <code>ref</code> attribute with the
                value of <code>btn</code> which is the name for your reference.
            </p>
            <p>
                To access the reference it reads the <code>refs</code> property
                on the HTMLTemplate that is an object literal keyed by the name
                of references you created.
            </p>
            <p>
                Each <code>ref</code> will be an array of elements, that is why
                it is accessing the first item in that array to set the color to
                red.
            </p>
            ${Heading('Grouped references', 'h3')}
            <p>
                By default, all references are grouped because every reference
                returns an array of elements.
            </p>
            <p>
                What this means is that you can use the same
                <code>ref</code> value for multiple elements and this will
                include all of them.
            </p>
            ${CodeSnippet(
                'const todos = [\n' +
                    "  'Go to gym',\n" +
                    "  'Buy groceries',\n" +
                    "  'Pick up the kids'\n" +
                    '].map(todo => html`<div class="todo-item" ref="todo">${todo}</div>`)\n' +
                    '\n' +
                    'const todoList = html`${todos}`;\n' +
                    '\n' +
                    'todoList.render(document.body)\n' +
                    '\n' +
                    'todoList.refs.todo // contains 3 DIVs',
                'typescript'
            )}
            <p>
                The above example simple how this ability is a quick way to
                collect a list of DOM elements to do whatever you want.
            </p>
            ${Heading('Nested references', 'h3')}
            <p>
                You can nest multiple templates containing
                <code>ref</code> attribute, you may collect these references via
                the individual template itself or in the parent most template.
            </p>
            ${CodeSnippet(
                'const button = html`<button ref="btn">+</button>`;\n' +
                    '\n' +
                    'let count = 0;\n' +
                    '\n' +
                    'const countUp = html`<span>${count}</span> ${button}`;\n' +
                    '\n' +
                    'countUp.render(document.body);\n' +
                    '\n' +
                    'button.refs.btn // [HTMLButtonElement]\n' +
                    'countUp.refs.btn // [HTMLButtonElement]',
                'typescript'
            )}
            <p>
                Feel free to collect those reference from whichever template you
                like but this feature will make it convenient to consume your
                references in one place instead.
            </p>
            ${Heading('Dynamic references', 'h3')}
            <p>
                You can only collect references from templates that have been
                rendered at least once. That is why Markup references are
                created as needed with every change.
            </p>
            <p>
                If you have templates that are dynamically rendered, you can
                collect these references as the DOM changes.
            </p>
            ${CodeSnippet(
                'let loading = true;\n' +
                    '\n' +
                    'const sample = html`${\n' +
                    '  () => loading \n' +
                    '    ? html`<p ref="loading">loading</p>` \n' +
                    '    : html`<p ref="loaded">loaded</p>`}`\n' +
                    '\n' +
                    'sample.render(document.body);\n' +
                    '\n' +
                    '// refs object will not contain the "loaded" ref\n' +
                    '// because it was never rendered\n' +
                    'sample.refs // {loading: [P]}\n' +
                    '\n' +
                    'sample.onUpdate(() => {\n' +
                    '  sample.refs // {loading: [P], loaded: [P]}\n' +
                    '})\n' +
                    '\n' +
                    'setTimeout(() => {\n' +
                    '  loading = false;\n' +
                    '  sample.update(); // trigger update\n' +
                    '}, 2500)',
                'typescript'
            )}
        `,
    })
